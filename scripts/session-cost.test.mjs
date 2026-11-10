// Stage S6: the transcript pricer. The fixtures are synthetic: three assistant messages
// (one streamed twice, one with a dated model id, one in the long-context tier), a
// malformed line, a user line and a message with no usage, plus one sub-agent file.
// The expected figures are worked by hand in the comments, not read back from the script.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { FIXTURES, ROOT, run, tmpDir, rm } from "./fixtures/helpers.mjs";
import { priceTranscript, findPrice } from "./session-cost.mjs";

const SCRIPT = path.join(ROOT, "scripts", "session-cost.mjs");
const TRANSCRIPT = path.join(FIXTURES, "session-transcript.jsonl");
const SUBAGENT = path.join(FIXTURES, "session-subagent.jsonl");
const table = {
  table_date: "2026-11-10", max_age_days: 8,
  families: { f: { models: {
    "model-big": { class: "opus", input: 4, output: 20, cache_read: 0.2, cache_write: 5 },
    "model-small": { class: "haiku", input: 1, output: 5, cache_read: 0.1, cache_write: 1.25,
      long_context: { threshold_tokens: 100000, input: 5, output: 25, cache_read: 0.5, cache_write: 6.25 } },
  } } },
};
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} is not ${b}`);

test("a dated model id takes the row of the longest id that prefixes it; an unknown id takes none", () => {
  assert.equal(findPrice(table, "model-big-20261101").id, "model-big");
  assert.equal(findPrice(table, "model-small").id, "model-small");
  assert.equal(findPrice(table, "model-other"), null);
});

test("calls are counted once per message id and priced per model", () => {
  const r = priceTranscript(TRANSCRIPT, table);
  assert.equal(r.calls, 3);
  // big, 2 calls: input 5, write 42,000, read 40,000, output 1,300:
  //   (5*4 + 42000*5 + 40000*0.2 + 1300*20) / 1e6 = 244,020 / 1e6
  assert.deepEqual(r.models["model-big"].tokens, { input: 5, cacheWrite: 42000, cacheRead: 40000, output: 1300 });
  near(r.models["model-big"].cost, 0.24402);
  // small, 1 call, prompt 151,001 tokens, above 100,000, so the long-context row:
  //   (1*5 + 1000*6.25 + 150000*0.5 + 300*25) / 1e6 = 88,755 / 1e6
  near(r.models["model-small"].cost, 0.088755);
  near(r.cost, 0.332775);
  assert.deepEqual(r.unpriced, []);
});

test("context at the last call, the largest context, and the per-call averages", () => {
  const r = priceTranscript(TRANSCRIPT, table);
  assert.equal(r.lastContext, 151001);
  assert.equal(r.maxContext, 151001);
  assert.equal(r.totals.cacheWrite, 43000);
  near(r.cacheWritePerCall, 43000 / 3);
  near(r.cacheWritePerCallAfterFirst, 3000 / 2); // the first call writes the base, not growth
  near(r.outputPerCall, 1600 / 3);
});

test("a model with no row is listed unpriced and adds nothing to the cost", () => {
  const partial = { ...table, families: { f: { models: { "model-big": table.families.f.models["model-big"] } } } };
  const r = priceTranscript(TRANSCRIPT, partial);
  assert.deepEqual(r.unpriced, ["model-small"]);
  near(r.cost, 0.24402);
});

test("the command prices a file with its sub-agents listed apart, and --json says the same", () => {
  const dir = tmpDir("sc");
  try {
    const tablePath = path.join(dir, "t.json");
    fs.writeFileSync(tablePath, JSON.stringify(table));
    const home = path.join(dir, "p", "proj");
    fs.mkdirSync(path.join(home, "sess1", "subagents"), { recursive: true });
    fs.copyFileSync(TRANSCRIPT, path.join(home, "sess1.jsonl"));
    fs.copyFileSync(SUBAGENT, path.join(home, "sess1", "subagents", "agent-a.jsonl"));
    // sub-agent, 1 call, prompt 25,010 tokens, short tier: (10 + 6250 + 2000 + 5000) / 1e6 = 0.01326
    const byId = run(SCRIPT, ["sess1", "--table", tablePath, "--projects", path.join(dir, "p"), "--json"]);
    assert.equal(byId.status, 0, byId.out);
    const j = JSON.parse(byId.stdout);
    near(j.main.cost, 0.332775);
    assert.equal(j.subagents.length, 1);
    near(j.subagents[0].cost, 0.01326);
    near(j.total, 0.346035);
    const text = run(SCRIPT, [path.join(home, "sess1.jsonl"), "--table", tablePath]);
    assert.equal(text.status, 0, text.out);
    assert.match(text.stdout, /3 calls/);
    assert.match(text.stdout, /sub-agent agent-a/);
    assert.match(text.stdout, /total 0\.346 USD/);
  } finally { rm(dir); }
});

test("an unknown session id or a missing file exits 1 and names the fix; an unpriced model exits 3", () => {
  const dir = tmpDir("sc");
  try {
    const tablePath = path.join(dir, "t.json");
    fs.writeFileSync(tablePath, JSON.stringify(table));
    const none = run(SCRIPT, ["no-such-id", "--table", tablePath, "--projects", dir]);
    assert.equal(none.status, 1);
    assert.match(none.out, /no-such-id/);
    const partial = path.join(dir, "p.json");
    fs.writeFileSync(partial, JSON.stringify({ ...table, families: { f: { models: { "model-big": table.families.f.models["model-big"] } } } }));
    const gap = run(SCRIPT, [TRANSCRIPT, "--table", partial]);
    assert.equal(gap.status, 3);
    assert.match(gap.out, /model-small/);
  } finally { rm(dir); }
});
