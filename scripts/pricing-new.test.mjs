// The price-refresh script (scripts/pricing-new.mjs) run from a temporary
// repository layout: it names the new table for the local day, keeps the
// figures, lists the nulls and refuses to overwrite today's file.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { FIXTURES, localDate, ROOT, rm, run, tmpDir } from "./fixtures/helpers.mjs";

// scripts/pricing-new.mjs finds pricing/ relative to its own location, so
// a temp folder with the script and one old table is a complete sandbox.
function sandbox(fn) {
  const dir = tmpDir("pricing");
  try {
    fs.mkdirSync(path.join(dir, "scripts"));
    fs.mkdirSync(path.join(dir, "pricing"));
    fs.copyFileSync(path.join(ROOT, "scripts", "pricing-new.mjs"), path.join(dir, "scripts", "pricing-new.mjs"));
    fn(dir, path.join(dir, "scripts", "pricing-new.mjs"));
  } finally { rm(dir); }
}
const seedOldTable = (dir) => {
  const text = fs.readFileSync(path.join(FIXTURES, "pricing-fresh.json"), "utf8").replaceAll("@TODAY@", "2020-01-01");
  fs.writeFileSync(path.join(dir, "pricing", "2020-01-01.json"), text);
  return text;
};

test("it copies the newest table to the local day with figures unchanged and lists the nulls", () => {
  sandbox((dir, script) => {
    const old = JSON.parse(seedOldTable(dir));
    const r = run(script, [], { cwd: dir });
    assert.equal(r.status, 0, r.out);
    const today = localDate();
    const made = JSON.parse(fs.readFileSync(path.join(dir, "pricing", `${today}.json`), "utf8"));
    assert.equal(made.table_date, today);
    assert.deepEqual({ ...made, table_date: null }, { ...old, table_date: null });
    assert.match(r.stdout, /unfilled: fill from https:\/\/example\.test\/other: fixture-model-b \(class, input, output, cache_read, cache_write\)/);
    assert.match(r.stdout, /1 item\(s\) to fill/);
  });
});

test("it refuses to overwrite today's file and leaves it untouched", () => {
  sandbox((dir, script) => {
    seedOldTable(dir);
    const today = path.join(dir, "pricing", `${localDate()}.json`);
    fs.writeFileSync(today, '{"edited":"by hand"}\n');
    const r = run(script, [], { cwd: dir });
    assert.equal(r.status, 1, r.out);
    assert.match(r.stderr, /exists; edit it rather than starting again/);
    assert.equal(fs.readFileSync(today, "utf8"), '{"edited":"by hand"}\n');
  });
});

test("it fails with the folder named when no table exists", () => {
  sandbox((dir, script) => {
    const r = run(script, [], { cwd: dir });
    assert.equal(r.status, 1, r.out);
    assert.match(r.stderr, /no table in .*pricing to copy from/);
  });
});
