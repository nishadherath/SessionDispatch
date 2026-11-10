// The coordinator term of formula 2026-11-10 (Stage O5, D12 option A'), tested on the
// pure functions of dispatch-core.mjs against the repository's table of 2026-10-29, the
// table the Tsunami stage and the example of Stage O1 were priced with. The older two
// formulas must give the figures their records state, whatever To says.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  FORMULAS, FORMULA_IN_FORCE, COORD_F_DEFAULT, COORD_O_DEFAULT, validateInputs, findModel, modelForClass,
  sessionTurns, freshSession, coordCost, freshSide, splitCost, stepA, breakEven, roundTo,
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

test("three formulas, the coordinator's in force", () => {
  assert.deepEqual([...FORMULAS], ["2026-10-27", "2026-10-29", "2026-11-10"]);
  assert.equal(FORMULA_IN_FORCE, "2026-11-10");
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
