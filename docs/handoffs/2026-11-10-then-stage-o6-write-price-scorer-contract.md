---
stage: "Stage O6: the write price by cache lifetime (formula 2026-11-11), one owner for the table rules, the scorer contract for To and the lifetime, the F7 text findings"
model: claude-opus-5-5
effort: high
status: done
created: 2026-11-10
from: "Stage F7 session local_3066f14f (claude-fable-5-2, xhigh), branch claude/cool-jang-ac61d5, main at the commit that adds this file"
---

# Stage O6: the write price, the table rules, the scorer contract

## Goal
Done when, on this stage's branch (cut from `main`), all of these hold. (1) Formula 2026-11-11 prices every cache write at the row's `cache_write_1h` when the new input `ttl` is `1h`, and at `cache_write` when it is `5m`; formulas 2026-11-10, 2026-10-29 and 2026-10-27 still reproduce their records. (2) `SKILL.md`, the calculator, the gate's recompute, the template and one new worked example carry it (`AGENTS.md` rule 8). (3) One module owns the price-table rules; `scripts/check.mjs` and `scripts/check-pricing.mjs` both import it; staleness counts from each family's `fetched` date. (4) A new table carries `cache_write_1h` for the Anthropic rows and the `claude-fable-5-1` row again. (5) The evaluation's result block states To, the coordinator and `ttl`; the scorer recomputes from them under the formula in force; the pin in `scripts/eval-score.test.mjs` is gone; scenario 24 covers the lifetime. (6) Findings F7-3 to F7-10 and F7-12 are closed or answered. (7) `node scripts/check.mjs` and `node --test "scripts/*.test.mjs"` are green with counts quoted; the branch is pushed; the Stage F8 handoff is written. Not in this stage: a merge into `main`, the install, a tag, the rerun.

## Decisions already made
- D15 option A and D14 option A-now, by the operator on 2026-11-10 ("D-15 (A) and D-14 (do it now with rerun)"). Five parts: `docs/acceptance-2026-11-10-f7.md` sections 6 and 8. Findings: section 7 of that note. Read it first.
- The interface is fixed here so that the parts can be built at the same time. Table field: `cache_write_1h`, a number or null or absent, also inside `long_context`. Input: `ttl`, `5m` or `1h`, default `5m` in the calculator; flag `--ttl`; Inputs-table row "Cache lifetime ttl". Under `ttl` `1h`, a row without a number in `cache_write_1h` is a null price (step 1.4.4, exit 3). Before formula 2026-11-11 `ttl` is ignored. Result-block inputs gain `To`, `Fo`, `Oo`, `coordinator` and `ttl` (absent: 0, the defaults, this session, `5m`).
- The formula is named 2026-11-11 (2026-11-10 is the coordinator term's name).
- Measured fact for the text: Claude Code desktop writes 1-hour entries (1,526,208 of 1,526,208 write tokens in five transcripts, 2026-10-29 to 2026-11-10); the app drops to 5-minute writes in usage overage. Other harnesses: unknown, so `5m`, and say so. A model switch is a miss of the whole context (measured: 160,458 tokens, 2.06 USD in six calls).
- The expected figures of scenarios 01 to 23 do not move. Their briefs gain two facts only: who starts the next session, and the cache lifetime, worded so that a subject on the new text reaches the pinned figures.
- Staleness: a family's figures are stale 14 days after `fetched`. `max_age_days` stays as the field and is 14. `table_date` only names the file. The calculator refuses only when a model it needs is in a stale family; the gate exits 2 when a priced family is stale and nothing else is wrong.
- In the Anthropic family `claude-fable-5-2` is listed before `claude-fable-5-1`, because the class resolves to the first row listed. Add a test for it.
- The operator asked on 2026-11-10 for status updates and dashboards in ASD-STE100: write `docs/status.md` entries in short active sentences.
- F8 is the acceptance, a fresh Fable session at xhigh. The F7 session coordinates: it starts F8 after this stage. Do not start or propose a session.

### What the F8 handoff must carry
Front matter `claude-fable-5-2`, `xhigh`. Its own dispatch record. These, word for word in meaning:
- Order: derive formula 2026-11-11 by hand for the example and scenario 24 before the calculator is read; accept the text and the scorer contract first; start the rerun in the background; accept the table rules, the pricer and the rest while it runs.
- The rerun: the CLI runner as Stage H3 used it (`docs/handoffs/2026-10-30-stage-h3-clean-harness.md`), `claude-sonnet-5-5` subjects, calculator arm, 24 scenarios, one run each. Run one scenario first; if the shell refuses the calculator grant, ask the operator for an allow rule and do not widen the grant.
- Thresholds, fixed on 2026-11-10 before any run: T1 final agreement in 23 of 24 or more; T2 on scenarios 22, 23 and 24 the final outcome is right and the stated To, coordinator and `ttl` equal the scenario's, 3 of 3; T3 on scenarios 01 to 21 the stated To and `ttl` equal the scenario's in 20 of 21 or more. All three met: the class floor's last sentence is replaced by the measured figures. Any not met: the sentence stays, the figures and the misses are recorded, and the choice goes to the operator in five parts.
- Then: fast-forward `main`, push (`approvals.push_origin`), `node scripts/install.mjs --harness all`, `--check` at 0 files behind, ledger rows for O6, its two sub-agents and F8 from `node scripts/session-cost.mjs`, status, changelog. No tag: the F7 session asks the operator.

## Files and links that matter
- `docs/acceptance-2026-11-10-f7.md` (findings, rulings 5.1 to 5.3, the dated validator probe, the seeded faults that passed).
- Formula: `SKILL.md` steps 1.1, 1.2 (M row), 1.4, 2, 2.1, 7; `scripts/dispatch-core.mjs` (`ratesAt`, `coordCost`, `FORMULAS`); `scripts/dispatch.mjs`; `scripts/check.mjs` (`recomputeExample`, `checkCoordLines`, `checkStepBColumn`); `templates/decision-record.md`; `examples/`.
- Table rules: `scripts/check-pricing.mjs`, `checkPricing` in `scripts/check.mjs`, `scripts/pricing-new.mjs`, `pricing/2026-11-10.json`, `pricing/README.md`, `scripts/session-cost.mjs` and `scripts/fixtures/`.
- Scorer: `eval/score.mjs` (`recompute`, line 118), `eval/rubric.md`, `eval/subject-prompt.md`, `eval/run.mjs`, `eval/scenarios/`, `scripts/eval-score.test.mjs` (`COORD_FIGURES`), `eval/README.md`.
- This stage's dispatch input: `docs/dispatch/2026-11-10-o6-chain.json`. The ledger: `docs/dispatch/calibration.md`.

## Verified facts
- `main` at this file's commit: gate 120 files, 0 findings; 67 tests pass (the commit message quotes the run).
- The vendor's page, read 2026-11-10 by a `web-fetch` sub-agent of F7 (USD per million; input, 5-minute write, 1-hour write, cache read, output): Haiku 5.5 0.10, 0.125, 0.20, 0.01, 0.50 up to 100,000 tokens and 0.50, 0.625, 1, 0.05, 2.50 above; Sonnet 5.5 2, 2.50, 4, 0.10, 10; Opus 5.5 4, 5, 8, 0.20, 20; Fable 5.2 8, 10, 16, 0.20, 40; Fable 5.1 10, 12.50, 20, 0.25, 50. Read the page again on the day the new table is dated (one `web-fetch` sub-agent) and use these as the second read; a difference stops the table work and goes to the operator.
- With `--today` from 2026-11-13 to 2026-11-18 `check-pricing.mjs` exits 1 and the gate exits 0 on the table of 2026-11-10 (F7 section 5.3). After this stage the two agree on every date from the table's date to 20 days later.
- A pricer keyed on the line's `uuid` passes all six pricer tests (F7-8). Mutations M12, M13 and M18 of the Tsunami example pass the gate (F7-6).
- A session started by another session cannot start sessions; a sub-agent from the `Agent` tool can run in its own worktree (`isolation: "worktree"`) and in the background.

## Work completed
Nothing of this stage. F7 accepted O5, S6 and `1ae8c0d`; `main` carries them; the installed copies equal `main` at `82d9386`.

## Unresolved questions
- `.claude/helpers/operator-protocol.cjs` announces the last handoff by name, so on a day with several handoffs it can announce a finished one (this file is named `then-stage-o6` to sort last). Fix it only if the helper has a test to extend; else put it in the F8 handoff as open.
- Whether `cost_coord` needs a miss term: a coordinator idles between pieces, so its cache is cold more often than a worker's. No change now; F7's two wakes will be the first measurement, in the ledger.

## Exact next action
Confirm `get_session self` reports `claude-opus-5-5` at `high` (stop and name the mismatch otherwise). Run `git fetch origin` and check that your worktree holds this file; if not, `git merge --ff-only origin/main`. Run the gate and the tests and quote the counts. Read the F7 acceptance note. Start one `web-fetch` sub-agent for the price page, write the two briefs, start the two sub-agents, then begin part C with the core.

### The work, in three parts
Run parts A and B as two Sonnet sub-agents at the same time, each in its own worktree, each from a brief you write (goal, decisions above, files it owns, oracle, done, prose rules, the five-line escalation). Do part C yourself while they run. A sub-agent commits on its branch and returns the branch, the commit, and its gate and test counts. Merge A, then B, then finish C on top.
- **A, table rules (Sonnet, medium).** Owns: `pricing/`, `scripts/check-pricing.mjs`, `scripts/pricing-new.mjs`, the new shared module, `scripts/session-cost.mjs`, their tests and fixtures, `pricing/README.md`, and the `checkPricing` function of `scripts/check.mjs` only. Work: the shared module with every rule of both validators and the staleness rule above; a new table by `pricing-new.mjs` with `max_age_days` 14, `cache_write_1h` on the Anthropic rows, the Fable 5.1 row, the note on eight days removed; the pricer prices 1-hour write tokens at `cache_write_1h` where the row has it and says which figure it used; the fixture gives a repeated message a second `uuid` and a larger count on its later line (F7-8); a module header for `check-pricing.mjs` (F7-12). Oracle: the dated sweep above as a test; the pricer on the fixture by hand.
- **B, scorer contract (Sonnet, high).** Owns: `eval/score.mjs`, `eval/run.mjs`, `eval/rubric.md`, `eval/subject-prompt.md`, `eval/README.md`, the `brief` and `notes` of `eval/scenarios/01` to `23`, `scripts/eval-score.test.mjs`, `scripts/eval-run.test.mjs`. Work: the block fields above; measure 3 recomputes under `FORMULA_IN_FORCE` from the subject's own inputs; a wrong To, coordinator or `ttl` against the scenario counts in the inputs measure; the two brief facts; `COORD_FIGURES` removed. Oracle: a perfect block scores clean on every scenario with no exception; one seeded fault per new field fails.
- **C, yours (Opus).** Owns everything else. Do not edit `scripts/check.mjs`, `pricing/` or `eval/` before A and B are merged. Work: formula 2026-11-11 in the core and the calculator; the `SKILL.md` text (steps 1.1, 1.2, 1.4, 2, 7; the "(14)" of step 1.4.2 reworded to the staleness rule; "another session" for "another model" and a way for the calculator to price a fresh coordinator on the current model, F7-3; To is 0 also when this session starts the next one and ends, F7-4; matrix row 6 against the raise rule and guardrail 3, F7-5; the ledger named as a file of the SessionDispatch repository, F7-9; the Measured row names the transcript id, F7-10); the gate recomputes the Step B coordination row, the plan total and the draft margin (F7-6); F7-7 answered in one sentence or fixed; the prose "(14)" in `AGENTS.md` rule 3, protocol section 2, `docs/installing.md` and `README.md` made true; the template; the worked example `examples/2026-11-10-sessiondispatch-stage-o6.md` from the record below, re-run under formula 2026-11-11 at `ttl` `1h` with both figures side by side; scenario 24 under formula 2026-11-11 where the lifetime decides the verdict, with an alternative at `5m` (scenario 23 at To 0 moves T* from 35.5 to 54.8 turns: a T between them does it); the ledger's O1, F1, O5, S6 and F7 rows re-priced at the 1-hour figure with the old figure kept in the Source cell; changelog; status; the F8 handoff.

## Cost projection
Table `pricing/2026-11-10.json` (age 0 days of 8), by `node scripts/dispatch.mjs --json docs/dispatch/2026-11-10-o6-chain.json --today 2026-11-10`. All T, F, O and R are estimates from the ledger rows named in the JSON note. The table prices writes at the 5-minute figure, so each figure is low by about 10 to 20 percent (finding F7-1).

| Piece | Projected USD | T projected | Calls measured | Measured USD | Source |
|---|---|---|---|---|---|
| O6, part C and the merges (Opus, high) | 16.06 | 120 | pending | pending | `node scripts/session-cost.mjs <transcript>`; O5 measured 10.71 on 101 calls |
| O6a table rules (Sonnet sub-agent, medium) | 1.74 | 60 | pending | pending | listed apart by the pricer |
| O6b scorer contract (Sonnet sub-agent, high) | 2.37 | 70 | pending | pending | listed apart by the pricer |
| F8 acceptance, rerun, release (Fable, xhigh) | 13.93 | 60 | pending | pending | F7 measured 8.78 on 49 calls |
| Rerun subjects, 24 Sonnet runs | about 6.7 | n/a | pending | pending | H3 measured 5.89 for 21 runs; the runner's usage file |
| Coordination by the F7 session | 1.39, and up to 7.40 more | 8 | pending | pending | To 2 x 4; two wakes after more than an hour write 377,602 tokens again each (by hand: 2 x 377,602 x 9.8e-6) |

Plan: 42 to 50 USD. D14 and D15 were quoted at 37 to 42 together; one acceptance serves both, and the coordinator's cold wakes are new.

## Time projection
O6 90 to 120 minutes of wall clock, the two sub-agents inside it at the same time. F8 70 to 100 minutes, the rerun inside it. About 3 to 4 hours in all. Operator review about 30 to 45 minutes, and the tag decision. Estimates.

## Session dispatch decision
Date: 2026-11-10. Decided by: claude-fable-5-2, effort xhigh, in Claude Code (desktop app). Price table: `pricing/2026-11-10.json` (age 0 days). Formula 2026-11-10.

### Inputs
W 1,000,000 and K 970,000 (measured, 97 percent); C0 372,602 (measured, usage tool); compacted no; unrecorded context none (the F7 note and this file carry it); T 120, F 2,500, O 1,500 (estimates from O5's row: 101 calls, 3,220 written and 1,371 output per call); B 63,170 (measured: total less Messages 309,432); R 85,000 (characters divided by 4); H 5,000 (this file); M 0; L 0; Ta 60, Ra 90,000 (F8); To 2 per piece, coordinator this session, Fo 2,000, Oo 1,500 (estimates); task type: formula arithmetic and evaluation design (matrix row 3), with two row 2 parts; design-heavy yes; outward: branch pushes under the standing yes; the merge, the install and the tag are F8's and the operator's.

### Step A: continue or hand off
From the calculator: cost_continue on claude-fable-5-2 = 26.70 USD (reads 14.702, writes 4.800, output 7.200); cost_fresh on claude-opus-5-5 = 16.60 USD (handoff 0.200, first read 0.741, reads 9.316, writes 2.400, output 3.600, cost_coord 0.342); T* n/a (the model changes); crosses false (C_end 852,602). Draft verdict: fresh, by cost, margin 10.10 USD (60.9 percent of the smaller). The split is 15.96 USD, cheaper than fresh by 4.0 percent: inside 10 percent, and the formula work is not row 1 or 2 work, so it is a figure, not the plan.

### Step B: model, effort and concurrency
| Piece | Class | Model id | Effort | Oracle | Serial or parallel | Cost |
|---|---|---|---|---|---|---|
| O6 part C | opus | claude-opus-5-5 | high | the gate's recompute of the new example and scenario 24; the tests | from the start; merges after A and B | 16.06 USD |
| O6a table rules | sonnet | claude-sonnet-5-5 | medium | the dated sweep test; the pricer on its fixture | parallel with B and C, sub-agent, own worktree, baseline about 20,000 | 1.74 USD |
| O6b scorer contract | sonnet | claude-sonnet-5-5 | high (the block is the evaluation's interface) | a perfect block clean on every scenario; one seeded fault per new field | parallel with A and C, sub-agent, own worktree | 2.37 USD |
| F8 | fable | claude-fable-5-2 | xhigh (acceptance of a release) | hand derivation, seeded faults, the thresholds above | after O6; the rerun inside it | 13.93 USD |
| Coordination | fable | claude-fable-5-2 | xhigh | each stage's quoted counts, run again on its branch | two wakes | To 2 x 4 pieces: 1.39 USD |

Pieces 34.09 USD, cost_coord 1.39, plan 35.48 USD, plus about 6.7 for the subjects. Serial chain: O6 (90 to 120 minutes), F8 (70 to 100). Coordinator: this session, by the harness: only it can start F8 without the operator (step 3.2 rule 7). Its class is above the coordinator row, so To is held to 2 per piece and it does no stage work.

### Guardrails checked
1 no (T 120). 2 not binding: design-heavy, no compaction, crosses false. 3 the pushes carry the standing yes; the merge, the install and the tag are named in the F8 handoff, the tag with the operator's yes. 4 models from the table's opus, sonnet and fable rows. 5 table age 0 days, rows complete. 6 F8 is Fable at xhigh in a fresh session. 7 the record is under 4,000 tokens; the decision took about 9 minutes. 8 class and effort as the harness reports.

### Adversarial pass
The opposite verdict, argued: this session holds every finding, and a handoff can lose the reason behind one; continuing avoids two re-reads. Rejected: continuing costs 26.70 against 16.60 USD and runs Opus-class and Sonnet-class work on Fable. Inputs: T 240 for O6 gives 65.97 against 43.44, still fresh by 51.9 percent. To 6 per piece gives cost_coord 4.29 for the plan and fresh by 54.4 percent. The input the formula does not hold is the coordinator's cold wakes: two of them add 7.40 USD at the table's figure (11.93 at the page's 1-hour figure); the alternative, the operator starting F8 from a card, saves that and costs a wait for the operator at night. The verdict holds: yes. Recorded as a cost, not a reason to continue.

### Final verdict
Fresh, model claude-opus-5-5, effort high, with two Sonnet sub-agents in parallel; then F8 on claude-fable-5-2 at xhigh. Coordinator: this session, two wakes. Exact next action: commit this file, start the O6 session.

### Cost of deciding
| Row | Value | Source |
|---|---|---|
| Context at start | 372,602 | measured, usage tool |
| Context at end | about 392,000 | self-estimate |
| Input tokens read | about 6,000 | self-estimate: the calculator output, one memory file, the helper's lines |
| Output tokens | about 13,000 | self-estimate: this file and the JSON, characters divided by 4; the record itself is about 1,250 |
| Wall clock | about 9 minutes | self-estimate from the shell clock |
| Priced | 6,000 x 10e-6 + 13,000 x 40e-6 = 0.58 USD | table `pricing/2026-11-10.json`, fable row; self-estimate |
