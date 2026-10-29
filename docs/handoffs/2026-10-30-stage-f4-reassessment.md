---
stage: "Stage F4: reassessment on the H2 results; decides O4 and C1"
model: claude-fable-5-1
effort: high
status: done
created: 2026-10-30
from: "Session local_2f355400 (Sonnet 5.5, medium): Stage H2, the rerun on the revised text"
---

# Stage F4: reassessment on the H2 results; decides O4 and C1

## Goal
Read `eval/results-2026-10-31.md` (its notes first), rule on each pre-registered threshold, and decide the conditional stages: C1 (variant C, D8) and O4 (the F1-1 fresh-side terms), plus what S4 and S3 should now contain. Done when `docs/assessment-2026-10-30-f4.md` answers the six questions of protocol section 1.1 for the new state, `docs/status.md` and the changelog are updated, the gate and tests pass with counts quoted, the next handoff (or the closing record) is written and committed by name on `main`.

## Decisions already made
- Thresholds (F2 section 3.6), fixed before the runs; the results file states each against its figure. Sonnet: both cells 38 of 40 and calculator 40 of 40, met (40/40 and 40/40); arms different only if Fisher p under 0.05, p = 1.000, not different. Haiku: calculator cell 18 of 20 or the text gains a class floor and D8 stages variant C; result 17 of 20 on the scorer's count, not met.
- D8 and D9 are decided (D8: defer variant C to F4, threshold 18 of 20 on Haiku, fixed 2026-10-30). Do not move the threshold after seeing the result; rule on how the two unscorable runs count, with reasons.
- H1's figures stay the H1 result. Scenario 17 is not comparable between H1 and H2. Runner and harness caveats of H1 carry (`Agent` runner, `AGENTS.md` and `MEMORY.md` load).
- Pushes carry the operator's standing yes (`approvals.push_origin`); the coordinating session pushes. Prose: Australian English, no em-dashes, none of the persona's banned words.

## Files and links that matter
- `eval/results-2026-10-31.md` (the notes, then the cells, the runs and the diagnostics); H1 for comparison: `eval/results-2026-10-30.md`.
- `docs/assessment-2026-10-30-f2.md` sections 3.4, 3.6, 7; `docs/acceptance-2026-10-30-stage-o3.md` sections 4 and 6; `eval/rubric.md`.
- The two unscorable Haiku calculator runs, read by hand for the notes: `eval/runs/2026-10-31/12-crosses-design-heavy.haiku.calculator/record.txt` and `.../14-stale-table.haiku.calculator/record.txt` (read only these and any run F4 needs; never the records in bulk).

## Verified facts
- `node eval/run.mjs score --date 2026-10-31`: 120 runs, 2 unscorable. Final agreement: Sonnet calculator 40/40 (91.2 to 100.0 percent), Sonnet hand 40/40, Haiku calculator 17/20 (64.0 to 94.8), Haiku hand 19/20 (76.4 to 99.1). Fisher, calculator against hand: Sonnet p = 1.000, Haiku p = 0.605 (computed by a hypergeometric sum, 2026-10-30).
- The two unscorable runs are Haiku, calculator arm, both format failures with the final outcome matching the expectation: scenario 12 (JSON block inside a table cell, closing fence followed by a pipe) and scenario 14 (`cost_of_deciding.usd` null, not a string). Read by hand, the cell is 19 of 20; the only scored Haiku outcome miss is scenario 10, fresh for continue, in both arms (n = 1 each).
- Over cap: 6 runs (Haiku 2, Sonnet 4), all scenario 17, which states 11 minutes already used; records 1,772 to 2,141 tokens. The F2-6 diagnostic is empty. Sonnet arithmetic misses are mostly `t_star` (calculator arm 9 runs with an error of 40, hand 7).
- `node scripts/check.mjs`: 97 files read, 0 findings (2026-10-30, at the H2 close); `npm test`: 35 tests (the repeat-flag test added), 35 pass, 0 fail, 67.5 s.
- Manifest of this set was merged by hand from two `prepare` calls; the label 2026-10-31 avoids H1's `eval/runs/2026-10-30/`.

## Work completed
- `5349fdb` the `--repeat <n>` flag on `prepare` with its test; `c45891e` the 120 runs, scores, results and the F4 dispatch input; the stage-close commit holds this handoff, `docs/status.md` and the changelog.

## Unresolved questions
- F4: how the two unscorable runs count against the Haiku threshold (scorer 17 of 20, hand reading 19 of 20), and so whether C1 is staged; the hand arm reads 19 of 20, so a class floor is not the only reading.
- F4: whether scenario 10's pair of misses is a Haiku weakness or a scenario trap; whether a 21st scenario should cover guardrail 7's fallback branch; F3-1 (rubric row 7 against the guardrail order where guardrails 5 and 7 both bind); F3-5 (the scorer's record size is the whole file); F3-6 (read, nothing to subtract this run); the Sonnet `t_star` misses and whether O4's terms or a wording fix address them.
- Operator: none. S4 (CLI runner, manifest merge in `prepare`) now also covers the multi-call manifest loss this stage met.

## Exact next action
Run `get_session self` and stop unless it reports `claude-fable-5-1` at `high`. Then load the persona (fable edition), `docs/operator-protocol.md` and `AGENTS.md`, read this handoff and the results file's Notes, and write the threshold ruling first (item 3 of the notes), then the rest of `docs/assessment-2026-10-30-f4.md`.

## Cost projection
Fable 5.1, high, fresh: T 45, F 3,000, O 3,000, B 85,240 (measured), R 44,000 (estimate), H 5,000: 14.71 USD as a piece, 14.76 as the fresh side with the handoff (calculator, `pricing/2026-10-29.json`); the F2 roadmap's range was 8 to 12, so quote 9 to 15. This H2 session, for the record: about 5 USD (estimate: 65 turns at about 350,000 average context, 520,000 tokens of messages written, about 150,000 output). Subjects: 6.98 million Sonnet and 4.21 million Haiku tokens measured, split unreported; about 0.8 to 7.8 USD, central 4 (estimate: 90 percent cache read, 8 percent cache write, 2 percent output, Haiku at its long-context rates).

## Time projection
F4 about 45 to 75 minutes wall clock (protocol section 7, Fable). H2 took about 50 minutes (16:31 to about 17:20 on the session clock; 120 runs of 0.6 to 3.8 minutes, 10 per batch). Operator review of the results and the ruling about 20 minutes.

## Session dispatch decision
Date: 2026-10-30. Decided by: claude-sonnet-5-5, effort medium, in Claude Code (desktop app). Price table: `pricing/2026-10-29.json` (age 1 day). Command: `node scripts/dispatch.mjs --json docs/dispatch/2026-10-30-h2-f4.json --today 2026-10-30`.

### Inputs
| Input | Value | Source |
|---|---|---|
| Formula | 2026-10-29 | `SKILL.md` step 2 |
| Current, target model | claude-sonnet-5-5; claude-fable-5-1 | `get_session self`; matrix row 2 (reassessment and acceptance of results), the table's fable row |
| W, K | 1,000,000; 970,000 | Usage tool, 97 percent |
| C0 | 609,651 | Measured, `get_usage self` at the close |
| Compacted, unrecorded context | no; none (the figures are in the results file) | Measured; listed |
| T, F, O | 45; 3,000; 3,000 | Estimates (O at high) |
| B, R, H | 85,240; 44,000; 5,000 | B measured (609,651 less Messages 524,411); R itemised in the dispatch file; H estimate |
| M, L | 0; 0 | Unmeasured; empty list |

### Step A and B
Calculator: G 6,000; C_end 879,651, crosses false; cost_continue 5.38 USD on Sonnet, cost_fresh 14.76 on Fable; T* n/a (the model changes). Draft verdict: fresh, by class (the work needs Fable and this session is Sonnet), margin 9.39 USD. Piece: F4, claude-fable-5-1, high, serial, oracle the scorer's results file and the threshold text of F2 section 3.6; 14.71 USD.

### Guardrails and adversarial pass
1 no (T 45); 2 not compacted, crosses false, context 61 percent (a handoff is due anyway); 3 none; 4 the table's fable row; 5 age 1 day, no null; 6 the scorer is the oracle; 7 within the cap (this record about 1,300 tokens, about 6 minutes); 8 this session is Sonnet at medium as its handoff says. Opposite verdict, continuing here: this session holds the run provenance, but it cannot do Fable-class work and carries about 520,000 tokens of copied prompts F4 does not need; the class guardrail binds whatever the cost. Adverse T 90 roughly doubles both sides (estimate, not rerun); the class verdict holds.

### Final verdict and cost of deciding
Fresh, claude-fable-5-1, effort high. Exact next action above. Cost of deciding: about 1,800 tokens read (the dispatch file and the calculator output), about 1,300 written (this record, characters divided by 4), about 6 minutes, about 0.1 USD at the Sonnet rates (all self-estimates).
