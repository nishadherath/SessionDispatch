// The calculator's command line for formula 2026-11-11 (Stage O6): the cache lifetime
// flag and its null price, the coordinator named as another session, the per-family
// staleness rule of scripts/price-table.mjs, and a fractional turn count refused.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import test from "node:test";
import { ROOT } from "./fixtures/helpers.mjs";

const BASE = ["--W", "1000000", "--K", "970000", "--C0", "400000", "--T", "13", "--F", "2000", "--O", "1000",
  "--B", "86450", "--R", "13550", "--H", "2500", "--M", "0", "--L", "0", "--compacted", "no"];
function calc(args) {
  const r = spawnSync(process.execPath, [path.join(ROOT, "scripts", "dispatch.mjs"), ...BASE, ...args], { cwd: ROOT, encoding: "utf8" });
  return { status: r.status, out: `${r.stdout}${r.stderr}` };
}

test("--ttl 1h prices writes at cache_write_1h and names it; a table without it is a null price (exit 3)", () => {
  const on = calc(["--current", "claude-sonnet-5-5", "--target", "sonnet", "--ttl", "1h", "--today", "2026-11-11"]);
  assert.equal(on.status, 0, on.out);
  assert.match(on.out, /cache_write_1h 4\.00/);
  assert.match(on.out, /T\* = .* = 14\.2 turns/);
  const old = calc(["--current", "claude-sonnet-5-5", "--target", "sonnet", "--ttl", "1h", "--table", "pricing/2026-10-29.json", "--today", "2026-11-10"]);
  assert.equal(old.status, 3, old.out);
  assert.match(old.out, /claude-sonnet-5-5 \(cache_write_1h\) unknown/);
  const bad = calc(["--current", "claude-sonnet-5-5", "--target", "sonnet", "--ttl", "30m", "--today", "2026-11-11"]);
  assert.equal(bad.status, 1, bad.out);
  assert.match(bad.out, /ttl must be 5m or 1h/);
});

test("under formula 2026-10-29 or 2026-11-10 --ttl changes nothing", () => {
  for (const formula of ["2026-10-29", "2026-11-10"]) {
    const a = calc(["--current", "claude-sonnet-5-5", "--target", "sonnet", "--formula", formula, "--today", "2026-11-11"]);
    const b = calc(["--current", "claude-sonnet-5-5", "--target", "sonnet", "--formula", formula, "--ttl", "1h", "--today", "2026-11-11"]);
    assert.equal(a.out, b.out, formula);
  }
});

test("--coordinator <the current model> is another session from formula 2026-11-11; --coordinator this is this session (F7-3)", () => {
  const args = ["--current", "claude-sonnet-5-5", "--target", "sonnet", "--To", "4", "--today", "2026-11-11"];
  const named = calc([...args, "--coordinator", "claude-sonnet-5-5"]);
  const here = calc([...args, "--coordinator", "this"]);
  const dflt = calc(args);
  assert.match(named.out, /coordinator claude-sonnet-5-5 \(sonnet\), another session/);
  assert.match(named.out, /a fresh session from B \+ H = 88,950/);
  assert.match(here.out, /coordinator claude-sonnet-5-5 \(sonnet\), this session/);
  assert.equal(dflt.out, here.out);
  const before = calc([...args, "--coordinator", "claude-sonnet-5-5", "--formula", "2026-11-10"]);
  assert.match(before.out, /, this session/, "the records of 2026-11-10 named the current model for this session");
});

test("the calculator refuses only when a family it needs is stale (exit 2)", () => {
  // pricing/2026-11-10.json: anthropic fetched 2026-11-10, openai 2026-11-04; max_age_days 14.
  const anth = calc(["--current", "claude-sonnet-5-5", "--target", "sonnet", "--today", "2026-11-20"]);
  assert.equal(anth.status, 0, anth.out);
  assert.match(anth.out, /anthropic fetched 2026-11-10 \(10 days of 14\)/);
  const oai = calc(["--current", "gpt-6.1-sol", "--target", "opus", "--today", "2026-11-20"]);
  assert.equal(oai.status, 2, oai.out);
  assert.match(oai.out, /family openai was fetched 2026-11-04, 16 days before 2026-11-20; past max_age_days 14/);
  const late = calc(["--current", "claude-sonnet-5-5", "--target", "sonnet", "--today", "2026-11-25"]);
  assert.equal(late.status, 2, late.out);
});

test("a fractional turn count on a flag is refused, not rounded", () => {
  const r = calc(["--current", "claude-sonnet-5-5", "--target", "sonnet", "--To", "2.5", "--today", "2026-11-11"]);
  assert.equal(r.status, 1, r.out);
  assert.match(r.out, /To must be a whole number of turns/);
});
