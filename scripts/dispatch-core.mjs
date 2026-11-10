// The arithmetic of SKILL.md step 2 (continue, fresh, split, break-even) and
// step 3.3 (cost per piece), shared by the calculator (scripts/dispatch.mjs)
// and the gate (scripts/check.mjs) so the two can never disagree. Pure
// functions over a parsed price table and stated inputs; standard library
// only, Node 20 or later.
//
// Not here: reading files, argument parsing, printing and exit codes (the
// calculator), and the guardrails, which are not arithmetic and stay in the
// record.
//
// Non-obvious: costs are summed turn by turn so a long-context tier applies
// only to the turns past its threshold. Turn t reads C_start + (t - 1/2) * G,
// which makes the per-turn sum equal the closed form T * C_avg of step 1.3
// whenever no tier applies; the gate checks the examples on that identity.
// Three formulas are kept, selected by name, each adding to the one before:
// 2026-10-27 (as the records of that date applied it); 2026-10-29 (growth
// F + O, the miss term, the handoff at the current model); 2026-11-10, in
// force (cost_coord, the session that coordinates a dispatched plan).

export const FORMULA_OLD = "2026-10-27";
export const FORMULA_GROWTH = "2026-10-29";
export const FORMULA_COORD = "2026-11-10";
export const FORMULA_IN_FORCE = FORMULA_COORD;
export const FORMULAS = Object.freeze([FORMULA_OLD, FORMULA_GROWTH, FORMULA_COORD]);
/** Whether formula `f` carries the terms that formula `since` introduced. */
export const formulaHas = (f, since) => FORMULAS.includes(f) && FORMULAS.indexOf(f) >= FORMULAS.indexOf(since);
// SKILL.md step 1.2: the coordinator's turns are writing-heavy (briefs, notes,
// records), 3,000 in and 3,000 out; the one measurement (Tsunami 2026-11-02,
// 6,446 written and 2,825 output per call) supports both. Fo and Oo override.
export const COORD_F_DEFAULT = 3000;
export const COORD_O_DEFAULT = 3000;
// SKILL.md step 2 verdict rule; retuned only on evaluation data (Stage F2).
export const BAND_PERCENT = 10;
export const CLASS_RANK = Object.freeze({ haiku: 1, sonnet: 2, opus: 3, fable: 4 });
const PRICE_KEYS = ["input", "output", "cache_read", "cache_write"];
const USD_PER_TOKEN_PER_TABLE_UNIT = 1e-6; // table figures are USD per million tokens

/** Integer inputs every formula needs, in record order. M, L and To default to 0. */
export const REQUIRED_SYMBOLS = Object.freeze(["W", "K", "C0", "T", "F", "O", "B", "R", "H"]);
export const OPTIONAL_SYMBOLS = Object.freeze(["M", "L", "Ta", "Ra", "To", "Fo", "Oo"]);

/**
 * Validates stated inputs. Returns a list of messages, each naming the input,
 * the value found and what is accepted; empty when the inputs are usable.
 */
export function validateInputs(inp) {
  const errors = [];
  const nonNeg = (k) => typeof inp[k] === "number" && Number.isFinite(inp[k]) && inp[k] >= 0;
  for (const k of REQUIRED_SYMBOLS) if (!nonNeg(k)) errors.push(`${k} must be a non-negative number, found ${JSON.stringify(inp[k])}`);
  for (const k of OPTIONAL_SYMBOLS) if (inp[k] !== undefined && !nonNeg(k)) errors.push(`${k} must be a non-negative number or left out, found ${JSON.stringify(inp[k])}`);
  for (const k of ["T", "Ta"]) if (inp[k] !== undefined && !(Number.isInteger(inp[k]) && inp[k] >= 1)) errors.push(`${k} must be a whole number of turns, 1 or more, found ${JSON.stringify(inp[k])}`);
  if (nonNeg("To") && !Number.isInteger(inp.To)) errors.push(`To must be a whole number of turns, 0 or more, per piece, found ${JSON.stringify(inp.To)}`);
  if (typeof inp.compacted !== "boolean") errors.push(`compacted must be yes or no, found ${JSON.stringify(inp.compacted)}`);
  if (!FORMULAS.includes(inp.formula)) errors.push(`formula must be one of ${FORMULAS.join(", ")}, found ${JSON.stringify(inp.formula)}`);
  return errors;
}

/** The model row for an id, with its family, or null. */
export function findModel(table, id) {
  for (const [family, f] of Object.entries(table.families ?? {})) {
    const m = f.models?.[id];
    if (m) return { id, family, ...m };
  }
  return null;
}

/**
 * The model for a class in one family: that class, else the next class up,
 * never down (step 3.1). Null when the family has none at or above it.
 */
export function modelForClass(table, family, cls) {
  const models = Object.entries(table.families?.[family]?.models ?? {});
  const ranks = Object.entries(CLASS_RANK).filter(([, r]) => r >= CLASS_RANK[cls]).sort((a, b) => a[1] - b[1]);
  for (const [want] of ranks) {
    const hit = models.find(([, m]) => m.class === want);
    if (hit) return { id: hit[0], family, ...hit[1] };
  }
  return null;
}

/** A model id, or a class name resolved in the given family. */
export function resolveModel(table, ref, family) {
  return Object.hasOwn(CLASS_RANK, ref) ? modelForClass(table, family, ref) : findModel(table, ref);
}

/** Names of the figures step 1.4 needs that are null for this model. */
export function missingPrices(model) {
  const missing = PRICE_KEYS.filter((k) => model[k] === null || model[k] === undefined);
  if (model.class === null || model.class === undefined) missing.push("class");
  if (model.long_context) for (const k of PRICE_KEYS) if (model.long_context[k] === null) missing.push(`long_context.${k}`);
  return missing;
}

/** Per-token rates for one request whose prompt is `contextTokens` long. */
export function ratesAt(model, contextTokens) {
  const lc = model.long_context;
  const tier = Boolean(lc) && contextTokens > lc.threshold_tokens;
  const p = tier ? lc : model;
  const u = USD_PER_TOKEN_PER_TABLE_UNIT;
  return { cr: p.cache_read * u, cw: p.cache_write * u, out: p.output * u, tier };
}

/**
 * T turns of one session on one model. Turn t reads cStart + (t - 1/2) * G
 * from cache, writes G new tokens to cache, emits O, and rewrites its whole
 * context M / T times (cache misses spread evenly over the stage).
 */
export function sessionTurns(model, { cStart, T, G, O, M }) {
  const s = { reads: 0, writes: 0, output: 0, misses: 0, tierTurns: 0 };
  for (let t = 1; t <= T; t += 1) {
    const c = cStart + (t - 0.5) * G;
    const r = ratesAt(model, c);
    s.reads += c * r.cr;
    s.writes += G * r.cw;
    s.output += O * r.out;
    s.misses += (M / T) * c * (r.cw - r.cr);
    if (r.tier) s.tierTurns += 1;
  }
  return s;
}

/**
 * A fresh session (or sub-agent) on one model: the first read of B + R at the
 * cache-write rate, T turns from there, and L rediscovery turns priced at the
 * average context. The handoff that precedes it is priced by the caller.
 */
export function freshSession(model, { B, R, T, G, O, M = 0, L = 0 }) {
  const cStart = B + R;
  const first = cStart * ratesAt(model, cStart).cw;
  const turns = sessionTurns(model, { cStart, T, G, O, M });
  const cAvg = cStart + (T * G) / 2;
  const r = ratesAt(model, cAvg);
  const loss = L * (cAvg * r.cr + G * r.cw + O * r.out);
  return { first, ...turns, loss, cAvg, total: first + turns.reads + turns.writes + turns.output + turns.misses + loss };
}

/** Growth per turn and the miss count under a formula. */
function formulaTerms(inp) {
  const isNew = formulaHas(inp.formula, FORMULA_GROWTH);
  return { G: isNew ? inp.F + inp.O : inp.F, M: isNew ? (inp.M ?? 0) : 0, isNew };
}

/**
 * cost_coord (formula 2026-11-10): To turns per piece, times `pieces`, of the
 * session that coordinates a plan after its briefs are written (start, note,
 * verify, merge, record). `continues` true: this session stays, so its turns
 * run from C0 + H on its own model (the continue side's arithmetic); false: a
 * fresh session of `model` that first reads B + H. Growth Fo + Oo, output Oo,
 * no misses; the continue side's compaction penalty when the coordinator would
 * cross K. No turns, no session: 0.
 */
export function coordCost(inp, model, pieces, continues) {
  if (!(Number.isInteger(pieces) && pieces >= 1)) throw new Error(`coordCost: pieces must be a whole number, 1 or more, found ${JSON.stringify(pieces)}`);
  const turns = (inp.To ?? 0) * pieces;
  const Oo = inp.Oo ?? COORD_O_DEFAULT;
  const G = (inp.Fo ?? COORD_F_DEFAULT) + Oo;
  const cStart = continues ? inp.C0 + inp.H : inp.B + inp.H;
  const base = { model: model.id, continues, pieces, turns, G, O: Oo, cStart, crosses: false };
  if (turns === 0) return { ...base, first: 0, reads: 0, writes: 0, output: 0, misses: 0, tierTurns: 0, penaltyCompaction: 0, total: 0 };
  const first = continues ? 0 : cStart * ratesAt(model, cStart).cw;
  const s = sessionTurns(model, { cStart, T: turns, G, O: Oo, M: 0 });
  const crosses = cStart + turns * G > inp.K;
  const cb = ratesAt(model, 0);
  const penaltyCompaction = crosses ? inp.R * cb.cw + inp.H * cb.out : 0;
  return { ...base, crosses, first, ...s, penaltyCompaction, total: first + s.reads + s.writes + s.output + penaltyCompaction };
}

/**
 * The plan's cost_coord at the coordinator (default: this session); To counts
 * as 0 before formula 2026-11-10, so the older formulas reproduce their records.
 */
export function planCoord(inp, current, coordinator, pieces) {
  const c = coordinator ?? current;
  const x = formulaHas(inp.formula, FORMULA_COORD) ? inp : { ...inp, To: 0 };
  return coordCost(x, c, pieces, c.id === current.id);
}

/** Step 1.3: growth and the three context figures, before any price. */
export function growth(inp) {
  const { G, M } = formulaTerms(inp);
  const cEnd = inp.C0 + inp.T * G;
  return { G, M, L: inp.L ?? 0, cEnd, crosses: cEnd > inp.K, cCont: inp.C0 + (inp.T * G) / 2, cFresh: inp.B + inp.R + (inp.T * G) / 2 };
}

/** Step A, `continue`: this session, on its own model, for T more turns. */
export function continueSide(inp, current) {
  const g = growth(inp);
  const ct = sessionTurns(current, { cStart: inp.C0, T: inp.T, G: g.G, O: inp.O, M: g.M });
  // The compaction's re-read and re-statement, at base rates: the summary's
  // size, which decides any tier, is unknown.
  const cb = ratesAt(current, 0);
  const penaltyCompaction = g.crosses ? inp.R * cb.cw + inp.H * cb.out : 0;
  return { model: current.id, ...ct, penaltyCompaction, total: ct.reads + ct.writes + ct.output + ct.misses + penaltyCompaction };
}

/**
 * Step A, `fresh`: the handoff H written by this session at the current
 * model's output rate (formula 2026-10-27: at the target's, as the records of
 * that date did), then a fresh session on the target model, then (formula
 * 2026-11-10) cost_coord for one piece at the coordinator, default this session.
 */
export function freshSide(inp, current, target, coordinator) {
  const g = growth(inp);
  const isNew = formulaHas(inp.formula, FORMULA_GROWTH);
  const handoff = inp.H * (isNew ? ratesAt(current, inp.C0).out : ratesAt(target, 0).out);
  const fs = freshSession(target, { B: inp.B, R: inp.R, T: inp.T, G: g.G, O: inp.O, M: g.M, L: g.L });
  const coord = planCoord(inp, current, coordinator, 1);
  return { model: target.id, handoff, ...fs, coord, total: handoff + fs.total + coord.total };
}

/** Step A in full: both sides and the draft verdict. */
export function stepA(inp, current, target, coordinator) {
  const g = growth(inp);
  const cont = continueSide(inp, current);
  const fresh = freshSide(inp, current, target, coordinator);
  const classUp = CLASS_RANK[target.class] > CLASS_RANK[current.class];
  return { formula: inp.formula, ...g, cont, fresh, classUp, verdict: draftVerdict(cont.total, fresh.total, { compacted: inp.compacted, crosses: g.crosses, classUp }) };
}

/**
 * Break-even turns T* = (H*p_out + (B+R)*p_cw + cost_coord) / ((C0 - B - R) * p_cr'), with
 * p_cr' = p_cr + (M/T)(p_cw - p_cr). Growth cancels: C_cont - C_fresh = C0 - B - R.
 * `settles` lists why it cannot stand in for the full step; empty means T < T*
 * settles step A as continue.
 */
export function breakEven(inp, current, target, a) {
  if (current.id !== target.id) return { turns: null, settles: ["the model changes; compare the totals"] };
  const r = ratesAt(current, 0);
  // cost_coord is a fixed cost of the fresh plan: To does not grow with T.
  const fixed = inp.H * r.out + (inp.B + inp.R) * r.cw + (a.fresh.coord?.total ?? 0);
  const gap = inp.C0 - inp.B - inp.R;
  const perTurn = gap * (r.cr + (a.M / inp.T) * (r.cw - r.cr));
  const turns = gap > 0 ? fixed / perTurn : Infinity;
  const blockers = [];
  if (a.crosses) blockers.push("a compaction is ahead");
  if (inp.compacted) blockers.push("the session has compacted");
  if (a.L > 0) blockers.push("L is above 0");
  if (a.cont.tierTurns > 0 || a.fresh.tierTurns > 0 || ratesAt(current, inp.B + inp.R).tier) blockers.push("a long-context tier applies");
  if (inp.T >= turns) blockers.push(`T ${inp.T} is not under T*`);
  return { turns, fixed, gap, settles: blockers };
}

/**
 * The split: this session writes the brief (size H), a fresh sonnet-class
 * session runs the stage, a fresh opus-class session accepts it over Ta turns
 * reading Ra, and (formula 2026-11-10) cost_coord for its two pieces at the
 * coordinator, default this session. Null when Ta or Ra is not stated.
 */
export function splitCost(inp, current, runner, acceptor, coordinator) {
  if (inp.Ta === undefined || inp.Ra === undefined) return null;
  const { G, M } = formulaTerms(inp);
  const brief = inp.H * ratesAt(current, inp.C0).out;
  const run = freshSession(runner, { B: inp.B, R: inp.R, T: inp.T, G, O: inp.O, M, L: inp.L ?? 0 });
  const accept = freshSession(acceptor, { B: inp.B, R: inp.Ra, T: inp.Ta, G, O: inp.O });
  const coord = planCoord(inp, current, coordinator, 2);
  return { brief, run, accept, coord, runner: runner.id, acceptor: acceptor.id, total: brief + run.total + accept.total + coord.total };
}

/** Step 3.3: one piece priced as a fresh session or sub-agent (no handoff). */
export function pieceCost(inp, model, piece) {
  const { G } = formulaTerms({ ...inp, F: piece.F, O: piece.O });
  return freshSession(model, { B: piece.B ?? inp.B, R: piece.R, T: piece.T, G, O: piece.O, M: piece.M ?? 0 });
}

/** The verdict rule of step 2: the band, then the quality terms. */
export function draftVerdict(costContinue, costFresh, { compacted, crosses, classUp }) {
  const margin = Math.abs(costContinue - costFresh);
  const smaller = Math.min(costContinue, costFresh);
  const percent = smaller > 0 ? (margin / smaller) * 100 : Infinity;
  if (classUp) return { side: "fresh", by: "class", margin, percent };
  if (percent > BAND_PERCENT) return { side: costContinue < costFresh ? "continue" : "fresh", by: "cost", margin, percent };
  return { side: compacted || crosses ? "fresh" : "continue", by: "quality", margin, percent };
}

/** Round half away from zero at `places`, immune to binary noise below 1e-6. */
export function roundTo(n, places) {
  const micro = Math.round(n * 1e6);
  return Math.sign(micro) * Math.round(Math.abs(micro) / 10 ** (6 - places)) / 10 ** places;
}

/** Parses "1,000,000", "86k", "1.5m" or a number; NaN when it cannot. */
export function parseTokens(v) {
  if (typeof v === "number") return v;
  const m = String(v).trim().replace(/[,_]/g, "").match(/^(\d+(?:\.\d+)?)([km]?)$/i);
  if (!m) return Number.NaN;
  const scale = { "": 1, k: 1e3, m: 1e6 }[m[2].toLowerCase()];
  return Math.round(Number(m[1]) * scale);
}
