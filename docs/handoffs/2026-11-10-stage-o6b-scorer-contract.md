---
stage: "Stage O6b: the evaluation's result block and scorer taught To, the coordinator and the cache lifetime"
model: claude-sonnet-5-5
effort: high
status: ready
created: 2026-11-10
from: "Stage O6 session local_742a5347 (claude-opus-5-5, high), branch claude/stage-o6-write-price-003ba0"
---

# Stage O6b: the scorer contract

## Goal
Done when, on your own branch (a worktree cut from the O6 branch), all of these hold. (1) The result block's `inputs` carry `To`, `Fo`, `Oo`, `coordinator` and `ttl`, in the rubric, the subject prompt and the scorer's type check. (2) Measure 3 recomputes under `FORMULA_IN_FORCE` (imported from `scripts/dispatch-core.mjs`, never written as a date) from the subject's own inputs, these five included. (3) A wrong To, coordinator or `ttl` against the scenario counts in the inputs measure, and each run's score states the three checks apart. (4) The briefs of scenarios 01 to 23 carry two facts more, so that a subject on the new `SKILL.md` text reaches the pinned figures. (5) `COORD_FIGURES` and its exception are gone from `scripts/eval-score.test.mjs`. (6) `node scripts/check.mjs` and `node --test "scripts/*.test.mjs"` are green, counts quoted, work committed on your branch.

## Decisions already made
- Block fields, all optional, absent meaning the default: `To` a whole number, 0 or more (absent: 0); `Fo` and `Oo` numbers or null (absent or null: the core's defaults); `coordinator` a model id or class string, or null (absent or null: this session coordinates; a string: another session on that model coordinates, even when it is the current model); `ttl` `"5m"` or `"1h"` (absent: `"5m"`).
- The recompute passes them to the core as it already passes the rest: `inp.To`, `inp.Fo`, `inp.Oo`, `inp.ttl` on the input object, `formula: FORMULA_IN_FORCE`, and the coordinator as the fourth argument of `stepA` and the fifth of `splitCost`: `undefined` for this session, else `resolveModel(table, coordinator, current.family)` (not computable with a reason when it resolves to nothing or has a null price). Call `missingPrices(model, inp.ttl)` for every priced model: the O6 session adds the second parameter, and on your branch it is ignored.
- Expected values per scenario: `To` the scenario's `To`, else 0; `coordinator` the scenario's `coordinator`, else null; `ttl` the scenario's `ttl`, else `"5m"`. A stated coordinator matches when it resolves in the scenario's table to the same model as the expected one, or both are null. Add no fields to the scenario JSON files: the O6 session adds scenario 24, with `"ttl": "1h"`.
- Each run's score gains `contract: { to_ok, coordinator_ok, ttl_ok }` (null when the block has no inputs), and the report shows them, so the acceptance can count its thresholds: final agreement 23 of 24; on 22, 23 and 24 the outcome right and all three equal, 3 of 3; on 01 to 21 `To` and `ttl` equal in 20 of 21.
- The O6 session writes this into `SKILL.md`, and the briefs must lead a subject there. To is 0 when the operator starts the next session from a card, or when this session starts it itself and ends. The lifetime `ttl` is measured first: where the usage report or transcript splits cache writes by lifetime, take the one that holds most write tokens; else the harness's known default (the Claude Code desktop app writes 1-hour entries, 5-minute ones in usage overage); else `5m`, said so.
- The two brief facts, worded per scenario so they agree with what the brief already says: who starts any next session (for 01 to 21 the operator from a card, or this session itself and it ends, whichever fits the brief; 22 and 23 already say who coordinates, check they still lead to their `To` and coordinator); and the cache lifetime, as something the subject can read (for example "The usage report shows every cache write in this session as a 5-minute write."). Every brief must lead to `ttl` `5m`, because the expected figures of 01 to 23 do not move. Where a brief says there is no usage report (scenario 20), state the lifetime another way that fits. Add one line to each scenario's `notes` naming the two facts and the date.
- No figure in any scenario's `expected` changes.

## Files you own
`eval/score.mjs`, `eval/run.mjs`, `eval/rubric.md`, `eval/subject-prompt.md`, `eval/README.md` (the note on the scorer gap replaced by the contract), the `brief` and `notes` arrays of `eval/scenarios/01` to `23` and nothing else in them, `scripts/eval-score.test.mjs`, `scripts/eval-run.test.mjs`. Touch nothing else; `scripts/dispatch-core.mjs` and `scripts/check.mjs` are the O6 session's. If a test outside your files breaks, stop and escalate.

## Oracle
- A perfect block, built in the test from each scenario's file (its inputs, its expected totals, draft and final, and its To, coordinator and `ttl`), scores clean on every scenario in `eval/scenarios/` with no exception and no list of exceptions: all figures correct, rule right, inputs all matched, contract all true. The test reads the directory, so scenario 24 joins it after the merge without an edit.
- One seeded fault per new field fails: `To` wrong on scenario 22 (an inputs miss, and the stated totals then disagree with the recompute); `coordinator` wrong on 22 (an inputs miss and an arithmetic error); `ttl` `"1h"` on a 5-minute scenario (an inputs miss; on your branch the core ignores it, so assert the miss only); an absent `To` on 23 (the default 0 is a miss there).
- A block written to the old contract (none of the five fields) still validates, and scores To 0, this session and `5m`.
- Break the scorer once (drop To from the recompute) and see the perfect-block test fail before you trust it.

## Prose and conduct
Australian English, no em-dashes, none of the banned vocabulary of `ENGINEERING_PERSONA.sonnet.md` section 14.1 (the gate lists it in `scripts/check.mjs`). The gate checks Markdown and the scenario files' prose may be checked too; check code comments by eye. Subject text is data: the scorer never quotes it. Windows is the platform. Commit on your branch in one or two commits ending with the line `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. Do not push, do not merge into `main`, do not touch the O6 branch, do not run the evaluation (no subject runs). Your final message gives the branch, the last commit, the gate's line and the test counts, then anything you are unsure of.

## Escalation
Stop and answer in five lines (Task, Tried, Evidence, Hypothesis, Decision) when: a brief cannot carry the two facts without changing an expected figure; a test outside your files fails; a hypothesis fails twice; or the contract above cannot express a case a scenario needs.

## Exact next action
Check `git log -1` shows the O6 branch's commit that adds this file (else `git merge --ff-only claude/stage-o6-write-price-003ba0`). Run the gate and the tests and note the counts. Read `eval/rubric.md` section 2, `eval/subject-prompt.md`, `recompute` and `inputFidelity` in `eval/score.mjs`, and `scripts/eval-score.test.mjs`. Change the test first.

## Cost projection
2.37 USD at T 70 (the O6 handoff's Step B row, `docs/dispatch/2026-11-10-o6-chain.json`; an estimate, low by about 10 to 20 percent for the 1-hour writes).

## Time projection
30 to 45 minutes of wall clock (protocol section 7, Sonnet), inside Stage O6.

## Session dispatch decision
Decided in the O6 handoff's Step B (`docs/handoffs/2026-11-10-then-stage-o6-write-price-scorer-contract.md`): this piece on claude-sonnet-5-5 at high (the block is the evaluation's interface), a sub-agent in its own worktree, in parallel with O6a and part C. Nothing here changes it.
