# Evaluation rubric

The skill claims that a model one or two classes below the frontier can
follow it and reach the verdict the arithmetic gives. This rubric turns one
subject's record into four measures without a model in the loop: every
score below is a comparison of parsed values, so two scorings of the same
record give the same numbers. Stage S2 implements it; Stage H1 runs it;
Stage F2 reads the results.

## 1. Runs and their files

A run is one scenario (`eval/scenarios/<id>.json`), one subject class
(`haiku` or `sonnet`) and one arm:

- `calculator`: the sandbox skill folder holds `scripts/dispatch.mjs` and
  `scripts/dispatch-core.mjs`, as the installed skill does.
- `hand`: the same folder without `scripts/`, so step 2 is done by hand.

The arm comparison is the question the assessment of 2026-10-29 left open
(section 3.4): whether the skill is a procedure a smaller model can run, or
a checklist around a calculator.

Per run, under `eval/runs/<date>/<id>.<subject>.<arm>/`:

| File | Written by | Holds |
|---|---|---|
| `prompt.txt` | runner | The filled prompt of `eval/subject-prompt.md` |
| `record.txt` | runner, copied from the sandbox | The subject's `record.md`, verbatim. Kept as `.txt`: it is data, not project prose, so the gate's prose lint does not read it |
| `usage.json` | orchestrating session | What the harness reported for the subject's run: `{"model", "total_tokens", "tool_uses", "duration_ms"}` and any further fields it gives, `null` for any it does not |
| `score.json` | scorer | The per-run scores of sections 3 to 7 |

The run's table is the scenario's `table` re-dated so that its age on the
run day equals its age on the scenario's `today` (one day for
`pricing/2026-10-29.json`, 29 days for the stale fixture). Prices are not
changed, so every expected figure holds on any run day.

## 2. The result block

The scorer reads the last fenced block in `record.txt` whose opening line is
exactly ```` ```json dispatch-result ````. Keys and types (the prompt states
them to the subject in the same order):

| Key | Type |
|---|---|
| `skill_ran` | boolean |
| `inputs` | null, or object: `current` (string); `target` (string, or null where the table cannot give one, `SKILL.md` step 1.4.4); `W`, `K`, `C0`, `T`, `F`, `O`, `B`, `R`, `H`, `M`, `L` (numbers); `compacted` (boolean); `Ta`, `Ra`, `G` (number or null) |
| `table_age_days` | number or null |
| `totals` | null, or object: `cost_continue`, `cost_fresh`, `cost_split`, `t_star` (string or null each) |
| `draft` | null, or object: `side` (`continue`, `fresh`, `incomplete`), `by` (`class`, `cost`, `quality`, `break-even` or null) |
| `guardrails_triggered` | array of integers from 1 to 8 |
| `final` | object: `outcome` (`continue`, `fresh`, `split`, `not-run`, `incomplete`, `stop`), `model` (string or null: the model that runs the next piece; for a split the run piece, for a `not-run` the session's own model, for a `stop` the model the session should be on), `effort` (string or null), `approval_step` (string or null) |
| `cost_of_deciding` | null, or object: `input_tokens`, `output_tokens`, `minutes` (numbers), `usd` (string) |

A run is **unscorable** when the block is missing, is not valid JSON, or
breaks a type above. An unscorable run fails measures 1 and 2, states no
figures for measure 3, and reports null for measure 4; the row says why.
Unscorable runs are counted in the summary, never dropped: a subject that
cannot produce the block is a finding about the subject.

## 3. Measure 1: verdict agreement

`final_ok` is true when all of these hold:

1. `final.outcome` equals `expected.final.outcome`;
2. `final.model` equals `expected.final.model`, where the latter is not null;
3. `final.effort` equals `expected.final.effort`, where the latter is not null;
4. `skill_ran` equals `expected.skill_runs`.

`draft_ok`, scored only where `expected.draft_required` is true: `draft.side`
and `draft.by` equal `expected.calculator.draft`.

The headline is final agreement; draft agreement says whether a miss came
from the arithmetic or from what followed it.

## 4. Measure 2: guardrail compliance

Two parts, both deterministic:

**(a) Bound guardrails.** For each number in `expected.guardrails`, the run
passes when the number is in `guardrails_triggered` and its consequence
holds:

| Guardrail | Consequence in the block |
|---|---|
| 1 | `final.outcome` is `continue` |
| 2 | `final.outcome` is `fresh` |
| 3 | `final.approval_step` is a non-empty string |
| 5 | `final.outcome` equals the expected one (`continue` for a stale table, `incomplete` for a null price); for a stale table (`expected.calculator.exit` 2) every `totals` figure is null |
| 6 | `final.model` and `final.effort` equal the expected ones |
| 7 | `final.outcome` is the block's `draft.side` where it has a draft (`split` also passes for a `fresh` draft), else `continue`; where it is `continue`, `final.model` is the scenario's `current` and `final.effort` its `current_effort` (`SKILL.md` step 0: past the cap, step 2's draft stands, else the default) |
| 8 | `final.outcome` is `stop` and `final.model` is the expected one |

**(b) Guardrail 4, every run.** Each model id in `inputs.current`,
`inputs.target` and `final.model` that is not null is a model in the run's
table.

`guardrails_ok` is (a) for every bound guardrail and (b). The headline is
the pass rate over runs whose scenario binds at least one guardrail; (b) is
reported over all runs. Guardrails listed in `guardrails_triggered` that the
scenario does not bind are counted as false alarms, a diagnostic: in some
scenarios a careful subject can argue for one (guardrail 6 when its plan
includes an acceptance piece), so they are not failures. A second
diagnostic, an overrun with guardrail 7's verdict not taken, is in
section 7.

## 5. Measure 3: arithmetic error

The scorer recomputes from the subject's own `inputs`, never from the
scenario's, so this measure isolates arithmetic from input gathering
(section 7 scores the gathering). With `scripts/dispatch-core.mjs` and the
run's table:

- `cost_continue`, `cost_fresh` and the draft from `stepA`, under formula
  2026-10-29;
- `cost_split` from `splitCost`, when the target's class is opus or fable
  and `Ta` and `Ra` are numbers (runner sonnet and acceptor opus by
  `modelForClass` in the current model's family, as the calculator does);
- `t_star` from `breakEven`: `null` when the model changes, `"never"` when
  it is infinite.
- The draft's `by` is `break-even` when `breakEven` returns a number and
  an empty `settles` list, as the calculator prints it; otherwise
  `draftVerdict`'s reason.
- When `inputs.G` is a number other than `F + O`, the recompute uses
  `F = G - O`, which gives growth G while billing all of O as output
  (scenario 13's notes).

A stated figure (a non-null string in `totals`) is correct when it is within
half a unit of its own last decimal place of the recompute (the gate's
`matchesStated` rule) and states at least two decimal places for USD, or at
least one for `t_star`; `"never"` is correct only when the recompute is
infinite. A figure stated where the recompute has none is an error. `rule_ok`
is true when `draft` equals the recompute's draft.

Not scored, with the reason in the row: runs whose inputs are not
computable (`validateInputs` errors, a model id not in the table, a null
price), and runs on a stale table (stating any figure there is a measure 2
failure, not an arithmetic one).

Per run: figures correct out of figures stated, the largest absolute error
in USD, and `rule_ok`. A figure the calculator states for the scenario that
the block leaves null is counted as missing, separately.

## 6. Measure 4: tokens and dollars to decide

Per run:

- `reported_tokens`: `input_tokens + output_tokens` from
  `cost_of_deciding`; `reported_minutes`: its `minutes`.
- `measured_tokens` and `measured_minutes`: `usage.json`'s `total_tokens`
  and `duration_ms / 60000`, or null.
- `usd_to_decide`: the step 6 rule applied to the reported tokens at the
  subject's own model (the one in `usage.json`, not the scenario's), at
  the table in force on the scoring day: input at the cache-write rate plus
  output at the output rate. Where `usage.json` splits input from output,
  the same rule on the measured split is reported beside it as
  `usd_measured`.
- `record_tokens`: the length of `record.txt` in characters divided by 4,
  measured by the scorer.
- `over_cap`: `record_tokens` above 4,000, or reported or measured minutes
  above 10 (guardrail 7's cap, `SKILL.md` step 0). Reading is not capped,
  so reported input tokens do not count. Until 2026-10-30 (Stage O3) the
  rule was reported tokens above 8,000; results files scored before then
  used it.
- `report_ratio`: reported over measured tokens, a diagnostic of the
  record's honesty about its own cost.

## 7. Diagnostics

Reported, never part of a headline:

- **Input fidelity.** Each of `current`, `target`, `W`, `K`, `C0`,
  `compacted`, `T`, `F`, `O`, `B`, `R`, `H`, `M`, `L` (and `Ta`, `Ra` where
  the scenario states them) equals the scenario's value, or a value its
  `expected.accept_inputs` lists. A null `target` matches where the
  calculator exits 3 (no priced row to name, step 1.4.4) and is a miss
  elsewhere. Per run matched out of scored; in the
  summary, the miss count per symbol, which is the map of where subjects
  misread a brief.
- **Consistency.** `draft.side` agrees with the side on the record's
  `Draft verdict:` line; `skill_ran` is false exactly when the record has a
  `Session dispatch not run` line.
- **Prose.** Em-dashes and the persona's banned words in `record.txt`
  outside the block.
- **False alarms.** Section 4.
- **Overrun, default not taken** (F2-6). The block lists guardrail 7 or the
  run is `over_cap`, lists none of guardrails 1, 2, 5 and 8 (each sets the
  outcome itself, and step 4 still runs past the cap), the outcome is
  `continue`, `fresh` or `split`, and it is not guardrail 7's verdict (the
  draft's side, else `continue`, as in section 4). It shows how often a subject drops a verdict the text says
  to keep, or keeps one it says to drop, whether or not the scenario binds
  guardrail 7.

## 8. Aggregation and the report

`eval/results-<date>.md`, written by the scorer:

1. A header: date, skill commit (`git rev-parse --short HEAD`), the table in
   force, each subject with the model id the harness ran, the arms, run and
   unscorable counts, and any edit to `eval/subject-prompt.md` since the
   last results file.
2. A summary, one row per subject and arm: final agreement k/n with its
   Wilson 95 percent interval, draft agreement k/m, bound guardrails k/n,
   guardrail 4 k/n, arithmetic correct/stated with the runs holding any
   error, input fidelity matched/scored, median and largest `usd_to_decide`,
   over-cap k/n, median minutes.
3. One row per scenario per subject per arm: scenario, subject, arm,
   outcome got and expected, `final_ok`, `draft_ok`, `guardrails_ok`,
   arithmetic correct/stated, inputs matched/scored, tokens reported and
   measured, minutes, `usd_to_decide`, and a note naming the first failed
   check.
4. Input misses per symbol (section 7).

The Wilson interval for k successes in n at z = 1.96:
`(p + z²/2n ± z·sqrt(p(1 - p)/n + z²/4n²)) / (1 + z²/n)` with `p = k/n`,
printed as percents to one decimal place. With 20 scenarios and one run per
cell the intervals are wide (18 of 20 gives about 70 to 97 percent), so the
report states n beside every rate and F2 decides whether to repeat cells.

## 9. Threats to validity

1. **Role-play.** The subject decides for a session whose model is not its
   own. A subject that confuses the two fails guardrail 8 cases or
   mis-prices `continue`; the input fidelity on `current` shows it.
2. **Leakage.** A subject run as a sub-agent can read the repository,
   including the expectations. The prompt confines it to the sandbox,
   which lives outside the repository; the runner cannot enforce this.
   S2's dry run records which instruction files a sub-agent loads.
3. **The block is extra output.** The skill does not ask for it. A subject
   that writes a correct record and a wrong block is scored on the block;
   the consistency diagnostic shows the gap.
4. **Hand-set expectations.** `expected.final` and `expected.guardrails`
   are the designer's reading of `SKILL.md`, each with its rule in the
   scenario's `notes`; the calculator's figures are not. The set avoided
   three places where `SKILL.md` gave two answers; F2 settled them and a
   fourth, and Stage O3 wrote them into the text (`eval/README.md`).
5. **One run per cell, one day.** Sampling variance is unmeasured until
   cells are repeated.
