// The gate's evaluation step (checkEval in scripts/check.mjs) against a
// temporary copy of the tree with three faults seeded in three scenarios: a
// figure that disagrees with the calculator, a guardrail the vocabulary does
// not allow, and a banned word in a brief. One gate run must name all three.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { copyTree, rm, run, tmpDir } from "./fixtures/helpers.mjs";

function edit(tree, id, fn) {
  const file = path.join(tree, "eval", "scenarios", `${id}.json`);
  const s = JSON.parse(fs.readFileSync(file, "utf8"));
  fn(s);
  fs.writeFileSync(file, JSON.stringify(s, null, 2) + "\n");
}

test("the gate names a wrong figure, a guardrail outside the vocabulary and a banned word in a brief", () => {
  const tree = tmpDir("gate-eval");
  try {
    copyTree(tree);
    edit(tree, "03-break-even-continue", (s) => { s.expected.calculator.cost_continue = "0.99"; });
    edit(tree, "05-class-up-eval-design", (s) => { s.expected.guardrails = [4]; });
    edit(tree, "06-haiku-long-context-tier", (s) => { s.brief.push("A robust chore."); });
    const r = run(path.join(tree, "scripts", "check.mjs"), [], { cwd: tree });
    assert.equal(r.status, 1, r.out);
    assert.match(r.stdout, /03-break-even-continue\.json: expected\.calculator\.cost_continue is "0\.99", the calculator gives "0\.98"/);
    assert.match(r.stdout, /05-class-up-eval-design\.json: expected\.guardrails must be a sorted list/);
    assert.match(r.stdout, /06-haiku-long-context-tier\.json: brief, title or notes: banned word "robust"/);
    assert.match(r.stdout, /3 finding\(s\)/);
  } finally { rm(tree); }
});
