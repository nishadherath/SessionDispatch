# Evaluation of the session-dispatch skill

The skill is a prompt, and the project's AI-prompting profile requires a
regression suite of fixed inputs with evaluated outputs, rerun on every
change to the skill's text and on every new model version. This folder is
that suite. It tests the skill's central claim (assessment 2026-10-29,
section 3.4): that Haiku-class and Sonnet-class models given only the skill
reach the verdict the arithmetic and the guardrails give.

Designed in Stage O2 (2026-10-30). The runner and scorer are Stage S2's,
the runs Stage H1's, the reading of the results Stage F2's.

## Layout

| Path | What it is |
|---|---|
| `scenarios/<id>.json` | One scenario: calculator input, the prose brief the subject sees, the expected outcome |
| `tables/2026-10-01.json` | A fixture price table 29 days old on the scenarios' day, for scenario 14; `pricing/` holds real tables only |
| `rubric.md` | The four measures and how each is scored from a subject's record |
| `subject-prompt.md` | The fixed prompt every run sends |
| `runs/<date>/`, `results-<date>.md` | Written by the runner (Stage S2 onwards) |

## A scenario file

Each file is valid input to the calculator as it stands:

```
node scripts/dispatch.mjs --json eval/scenarios/03-break-even-continue.json
```

The top-level symbols (`W`, `K`, `C0`, `T`, `F`, `O`, `B`, `R`, `H`, `M`,
`L`, `Ta`, `Ra`, `compacted`, `current`, `target`, `formula`) are the inputs
of `SKILL.md` step 1 that a subject should reach from the brief. `table` and
`today` pin the price table and the day, so the figures never move with the
calendar. The other keys are ignored by the calculator:

| Key | Meaning |
|---|---|
| `id`, `title`, `covers` | Name, one-line summary, and what the scenario exercises |
| `brief` | Lines of the situation the subject is given, `{{TODAY}}` filled by the runner. Every input is either stated as a measurement or follows from exactly one rule of `SKILL.md` |
| `current_effort`, `task_row`, `design_heavy`, `outward` | Facts of the brief in structured form, for the scorer |
| `expected.calculator` | What the calculator prints for these inputs: exit code, draft side and reason, percent, totals, T*, crosses. Captured from the calculator, never written by hand; the gate reruns it |
| `expected.final` | The verdict after the guardrails: outcome, model, effort, whether an approval step is required |
| `expected.guardrails` | The guardrails that bind (change the verdict, model or effort, or require a line in the plan) |
| `expected.skill_runs`, `expected.draft_required` | Whether the skill should run at all, and whether a draft verdict must be stated |
| `expected.accept_inputs`, `expected.alternatives` | Scenario 13 only: a second reading of an input and the calculator's figures under it |
| `notes` | The rule behind each hand-set expectation |

The gate (`node scripts/check.mjs`, step `checkEval`) runs the calculator on
every scenario and on each alternative, and fails on any figure that differs
from `expected.calculator`; it also checks the expectations' shape and the
briefs' prose. A change to the formula therefore fails the gate until each
moved expectation is regenerated, with the reason added to `notes`.

## The set

| No. | Scenario | Calculator's draft | Expected final | Guardrails |
|---|---|---|---|---|
| 01 | A compacted Fable session before a whole-project assessment | fresh by quality, 3.1% | fresh, fable-5-1 high | 2 |
| 02 | A Fable session dispatching a formula revision to Opus | fresh by cost, 110.8% | fresh, opus-5-5 high | none |
| 03 | Same model, short stage: continue by break-even | continue by break-even, 12.5% | continue, sonnet-5-5 medium | none |
| 04 | Fresh is cheaper by cost, but fewer than 10 turns remain | fresh by cost, 27.4% | continue, sonnet-5-5 medium | 1 |
| 05 | A Sonnet session before evaluation design: fresh by class | fresh by class, 109.5% | fresh, opus-5-5 high | none |
| 06 | Haiku on a mechanical chore across its long-context tier | continue by cost, 11.5% | continue, haiku-5-5 medium | none |
| 07 | A design is written; the implementation can run as a split | fresh by cost, 119.6% | split, sonnet-5-5 medium | none |
| 08 | Acceptance of a Sonnet stage: one class above the author | fresh by class, 104.4% | fresh, opus-5-5 high | 6 |
| 09 | Acceptance of the top class's own work | continue by break-even, 41.2% | fresh, fable-5-1 xhigh | 6 |
| 10 | Model change inside the 10 percent band: continue by quality | continue by quality, 6.3% | continue, opus-5-5 high | none |
| 11 | Same model inside the band after a compaction: fresh by quality | fresh by quality, 3.2% | fresh, sonnet-5-5 medium | none |
| 12 | Continue is cheaper, but a design-heavy stage would cross K | continue by cost, 35.2% | fresh, opus-5-5 high | 2 |
| 13 | A harness that drops earlier reasoning: growth F plus visible output | fresh by cost, 229.6% | fresh, sonnet-5-5 medium | none |
| 14 | The price table in force is 29 days old | exit 2, none | continue, sonnet-5-5 medium | 5 |
| 15 | A Codex session whose model has no price in the table | exit 3, incomplete | incomplete | 5 |
| 16 | A mechanical chore that ends in a push and a release tag | fresh by cost, 411.1% | fresh, haiku-5-5 high | 3 |
| 17 | The decision has already used its budget | fresh by cost, 134.8% | fresh, opus-5-5 high (continue, fable-5-1 xhigh until O3) | 7 |
| 18 | Six turns left and no trigger: the skill does not run | continue by break-even, 46.2% | not-run, sonnet-5-5 medium | none |
| 19 | Taking over a handoff on the wrong model | fresh by class, 259.0% | stop, sonnet-5-5 medium | 8 |
| 20 | A harness that reports no usage: every figure estimated | fresh by cost, 11.7% | fresh, sonnet-5-5 medium | none |
| 21 | The decision has used its budget before any draft (added in S4; 01 to 20 unchanged) | fresh by cost, 134.8% (priced for the gate, not drafted by the subject) | continue, fable-5-1 xhigh | 7 |

Model ids drop the `claude-` prefix here; the files carry them whole.

Coverage: every matrix row (row 1: 06, 16; row 2: 03, 04, 10, 11, 13 to 15,
18 to 20; row 3: 02, 05, 07, 12, 17; row 4: 08, 09; row 5: 01); drafts of
both sides by each of class, cost, quality and break-even; every final
outcome; guardrails 1, 2, 3, 5, 6, 7 and 8 binding (4 is scored on every
run); compaction behind (01, 11), ahead (01, 12, 20) and neither; the
long-context tier (06, 16); a null price (15); a stale table (14); an
outward step (16); the decision cap (17, with a draft written; 21, with none); five harnesses; the defaults for
an unmeasured B, K and C0 (01, 15, 20). Within or near the band: 01 (3.1
percent), 10 (6.3, acceptance note F1-1), 11 (3.2), 06 (11.5), 20 (11.7).
Growth F plus visible output: 13 (acceptance note F1-2). Seeded from the
worked examples: 01 and 02. In seven scenarios the final verdict is not
the calculator's draft: a guardrail overrides it in 04, 09, 12 and 19, the
stale table leaves no draft in 14, the split replaces it in 07, and the
skill does not run in 18. Those are where a subject that only copies the
calculator's line fails. In 17 guardrail 7 binds and keeps the draft (since
O3); in 21 the cap passes before any draft and the default stands. F4
(section 2.4) added 21 in Stage S4; H2 ran the first twenty, so 21 has no
measured result until H3.

## Where SKILL.md gave two answers: settled by F2, text in O3

The set avoided the first three on purpose, so that every expectation
follows from one rule. Stage F2 settled them and a fourth that scenario 10
found (`docs/assessment-2026-10-30-f2.md` section 3.6); Stage O3 wrote
them into `SKILL.md` on 2026-10-30, with a precedence line in step 4
(guardrails 5 and 8, then 2, 3 and 6, then 1 and 7; a cost rule never
overrides a quality rule). One expectation moved with the rule: scenario
17's final is now the draft (fresh, opus-5-5 high), because guardrail 7
now keeps a written draft past the cap; the coordinating session ruled it
before H2 ran, and H1's rows for 17 stay as scored.

1. Guardrail 1 against step 2's rule 1 (a stage under 10 turns that needs
   a higher class): rule 1 wins. Guardrail 1 now forbids a fresh session
   for short work at the same class; short work that needs a higher class
   goes to a sub-agent of that class.
2. Guardrail 1 against guardrail 2 (a design-heavy stage under 10 turns
   in a compacted session): guardrail 2 wins, fresh.
3. The effort for an acceptance (acceptance note F1-4): one rule, in
   matrix row 4: high; xhigh when the author is the top class or the
   accepted change is a release or a merge. Guardrail 6 and the operator
   protocol point at the row. Scenarios 08 (Opus, high) and 09 (Fable,
   xhigh) already encoded it.
4. Step 5.3 against 5.4 (scenario 10): the adverse recompute changes a
   verdict only on a value inside the input's stated range or a
   measurement the draft ignored; a flip under a stress test such as a
   doubled T is recorded as fragile and kept.

Three readings are fixed by the subject prompt rather than by `SKILL.md`:
for a split, `final.model` names the run piece; for a `not-run`, the
session's own model (added 2026-10-30, prospective: H1's subjects did not
see it, so scenario 18 is not rescored); for a stop, the model the session
should be on.

## The measured position on Haiku

The skill's claim is "one or two classes below the frontier": Opus and
Sonnet. Haiku is three below and was never in the claim.

- H1 (2026-10-30, the original text): Haiku agreed on 11 of 20 runs with
  the calculator and 10 of 20 by hand; every miss took guardrail 7's
  default under the 8,000-token cap that O3 replaced.
- H2 (2026-10-31, the text O3 revised): Haiku reaches 17 of 20 with the
  calculator (64.0 to 94.8 percent) and 19 of 20 by hand (76.4 to 99.1
  percent). Two of the three calculator misses are unscorable format
  failures (the block inside a table cell, a null `usd`) whose outcomes
  match the expectation when read by hand, which makes 19 of 20. Sonnet
  reaches 40 of 40 in both arms.
- F4's ruling (`docs/assessment-2026-10-30-f4.md` section 1): the
  pre-registered threshold was the scorer's count, so Haiku's threshold
  was not met and the text gains a class floor (Stage S5). The contract
  fixes that remove the two format failures are Stage S4's; they change
  the prompt, so the first twenty scenarios are rerun in H3 on a clean
  harness.

## Running it

`eval/run.mjs` prepares one sandbox and prompt per run, runs each prompt on a
subject of the right class, and the scorer writes `eval/results-<date>.md` by
`rubric.md`. There are two ways to run the subjects.

```
node eval/run.mjs prepare --date YYYY-MM-DD --subjects haiku,sonnet --arms calculator,hand [--only 03,04] [--skill <dir>] [--repeat <n>]
node eval/run.mjs run     --date YYYY-MM-DD --runner cli [--only 03,04] [--force] [--concurrency <n>] [--max-turns <n>] [--timeout-min <n>] [--models haiku=<id>,sonnet=<id>]
node eval/run.mjs collect --date YYYY-MM-DD
node eval/run.mjs score   --date YYYY-MM-DD
```

`prepare` merges into the day's manifest if one exists (a new call adds its runs, `--force` replaces a run's entry) and refuses when the skill text or the prompt differs from the manifest's: one manifest, one text under test. `--skill` takes the payload from another folder, so a variant of `SKILL.md`
can be scored on the same scenarios. `scripts/eval-score.test.mjs` is the
scorer's oracle and `scripts/eval-run.test.mjs` the CLI runner's (against a
stand-in for `claude`).

### The Agent path (H1, H2)

The orchestrating session runs each `prompt.txt` on a sub-agent of the
subject's class (the `Agent` tool, `model` haiku or sonnet), copying the
prompt by hand, and records what the Agent result reports with
`node eval/run.mjs usage --date <d> --file usage.json --models haiku=<id>,sonnet=<id>`
(one `subagent_tokens` total, no split, no model id). The subagents load the
project's `AGENTS.md` and `MEMORY.md`. It stays documented because H1 and H2
were run this way and their figures are compared with it; it needs no script
changes and `run` refuses it (`--runner agent`).

### The CLI runner (H3 onwards)

`run --runner cli` starts `claude -p` once per prepared run, from the run's
sandbox (outside the repository), with the prompt on stdin, and writes beside
`prompt.txt`: `cli-result.json` (the CLI's JSON result as printed),
`cli-stderr.txt` and `usage.json`. A run that already has a `usage.json` is
skipped unless `--force`; a run whose CLI prints no JSON, times out (20
minutes by default) or reports an error is listed as failed and exits 1. Model
ids come from the price table in force (the `haiku` and `sonnet` class rows),
or `--models`. The subject's tools are `Read,Write` in the hand arm and
`Read,Write,Bash` limited to `node *dispatch.mjs*` in the calculator arm, with
`--permission-mode dontAsk`. `usage.json` carries the measured figures:

| Field | Holds |
|---|---|
| `model` | The id the CLI reports in `modelUsage` |
| `total_tokens` | Input, cache writes, cache reads and output, summed: the whole run, harness baseline included |
| `input_tokens`, `output_tokens` | Uncached input plus cache writes, and output; `cache_read_input_tokens`, `cache_creation_input_tokens`, `uncached_input_tokens` are kept apart |
| `num_turns`, `duration_ms` | The CLI's turns and wall clock; `tool_uses` is null (the CLI does not count them) |
| `usd_priced` | The same tokens priced from the table in force (input, cache write, cache read, output). **This is the dollar figure to read** |
| `usd_cli`, `cost_basis` | The CLI's own cost and the basis it states. Not used for budgets or comparison, see below |
| `long_context_possible` | True when the average request could have crossed the model's long-context threshold (the tier is not applied) |

What the dry run and the probe of Stage S4 found (CLI 2.1.289, 2026-10-30):

- **Instruction files and skills (F2-8).** One CLI run asked the subject which
  instruction files and skills it had loaded. A default `claude -p` from a
  sandbox loads no `CLAUDE.md`, `AGENTS.md` or `MEMORY.md` (the memory
  folder is keyed to the project folder, and the sandbox is outside the
  repository), but it does list the user's installed skills, **`session-dispatch`
  (the installed copy) among them**, and runs the user's session-start hooks
  (their text reaches the subject). The runner therefore passes
  `--disable-slash-commands --setting-sources project --no-session-persistence`;
  the same question under those flags returned no skill, no hook text and no
  instruction file. The home directory is not isolated: the sign-in stays where
  it is. A subject can still read any file it can path to, as in H1 and H2.
- **Model ids.** `claude-sonnet-5-5` and `claude-haiku-5-5` are accepted. For
  `claude-haiku-5-5` the CLI prints an `unrecognized_model` notice and states
  `costBasis: "unknown"`, and its cost is not credible (4.47 USD for a run
  the table prices at 0.04 USD). `--max-budget-usd` counts that figure: a
  1.5-minute Haiku run stopped on a 2 USD budget at its first turn. The flag
  is passed only if given; do not give it for Haiku. The `haiku` alias
  resolves to an older Haiku, so ids are passed whole.
- **Cost.** For Sonnet the CLI's cost (1.01 USD) is above the table's price
  (0.63 USD) for the same tokens: the likely cause is the one-hour cache-write
  rate against the table's five-minute rate (a guess; the arithmetic was not
  matched). Both figures are on file.
- **Size.** One Sonnet hand-arm run of scenario 03 took 25 turns, 1.59 million
  tokens (1.42 million of them cache reads) and 84 seconds; the Haiku run took
  16 turns, 1.37 million tokens and 242 seconds. The harness baseline
  (about 40 to 55 thousand tokens a turn from tool definitions) is paid on
  every turn, so a run's measured tokens are not comparable with the Agent
  path's single total.
