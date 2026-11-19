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
const T10 = ["--table", "pricing/2026-11-10.json"];
function calc(args) {
  const r = spawnSync(process.execPath, [path.join(ROOT, "scripts", "dispatch.mjs"), ...BASE, ...args], { cwd: ROOT, encoding: "utf8" });
  return { status: r.status, out: `${r.stdout}${r.stderr}` };
}

test("--ttl 1h prices writes at cache_write_1h and names it; a table without it is a null price (exit 3)", () => {
  const on = calc([...T10, "--current", "claude-sonnet-5-5", "--target", "sonnet", "--ttl", "1h", "--today", "2026-11-11"]);
  assert.equal(on.status, 0, on.out);
  assert.match(on.out, /cache_write_1h 4\.00/);
  assert.match(on.out, /T\* = .* = 14\.2 turns/);
  const old = calc(["--current", "claude-sonnet-5-5", "--target", "sonnet", "--ttl", "1h", "--table", "pricing/2026-10-29.json", "--today", "2026-11-10"]);
  assert.equal(old.status, 3, old.out);
  assert.match(old.out, /claude-sonnet-5-5 \(cache_write_1h\) unknown/);
  const bad = calc([...T10, "--current", "claude-sonnet-5-5", "--target", "sonnet", "--ttl", "30m", "--today", "2026-11-11"]);
  assert.equal(bad.status, 1, bad.out);
  assert.match(bad.out, /ttl must be 5m or 1h/);
});

test("under formula 2026-10-29 or 2026-11-10 --ttl changes nothing", () => {
  for (const formula of ["2026-10-29", "2026-11-10"]) {
    const a = calc([...T10, "--current", "claude-sonnet-5-5", "--target", "sonnet", "--formula", formula, "--today", "2026-11-11"]);
    const b = calc([...T10, "--current", "claude-sonnet-5-5", "--target", "sonnet", "--formula", formula, "--ttl", "1h", "--today", "2026-11-11"]);
    assert.equal(a.out, b.out, formula);
  }
});

test("--coordinator <the current model> is another session from formula 2026-11-11; --coordinator this is this session (F7-3)", () => {
  const args = [...T10, "--current", "claude-sonnet-5-5", "--target", "sonnet", "--To", "4", "--today", "2026-11-11"];
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
  const anth = calc([...T10, "--current", "claude-sonnet-5-5", "--target", "sonnet", "--today", "2026-11-20"]);
  assert.equal(anth.status, 0, anth.out);
  assert.match(anth.out, /anthropic fetched 2026-11-10 \(10 days of 14\)/);
  const oai = calc([...T10, "--current", "gpt-6.1-sol", "--target", "opus", "--today", "2026-11-20"]);
  assert.equal(oai.status, 2, oai.out);
  assert.match(oai.out, /family openai was fetched 2026-11-04, 16 days before 2026-11-20; past max_age_days 14/);
  const late = calc([...T10, "--current", "claude-sonnet-5-5", "--target", "sonnet", "--today", "2026-11-25"]);
  assert.equal(late.status, 2, late.out);
});

test("a fractional turn count on a flag is refused, not rounded", () => {
  const r = calc([...T10, "--current", "claude-sonnet-5-5", "--target", "sonnet", "--To", "2.5", "--today", "2026-11-11"]);
  assert.equal(r.status, 1, r.out);
  assert.match(r.out, /To must be a whole number of turns/);
});

test("google models in 2026-11-20 resolve classes, long-context tier, 1h refusal and staleness", () => {
  const T20 = ["--table", "pricing/2026-11-20.json"];
  const up = calc([...T20, "--current", "gemini-4-hydrogen", "--target", "opus", "--today", "2026-11-20"]);
  assert.equal(up.status, 0, up.out);
  assert.match(up.out, /target gemini-4-neon \(opus\)/);
  assert.match(up.out, /google fetched 2026-11-20 \(0 days of 14\)/);
  const lc = calc([...T20, "--current", "gemini-3.1-pro-preview", "--target", "haiku", "--today", "2026-11-20"]);
  assert.equal(lc.status, 0, lc.out);
  assert.match(lc.out, /target gemini-3\.5-flash-lite \(haiku\)/);
  assert.match(lc.out, /Long-context tier: 13 of 13 turns \(continue\)/);
  const oneH = calc([...T20, "--current", "gemini-4-carbon", "--target", "fable", "--ttl", "1h", "--today", "2026-11-20"]);
  assert.equal(oneH.status, 3, oneH.out);
  const stale = calc([...T20, "--current", "gemini-4-carbon", "--target", "fable", "--today", "2026-12-05"]);
  assert.equal(stale.status, 2, stale.out);
  assert.match(stale.out, /family google was fetched 2026-11-20, 15 days before 2026-12-05; past max_age_days 14/);
});
