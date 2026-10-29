// The evaluation scorer (eval/score.mjs) and runner (eval/run.mjs) against the
// oracle of Stage S2: a perfect block synthesised from each of the 21
// scenarios must score clean, each mutation must fail exactly its own check,
// the Wilson interval must match the rubric's worked values, and `prepare`
// must date each sandbox table by the scenario's own age. Everything runs
// from temp folders; the live tree is only read.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { ROOT, rm, tmpDir } from "./fixtures/helpers.mjs";
import { extractBlock, renderReport, scoreRun, wilson } from "../eval/score.mjs";
import { prepare, recordUsage } from "../eval/run.mjs";

const scenarios = fs.readdirSync(path.join(ROOT, "eval", "scenarios")).filter((n) => n.endsWith(".json")).sort()
  .map((n) => JSON.parse(fs.readFileSync(path.join(ROOT, "eval", "scenarios", n), "utf8")));
const tableOf = (s) => JSON.parse(fs.readFileSync(path.join(ROOT, ...s.table.split("/")), "utf8"));
const byId = (prefix) => scenarios.find((s) => s.id.startsWith(prefix));

// The block a flawless subject would write for a scenario. Scenario 13 states
// F 3,000 with growth G 3,800 (the second reading its notes accept). A
// scenario where the skill does not run has no inputs, totals or draft.
function perfectBlock(s) {
  const e = s.expected, c = e.calculator;
  const ran = e.skill_runs;
  const inputs = ran ? {
    current: s.current, target: s.target, W: s.W, K: s.K, C0: s.C0, T: s.T, F: s.id.startsWith("13") ? 3000 : s.F, O: s.O,
    B: s.B, R: s.R, H: s.H, M: s.M, L: s.L, compacted: s.compacted, Ta: s.Ta ?? null, Ra: s.Ra ?? null, G: s.id.startsWith("13") ? 3800 : null,
  } : null;
  return {
    skill_ran: ran,
    inputs,
    table_age_days: ran ? 1 : null,
    totals: ran ? { cost_continue: c.cost_continue, cost_fresh: c.cost_fresh, cost_split: c.cost_split, t_star: c.t_star } : null,
    draft: ran && !s.id.startsWith("21") ? c.draft : null, // 21: the cap passed before step 2, no draft
    guardrails_triggered: [...e.guardrails],
    final: { outcome: e.final.outcome, model: e.final.model, effort: e.final.effort, approval_step: e.final.approval_step ? "The operator approves the push before it runs." : null },
    cost_of_deciding: ran ? { input_tokens: 1000, output_tokens: 3000, minutes: 5, usd: "0.07" } : null,
  };
}

function recordOf(s, block) {
  const lines = ["# Session dispatch record", ""];
  if (!block.skill_ran) lines.push("Session dispatch not run: fewer than 10 turns remain and no trigger applies.");
  else if (block.draft) lines.push(`Draft verdict: ${block.draft.side}, by ${block.draft.by ?? "none"}.`);
  lines.push("", "```json dispatch-result", JSON.stringify(block, null, 2), "```", "");
  return lines.join("\n");
}

const score = (s, block) => scoreRun({ scenario: s, table: tableOf(s), record: recordOf(s, block), subject: "sonnet", arm: "calculator" });
const clone = (o) => JSON.parse(JSON.stringify(o));

test("a perfect block scores clean on all 21 scenarios", () => {
  assert.equal(scenarios.length, 21);
  for (const s of scenarios) {
    const r = score(s, perfectBlock(s));
    const why = `${s.id}: ${JSON.stringify(r.note)}`;
    assert.equal(r.unscorable, false, why);
    assert.equal(r.final_ok, true, why);
    assert.equal(r.draft_ok, s.expected.draft_required ? true : null, why);
    assert.equal(r.guardrails_ok, true, why);
    assert.equal(r.g4_ok, true, why);
    assert.deepEqual(r.false_alarms, [], why);
    assert.deepEqual(r.arithmetic.errors, [], why);
    assert.equal(r.arithmetic.correct, r.arithmetic.stated, why);
    assert.equal(r.arithmetic.missing, 0, why);
    if (r.arithmetic.scored && !s.id.startsWith("21")) assert.equal(r.arithmetic.rule_ok, true, why);
    assert.equal(r.inputs.matched, r.inputs.scored, why);
    assert.equal(r.consistency.draft_line_ok === false || r.consistency.skill_ran_ok === false, false, why);
    assert.equal(r.prose.em_dashes, 0, why);
  }
});

test("scenarios the arithmetic cannot score say why", () => {
  assert.match(score(byId("14"), perfectBlock(byId("14"))).arithmetic.reason, /stale/);
  assert.match(score(byId("15"), perfectBlock(byId("15"))).arithmetic.reason, /price/);
  assert.equal(score(byId("18"), perfectBlock(byId("18"))).arithmetic.scored, false);
});

test("each mutation fails exactly its own check", () => {
  // Outcome flipped.
  let s = byId("03"), b = perfectBlock(s);
  b.final.outcome = "fresh";
  let r = score(s, b);
  assert.deepEqual([r.final_ok, r.draft_ok, r.guardrails_ok], [false, true, true]);
  assert.match(r.note, /final\.outcome/);

  // A bound guardrail dropped.
  s = byId("04"); b = perfectBlock(s);
  b.guardrails_triggered = [];
  r = score(s, b);
  assert.deepEqual([r.final_ok, r.draft_ok, r.guardrails_ok], [true, true, false]);
  assert.deepEqual(r.bound_failed, [1]);

  // cost_fresh plus 0.02.
  s = byId("03"); b = perfectBlock(s);
  b.totals.cost_fresh = (Number(b.totals.cost_fresh) + 0.02).toFixed(2);
  r = score(s, b);
  assert.deepEqual([r.final_ok, r.draft_ok, r.guardrails_ok], [true, true, true]);
  assert.deepEqual([r.arithmetic.stated, r.arithmetic.correct], [3, 2]);
  // Measured against the unrounded recompute, so the stated 0.02 shows as about 0.02.
  assert.ok(Math.abs(r.arithmetic.max_error_usd - 0.02) < 0.005, String(r.arithmetic.max_error_usd));

  // A total written to one decimal.
  b = perfectBlock(s);
  b.totals.cost_continue = Number(b.totals.cost_continue).toFixed(1);
  r = score(s, b);
  assert.deepEqual([r.final_ok, r.guardrails_ok, r.arithmetic.stated, r.arithmetic.correct], [true, true, 3, 2]);

  // A model id not in the table, in the inputs: guardrail 4 only.
  b = perfectBlock(s);
  b.inputs.target = "claude-nope-1";
  r = score(s, b);
  assert.deepEqual([r.final_ok, r.draft_ok, r.guardrails_ok, r.g4_ok, r.arithmetic.scored], [true, true, false, false, false]);

  // A figure stated on the stale-table scenario.
  s = byId("14"); b = perfectBlock(s);
  b.totals = { cost_continue: "1.00", cost_fresh: null, cost_split: null, t_star: null };
  r = score(s, b);
  assert.deepEqual([r.final_ok, r.guardrails_ok, r.g4_ok], [true, false, true]);
  assert.deepEqual(r.bound_failed, [5]);

  // The block removed.
  s = byId("03");
  r = scoreRun({ scenario: s, table: tableOf(s), record: "Draft verdict: continue.\n", subject: "haiku", arm: "hand" });
  assert.deepEqual([r.unscorable, r.final_ok, r.guardrails_ok, r.arithmetic.scored], [true, false, false, false]);
  assert.match(r.reason, /no dispatch-result block/);
});

test("a block that breaks a type is unscorable and the last block wins", () => {
  const s = byId("03"), b = perfectBlock(s);
  b.inputs.W = "1000000";
  const r = score(s, b);
  assert.equal(r.unscorable, true);
  assert.match(r.reason, /inputs\.W/);
  const good = perfectBlock(s);
  const text = `${recordOf(s, b)}\n${recordOf(s, good)}`;
  assert.equal(extractBlock(text).block.skill_ran, true);
  assert.equal(extractBlock(text).block.inputs.W, 1000000);
});

test("a null target is legal: scored, matched where the table has no priced row, a miss elsewhere", () => {
  let s = byId("15"), b = perfectBlock(s);
  b.inputs.target = null;
  let r = score(s, b);
  assert.deepEqual([r.unscorable, r.final_ok, r.guardrails_ok, r.g4_ok], [false, true, true, true]);
  assert.equal(r.inputs.matched, r.inputs.scored);
  s = byId("03"); b = perfectBlock(s);
  b.inputs.target = null;
  r = score(s, b);
  assert.deepEqual([r.unscorable, r.final_ok, r.arithmetic.scored], [false, true, false]);
  assert.match(r.arithmetic.reason, /target not named/);
  assert.deepEqual(r.inputs.misses, ["target"]);
  b.inputs.current = null;
  assert.match(score(s, b).reason, /inputs\.current must be a string/);
});

test("the cap is on the record's measured size and the minutes, not on reported reading", () => {
  const s = byId("03"), b = perfectBlock(s);
  b.cost_of_deciding = { input_tokens: 20000, output_tokens: 3000, minutes: 5, usd: "0.10" };
  let r = score(s, b);
  assert.equal(r.decide.over_cap, false);
  assert.ok(r.decide.record_tokens < 4000, String(r.decide.record_tokens));
  const long = recordOf(s, b).replace("# Session dispatch record", `# Session dispatch record\n\n${"x".repeat(16100)}`);
  r = scoreRun({ scenario: s, table: tableOf(s), record: long, subject: "sonnet", arm: "calculator" });
  assert.deepEqual([r.decide.over_cap, r.final_ok], [true, true]);
  b.cost_of_deciding.minutes = 11;
  assert.equal(score(s, b).decide.over_cap, true);
});

test("guardrail 7 keeps the draft past the cap, else continue at the current model and effort", () => {
  const s = byId("17");
  const block = (draft, outcome, model, effort) => ({ ...perfectBlock(s), draft, guardrails_triggered: [7], final: { outcome, model, effort, approval_step: null } });
  const fresh = { side: "fresh", by: "cost" };
  let r = score(s, block(null, "continue", s.current, s.current_effort));
  assert.deepEqual([r.bound_failed, r.overrun_default_not_taken], [[], false]);
  r = score(s, block(null, "continue", "claude-opus-5-5", "high"));
  assert.deepEqual(r.bound_failed, [7]);
  r = score(s, block(fresh, "fresh", "claude-opus-5-5", "high"));
  assert.deepEqual([r.bound_failed, r.overrun_default_not_taken], [[], false]);
  r = score(s, block(fresh, "split", "claude-sonnet-5-5", "medium"));
  assert.deepEqual(r.bound_failed, []);
  // An incomplete draft is step 2 unfinished: continue at the current model is guardrail 7's verdict.
  r = score(s, block({ side: "incomplete", by: null }, "continue", s.current, s.current_effort));
  assert.deepEqual([r.bound_failed, r.overrun_default_not_taken], [[], false]);
  // A guardrail that sets the outcome itself (6 here) leaves the run out of the diagnostic.
  r = score(s, { ...block(fresh, "continue", s.current, s.current_effort), guardrails_triggered: [6, 7] });
  assert.equal(r.overrun_default_not_taken, false);
  // The H1 pattern: a fresh draft dropped for continue at the cap.
  r = score(s, block(fresh, "continue", s.current, s.current_effort));
  assert.deepEqual([r.bound_failed, r.overrun_default_not_taken], [[7], true]);
  // The diagnostic on a scenario that does not bind guardrail 7.
  const s2 = byId("02"), b2 = { ...perfectBlock(byId("02")), guardrails_triggered: [7] };
  b2.final = { ...b2.final, outcome: "continue", model: s2.current, effort: s2.current_effort };
  r = score(s2, b2);
  assert.deepEqual([r.final_ok, r.overrun_default_not_taken, r.false_alarms], [false, true, [7]]);
});

test("the Wilson 95 percent interval matches the rubric's values", () => {
  const pct = (k, n) => { const w = wilson(k, n); return [w.lo.toFixed(1), w.hi.toFixed(1)]; };
  assert.deepEqual(pct(18, 20), ["69.9", "97.2"]);
  assert.deepEqual(pct(20, 20), ["83.9", "100.0"]);
  assert.deepEqual(pct(0, 20), ["0.0", "16.1"]);
  assert.deepEqual(pct(10, 20), ["29.9", "70.1"]);
});

test("prepare dates each sandbox table by the scenario's own age and leaves scripts out of the hand arm", () => {
  const work = tmpDir("eval-prepare");
  try {
    const out = prepare({ date: "2026-11-05", subjects: ["haiku"], arms: ["calculator", "hand"], only: ["03", "14"], runsRoot: path.join(work, "runs"), sandboxRoot: path.join(work, "sandbox"), skillRoot: ROOT, repoRoot: ROOT });
    assert.equal(out.runs.length, 4);
    const tables = (id, arm) => fs.readdirSync(path.join(work, "sandbox", "2026-11-05", `${id}.haiku.${arm}`, "skill", "pricing"));
    assert.deepEqual(tables("03-break-even-continue", "calculator"), ["2026-11-04.json"]);
    assert.deepEqual(tables("14-stale-table", "hand"), ["2026-10-07.json"]);
    const scripts = (arm) => path.join(work, "sandbox", "2026-11-05", `03-break-even-continue.haiku.${arm}`, "skill", "scripts");
    assert.deepEqual(fs.readdirSync(scripts("calculator")).sort(), ["dispatch-core.mjs", "dispatch.mjs"]);
    assert.equal(fs.existsSync(scripts("hand")), false);
    const prompt = fs.readFileSync(path.join(work, "runs", "2026-11-05", "03-break-even-continue.haiku.hand", "prompt.txt"), "utf8");
    assert.doesNotMatch(prompt, /\{\{/);
    assert.match(prompt, /Today is 2026-11-05/);
    const manifest = JSON.parse(fs.readFileSync(path.join(work, "runs", "2026-11-05", "manifest.json"), "utf8"));
    assert.match(manifest.skill_sha256, /^[0-9a-f]{64}$/);
    assert.equal(manifest.runs.length, 4);
  } finally { rm(work); }
});

test("prepare --repeat suffixes the second and later runs of one scenario, subject and arm", () => {
  const work = tmpDir("eval-repeat");
  try {
    const args = { date: "2026-11-05", subjects: ["sonnet"], arms: ["hand"], only: ["03"], runsRoot: path.join(work, "runs"), sandboxRoot: path.join(work, "sandbox"), skillRoot: ROOT, repoRoot: ROOT };
    const out = prepare({ ...args, repeat: 3 });
    const ids = out.runs.map((r) => r.run);
    assert.deepEqual(ids, ["03-break-even-continue.sonnet.hand", "03-break-even-continue.sonnet.hand.2", "03-break-even-continue.sonnet.hand.3"]);
    assert.equal(new Set(out.runs.map((r) => r.sandbox)).size, 3);
    assert.equal(new Set(out.runs.map((r) => r.prompt)).size, 3);
    for (const r of out.runs) assert.ok(fs.existsSync(r.prompt), r.prompt);
    assert.match(fs.readFileSync(out.runs[1].prompt, "utf8"), /hand\.2/);
    assert.equal(prepare(args).runs.length, 1);
    for (const bad of [0, 1.5, -1, NaN]) assert.throws(() => prepare({ ...args, repeat: bad }), /--repeat must be a whole number/);
  } finally { rm(work); }
});

test("usage names the model per subject class and refuses a run outside the manifest", () => {
  const work = tmpDir("eval-usage");
  try {
    const runsRoot = path.join(work, "runs");
    prepare({ date: "2026-11-05", subjects: ["haiku"], arms: ["hand"], only: ["03"], runsRoot, sandboxRoot: path.join(work, "sandbox"), skillRoot: ROOT, repoRoot: ROOT });
    const run = "03-break-even-continue.haiku.hand";
    recordUsage({ date: "2026-11-05", entries: [{ run, total_tokens: 1000, tool_uses: 2, duration_ms: 3000 }], models: { haiku: "claude-haiku-5-5" }, runsRoot });
    const u = JSON.parse(fs.readFileSync(path.join(runsRoot, "2026-11-05", run, "usage.json"), "utf8"));
    assert.deepEqual([u.model, u.total_tokens, u.tool_uses, u.duration_ms, u.input_tokens], ["claude-haiku-5-5", 1000, 2, 3000, null]);
    assert.throws(() => recordUsage({ date: "2026-11-05", entries: [{ run: "nope" }], models: { haiku: "x" }, runsRoot }), /not in the manifest/);
    assert.throws(() => recordUsage({ date: "2026-11-05", entries: [{ run }], models: {}, runsRoot }), /no id for subject haiku/);
  } finally { rm(work); }
});

test("scenario 21: the cap passed with no draft takes the default, continue on the current model and effort", () => {
  const s = byId("21");
  assert.deepEqual([s.expected.draft_required, s.expected.guardrails, s.expected.final.outcome, s.expected.final.model, s.expected.final.effort], [false, [7], "continue", s.current, s.current_effort]);
  const block = (outcome, model, effort) => ({ ...perfectBlock(s), draft: null, guardrails_triggered: [7], final: { outcome, model, effort, approval_step: null } });
  let r = score(s, block("continue", s.current, s.current_effort));
  assert.deepEqual([r.final_ok, r.draft_ok, r.bound_failed, r.overrun_default_not_taken], [true, null, [], false]);
  // The H1 pattern: step 2 run past the cap and its fresh verdict taken.
  r = score(s, block("fresh", "claude-opus-5-5", "high"));
  assert.deepEqual([r.final_ok, r.bound_failed, r.overrun_default_not_taken], [false, [7], true]);
  // Continue on another model breaks the default's model clause.
  r = score(s, block("continue", "claude-opus-5-5", "high"));
  assert.deepEqual(r.bound_failed, [7]);
});

test("t_star: never for a model change is an error, null is not (F4 2.2)", () => {
  const s = byId("02"), b = perfectBlock(s);
  assert.equal(s.expected.calculator.t_star, null);
  b.totals.t_star = "never";
  let r = score(s, b);
  assert.deepEqual(r.arithmetic.errors, [{ figure: "t_star", why: "stated where the recompute has none" }]);
  b.totals.t_star = null;
  r = score(s, b);
  assert.deepEqual([r.arithmetic.errors, r.arithmetic.missing], [[], 0]);
});

test("cost_of_deciding.usd may be null (not priced) and stays a string otherwise", () => {
  const s = byId("03"), b = perfectBlock(s);
  b.cost_of_deciding.usd = null;
  let r = score(s, b);
  assert.equal(r.unscorable, false);
  b.cost_of_deciding.usd = 0.07;
  r = score(s, b);
  assert.equal(r.unscorable, true);
  assert.match(r.reason, /cost_of_deciding\.usd/);
});

test("an incomplete draft with guardrail 5 listed keeps incomplete at the cap (F3-1)", () => {
  const s = byId("17");
  const block = (guardrails, outcome, model, effort) => ({ ...perfectBlock(s), draft: { side: "incomplete", by: null }, guardrails_triggered: guardrails, final: { outcome, model, effort, approval_step: null } });
  let r = score(s, block([5, 7], "incomplete", null, null));
  assert.deepEqual([r.bound_failed, r.overrun_default_not_taken], [[], false]);
  // Without 5 listed, an incomplete draft is step 2 unfinished and the default is continue.
  r = score(s, block([7], "incomplete", null, null));
  assert.deepEqual(r.bound_failed, [7]);
  r = score(s, block([5, 7], "continue", s.current, s.current_effort));
  assert.deepEqual(r.bound_failed, [7]);
});

test("record_tokens measures the record less the result block (F3-5)", () => {
  const s = byId("03"), b = perfectBlock(s);
  const record = recordOf(s, b);
  const r = score(s, b);
  assert.equal(r.decide.record_tokens, Math.round(extractBlock(record).outside.length / 4));
  assert.ok(r.decide.record_tokens < Math.round(record.length / 4));
});

test("the overrun diagnostic reports flagged n, of which m fail a bound outcome guardrail (F3-6)", () => {
  const s = byId("17"), s8 = byId("08");
  const fresh = { side: "fresh", by: "cost" };
  const flagged = score(s, { ...perfectBlock(s), draft: fresh, guardrails_triggered: [7], final: { outcome: "continue", model: s.current, effort: s.current_effort, approval_step: null } });
  const b8 = perfectBlock(s8);
  const bound = score(s8, { ...b8, guardrails_triggered: [6, 7], final: { ...b8.final, outcome: "continue", model: s8.current, effort: s8.current_effort } });
  const header = { date: "2026-11-05", commit: "x", tableName: "t", subjectModels: {}, promptNote: "n" };
  const line = (scores) => renderReport({ header, scores }).split("\n").find((l) => l.includes("default not taken"));
  assert.match(line([flagged]), /flagged 1, of which 0 fail a bound outcome guardrail/);
  // A run that lists an outcome guardrail it binds leaves the diagnostic; the line then reports none.
  assert.equal(bound.overrun_default_not_taken, false);
  assert.match(line([bound]), /flagged 0, of which 0/);
});
