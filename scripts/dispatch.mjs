#!/usr/bin/env node
// The session dispatch calculator: takes the inputs of SKILL.md step 1 as
// flags or a JSON file, reads the price table in force, and prints the filled
// Step A block (both sides, the break-even, the split) and the Step B cost per
// piece, ready to paste into the record. Standard library only, Node 20 or
// later. The arithmetic lives in dispatch-core.mjs, which the gate shares.
//
// Not here: the guardrails, the task type, the adversarial pass. Those are
// the record's; the calculator only multiplies.
//
// Exit codes: 0 computed; 1 an input or table error, named with its fix;
// 2 the table is past max_age_days, nothing computed (step 1.4.2); 3 a price
// is null, verdict incomplete (step 1.4.4). The date is the UTC date, the
// convention check.mjs uses; --today overrides it.
import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";
import {
  FORMULA_IN_FORCE, FORMULAS, BAND_PERCENT, CLASS_RANK, REQUIRED_SYMBOLS, OPTIONAL_SYMBOLS,
  validateInputs, findModel, resolveModel, modelForClass, missingPrices, growth, continueSide, freshSide,
  draftVerdict, breakEven, splitCost, pieceCost, roundTo, parseTokens,
} from "./dispatch-core.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SYMBOLS = [...REQUIRED_SYMBOLS, ...OPTIONAL_SYMBOLS];

const HELP = `Usage: node scripts/dispatch.mjs [--json <inputs.json>] [flags]

Inputs (flags override the JSON file; token counts take 1,000,000, 86k or 1.5m):
  --current <model id>     the model this session runs on (the harness states it)
  --target <id or class>   the model or class the work needs (haiku, sonnet, opus, fable)
  --W --K --C0 --T --F --O --B --R --H   the step 1 inputs, all required
  --M <misses>             cache misses over the stage (default 0, unmeasured)
  --L <turns>              rediscovery turns for unrecorded context (default 0)
  --Ta <turns> --Ra <tokens>   the split's acceptance turns and re-read
  --compacted yes|no       whether this session has been compacted
  --formula ${FORMULAS.join("|")}   default ${FORMULA_IN_FORCE}
  --table <file>           a specific price table (default: the newest in pricing/)
  --today YYYY-MM-DD       the date to judge the table's age against
The JSON file may also carry "pieces": [{ "name", "model", "effort", "T", "F", "O", "R", "B"?, "M"? }].`;

function die(code, lines) {
  for (const l of [].concat(lines)) console.error(`dispatch: ${l}`);
  process.exit(code);
}

function readInputs() {
  const options = { json: { type: "string" }, current: { type: "string" }, target: { type: "string" }, compacted: { type: "string" },
    formula: { type: "string" }, table: { type: "string" }, today: { type: "string" }, help: { type: "boolean" } };
  for (const s of SYMBOLS) options[s] = { type: "string" };
  let parsed;
  try { parsed = parseArgs({ options, strict: true }).values; } catch (e) { die(1, [e.message, "run with --help for the accepted flags"]); }
  if (parsed.help) { console.log(HELP); process.exit(0); }
  let inp = {};
  if (parsed.json) {
    // Windows editors and PowerShell 5.1 write a byte-order mark; JSON.parse rejects it.
    try { inp = JSON.parse(fs.readFileSync(parsed.json, "utf8").replace(/^﻿/, "")); } catch (e) { die(1, `cannot read ${parsed.json} as JSON (${e.message})`); }
  }
  for (const [k, v] of Object.entries(parsed)) if (k !== "json" && v !== undefined) inp[k] = v;
  for (const s of SYMBOLS) if (inp[s] !== undefined) inp[s] = parseTokens(inp[s]);
  if (typeof inp.compacted === "string") inp.compacted = { yes: true, no: false, true: true, false: false }[inp.compacted.toLowerCase()] ?? inp.compacted;
  inp.formula ??= FORMULA_IN_FORCE;
  const errors = validateInputs(inp);
  if (typeof inp.current !== "string") errors.push("--current must name the model id this session runs on");
  if (typeof inp.target !== "string") errors.push("--target must name a model id or a class (haiku, sonnet, opus, fable)");
  if (errors.length) die(1, [...errors, "run with --help for the accepted flags"]);
  return inp;
}

function loadTable(inp) {
  const dir = path.join(ROOT, "pricing");
  let file = inp.table;
  if (!file) {
    const names = fs.existsSync(dir) ? fs.readdirSync(dir).filter((n) => /^\d{4}-\d{2}-\d{2}\.json$/.test(n)).sort() : [];
    if (names.length === 0) die(1, `no pricing/YYYY-MM-DD.json in ${dir}; create one with node scripts/pricing-new.mjs`);
    file = path.join(dir, names[names.length - 1]);
  }
  let table;
  try { table = JSON.parse(fs.readFileSync(file, "utf8")); } catch (e) { die(1, `cannot read ${file} as JSON (${e.message})`); }
  const today = inp.today ?? new Date().toISOString().slice(0, 10);
  const age = Math.round((Date.parse(today) - Date.parse(table.table_date)) / 86400000);
  if (!Number.isFinite(age)) die(1, `cannot date the table: table_date ${table.table_date}, today ${today}; both must be YYYY-MM-DD`);
  if (age < 0) die(1, `${file}: table_date ${table.table_date} is after today ${today}; fix the table or --today`);
  if (age > table.max_age_days) {
    die(2, [
      `${shown(file)} is ${age} days old, past max_age_days ${table.max_age_days}. Nothing computed (SKILL.md step 1.4.2).`,
      "Refresh: node scripts/pricing-new.mjs, then fill each figure from its family's source page.",
      "Default meanwhile: continue, same model, same effort; record the staleness.",
    ]);
  }
  return { table, file, age, today };
}

// Repository-relative with forward slashes, so a pasted record reads the same on every platform.
const shown = (file) => path.relative(ROOT, path.resolve(file)).split(path.sep).join("/");
const tok = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
const usd = (n, places = 3) => roundTo(n, places).toFixed(places);
const line = (label, value, note = "") => `${label.padEnd(34)}= ${value}${note ? `   (${note})` : ""}`;
const rates = (m) => `cache_read ${m.cache_read.toFixed(2)}, cache_write ${m.cache_write.toFixed(2)}, output ${m.output.toFixed(2)}`
  + (m.long_context ? `; above ${tok(m.long_context.threshold_tokens)} tokens ${rates(m.long_context)}` : "");

function main() {
  const inp = readInputs();
  const { table, file, age, today } = loadTable(inp);
  const current = findModel(table, inp.current);
  if (!current) die(1, `--current ${inp.current} is not in ${path.relative(ROOT, file)}; models listed: ${listModels(table)}`);
  const target = resolveModel(table, inp.target, current.family);
  if (!target) die(1, `--target ${inp.target} has no model at or above that class in family ${current.family}; models listed: ${listModels(table)}`);

  const out = [];
  const isNew = inp.formula === FORMULA_IN_FORCE;
  out.push(`Session dispatch calculator, formula ${inp.formula}${isNew ? " (in force)" : " (as the records of that date applied it: growth F, no miss term, handoff at the target's output rate)"}`);
  out.push(`Table ${shown(file)}, age ${age} days of ${table.max_age_days}; today ${today}`);
  out.push(`Current ${current.id} (${current.class}); target ${target.id} (${target.class})`);
  out.push(`Inputs: ${SYMBOLS.filter((s) => inp[s] !== undefined).map((s) => `${s} ${tok(inp[s])}`).join("; ")}; compacted ${inp.compacted ? "yes" : "no"}`);
  out.push("");

  const missing = [...new Map([current, target].map((m) => [m.id, m])).values()]
    .map((m) => ({ m, miss: missingPrices(m) })).filter((x) => x.miss.length);
  const g = growth(inp);
  out.push(line(isNew ? "G       = F + O" : "G       = F", tok(g.G)));
  out.push(line("C_end   = C0 + T * G", tok(g.cEnd)));
  out.push(line("crosses = C_end > K", String(g.crosses), `K ${tok(inp.K)}`));
  out.push(line("C_cont  = C0 + T * G / 2", tok(g.cCont)));
  out.push(line("C_fresh = B + R + T * G / 2", tok(g.cFresh)));
  out.push("");

  const okCurrent = missingPrices(current).length === 0;
  const okTarget = missingPrices(target).length === 0;
  const cont = okCurrent ? continueSide(inp, current) : null;
  const fresh = okCurrent && okTarget ? freshSide(inp, current, target) : null;
  const tiers = [current, target].some((m) => m.long_context);

  if (cont) {
    out.push(`cost_continue on ${current.id}`);
    out.push(line("  T*C_cont*p_cr", usd(cont.reads), "cache reads"));
    out.push(line("  T*G*p_cw", usd(cont.writes), "new context written to cache"));
    out.push(line("  T*O*p_out", usd(cont.output), "output"));
    if (isNew) out.push(line("  M*C_cont*(p_cw - p_cr)", usd(cont.misses), `cache misses, M ${tok(g.M)}`));
    out.push(line("  penalty_compaction", usd(cont.penaltyCompaction), g.crosses ? "R*p_cw + H*p_out" : "no compaction ahead"));
    out.push(`  = ${usd(cont.total, 2)} USD`);
  } else out.push(`cost_continue on ${current.id}: unknown, price of ${current.id} unknown`);
  if (fresh) {
    out.push(`cost_fresh on ${target.id}`);
    out.push(line(`  H*p_out`, usd(fresh.handoff), `the handoff, at ${isNew ? current.id : target.id}`));
    out.push(line("  (B+R)*p_cw", usd(fresh.first), "the fresh session's first read"));
    out.push(line("  T*C_fresh*p_cr", usd(fresh.reads), "cache reads"));
    out.push(line("  T*G*p_cw", usd(fresh.writes), "new context written to cache"));
    out.push(line("  T*O*p_out", usd(fresh.output), "output"));
    if (isNew) out.push(line("  M*C_fresh*(p_cw - p_cr)", usd(fresh.misses), `cache misses, M ${tok(g.M)}`));
    out.push(line("  penalty_loss", usd(fresh.loss), `L ${tok(g.L)} rediscovery turns`));
    out.push(`  = ${usd(fresh.total, 2)} USD`);
  } else out.push(`cost_fresh on ${target.id}: unknown, price of ${missing.map((x) => x.m.id).join(" and ")} unknown`);
  if (tiers && cont && fresh) out.push(`Long-context tier: ${cont.tierTurns} of ${inp.T} turns (continue), ${fresh.tierTurns} of ${inp.T} (fresh).`);
  const rateLine = (m) => (missingPrices(m).length ? "unknown" : rates(m));
  out.push(`Prices per million: ${current.id} ${rateLine(current)}` + (target.id !== current.id ? `; ${target.id} ${rateLine(target)}` : ""));
  out.push("");

  if (missing.length) {
    out.push(`Draft verdict: incomplete: price of ${missing.map((x) => `${x.m.id} (${x.miss.join(", ")})`).join(" and ")} unknown.`);
    out.push("Step 1.4.4: (a) the operator gives the figure, or (b) authorises a live read of the row's source page into a new pricing/<today>.json. Never from memory.");
    console.log(out.join("\n"));
    process.exit(3);
  }

  const a = { ...g, cont, fresh };
  const be = breakEven(inp, current, target, a);
  if (be.turns === null) out.push(`T* = n/a: ${be.settles[0]}`);
  else {
    const t = Number.isFinite(be.turns) ? `${roundTo(be.turns, 1).toFixed(1)} turns` : "never (C0 is not above B + R)";
    out.push(`T* = (H*p_out + (B+R)*p_cw) / ((C0 - B - R) * p_cr') = ${usd(be.fixed)} / (${tok(be.gap)} * p_cr') = ${t}`);
    out.push(be.settles.length ? `Short path does not settle step A: ${be.settles.join("; ")}.` : `Short path: T ${inp.T} is under T*, so continue is cheaper; step A is settled.`);
  }
  const classUp = CLASS_RANK[target.class] > CLASS_RANK[current.class];
  const v = draftVerdict(cont.total, fresh.total, { compacted: inp.compacted, crosses: g.crosses, classUp });
  const settled = be.turns !== null && be.settles.length === 0;
  const why = settled ? `, T ${inp.T} under T* ${roundTo(be.turns, 1).toFixed(1)}, `
    : v.by === "class" ? `: the work needs ${target.class} and this session is ${current.class}; ` : ", ";
  out.push(`Draft verdict: ${v.side}, by ${settled ? "break-even" : v.by}${why}margin ${usd(v.margin, 2)} USD (${roundTo(v.percent, 1).toFixed(1)} percent of the smaller; band ${BAND_PERCENT}).`);

  if (CLASS_RANK[target.class] >= CLASS_RANK.opus) {
    out.push("");
    const runner = modelForClass(table, current.family, "sonnet");
    const acceptor = modelForClass(table, current.family, "opus");
    const sp = runner && acceptor && !missingPrices(runner).length && !missingPrices(acceptor).length ? splitCost(inp, current, runner, acceptor) : null;
    if (!sp) out.push("cost_split: not computed; give Ta and Ra, and the table needs complete sonnet and opus rows in this family.");
    else {
      out.push(`cost_split: brief by ${current.id}, run on ${sp.runner}, acceptance on ${sp.acceptor}`);
      out.push(line("  H*p_out", usd(sp.brief), "the brief"));
      out.push(line("  run, fresh session", usd(sp.run.total), `T ${inp.T}, R ${tok(inp.R)}`));
      out.push(line("  acceptance, fresh session", usd(sp.accept.total), `Ta ${inp.Ta}, Ra ${tok(inp.Ra)}`));
      out.push(`  = ${usd(sp.total, 2)} USD`);
      const d = fresh.total - sp.total;
      out.push(`Split against fresh: ${d >= 0 ? "cheaper" : "dearer"} by ${usd(Math.abs(d), 2)} USD (${roundTo((Math.abs(d) / Math.min(fresh.total, sp.total)) * 100, 1).toFixed(1)} percent). An option only when the brief makes the run matrix row 1 or 2 (step 2.1).`);
    }
  }

  out.push("");
  out.push("Step B: cost per piece (each a fresh session or sub-agent; step 3.3)");
  out.push("| Piece | Model | Effort | T | F | O | R | Cost USD |");
  out.push("|---|---|---|---|---|---|---|---|");
  const pieces = Array.isArray(inp.pieces) && inp.pieces.length ? inp.pieces : [{ name: "the stage", model: target.id, effort: "", T: inp.T, F: inp.F, O: inp.O, R: inp.R }];
  let sum = 0;
  for (const p of pieces) {
    for (const k of ["T", "F", "O", "R", "B", "M"]) if (p[k] !== undefined) p[k] = parseTokens(p[k]);
    const bad = ["T", "F", "O", "R"].filter((k) => !(Number.isFinite(p[k]) && p[k] >= 0));
    if (bad.length || !(Number.isInteger(p.T) && p.T >= 1)) die(1, `piece "${p.name}": ${bad.concat(Number.isInteger(p.T) ? [] : ["T"]).join(", ")} must be non-negative numbers (T whole, 1 or more)`);
    const m = resolveModel(table, String(p.model), current.family);
    if (!m) die(1, `piece "${p.name}": model ${p.model} not in the table; models listed: ${listModels(table)}`);
    if (missingPrices(m).length) die(3, `piece "${p.name}": price of ${m.id} unknown (${missingPrices(m).join(", ")}); step 1.4.4`);
    const c = pieceCost(inp, m, p).total;
    sum += c;
    out.push(`| ${p.name} | ${m.id} | ${p.effort ?? ""} | ${p.T} | ${tok(p.F)} | ${tok(p.O)} | ${tok(p.R)} | ${usd(c, 2)} |`);
  }
  out.push(`Pieces total: ${usd(sum, 2)} USD, plus the handoff ${usd(fresh.handoff, 3)} when the stage starts fresh.`);
  console.log(out.join("\n"));
}

function listModels(table) {
  return Object.values(table.families ?? {}).flatMap((f) => Object.keys(f.models ?? {})).join(", ") || "none";
}

main();
