---
stage: "Stage O5: the coordinator term, formula revision, worked example, two scenarios"
model: claude-opus-5-5
effort: high
status: ready
created: 2026-11-10
from: "Session local_4e26ead3 (Fable 5.2, high; Fable 5.1 until the operator's /model on 2026-11-10): assessment 2026-11-02, D12 decided A'"
---

# Stage O5: the coordinator term

## Goal
The step 2 formula prices the session that coordinates a dispatched chain. `SKILL.md` gains one input, To (coordinating turns per piece), a `cost_coord` term added to `cost_fresh`, to `cost_split` and to the Step B total, a matrix row and a step 3.2 rule that say who coordinates, and one sentence in the class-floor paragraph. `scripts/dispatch-core.mjs` and `scripts/dispatch.mjs` compute and print the term under a new formula date with 2026-10-29 and 2026-10-27 kept; `scripts/check.mjs` recomputes it in the examples; `templates/decision-record.md` carries it; one new worked example re-runs the Tsunami decision of 2026-11-02 with its measured figures beside the formula's; scenarios 22 and 23 exist with figures captured from the calculator. Done when: `node scripts/check.mjs` exits 0 (or 2 on the stale table and nothing else) with its counts quoted; `node --test "scripts/*.test.mjs"` passes with its count quoted; `--formula 2026-10-29` still prints 20.01, 9.49 and 7.23 USD for the inputs of `examples/2026-10-29-sessiondispatch-stage-0b.md`; scenarios 01 to 21 are byte-identical; a test shows that a wrong `cost_coord` figure in the new example fails the gate; `README.md` has its changelog line; `docs/status.md` is current; the branch is pushed; the S6 handoff is written and its session proposed.

## Decisions already made
- D12 option A', the operator on 2026-11-10 ("A' as recommended"). The reasoning is `docs/assessment-2026-11-02.md`; do not reopen sections 1 and 2.
- To is one input, counted per piece. The fresh plan has 1 piece, the split 2 (run and acceptance), a Step B plan as many as its `pieces`. The coordinator's turns are To times the pieces. Default 30 per piece, range 20 to 40, marked "n = 1, Tsunami 2026-11-02, an upper bound that included other work"; the floor by count is 8 (start 1, note 1, verify 3, merge 2, record 1). To is 0 when the operator starts the sessions and the writing session ends; the record says which. Step 5 tests 40.
- `cost_coord` is the continue side's arithmetic over those turns: `sessionTurns` from C0 + H at the coordinator's model. The coordinator's per-turn tokens are step 1.2's writing-heavy defaults, F 3,000 and O 3,000, which the one measurement supports (6,446 written and 2,825 output per call); optional inputs `Fo` and `Oo` override them. Never on the continue side.
- `coordinator` is an optional input, a model id or a class, default the current model. When it names another model the term is a fresh session of that model reading H (`freshSession`, B + H, To times the pieces). The calculator always prints the comparison line: the same turns on the sonnet-class model as a fresh session.
- Under the new formula the record states To the way it states M: 0 with the reason, or a count. The gate requires the row, as it requires M.
- The formula's date is the local calendar day of the commit that changes `dispatch-core.mjs`. 2026-10-29 and 2026-10-27 stay selectable. Every test of `inp.formula === FORMULA_IN_FORCE` in the core, the calculator and the gate now has three formulas to sort: growth F + O, the miss term and H at the current model hold from 2026-10-29 on; only To is new.
- Matrix: one row, "Coordinating a dispatched chain whose briefs name their oracles: start, receive, verify, merge, record", Sonnet, medium, escalate on a failed verification the oracle cannot explain. Step 3.2 gains rule 7 as worded in the assessment's section 3.2, with both harness limits (a session started by another session cannot start sessions in the Claude Code desktop app, verified 2026-10-29; a session starts only models at or below its own class). No new guardrail.
- The evaluation's contract does not move: `eval/subject-prompt.md`, `eval/rubric.md`, `eval/score.mjs` and scenarios 01 to 21 are untouched. Scenarios 22 and 23 are scored on the existing measures; the coordinator's class is stated in their `notes`, unscored until the next required rerun (D11's rule). The class-floor paragraph says the term is unscored.
- The new example and both scenarios pin `pricing/2026-10-29.json`: the Tsunami stage ran on `claude-fable-5-1`, which the newer table does not list.
- Not in this stage: the transcript pricer, the calibration ledger, the Measured column and sample sizes on the other defaults (Stage S6); the install, the acceptance and the tag (Stage F7); `pricing/`, `scripts/check-pricing.mjs`, `scripts/pricing-new.mjs`, `scripts/install*.mjs` and step 1.4 of `SKILL.md` (D13, below).
- This session does not coordinate. You close your own stage: status, changelog, push, the S6 handoff, the S6 session. Report to the operator.

## Files and links that matter
- `docs/assessment-2026-11-02.md`: section 1 (the measured figures the example needs), 3.1 (the term), 3.2 (the row and rule 7), 3.4 (the scenarios), 3.3 (S6's scope, for the handoff you write).
- `SKILL.md`: the class-floor paragraph, steps 1.2, 2 (the formula block, the verdict rule, the old-formula note), 2.1, 3.1, 3.2, 3.3.
- `scripts/dispatch-core.mjs`: `FORMULAS`, `OPTIONAL_SYMBOLS`, `validateInputs`, `sessionTurns`, `freshSession`, `formulaTerms`, `freshSide`, `splitCost`, `pieceCost`. `scripts/dispatch.mjs`: `HELP`, `main`. `scripts/check.mjs`: `INPUT_ROWS`, `recomputeExample`, `checkTermLines`, `checkStepBColumn`, `EVAL_FIGURES`, `checkEval`. Tests in `scripts/check.test.mjs` and `scripts/eval.test.mjs`.
- `templates/decision-record.md`; `examples/2026-10-29-sessiondispatch-stage-0b.md` (the shape to follow); `eval/README.md` (the set table and the coverage paragraph); `eval/scenarios/07-split-plan.json`.
- In `D:\Code\Claude\Tsunami`, read-only: `docs/handoffs/2026-11-02-38-rebalancing-dashboard-stage.md` sections 10 and 13 (the inputs: C0 145,115, compacted yes, B 88,186, H 6,500, the five pieces); `docs/decisions/DECISION_LOG.md` row D-112 item 4 and `STATUS.md` section 6 (the measured costs).
- `docs/dispatch/2026-11-10-o5.json`: the calculator input behind the record below.

## Verified facts
- `get_session self`, 2026-11-10: this session is `claude-fable-5-2` at high; the operator changed it from `claude-fable-5-1` with `/model` before answering D12.
- Main checkout, 2026-11-10: `node scripts/check.mjs` 109 files read, 0 findings, exit 0; `node --test "scripts/*.test.mjs"` 49 pass, 0 fail (142 s). Both include the uncommitted pricing work of D13. The same gate count at commit `ff25881` on 2026-11-02 without it.
- Tsunami's measured figures agree with the report: `STATUS.md` rows 240 and 241 and D-112 item 4, read 2026-11-02.
- At the measured per-call tokens one coordinating call costs 0.297 USD on `claude-fable-5-1` and 0.059 to 0.074 on `claude-sonnet-5-5` (table 2026-10-29; node, 2026-11-02).
- `git worktree list` shows one worktree, the main checkout, at `ff25881` before this handoff's commit.

## Work completed
- `ff25881`: the assessment, D12 proposed, changelog line (2026-11-02).
- This commit: D12 decided, D13 opened, this handoff, `docs/dispatch/2026-11-10-o5.json`, status.

## Unresolved questions
- Operator, D13 (`docs/status.md`): the main checkout holds uncommitted pricing work from two other sessions (a Codex session, 2026-11-04: OpenAI rows, `scripts/check-pricing.mjs` and its test, one line of `SKILL.md` step 1.4, `pricing-new.mjs`; the price-table session, 2026-11-10: `pricing/2026-11-10.json` with `claude-fable-5-2` and `max_age_days` 8). Until it is committed nothing can be merged into `main` there. You work in your own worktree and push your branch; you do not merge.
- Stage O5: the shape of the new example. The Tsunami stage mixed targets; the gate recomputes one current and one target model per record, so choose the target the record's Step A prices (the content piece, opus) and put the other pieces in Step B, where `checkStepBColumn` recomputes each.
- Stage F7 or the operator: a tag push is outside `approvals.push_origin`; it needs the operator's yes in the session that does it.

## Exact next action
Confirm `get_session self` reports `claude-opus-5-5` at `high` and that you are in your own worktree (stop and name the mismatch otherwise). Run `git log --oneline -2` and `ls pricing`, then `node scripts/check.mjs`, and quote the counts. Then add To to `validateInputs` and `splitCost` in `scripts/dispatch-core.mjs` behind the new formula date, with a failing test first.

## Cost projection
Table `pricing/2026-11-10.json` (age 0 days of 8; uncommitted, D13). Opus 5.5, high, B 64,840 (measured today), R 82,000, F 3,000, O 3,000: 10.06 USD at T 60, 16.34 at T 90, by the calculator's Step B table; the handoff 0.18 at Fable 5.2. After it: S6 2.16 USD (Sonnet medium, T 40, R 50,000); F7 6.28 USD (Fable 5.2 xhigh, T 20, R 75,000). The chain: 18.68 to 24.96 USD. Estimates: every T; R by characters. The assessment's R of 25,000 left out the persona, the protocol, status and the README.

## Time projection
O5 60 to 90 minutes of wall clock; operator review about 30 minutes (the formula text and the example). S6 20 to 40 minutes and F7 20 to 30 minutes after it, serial: S6 edits `SKILL.md` step 1.2, which this stage also edits.

## Session dispatch decision
Date: 2026-11-10. Decided by: claude-fable-5-2, effort high, in Claude Code (desktop app). Price table: `pricing/2026-11-10.json` (age 0 days). Formula 2026-10-29.

### Inputs
W 1,000,000 and K 970,000 (measured, usage tool, 97 percent); C0 235,789 (measured, 18:37 local); compacted no; unrecorded context none (the assessment and this file carry it); T 60 to 90 (estimate); F 3,000 and O 3,000 (step 1.2, writing-heavy, at high); B 64,840 (measured: total less Messages 170,949); R 82,000 (itemised in `docs/dispatch/2026-11-10-o5.json`); H 4,500 (estimate before writing; this file came to 3,570 by characters divided by 4, which lowers the handoff term by 0.04 USD); M 0 (default; no review pause inside the stage); L 0; Ta 20 and Ra 60,000 (estimates, for the split figure); task type: a change to the procedure's arithmetic, a script, an example (matrix row 3; protocol section 2, Opus); design-heavy yes; outward: a push of the stage branch, under the standing yes of 2026-10-30.

### Step A: continue or hand off
From `node scripts/dispatch.mjs --json docs/dispatch/2026-11-10-o5.json --today 2026-11-10`:
```
G 6,000; C_end 595,789; crosses false (K 970,000); C_cont 415,789; C_fresh 326,840
cost_continue on claude-fable-5-2 = 4.989 + 3.600 + 7.200 + 0.000 + 0.000 = 15.79 USD
cost_fresh on claude-opus-5-5     = 0.180 + 0.734 + 3.922 + 1.800 + 3.600 + 0.000 + 0.000 = 10.24 USD
T* = n/a: the model changes
cost_split = 0.180 + 5.028 (sonnet run) + 3.164 (opus acceptance) = 8.37 USD
```
Draft verdict: fresh, by cost, margin 5.55 USD (54.3 percent of the smaller).

### Step B: model, effort and concurrency
| Piece | Class | Model id | Effort | Oracle | Serial or parallel | Cost |
|---|---|---|---|---|---|---|
| O5 | opus | claude-opus-5-5 | high | the Goal's done list | first | 10.06 to 16.34 USD |
| S6 | sonnet | claude-sonnet-5-5 | medium | the gate, its tests, the ledger's seeded rows against D-112 | after O5 | 2.16 USD |
| F7 | fable | claude-fable-5-2 | xhigh | an acceptance note, each claim with its command | after S6 | 6.28 USD |

Serial chain 100 to 160 minutes; operator review about 45 minutes. Effort: F7 at xhigh because the change is a release (matrix row 4). Split: not an option; the stage chooses the term's text and the example's shape, and a brief that settled both would be the stage. Coordination: To 0; the operator starts each session and each finishing session writes the next handoff.

### Guardrails checked
1 no, T 60. 2 design-heavy; no compaction behind or ahead. 3 the branch push, approval step named (standing yes); the tag waits for the operator. 4 models from the table's opus, sonnet and fable rows. 5 table 0 days old, the three rows complete. 6 F7, Fable at xhigh, fresh. 7 the record about 1,250 tokens against 4,000; about 6 minutes against 10. 8 this session read its own model and effort; the class did not change.

### Adversarial pass
The opposite verdict, argued: this session holds the measurement, the code and the term's design, and would write it without the 82,000-token re-read; 5.55 USD is small; and under the term this stage adds, a Fable session that stayed to coordinate would erase the saving.
Inputs: C0 measured. T could reach 90. F and O defaults; O at high. B measured; R could be 100,000 with the Tsunami files read whole. M: the operator may pause for an hour; 2 tested. Task type: protocol section 2 names it Opus work. Prices: read today by another session, uncommitted; Fable 5.2's row is cheaper than 5.1's, which favours continue. Unrecorded: none.
Recomputed, T 90, R 100,000, M 2: cost_continue 35.22 USD, cost_fresh 21.11 USD, fresh by 66.9 percent.
Outside the formula in force, by the term this stage adds: this session coordinating at To 20 adds 4.80 USD (fresh 15.04, inside the band, continue by quality); at To 30, 7.38 USD (17.62 against 15.79, continue by cost); woken three times past the cache lifetime, 7.66 USD, 7.31 of it misses.
Verdict holds: yes, fragile: flips at To of 20 or more on this session, so the plan is To 0.

### Final verdict
Fresh, model claude-opus-5-5, effort high, three pieces in series, To 0. Exact next action: the operator starts the O5 session from the card or the kickoff prompt, and archives this one.

### Cost of deciding
| Row | Value | Source |
|---|---|---|
| Context at start | 235,789 | measured, usage tool |
| Context at end | about 262,000 | self-estimate |
| Input tokens read | about 3,500 | self-estimate: three calculator outputs |
| Output tokens | about 4,200 | self-estimate: this file 3,570 (the record 1,250 of it) and the input file's note, characters divided by 4 |
| Wall clock | about 6 minutes | shell clock, 18:37 to 18:43 local; the handoff was written inside the same span |
| Priced | 3,500 x 10e-6 + 4,200 x 40e-6 = 0.20 USD | table `pricing/2026-11-10.json`, fable row; self-estimate |
