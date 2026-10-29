---
stage: "Stage S2: evaluation runner and scorer"
model: claude-sonnet-5-5
effort: medium
status: done
created: 2026-10-30
from: "Session local_d10b709b (Opus 5.5, high): Stage O2, evaluation design"
---

# Stage S2: evaluation runner and scorer

## Goal
Build the runner and scorer for the evaluation Stage O2 designed, and prove them with a dry run. Done when: `eval/score.mjs` and `eval/run.mjs` exist (Node 20 or later, standard library only); `npm test` passes with the new `scripts/eval-score.test.mjs` included; a dry run of scenario 03 on one Haiku and one Sonnet sub-agent, calculator arm, has produced `eval/runs/<date>/` and `eval/results-<date>.md` with two rows; `node scripts/check.mjs` exits 0; the H1 handoff is written; all of it committed by name on `main`. Quote the test and gate counts in the report.

## Decisions already made
- The contract is `eval/rubric.md` (scoring, files, report) and `eval/subject-prompt.md` (the prompt). Implement them as written. A defect in either, or in a scenario, is not edited: stop and send the five-line escalation (persona section 3.4) to the coordinating session.
- Subjects run as sub-agents of the orchestrating session through the `Agent` tool with `model` set to `haiku` or `sonnet` and `subagent_type` `general-purpose`: automatic, no operator click. A node script cannot call `Agent`, so `run.mjs` prepares and scores, and the session runs the prompts between the two.
- The subject writes its record to a file in its sandbox and replies "done", so 80 records never enter the orchestrator's context (at about 4,000 tokens each, 320,000 tokens re-read every later turn).
- Sandboxes live outside the repository (`path.join(os.tmpdir(), "sd-eval", <date>, <run id>)`) so a subject cannot stumble on `eval/scenarios/` and its expectations. If the dry run shows a sub-agent cannot write there, add `--sandbox <dir>` and use a gitignored `eval/.sandbox/`, and record that.
- Records are kept as `record.txt`: subject prose is data, and the gate lints `.md` only. Never quote record text into `results-<date>.md`.
- No change to `SKILL.md`, `scripts/dispatch-core.mjs`, `scripts/check.mjs`, `examples/`, `eval/scenarios/`, `eval/tables/`, `eval/rubric.md` or `eval/subject-prompt.md`. No push and no session start: the coordinating session does both.
- Prose in every file written: Australian English, no em-dashes, none of the persona's banned words (the gate checks the last two). Stage files by name; never `git add -A` (the root `.ignore` and `graft/` belong to a tool).

## Files and links that matter
- `eval/rubric.md` in full: section 1 (runs, files, re-dating the table), 2 (the result block and unscorable runs), 3 to 7 (the measures), 8 (the report and the Wilson interval).
- `eval/subject-prompt.md`: the template is the text inside the ```` ````text ```` fence; four placeholders.
- `eval/README.md`: the scenario file's keys and the set; `eval/scenarios/13-growth-visible-output.json` is the fullest scenario (alternatives, `accept_inputs`).
- `scripts/dispatch-core.mjs`: `stepA`, `breakEven`, `splitCost`, `modelForClass`, `findModel`, `missingPrices`, `validateInputs`, `roundTo`, `CLASS_RANK`. Import them; never re-implement the formula.
- `scripts/check.mjs:165` `matchesStated` (the tolerance rule; copy its three lines into `score.mjs`, since importing check.mjs runs the gate) and `calculatorFigures` (how the calculator's output is read); `scripts/fixtures/helpers.mjs` (`tmpDir`, `rm`, `run`, `ROOT`) and `scripts/eval.test.mjs`, the test pattern.

## Verified facts
- `node scripts/check.mjs`: 86 files read, 0 findings, exit 0; `npm test`: 24 tests, 24 pass (2026-10-30, Node 26.7.0, this stage).
- The scorer's measure 3 path (dispatch-core on each scenario's own inputs, `by` set to `break-even` when `breakEven` settles, scenario 13 through `F = G - O` with G 3,800) reproduces every printed figure and draft of the 18 computable scenarios (scratch script, 2026-10-30; 14 and 15 have none).
- Wilson 95 percent: 18 of 20 gives 69.9 to 97.2; 20 of 20, 83.9 to 100.0; 0 of 20, 0.0 to 16.1 (print 0.0, never -0.0); 10 of 20, 29.9 to 70.1.
- Unverified, for the dry run to settle: the fields the `Agent` result reports (expected `total_tokens`, `tool_uses`, `duration_ms`); the model id behind `haiku` and `sonnet`; whether a sub-agent may write under `os.tmpdir()` in auto permission mode; which instruction files a sub-agent loads.

## Work completed
- Stage O2 commit (this handoff's): `eval/` (20 scenarios, the stale fixture table, rubric, subject prompt, index), `checkEval` in `scripts/check.mjs`, `scripts/eval.test.mjs`.

## Unresolved questions
- Operator, D7 (`docs/status.md`): H1's scope. All 80 runs cost about 23 USD (estimate below), above the assessment's 3 to 6; the recommendation runs the calculator arm on both classes and the hand arm on Haiku first. S2 builds all arms either way.
- F2: the three places `SKILL.md` gives two answers (`eval/README.md`).

## Exact next action
Run `get_session self` and stop unless it reports `claude-sonnet-5-5` at `medium`; then read `eval/rubric.md` in full and write `scripts/eval-score.test.mjs` from the oracle below before `eval/score.mjs`.

Oracle, in `scripts/eval-score.test.mjs`: (1) a perfect block synthesised from each scenario (inputs from its symbols, scenario 13 with F 3,000 and G 3,800; totals and draft from `expected.calculator`, draft null where it has none; guardrails and final from `expected`, `approval_step` a sentence where true; cost_of_deciding `{1000, 3000, 5, "0.07"}`) scores `final_ok`, `draft_ok` where scored, `guardrails_ok` and every stated figure correct, on all 20; (2) each mutation fails exactly its check: outcome flipped, a bound guardrail dropped, `cost_fresh` plus 0.02, a total written to one decimal, a model id not in the table, a figure stated on scenario 14, the block removed (unscorable); (3) the Wilson values above; (4) `prepare` dates scenario 14's sandbox table 29 days and scenario 03's one day before the run day, and leaves `scripts/` out of a hand-arm sandbox. Then `run.mjs` with `prepare --date --subjects --arms [--only] [--skill <dir>]` (sandbox, `prompt.txt`, `manifest.json` with the commit, the table and a SHA-256 of the `SKILL.md` used, one line per run; `--skill` takes the payload from another folder so a variant can be scored, as D2's variant C needs), `collect --date` (copies `record.md` to `record.txt`; exit 1 naming any run without one) and `score --date` (`score.json` per run, the results file by rubric section 8). Dry run: `prepare --only 03 --subjects haiku,sonnet --arms calculator`, one `Agent` call per run line with the prompt file's text, write `usage.json` from each result, `collect`, `score`; record the four unverified facts in the H1 handoff.

## Cost projection
Sonnet 5.5, medium; T 40, F 3,000, O 3,000, B 85,101, R 35,700; from the calculator: first read 0.302, reads 0.963, writes 0.600, output 1.200: 3.07 USD, plus the handoff 0.064 (this session). Quote 3 to 7; 9.55 with every adverse value below. H1, estimate: a subject run about 0.03 USD on Haiku and 0.50 on Sonnet (T 12, F 2,000, O 1,500, R 12,000, sub-agent B 40,000 unmeasured), orchestration 2.22: all 80 runs about 23 USD, the recommended 60 about 14.

## Time projection
30 to 45 minutes wall clock (protocol section 7, Sonnet), plus the two sub-agent runs; operator review about 15 minutes.

## Session dispatch decision
Date: 2026-10-30. Decided by: claude-opus-5-5, effort high, in Claude Code (desktop app). Price table: `pricing/2026-10-29.json` (age 1 day).

### Inputs
| Input | Value | Source |
|---|---|---|
| Formula | 2026-10-29 | `SKILL.md` step 2 |
| Current model | claude-opus-5-5 | `get_session self` |
| Target model | claude-sonnet-5-5 | Matrix row 2: one new module with a stated test and oracle; the table's sonnet row |
| Window W | 1,000,000 | Measured, usage tool |
| Compaction point K | 970,000 | Measured, 97 percent of W |
| Current context C0 | 292,925 | Measured, usage tool, 13:32 UTC |
| Compacted already | no | Measured |
| Unrecorded context | none | The design is in `eval/`; the four open facts are named above |
| Expected turns T | 40 | Assessment section 6 estimate for S2 |
| Fresh input per turn F | 3,000 | Step 1.2 default |
| Output per turn O | 3,000 | Step 1.2, writing-heavy (code and tests); medium effort |
| Fresh baseline B | 85,101 | Measured: 292,925 less Messages 207,824 |
| Re-read set R | 35,700 | Estimate, characters / 4: this file 12.8k, rubric 11.3k, README 8.1k, prompt 3.6k, a scenario 3.8k, dispatch-core 11.7k, helpers and test 4.6k, Sonnet persona and profile 51.9k, protocol 32.4k, check.mjs spans 3k |
| Handoff size H | 3,200 | This file, 12,790 characters / 4 |
| Cache misses M | 0 | Unmeasured; no review pauses expected; the adverse pass uses 3 |
| Rediscovery turns L | 0 | The unrecorded list is empty |
| Task type | scoped module work with a stated test | Matrix row 2 |
| Design-heavy | no | The design is O2's; S2 implements a stated contract |
| Irreversible or outward-facing steps | none | Commits only; push by the coordinating session |

### Step A: continue or hand off
`node scripts/dispatch.mjs --json s2.json` with the inputs above, abridged:
```
G 6,000; C_end 532,925; crosses false (K 970,000); C_cont 412,925; C_fresh 240,801
cost_continue on claude-opus-5-5: reads 3.303, writes 1.200, output 2.400, misses 0, compaction 0  = 6.90 USD
cost_fresh on claude-sonnet-5-5: handoff 0.064, first read 0.302, reads 0.963, writes 0.600, output 1.200  = 3.13 USD
T* n/a: the model changes. Split not computed: the target is below opus.
```
Draft verdict: fresh, by cost, margin 3.77 USD (120.6 percent of the smaller).

### Step B: model, effort and concurrency
| Piece | Class | Model id (from table) | Effort | Oracle | Serial or parallel | Cost |
|---|---|---|---|---|---|---|
| S2 runner and scorer | Sonnet | claude-sonnet-5-5 | medium | `npm test` with the oracle above; gate exit 0; dry-run results file with two rows | serial after O2; S3 may run beside it (disjoint files) | 3.07 USD |

Serial chain: O2's commit, S2 30 to 45 minutes, then H1; operator review about 15 minutes. Effort: medium, the row 2 default; no outward step, no money, not a merge. Split (step 2.1): not computed, the target is below opus.

### Guardrails checked
1. Under 10 turns: no, T = 40. 2. Design-heavy across a compaction: not design-heavy; C_end 532,925 under K. 3. Irreversible steps: none. 4. Model from the table: its sonnet row. 5. Table 1 day old; the Anthropic rows complete. 6. Acceptance: the scorer's tests are the oracle; F2 (Fable) reads the results. 7. Decision budget: within it (below). 8. S2 checks its own model and effort first (exact next action).

### Adversarial pass
The opposite verdict, argued: this session wrote the rubric and holds its edge cases (the break-even reason, the G override, the stale-table rule), so it would build the scorer with fewer misreadings, and a Sonnet misreading costs an escalation round trip. Against: continuing costs twice as much at Opus rates, the oracle pins each edge case as a test, and the persona's delegation rule sends well-specified work down.

Each input: C0 is measured, and 30 percent more raises only the continuing side. T could be 60 if the scorer needs iteration, or 20 if the oracle makes it mechanical. O could be 5,000 if the tests run long. B is measured; R could be 50,000 if S2 reads `check.mjs` and `SKILL.md` in full. M could be 3 if the dry run's sub-agents hold the session past the cache lifetime. The task type could be argued up to Opus (a scorer is evaluation work), but the design is fixed and every rule has a test. Prices are 1 day old, with no long-context tier on Sonnet or Opus. Nothing is unrecorded; the four unverified facts are listed for the dry run.

Recomputed with T 60, O 5,000, R 50,000 and M 3 together: continue 22.47, fresh 9.55 USD (fresh by 135.2 percent). T 20 alone: 3.21 against 1.63 (97.3 percent). M 3 alone: 12.85 against 4.86 (164.2 percent). No adverse value comes near the band.
Verdict holds: yes.

### Final verdict
Fresh, model claude-sonnet-5-5, effort medium, one piece, serial. Exact next action: commit O2; the coordinating session pushes and starts S2 with this file as the brief.

### Cost of deciding
| Row | Value | Source |
|---|---|---|
| Context at start | 292,925 | usage tool, 13:32 UTC |
| Context at end | 331,894 | usage tool, 13:42 UTC, after this record and the status edits |
| Input tokens read | about 3,000 | eight calculator runs and the file sizes |
| Output tokens | about 3,000 | this record written twice (about 6,500 then 5,400 characters) / 4; estimate. The brief above it is the stage deliverable, not the decision |
| Wall clock | about 5 minutes | 13:32 to 13:37 UTC; within the 10-minute cap |
| Priced | 3,000 x 5e-6 + 3,000 x 20e-6 = 0.08 USD | table `pricing/2026-10-29.json`, opus row |
