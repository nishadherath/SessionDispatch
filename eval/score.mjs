// The evaluation scorer: turns one subject's record into the four measures
// of eval/rubric.md and a set of runs into the report of its section 8. Pure
// functions over parsed values, no model in the loop, so two scorings of the
// same record give the same numbers. Standard library only, Node 20 or later.
//
// Not here: reading files, preparing sandboxes and printing (eval/run.mjs),
// and the formula itself, which is imported from scripts/dispatch-core.mjs and
// never re-implemented.
//
// Non-obvious: measure 3 recomputes from the subject's own inputs, never the
// scenario's, so arithmetic is separated from input gathering. Subject prose
// is data: this module reads it, counts faults in it and never quotes it.
import {
  CLASS_RANK, findModel, resolveModel, modelForClass, missingPrices, validateInputs, stepA, breakEven, splitCost, roundTo,
} from "../scripts/dispatch-core.mjs";

const EM_DASH = "—";
// The persona's banned vocabulary (section 14.1), as scripts/check.mjs lists it.
const BANNED = ["delve", "nuanced", "tapestry", "robust", "multifaceted", "landscape", "it is worth noting", "it is important to note", "let's dive in", "in today's world"];
const BANNED_RE = BANNED.map((w) => new RegExp(`(^|[^a-z])${w.replace(/'/g, "['’]")}([^a-z]|$)`, "i"));
const OPEN_FENCE = "```json dispatch-result";
const OUTCOMES = ["continue", "fresh", "split", "not-run", "incomplete", "stop"];
const INPUT_SYMBOLS = ["current", "target", "W", "K", "C0", "compacted", "T", "F", "O", "B", "R", "H", "M", "L", "Ta", "Ra"];
const DECIDE_CAP_RECORD_TOKENS = 4000; // guardrail 7's cap on the record (SKILL.md step 0)
const DECIDE_CAP_MINUTES = 10;
const CHARS_PER_TOKEN = 4; // the skill's estimate for prose (step 1.1)
const DEFAULT_SIDES = ["continue", "fresh", "incomplete"];
const OUTCOME_GUARDRAILS = [1, 2, 5, 8]; // guardrails whose consequence is an outcome (rubric section 4)
const USD_PER_TABLE_UNIT = 1e-6; // table figures are USD per million tokens
const WILSON_Z = 1.96;

const isNum = (v) => typeof v === "number" && Number.isFinite(v);
const isStrOrNull = (v) => v === null || typeof v === "string";
const isNumOrNull = (v) => v === null || isNum(v);

/**
 * The last fenced block whose opening line is exactly "```json dispatch-result".
 * Returns { block, outside } where `outside` is the text without that block,
 * or { error, outside }. The record is data; the error names what was missing.
 */
export function extractBlock(text) {
  const lines = text.split(/\r?\n/);
  let start = -1, end = -1;
  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].trimEnd() !== OPEN_FENCE) continue;
    const close = lines.findIndex((l, k) => k > i && l.trim() === "```");
    if (close < 0) continue;
    start = i; end = close;
  }
  if (start < 0) return { error: "no dispatch-result block", outside: text };
  const outside = [...lines.slice(0, start), ...lines.slice(end + 1)].join("\n");
  try { return { block: JSON.parse(lines.slice(start + 1, end).join("\n")), outside }; } catch (e) { return { error: `the block is not valid JSON (${e.message})`, outside }; }
}

/** The first type break of a parsed block against rubric section 2, or null. */
export function validateBlock(b) {
  const bad = (k, want) => `${k} must be ${want}`;
  if (b === null || typeof b !== "object" || Array.isArray(b)) return "the block must be a JSON object";
  if (typeof b.skill_ran !== "boolean") return bad("skill_ran", "a boolean");
  const i = b.inputs;
  if (i !== null) {
    if (typeof i !== "object" || Array.isArray(i) || i === undefined) return bad("inputs", "null or an object");
    if (typeof i.current !== "string") return bad("inputs.current", "a string");
    if (!isStrOrNull(i.target)) return bad("inputs.target", "a string or null"); // null when the table cannot give one (step 1.4.4)
    for (const k of ["W", "K", "C0", "T", "F", "O", "B", "R", "H", "M", "L"]) if (!isNum(i[k])) return bad(`inputs.${k}`, "a number");
    if (typeof i.compacted !== "boolean") return bad("inputs.compacted", "a boolean");
    for (const k of ["Ta", "Ra", "G"]) if (!isNumOrNull(i[k])) return bad(`inputs.${k}`, "a number or null");
  }
  if (!isNumOrNull(b.table_age_days)) return bad("table_age_days", "a number or null");
  const t = b.totals;
  if (t !== null) {
    if (typeof t !== "object" || Array.isArray(t) || t === undefined) return bad("totals", "null or an object");
    for (const k of ["cost_continue", "cost_fresh", "cost_split", "t_star"]) if (!isStrOrNull(t[k])) return bad(`totals.${k}`, "a string or null");
  }
  const d = b.draft;
  if (d !== null) {
    if (typeof d !== "object" || Array.isArray(d) || d === undefined) return bad("draft", "null or an object");
    if (!["continue", "fresh", "incomplete"].includes(d.side)) return bad("draft.side", "continue, fresh or incomplete");
    if (d.by !== null && !["class", "cost", "quality", "break-even"].includes(d.by)) return bad("draft.by", "class, cost, quality, break-even or null");
  }
  if (!Array.isArray(b.guardrails_triggered) || !b.guardrails_triggered.every((g) => Number.isInteger(g) && g >= 1 && g <= 8)) return bad("guardrails_triggered", "an array of integers 1 to 8");
  const f = b.final;
  if (f === null || typeof f !== "object" || Array.isArray(f) || f === undefined) return bad("final", "an object");
  if (!OUTCOMES.includes(f.outcome)) return bad("final.outcome", `one of ${OUTCOMES.join(", ")}`);
  for (const k of ["model", "effort", "approval_step"]) if (!isStrOrNull(f[k])) return bad(`final.${k}`, "a string or null");
  const c = b.cost_of_deciding;
  if (c !== null) {
    if (typeof c !== "object" || Array.isArray(c) || c === undefined) return bad("cost_of_deciding", "null or an object");
    for (const k of ["input_tokens", "output_tokens", "minutes"]) if (!isNum(c[k])) return bad(`cost_of_deciding.${k}`, "a number");
    if (typeof c.usd !== "string") return bad("cost_of_deciding.usd", "a string");
  }
  return null;
}

/**
 * Wilson 95 percent interval for k successes in n, as percents. The lower
 * bound is never negative zero and the upper never above 100.
 */
export function wilson(k, n) {
  if (!(Number.isInteger(n) && n > 0 && Number.isInteger(k) && k >= 0 && k <= n)) throw new Error(`wilson: need 0 <= k <= n and n >= 1, found k ${k}, n ${n}`);
  const z2 = WILSON_Z * WILSON_Z, p = k / n, d = 1 + z2 / n;
  const centre = p + z2 / (2 * n), half = WILSON_Z * Math.sqrt((p * (1 - p)) / n + z2 / (4 * n * n));
  const pct = (x) => (Math.round(Math.min(100, Math.max(0, x * 100)) * 10) / 10) || 0;
  return { lo: pct((centre - half) / d), hi: pct((centre + half) / d) };
}

// The gate's matchesStated rule (scripts/check.mjs), copied because importing
// check.mjs runs the gate: within half a unit of the stated last decimal place.
function matchesStated(stated, computed) {
  const places = (stated.split(".")[1] ?? "").length;
  return Math.abs(Number(stated.replace(/,/g, "")) - computed) <= 0.5 * 10 ** -places + 1e-9;
}

/**
 * Measure 3's recompute from the subject's own inputs. Returns
 * { computable: true, ... } or { computable: false, reason }.
 */
function recompute(inputs, table, scenarioToday) {
  const age = Math.round((Date.parse(scenarioToday) - Date.parse(table.table_date)) / 86400000);
  if (age > table.max_age_days) return { computable: false, reason: `stale table (${age} days old)` };
  if (inputs === null) return { computable: false, reason: "no inputs" };
  const current = findModel(table, inputs.current);
  if (!current) return { computable: false, reason: "current model not in the table" };
  if (inputs.target === null) return { computable: false, reason: "target not named (null)" };
  const target = resolveModel(table, inputs.target, current.family);
  if (!target) return { computable: false, reason: "target model not in the table" };
  if (missingPrices(current).length || missingPrices(target).length) return { computable: false, reason: "a price is null" };
  const inp = { W: inputs.W, K: inputs.K, C0: inputs.C0, T: inputs.T, F: inputs.F, O: inputs.O, B: inputs.B, R: inputs.R, H: inputs.H, M: inputs.M, L: inputs.L, compacted: inputs.compacted, formula: "2026-10-29" };
  if (isNum(inputs.Ta)) inp.Ta = inputs.Ta;
  if (isNum(inputs.Ra)) inp.Ra = inputs.Ra;
  if (isNum(inputs.G) && inputs.G !== inputs.F + inputs.O) inp.F = inputs.G - inputs.O; // growth G, all of O billed as output
  const errors = validateInputs(inp);
  if (errors.length) return { computable: false, reason: `inputs not computable (${errors[0]})` };
  const a = stepA(inp, current, target);
  const be = breakEven(inp, current, target, a);
  const settled = be.turns !== null && be.settles.length === 0;
  let costSplit = null;
  if (CLASS_RANK[target.class] >= CLASS_RANK.opus) {
    const runner = modelForClass(table, current.family, "sonnet"), acceptor = modelForClass(table, current.family, "opus");
    if (runner && acceptor && !missingPrices(runner).length && !missingPrices(acceptor).length) costSplit = splitCost(inp, current, runner, acceptor)?.total ?? null;
  }
  return {
    computable: true,
    cost_continue: a.cont.total, cost_fresh: a.fresh.total, cost_split: costSplit, t_star: be.turns,
    draft: { side: a.verdict.side, by: settled ? "break-even" : a.verdict.by },
  };
}

// One stated figure against its recompute. Returns null when correct, else the reason.
function figureError(stated, want, kind) {
  if (want === null || want === undefined) return "stated where the recompute has none";
  if (stated === "never") return want === Infinity ? null : "never, but the recompute is finite";
  if (!/^\d[\d,]*(\.\d+)?$/.test(stated)) return "not a number";
  if (want === Infinity) return "a number, but the recompute is never";
  const places = (stated.split(".")[1] ?? "").length;
  if (places < (kind === "usd" ? 2 : 1)) return `too few decimal places (${places})`;
  return matchesStated(stated, want) ? null : "outside half a unit of the last decimal";
}

function arithmetic(block, rc, expectedCalc) {
  if (!rc.computable) return { scored: false, reason: rc.reason, stated: 0, correct: 0, missing: 0, max_error_usd: null, rule_ok: null, errors: [] };
  const totals = block.totals ?? { cost_continue: null, cost_fresh: null, cost_split: null, t_star: null };
  const figures = [["cost_continue", "usd"], ["cost_fresh", "usd"], ["cost_split", "usd"], ["t_star", "turns"]];
  let stated = 0, correct = 0, missing = 0, maxError = 0;
  const errors = [];
  for (const [name, kind] of figures) {
    const s = totals[name];
    if (s === null) { if (expectedCalc[name] !== null && expectedCalc[name] !== undefined) missing += 1; continue; }
    stated += 1;
    const why = figureError(s, rc[name], kind);
    if (why === null) correct += 1; else errors.push({ figure: name, why });
    if (kind === "usd" && /^\d[\d,]*(\.\d+)?$/.test(s) && Number.isFinite(rc[name])) maxError = Math.max(maxError, Math.abs(Number(s.replace(/,/g, "")) - rc[name]));
  }
  const rule_ok = block.draft !== null && block.draft.side === rc.draft.side && block.draft.by === rc.draft.by;
  return { scored: true, reason: null, stated, correct, missing, max_error_usd: roundTo(maxError, 4), rule_ok, errors };
}

// Guardrail 7's verdict past the cap: step 2's draft where the block has one,
// else continue. A split carries out a fresh draft (step 2.1 runs before the
// cap cuts step 5).
function takesCapDefault(block) {
  const side = DEFAULT_SIDES.includes(block.draft?.side) ? block.draft.side : "continue";
  return block.final.outcome === side || (side === "fresh" && block.final.outcome === "split");
}

// Measure 2(a): each bound guardrail, with its consequence in the block.
function boundGuardrailFailures(scenario, block) {
  const e = scenario.expected, f = block.final, failed = [];
  const consequence = {
    1: () => f.outcome === "continue",
    2: () => f.outcome === "fresh",
    3: () => typeof f.approval_step === "string" && f.approval_step.trim() !== "",
    5: () => f.outcome === e.final.outcome && (e.calculator.exit !== 2 || block.totals === null || Object.values(block.totals).every((v) => v === null)),
    6: () => f.model === e.final.model && f.effort === e.final.effort,
    7: () => takesCapDefault(block) && (f.outcome !== "continue" || (f.model === scenario.current && f.effort === scenario.current_effort)),
    8: () => f.outcome === "stop" && f.model === e.final.model,
  };
  for (const g of e.guardrails) if (!block.guardrails_triggered.includes(g) || !consequence[g]?.()) failed.push(g);
  return failed;
}

function inputFidelity(scenario, inputs) {
  if (inputs === null) return { scored: 0, matched: 0, misses: [] };
  const accept = scenario.expected.accept_inputs ?? {};
  let scored = 0, matched = 0;
  const misses = [];
  for (const k of INPUT_SYMBOLS) {
    if (scenario[k] === undefined) continue;
    scored += 1;
    // A null target is the step 1.4.4 answer where the table has no priced row to name (calculator exit 3).
    const nullTargetOk = k === "target" && inputs[k] === null && scenario.expected.calculator.exit === 3;
    if (inputs[k] === scenario[k] || (accept[k] ?? []).includes(inputs[k]) || nullTargetOk) matched += 1; else misses.push(k);
  }
  return { scored, matched, misses };
}

// Measure 4 for one run. `pricing` is the table in force on the scoring day;
// the record's size is measured here, never taken from the subject.
function decideCost(block, usage, pricing, record) {
  const c = block?.cost_of_deciding ?? null;
  const recordTokens = Math.round(record.length / CHARS_PER_TOKEN);
  const reportedTokens = c ? c.input_tokens + c.output_tokens : null;
  const reportedMinutes = c ? c.minutes : null;
  const measuredTokens = isNum(usage?.total_tokens) ? usage.total_tokens : null;
  const measuredMinutes = isNum(usage?.duration_ms) ? usage.duration_ms / 60000 : null;
  const model = typeof usage?.model === "string" ? findModel(pricing, usage.model) : null;
  const price = (inTok, outTok) => (model ? roundTo((inTok * model.cache_write + outTok * model.output) * USD_PER_TABLE_UNIT, 4) : null);
  return {
    reported_tokens: reportedTokens, reported_minutes: reportedMinutes, measured_tokens: measuredTokens, measured_minutes: measuredMinutes,
    record_tokens: recordTokens,
    usd_to_decide: c ? price(c.input_tokens, c.output_tokens) : null,
    usd_measured: isNum(usage?.input_tokens) && isNum(usage?.output_tokens) ? price(usage.input_tokens, usage.output_tokens) : null,
    over_cap: recordTokens > DECIDE_CAP_RECORD_TOKENS || (reportedMinutes ?? 0) > DECIDE_CAP_MINUTES || (measuredMinutes ?? 0) > DECIDE_CAP_MINUTES,
    report_ratio: reportedTokens !== null && measuredTokens ? roundTo(reportedTokens / measuredTokens, 3) : null,
  };
}

function proseFaults(outside) {
  const emDashes = outside.split(EM_DASH).length - 1;
  const banned = BANNED.filter((_, k) => BANNED_RE[k].test(outside));
  return { em_dashes: emDashes, banned };
}

/**
 * Scores one run. `scenario` is the parsed scenario file, `table` the price
 * table the run used (the scenario's own, prices unchanged), `record` the text
 * of record.txt, `usage` the parsed usage.json or null, `pricing` the table in
 * force on the scoring day (defaults to `table`).
 */
export function scoreRun({ scenario, table, record, usage = null, pricing = table, subject, arm }) {
  if (!scenario?.expected || !table?.families || typeof record !== "string") throw new Error("scoreRun: needs a scenario with expectations, a price table and the record text");
  const x = extractBlock(record);
  const base = { scenario: scenario.id, subject, arm, outcome_expected: scenario.expected.final.outcome, prose: proseFaults(x.outside) };
  const typeError = x.error ?? validateBlock(x.block);
  if (typeError) {
    return {
      ...base, unscorable: true, reason: typeError, outcome_got: null, final_ok: false, draft_ok: scenario.expected.draft_required ? false : null,
      guardrails_ok: false, bound: [...scenario.expected.guardrails], bound_failed: [...scenario.expected.guardrails], g4_ok: false, false_alarms: [],
      arithmetic: arithmetic(null, { computable: false, reason: "unscorable" }, {}), inputs: { scored: 0, matched: 0, misses: [] },
      decide: decideCost(null, usage, pricing, record), consistency: { draft_line_ok: null, skill_ran_ok: null }, overrun_default_not_taken: null, note: `unscorable: ${typeError}`,
    };
  }
  const b = x.block, e = scenario.expected, f = b.final;
  const finalChecks = [
    ["final.outcome", f.outcome === e.final.outcome],
    ["final.model", e.final.model === null || f.model === e.final.model],
    ["final.effort", e.final.effort === null || f.effort === e.final.effort],
    ["skill_ran", b.skill_ran === e.skill_runs],
  ];
  const final_ok = finalChecks.every(([, ok]) => ok);
  const draft_ok = e.draft_required ? b.draft !== null && b.draft.side === e.calculator.draft?.side && b.draft.by === e.calculator.draft?.by : null;
  const boundFailed = boundGuardrailFailures(scenario, b);
  const ids = [b.inputs?.current, b.inputs?.target, f.model].filter((m) => m !== null && m !== undefined);
  const g4_ok = ids.every((m) => findModel(table, m) !== null);
  const rc = recompute(b.inputs, table, scenario.today);
  const arith = arithmetic(b, rc, e.calculator);
  const drafted = x.outside.match(/Draft verdict:\**\s*(continue|fresh|incomplete)/i)?.[1]?.toLowerCase() ?? null;
  const consistency = {
    draft_line_ok: b.draft && drafted ? b.draft.side === drafted : null,
    skill_ran_ok: /Session dispatch not run/i.test(x.outside) === !b.skill_ran,
  };
  const decide = decideCost(b, usage, pricing, record);
  // F2-6: the run recorded an overrun (guardrail 7 listed) or is over the cap, and its verdict is not the cap's.
  // Runs listing a guardrail that sets the outcome itself (1, 2, 5, 8) are left out: step 4 still runs past the cap.
  const overrun = b.guardrails_triggered.includes(7) || decide.over_cap;
  const outcomeSetElsewhere = b.guardrails_triggered.some((g) => OUTCOME_GUARDRAILS.includes(g));
  const overrun_default_not_taken = overrun && !outcomeSetElsewhere && ["continue", "fresh", "split"].includes(f.outcome) && !takesCapDefault(b);
  const fail = finalChecks.find(([, ok]) => !ok)?.[0]
    ?? (draft_ok === false ? "draft" : null)
    ?? (boundFailed.length ? `guardrail ${boundFailed[0]}` : null)
    ?? (!g4_ok ? "guardrail 4 (model id not in the table)" : null)
    ?? (arith.scored && arith.errors.length ? `arithmetic (${arith.errors[0].figure})` : null);
  return {
    ...base, unscorable: false, reason: null, outcome_got: f.outcome, final_ok, draft_ok,
    guardrails_ok: boundFailed.length === 0 && g4_ok, bound: [...e.guardrails], bound_failed: boundFailed, g4_ok,
    false_alarms: b.guardrails_triggered.filter((g) => !e.guardrails.includes(g)),
    arithmetic: arith, inputs: inputFidelity(scenario, b.inputs), decide, consistency, overrun_default_not_taken,
    note: fail ? `first failed check: ${fail}` : "",
  };
}

// ---- Aggregation and the report (rubric section 8) ----

const median = (xs) => { const s = xs.filter((v) => v !== null && v !== undefined).sort((p, q) => p - q); return s.length === 0 ? null : s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2; };
const cell = (ok) => (ok === null || ok === undefined ? "n/a" : ok ? "yes" : "no");
const num = (v, places) => (v === null || v === undefined ? "n/a" : v.toFixed(places));
const rate = (k, n) => {
  if (n === 0) return "0/0";
  const w = wilson(k, n);
  return `${k}/${n} (${w.lo.toFixed(1)} to ${w.hi.toFixed(1)} percent)`;
};

/** One summary row per subject and arm, as plain values. */
export function summarise(scores) {
  const groups = new Map();
  for (const s of scores) {
    const key = `${s.subject}\u0000${s.arm}`;
    if (!groups.has(key)) groups.set(key, { subject: s.subject, arm: s.arm, runs: [] });
    groups.get(key).runs.push(s);
  }
  return [...groups.values()].sort((a, b) => a.subject.localeCompare(b.subject) || a.arm.localeCompare(b.arm)).map(({ subject, arm, runs }) => {
    const drafted = runs.filter((r) => r.draft_ok !== null), bound = runs.filter((r) => r.bound.length > 0);
    const sum = (f) => runs.reduce((t, r) => t + f(r), 0);
    return {
      subject, arm, n: runs.length, unscorable: runs.filter((r) => r.unscorable).length,
      final: [runs.filter((r) => r.final_ok).length, runs.length],
      draft: [drafted.filter((r) => r.draft_ok).length, drafted.length],
      bound: [bound.filter((r) => r.bound_failed.length === 0).length, bound.length],
      g4: [runs.filter((r) => r.g4_ok).length, runs.length],
      arithmetic: [sum((r) => r.arithmetic.correct), sum((r) => r.arithmetic.stated)],
      arithmetic_error_runs: runs.filter((r) => r.arithmetic.errors.length > 0).length,
      inputs: [sum((r) => r.inputs.matched), sum((r) => r.inputs.scored)],
      usd_median: median(runs.map((r) => r.decide.usd_to_decide)),
      usd_max: runs.reduce((m, r) => (r.decide.usd_to_decide !== null && r.decide.usd_to_decide > (m ?? -1) ? r.decide.usd_to_decide : m), null),
      over_cap: [runs.filter((r) => r.decide.over_cap).length, runs.length],
      minutes_median: median(runs.map((r) => r.decide.measured_minutes ?? r.decide.reported_minutes)),
    };
  });
}

/**
 * The text of eval/results-<date>.md. `header` carries date, commit, tableName,
 * subjectModels (subject to model id or null), promptNote; every cell below is
 * a count, a rate or a name, never the subject's own words.
 */
export function renderReport({ header, scores }) {
  const sorted = [...scores].sort((a, b) => a.scenario.localeCompare(b.scenario) || a.subject.localeCompare(b.subject) || a.arm.localeCompare(b.arm));
  const rows = summarise(scores);
  const subjects = [...new Set(scores.map((s) => s.subject))].sort(), arms = [...new Set(scores.map((s) => s.arm))].sort();
  const L = [];
  L.push(`# Evaluation results ${header.date}`, "");
  L.push(`- Date: ${header.date}`, `- Skill commit: ${header.commit}`, `- Price table in force: ${header.tableName}`);
  L.push(`- Subjects: ${subjects.map((s) => `${s} (${header.subjectModels?.[s] ?? "model id not reported"})`).join(", ")}`);
  L.push(`- Arms: ${arms.join(", ")}`, `- Runs: ${scores.length}; unscorable: ${scores.filter((s) => s.unscorable).length}`, `- ${header.promptNote}`, "");
  L.push("## Summary", "");
  L.push("| Subject | Arm | Runs | Final agreement | Draft agreement | Bound guardrails | Guardrail 4 | Arithmetic correct/stated | Runs with an error | Inputs matched/scored | USD to decide, median | USD to decide, largest | Over cap | Median minutes |");
  L.push("|---|---|---|---|---|---|---|---|---|---|---|---|---|---|");
  for (const r of rows) {
    L.push(`| ${r.subject} | ${r.arm} | ${r.n} (${r.unscorable} unscorable) | ${rate(...r.final)} | ${r.draft[1] ? `${r.draft[0]}/${r.draft[1]}` : "n/a"} | ${r.bound[1] ? `${r.bound[0]}/${r.bound[1]}` : "n/a"} | ${r.g4[0]}/${r.g4[1]} | ${r.arithmetic[0]}/${r.arithmetic[1]} | ${r.arithmetic_error_runs} | ${r.inputs[0]}/${r.inputs[1]} | ${num(r.usd_median, 4)} | ${num(r.usd_max, 4)} | ${r.over_cap[0]}/${r.over_cap[1]} | ${num(r.minutes_median, 1)} |`);
  }
  L.push("", "## Runs", "");
  L.push("| Scenario | Subject | Arm | Outcome got | Outcome expected | Final | Draft | Guardrails | Arithmetic | Inputs | Tokens reported | Tokens measured | Minutes | USD to decide | Note |");
  L.push("|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|");
  for (const s of sorted) {
    const a = s.arithmetic, d = s.decide;
    const arith = a.scored ? `${a.correct}/${a.stated}${a.missing ? `, ${a.missing} missing` : ""}` : `not scored (${a.reason})`;
    L.push(`| ${s.scenario} | ${s.subject} | ${s.arm} | ${s.outcome_got ?? "n/a"} | ${s.outcome_expected} | ${cell(s.final_ok)} | ${cell(s.draft_ok)} | ${cell(s.guardrails_ok)} | ${arith} | ${s.inputs.matched}/${s.inputs.scored} | ${d.reported_tokens ?? "n/a"} | ${d.measured_tokens ?? "n/a"} | ${num(d.measured_minutes ?? d.reported_minutes, 1)} | ${num(d.usd_to_decide, 4)} | ${s.note || ""} |`);
  }
  L.push("", "## Input misses per symbol", "");
  const columns = rows.map((r) => `${r.subject}.${r.arm}`);
  L.push(`| Symbol | ${columns.join(" | ")} |`, `|---|${columns.map(() => "---").join("|")}|`);
  for (const sym of INPUT_SYMBOLS) {
    const counts = rows.map((r) => scores.filter((s) => s.subject === r.subject && s.arm === r.arm && s.inputs.misses.includes(sym)).length);
    if (counts.some((c) => c > 0)) L.push(`| ${sym} | ${counts.join(" | ")} |`);
  }
  L.push("", "## Diagnostics", "");
  const diag = (label, f) => { const hit = sorted.filter(f).map((s) => `${s.scenario}.${s.subject}.${s.arm}`); L.push(`- ${label}: ${hit.length ? hit.join(", ") : "none"}`); };
  diag("False alarms (guardrails stated that the scenario does not bind)", (s) => s.false_alarms.length > 0);
  diag("Draft line and block disagree", (s) => s.consistency.draft_line_ok === false);
  diag("Step 0 line and skill_ran disagree", (s) => s.consistency.skill_ran_ok === false);
  diag("Em-dashes or banned words in the record", (s) => s.prose.em_dashes > 0 || s.prose.banned.length > 0);
  diag("Overrun recorded or over the cap, default not taken (guardrail 7: the draft, else continue)", (s) => s.overrun_default_not_taken === true);
  L.push("");
  return L.join("\n");
}
