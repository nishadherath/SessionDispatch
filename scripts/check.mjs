#!/usr/bin/env node
// The gate for this repository: validates the price table in force, the
// templates, the worked examples, the skill's front matter, the adapters,
// the session-start hook and the prose rules. Standard library only, Node
// 20 or later. Exit codes: 0 green; 2 the table is stale and nothing else
// is wrong (an expected state after max_age_days, see pricing/README.md);
// 1 any other finding. Every finding names the file and the fix.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CLASSES = new Set(["haiku", "sonnet", "opus", "fable"]);
const PRICE_KEYS = ["input", "output", "cache_read", "cache_write"];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Required headings, matched as whole lines.
const HANDOFF_HEADINGS = [
  "## Goal", "## Decisions already made", "## Files and links that matter",
  "## Verified facts", "## Work completed", "## Unresolved questions",
  "## Exact next action", "## Cost projection", "## Time projection",
  "## Session dispatch decision",
];
const RECORD_HEADINGS = [
  "## Session dispatch decision", "### Inputs", "### Step A: continue or hand off",
  "### Step B: model, effort and concurrency", "### Guardrails checked",
  "### Adversarial pass", "### Final verdict", "### Cost of deciding",
];
const COST_ROWS = ["Context at start", "Context at end", "Input tokens read", "Output tokens", "Wall clock", "Priced"];
const ADAPTER_HEADINGS = ["## Where it goes", "## How it loads", "## Pointer block", "## Numbers"];

// Prose rules from the persona's section 14.1. The list is spelt out here
// so the check names the word it found; this file is not itself linted.
const EM_DASH = "—";
const BANNED = [
  "delve", "nuanced", "tapestry", "robust", "multifaceted", "landscape",
  "it is worth noting", "it is important to note", "let's dive in", "in today's world",
];

const findings = [];
let stale = false;
let filesChecked = 0;
const fail = (file, msg) => findings.push(`${path.relative(ROOT, file) || file}: ${msg}`);
const read = (file) => { filesChecked += 1; return fs.readFileSync(file, "utf8"); };
const hasLine = (text, line) => text.split(/\r?\n/).some((l) => l.trim() === line);
const todayIso = () => new Date().toISOString().slice(0, 10);
const daysBetween = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 86400000);

function checkPricing() {
  const dir = path.join(ROOT, "pricing");
  const names = fs.readdirSync(dir).filter((n) => /^\d{4}-\d{2}-\d{2}\.json$/.test(n)).sort();
  if (names.length === 0) return fail(dir, "no pricing/YYYY-MM-DD.json file; create one with node scripts/pricing-new.mjs");
  const name = names[names.length - 1];
  const file = path.join(dir, name);
  let table;
  try { table = JSON.parse(read(file)); } catch (e) { return fail(file, `not valid JSON (${e.message})`); }
  const fileDate = name.slice(0, 10);
  if (table.table_date !== fileDate) fail(file, `table_date ${table.table_date} must equal the filename date ${fileDate}`);
  if (!DATE_RE.test(String(table.table_date)) || Number.isNaN(Date.parse(table.table_date))) fail(file, `table_date ${table.table_date} is not a valid YYYY-MM-DD date`);
  const today = todayIso();
  if (table.table_date > today) fail(file, `table_date ${table.table_date} is in the future (today is ${today})`);
  if (!Number.isInteger(table.max_age_days) || table.max_age_days < 1) fail(file, `max_age_days must be a positive integer, found ${table.max_age_days}`);
  else {
    const age = daysBetween(table.table_date, today);
    if (age > table.max_age_days) {
      stale = true;
      findings.push(`${path.relative(ROOT, file)}: table is ${age} days old, past max_age_days ${table.max_age_days}; run node scripts/pricing-new.mjs and refresh the figures from each family's source page`);
    }
  }
  if (table.currency !== "USD") fail(file, `currency must be USD (the skill's arithmetic assumes it), found ${table.currency}`);
  if (typeof table.families !== "object" || table.families === null) return fail(file, "families must be an object");
  for (const [fam, f] of Object.entries(table.families)) {
    if (typeof f.source !== "string" || !/^https?:\/\//.test(f.source)) fail(file, `families.${fam}.source must be the vendor pricing page URL`);
    if (f.fetched !== null && !DATE_RE.test(String(f.fetched))) fail(file, `families.${fam}.fetched must be null or YYYY-MM-DD, found ${f.fetched}`);
    if (typeof f.models !== "object" || f.models === null) { fail(file, `families.${fam}.models must be an object`); continue; }
    for (const [id, m] of Object.entries(f.models)) {
      if (!(m.class === null || CLASSES.has(m.class))) fail(file, `families.${fam}.models.${id}.class must be haiku, sonnet, opus, fable or null, found ${m.class}`);
      const checkPrices = (obj, where) => {
        for (const k of PRICE_KEYS) {
          const v = obj[k];
          if (!(v === null || (typeof v === "number" && Number.isFinite(v) && v >= 0))) fail(file, `${where}.${k} must be a non-negative number or null, found ${JSON.stringify(v)}`);
        }
      };
      checkPrices(m, `families.${fam}.models.${id}`);
      if (m.long_context !== undefined) {
        if (!Number.isInteger(m.long_context.threshold_tokens) || m.long_context.threshold_tokens <= 0) fail(file, `families.${fam}.models.${id}.long_context.threshold_tokens must be a positive integer`);
        checkPrices(m.long_context, `families.${fam}.models.${id}.long_context`);
      }
      const nulls = PRICE_KEYS.filter((k) => m[k] === null).length;
      if (nulls > 0 && f.fetched !== null && nulls < PRICE_KEYS.length) fail(file, `families.${fam}.models.${id} has ${nulls} null price(s) although the family was fetched on ${f.fetched}; fill them or set fetched to null`);
    }
  }
}

function checkHeadings(file, headings, label) {
  const text = read(file);
  for (const h of headings) if (!hasLine(text, h)) fail(file, `missing ${label} heading "${h}"`);
  return text;
}

function checkTemplates() {
  checkHeadings(path.join(ROOT, "templates", "handoff.md"), HANDOFF_HEADINGS, "handoff");
  const record = checkHeadings(path.join(ROOT, "templates", "decision-record.md"), RECORD_HEADINGS, "decision-record");
  for (const row of COST_ROWS) if (!record.includes(`| ${row} |`)) fail(path.join(ROOT, "templates", "decision-record.md"), `missing cost-of-deciding row "${row}"`);
}

function checkExamples() {
  const dir = path.join(ROOT, "examples");
  const names = fs.readdirSync(dir).filter((n) => n.endsWith(".md"));
  if (names.length === 0) fail(dir, "no worked example; the skill ships with at least one");
  for (const n of names) {
    const file = path.join(dir, n);
    const text = checkHeadings(file, RECORD_HEADINGS, "decision-record");
    for (const row of COST_ROWS) if (!text.includes(`| ${row} |`)) fail(file, `missing cost-of-deciding row "${row}"`);
    if (!/^Draft verdict: (continue|fresh)/m.test(text)) fail(file, 'missing a line starting "Draft verdict: continue" or "Draft verdict: fresh"');
    if (!/^Verdict holds: (yes|no)/m.test(text)) fail(file, 'missing a line starting "Verdict holds: yes" or "Verdict holds: no"');
  }
}

function checkSkill() {
  const file = path.join(ROOT, "SKILL.md");
  const text = read(file);
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return fail(file, "missing YAML front matter (--- name / description ---)");
  if (!/^name:\s*session-dispatch\s*$/m.test(m[1])) fail(file, "front matter name must be session-dispatch");
  if (!/^description:\s*\S/m.test(m[1])) fail(file, "front matter needs a description");
  for (const section of ["## 0.", "## 1.", "## 2.", "## 3.", "## 4.", "## 5.", "## 6.", "## 7."]) {
    if (!text.split(/\r?\n/).some((l) => l.startsWith(section))) fail(file, `missing section starting "${section}"`);
  }
  if (!text.includes("max_age_days")) fail(file, "step 1.4 must name max_age_days");
}

function checkAdapters() {
  const dir = path.join(ROOT, "adapters");
  const names = fs.readdirSync(dir).filter((n) => n.endsWith(".md"));
  if (names.length < 2) fail(dir, "expected at least a Claude Code adapter and a generic adapter");
  for (const n of names) checkHeadings(path.join(dir, n), ADAPTER_HEADINGS, "adapter");
}

function checkHook() {
  const hook = path.join(ROOT, ".claude", "helpers", "operator-protocol.cjs");
  if (!fs.existsSync(hook)) fail(hook, "missing session-start hook (copy from fork_graft)");
  const settings = path.join(ROOT, ".claude", "settings.json");
  try {
    const s = JSON.parse(read(settings));
    const cmds = JSON.stringify(s.hooks?.SessionStart ?? []);
    if (!cmds.includes("operator-protocol.cjs")) fail(settings, "SessionStart must run .claude/helpers/operator-protocol.cjs");
  } catch (e) { fail(settings, `unreadable or invalid JSON (${e.message})`); }
  const hdir = path.join(ROOT, "docs", "handoffs");
  const handoffs = fs.existsSync(hdir) ? fs.readdirSync(hdir).filter((n) => /^\d{4}-\d{2}-\d{2}-.+\.md$/.test(n)).sort() : [];
  if (handoffs.length === 0) return fail(hdir, "no handoff on file; the bootstrap session writes the first");
  const newest = path.join(hdir, handoffs[handoffs.length - 1]);
  const text = read(newest);
  for (const key of ["stage", "model", "effort", "status"]) if (!new RegExp(`^${key}:\\s*\\S`, "m").test(text)) fail(newest, `front matter missing ${key}`);
  if (!hasLine(text, "## Session dispatch decision") && !/Session dispatch not run/.test(text)) fail(newest, 'missing "## Session dispatch decision" section or a "Session dispatch not run" line');
}

// Prose rules over every Markdown file except the generated persona
// editions (which quote the banned list) and verbatim quote lines.
function walkMd(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name === ".git") continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walkMd(p, out);
    else if (e.name.endsWith(".md") && !/^ENGINEERING_PERSONA/.test(e.name)) out.push(p);
  }
  return out;
}

function checkProse() {
  const banned = BANNED.map((w) => new RegExp(`(^|[^a-z])${w.replace(/'/g, "['’]")}([^a-z]|$)`, "i"));
  for (const file of walkMd(ROOT)) {
    const lines = read(file).split(/\r?\n/);
    lines.forEach((line, i) => {
      if (line.startsWith(">")) return;
      if (line.includes(EM_DASH)) fail(file, `line ${i + 1}: em-dash; restructure with a comma, colon or full stop`);
      banned.forEach((re, k) => { if (re.test(line)) fail(file, `line ${i + 1}: banned word "${BANNED[k]}"`); });
    });
  }
}

for (const step of [checkPricing, checkTemplates, checkExamples, checkSkill, checkAdapters, checkHook, checkProse]) {
  try { step(); } catch (e) { fail(step.name, `threw ${e.message}`); }
}

const hard = findings.length - (stale ? 1 : 0);
for (const f of findings) console.log(`check: ${f}`);
console.log(`check: ${filesChecked} files read, ${findings.length} finding(s)${stale ? " (one is the stale table)" : ""}`);
process.exit(hard > 0 ? 1 : stale ? 2 : 0);
