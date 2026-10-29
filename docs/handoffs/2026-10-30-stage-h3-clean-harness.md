---
stage: "Stage H3: clean-harness regression, 42 runs"
model: claude-sonnet-5-5
effort: medium
status: ready
created: 2026-10-30
from: "Session local_ddab9c5b (Sonnet 5.5, medium): Stage S4, harness hardening and evaluation contract"
---

# Stage H3: clean-harness regression, 42 runs

## Goal
Measure the skill once on a clean harness, on the text as Stage S5 leaves it: 21 scenarios, the Sonnet and Haiku subjects, the calculator arm, one run each (42 runs), through `node eval/run.mjs run --runner cli`. Done when every run has a `usage.json` and a `score.json`, `eval/results-<date>.md` exists with n beside every rate and the thresholds below stated in its notes before the figures, `node scripts/check.mjs` exits 0 and `npm test` passes with counts quoted, the F5 handoff is written, and the runs, results file and handoff are committed by name on `main`. Quote the measured cost from the runs' `usage.json` (`usd_priced`), not an estimate.

## Decisions already made
- Thresholds, fixed in `docs/assessment-2026-10-30-f4.md` section 3.6 before any run: Sonnet calculator at 20 of 21 or more (Wilson lower bound 77.3 percent) keeps the Sonnet claim on the clean harness; Haiku calculator at 19 of 21 or more (71.1 percent) says the contract fixes, not the subject, were the H2 misses; below either, F5 reads the misses and says which it is. State them in the results notes before any figure.
- The runner is the CLI runner of Stage S4 (`eval/README.md`, "The CLI runner"). The `Agent` path stays for H1 and H2's comparability and is not used here. The harness differs from H2's (no `AGENTS.md` or `MEMORY.md` load, no installed skills or hooks, measured usage), so H2 to H3 moves are not attributable to the text alone; say so in the notes.
- H3 runs on the text as S5 leaves it. Check first that S5's commit is on `main` (`git log --oneline -- SKILL.md` shows a Stage S5 commit after `4541134`) and stop if it is not; the manifest records the `SKILL.md` hash.
- Scenario 21 is new (S4): its expected result is `continue` on the brief's own model and effort with guardrail 7 bound and no draft required. Scenarios 01 to 20 are unchanged, so the first twenty are comparable with H2 cell by cell (scenario 17 is not comparable with H1).
- The block contract changed in S4 (prompt, dated note above the fence): `t_star` null on a model change, `cost_of_deciding.usd` string or null, the block on its own lines after the last table. H2's two Haiku format failures should not recur; if either does, report it, do not repair it.
- Do not edit `SKILL.md`, the scenarios, the rubric, the prompt or `eval/score.mjs`. A defect in any is the five-line escalation (persona section 3.4) to the coordinating session. Do not rescore H1 or H2.
- Prose: Australian English, no em-dashes, none of the persona's banned words. Stage files by name; never `git add -A` (the root `.ignore` and `graft/` belong to a tool). Commits only; the coordinating session pushes and starts F5.

## Files and links that matter
- `eval/README.md` "The CLI runner": flags, the isolation, `usage.json` fields, the probe and dry-run findings.
- `eval/run.mjs` (`prepare`, `run`, `collect`, `score`); `eval/rubric.md`; `eval/subject-prompt.md` (two dated edit notes); `eval/results-2026-10-31.md` (H2's notes, the format to follow).
- `docs/assessment-2026-10-30-f4.md` sections 1.4, 2.6 and 3.6 (thresholds, what H3 can and cannot attribute).
- `docs/dispatch/2026-10-30-s4-close.json`: the dispatch decision below.

## Verified facts
- The probe (2026-10-30, `claude` 2.1.289, one Sonnet run, Q: which instruction files, memory files and skills are in your context): a default `claude -p` from a sandbox outside the repository loads no `CLAUDE.md`, `AGENTS.md` or `MEMORY.md`, but lists the user's installed skills, **`session-dispatch` (the installed copy) among them**, and runs the user's session-start hooks (four `[trail]` lines reached the subject). With `--disable-slash-commands --setting-sources project` the same question returned no skill, no hook text and no instruction file. The runner passes both flags and `--no-session-persistence`; the home directory is not isolated (the sign-in stays).
- Model ids: `claude-sonnet-5-5` and `claude-haiku-5-5` are accepted. For `claude-haiku-5-5` the CLI prints an `unrecognized_model` notice and states `costBasis: "unknown"`; its cost is not credible (4.47 USD for a run the table prices at 0.04 USD), and `--max-budget-usd` counts that figure (a 1.5-minute Haiku run stopped at its first turn on a 2 USD budget). Do not pass `--max-budget-usd`. The `haiku` alias resolves to an older Haiku (`claude-haiku-4-5-20251001`); ids go in whole, as the runner does.
- Dry run (hand arm, scenario 03, one run each, CLI as above): Sonnet 25 turns, 1,590,608 tokens (1,423,358 cache reads), 83.7 s, 0.6251 USD priced from the table (the CLI reports 1.0053 USD, basis list); Haiku 16 turns, 1,370,205 tokens, 241.8 s, 0.0422 USD priced (CLI 4.4739, basis unknown). Both wrote a record; `collect` and `score` ran on them. The measurements are one run per cell and the hand arm: the calculator arm may take more or fewer turns.
- **The calculator arm's `Bash(node *dispatch.mjs*)` grant is untested.** The first dry-run attempt, with the calculator arm's broader grant (`Bash`, `--permission-mode dontAsk`), was refused by the Claude Code auto-mode classifier ("Create Unsafe Agents"). The hand arm (Read and Write only) ran. The scoped Bash grant has a unit test on its arguments (`scripts/eval-run.test.mjs`) and no live run. Run one calculator-arm scenario first (`run --only 03-break-even-continue.sonnet.calculator`); if the classifier or the CLI refuses, stop and ask the operator for a Bash allow rule for this one command, or escalate; do not widen the grant yourself.
- Gate and tests at S4's close are in the stage report that started this handoff: the commits are `132b778`, `4541134`, `6c3ee4c`, `7b179e5` and the docs commit that carries this file.
- `node scripts/dispatch.mjs --json docs/dispatch/2026-10-30-s4-close.json --today 2026-10-30`: the record below.

## Work completed
- S4 (this handoff's parent): the contract fixes and scenario 21 (`132b778`), the CLI runner and probe (`4541134`), `prepare` merging into the day's manifest (`6c3ee4c`), the gate's term-line and Step B recompute (`7b179e5`).
- Not done: S5 (the skill text) and S3 (adapter verification).

## Unresolved questions
- Maintainer (this stage): whether the calculator arm runs under the scoped Bash grant (the first action answers it).
- Coordinating session: the subjects' cost. F4 estimated 1 to 5 USD for 42 subjects; the one hand-arm run of each class measured 0.63 USD (Sonnet) and 0.04 USD (Haiku) by the table, so 21 of each is about 13 and 1 USD, about 14 USD (a guess from n = 1 per class; the calculator arm is untested). The budget, not the thresholds, is what to confirm before the Sonnet half starts.
- Operator: D10 (variant C) is open and blocks nothing here.

## Exact next action
Run `get_session self`; stop unless it reports `claude-sonnet-5-5` at `medium`. Confirm S5's commit is on `main`. Then `node eval/run.mjs prepare --date <label> --subjects sonnet,haiku --arms calculator` (the label is a date no earlier run holds: 2026-10-30 and 2026-10-31 are taken; use 2026-11-01), run one calculator-arm scenario to test the Bash grant (`node eval/run.mjs run --date <label> --runner cli --only 03-break-even-continue.sonnet.calculator`), and on success `run` the rest with `--concurrency 4` and no budget flag, in the background, then `collect` and `score`.

## Cost projection
Sonnet 5.5, medium: orchestration T 15, F 3,000, O 1,500 with B 85,240 (measured), R 15,000 (estimate): 0.85 USD as a piece (calculator, `pricing/2026-10-29.json`), 0.88 as a fresh session with this handoff. Subjects: about 14 USD (21 Sonnet runs at about 0.63 and 21 Haiku runs at about 0.04, from one hand-arm run of each; estimate, range 8 to 20). The runs report their own figures: quote `usd_priced` summed.

## Time projection
Orchestration 20 to 40 minutes of model time. Subject time: Sonnet about 1.5 minutes and Haiku about 4 minutes a run in the dry run, so 21 + 21 runs take about 30 minutes at `--concurrency 4` and about 57 at 2 (estimates from one run each). Operator review about 20 minutes.

## Session dispatch decision
Date: 2026-10-30. Decided by: claude-sonnet-5-5, effort medium, in Claude Code (desktop app).
Price table: `pricing/2026-10-29.json` (age 1 day). Command: `node scripts/dispatch.mjs --json docs/dispatch/2026-10-30-s4-close.json --today 2026-10-30`.

### Inputs

| Input | Value | Source |
|---|---|---|
| Formula | 2026-10-29 | `SKILL.md` step 2 |
| Current, target model | claude-sonnet-5-5; claude-sonnet-5-5 | `get_session self`; matrix row 2 (an oracle-checked run of a prepared set), the table's sonnet row |
| W, K | 1,000,000; 970,000 | Usage tool, 97 percent |
| C0 | 262,605 | Measured, `get_usage self` at the close of S4 |
| Compacted, unrecorded context | no; none | Measured; the S4 handoff, `eval/README.md` and this file hold everything |
| T, F, O | 15; 3,000; 1,500 | Estimates (O at medium) |
| B, R, H | 85,240; 15,000; 3,500 | B measured (262,605 less Messages 177,365); R and H estimates, R listed in the dispatch file |
| M, L | 0; 0 | Unmeasured; empty list |
| Task type, design-heavy, outward steps | row 2; no; none (local commits; the coordinating session pushes under `approvals.push_origin`) | Step 3.1 |

### Step A and B
Calculator: G 4,500; C_end 330,105, crosses false; cost_continue 0.84 USD, cost_fresh 0.88 (the handoff included); T* 17.6 turns, T 15 under it; draft verdict continue by break-even, margin 0.04 USD (5.0 percent of the smaller, inside the 10 percent band, so fragile). Piece: H3, claude-sonnet-5-5, medium, serial after S5; oracle the scorer, the gate and the thresholds; 0.85 USD.

### Guardrails and adversarial pass
1 no (T 15); 2 not design-heavy, not compacted, crosses false; 3 none; 4 the table's sonnet row; 5 age 1 day, no null; 6 not an acceptance; 7 within the cap (this record about 700 tokens, about 3 minutes); 8 this session is Sonnet at medium as its handoff says. Opposite verdict, continuing here: the arithmetic favours it by 0.04 USD, and this session holds the runner's code and findings in context. Final verdict: fresh anyway, on two facts that are not preferences. The operator protocol (section 1 and AGENTS.md rule 1) requires a handoff and a new session at every finished stage, and H3 cannot start before S5 lands on the text it measures, so this session would idle across another stage's work. At 0.04 USD the cost does not argue against it. The record marks the draft as fragile; a margin that small does not support either verdict on cost alone.

### Final verdict and cost of deciding
Fresh, claude-sonnet-5-5, effort medium. Exact next action above. Cost of deciding: about 1,500 tokens read (the dispatch file and the calculator output), about 900 written (this record, characters divided by 4), about 3 minutes, about 0.02 USD at Sonnet rates (all self-estimates).
