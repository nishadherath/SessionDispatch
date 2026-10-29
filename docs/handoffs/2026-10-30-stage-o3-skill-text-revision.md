---
stage: "Stage O3: skill text revision and evaluation contract from the F2 verdicts"
model: claude-opus-5-5
effort: high
status: ready
created: 2026-10-30
from: "Session local_bf52bc77 (Fable 5.1, high): Stage F2, reassessment on the evaluation results"
---

# Stage O3: skill text revision and evaluation contract

## Goal
Write the verdicts of `docs/assessment-2026-10-30-f2.md` section 3.6 into `SKILL.md`, the templates and the evaluation contract, without changing the step 2 formula or any scenario's expected values. Done when the text carries each verdict as written there, the rubric, prompt and scorer accept a null `target`, the two unscorable runs are rescored with both figures in the results file, `node scripts/check.mjs` exits 0 with `checkEval` showing every scenario unchanged, `npm test` passes, `docs/status.md` and the `README.md` changelog are updated, three commits are on `main` by name, and the F3 handoff is written.

## Decisions already made
- The verdicts are F2's (matrix row 5) and are not reopened here: cap and default (guardrail 7, step 0), guardrail 1 wording and the precedence line in step 4, step 5.3 and 5.4's adverse-value rule, matrix row 4's one effort rule with guardrail 6 and protocol section 2 pointing at it, step 2.1's two sentences (F1-5), step 1.4.4's null target, step 6's measured-figure rule. Section 3.6 has the wording and the reason for each; the reason goes into the text only where the skill already explains itself (step 0, step 2's verdict rule).
- No formula change: F1-1 is Stage O4 after H2 so that H2 stays comparable with H1. `scripts/dispatch-core.mjs` is not touched; `scripts/dispatch.mjs` only if a printed line names the cap.
- No scenario's `expected` values change; `notes` may gain a line naming the rule now that the text states it. The gate's `checkEval` is the oracle for this.
- Rescore only the two type-rejected runs (15-null-price.sonnet.hand, 16-outward-release.haiku.hand). Scenario 18's `not-run` model rule is prospective: the prompt says the session's own model, as for `stop`; no rescoring, no expectation change.
- Prose: Australian English, no em-dashes, none of the persona's banned words. Stage files by name; never `git add -A`. The coordinating session pushes and starts F3.

## Files and links that matter
- `docs/assessment-2026-10-30-f2.md` sections 3.4 to 3.6: the figures and the verdicts; 6.1 for this stage's oracle.
- `SKILL.md` step 0 (budget paragraph), 1.4.4, 2.1, 3.1 row 4, 4 (guardrails 1, 6, 7 and a new precedence line), 5.2 to 5.4, 6 (cost table).
- `templates/decision-record.md` (cost rows: a source column that says measured or self-estimate); `docs/operator-protocol.md` section 2, the Fable effort sentence (pointer to matrix row 4).
- `eval/rubric.md` section 2 (`target` string or null; `final.model` for `not-run`), section 4 (a diagnostic: overrun recorded, default not taken), section 6 (`over_cap` against the new cap: record tokens above 4,000 or minutes above 10); `eval/subject-prompt.md`; `eval/score.mjs`; `scripts/eval-score.test.mjs`; `eval/README.md` (the two-answer list becomes "settled by F2, text in O3", plus the fourth place); `eval/results-2026-10-30.md` (dated rescoring note).
- `eval/runs/2026-10-30/<run>/record.txt` for the two runs only.

## Verified facts
- Gate `node scripts/check.mjs`: 90 files read, 0 findings, exit 0; `npm test`: 31 pass (2026-10-30, F2's start and close).
- Haiku's 19 misses all list guardrail 7; 14 of 17 scored drafts were correct (F2 section 3.2, from the `score.json` files). Sonnet named an overrun in 9 calculator and 13 hand records and took the default in 3 per arm.
- Reading before writing: `SKILL.md` 24,727 characters, templates 4,882, table 4,146, examples 20,236 (`wc -c`, 2026-10-30). Records on file: 2,278 to 2,496 tokens median per cell, 3,596 largest (characters divided by 4). Measured run minutes: 3.6 largest.
- The two unscorable blocks: 15-null-price.sonnet.hand has `final.outcome` `incomplete`, `model` null, `guardrails_triggered` [5]; 16-outward-release.haiku.hand has `continue`, guardrail [7], a non-empty approval step. Under a string-or-null `target`, the first passes measure 1 and the second does not.
- Scenario 17's brief states 8,400 tokens and 11 minutes spent, so guardrail 7 still binds on its time clause after the cap change.

## Work completed
- Stage F2: `docs/assessment-2026-10-30-f2.md`, `docs/dispatch/2026-10-30-f2-roadmap.json`, this handoff, status and changelog; commit named "docs(assessment): Stage F2" in `git log`.

## Unresolved questions
- Operator: D8 (variant C) and D9 (H2's size), in the assessment's section 7; neither blocks this stage.
- F3: whether the wording of each verdict matches section 3.6 and whether `over_cap`'s new rule is applied to the H1 scores consistently (the results file is rescored under the new scorer, so the over-cap column will change; the note must say so).

## Exact next action
Run `get_session self`; stop unless it reports `claude-opus-5-5` at `high`. Read this file, then `docs/assessment-2026-10-30-f2.md` sections 3.4 to 3.6 and 6.1, then `SKILL.md` step 0, 4 and 5. Make the step 0 and guardrail 7 change first and run the gate.

## Cost projection
Opus 5.5, high, fresh: T 60, F 3,000, O 2,500, B 87,075, R 30,000: 8.62 USD as a piece, 8.80 as the fresh side with the handoff (calculator, `pricing/2026-10-29.json`); T 120 gives 20.79. Quote 7 to 12.

## Time projection
45 to 75 minutes of Opus wall clock (protocol section 7); operator review about 30 minutes.

## Session dispatch decision
Date: 2026-10-30. Decided by: claude-fable-5-1, effort high, in Claude Code (desktop app). Price table: `pricing/2026-10-29.json` (age 1 day). Command: `node scripts/dispatch.mjs --json docs/dispatch/2026-10-30-f2-roadmap.json --today 2026-10-30`.

### Inputs
| Input | Value | Source |
|---|---|---|
| Formula | 2026-10-29 | `SKILL.md` step 2 |
| Current, target model | claude-fable-5-1; claude-opus-5-5 | `get_session self`; matrix row 3 (the procedure's guardrails and text), the table's opus row |
| W, K | 1,000,000; 970,000 | Usage tool, 97 percent |
| C0 | 234,072 | Measured, `get_usage self` after the reading phase |
| Compacted | no | Measured |
| T, F, O | 60; 3,000; 2,500 | Estimates: three commits, text and tests; O at high |
| B, R, H | 87,075; 30,000; 3,500 | B measured (234,072 less Messages 146,997); R estimate (assessment sections 12k, SKILL.md 6k, rubric 4k, prompt 1k, scorer 5k, this file 2k); H this file / 4 |
| M, L, Ta, Ra | 0; 0; 20; 35,000 | Unmeasured; the split's acceptance as F3's size |
| Task type, design-heavy, outward steps | row 3; yes; none | The text is the procedure; commits only, the coordinating session pushes |

### Step A and B
Calculator: G 5,500; C_end 564,072, crosses false; cost_continue 17.61 USD on Fable, cost_fresh 8.80 on Opus; T* n/a (the model changes); cost_split 7.35 (brief, Sonnet run, Opus acceptance), 19.6 percent under fresh. Draft verdict: fresh, by cost, margin 8.82 USD (100.2 percent of the smaller). Split: not an option, because the run is matrix row 3 work (guardrail wording and precedence cannot be reduced to a row 1 or 2 brief), so the figure is shown and not taken. Piece: O3, Opus, high, serial, oracle in the goal; F3 (Fable, high) accepts it.

### Guardrails and adversarial pass
1 no (T 60); 2 not compacted, crosses false; 3 none; 4 the table's opus row; 5 age 1 day, no null needed; 6 F3 is one class above; 7 within (about 5,000 tokens read and 2,000 written for this record); 8 this session is Fable at high as its handoff says. Opposite verdict, continuing here: the context already holds the verdicts and their evidence, and a Fable session would write the text in fewer turns; against it, the work is Opus-class by the matrix, this session holds 147k tokens of messages O3 does not need, and continuing costs twice as much. Adverse T 120: 40.17 against 20.79, holds. Adverse R 60,000: fresh rises by about 0.2 USD, holds. No input moves the verdict inside the band.

### Final verdict and cost of deciding
Fresh, claude-opus-5-5, effort high. Exact next action above. Deciding cost: about 5,000 tokens read and 2,000 written, about 5 minutes, about 0.16 USD at the Fable rates (estimate), inside the cap.
