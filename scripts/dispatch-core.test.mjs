// The coordinator term of formula 2026-11-10 (Stage O5, D12 option A') and the cache
// lifetime of formula 2026-11-11 (Stage O6, D15 option A), tested on the pure functions
// of dispatch-core.mjs against the repository's table of 2026-10-29, the table the
// Tsunami stage and the example of Stage O1 were priced with. The older formulas must
// give the figures their records state, whatever To and ttl say.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  FORMULAS, FORMULA_IN_FORCE, COORD_F_DEFAULT, COORD_O_DEFAULT, validateInputs, findModel, modelForClass,
  sessionTurns, freshSession, coordCost, continueSide, freshSide, splitCost, stepA, breakEven, roundTo,
  effectiveTtl, missingPrices, ratesAt, planCoord,
} from "./dispatch-core.mjs";
import { ROOT } from "./fixtures/helpers.mjs";

const table = JSON.parse(fs.readFileSync(path.join(ROOT, "pricing", "2026-10-29.json"), "utf8"));
const fable = findModel(table, "claude-fable-5-1");
const opus = findModel(table, "claude-opus-5-5");
const sonnet = modelForClass(table, "anthropic", "sonnet");

// The inputs of examples/2026-10-29-sessiondispatch-stage-0b.md.
const stage0b = { W: 1000000, K: 970000, C0: 254081, compacted: false, T: 60, F: 3000, O: 3000, B: 86450, R: 20000, H: 2500, M: 0, L: 0, Ta: 15, Ra: 30000 };
const total = (x) => roundTo(x.total, 2);
const sum = (s) => s.reads + s.writes + s.output + s.misses;

test("four formulas, the lifetime's in force", () => {
  assert.deepEqual([...FORMULAS], ["2026-10-27", "2026-10-29", "2026-11-10", "2026-11-11"]);
  assert.equal(FORMULA_IN_FORCE, "2026-11-11");
});

// Formula 2026-11-11. The table of 2026-10-29 has no cache_write_1h; these rows add the
// page's figure (2 times input, read 2026-11-10) so the lifetime can be priced by hand.
const with1h = (m) => ({ ...m, cache_write_1h: m.input * 2 });
const sonnet1h = with1h(sonnet);
// Scenario 23: Sonnet to Sonnet, C0 180,000, B 86,450, R 15,000, H 2,500, T 45, F 3,000, O 1,500.
const sc23 = { W: 1000000, K: 970000, C0: 180000, compacted: true, T: 45, F: 3000, O: 1500, B: 86450, R: 15000, H: 2500, M: 0, L: 0 };

test("ttl is 5m or 1h, or left out for 5m; it is ignored before formula 2026-11-11", () => {
  const ok = { ...stage0b, formula: FORMULA_IN_FORCE };
  assert.deepEqual(validateInputs({ ...ok, ttl: "1h" }), []);
  assert.deepEqual(validateInputs({ ...ok, ttl: "5m" }), []);
  assert.match(validateInputs({ ...ok, ttl: "30m" }).join("\n"), /ttl must be 5m or 1h .* found "30m"/);
  assert.equal(effectiveTtl({ formula: FORMULA_IN_FORCE }), "5m");
  assert.equal(effectiveTtl({ formula: FORMULA_IN_FORCE, ttl: "1h" }), "1h");
  assert.equal(effectiveTtl({ formula: "2026-11-10", ttl: "1h" }), "5m");
});

test("under 1h a row without cache_write_1h is a null price, and ratesAt refuses it", () => {
  assert.deepEqual(missingPrices(sonnet), []);
  assert.deepEqual(missingPrices(sonnet, "1h"), ["cache_write_1h"]);
  assert.deepEqual(missingPrices(sonnet1h, "1h"), []);
  const haiku = { id: "h", class: "haiku", input: 0.1, output: 0.5, cache_read: 0.01, cache_write: 0.125, cache_write_1h: 0.2, long_context: { threshold_tokens: 100000, input: 0.5, output: 2.5, cache_read: 0.05, cache_write: 0.625 } };
  assert.deepEqual(missingPrices(haiku, "1h"), ["long_context.cache_write_1h"]);
  assert.throws(() => ratesAt(sonnet, 0, "1h"), /has no cache_write_1h for ttl 1h/);
  assert.ok(Math.abs(ratesAt(sonnet1h, 0, "1h").cw - 4e-6) < 1e-15);
  assert.ok(Math.abs(ratesAt(sonnet1h, 0, "5m").cw - 2.5e-6) < 1e-15);
});

test("formula 2026-11-11 at 5m gives what 2026-11-10 gives; at 1h only the write terms move", () => {
  const coordinated = { ...stage0b, To: 30 };
  const a10 = stepA({ ...coordinated, formula: "2026-11-10" }, fable, opus);
  const a11 = stepA({ ...coordinated, formula: FORMULA_IN_FORCE, ttl: "5m" }, fable, opus);
  assert.equal(a11.cont.total, a10.cont.total);
  assert.equal(a11.fresh.total, a10.fresh.total);
  // Scenario 23 on the continue side, by hand: writes T * G * cw, everything else unchanged.
  const c5 = stepA({ ...sc23, formula: FORMULA_IN_FORCE }, sonnet1h, sonnet1h).cont;
  const c1 = stepA({ ...sc23, formula: FORMULA_IN_FORCE, ttl: "1h" }, sonnet1h, sonnet1h).cont;
  assert.ok(Math.abs(c5.writes - 45 * 4500 * 2.5e-6) < 1e-9);
  assert.ok(Math.abs(c1.writes - 45 * 4500 * 4e-6) < 1e-9);
  assert.equal(c1.reads, c5.reads);
  assert.equal(c1.output, c5.output);
});

test("scenario 23 at To 0: T* is 35.5 turns at 5m and 54.8 at 1h (F7-1, by hand)", () => {
  // (H * p_out + (B + R) * p_cw) / ((C0 - B - R) * p_cr): (0.025 + 101,450 x 2.5e-6) / (78,550 x 0.1e-6) = 35.47;
  // with p_cw 4e-6: (0.025 + 0.4058) / 0.007855 = 54.84.
  for (const [ttl, want] of [["5m", 35.47], ["1h", 54.84]]) {
    const inp = { ...sc23, compacted: false, formula: FORMULA_IN_FORCE, ttl, To: 0 };
    const be = breakEven(inp, sonnet1h, sonnet1h, stepA(inp, sonnet1h, sonnet1h));
    assert.equal(roundTo(be.turns, 2), want);
  }
});

test("a coordinator the plan names is another session from formula 2026-11-11, even on the current model (F7-3)", () => {
  const inp = { ...stage0b, To: 30 };
  const here = planCoord({ ...inp, formula: FORMULA_IN_FORCE }, fable, undefined, 1);
  const named = planCoord({ ...inp, formula: FORMULA_IN_FORCE }, fable, fable, 1);
  const before = planCoord({ ...inp, formula: "2026-11-10" }, fable, fable, 1);
  assert.equal(here.continues, true);
  assert.equal(named.continues, false);
  assert.equal(named.cStart, stage0b.B + stage0b.H);
  assert.equal(before.continues, true, "the records of 2026-11-10 named the current model for this session");
  assert.ok(named.total < here.total, "a fresh Fable coordinator reads B + H, not C0 + H");
});

test("To is a whole number of turns per piece, 0 or more; Fo and Oo are token counts", () => {
  const ok = { ...stage0b, formula: FORMULA_IN_FORCE };
  assert.deepEqual(validateInputs({ ...ok, To: 0 }), []);
  assert.deepEqual(validateInputs({ ...ok, To: 30, Fo: 3000, Oo: 3000 }), []);
  assert.deepEqual(validateInputs(ok), [], "To may be left out; it then counts as 0");
  assert.match(validateInputs({ ...ok, To: 2.5 }).join("\n"), /To must be a whole number of turns, 0 or more, per piece, found 2\.5/);
  assert.match(validateInputs({ ...ok, To: -1 }).join("\n"), /To must be a non-negative number or left out, found -1/);
  assert.match(validateInputs({ ...ok, Oo: "x" }).join("\n"), /Oo must be a non-negative number or left out/);
});

test("formula 2026-10-29 still gives the Stage O1 example's 20.01, 9.49 and 7.23 USD, with or without To", () => {
  for (const extra of [{}, { To: 30 }]) {
    const inp = { ...stage0b, ...extra, formula: "2026-10-29" };
    const a = stepA(inp, fable, opus);
    assert.equal(total(a.cont), 20.01);
    assert.equal(total(a.fresh), 9.49);
    assert.equal(total(splitCost(inp, fable, sonnet, opus)), 7.23);
  }
});

test("cost_coord on the current model is the continue side's arithmetic from C0 + H", () => {
  const inp = { ...stage0b, formula: FORMULA_IN_FORCE, To: 30 };
  const c = coordCost(inp, fable, 2, true);
  const G = COORD_F_DEFAULT + COORD_O_DEFAULT;
  const want = sessionTurns(fable, { cStart: stage0b.C0 + stage0b.H, T: 60, G, O: COORD_O_DEFAULT, M: 0 });
  assert.equal(c.turns, 60);
  assert.equal(c.cStart, stage0b.C0 + stage0b.H);
  assert.equal(c.penaltyCompaction, 0);
  assert.ok(Math.abs(c.total - sum(want)) < 1e-9);
  // Fo and Oo override the writing-heavy defaults.
  const lean = coordCost({ ...inp, Fo: 1000, Oo: 500 }, fable, 2, true);
  assert.ok(Math.abs(lean.total - sum(sessionTurns(fable, { cStart: 256581, T: 60, G: 1500, O: 500, M: 0 }))) < 1e-9);
});

test("cost_coord on another model is a fresh session reading B + H; To 0 costs nothing", () => {
  const inp = { ...stage0b, formula: FORMULA_IN_FORCE, To: 30 };
  const c = coordCost(inp, sonnet, 1, false);
  const want = freshSession(sonnet, { B: stage0b.B, R: stage0b.H, T: 30, G: 6000, O: 3000 });
  assert.equal(c.cStart, stage0b.B + stage0b.H);
  assert.ok(Math.abs(c.total - want.total) < 1e-9);
  assert.equal(coordCost({ ...inp, To: 0 }, sonnet, 4, false).total, 0);
  assert.equal(coordCost({ ...inp, To: undefined }, fable, 4, true).total, 0);
});

test("a coordinator that crosses K pays the continue side's compaction penalty", () => {
  const inp = { ...stage0b, formula: FORMULA_IN_FORCE, To: 40, K: 500000 };
  const c = coordCost(inp, fable, 2, true);
  assert.equal(c.crosses, true);
  assert.ok(Math.abs(c.penaltyCompaction - (stage0b.R * 12.5e-6 + stage0b.H * 50e-6)) < 1e-9);
});

test("under 2026-11-10 the fresh side carries To for 1 piece and the split for 2, at the coordinator's model", () => {
  const old = { ...stage0b, formula: "2026-10-29" };
  const inp = { ...stage0b, formula: FORMULA_IN_FORCE, To: 30 };
  const fOld = freshSide(old, fable, opus), fNew = freshSide(inp, fable, opus);
  assert.ok(Math.abs(fNew.total - fOld.total - coordCost(inp, fable, 1, true).total) < 1e-9);
  assert.ok(Math.abs(fNew.coord.total - coordCost(inp, fable, 1, true).total) < 1e-9);
  const sOld = splitCost(old, fable, sonnet, opus), sNew = splitCost(inp, fable, sonnet, opus);
  assert.ok(Math.abs(sNew.total - sOld.total - coordCost(inp, fable, 2, true).total) < 1e-9);
  // A sonnet coordinator: a fresh session, priced at sonnet rates.
  const sSon = splitCost(inp, fable, sonnet, opus, sonnet);
  assert.ok(Math.abs(sSon.total - sOld.total - coordCost(inp, sonnet, 2, false).total) < 1e-9);
  assert.ok(sSon.total < sNew.total);
  // To 0: the formulas agree.
  assert.ok(Math.abs(freshSide({ ...inp, To: 0 }, fable, opus).total - fOld.total) < 1e-9);
  assert.ok(Math.abs(splitCost({ ...inp, To: 0 }, fable, sonnet, opus).total - sOld.total) < 1e-9);
});

test("T* adds the fresh plan's cost_coord to its fixed cost", () => {
  const same = { ...stage0b, formula: FORMULA_IN_FORCE, To: 4 };
  const a = stepA(same, fable, fable);
  const be = breakEven(same, fable, fable, a);
  const r = 0.25e-6, cw = 12.5e-6, out = 50e-6;
  const fixed = same.H * out + (same.B + same.R) * cw + a.fresh.coord.total;
  assert.ok(Math.abs(be.fixed - fixed) < 1e-9);
  assert.ok(Math.abs(be.turns - fixed / ((same.C0 - same.B - same.R) * r)) < 1e-9);
});

// F8-3 (2026-11-10): the compaction penalty is a write term too. Two seeded faults that priced
// it at the 5-minute figure under 1h (one on each side) passed every test and the gate, so both
// are pinned here by hand on the Sonnet row: R 20,000 x 4e-6 + H 2,500 x 10e-6 = 0.105 USD at
// 1h, and 20,000 x 2.5e-6 + 0.025 = 0.075 at 5m.
test("under 1h the compaction penalty is priced at the 1-hour write, for the continue side and for a coordinator (F8-3)", () => {
  const inp = { ...stage0b, formula: FORMULA_IN_FORCE, C0: 900000, T: 30, To: 10 }; // 900,000 + 30 x 6,000 is past K 970,000
  for (const [ttl, want] of [["1h", 0.105], ["5m", 0.075]]) {
    const cont = continueSide({ ...inp, ttl }, sonnet1h);
    assert.ok(Math.abs(cont.penaltyCompaction - want) < 1e-9, `continue side at ${ttl}: ${cont.penaltyCompaction}`);
    const coord = coordCost({ ...inp, ttl }, sonnet1h, 2, true); // 902,500 + 20 turns x 6,000 is past K
    assert.equal(coord.crosses, true);
    assert.ok(Math.abs(coord.penaltyCompaction - want) < 1e-9, `coordinator at ${ttl}: ${coord.penaltyCompaction}`);
  }
});
