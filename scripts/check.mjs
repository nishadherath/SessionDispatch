#!/usr/bin/env node
// The gate for this repository: validates the price table in force, the
// templates, the worked examples (headings, cost rows, and their Step A
// figures recomputed from their own Inputs table by dispatch-core.mjs), the
// skill's front matter, the adapters, the session-start hook, the operator
// preferences and live status files, the evaluation's scenarios (each run
// through the calculator, its printed figures compared with the scenario's
// stated expectation), and the prose rules. Standard library only, Node 20
// or later. Exit codes: 0 green; 2 the table is stale and nothing else is
// wrong (an expected state after max_age_days, see pricing/README.md); 1 any
// other finding. Every finding names the file and the fix.
import { execFile } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  FORMULAS, FORMULA_GROWTH, FORMULA_COORD, FORMULA_TTL, TTLS, REQUIRED_SYMBOLS, OPTIONAL_SYMBOLS, formulaHas, validateInputs, findModel, resolveModel,
  missingPrices, effectiveTtl, stepA, splitCost, breakEven, pieceCost, planCoord, coordCost, modelForClass, CLASS_RANK,
} from "./dispatch-core.mjs";
import { localToday, newestTableFile, validateTable } from "./price-table.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
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
// Inputs table rows the recompute reads. Labels end in the step 1 symbol;
// "Coordinator" names a model id or a class, and is this session when absent.
const INPUT_ROWS = [
  "Formula", "Current model", "Target model", "Window W", "Compaction point K", "Current context C0",
  "Compacted already", "Expected turns T", "Fresh input per turn F", "Output per turn O", "Fresh baseline B",
  "Re-read set R", "Handoff size H", "Cache misses M", "Rediscovery turns L", "Coordinating turns To", "Coordinator",
];
const ADAPTER_HEADINGS = ["## Where it goes", "## How it loads", "## Pointer block", "## Numbers"];

// Prose rules from the persona's section 14.1. The list is spelt out here
// so the check names the word it found; this file is not itself linted.
const EM_DASH = "—";
const BANNED = [
  "delve", "nuanced", "tapestry", "robust", "multifaceted", "landscape",
  "it is worth noting", "it is important to note", "let's dive in", "in today's world",
];
const BANNED_RE = BANNED.map((w) => new RegExp(`(^|[^a-z])${w.replace(/'/g, "['’]")}([^a-z]|$)`, "i"));
// The prose faults in one line of text, each phrased as the fix.
const proseFaults = (line) => [
  ...(line.includes(EM_DASH) ? ["em-dash; restructure with a comma, colon or full stop"] : []),
  ...BANNED_RE.flatMap((re, k) => (re.test(line) ? [`banned word "${BANNED[k]}"`] : [])),
];

// The evaluation's vocabulary (eval/rubric.md): what a scenario may expect.
const EVAL_OUTCOMES = new Set(["continue", "fresh", "split", "not-run", "incomplete", "stop"]);
const EVAL_GUARDRAILS = new Set([1, 2, 3, 5, 6, 7, 8]); // 4 is scored on every run through the model ids
const EFFORTS = new Set(["low", "medium", "high", "xhigh", "max"]);
// cost_coord and cost_coord_sonnet are null before formula 2026-11-10, so the
// scenarios pinned to an older formula need not state them.
const EVAL_FIGURES = ["exit", "draft", "percent", "cost_continue", "cost_fresh", "cost_split", "t_star", "crosses", "cost_coord", "cost_coord_sonnet"];

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
const todayIso = () => argToday ?? localToday();

// The price table: every rule lives in scripts/price-table.mjs, shared with the installed
// validator. This function reads the newest file and turns the result into findings. The
// stale families make exactly one finding, so the exit code logic below counts one stale table.
function checkPricing() {
  const dir = path.join(ROOT, "pricing");
  const file = newestTableFile(dir);
  if (file === null) return fail(dir, "no pricing/YYYY-MM-DD.json file; create one with node scripts/pricing-new.mjs");
  let table;
  try { table = JSON.parse(read(file)); } catch (e) { return fail(file, `not valid JSON (${e.message})`); }
  const today = todayIso();
  const { errors, stale: staleList } = validateTable(table, { fileName: path.basename(file), today });
  for (const e of errors) fail(file, e);
  if (staleList.length) {
    stale = true;
    const which = staleList.map((s) => `${s.family} fetched ${s.fetched}, ${s.ageDays} days old`).join("; ");
    findings.push(`${path.relative(ROOT, file)}: ${which}; past max_age_days ${table.max_age_days}; run node scripts/pricing-new.mjs and refresh those figures from each family's source page`);
  }
}

function checkHeadings(file, headings, label) {
  const text = read(file);
  for (const h of headings) if (!hasLine(text, h)) fail(file, `missing ${label} heading "${h}"`);
  return text;
}

// The calibration ledger and the Measured column (Stage S6): the header row is the contract
// scripts/session-cost.mjs and the closing session fill; a drifted header fails here.
const LEDGER_HEADER = "| Stage | Piece | Class | Effort | T projected | Calls measured | Cache write per call | Output per call | Projected USD | Measured USD | Source |";
function checkLedger() {
  const ledger = path.join(ROOT, "docs", "dispatch", "calibration.md");
  if (!fs.existsSync(ledger)) return fail(ledger, "missing; it is the calibration ledger (Stage S6)");
  if (!fs.readFileSync(ledger, "utf8").split("\n").map((l) => l.trimEnd()).includes(LEDGER_HEADER)) fail(ledger, `the ledger header row is not exactly: ${LEDGER_HEADER}`);
  for (const f of [path.join(ROOT, "templates", "handoff.md"), path.join(ROOT, "docs", "handoffs", "README.md")]) {
    if (!fs.readFileSync(f, "utf8").includes("| Calls measured | Measured USD |")) fail(f, "the cost projection lacks the Measured columns (Calls measured, Measured USD)");
  }
}

function checkTemplates() {
  checkLedger();
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

// A term line states a figure the way a total does, except that an integer ("0") must be
// exact: half a unit of zero decimal places would accept anything under 0.5.
function termMatches(stated, computed) {
  return stated.includes(".") ? matchesStated(stated, computed) : Math.abs(Number(stated.replace(/,/g, "")) - computed) < 0.0005;
}

// The term lines of one side inside Step A's fenced block (F1-3): from the line that opens
// "cost_continue" or "cost_fresh" to the "= n USD" total, each stated as "= n" and compared,
// in order, with the terms dispatch-core.mjs gives that side. A line that is a product
// ("60*190,000*0.25e-6  = 2.850") is also multiplied out.
function checkTermLines(file, stepAText, formula, name, expected) {
  const lines = stepAText.split(/\r?\n/);
  const open = lines.findIndex((l) => new RegExp(`^\\s*${name}\\b`).test(l));
  if (open < 0) return;
  const close = lines.findIndex((l, k) => k >= open && /=\s*\d[\d,]*\.\d+\s*USD/.test(l));
  if (close < 0) return;
  const num = "[\\d,]+(?:\\.\\d+)?(?:e-?\\d+)?";
  const productRe = new RegExp(`(${num}(?:\\*${num})+)\\s*=`);
  const terms = [];
  for (const l of lines.slice(open, close)) {
    const stated = [...l.matchAll(/=\s*(\d[\d,]*(?:\.\d+)?)(?=\s+\(|\s*$)/g)].pop()?.[1];
    if (stated === undefined) continue;
    terms.push(stated);
    const product = l.match(productRe)?.[1];
    if (product) {
      const value = product.split("*").reduce((acc, f) => acc * Number(f.replace(/,/g, "")), 1);
      if (!termMatches(stated, value)) fail(file, `Step A: ${name} term "${product}" multiplies to ${value.toPrecision(6)}, the line states ${stated}`);
    }
  }
  if (terms.length !== expected.length) return fail(file, `Step A: ${name} states ${terms.length} term line(s), the formula gives ${expected.length} (${expected.map((e) => e[0]).join(", ")})`);
  expected.forEach(([label, want], k) => {
    if (!termMatches(terms[k], want)) fail(file, `Step A: ${name} term ${k + 1} (${label}) states ${terms[k]}, the inputs give ${want.toFixed(4)} under formula ${formula}`);
  });
}

// Step B's cost column (F1-3): a cell that opens "n USD (T t, F f, O o, R r..." is the piece
// priced as a fresh session on the model in its row, the way the calculator's Step B table
// prices it (pieceCost), and must match at the same tolerance.
// F7-6: a cell that opens "To t x n pieces: x USD" is the plan's cost_coord at the
// coordinator, and a "Pieces p USD, cost_coord c USD, plan s USD" line in the section's
// prose must add up: p the sum of the piece cells, c the coordination cell, s = p + c.
function checkStepBColumn(file, text, inp, table, current, coordinator) {
  const stepB = section(text, "### Step B: model, effort and concurrency");
  const lines = stepB.split(/\r?\n/);
  const h = lines.findIndex((l) => /^\| Piece \|/.test(l));
  if (h < 0) return;
  const cols = lines[h].split("|").slice(1, -1).map((c) => c.trim());
  const modelAt = cols.indexOf("Model id"), costAt = cols.indexOf("Cost");
  if (modelAt < 0 || costAt < 0) return;
  let piecesSum = 0, coordStated = null;
  for (let k = h + 2; k < lines.length && lines[k].startsWith("|"); k += 1) {
    const cells = lines[k].split("|").slice(1, -1).map((c) => c.trim().replace(/`/g, ""));
    const co = cells[costAt]?.match(/^To (\d+) x (\d+) pieces?: (\d[\d,]*\.\d+) USD/);
    if (co && formulaHas(inp.formula, FORMULA_COORD)) {
      const [, to, n, stated] = co;
      const c = planCoord(inp, current, coordinator, Number(n));
      if (Number(to) !== (inp.To ?? 0)) fail(file, `Step B: the coordination row states To ${to}, the Inputs table ${inp.To ?? 0}`);
      if (!matchesStated(stated, c.total)) fail(file, `Step B: the coordination row is ${stated} USD, To ${inp.To ?? 0} x ${n} pieces gives ${c.total.toFixed(4)} on ${(coordinator ?? current).id}`);
      coordStated = stated;
      continue;
    }
    const m = cells[costAt]?.match(/^(\d[\d,]*\.\d+) USD \(([^)]*)\)/);
    if (!m) continue;
    piecesSum += Number(m[1].replace(/,/g, ""));
    const piece = {};
    // B is a sub-agent's own baseline (step 3.3); without it the piece starts from the session's B.
    for (const [, sym, n] of m[2].matchAll(/\b([TFORB]) (\d[\d,]*)/g)) piece[sym] = Number(n.replace(/,/g, ""));
    const model = findModel(table, cells[modelAt]);
    if (!model) { fail(file, `Step B: piece "${cells[0]}" names model ${JSON.stringify(cells[modelAt])}, which is not in the example's table`); continue; }
    if (!["T", "F", "O", "R"].every((s) => piece[s] !== undefined)) { fail(file, `Step B: piece "${cells[0]}" states a cost without all of T, F, O and R in its parentheses`); continue; }
    const want = pieceCost({ ...inp, F: piece.F, O: piece.O }, model, { T: piece.T, F: piece.F, O: piece.O, R: piece.R, B: piece.B }).total;
    if (!matchesStated(m[1], want)) fail(file, `Step B: piece "${cells[0]}" costs ${m[1]} USD, the inputs give ${want.toFixed(4)} on ${model.id}`);
  }
  const plan = stepB.match(/Pieces (\d[\d,]*\.\d+) USD, cost_coord (\d[\d,]*\.\d+) USD, plan (\d[\d,]*\.\d+) USD/);
  if (!plan) return;
  const [p, c, s] = plan.slice(1).map((x) => Number(x.replace(/,/g, "")));
  // Each is a rounded sum of rounded cells, so allow one cent per term.
  const cents = 0.01 * (lines.length + 1) + 1e-9;
  if (Math.abs(p - piecesSum) > Math.min(cents, 0.05)) fail(file, `Step B: "Pieces ${plan[1]} USD" but the piece cells sum to ${piecesSum.toFixed(2)}`);
  if (coordStated !== null && c !== Number(coordStated.replace(/,/g, ""))) fail(file, `Step B: "cost_coord ${plan[2]} USD" but the coordination row states ${coordStated}`);
  if (Math.abs(s - (p + c)) > 0.015) fail(file, `Step B: "plan ${plan[3]} USD" but pieces ${plan[1]} plus cost_coord ${plan[2]} is ${(p + c).toFixed(2)}`);
}

// F7-6: "Draft verdict: <side>, by <rule>, ... margin m USD (q percent of the smaller)":
// the margin and the percentage are the recompute's, at their stated precision.
function checkDraftMargin(file, text, verdict) {
  const d = text.match(/^Draft verdict: (?:continue|fresh), by [\w-]+[^\n]*?(?:\n[^\n#]*?){0,2}margin (\d[\d,]*\.\d+) USD \((\d[\d,]*(?:\.\d+)?)\s+percent/m);
  if (!d) return;
  if (!matchesStated(d[1], verdict.margin)) fail(file, `Draft verdict: margin ${d[1]} USD, the inputs give ${verdict.margin.toFixed(4)}`);
  if (!matchesStated(d[2], verdict.percent)) fail(file, `Draft verdict: ${d[2]} percent of the smaller, the inputs give ${verdict.percent.toFixed(2)}`);
}

// The calculator's cost_coord block inside Step A (formula 2026-11-10): each "<plan>, n
// pieces, t turns = x USD" line is To x n turns at the coordinator, and the "on <sonnet
// id>, a fresh session from B + H" line states the same plans at the sonnet-class model.
// Fresh is 1 piece and the split 2 (step 2); Step B states its own count.
const COORD_LINE_RE = /^\s*(fresh|split|Step B), (\d+) pieces?, ([\d,]+) turns\s*=\s*(\d[\d,]*\.\d+) USD/;
function checkCoordLines(file, stepAText, inp, current, coordinator, table) {
  const counts = {};
  for (const l of stepAText.split(/\r?\n/)) {
    const m = l.match(COORD_LINE_RE);
    if (!m) continue;
    const [, plan, n, turns, stated] = m;
    const pieces = Number(n);
    counts[plan] = pieces;
    if ((plan === "fresh" && pieces !== 1) || (plan === "split" && pieces !== 2)) { fail(file, `Step A: cost_coord prices ${plan} as ${pieces} pieces; fresh is 1 piece and the split 2 (SKILL.md step 2)`); continue; }
    const c = planCoord(inp, current, coordinator, pieces);
    if (Number(turns.replace(/,/g, "")) !== c.turns) fail(file, `Step A: cost_coord ${plan} states ${turns} turns, To ${inp.To ?? 0} x ${pieces} gives ${c.turns}`);
    if (!matchesStated(stated, c.total)) fail(file, `Step A: cost_coord ${plan} is ${stated} USD, the inputs give ${c.total.toFixed(4)} on ${(coordinator ?? current).id}`);
  }
  const alt = stepAText.match(/^\s*on (\S+), a fresh session from B \+ H = [\d,]+: (.*) USD$/m);
  if (!alt) return;
  const sonnet = findModel(table, alt[1]);
  if (!sonnet) return fail(file, `Step A: cost_coord compares with ${alt[1]}, which is not in the example's table`);
  for (const [, plan, stated] of alt[2].matchAll(/(fresh|split|Step B) (\d[\d,]*\.\d+)/g)) {
    if (counts[plan] === undefined) { fail(file, `Step A: cost_coord compares ${plan} on ${sonnet.id} with no "${plan}, n pieces" line above it`); continue; }
    const want = coordCost(inp, sonnet, counts[plan], false).total;
    if (!matchesStated(stated, want)) fail(file, `Step A: cost_coord ${plan} on ${sonnet.id} is ${stated} USD, the inputs give ${want.toFixed(4)}`);
  }
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
  const ttlCell = cell("Cache lifetime ttl");
  if (ttlCell) inp.ttl = TTLS.find((t) => new RegExp(`^${t}\\b`).test(ttlCell)) ?? ttlCell;
  const errors = validateInputs(inp);
  if (formulaHas(inp.formula, FORMULA_GROWTH) && inp.M === undefined) errors.push(`M must be stated under formula ${inp.formula} (0 when unmeasured, and say so)`);
  if (formulaHas(inp.formula, FORMULA_COORD) && inp.To === undefined) errors.push(`"Coordinating turns To" must be stated under formula ${inp.formula} (0 when nobody coordinates, and say so)`);
  if (formulaHas(inp.formula, FORMULA_TTL) && inp.ttl === undefined) errors.push(`"Cache lifetime ttl" must be stated under formula ${inp.formula} (${TTLS.join(" or ")}, with its source)`);
  const current = findModel(table, cell("Current model").split(/\s/)[0]);
  const target = findModel(table, cell("Target model").split(/\s/)[0]);
  if (!current) errors.push(`"Current model" must open with a model id from ${tableRef[1]}, found "${cell("Current model")}"`);
  if (!target) errors.push(`"Target model" must open with a model id from ${tableRef[1]}, found "${cell("Target model")}"`);
  // No row, or a row opening "this" ("this session"): this session coordinates, and the core takes
  // no coordinator. A model id or class: that model, which from formula 2026-11-11 is another session.
  const coordRef = cell("Coordinator").split(/\s/)[0];
  const named = Boolean(coordRef) && coordRef.toLowerCase() !== "this";
  const coordinator = !current || !named ? undefined : resolveModel(table, coordRef, current.family);
  if (current && named && !coordinator) errors.push(`"Coordinator" must open with "this session", a model id or a class from ${tableRef[1]}, found "${cell("Coordinator")}"`);
  if (errors.length) return [...new Set(errors)].forEach((e) => fail(file, `Inputs table: ${e}`));
  const ttl = effectiveTtl(inp);
  for (const m of [current, target, coordinator].filter(Boolean)) if (missingPrices(m, ttl).length) return fail(file, `${m.id} has null prices in ${tableRef[1]} at ttl ${ttl} (${missingPrices(m, ttl).join(", ")}); an example must be computable`);

  const compute = (formula) => {
    const x = { ...inp, formula };
    const a = stepA(x, current, target, coordinator);
    const runner = modelForClass(table, current.family, "sonnet");
    const acceptor = modelForClass(table, current.family, "opus");
    const split = CLASS_RANK[target.class] >= CLASS_RANK.opus && runner && acceptor ? splitCost(x, current, runner, acceptor, coordinator) : null;
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
  const isNew = formulaHas(inp.formula, FORMULA_GROWTH), hasCoord = formulaHas(inp.formula, FORMULA_COORD), c = own.a.cont, f = own.a.fresh;
  checkTermLines(file, stepAText, inp.formula, "cost_continue", [["cache reads", c.reads], ["new context written", c.writes], ["output", c.output], ...(isNew ? [["cache misses", c.misses]] : []), ["penalty_compaction", c.penaltyCompaction]]);
  checkTermLines(file, stepAText, inp.formula, "cost_fresh", [["handoff", f.handoff], ["first read", f.first], ["cache reads", f.reads], ["new context written", f.writes], ["output", f.output], ...(isNew ? [["cache misses", f.misses]] : []), ["penalty_loss", f.loss], ...(hasCoord ? [["cost_coord", f.coord.total]] : [])]);
  if (hasCoord) checkCoordLines(file, stepAText, { ...inp }, current, coordinator, table);
  checkStepBColumn(file, text, inp, table, current, coordinator);
  const side = text.match(/^Draft verdict: (continue|fresh)/m)?.[1];
  if (side && side !== own.a.verdict.side) fail(file, `Draft verdict says ${side}, the arithmetic says ${own.a.verdict.side} (by ${own.a.verdict.by}); a guardrail changes the final verdict, not the draft`);
  checkDraftMargin(file, text, own.a.verdict);

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
  for (const file of walkMd(ROOT)) {
    const lines = read(file).split(/\r?\n/);
    lines.forEach((line, i) => {
      if (line.startsWith(">")) return;
      for (const f of proseFaults(line)) fail(file, `line ${i + 1}: ${f}`);
    });
  }
}

// The figures the calculator prints for one input, in the shape a scenario's
// expected.calculator states them: the exit code, the draft's side and
// reason, its percent, the three totals and T* as printed, and `crosses`.
// Asynchronous so the scenarios' calculator runs overlap: one process each,
// run in series, costs seconds per gate run on Windows.
async function calculatorFigures(scenarioFile, flags = {}) {
  const args = [path.join(ROOT, "scripts", "dispatch.mjs"), "--json", scenarioFile];
  for (const [k, v] of Object.entries(flags)) args.push(`--${k}`, String(v));
  const r = await new Promise((resolve) => execFile(process.execPath, args, { cwd: ROOT, encoding: "utf8" },
    (err, stdout) => resolve({ status: err ? (typeof err.code === "number" ? err.code : null) : 0, stdout })));
  const out = r.stdout ?? "";
  const total = (head) => {
    const at = out.search(new RegExp(`^${head}`, "m"));
    return at < 0 ? null : out.slice(at).match(/^\s*=\s*(\d[\d,]*\.\d+) USD/m)?.[1] ?? null;
  };
  const d = out.match(/^Draft verdict: (continue|fresh|incomplete)(?:, by (class|cost|quality|break-even))?/m);
  const crosses = out.match(/^crosses = C_end > K\s+= (true|false)/m)?.[1];
  // The cost_coord block (formula 2026-11-10): each plan's figure at the coordinator and on the sonnet model.
  const key = (plan) => (plan === "Step B" ? "step_b" : plan);
  const coordLines = out.split(/\r?\n/).map((l) => l.match(COORD_LINE_RE)).filter(Boolean);
  const coord = coordLines.length ? Object.fromEntries(coordLines.map((m) => [key(m[1]), m[4]])) : null;
  const alt = out.match(/^\s*on \S+, a fresh session from B \+ H = [\d,]+: (.*) USD$/m)?.[1];
  const coordSonnet = alt ? Object.fromEntries([...alt.matchAll(/(fresh|split|Step B) (\d[\d,]*\.\d+)/g)].map((m) => [key(m[1]), m[2]])) : null;
  return {
    exit: r.status,
    draft: d ? { side: d[1], by: d[2] ?? null } : null,
    percent: out.match(/^Draft verdict:.*\(([\d.]+) percent of the smaller/m)?.[1] ?? null,
    cost_continue: total("cost_continue on"), cost_fresh: total("cost_fresh on"), cost_split: total("cost_split: brief"),
    t_star: out.match(/^T\* =.*\s(\d[\d,]*(?:\.\d+)?) turns$/m)?.[1] ?? (/^T\* =.*never/m.test(out) ? "never" : null),
    crosses: crosses === undefined ? null : crosses === "true",
    cost_coord: coord, cost_coord_sonnet: coordSonnet,
  };
}

// The evaluation's scenarios (eval/scenarios/*.json, eval/rubric.md): each
// is calculator input plus a brief and its expectations. The calculator runs
// on each as its own file, and every figure it prints must equal the one the
// scenario states, so a formula change that moves a figure fails here until
// the expectation is regenerated with a dated reason. The hand-set parts
// (final verdict, guardrails) are checked for shape, not for truth.
async function checkEval() {
  const dir = path.join(ROOT, "eval", "scenarios");
  const names = fs.existsSync(dir) ? fs.readdirSync(dir).filter((n) => n.endsWith(".json")).sort() : [];
  if (names.length === 0) return fail(dir, "no scenario; the evaluation ships with its scenario set (eval/README.md)");
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const tables = new Map(); // a table is read once however many scenarios name it
  const pending = []; // calculator comparisons, awaited together at the end
  for (const n of names) {
    const file = path.join(dir, n);
    let s;
    try { s = JSON.parse(read(file)); } catch (e) { fail(file, `not valid JSON (${e.message})`); continue; }
    if (s.id !== n.slice(0, -5)) fail(file, `id ${JSON.stringify(s.id)} must equal the filename stem ${n.slice(0, -5)}`);
    if (!Array.isArray(s.brief) || s.brief.length === 0 || !s.brief.every((l) => typeof l === "string")) fail(file, "brief must be a non-empty array of lines");
    if (!String(s.brief?.[0]).includes("{{TODAY}}")) fail(file, "brief must state the day as {{TODAY}}, which the runner fills");
    [...(s.brief ?? []), ...(s.notes ?? []), s.title ?? ""].forEach((l) => proseFaults(String(l)).forEach((f) => fail(file, `brief, title or notes: ${f}`)));
    if (!EFFORTS.has(s.current_effort)) fail(file, `current_effort must be one of ${[...EFFORTS].join(", ")}, found ${JSON.stringify(s.current_effort)}`);
    const e = s.expected ?? {};
    const fin = e.final ?? {};
    if (!EVAL_OUTCOMES.has(fin.outcome)) fail(file, `expected.final.outcome must be one of ${[...EVAL_OUTCOMES].join(", ")}, found ${JSON.stringify(fin.outcome)}`);
    if (!(fin.effort === null || EFFORTS.has(fin.effort))) fail(file, `expected.final.effort must be null or one of ${[...EFFORTS].join(", ")}`);
    if (typeof fin.approval_step !== "boolean") fail(file, "expected.final.approval_step must be true or false");
    for (const k of ["skill_runs", "draft_required"]) if (typeof e[k] !== "boolean") fail(file, `expected.${k} must be true or false`);
    const g = e.guardrails;
    if (!Array.isArray(g) || !g.every((x) => EVAL_GUARDRAILS.has(x)) || !same(g, [...new Set(g)].sort((a, b) => a - b))) fail(file, `expected.guardrails must be a sorted list from ${[...EVAL_GUARDRAILS].join(", ")}, found ${JSON.stringify(g)}`);
    let table = tables.get(s.table) ?? null;
    if (!table) {
      try { table = JSON.parse(read(path.join(ROOT, ...String(s.table).split("/")))); tables.set(s.table, table); } catch (err) { fail(file, `table ${s.table} cannot be read (${err.message}); name a table under pricing/ or eval/tables/`); }
    }
    if (table && fin.model !== null && !findModel(table, fin.model)) fail(file, `expected.final.model ${fin.model} is not in ${s.table}`);
    const rel = path.relative(ROOT, file).split(path.sep).join("/");
    const runs = [{ where: "expected.calculator", want: e.calculator, flags: {} }, ...(e.alternatives ?? []).map((a, i) => ({ where: `expected.alternatives[${i}].calculator`, want: a.calculator, flags: a.flags ?? {} }))];
    for (const { where, want, flags } of runs) {
      pending.push(calculatorFigures(rel, flags).then((got) => {
        for (const k of EVAL_FIGURES) {
          if (!same(want?.[k] ?? null, got[k])) fail(file, `${where}.${k} is ${JSON.stringify(want?.[k] ?? null)}, the calculator gives ${JSON.stringify(got[k])}; fix the inputs, or regenerate the expectation and say why in notes`);
        }
      }));
    }
  }
  await Promise.all(pending);
}

for (const step of [checkPricing, checkTemplates, checkExamples, checkSkill, checkAdapters, checkHook, checkPreferences, checkEval, checkProse]) {
  try { await step(); } catch (e) { fail(step.name, `threw ${e.message}`); }
}

const hard = findings.length - (stale ? 1 : 0);
for (const f of findings) console.log(`check: ${f}`);
console.log(`check: ${filesChecked} files read, ${findings.length} finding(s)${stale ? " (one is the stale table)" : ""}`);
process.exit(hard > 0 ? 1 : stale ? 2 : 0);
