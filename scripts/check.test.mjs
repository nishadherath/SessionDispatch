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
      // Past the table limit the gate is allowed exactly one finding.
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
    const latest = fs.readdirSync(path.join(tree, "pricing")).filter((n) => /^\d{4}-\d{2}-\d{2}\.json$/.test(n)).sort().pop();
    const { max_age_days } = JSON.parse(fs.readFileSync(path.join(tree, "pricing", latest), "utf8"));
    assert.match(r.stdout, new RegExp(`past max_age_days ${max_age_days}`));
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

test("a drifted ledger header or a missing Measured column exits 1 and names the file", () => {
  withTree("gate-ledger", (tree) => {
    const ledger = path.join(tree, "docs", "dispatch", "calibration.md");
    fs.writeFileSync(ledger, fs.readFileSync(ledger, "utf8").replace("| Measured USD |", "| Cost |"));
    const tpl = path.join(tree, "templates", "handoff.md");
    fs.writeFileSync(tpl, fs.readFileSync(tpl, "utf8").replace("| Calls measured | Measured USD |", "| Calls | USD |"));
    const r = runGate(tree);
    assert.equal(r.status, 1, r.out);
    assert.match(r.stdout, /calibration.md: the ledger header row/);
    assert.match(r.stdout, /handoff.md: the cost projection lacks the Measured columns/);
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

// F1-3: the recompute reads the term lines inside Step A's block and Step B's cost column.
function mutateExample(tree, name, from, to) {
  const file = path.join(tree, "examples", name);
  const text = fs.readFileSync(file, "utf8");
  assert.ok(text.includes(from), `fixture line not found: ${from}`);
  fs.writeFileSync(file, text.replace(from, to));
}

test("a term line, a product line and a Step B cost that disagree with the inputs each exit 1", () => {
  withTree("gate-terms", (tree) => {
    mutateExample(tree, "2026-10-29-sessiondispatch-stage-0b.md", "T*C_fresh*p_cr                  = 3.437", "T*C_fresh*p_cr                  = 3.447");
    mutateExample(tree, "2026-10-29-sessiondispatch-stage-0b.md", "| 9.37 USD (T 60", "| 9.47 USD (T 60");
    mutateExample(tree, "2026-10-27-fork-graft-stage-26.md", "+ 60*3,000*12.5e-6    = 2.250   (fresh input written to cache)", "+ 60*3,000*12.5e-6    = 2.350   (fresh input written to cache)");
    const r = runGate(tree);
    assert.equal(r.status, 1, r.out);
    assert.match(r.stdout, /Step A: cost_fresh term 3 \(cache reads\) states 3\.447, the inputs give 3\.4374/);
    assert.match(r.stdout, /Step B: piece "Stage O1[^"]*" costs 9\.47 USD, the inputs give 9\.3697 on claude-opus-5-5/);
    assert.match(r.stdout, /Step A: cost_continue term "60\*3,000\*12\.5e-6" multiplies to 2\.25000, the line states 2\.350/);
  });
});

// Stage O5: the coordinator term in the example of formula 2026-11-10, in all three places it is stated.
test("a wrong cost_coord figure in the Tsunami example exits 1, in the term line, the plan line and the sonnet line", () => {
  withTree("gate-coord", (tree) => {
    const ex = "2026-11-02-tsunami-rebalancing-dashboard.md";
    mutateExample(tree, ex, "  cost_coord                      = 8.562", "  cost_coord                      = 8.662");
    mutateExample(tree, ex, "  Step B, 4 pieces, 120 turns     = 42.35 USD", "  Step B, 4 pieces, 120 turns     = 42.45 USD");
    mutateExample(tree, ex, "fresh 2.14, split 4.58, Step B 11.09 USD", "fresh 2.14, split 4.58, Step B 11.19 USD");
    const r = runGate(tree);
    assert.equal(r.status, 1, r.out);
    assert.match(r.stdout, /Step A: cost_fresh term 8 \(cost_coord\) states 8\.662, the inputs give 8\.5621/);
    assert.match(r.stdout, /Step A: cost_coord Step B is 42\.45 USD, the inputs give 42\.3485 on claude-fable-5-1/);
    assert.match(r.stdout, /Step A: cost_coord Step B on claude-sonnet-5-5 is 11\.19 USD, the inputs give 11\.0929/);
    assert.match(r.stdout, /3 finding\(s\)/);
  });
});

test("F7-6: a wrong coordination row, plan total or draft margin in the Tsunami example exits 1", () => {
  withTree("gate-f7-6", (tree) => {
    const ex = "2026-11-02-tsunami-rebalancing-dashboard.md";
    mutateExample(tree, ex, "| throughout | To 30 x 4 pieces: 42.35 USD |", "| throughout | To 30 x 4 pieces: 42.95 USD |"); // M12
    mutateExample(tree, ex, "Pieces 33.36 USD, cost_coord 42.35 USD, plan 75.71 USD.", "Pieces 33.36 USD, cost_coord 42.35 USD, plan 76.71 USD."); // M13
    mutateExample(tree, ex, "Draft verdict: continue, by cost, margin 1.61 USD (10.2 percent", "Draft verdict: continue, by cost, margin 1.71 USD (11.2 percent"); // M18
    const r = runGate(tree);
    assert.equal(r.status, 1, r.out);
    assert.match(r.stdout, /Step B: the coordination row is 42\.95 USD, To 30 x 4 pieces gives 42\.3485 on claude-fable-5-1/);
    assert.match(r.stdout, /Step B: "plan 76\.71 USD" but pieces 33\.36 plus cost_coord 42\.35 is 75\.71/);
    assert.match(r.stdout, /Draft verdict: margin 1\.71 USD, the inputs give 1\.6135/);
    assert.match(r.stdout, /Draft verdict: 11\.2 percent of the smaller, the inputs give 10\.16/);
  });
});

test("the O6 example at the wrong cache lifetime, or without its ttl row, exits 1", () => {
  withTree("gate-ttl", (tree) => {
    mutateExample(tree, "2026-11-10-sessiondispatch-stage-o6.md", "| Cache lifetime ttl | 1h |", "| Cache lifetime ttl | 5m |");
    const r = runGate(tree);
    assert.equal(r.status, 1, r.out);
    assert.match(r.stdout, /Step A: cost_continue is 29\.58 USD, the inputs give 26\.7024 under formula 2026-11-11/);
  });
  withTree("gate-ttl-row", (tree) => {
    mutateExample(tree, "2026-11-10-sessiondispatch-stage-o6.md", "| Cache lifetime ttl | 1h |", "| Cache lifetime | 1h |");
    const r = runGate(tree);
    assert.equal(r.status, 1, r.out);
    assert.match(r.stdout, /"Cache lifetime ttl" must be stated under formula 2026-11-11/);
  });
});

test("an example under formula 2026-11-10 without its To row exits 1", () => {
  withTree("gate-coord-row", (tree) => {
    mutateExample(tree, "2026-11-02-tsunami-rebalancing-dashboard.md", "| Coordinating turns To | 30 per piece |", "| Coordinating turns | 30 per piece |");
    const r = runGate(tree);
    assert.equal(r.status, 1, r.out);
    assert.match(r.stdout, /"Coordinating turns To" must be stated under formula 2026-11-10/);
  });
});

test("a term line count that disagrees with the formula exits 1", () => {
  withTree("gate-term-count", (tree) => {
    mutateExample(tree, "2026-10-29-sessiondispatch-stage-0b.md", "  M*C_cont*(p_cw - p_cr)          = 0.000   (cache misses, M 0)\n", "");
    const r = runGate(tree);
    assert.equal(r.status, 1, r.out);
    assert.match(r.stdout, /Step A: cost_continue states 4 term line\(s\), the formula gives 5/);
  });
});

// Stage S7: the model notes (models/<model id>.md), each seeded fault in a temporary copy of the tree.
function mutateNote(tree, from, to) {
  const file = path.join(tree, "models", "claude-fable-5-2.md");
  const text = fs.readFileSync(file, "utf8");
  assert.ok(text.includes(from), `fixture text not found: ${from}`);
  fs.writeFileSync(file, text.replace(from, to));
}

test("a model note for a model id that the price table does not list exits 1 and names the id", () => {
  withTree("gate-note-model", (tree) => {
    mutateNote(tree, "model: claude-fable-5-2", "model: claude-fable-9-9");
    const r = runGate(tree);
    assert.equal(r.status, 1, r.out);
    assert.match(r.stdout, /claude-fable-5-2\.md: model claude-fable-9-9 is not in pricing\/\d{4}-\d{2}-\d{2}\.json/);
    assert.match(r.stdout, /the file name must be the front matter's model plus \.md, found model claude-fable-9-9/);
  });
});

test("a model note with effort_start ultra exits 1 and names the accepted values", () => {
  withTree("gate-note-effort", (tree) => {
    mutateNote(tree, "effort_start: high", "effort_start: ultra");
    const r = runGate(tree);
    assert.equal(r.status, 1, r.out);
    assert.match(r.stdout, /claude-fable-5-2\.md: effort_start must be one of low, medium, high, xhigh, max, found "ultra"/);
    assert.match(r.stdout, /1 finding\(s\)/);
  });
});

test("a model note of more than 5,000 characters exits 1 and says how many to cut", () => {
  withTree("gate-note-size", (tree) => {
    const file = path.join(tree, "models", "claude-fable-5-2.md");
    const text = fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
    const pad = "A filler line of ordinary prose that adds weight to the note.\n".repeat(Math.ceil((5001 - text.length) / 62) + 1);
    fs.writeFileSync(file, text + "\n" + pad);
    const total = fs.readFileSync(file, "utf8").length;
    assert.ok(total > 5000, "the fixture must exceed the limit");
    const r = runGate(tree);
    assert.equal(r.status, 1, r.out);
    assert.match(r.stdout, new RegExp(`claude-fable-5-2\.md: ${total} characters, over the limit of 5000; cut ${total - 5000} characters`));
  });
});
