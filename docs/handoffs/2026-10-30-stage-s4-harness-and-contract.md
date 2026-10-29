---
stage: "Stage S4: harness hardening and evaluation contract"
model: claude-sonnet-5-5
effort: medium
status: ready
created: 2026-10-30
from: "Session local_1edc5e80 (Fable 5.1, high): Stage F4, the reassessment on H2"
---

# Stage S4: harness hardening and evaluation contract

## Goal
Make the evaluation measure the subjects instead of asking them, and fix the places where its contract rejected the skill's own behaviour (`docs/assessment-2026-10-30-f4.md` sections 2.2, 2.4, 2.5, 2.7). Done when: `node eval/run.mjs run --runner cli` runs prepared prompts through `claude -p` from the sandbox and writes measured usage and cost per run; `prepare` merges into an existing manifest; the gate recomputes term lines and the Step B column; the prompt, rubric and scorer carry the contract fixes below with a test each; scenario 21 exists and `checkEval` passes on 21 scenarios; `node scripts/check.mjs` exits 0 and `npm test` passes, counts quoted; all committed by name on `main` (or on this session's branch, if the coordinating session gave it a worktree).

## Decisions already made
- F4's ruling stands: Haiku's threshold was not met on the scorer's count; the class floor goes into `SKILL.md` in Stage S5, not here. This stage edits nothing in `SKILL.md`, `templates/` or `adapters/`.
- Contract fixes, each with the reason in F4 section 2: `t_star` is null when the model changes and `never` only when C0 is not above B + R (prompt wording; the scorer's rule stays); `cost_of_deciding.usd` is string or null, null meaning not priced (rubric section 2, prompt, scorer types); the block goes on its own lines after the last table, never inside a table cell (prompt); rubric row 7 and `takesCapDefault` keep `incomplete` where guardrail 5 is listed (F3-1); `record_tokens` is `record.txt` less the result block (F3-5); the overrun diagnostic reports "flagged n, of which m fail a bound outcome guardrail" (F3-6); scenario 17's note gets its missing join (F3-3).
- Scenario 21, `21-cap-no-draft`: scenario 17's shape (a resumed decision, 11 minutes used) with "the record so far covers step 1 only"; expected `continue` on the brief's own model and effort, `guardrails` [7], `draft_required` false, `skill_runs` true; the calculator still prices it for `checkEval`. Expectations of scenarios 01 to 20 do not move.
- The runner: the `Agent` path stays documented for H1 and H2's comparability; the CLI path is for H3 and later. Probe first (F2-8): one CLI run that asks the subject which instruction files and skills it loaded; if it names the installed copy of this skill or any `AGENTS.md`, isolate the home directory or the settings sources and say how in `eval/README.md`.
- H2's manifest was merged by hand from two `prepare` calls; `prepare` now merges (F2-10).
- Order of commits: contract and scenario 21; the CLI runner and probe; `prepare` merge; the gate's term lines (F1-3). One logical change per commit.
- Prose: Australian English, no em-dashes, none of the persona's banned words; the gate enforces the last two. Stage files by name, never `git add -A`.

## Files and links that matter
- `eval/subject-prompt.md` (the fenced prompt; record the edit date and reason above the fence as O3 did), `eval/rubric.md` sections 2, 4, 6 and 7, `eval/score.mjs` (types at about line 73, `takesCapDefault`, `record_tokens` in `decide`, the overrun diagnostic), `eval/run.mjs` (`prepare`, `loadManifest` at about line 123; the new `run` command), `eval/scenarios/17-decision-cap.json` (notes) and the new `eval/scenarios/21-cap-no-draft.json`, `eval/README.md` (the scenario table, the measured-position paragraph: update it with H2's figures and F4 section 1), `scripts/check.mjs` (`recomputeExample`, `checkEval`), `scripts/eval-score.test.mjs`, `scripts/eval.test.mjs`, `scripts/check.test.mjs` or its equivalent.
- `docs/assessment-2026-10-30-f4.md` sections 2.2 to 2.7 (the reasons); `docs/acceptance-2026-10-30-stage-o3.md` section 6 (F3-1 to F3-6 as first written); `docs/acceptance-2026-10-29-stage-o1.md` F1-3.
- The two H2 records that motivate two of the fixes: `eval/runs/2026-10-31/12-crosses-design-heavy.haiku.calculator/record.txt` (block inside a table cell) and `eval/runs/2026-10-31/14-stale-table.haiku.calculator/record.txt` (`usd` null). Do not rescore H2; its figures stay.

## Verified facts
- `node scripts/check.mjs`: 97 files, 0 findings; `npm test`: 35 pass, 0 fail (F4's close, 2026-10-30; the stage report quotes the exact run).
- H2 arithmetic errors by figure, from the 120 `score.json` files (F4, script): Sonnet calculator 8 of 9 error runs are `t_star` "stated where the recompute has none", hand 6 of 7; every such record's own line reads "T* = n/a: the model changes" with `"t_star": "never"` in the block.
- H2 record sizes: median 2,179 to 2,610 tokens per cell, largest 3,256 (`07-split-plan.sonnet.hand`); the block is 150 to 250 tokens of that.
- The CLI's flags `claude -p`, `--model`, `--output-format json` are as F2 section 3.6 names them; confidence medium that the JSON output carries usage and cost per run. Check `claude --help` first and record what it reports.

## Work completed
- None in this stage. F4's commit holds this handoff, the assessment and `docs/dispatch/2026-10-30-f4-roadmap.json`.

## Unresolved questions
- Maintainer (this stage): whether the CLI subject loads the user's instruction files or installed skills (the probe answers it).
- Coordinating session: whether S4 and S5 run side by side (disjoint files except one `README.md` changelog line each; the second to land rebases its line).

## Exact next action
Run `get_session self` and stop unless it reports `claude-sonnet-5-5` at `medium`. Then load `ENGINEERING_PERSONA.sonnet.md`, `ENGINEERING_PERSONA_LANGUAGES/node-ts-js.sonnet.md` and `ai-prompting.sonnet.md`, `docs/operator-protocol.md` and `AGENTS.md`, read this handoff and F4 section 2, and start with the first commit: the prompt's `t_star` sentence, with the scorer test that a block carrying `"never"` for a model change is an error and one carrying null is not.

## Cost projection
Sonnet 5.5, medium, fresh: T 50, F 3,000, O 2,000, B 87,114 (measured), R 27,000 (estimate), H 4,000: 3.11 USD as a piece, 3.31 as the fresh side with the handoff (calculator, `pricing/2026-10-29.json`); quote 2.5 to 5. The dry run's two CLI subjects: about 0.1 to 0.4 USD (estimate; the CLI reports the figure).

## Time projection
45 to 60 minutes wall clock (protocol section 7, Sonnet, four commits); the probe and dry run about 5 minutes of subject time. Operator review about 20 minutes.

## Session dispatch decision
Date: 2026-10-30. Decided by: claude-fable-5-1, effort high, in Claude Code (desktop app). Price table: `pricing/2026-10-29.json` (age 1 day). Command: `node scripts/dispatch.mjs --json docs/dispatch/2026-10-30-f4-roadmap.json --today 2026-10-30`.

### Inputs
| Input | Value | Source |
|---|---|---|
| Formula | 2026-10-29 | `SKILL.md` step 2 |
| Current, target model | claude-fable-5-1; claude-sonnet-5-5 | `get_session self`; matrix row 2 (scoped changes with tests as the oracle), the table's sonnet row |
| W, K | 1,000,000; 970,000 | Usage tool, 97 percent |
| C0 | 258,108 | Measured, `get_usage self` before the roadmap was priced |
| Compacted, unrecorded context | no; none (this handoff and the assessment hold the reasons) | Measured; listed |
| T, F, O | 50; 3,000; 2,000 | Estimates (O at medium) |
| B, R, H | 87,114; 27,000; 4,000 | B measured (258,108 less Messages 170,994); R itemised in the dispatch file; H estimate |
| M, L | 0; 0 | Unmeasured; empty list |
| Task type, design-heavy, outward steps | row 2; no; none (local commits; the coordinating session pushes under `approvals.push_origin`) | Step 3.1; the stage's oracle is tests and the gate |

### Step A and B
Calculator: G 5,000; C_end 508,108, crosses false; cost_continue 12.91 USD on Fable, cost_fresh 3.31 on Sonnet; T* n/a (the model changes); split not computed (the target is below Opus). Draft verdict: fresh, by cost, margin 9.61 USD (290.6 percent of the smaller). Piece: S4, claude-sonnet-5-5, medium, serial within the stage, parallel to S5; oracle the tests, the gate and the two-run dry run; 3.11 USD.

### Guardrails and adversarial pass
1 no (T 50); 2 not design-heavy, not compacted, crosses false; 3 none; 4 the table's sonnet row; 5 age 1 day, no null; 6 acceptance of this stage is by Stage F5 (Fable, high, above row 4's Opus) reading two H3 runs by hand against the CLI's usage, as F3 did for H1, with the dry run and the tests as the stage's own oracle; the risk accepted is that a runner fault found at F5 reruns H3 (about 2 to 6 USD); 7 within the cap (this record about 900 tokens, about 4 minutes); 8 this session is Fable at high as its handoff says; the front matter above says Sonnet at medium, at or below the coordinating session's class. Opposite verdict, continuing here: this session holds the reading of every record and fault and would type the fixes without a handoff, but at Fable prices and 258,000 tokens of context it costs four times the Sonnet session for work whose oracle is a test suite; the loss a handoff risks is the exact wording of the fixes, which the assessment and this file carry. Adverse T 100: 25.8 against 6.6 USD; adverse C0 30 percent low: about 11.5 against 3.31; misses favour fresh. Verdict holds, not fragile.

### Final verdict and cost of deciding
Fresh, claude-sonnet-5-5, effort medium. Exact next action above. Cost of deciding: about 2,000 tokens read (the dispatch file and the calculator output), about 1,000 written (this record, characters divided by 4), about 4 minutes, about 0.08 USD at the Fable rates (all self-estimates).
