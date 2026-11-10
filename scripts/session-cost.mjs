#!/usr/bin/env node
// The transcript pricer: reads a Claude Code session transcript (JSONL), counts the usage of
// every API call once per message id, and prices it with the table in force. A port of
// Tsunami's scripts/session_cost.py to the standard library, with the table read from
// pricing/<date>.json instead of a copy of the figures in source.
//
// It feeds the Measured column of the cost projection and docs/dispatch/calibration.md. Not
// here: choosing a table for you (pass --table for a session priced under an older one, such
// as a Fable 5.1 session), or any projection.
//
// Non-obvious: a streamed message appears on several lines with one id, so a call is counted
// once and each field takes its largest value. Cache writes the transcript marks as 1-hour
// (cache_creation.ephemeral_1h_input_tokens) are priced at the row's cache_write_1h where it
// has one, the rest at cache_write; a row with no cache_write_1h prices every write at
// cache_write, which understates the cost by the 1-hour tokens. The report and --json say
// which figure priced the 1-hour tokens per model. The pricer does not refuse an old table
// (a measurement of a past session needs the table of its day); it prints the age.
//
// Exit codes: 0 priced; 1 an input or table error, named with its fix; 3 a model in the
// transcript has no row in the table, so its cost is not in the total.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PER_MILLION = 1e6;
const KEYS = ["input", "cacheWrite", "cacheRead", "output"];

const HELP = `Usage: node scripts/session-cost.mjs <transcript.jsonl | session-id> [flags]

  --table <file>       a price table (default: the newest in pricing/)
  --projects <dir>     where session ids are looked up (default: ~/.claude/projects)
  --json               print JSON

A session's sub-agent transcripts, <session-id>/subagents/*.jsonl beside its file, are priced
and listed apart; the total adds them. Exit 0 priced; 1 input error; 3 a model has no price row.`;

/** The table row for a model id: the exact id, else the longest id that prefixes it (dated ids). */
export function findPrice(table, id) {
  let best = null;
  for (const f of Object.values(table.families ?? {})) {
    for (const [mid, row] of Object.entries(f.models ?? {})) {
      if (id === mid) return { id: mid, ...row };
      if (typeof id === "string" && id.startsWith(`${mid}-`) && (!best || mid.length > best.id.length)) best = { id: mid, ...row };
    }
  }
  return best;
}

/**
 * The USD for one call and the figure that priced its 1-hour write tokens ("cache_write_1h"
 * or "cache_write"). 1-hour tokens are capped at the call's writes.
 */
function costOf(row, t) {
  const lc = row.long_context;
  const p = lc && t.input + t.cacheRead + t.cacheWrite > lc.threshold_tokens ? lc : row;
  const hasOneHour = typeof p.cache_write_1h === "number";
  const oneHour = hasOneHour ? Math.min(t.oneHour, t.cacheWrite) : 0;
  const writes = (t.cacheWrite - oneHour) * p.cache_write + oneHour * (hasOneHour ? p.cache_write_1h : 0);
  return { cost: (t.input * p.input + writes + t.cacheRead * p.cache_read + t.output * p.output) / PER_MILLION, figure: hasOneHour ? "cache_write_1h" : "cache_write" };
}

/** Reads the unique API calls of one transcript, in file order. */
function readCalls(file) {
  const byId = new Map();
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    let e;
    try { e = JSON.parse(line); } catch { continue; }
    const m = e?.type === "assistant" ? e.message : null;
    if (!m?.usage) continue;
    const id = m.id ?? e.requestId ?? e.uuid;
    const u = m.usage;
    const next = { model: m.model ?? "unknown", input: u.input_tokens ?? 0, cacheWrite: u.cache_creation_input_tokens ?? 0,
      cacheRead: u.cache_read_input_tokens ?? 0, output: u.output_tokens ?? 0, oneHour: u.cache_creation?.ephemeral_1h_input_tokens ?? 0 };
    const prev = byId.get(id);
    if (prev) for (const k of [...KEYS, "oneHour"]) prev[k] = Math.max(prev[k], next[k]);
    else byId.set(id, next);
  }
  return [...byId.values()];
}

/**
 * Prices one transcript against a table. Returns calls, tokens by model and in total, cost, the
 * context at the last call and the largest, the cache write and output per call, and the model
 * ids that have no row (their calls are counted, their cost is not).
 */
export function priceTranscript(file, table) {
  const calls = readCalls(file);
  const models = {};
  const totals = { input: 0, cacheWrite: 0, cacheRead: 0, output: 0 };
  let oneHourWrite = 0, maxContext = 0;
  for (const c of calls) {
    const row = findPrice(table, c.model);
    // Dated ids of one model share a row, so they share a line.
    const m = (models[row ? row.id : c.model] ??= { calls: 0, tokens: { input: 0, cacheWrite: 0, cacheRead: 0, output: 0 }, oneHourTokens: 0, oneHourPricedAt: [], cost: 0 });
    m.calls += 1;
    for (const k of KEYS) { m.tokens[k] += c[k]; totals[k] += c[k]; }
    oneHourWrite += c.oneHour;
    maxContext = Math.max(maxContext, c.input + c.cacheRead + c.cacheWrite);
    m.oneHourTokens += c.oneHour;
    if (row) {
      const r = costOf(row, c);
      m.cost += r.cost;
      if (c.oneHour > 0 && !m.oneHourPricedAt.includes(r.figure)) m.oneHourPricedAt.push(r.figure);
    } else m.unpriced = true;
  }
  const last = calls[calls.length - 1];
  const n = calls.length;
  return {
    file, calls: n, models, totals, oneHourWrite,
    unpriced: Object.keys(models).filter((k) => models[k].unpriced),
    cost: Object.values(models).reduce((s, m) => s + m.cost, 0),
    lastContext: last ? last.input + last.cacheRead + last.cacheWrite : 0,
    maxContext,
    cacheWritePerCall: n ? totals.cacheWrite / n : 0,
    // The first call writes the whole base, which is B, not growth; growth is what follows.
    cacheWritePerCallAfterFirst: n > 1 ? (totals.cacheWrite - calls[0].cacheWrite) / (n - 1) : 0,
    outputPerCall: n ? totals.output / n : 0,
  };
}

function die(code, lines) {
  for (const l of [].concat(lines)) console.error(`session-cost: ${l}`);
  process.exit(code);
}

function loadTable(file) {
  if (!file) {
    const dir = path.join(ROOT, "pricing");
    const names = fs.existsSync(dir) ? fs.readdirSync(dir).filter((n) => /^\d{4}-\d{2}-\d{2}\.json$/.test(n)).sort() : [];
    if (!names.length) die(1, `no pricing/YYYY-MM-DD.json in ${dir}; pass --table <file>`);
    file = path.join(dir, names[names.length - 1]);
  }
  try { return { table: JSON.parse(fs.readFileSync(file, "utf8").replace(/^﻿/, "")), file }; } catch (e) { return die(1, `cannot read ${file} as JSON (${e.message})`); }
}

/** A path as given, or a session id found as <id>.jsonl under a folder of <projects>. */
function locate(arg, projects) {
  if (fs.existsSync(arg) && fs.statSync(arg).isFile()) return path.resolve(arg);
  const id = arg.replace(/\.jsonl$/, "");
  if (fs.existsSync(projects)) {
    for (const d of fs.readdirSync(projects).sort()) {
      const f = path.join(projects, d, `${id}.jsonl`);
      if (fs.existsSync(f)) return f;
    }
  }
  return die(1, `no transcript for ${arg}: not a file, and no ${id}.jsonl under ${projects}; pass the path or --projects <dir>`);
}

const tok = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
const usd = (n) => n.toFixed(3);

function describe(label, r) {
  const out = [`${label}: ${r.calls} calls, context at the last call ${tok(r.lastContext)}, largest ${tok(r.maxContext)}`];
  out.push(`  cache read ${tok(r.totals.cacheRead)}, cache write ${tok(r.totals.cacheWrite)}, output ${tok(r.totals.output)}, fresh input ${tok(r.totals.input)}`);
  out.push(`  per call: cache write ${tok(r.cacheWritePerCall)} (${tok(r.cacheWritePerCallAfterFirst)} after the first call), output ${tok(r.outputPerCall)}`);
  for (const [id, m] of Object.entries(r.models)) {
    out.push(`  ${id}: ${m.calls} calls, ${m.unpriced ? "no price row" : `${usd(m.cost)} USD`}`);
    if (m.oneHourTokens > 0) out.push(`    ${tok(m.oneHourTokens)} 1-hour write tokens: ${m.unpriced ? "not priced" : `priced at ${m.oneHourPricedAt.join(" and ")}`}`);
  }
  out.push(`  cost ${usd(r.cost)} USD`);
  return out;
}

function main() {
  let v, positionals;
  try { ({ values: v, positionals } = parseArgs({ allowPositionals: true, strict: true, options: { table: { type: "string" }, projects: { type: "string" }, json: { type: "boolean" }, help: { type: "boolean" } } })); } catch (e) { die(1, [e.message, "run with --help for the accepted flags"]); }
  if (v.help) { console.log(HELP); return; }
  if (positionals.length !== 1) die(1, ["give one transcript path or session id", "run with --help for the accepted flags"]);
  const { table, file: tableFile } = loadTable(v.table);
  const file = locate(positionals[0], v.projects ?? path.join(os.homedir(), ".claude", "projects"));
  const main_ = priceTranscript(file, table);
  const subDir = path.join(path.dirname(file), path.basename(file, ".jsonl"), "subagents");
  const subs = fs.existsSync(subDir) ? fs.readdirSync(subDir).filter((n) => n.endsWith(".jsonl")).sort() : [];
  const subagents = subs.map((n) => ({ name: path.basename(n, ".jsonl"), ...priceTranscript(path.join(subDir, n), table) }));
  const total = main_.cost + subagents.reduce((s, x) => s + x.cost, 0);
  const unpriced = [...new Set([main_, ...subagents].flatMap((r) => r.unpriced))];
  const oneHour = main_.oneHourWrite + subagents.reduce((s, x) => s + x.oneHourWrite, 0);
  const age = Math.round((Date.now() - Date.parse(table.table_date)) / 86400000);
  if (v.json) {
    console.log(JSON.stringify({ table: path.basename(tableFile), table_date: table.table_date, main: main_, subagents, total, unpriced, oneHourWrite: oneHour }, null, 2));
  } else {
    console.log(`Table ${path.basename(tableFile)} (${table.table_date}, ${age} days old today)`);
    console.log(describe(`Session ${path.basename(file)}`, main_).join("\n"));
    for (const s of subagents) console.log(describe(`sub-agent ${s.name}`, s).join("\n"));
    console.log(`total ${usd(total)} USD${subagents.length ? ` (session ${usd(main_.cost)} + ${subagents.length} sub-agents)` : ""}`);
    const lower = [main_, ...subagents].flatMap((r) => Object.entries(r.models)).filter(([, m]) => m.oneHourPricedAt.includes("cache_write")).map(([id]) => id);
    if (lower.length) console.log(`note: the row for ${[...new Set(lower)].join(", ")} has no cache_write_1h, so its 1-hour write tokens were priced at cache_write; that cost is a lower bound`);
    if (unpriced.length) console.error(`session-cost: no price row for ${unpriced.join(", ")}; those calls are counted but their cost is not in the total. Pass --table with a table that lists them.`);
  }
  if (unpriced.length) process.exit(3);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
