#!/usr/bin/env node
// The gate for this repository: validates the price table in force, the
// templates, the worked examples (headings, cost rows, and their Step A
// figures recomputed from their own Inputs table by dispatch-core.mjs), the
// skill's front matter, the adapters, the session-start hook, the operator
// preferences and live status files, and the prose rules. Standard library
// only, Node 20 or later. Exit codes: 0 green; 2 the table is stale and
// nothing else is wrong (an expected state after max_age_days, see
// pricing/README.md); 1 any other finding. Every finding names the file and
// the fix.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { FORMULAS, FORMULA_IN_FORCE, REQUIRED_SYMBOLS, OPTIONAL_SYMBOLS, validateInputs, findModel, missingPrices, stepA, splitCost, breakEven, modelForClass, CLASS_RANK } from "./dispatch-core.mjs";

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
// Inputs table rows the recompute reads. Labels end in the step 1 symbol.
const INPUT_ROWS = [
  "Formula", "Current model", "Target model", "Window W", "Compaction point K", "Current context C0",
  "Compacted already", "Expected turns T", "Fresh input per turn F", "Output per turn O", "Fresh baseline B",
  "Re-read set R", "Handoff size H", "Cache misses M", "Rediscovery turns L",
];
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
// The day a table's age is judged against: --today YYYY-MM-DD (tests and
// dry runs), else the local calendar day, the convention pricing-new.mjs
// names tables by and dispatch.mjs shares.
const argToday = process.argv.includes("--today") ? process.argv[process.argv.indexOf("--today") + 1] : null;
const two = (n) => String(n).padStart(2, "0");
const todayIso = () => argToday ?? (() => { const d = new Date(); return `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())}`; })();
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
  const tfile = path.join(ROOT, "templates", "decision-record.md");
  const record = checkHeadings(tfile, RECORD_HEADINGS, "decision-record");
  for (const row of COST_ROWS) if (!record.includes(`| ${row} |`)) fail(tfile, `missing cost-of-deciding row "${row}"`);
  for (const row of INPUT_ROWS) if (!record.includes(`| ${row} |`)) fail(tfile, `missing inputs row "${row}"`);
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
    recomputeExample(file, text);
  }
}

// The text between a heading line and the next heading of the same or a
// higher level; "" when the heading is absent.
function section(text, heading) {
  const lines = text.split(/\r?\n/);
  const i = lines.findIndex((l) => l.trim() === heading);
  if (i < 0) return "";
  const level = heading.match(/^#+/)[0].length;
  const end = lines.findIndex((l, k) => k > i && /^#+ /.test(l) && l.match(/^#+/)[0].length <= level);
  return lines.slice(i + 1, end < 0 ? undefined : end).join("\n");
}

// A stated figure matches when it is within half a unit of its own last
// decimal place: "9.74" accepts 9.735 to 9.745, "72.2" accepts 72.15 to 72.25.
function matchesStated(stated, computed) {
  const places = (stated.split(".")[1] ?? "").length;
  return Math.abs(Number(stated.replace(/,/g, "")) - computed) <= 0.5 * 10 ** -places + 1e-9;
}

// Reads the example's Inputs table, recomputes Step A with dispatch-core.mjs
// against the table the example names, and compares every figure it states:
// the cost_continue, cost_fresh and cost_split totals, T*, the draft
// verdict's side, and any "| Figure | Formula <date> |" comparison table.
function recomputeExample(file, text) {
  const tableRef = text.match(/Price table: `(pricing\/\d{4}-\d{2}-\d{2}\.json)`/);
  if (!tableRef) return fail(file, 'header must name its table as "Price table: `pricing/YYYY-MM-DD.json`" so its figures can be recomputed');
  let table;
  try { table = JSON.parse(read(path.join(ROOT, ...tableRef[1].split("/")))); } catch (e) { return fail(file, `cannot read ${tableRef[1]} (${e.message}); keep the table an example names`); }

  const rows = new Map();
  for (const l of section(text, "### Inputs").split(/\r?\n/)) {
    const cells = l.split("|").slice(1, -1).map((c) => c.trim());
    if (cells.length >= 2 && !/^-+$/.test(cells[0])) rows.set(cells[0], cells[1]);
  }
  const inp = {};
  for (const [label, value] of rows) {
    const sym = label.split(/\s+/).pop();
    const num = value.match(/\d[\d,]*(?:\.\d+)?/);
    if ([...REQUIRED_SYMBOLS, ...OPTIONAL_SYMBOLS].includes(sym) && num) inp[sym] = Number(num[0].replace(/,/g, ""));
  }
  const cell = (label) => rows.get(label)?.replace(/`/g, "") ?? "";
  inp.formula = cell("Formula").match(/\d{4}-\d{2}-\d{2}/)?.[0];
  inp.compacted = { yes: true, no: false }[cell("Compacted already").split(/\W/)[0].toLowerCase()];
  const errors = validateInputs(inp);
  if (inp.formula === FORMULA_IN_FORCE && inp.M === undefined) errors.push("M must be stated under the formula in force (0 when unmeasured, and say so)");
  const current = findModel(table, cell("Current model").split(/\s/)[0]);
  const target = findModel(table, cell("Target model").split(/\s/)[0]);
  if (!current) errors.push(`"Current model" must open with a model id from ${tableRef[1]}, found "${cell("Current model")}"`);
  if (!target) errors.push(`"Target model" must open with a model id from ${tableRef[1]}, found "${cell("Target model")}"`);
  if (errors.length) return errors.forEach((e) => fail(file, `Inputs table: ${e}`));
  for (const m of [current, target]) if (missingPrices(m).length) return fail(file, `${m.id} has null prices in ${tableRef[1]}; an example must be computable`);

  const compute = (formula) => {
    const x = { ...inp, formula };
    const a = stepA(x, current, target);
    const runner = modelForClass(table, current.family, "sonnet");
    const acceptor = modelForClass(table, current.family, "opus");
    const split = CLASS_RANK[target.class] >= CLASS_RANK.opus && runner && acceptor ? splitCost(x, current, runner, acceptor) : null;
    return { cost_continue: a.cont.total, cost_fresh: a.fresh.total, cost_split: split?.total, a, be: breakEven(x, current, target, a) };
  };
  const own = compute(inp.formula);
  const stepAText = section(text, "### Step A: continue or hand off");
  for (const name of ["cost_continue", "cost_fresh", "cost_split"]) {
    const at = stepAText.search(new RegExp(`^\\s*${name}\\b`, "m"));
    if (at < 0) { if (name !== "cost_split") fail(file, `Step A states no ${name} total`); continue; }
    const stated = stepAText.slice(at).match(/=\s*(\d[\d,]*\.\d+)\s*USD/)?.[1];
    if (!stated) fail(file, `Step A: no "= <amount> USD" total after ${name}`);
    else if (own[name] === undefined) fail(file, `Step A states ${name} ${stated} USD but the inputs do not give one (Ta, Ra, and a target of opus or fable)`);
    else if (!matchesStated(stated, own[name])) fail(file, `Step A: ${name} is ${stated} USD, the inputs give ${own[name].toFixed(4)} under formula ${inp.formula}; fix the figure or the inputs`);
  }
  const tStar = stepAText.match(/^T\* =.*\s(\d[\d,]*(?:\.\d+)?) turns$/m)?.[1];
  if (tStar && !(own.be.turns !== null && matchesStated(tStar, own.be.turns))) fail(file, `Step A: T* is ${tStar} turns, the inputs give ${own.be.turns === null ? "none (the model changes)" : own.be.turns.toFixed(2)}`);
  const side = text.match(/^Draft verdict: (continue|fresh)/m)?.[1];
  if (side && side !== own.a.verdict.side) fail(file, `Draft verdict says ${side}, the arithmetic says ${own.a.verdict.side} (by ${own.a.verdict.by}); a guardrail changes the final verdict, not the draft`);

  const lines = text.split(/\r?\n/);
  const h = lines.findIndex((l) => /^\| Figure \|/.test(l));
  if (h >= 0) {
    const cols = lines[h].split("|").slice(1, -1).map((c) => c.trim());
    for (let k = h + 2; k < lines.length && lines[k].startsWith("|"); k += 1) {
      const cells = lines[k].split("|").slice(1, -1).map((c) => c.trim().replace(/`/g, ""));
      cols.forEach((col, j) => {
        const formula = col.match(/^Formula (\d{4}-\d{2}-\d{2})$/)?.[1];
        const stated = cells[j]?.match(/^(\d[\d,]*\.\d+)/)?.[1];
        if (!formula || !stated) return;
        if (!FORMULAS.includes(formula)) return fail(file, `comparison table: unknown formula ${formula}; known ${FORMULAS.join(", ")}`);
        const want = compute(formula)[cells[0]];
        if (want === undefined) fail(file, `comparison table: row "${cells[0]}" is not a figure the recompute knows (cost_continue, cost_fresh, cost_split)`);
        else if (!matchesStated(stated, want)) fail(file, `comparison table: ${cells[0]} under formula ${formula} is ${stated}, the inputs give ${want.toFixed(4)}`);
      });
    }
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

// The two operator questions (protocol section 1.3) and the live status
// document (AGENTS.md rule 11): present and well formed, so the hook can
// read them and a session knows what is still unanswered.
function checkPreferences() {
  const file = path.join(ROOT, "docs", "operator-preferences.json");
  let prefs;
  try { prefs = JSON.parse(read(file)); } catch (e) { return fail(file, `missing or not valid JSON (${e.message})`); }
  for (const key of ["ste100", "autonomy"]) {
    const q = prefs.questions?.[key];
    if (!q) { fail(file, `questions.${key} missing`); continue; }
    if (typeof q.question !== "string" || !q.question) fail(file, `questions.${key}.question must be the text put to the operator`);
    if (!(q.answer === null || typeof q.answer === "boolean")) fail(file, `questions.${key}.answer must be null, true or false`);
    for (const d of ["asked", "recorded"]) if (!(q[d] === null || DATE_RE.test(String(q[d])))) fail(file, `questions.${key}.${d} must be null or YYYY-MM-DD`);
    if (typeof q.answer === "boolean" && q.recorded === null) fail(file, `questions.${key} is answered but recorded has no date`);
  }
  for (const [key, a] of Object.entries(prefs.approvals || {})) {
    if (typeof a.scope !== "string" || !a.scope) fail(file, `approvals.${key}.scope must say what the approval covers`);
    if (typeof a.answer !== "boolean") fail(file, `approvals.${key}.answer must be true or false`);
    if (!DATE_RE.test(String(a.recorded))) fail(file, `approvals.${key}.recorded must be YYYY-MM-DD`);
  }
  const status = path.join(ROOT, "docs", "status.md");
  if (!fs.existsSync(status)) return fail(status, "missing live status document (AGENTS.md rule 11)");
  const text = read(status);
  for (const h of ["## Done", "## In progress", "## To do", "## Decisions waiting"]) if (!hasLine(text, h)) fail(status, `missing heading "${h}"`);
  if (!/^Last updated: \d{4}-\d{2}-\d{2}/m.test(text)) fail(status, 'missing a "Last updated: YYYY-MM-DD" line');
}

// Prose rules over every Markdown file the repository ships, except the
// generated persona editions (which quote the banned list) and verbatim
// quote lines. Directories the root .gitignore names (`dir/` or `/dir/`)
// hold local tool output, such as an index cache, and are not linted; nor
// is a nested checkout (a directory with its own .git, such as a worktree a
// parallel session works in), whose own gate run covers it.
function ignoredDirs() {
  const file = path.join(ROOT, ".gitignore");
  if (!fs.existsSync(file)) return new Set();
  return new Set(fs.readFileSync(file, "utf8").split(/\r?\n/).map((l) => l.trim().match(/^\/?([\w.-]+)\/$/)?.[1]).filter(Boolean));
}

function walkMd(dir, out = [], skip = new Set([".git", "node_modules", ...ignoredDirs()])) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skip.has(e.name) && e.isDirectory()) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (!fs.existsSync(path.join(p, ".git"))) walkMd(p, out, skip); }
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

for (const step of [checkPricing, checkTemplates, checkExamples, checkSkill, checkAdapters, checkHook, checkPreferences, checkProse]) {
  try { step(); } catch (e) { fail(step.name, `threw ${e.message}`); }
}

const hard = findings.length - (stale ? 1 : 0);
for (const f of findings) console.log(`check: ${f}`);
console.log(`check: ${filesChecked} files read, ${findings.length} finding(s)${stale ? " (one is the stale table)" : ""}`);
process.exit(hard > 0 ? 1 : stale ? 2 : 0);
