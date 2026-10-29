---
stage: "Stage H1: evaluation runs with Haiku and Sonnet sub-agents as subjects"
model: claude-sonnet-5-5
effort: medium
status: ready
created: 2026-10-30
from: "Session local_33dacb0c (Sonnet 5.5, medium): Stage S2, evaluation runner and scorer"
---

# Stage H1: evaluation runs

## Goal
Run the skill's evaluation and score it: for the scenarios and arms D7 allows, one `Agent` call per run on a `haiku` or `sonnet` sub-agent, then `eval/results-<date>.md` by `eval/rubric.md` section 8. Done when every run in scope has a `score.json`, the results file exists with n beside every rate, the gate exits 0, the F2 handoff is written, and all of it is committed by name on `main`. Quote the test and gate counts and the cost.

## Decisions already made
- The contract is `eval/rubric.md` and `eval/subject-prompt.md`. A defect in either, or in a scenario, is not edited: send the five-line escalation (persona section 3.4) to the coordinating session.
- The calculator arm on both classes (40 runs) is common to every D7 option: do it first. The hand arm follows D7 (`docs/status.md`): A all 80, B the Haiku hand arm (20) and the Sonnet hand arm only if Haiku fails by hand, C none. If D7 is unanswered after the 40, finish and report; do not take B unasked (protocol section 1.3).
- Each run uses the full text of its `prompt.txt` as the `Agent` prompt (fidelity to the fixed prompt over the cost of re-emitting it, about 0.7 USD for 60 runs). Never `SendMessage` a subject: a follow-up adds to its measured tokens.
- Subjects write `record.md` in their sandbox and reply "done"; no record enters your context. Never read a `record.txt` or `score.json` into context in bulk; the results file is the reading.
- No change to `SKILL.md`, `scripts/`, `eval/rubric.md`, `eval/subject-prompt.md`, `eval/scenarios/` or `eval/tables/`. Scenario ids, not numbers, name runs.
- Prose in every file written: Australian English, no em-dashes, none of the persona's banned words. Stage files by name; never `git add -A` (the root `.ignore` and `graft/` belong to a tool).

## Files and links that matter
- `eval/run.mjs`: `prepare --date --subjects --arms [--only] [--skill <dir>]`, `usage --date --file --models haiku=<id>,sonnet=<id>`, `collect --date`, `score --date`. `prepare` prints one line per run (`run id`, subject, `prompt.txt` path) and writes `eval/runs/<date>/manifest.json`.
- `eval/score.mjs` (the scorer), `scripts/eval-score.test.mjs` (the oracle), `eval/results-2026-10-30.md` (the dry run's two rows).
- `eval/README.md`: the set and the three places `SKILL.md` gives two answers (F2's).
- Sandboxes: `os.tmpdir()/sd-eval/<date>/<run id>/`; a sub-agent writes there without a prompt.

## Verified facts
- `npm test`: 31 tests, 31 pass; `node scripts/check.mjs`: 89 files read, 0 findings, exit 0 (2026-10-30, Node 26.7.0, this stage's close).
- Dry run, scenario 03, calculator arm, 2026-10-30: both subjects reached continue, `claude-sonnet-5-5`, medium, break-even, 3 of 3 figures correct, 14 of 14 inputs matched, no false alarm. Both exceeded the 8,000-token cap in their own record (Haiku reported 12,000 tokens and 2.4 minutes, Sonnet 28,500 and 1.0), so `over_cap` is 2 of 2 and the guardrail 7 budget is a finding for F2 (n = 1 per cell).
- The four facts S2 left open, settled by the dry run:
  1. The `Agent` result's `<usage>` block carries `subagent_tokens` (a total), `tool_uses` and `duration_ms`: no input and output split, no model id. Haiku 104,565 tokens, 7 tool uses, 144,225 ms; Sonnet 84,281, 8, 61,716. `usage.json` takes them as `total_tokens`, `tool_uses`, `duration_ms`; `input_tokens` and `output_tokens` stay null, so `usd_measured` is null.
  2. The model id is not reported by the harness. Each subject's own system prompt states `claude-haiku-5-5` and `claude-sonnet-5-5` (asked after the run, 2026-10-30), so `usage --models` names them and `usage.json` records `model_source`.
  3. A sub-agent may write under `os.tmpdir()` in auto permission mode: both wrote `record.md` there with no prompt.
  4. A sub-agent loads the project's `AGENTS.md` and the auto-memory index `MEMORY.md` (both self-reported), not `CLAUDE.md`. Its context therefore holds the operator rules and the pointer to the persona, a validity threat the rubric's section 9 item 2 names: the subject can see the repository's name and rules though not the scenarios. Unmeasured effect; flag it in the results.
- `Agent` returns at once ("Async agent launched"); the finished run arrives later as a task notification with the usage block. Launch up to about 10 runs in one message and write `usage` entries from the notifications.

## Work completed
- Stage S2: `eval/score.mjs`, `eval/run.mjs`, `scripts/eval-score.test.mjs` (7 tests), the dry run (`eval/runs/2026-10-30/`, `eval/results-2026-10-30.md`). Commit named in `git log` by its subject, "feat(eval): Stage S2".

## Unresolved questions
- Operator, D7: how many runs (above). The dry run suggests a Sonnet run costs less than the 0.50 USD assumed (measured 84,281 tokens in total, split unreported); the figure stays an estimate.
- Operator or F2: whether to mitigate the `AGENTS.md` and `MEMORY.md` load (a run from an empty working directory is not possible through the `Agent` tool). Not blocking.
- F2: the three places `SKILL.md` gives two answers; the cap finding above.

## Exact next action
Run `get_session self` and stop unless it reports `claude-sonnet-5-5` at `medium`. Read `docs/status.md` for D7. Then `node eval/run.mjs prepare --date <today> --subjects haiku,sonnet --arms calculator`, read each printed `prompt.txt`, launch its `Agent` call (`subagent_type` `general-purpose`, `model` the subject) in batches of about 10, and as notifications arrive collect their usage into one JSON array for `usage`; then `collect`, `score`, read `eval/results-<date>.md` only.

## Cost projection
Sonnet 5.5, medium, orchestration: T 40, F 3,000, O 2,500, B 88,465, R 20,000, H 3,500, C0 222,599 (this session's end; a fresh session starts near B): calculator, fresh 2.73 USD, continue 2.88, plus the handoff 0.035. Subjects, estimate: Haiku about 0.02 to 0.05 USD a run, Sonnet 0.1 to 0.3, from 84,000 to 105,000 measured tokens with the split unknown. D7 option B (60 runs): about 6 to 14 USD in all; all 80: about 9 to 20. Quote 6 to 20.

## Time projection
40 runs of about 1 to 2.5 minutes in batches of 10: 15 to 25 minutes of waiting, 30 to 60 minutes wall clock for the stage (protocol section 7, Sonnet). Operator review of the results, about 15 minutes.

## Session dispatch decision
Date: 2026-10-30. Decided by: claude-sonnet-5-5, effort medium, in Claude Code (desktop app). Price table: `pricing/2026-10-29.json` (age 1 day).

### Inputs
| Input | Value | Source |
|---|---|---|
| Formula | 2026-10-29 | `SKILL.md` step 2 |
| Current model | claude-sonnet-5-5 | `get_session self` |
| Target model | claude-sonnet-5-5 | Matrix row 2: orchestration of sub-agent runs with a stated scorer; the table's sonnet row |
| Window W, point K | 1,000,000; 970,000 | Measured, usage tool (97 percent) |
| Current context C0 | 222,599 | Measured, usage tool, before this record |
| Compacted already | no | Measured |
| Unrecorded context | none | The facts are above; the runs hold the rest |
| Expected turns T | 40 | Estimate: prepare, about 6 launch turns, notifications, usage, score, read, handoff |
| Fresh input per turn F, output O | 3,000; 2,500 | Step 1.2 default; O lower than S2's, as launches are short |
| Fresh baseline B | 88,465 | Measured: 222,599 less Messages 134,134 |
| Re-read set R | 20,000 | Estimate: this file 4k, status 5k, run.mjs 3k, results file about 8k |
| Handoff size H | 3,500 | This file, about 14,000 characters / 4 |
| Cache misses M, rediscovery L | 0; 0 | Unmeasured; none expected |

### Step A: continue or hand off
Calculator on these inputs (abridged): G 5,500; C_end 442,599, crosses false; cost_continue 2.88, cost_fresh 2.73 USD; T* 26.8 turns, T 40 not under it.
Draft verdict: continue, by quality, margin 0.15 USD (5.5 percent of the smaller; band 10).

### Step B: model, effort and concurrency
| Piece | Class | Model id | Effort | Oracle | Serial or parallel | Cost |
|---|---|---|---|---|---|---|
| H1 orchestration | Sonnet | claude-sonnet-5-5 | medium | `score.json` per run; results file with n beside each rate; gate 0 | serial; subjects in batches of about 10 | 2.70 USD |
| Subjects | Haiku, Sonnet | table ids | the sub-agent's | the rubric | parallel sub-agents | estimate above |

### Guardrails checked
Under 10 turns: no. Design-heavy across a compaction: no. Irreversible steps: none (commits; the coordinating session pushes). Model from the table: yes. Table 1 day old, complete for Anthropic. Acceptance: the scorer is the oracle, F2 reads the results. Decision budget: within it. The operator's standing rule of protocol section 3 (a finished stage hands off, S2 and H1 are separate stages) and the coordinating session's brief override the draft: H1 starts fresh.

### Adversarial pass
The opposite verdict (continue here) is what the arithmetic prefers by 0.15 USD, inside the band. Against it: this context holds the runner's development (about 134,000 tokens of messages H1 does not need), the brief assigns H1 to a fresh session, and D7 is open, so the stage may pause for the operator. T 20 or T 60 changes the margin by under 1 USD either way; no input moves the verdict outside the band, so the choice is a matter of stage hygiene, stated plainly.

### Final verdict
Fresh by the operator's stage rule, model claude-sonnet-5-5, effort medium. Exact next action: the coordinating session pushes and starts H1 with this file as the brief.

### Cost of deciding
| Row | Value | Source |
|---|---|---|
| Input tokens read | about 4,000 | Calculator output, template, this handoff's inputs; estimate |
| Output tokens | about 2,500 | This record; estimate |
| Wall clock | about 4 minutes | within the 10-minute cap |
| Priced | 4,000 x 2.5e-6 + 2,500 x 10e-6 = 0.04 USD | table `pricing/2026-10-29.json`, sonnet row |
