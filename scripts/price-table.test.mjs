// Stage O6a: the price-table rules (scripts/price-table.mjs), run against the real table in
// force, against seeded faults, and against the two commands that import them. Expected
// exit codes are worked from the table's own dates in the comments, not read back.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { ROOT, run } from "./fixtures/helpers.mjs";
import { modelForClass } from "./dispatch-core.mjs";
import {
  PRICE_KEYS, familyAgeDays, localToday, modelStaleness, newestTableFile, staleFamilies, validateTable,
} from "./price-table.mjs";

const TABLE_FILE = "2026-11-10.json";
const real = JSON.parse(fs.readFileSync(path.join(ROOT, "pricing", TABLE_FILE), "utf8"));
const clone = () => structuredClone(real);
const check = (t, today = "2026-11-10", fileName = TABLE_FILE) => validateTable(t, { fileName, today });
const day = (n) => `2026-11-${String(n).padStart(2, "0")}`;

test("the key list and the local day", () => {
  assert.deepEqual(PRICE_KEYS, ["input", "output", "cache_read", "cache_write"]);
  assert.equal(localToday(new Date(2026, 10, 9, 23, 59)), "2026-11-09"); // local fields, not UTC
  assert.equal(localToday(new Date(2026, 0, 5, 0, 1)), "2026-01-05");
});

test("the real table is valid on its own day, with no stale family", () => {
  const r = check(real);
  assert.deepEqual(r.errors, []);
  assert.deepEqual(r.stale, []);
  assert.equal(real.max_age_days, 14);
  assert.equal(real.families.anthropic.models["claude-haiku-5-5"].cache_write_1h, 0.2);
  assert.equal(real.families.anthropic.models["claude-haiku-5-5"].long_context.cache_write_1h, 1);
  assert.equal(real.families.anthropic.models["claude-sonnet-5-5"].cache_write_1h, 4);
  assert.equal(real.families.anthropic.models["claude-opus-5-5"].cache_write_1h, 8);
  assert.equal(real.families.anthropic.models["claude-fable-5-2"].cache_write_1h, 16);
  assert.deepEqual(real.families.anthropic.models["claude-fable-5-1"], { class: "fable", input: 10, output: 50, cache_read: 0.25, cache_write: 12.5, cache_write_1h: 20 });
  assert.equal(real.families.openai.models["gpt-6-sol"].cache_write_1h, undefined); // absent: the row offers none
});

test("the class fable resolves to the first row listed, claude-fable-5-2", () => {
  assert.equal(modelForClass(real, "anthropic", "fable").id, "claude-fable-5-2");
  assert.deepEqual(Object.keys(real.families.anthropic.models).slice(-2), ["claude-fable-5-2", "claude-fable-5-1"]);
});

test("newestTableFile returns the newest name as an absolute path, null for an empty or missing folder", () => {
  const f = newestTableFile(path.join(ROOT, "pricing"));
  assert.ok(path.isAbsolute(f));
  assert.match(path.basename(f), /^\d{4}-\d{2}-\d{2}\.json$/);
  assert.equal(newestTableFile(path.join(ROOT, "scripts", "fixtures", "no-such-folder")), null);
  assert.equal(newestTableFile(path.join(ROOT, "docs", "handoffs")), null); // markdown only
});

test("age counts from fetched, whole days; null fetched and unpriced families are never stale", () => {
  assert.equal(familyAgeDays(real, "anthropic", "2026-11-10"), 0);
  assert.equal(familyAgeDays(real, "openai", "2026-11-10"), 6); // 11-04 to 11-10
  assert.equal(familyAgeDays(real, "google", "2026-11-10"), null);
  // kimi has rows but every figure is null: nothing to go stale
  assert.deepEqual(staleFamilies(real, "2099-01-01").map((s) => s.family).sort(), ["anthropic", "openai"]);
  assert.deepEqual(staleFamilies(real, day(18)), []); // openai 14 days old: not past 14
  assert.deepEqual(staleFamilies(real, day(19)), [{ family: "openai", fetched: "2026-11-04", ageDays: 15 }]);
  // table_date decides nothing: moving it changes no staleness
  const moved = { ...clone(), table_date: "2026-01-01" };
  assert.deepEqual(staleFamilies(moved, day(19)), staleFamilies(real, day(19)));
});

test("modelStaleness names the family and age; an unlisted id is null", () => {
  assert.deepEqual(modelStaleness(real, "gpt-6-sol", day(19)), { stale: true, family: "openai", fetched: "2026-11-04", ageDays: 15 });
  assert.deepEqual(modelStaleness(real, "claude-fable-5-1", day(19)), { stale: false, family: "anthropic", fetched: "2026-11-10", ageDays: 9 });
  assert.equal(modelStaleness(real, "kimi-k3", "2099-01-01").stale, false); // all null: unpriced, not stale
  assert.equal(modelStaleness(real, "no-such-model", day(19)), null);
});

// F8-3 (2026-11-10): two seeded faults passed every test, a model stale at exactly max_age_days
// (the calculator's own check) and an unpriced family counted stale. Worked from the dates:
// anthropic was fetched 2026-11-10, so day 24 is 14 days old (not past 14) and day 25 is 15.
test("a model is stale from the day after max_age_days, and an all-null family never is, whatever its fetched date (F8-3)", () => {
  assert.deepEqual(modelStaleness(real, "claude-sonnet-5-5", day(24)), { stale: false, family: "anthropic", fetched: "2026-11-10", ageDays: 14 });
  assert.deepEqual(modelStaleness(real, "claude-sonnet-5-5", day(25)), { stale: true, family: "anthropic", fetched: "2026-11-10", ageDays: 15 });
  const t = clone();
  t.families.kimi.fetched = "2026-01-01"; // rows listed, every figure null: a fetched date gives them nothing to go stale
  assert.deepEqual(check(t).errors, []);
  assert.deepEqual(staleFamilies(t, "2026-11-10"), []);
  assert.equal(modelStaleness(t, "kimi-k3", "2026-11-10").stale, false);
});

// Each seeded fault must fail, and the message must name the field.
const FAULTS = [
  ["a figure as a string", (t) => { t.families.anthropic.models["claude-sonnet-5-5"].input = "2"; }, /claude-sonnet-5-5\.input must be a non-negative number or null, found "2"/],
  ["a negative cache_write_1h", (t) => { t.families.anthropic.models["claude-sonnet-5-5"].cache_write_1h = -4; }, /cache_write_1h must be a non-negative number or null, found -4/],
  ["a negative cache_write_1h in long_context", (t) => { t.families.anthropic.models["claude-haiku-5-5"].long_context.cache_write_1h = -1; }, /long_context\.cache_write_1h must be a non-negative/],
  ["a partial null with fetched set", (t) => { t.families.anthropic.models["claude-opus-5-5"].output = null; }, /1 null price\(s\) although the family was fetched on 2026-11-10/],
  ["a null cache_write_1h with fetched set", (t) => { t.families.anthropic.models["claude-opus-5-5"].cache_write_1h = null; }, /1 null price\(s\) although the family was fetched/],
  ["a future fetched", (t) => { t.families.anthropic.fetched = "2026-11-11"; }, /fetched 2026-11-11 is in the future/],
  ["table_date against the filename", (t) => { t.table_date = "2026-11-09"; }, /table_date 2026-11-09 must equal the filename date 2026-11-10/],
  ["a table_date after today", (t) => { t.table_date = "2026-11-10"; }, /table_date 2026-11-10 is in the future \(today is 2026-11-09\)/, "2026-11-09"],
  ["a numeric figure beside a null fetched", (t) => { t.families.openai.fetched = null; }, /holds a numeric figure but fetched is null/],
  ["a missing figure", (t) => { delete t.families.anthropic.models["claude-sonnet-5-5"].output; }, /output must be a non-negative number or null, found nothing/],
  ["a zero long_context threshold", (t) => { t.families.anthropic.models["claude-haiku-5-5"].long_context.threshold_tokens = 0; }, /threshold_tokens must be a positive integer, found 0/],
  ["a bad class", (t) => { t.families.anthropic.models["claude-sonnet-5-5"].class = "medium"; }, /class must be haiku, sonnet, opus, fable or null, found "medium"/],
  ["max_age_days zero", (t) => { t.max_age_days = 0; }, /max_age_days must be a positive integer, found 0/],
  ["a duplicate model id across families", (t) => { t.families.openai.models["claude-sonnet-5-5"] = { class: "sonnet", input: 1, output: 1, cache_read: 1, cache_write: 1 }; }, /more than one place/],
  ["a source that is not https", (t) => { t.families.openai.source = "http://example.com"; }, /source must be the vendor pricing page URL starting https/],
  ["a wrong currency", (t) => { t.currency = "AUD"; }, /currency must be "USD"/],
  ["an impossible table_date", (t) => { t.table_date = "2026-02-30"; }, /table_date must be a valid YYYY-MM-DD date/],
];
for (const [name, mutate, pattern, today] of FAULTS) {
  test(`seeded fault fails: ${name}`, () => {
    const t = clone();
    mutate(t);
    const r = check(t, today ?? "2026-11-10");
    assert.ok(r.errors.some((e) => pattern.test(e)), `no error matched ${pattern}; got ${JSON.stringify(r.errors)}`);
  });
}

test("a null cache_write_1h in a family never fetched is a warning, an absent one is neither", () => {
  const t = clone();
  t.families.kimi.models["kimi-k3"].cache_write_1h = null;
  const r = check(t);
  assert.deepEqual(r.errors, []);
  assert.ok(r.warnings.includes("families.kimi.models.kimi-k3.cache_write_1h is null"));
  assert.ok(!check(real).warnings.some((w) => w.includes("claude-sonnet-5-5")));
});

test("staleness is reported apart from the errors and does not depend on table_date", () => {
  const r = check(real, day(19));
  assert.deepEqual(r.errors, []);
  assert.equal(r.stale.length, 1);
});

// The dated sweep: the module and the installed command agree on every day.
// openai fetched 2026-11-04, max_age_days 14: age 14 on 11-18 (valid), 15 on 11-19 (stale).
test("dated sweep 2026-11-10 to 2026-11-30: module and check-pricing agree (0 to 11-18, 2 from 11-19)", () => {
  for (let n = 10; n <= 30; n++) {
    const today = day(n);
    const r = check(real, today);
    const expected = n >= 19 ? 2 : 0;
    const moduleCode = r.errors.length ? 1 : r.stale.length ? 2 : 0;
    const cmd = run(path.join(ROOT, "scripts", "check-pricing.mjs"), ["--today", today]);
    assert.equal(moduleCode, expected, `module on ${today}`);
    assert.equal(cmd.status, expected, `check-pricing on ${today}: ${cmd.out}`);
  }
});

test("the gate agrees on 2026-11-18 (0), 2026-11-19 (2) and 2026-11-30 (2)", () => {
  for (const [today, expected] of [["2026-11-18", 0], ["2026-11-19", 2], ["2026-11-30", 2]]) {
    const r = run(path.join(ROOT, "scripts", "check.mjs"), ["--today", today]);
    assert.equal(r.status, expected, `gate on ${today}: ${r.out}`);
    if (expected === 2) assert.match(r.stdout, /1 finding\(s\) \(one is the stale table\)/);
  }
});
