// The evaluation runner's CLI path (eval/run.mjs `run --runner cli`) against a stand-in
// for `claude -p` (scripts/fixtures/fake-claude.mjs): the arguments each run gets, the
// sandbox it runs in, the usage.json it writes, and what it skips or reports as failed.
// No real subject is started; Stage S4's dry run did that once, by hand.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { FIXTURES, ROOT, rm, tmpDir } from "./fixtures/helpers.mjs";
import { cliArgs, collect, prepare, runCli, usageFromCli } from "../eval/run.mjs";

const pricing = JSON.parse(fs.readFileSync(path.join(ROOT, "pricing", "2026-10-29.json"), "utf8"));
const fake = [process.execPath, path.join(FIXTURES, "fake-claude.mjs")];

function setup(work, { subjects = ["sonnet"], arms = ["hand"], only = ["03"] } = {}) {
  const runsRoot = path.join(work, "runs");
  const out = prepare({ date: "2026-11-05", subjects, arms, only, runsRoot, sandboxRoot: path.join(work, "sandbox"), skillRoot: ROOT, repoRoot: ROOT });
  return { runsRoot, out, dir: (r) => path.join(runsRoot, "2026-11-05", r.run) };
}

test("cliArgs isolates the subject from the user's skills and settings and grants tools by arm", () => {
  const hand = cliArgs({ model: "claude-sonnet-5-5", arm: "hand" });
  assert.deepEqual(hand.slice(0, 5), ["-p", "--model", "claude-sonnet-5-5", "--output-format", "json"]);
  for (const flag of ["--disable-slash-commands", "--no-session-persistence"]) assert.ok(hand.includes(flag), flag);
  assert.equal(hand[hand.indexOf("--setting-sources") + 1], "project");
  assert.equal(hand[hand.indexOf("--tools") + 1], "Read,Write");
  assert.doesNotMatch(hand.join(" "), /Bash|max-budget/);
  const calc = cliArgs({ model: "claude-sonnet-5-5", arm: "calculator", maxBudgetUsd: 3 });
  assert.equal(calc[calc.indexOf("--tools") + 1], "Read,Write,Bash");
  assert.match(calc[calc.indexOf("--allowedTools") + 1], /Bash\(node \*dispatch\.mjs\*\)/);
  assert.equal(calc[calc.indexOf("--max-budget-usd") + 1], "3");
  assert.throws(() => cliArgs({ model: "m", arm: "both" }), /arm/);
});

test("usageFromCli sums the measured tokens and prices them from the table, not from the CLI's own cost", () => {
  const result = { num_turns: 4, duration_ms: 2500, total_cost_usd: 9, is_error: false, terminal_reason: "completed", usage: { input_tokens: 10, cache_creation_input_tokens: 1000, cache_read_input_tokens: 20000, output_tokens: 500 }, modelUsage: { "claude-haiku-5-5": { costBasis: "unknown" } } };
  const u = usageFromCli(result, pricing);
  assert.deepEqual([u.model, u.total_tokens, u.input_tokens, u.output_tokens, u.cache_read_input_tokens, u.usd_cli, u.cost_basis], ["claude-haiku-5-5", 21510, 1010, 500, 20000, 9, "unknown"]);
  // 10 x 0.1 + 1000 x 0.125 + 20000 x 0.01 + 500 x 0.5, per million tokens.
  assert.equal(u.usd_priced, 0.0006);
  assert.equal(usageFromCli({ ...result, modelUsage: { "claude-nope-1": {} } }, pricing).usd_priced, null);
  assert.equal(usageFromCli({ ...result, is_error: true, terminal_reason: "budget_exhausted" }, pricing).is_error, true);
});

test("run --runner cli runs each prepared run from its sandbox, writes usage.json, and skips a run that has one", async () => {
  const work = tmpDir("eval-cli");
  try {
    const { runsRoot, out, dir } = setup(work, { subjects: ["haiku", "sonnet"] });
    const seen = [];
    let res = await runCli({ date: "2026-11-05", runsRoot, repoRoot: ROOT, command: fake, concurrency: 2, onRun: (r) => seen.push(r.run) });
    assert.deepEqual([res.ran, res.skipped, res.failed.length], [2, 0, 0]);
    assert.equal(seen.length, 2);
    for (const r of out.runs) {
      const u = JSON.parse(fs.readFileSync(path.join(dir(r), "usage.json"), "utf8"));
      assert.equal(u.model, r.subject === "haiku" ? "claude-haiku-5-5" : "claude-sonnet-5-5");
      assert.deepEqual([u.total_tokens, u.num_turns, u.duration_ms], [21510, 4, 2500]);
      const raw = JSON.parse(fs.readFileSync(path.join(dir(r), "cli-result.json"), "utf8"));
      assert.equal(fs.realpathSync(raw.cwd), fs.realpathSync(r.sandbox), "the subject runs from its sandbox");
      assert.ok(raw.args.includes("--disable-slash-commands"));
    }
    assert.deepEqual(collect({ date: "2026-11-05", runsRoot }), { collected: 2, missing: [] });
    res = await runCli({ date: "2026-11-05", runsRoot, repoRoot: ROOT, command: fake });
    assert.deepEqual([res.ran, res.skipped], [0, 2]);
    res = await runCli({ date: "2026-11-05", runsRoot, repoRoot: ROOT, command: fake, force: true, only: ["03-break-even-continue.haiku.hand"] });
    assert.deepEqual([res.ran, res.skipped], [1, 0]);
    await assert.rejects(runCli({ date: "2026-11-05", runsRoot, repoRoot: ROOT, command: fake, only: ["99"] }), /names no prepared run/);
    await assert.rejects(runCli({ date: "2026-12-31", runsRoot, repoRoot: ROOT, command: fake }), /not found/);
  } finally { rm(work); }
});

test("a run whose CLI prints no JSON is reported as failed and leaves no usage.json", async () => {
  const work = tmpDir("eval-cli-fail");
  const before = process.env.FAKE_CLAUDE_MODE;
  try {
    const { runsRoot, out, dir } = setup(work);
    process.env.FAKE_CLAUDE_MODE = "error";
    const res = await runCli({ date: "2026-11-05", runsRoot, repoRoot: ROOT, command: fake });
    assert.equal(res.failed.length, 1);
    assert.match(res.failed[0].error, /exit 3, no JSON/);
    assert.equal(fs.existsSync(path.join(dir(out.runs[0]), "usage.json")), false);
    assert.match(fs.readFileSync(path.join(dir(out.runs[0]), "cli-stderr.txt"), "utf8"), /boom/);
  } finally { if (before === undefined) delete process.env.FAKE_CLAUDE_MODE; else process.env.FAKE_CLAUDE_MODE = before; rm(work); }
});
