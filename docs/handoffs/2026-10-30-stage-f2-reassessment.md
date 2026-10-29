---
stage: "Stage F2: reassessment of the session-dispatch skill on the evaluation results"
model: claude-fable-5-1
effort: high
status: ready
created: 2026-10-30
from: "Session local_e0fdc95a (Sonnet 5.5, medium): Stage H1, evaluation runs"
---

# Stage F2: reassessment on the evaluation results

## Goal
Read `eval/results-2026-10-30.md` (80 runs, 4 cells of 20) and answer the assessment's open question: is `session-dispatch` a procedure a Haiku or Sonnet model can run, or a checklist around a calculator? Then reassess the skill and the roadmap in a dated `docs/assessment-2026-10-30-f2.md` (the six questions of protocol section 1.1, question 6 as priced stages), settle the findings below, and decide variant C (D2). Done when that document exists, `docs/status.md` shows the next stages, the gate exits 0, and it is committed by name.

## Decisions already made
- D7 was option B: 40 calculator-arm runs, the Haiku hand arm (20), then the Sonnet hand arm because Haiku failed by hand. All 80 are done; nothing else is run for H1.
- The rubric and the scenarios were applied as written, not edited. `SKILL.md`, `scripts/`, `eval/rubric.md`, `eval/subject-prompt.md`, `eval/scenarios/` and `eval/tables/` are unchanged by H1.
- D2 (ASD-STE100): no. Variant C (STE100's writing rules without its dictionary, for `SKILL.md`, adapters and templates) is adopted only if it scores higher on these scenarios; this stage decides whether to stage it.
- Pushes: standing yes under `approvals.push_origin` (protocol section 1.3); the coordinating session pushes.

## Files and links that matter
- `eval/results-2026-10-30.md`: the summary table, 80 run rows, input misses, diagnostics, and the H1 notes at the end (hand judgement, validity threats). Read this only; do not read `record.txt` files in bulk.
- `eval/rubric.md` (section 9 threats), `eval/README.md` (the three places `SKILL.md` gives two answers), `docs/assessment-2026-10-29.md`, `docs/acceptance-2026-10-29-stage-o1.md` (F1 findings 1 to 6), `docs/status.md`.
- Run data: `eval/runs/2026-10-30/<scenario>.<subject>.<arm>/` (`score.json` per run; `usage.json` has the harness's token total).

## Verified facts
- Gate `node scripts/check.mjs`: 90 files read, 0 findings, exit 0; `npm test`: 31 tests, 31 pass (2026-10-30, end of H1).
- Final-agreement rates (Wilson 95 percent, n = 20 each): Sonnet with calculator 20/20 (83.9 to 100.0); Sonnet by hand 17/20 (64.0 to 94.8); Haiku with calculator 11/20 (34.2 to 74.2); Haiku by hand 10/20 (29.9 to 70.1).
- Haiku fails with and without the calculator; its misses are mostly `continue` where `fresh` is expected (calculator 6 of 9 misses, hand 7 of 10). Arithmetic correct of stated: Haiku 43/44 with the calculator, 32/35 by hand; Sonnet 45/47 and 43/47. Bound guardrails: Haiku 9/10 and 5/10; Sonnet 10/10 and 9/10 (counts of 10, small).
- Cap: the subjects' own records exceeded the 8,000-token decision cap in 19/20 (Haiku calculator), 17/20 (Haiku hand), 16/20 (Sonnet calculator), 11/20 (Sonnet hand) runs; median 1.9 to 2.7 minutes. Reported tokens are the subject's own estimate; the harness totals are 76,262 to 119,228 a run (no input and output split), several times larger.
- Two unscorable runs, both `"target": null` against the rubric's string type: `15-null-price.sonnet.hand` and `16-outward-release.haiku.hand`.
- Validity threat (unmeasured): sub-agents load the project's `AGENTS.md` and `MEMORY.md`, so the subject can see the operator rules. One run per cell, one day.
- `prepare` rewrites `manifest.json`; H1 merged the manifest by hand across three calls (hashes identical). Fix in `eval/run.mjs` if the set is run again.

## Work completed
- H1 part 1, 40 calculator-arm runs: commit `60a87f2`. Part 2 (hand arms, results addenda, this handoff, status, changelog): the commit after it, see `git log`.

## Unresolved questions
- Which of the three places `SKILL.md` gives two answers to settle, and how (F2; list in `eval/README.md`).
- Whether guardrail 7's 8,000-token cap is wrong for the skill or the subjects ignore it (F2): most records exceed it in every cell.
- Whether a null `target` should be a legal block value when the model cannot be named (scenario 15 expects `incomplete` for that reason) and whether the two unscorable runs should be rescored (F2, a rubric change goes to Opus).
- Whether to repeat cells to narrow the intervals (about 12 USD for the 80, estimate), and the remaining F1 follow-ups (F1-1, F1-3, F1-4, F1-5) and variant C (F2 decides which to stage, and for which class).
- Operator: whether to mitigate the `AGENTS.md` and `MEMORY.md` load for a future run.

## Exact next action
Run `get_session self`; stop unless it reports `claude-fable-5-1` at `high`. Read this file, then `eval/results-2026-10-30.md` in full, then `eval/README.md`. Write the reassessment to `docs/assessment-2026-10-30-f2.md`.

## Cost projection
Fable 5.1, high, fresh start: T 60, F 3,000, O 2,500, B 85,201, R 45,000, H 3,500: fresh 17.72 USD (calculator, `pricing/2026-10-29.json`); T 120 gives 38.72 with the window crossed, so keep the stage near 60 turns. H1 itself: orchestration about 4 USD (estimate: about 75 turns at an average 260k context), subjects about 2.3 USD (estimate: 90% cache reads, 8% cache writes, 2% output on the harness totals; Haiku at the long-context tier), total about 6.3 USD, quote 5 to 9.

## Time projection
60 to 120 minutes of Fable wall clock (protocol section 7), operator review about 30 minutes. H1 took about 33 minutes wall clock (session start 14:07 UTC to about 14:40 UTC by the usage tool), mostly waiting on 80 sub-agents in batches of about 10.

## Session dispatch decision
Date: 2026-10-30. Decided by: claude-sonnet-5-5, effort medium, in Claude Code (desktop app). Price table: `pricing/2026-10-29.json` (age 1 day).

### Inputs
| Input | Value | Source |
|---|---|---|
| Formula | 2026-10-29 | `SKILL.md` step 2 |
| Current, target model | claude-sonnet-5-5; claude-fable-5-1 | `get_session self`; matrix row 5 (whole-project assessment) |
| W, K | 1,000,000; 970,000 | Usage tool, 97 percent |
| C0 | 428,227 | Measured, `get_usage self` at the end of H1 |
| Compacted | no | Measured |
| T, F, O | 60; 3,000; 2,500 | Estimates: the assessment-class defaults (T from protocol section 7) |
| B, R, H | 85,201; 45,000; 3,500 | B measured (428,227 less Messages 343,026); R estimate (results 5k, README, assessment 12k, F1 acceptance 10k, status 5k, this file 4k, rubric 4k); H this file / 4 |
| M, L | 0; 0 | Unmeasured; none expected |

### Step A and B
Calculator: G 5,500; C_end 758,227, crosses false; cost_continue 5.88, cost_fresh 17.72 USD on Fable; T* n/a (the model changes). Draft verdict: fresh, by class (margin 11.83 USD, 201 percent of the smaller). Piece: F2, Fable, effort high (matrix row 5; no raise rule applies: nothing outward-facing, nothing failed on reasoning), serial, oracle: the gate and the six questions answered with figures.

### Guardrails and adversarial pass
Class guardrail binds (Sonnet cannot run a Fable stage); the rest checked, none else binds. Opposite verdict (continue here): 5.88 against 17.72 USD, but this session is Sonnet and holds 343k tokens of orchestration F2 does not need. Adverse value T 120: cost_fresh 38.72, continue 13.90, window crossed; verdict stays fresh by class.

### Final verdict and cost of deciding
Fresh, claude-fable-5-1, effort high. Exact next action above. Deciding cost: about 5,000 tokens read and 3,000 written, about 6 minutes, about 0.05 USD (estimate), inside the cap.
