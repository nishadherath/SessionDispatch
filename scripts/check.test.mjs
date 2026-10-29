// Exit-code contract of the gate (scripts/check.mjs), run as a child
// process against temporary copies of the tree: 0 green, 2 stale table and
// nothing else, 1 any other finding. The copies keep the repository's own
// price tables, because the gate recomputes every worked example from the
// table that example names; staleness is tested through --today instead.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { addNullPrice, copyTree, FIXTURES, rm, run, tmpDir } from "./fixtures/helpers.mjs";

const runGate = (tree, args = []) => run(path.join(tree, "scripts", "check.mjs"), args, { cwd: tree });

function withTree(label, fn) {
  const tree = tmpDir(label);
  try { copyTree(tree); fn(tree); } finally { rm(tree); }
}

test("the shipped tree is green, or stale and nothing else", () => {
  withTree("gate-shipped", (tree) => {
    const r = runGate(tree);
    if (r.status === 2) {
      // Past the table's 14 days the gate is allowed exactly one finding.
      assert.match(r.stdout, /1 finding\(s\) \(one is the stale table\)/);
    } else {
      assert.equal(r.status, 0, r.out);
      assert.match(r.stdout, /0 finding\(s\)/);
    }
  });
});

test("a stale table exits 2 with that finding only", () => {
  withTree("gate-stale", (tree) => {
    // The clock moves, not the table: every table is stale on this day.
    const r = runGate(tree, ["--today", "2099-12-31"]);
    assert.equal(r.status, 2, r.out);
    assert.match(r.stdout, /past max_age_days 14/);
    assert.match(r.stdout, /1 finding\(s\) \(one is the stale table\)/);
  });
});

test("a null price beside a fetched date exits 1", () => {
  withTree("gate-null", (tree) => {
    addNullPrice(tree);
    const r = runGate(tree);
    assert.equal(r.status, 1, r.out);
    assert.match(r.stdout, /1 null price\(s\) although the family was fetched/);
  });
});

test("an em-dash in a Markdown file exits 1 and names the line", () => {
  withTree("gate-emdash", (tree) => {
    fs.writeFileSync(path.join(tree, "docs", "fixture-note.md"), `# Note\n\nA clause ${String.fromCharCode(0x2014)} and another.\n`);
    const r = runGate(tree);
    assert.equal(r.status, 1, r.out);
    assert.match(r.stdout, /fixture-note\.md: line 3: em-dash/);
  });
});

test("a banned word in a Markdown file exits 1", () => {
  withTree("gate-banned", (tree) => {
    fs.writeFileSync(path.join(tree, "docs", "fixture-note.md"), "# Note\n\nA robust claim.\n");
    const r = runGate(tree);
    assert.equal(r.status, 1, r.out);
    assert.match(r.stdout, /banned word "robust"/);
  });
});

test("a table_date that disagrees with its filename exits 1", () => {
  withTree("gate-name", (tree) => {
    // Renamed to a date that keeps it the newest by name, so the gate reads it.
    const dir = path.join(tree, "pricing");
    const newest = fs.readdirSync(dir).filter((n) => /^\d{4}-\d{2}-\d{2}\.json$/.test(n)).sort().pop();
    fs.renameSync(path.join(dir, newest), path.join(dir, "2099-12-31.json"));
    const r = runGate(tree);
    assert.equal(r.status, 1, r.out);
    assert.match(r.stdout, /must equal the filename date 2099-12-31/);
  });
});

test("an approval without a recorded date exits 1", () => {
  withTree("gate-approval", (tree) => {
    const file = path.join(tree, "docs", "operator-preferences.json");
    const prefs = JSON.parse(fs.readFileSync(file, "utf8"));
    prefs.approvals = { fixture_step: { scope: "a fixture", answer: true, recorded: null } };
    fs.writeFileSync(file, JSON.stringify(prefs, null, 2) + String.fromCharCode(10));
    const r = runGate(tree);
    assert.equal(r.status, 1, r.out);
    assert.match(r.stdout, /approvals[.]fixture_step[.]recorded must be YYYY-MM-DD/);
  });
});

test("the fixtures are valid JSON", () => {
  for (const n of fs.readdirSync(FIXTURES).filter((f) => f.endsWith(".json"))) JSON.parse(fs.readFileSync(path.join(FIXTURES, n), "utf8").replaceAll("@TODAY@", "2020-01-01"));
});
