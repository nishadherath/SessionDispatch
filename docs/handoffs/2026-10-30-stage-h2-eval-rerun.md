---
stage: "Stage H2: rerun on the revised text, 120 runs"
model: claude-sonnet-5-5
effort: medium
status: ready
created: 2026-10-30
from: "Session local_43d442db (Fable 5.1, high): Stage F3, adversarial acceptance of Stage O3"
---

# Stage H2: rerun on the revised text, 120 runs

## Goal
Run the evaluation on the text as it stands after O3 (accepted by F3, `docs/acceptance-2026-10-30-stage-o3.md`) and score it: Sonnet twice per scenario in both arms (80 runs), Haiku once per scenario in both arms (40 runs), D9 option A. Done when every run has a `score.json`, `eval/results-<date>.md` exists with n beside every rate and the pre-registered thresholds stated in its notes before the figures, the scenario 17 comparability note and the F3-2 and F3-6 reading notes are in it, `node scripts/check.mjs` exits 0 and `npm test` passes with counts quoted, the F4 handoff is written, and all of it is committed by name on `main`. Quote the cost.

## Decisions already made
- The runner is H1's: one `Agent` call per run (`subagent_type` general-purpose, `model` the subject), the full `prompt.txt` as the prompt, usage from the result's block. H1 ran on it, and a harness change between H1 and H2 would confound the text change (F3-7). S4's CLI runner is for the runs after F4. The coordinating session may reverse this by waiting for S4; until it says so, this stands.
- The contract is `eval/rubric.md`, `eval/subject-prompt.md` and the scenarios as committed; none is edited here. A defect in any of them is the five-line escalation (persona section 3.4) to the coordinating session. `SKILL.md`, `scripts/` and `eval/score.mjs` are not touched.
- One change to `eval/run.mjs` is in scope, first: a repeat index on the run id, so that two Sonnet runs of one scenario and arm have distinct ids, sandboxes and run folders (`<scenario>.<subject>.<arm>` for the first, a suffix such as `.2` for the second, F3-4). `summarise` groups by subject and arm, so n = 40 needs nothing else. A test in `scripts/eval-score.test.mjs` (beside the `prepare` dating test) is the oracle; `prepare` still rewrites the manifest (F2-10), so prepare the whole set in one call per subject set or merge by hand as H1 did, and say which.
- Thresholds, fixed in F2 section 3.6 before any run: "a procedure for Sonnet" holds if both Sonnet cells reach 38 of 40 (lower bound 83.5 percent) and the calculator arm reaches 40 of 40; the Sonnet arms are called different only if Fisher's exact p is under 0.05; Haiku runs the skill only if its calculator cell reaches 18 of 20 (lower bound 69.9), else the text gains a class floor and D8 stages variant C. State them in the results notes before the figures.
- H1's figures stay the H1 result. Scenario 17 is not comparable between H1 and H2 (its expectation moved with the rule, ruled 2026-10-30); say so beside any comparison. The over-cap column is now the record's measured size and the minutes; H1's column was the old rule's (F3-2: by hand the old rule gives 19, 18, 16, 12 with the two formerly unscorable runs read).
- The "overrun, default not taken" diagnostic is read after subtracting runs that fail a bound outcome guardrail without listing it (F3-6).
- Never `SendMessage` a subject; subjects write `record.md` in their sandbox and reply "done"; no `record.txt` or `score.json` is read into context in bulk; the results file is the reading.
- Prose: Australian English, no em-dashes, none of the persona's banned words. Stage files by name; never `git add -A`. Commits only; the coordinating session pushes and starts F4.

## Files and links that matter
- `eval/run.mjs` (`prepare`, `usage`, `collect`, `score`; the run id at the `prepare` loop), `scripts/eval-score.test.mjs` (its `prepare` test at line 207), `eval/README.md` "Running it".
- `docs/handoffs/2026-10-30-stage-h1-eval-runs.md`: the `Agent` runner facts, restated below.
- `eval/results-2026-10-30.md`: H1's figures and the O3 rescoring note; `eval/rubric.md` sections 6 to 8 (the measures and the report); `eval/subject-prompt.md` (its dated edit note: record the edit and the new hashes in the results header).
- `docs/assessment-2026-10-30-f2.md` section 3.6 ("Repeating cells") for the thresholds; `docs/acceptance-2026-10-30-stage-o3.md` sections 4.2, 4.3 and 6.

## Verified facts
- `node scripts/check.mjs`: 93 files read, 0 findings, exit 0 before F3's files; `npm test`: 34 tests, 34 pass, 0 fail, 59.8 s (2026-10-30, Node 26.7.0).
- The `Agent` result's usage block carries `subagent_tokens` (one total), `tool_uses` and `duration_ms`; no input and output split and no model id. `usage --models haiku=claude-haiku-5-5,sonnet=claude-sonnet-5-5` names the ids (each subject's own system prompt stated them, H1). A sub-agent writes under `os.tmpdir()` without a prompt and loads the project's `AGENTS.md` and `MEMORY.md` (validity threat, rubric section 9; unchanged from H1). `Agent` returns at once; the finished run arrives as a task notification; launch about 10 runs per message (H1 handoff, 2026-10-30).
- `prepare` names a run `${sc.id}.${subject}.${arm}`, puts its sandbox under `os.tmpdir()/sd-eval/<date>/<id>/` and refuses a second record for the same id without `--force` (`eval/run.mjs` lines 87 to 89, read 2026-10-30). `summarise` keys cells by subject and arm (`eval/score.mjs` line 317).
- H1 records: 2,278 to 2,496 tokens median per cell, largest 3,596; runs 0.7 to 3.6 minutes; 76,262 to 119,228 tokens measured per run (F2 section 3.4, F3 section 4.2).
- `node scripts/dispatch.mjs --json docs/dispatch/2026-10-30-f3-h2.json --today 2026-10-30`: the block below.

## Work completed
- Stage O3 accepted: `docs/acceptance-2026-10-30-stage-o3.md`, sixteen claims accepted, seven findings handed on. Commit named "docs(acceptance): Stage F3" in `git log`.

## Unresolved questions
- Coordinating session: the runner (F3-7). Decision: H2 on the `Agent` runner now, or after S4 on the CLI runner. Options: A now on `Agent` / B after S4 on the CLI runner. Pros and cons: A keeps H1 and H2 on one harness so F4 attributes any change to the text, costs nothing in waiting, keeps the `AGENTS.md` load and the unsplit usage; B gives measured USD and a clean subject context but changes two things at once and waits on S4 (30 to 45 minutes of Sonnet plus review). Blast radius: A one more results file with the H1 caveats; B an H2 whose moves F4 cannot attribute. Recommended: A, for attribution. This handoff is written for A.
- F4: F3-1 (rubric row 7 against the guardrail order where 5 and 7 both bind), F3-5 (the scorer's record size is the whole file), F3-6, and whether a 21st scenario covers guardrail 7's fallback branch.
- Operator: none. D8 and D9 are decided.

## Exact next action
Run `get_session self`; stop unless it reports `claude-sonnet-5-5` at `medium`. Then read `eval/run.mjs` lines 71 to 115 and add the repeat index to `prepare` (a `--repeat <n>` flag, default 1, suffixing the run id, sandbox and run folder for the second and later runs) with its test in `scripts/eval-score.test.mjs`; run `npm test` and the gate; commit it by name. Then `node eval/run.mjs prepare --date <today> --subjects sonnet --arms calculator,hand --repeat 2` and `--subjects haiku --arms calculator,hand`, and launch the prompts in batches of about 10.

## Cost projection
Sonnet 5.5, medium, fresh: T 45, F 3,000, O 2,000, B 87,114 (measured), R 26,000 (estimate, listed in the dispatch file), H 3,500: 2.76 USD as a piece, 2.94 as the fresh side with the handoff (calculator, `pricing/2026-10-29.json`); T 90 gives 6.43. Subjects: 80 Sonnet and 40 Haiku runs at the harness totals H1 measured, 3 to 18 USD (F2 section 6's range; the split is unreported). Quote 3 to 7 for the session plus 3 to 18 for the subjects.

## Time projection
One runner change about 10 minutes; 120 runs of 0.7 to 3.6 minutes in batches of 10, about 30 to 50 minutes of waiting; 45 to 75 minutes wall clock in all (protocol section 7, Sonnet, at the top of the range). Operator review of the results about 15 minutes.

## Session dispatch decision
Date: 2026-10-30. Decided by: claude-fable-5-1, effort high, in Claude Code (desktop app). Price table: `pricing/2026-10-29.json` (age 1 day). Command: `node scripts/dispatch.mjs --json docs/dispatch/2026-10-30-f3-h2.json --today 2026-10-30`.

### Inputs
| Input | Value | Source |
|---|---|---|
| Formula | 2026-10-29 | `SKILL.md` step 2 |
| Current, target model | claude-fable-5-1; claude-sonnet-5-5 | `get_session self`; matrix row 2 (orchestration of sub-agent runs with the scorer as oracle, as H1), the table's sonnet row |
| W, K | 1,000,000; 970,000 | Usage tool, 97 percent |
| C0 | 277,486 | Measured, `get_usage self` after the probes |
| Compacted, unrecorded context | no; none (the findings are in the acceptance note) | Measured; listed |
| T, F, O | 45; 3,000; 2,000 | Estimates: the runner change, 12 launch batches, usage, collect, score, the results notes, the F4 handoff; O at medium |
| B, R, H | 87,114; 26,000; 3,500 | B measured (277,486 less Messages 190,372); R and H estimates, R itemised in the dispatch file |
| M, L | 0; 0 | Unmeasured; empty list |
| Task type, design-heavy, outward steps | row 2; no; none (commits only) | |

### Step A and B
Calculator: G 5,000; C_end 502,486, crosses false; cost_continue 11.70 USD on Fable, cost_fresh 2.94 on Sonnet; T* n/a (the model changes); cost_split not computed (the target is below opus). Draft verdict: fresh, by cost, margin 8.76 USD (298.6 percent of the smaller). Piece: H2, claude-sonnet-5-5, medium, serial with the subjects in parallel batches, oracle the 120 `score.json` files and the results file with the gate green; 2.76 USD plus the subjects.

### Guardrails and adversarial pass
1 no (T 45); 2 not compacted, crosses false; 3 none; 4 the table's sonnet row; 5 age 1 day, no null; 6 F4 (Fable, high) reads the results, the scorer is the oracle; 7 within: this record about 1,100 tokens, about 6 minutes; 8 this session is Fable at high as its handoff says. Opposite verdict, continuing here: this session holds the probes and the runner facts and would launch the batches without reading in; against it, the work is matrix row 2, the Fable rate makes every launch turn four times the Sonnet price of the same turn, and the 190,000 tokens of messages here are acceptance material H2 does not need. Adverse T 90: 25.93 against 6.43, holds at 303.5 percent. Adverse R 50,000: fresh rises by about 0.1 USD, holds. No input inside its stated range moves a verdict at this margin.

### Final verdict and cost of deciding
Fresh, claude-sonnet-5-5, effort medium. Exact next action above. Cost of deciding: about 1,500 tokens read (the dispatch file and the calculator output) and 1,100 written (this record, characters divided by 4, self-estimate), about 6 minutes (self-estimate, from the calculator run to this line), about 0.07 USD at the Fable rates (self-estimate).
