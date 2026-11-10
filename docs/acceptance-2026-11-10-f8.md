# Acceptance of Stage O6 and the 24-scenario rerun, 2026-11-10

Stage F8: adversarial acceptance of Stage O6 (Opus 5.5 at high, with two
Sonnet 5.5 sub-agents; commits `167b6b4`, `1a2c038`, `37e2be4`, `657571c`,
`4f133f4`, `0c2e8be`, `f1e1c83`, `ec69a7a`, `532be79`, `bb4b20c` on branch
`claude/stage-o6-write-price-003ba0`), by `claude-fable-5-2` at xhigh in a
fresh session (app id `local_ae00f601`, transcript `5554ef6c`), under
matrix row 4 and guardrail 6. Brief:
`docs/handoffs/2026-11-10-thereafter-stage-f8-acceptance-rerun.md`. Tree
under review: `bb4b20c`.

**Verdict: accepted.** Twenty-three claims checked, twenty-three
accepted, none rejected, and the handoff's ruling on the table accepted.
The rerun meets all three thresholds: final agreement 24 of 24; scenarios
22, 23 and 24 right with To, the coordinator and `ttl` as expected, 3 of
3; To and `ttl` as expected on scenarios 01 to 21 with no miss. The class
floor's last sentence is replaced with those figures. One defect of
Stage O6 would have stopped the rerun and is fixed here (F8-1, section
2): the evaluation's sandbox could not start its calculator. Eight more
findings are in section 9; two of them are closed in this stage and none
changes a figure the formula gives. Gate at the stage commit:
`node scripts/check.mjs`, 130 files read, 0 findings;
`node --test "scripts/*.test.mjs"`: 120 tests, 120 pass, 0 fail, 127 s.

This file is written in two parts. Section 1 was committed before the
first subject ran (`79aee38`), so the way the thresholds are read cannot
follow the figures. The rest was added when the run was scored.

## 1. The thresholds and how they are read, fixed before the run

The thresholds are the handoff's
(`docs/handoffs/2026-11-10-thereafter-stage-f8-acceptance-rerun.md`),
fixed on 2026-11-10 before any run. They do not move. The run is 24
scenarios, the `claude-sonnet-5-5` subject, the calculator arm, one run
each, through `node eval/run.mjs run --runner cli`, label 2026-11-10.

- **T1.** Final agreement in 23 of 24 or more.
- **T2.** On scenarios 22, 23 and 24, the final outcome is right and the
  stated To, coordinator and `ttl` equal the scenario's: 3 of 3.
- **T3.** On scenarios 01 to 21, the stated To and `ttl` equal the
  scenario's in 20 of 21 or more.

All three met: the class floor's last sentence in `SKILL.md` is replaced
with the measured figures. Any not met: the sentence stays, the figures
and the misses are recorded, and the choice goes to the operator.

The readings, each taken from the scorer's own fields (`score.json` of
each run, `eval/score.mjs`):

1. **Final agreement** is the scorer's `final_ok`: the outcome, the
   model, the effort and `skill_ran` all as the scenario expects. A run
   with no record, or with a block the scorer cannot read
   (`unscorable`), is a miss.
2. **T2** counts a scenario only when `final_ok`, `contract.to_ok`,
   `contract.coordinator_ok` and `contract.ttl_ok` are all true. A run
   whose `contract` is null (no inputs, or unscorable) is a miss.
3. **T3** counts a miss for each run of 01 to 21 that is unscorable, has
   no record, or has `contract.to_ok` or `contract.ttl_ok` false. The
   coordinator is not part of T3. A scorable run whose block has
   `inputs: null` states neither figure; by the rubric's rule (a key left
   out reads as its default) it reads as To 0 and `5m`, which is what
   scenarios 01 to 21 expect, so it is not a miss. Such runs are named
   beside the count. T3 is met with at most one miss in the 21.
4. One run per scenario. A run that fails for a reason outside the
   subject (the CLI prints no result, a timeout, a refused start) is run
   again once and the first attempt is named in the results. A run that
   wrote a record is never run again.
5. A miss that the scorer's contract alone causes (a coordinator stated
   where the scenario has none) is still a miss; it is named as such.

## 2. A defect found before the run (F8-1)

`eval/run.mjs` copied `dispatch.mjs` and `dispatch-core.mjs` into a
calculator-arm sandbox. Since Stage O6 `dispatch.mjs` imports
`price-table.mjs`, so the sandbox's calculator stopped at its first line
(`ERR_MODULE_NOT_FOUND`, exit 1) and no calculator-arm subject could
have run it. The same function re-dated `table_date` only; staleness now
counts from each family's `fetched`, so from 2026-11-13 every sandbox
built on the table of 2026-10-29 would have been stale (exit 2).

Fixed in this stage, before the run, in one commit with a test that
failed first on each fault: the sandbox carries the third file, and every
family's `fetched` moves by the same number of days as `table_date`. The
test prepares a sandbox for all 24 scenarios on a day 111 days after the
newest table, runs each sandbox's own calculator on the scenario's
inputs under the formula in force, and compares the exit code, the three
totals and the draft with the scenario's expected figures. The fix is
this session's own work and has had no review by another session.

## 3. How the checks were made

- Formula 2026-11-11 was derived by hand from the text of `SKILL.md`
  steps 1.3, 1.4, 2, 2.1 and 3.3 for the example's inputs and for
  scenario 24, with the prices read from `pricing/2026-11-10.json`,
  before `scripts/dispatch-core.mjs` was opened or the calculator run
  (section 5). The reading was checked first against the record it
  replaces: at the 5-minute price the same arithmetic gives the O6
  handoff's 26.70, 16.60, 15.96, 34.09, 1.39 and 35.48.
- The calculator was then run on the example, on scenario 24 at both
  lifetimes, on the F8 dispatch input, and on fifteen edge or bad
  inputs (section 5.3).
- Seventy-two faults were seeded, one at a time, into the scorer, the
  core, the gate, the table rules, the two validators, the pricer, the
  example, scenario 24 and the table in force. The gate and the named
  test files were run on each and the file restored with `git checkout`
  (section 6).
- The pricer was checked against a second count of my own that imports
  nothing from the repository, types the prices by hand and keeps the
  last line of each message id where the pricer keeps the largest value:
  on the O6 transcript, its three sub-agents, and the ledger's O1, F1,
  O5, S6 and F7 rows.
- The Anthropic rows of the table were compared with the vendor's page,
  read in this stage by a `web-fetch` sub-agent (a model's report of the
  page, not my own read of it; the third such read of 2026-11-10). The
  OpenAI rows were not re-read.
- The evaluation was run once, as section 1 says, and scored by
  `eval/score.mjs` after that scorer had passed twelve seeded faults.
- Not checked: the OpenAI figures; the Tsunami figures in the ledger
  (another repository's); `SKILL.md` step 7's count of 1,526,208 write
  tokens, which was taken at a moment that cannot be reproduced (F8-7).

## 4. The claims

| No. | Claim | Check | Verdict |
|---|---|---|---|
| O6-1 | Formula 2026-11-11 prices every write term at the row's figure for `ttl`: the first read, the growth, the misses, the compaction penalty and `cost_coord` | Section 5.1 and 5.2 by hand before the code was read; a Haiku stage that crosses its tier at 1h (0.041, 0.023, 0.019 by hand and from the calculator); both penalties at 1h, 1.560 USD each, by hand (section 5.3). Faults C1, C4, C7, C8, C9 and C12 are caught; C6 and C11 (the penalty at the 5-minute price) passed every test and are pinned now (F8-3) | Accept |
| O6-2 | `ttl` is `5m` or `1h`, default `5m`, ignored before this formula; a row with no 1-hour figure is a null price under `1h` | `--ttl 2h` exits 1 and names the two values; `--ttl 1h --formula 2026-11-10` prints `cache_write 2.50` and T* 9.2; `gpt-6.1-sol` at `1h` exits 3 and names `cache_write_1h` and `long_context.cache_write_1h`, at `5m` it computes. Faults C2, C5 and D1 caught | Accept |
| O6-3 | A coordinator the plan names is another session, the current model included; `--coordinator this` is this session (F7-3) | Scenario 24's inputs with To 2: named `claude-sonnet-5-5` beside a Sonnet session gives 0.483 USD by hand (first read 88,950 x 4e-6, then two turns from there) and from the calculator; under `--formula 2026-11-10` the same flags give this session, 0.172. Fault C3 fails one core test (the gate has no such case); fault E15 fails the gate | Accept |
| O6-4 | Formulas 2026-11-10, 2026-10-29 and 2026-10-27 reproduce their records | The example's inputs under `--formula 2026-11-10`: 26.70, 16.60, 15.96, pieces 34.09, cost_coord 1.39, plan 35.48, the O6 handoff's record. The gate recomputes four examples and 24 scenarios under their own formulas. Fault C2 caught | Accept |
| O6-5 | Every figure in `examples/2026-11-10-sessiondispatch-stage-o6.md` follows from its Inputs table | Section 5.1 reproduces every total, term, percentage, the comparison table, the three adverse lines and the hand figures in the prose. One slip: the plan with the two sub-agents at their own lifetime is 40.61 USD, not 40.62 (F8-2, corrected) | Accept |
| O6-6 | Scenario 24: T 13 lies between T* 9.17 at `5m` and 14.17 at `1h`, so the lifetime alone decides | Section 5.2 by hand; faults SC1 and SC2 fail the gate | Accept |
| O6-7 | The text of `SKILL.md` (steps 1.1, 1.2, 1.4.2 to 1.4.4, 2, 3.1 row 6, 3.2 rule 7, 3.3, guardrail 5, step 6, step 7) and the template match the code | Read against `scripts/dispatch-core.mjs` and `scripts/dispatch.mjs` line by line; the template's rows read. Two wording findings, F8-4 and F8-7 | Accept, with findings |
| O6-8 | The gate recomputes the Step B coordination row, the plan total and the draft margin (F7-6), and requires the `ttl` row | Faults E1 to E11, E13 and E15 fail the gate; G1, G2 and G3 (each check removed from the gate) fail `scripts/check.test.mjs`. E12 (an adverse-recompute line) passes, as the handoff says; E14 (a figure in prose) passes, which is where F8-2 sat | Accept |
| O6-9 | `--To 2.5` is refused, not rounded | Exit 1, "To must be a whole number of turns, 0 or more, per piece, found 2.5"; fault C10 caught | Accept |
| O6-10 | The F8 handoff's own record | By hand: continue on Opus 7.175 + 2.880 + 2.400 = 12.45; fresh on Fable 0.120 + 2.610 + 4.118 + 5.760 + 4.800 + 1.367 = 18.78; margin 6.32, 50.8 percent; the piece 17.29. The calculator on `docs/dispatch/2026-11-10-f8.json` prints the same | Accept |
| O6-11 | The hand checks the handoff lists | Scenario 23 at To 0: (0.025 + 101,450 x 2.5e-6) / (78,550 x 0.1e-6) = 35.47 turns at `5m`, and (0.025 + 0.4058) / 0.007855 = 54.84 at `1h`; the example's 480,000 x 16e-6 = 7.680 and 148,170 x 8e-6 = 1.185 | Accept |
| O6a-1 | One module, `scripts/price-table.mjs`, owns the table rules; the gate, `check-pricing.mjs`, the calculator and the scorer import it | Imports read (`check.mjs` line 20, `check-pricing.mjs` 14, `dispatch.mjs` 25, `eval/score.mjs` 19); `check-pricing.mjs` holds no rule of its own (36 lines read). Faults R1, R3 to R7, R9, K1 and K2 caught; R2 and R8 passed every test and are pinned now (F8-3) | Accept |
| O6a-2 | Staleness counts from each family's `fetched` date | The sweep reproduced: `check-pricing.mjs --today` exits 0 on every day from 2026-11-10 to 18 and 2 from 19 to 30; the gate exits 0 on 18 and 2 on 19, 24, 25 and 30, naming both families from 25. The calculator computes for an Anthropic model on 2026-11-24 (14 days) and exits 2 on 25; an OpenAI model exits 2 on 19 | Accept |
| O6a-3 | The table's Anthropic figures are the page's, and no figure on file changed | The read of this stage: six rows of five figures (Fable 5.2, Fable 5.1, Opus 5.5, Sonnet 5.5, Haiku 5.5 below and above 100,000 tokens) equal the table's. Between `6d2c01d` and `bb4b20c`: 107 fields before (figures, classes, thresholds, dates, sources), 0 changed, 0 removed, 11 added; `max_age_days` 8 to 14. Faults P1 to P4 and P7 fail the gate; P5, P6 and P8 fail only the table's own test, because nothing recomputes those figures | Accept |
| O6a-4 | The pricer prices 1-hour write tokens at `cache_write_1h`, says which figure it used, and counts a call once per message id (F7-8) | The second count agrees to the cent on the O6 transcript (120 ids, 13.595 USD) and its sub-agents (1.892, 1.234, 0.004). Fault X1 (keyed on `uuid`) fails 5 of 7 tests; X2, X3, X5, X6 and X7 caught; X4 passes (F8-6) | Accept |
| O6a-5 | The ledger's rows re-priced at the 1-hour figure | The second count: O1 6.049, F1 11.997, S6's 72 Sonnet calls 2.340, O5's first 101 calls 11.796. F7's first 49 calls are 10.524; the row's 10.53 was a hand estimate and now reads 10.52 | Accept |
| O6a-6 | In the desktop app a session writes 1-hour entries and a sub-agent 5-minute ones (`SKILL.md` step 7) | Every transcript under this project's folders: 24 sessions, 7,889,957 of 7,889,957 write tokens are 1-hour; 208 sub-agents, 0 of 11,964,150 are. The four sub-agents the text names sum to 402,343 exactly | Accept |
| O6b-1 | The result block carries five optional keys; a block written before them still validates | The tests read; fault S11 (any `ttl` string accepted) caught | Accept |
| O6b-2 | Measure 3 recomputes under the formula in force from the subject's own To, Fo, Oo, coordinator and `ttl`; scenarios 22 and 23 score clean with no exception | Faults S1, S2, S3, S8 and S9 caught | Accept |
| O6b-3 | Each run's score holds `contract: { to_ok, coordinator_ok, ttl_ok }`; the report counts them and lists the misses | Faults S4 to S7, S10 and S12 caught | Accept |
| O6b-4 | Scenarios 01 to 23 changed in `brief` and `notes` only; no expected figure moved | The 23 files compared between `6d2c01d` and `bb4b20c` with `brief` and `notes` set aside: 23 identical; no brief line removed. The new sandbox test gives every scenario's expected exit code, totals and draft under the formula in force | Accept |
| O6-12 | Findings F7-3 to F7-10 and F7-12 are closed | Each read in the diff: F7-3 (O6-3); F7-4 (step 1.2, the To row); F7-5 (matrix row 6); F7-6 (O6-8); F7-7 (the comment in `coordCost`; the penalty checked at To 45, 47.37 USD by hand); F7-8 (O6a-4); F7-9 (step 1.2's ledger sentence, both templates); F7-10 (the template names the transcript); F7-12 (the header of `check-pricing.mjs`) | Accept |
| O6-13 | The work is green as committed | At `bb4b20c` in this stage: `check: 128 files read, 0 finding(s)`; `tests 117, pass 117, fail 0`, 119 s | Accept |

## 5. Hand derivations

### 5.1 The example

Inputs from its table: Fable 5.2 to Opus 5.5, C0 372,602, T 120, F 2,500,
O 1,500, B 63,170, R 85,000, H 5,000, M 0, L 0, Ta 60, Ra 90,000, To 2,
Fo 2,000, Oo 1,500, this session coordinates, `ttl` 1h. Prices per
million: Fable read 0.2, 1-hour write 16, output 40; Opus 0.2, 8, 20;
Sonnet 0.1, 4, 10.

G is 4,000, so T x G is 480,000; C_end 852,602, under K; C_cont 612,602;
C_fresh 388,170.

- Continue on Fable: 120 x 612,602 x 0.2e-6 = 14.702; 480,000 x 16e-6 =
  7.680; 180,000 x 40e-6 = 7.200. Total 29.58.
- `cost_coord` for one piece, this session, from 377,602 with Go 3,500:
  2 x 381,102 x 0.2e-6 + 7,000 x 16e-6 + 3,000 x 40e-6 = 0.152 + 0.112 +
  0.120 = 0.384. Two pieces 0.772, four pieces 1.555.
- Fresh on Opus: 0.200 + 148,170 x 8e-6 (1.185) + 120 x 388,170 x 0.2e-6
  (9.316) + 3.840 + 3.600 + 0.384 = 18.53. Margin 11.06, 59.7 percent of
  the smaller: fresh by cost.
- Split: 0.200; the run on Sonnet 0.593 + 4.658 + 1.920 + 1.800 = 8.971;
  the acceptance on Opus 1.225 + 3.278 + 1.920 + 1.800 = 8.223; 0.772.
  Total 18.17, 2.0 percent under fresh.
- Pieces: 17.941, 2.054, 2.758 and 17.009, in all 39.76; plan 41.32.
- Adverse lines: T 240 crosses K, so the continue side pays 85,000 x
  16e-6 + 5,000 x 40e-6 = 1.560 and totals 72.24 against 46.80; To 6
  gives 19.30; `ttl` 5m gives 26.70 and 16.60.
- The two sub-agent pieces at the 5-minute price are 1.736 and 2.371.
  The plan with those two is 17.941 + 1.736 + 2.371 + 17.009 + 1.555 =
  40.61. The example said 40.62 (F8-2).

The calculator printed every one of these figures afterwards.

### 5.2 Scenario 24

Sonnet to Sonnet (matrix row 2, medium), C0 400,000, T 13, F 2,000,
O 1,000, B 86,450, R 13,550, H 2,500, To 0, `ttl` 1h. The model does not
change, no tier applies, the stage does not cross K, so the short path
holds:

```
T* = (2,500 x 10e-6 + 100,000 x 4e-6) / (300,000 x 0.1e-6) = 0.425 / 0.03 = 14.17 turns at 1h
T* = (0.025 + 100,000 x 2.5e-6) / 0.03                      = 0.275 / 0.03 =  9.17 turns at 5m
```

T 13 is under 14.17: continue, by break-even. In full at 1h the sides
are 0.545 + 0.156 + 0.130 = 0.831 and 0.025 + 0.400 + 0.155 + 0.156 +
0.130 = 0.866, 4.2 percent apart. At 5m they are 0.773 and 0.658: fresh
by cost, 17.5 percent. Guardrail 1 does not bind (T 13). The scenario
file states the same.

### 5.3 The calculator on edge inputs

`--To 2.5` and `--ttl 2h` exit 1 with the value named. An OpenAI model
at `1h` exits 3. A named coordinator on the current model is another
session under 2026-11-11 and this session under 2026-11-10. `--ttl 1h`
under 2026-11-10 changes nothing. A Haiku stage from 90,000 tokens pays
the base rates for 3 turns and the tier for 7, at the 1-hour figures of
each (by hand 0.0412, 0.0228 and 0.0190). The coordinator's compaction
penalty at To 45 on the example is 1.560 and its plan figure 47.37, by
hand 180 x 692,602 x 0.2e-6 + 630,000 x 16e-6 + 10.800 + 1.560. Staleness
by day and by family is in claim O6a-2.

## 6. Seeded faults

Seventy-two faults, one at a time. "Caught" means the gate or a named
test file failed.

| Where | Seeded | Caught as O6 left it | Passed every check |
|---|---|---|---|
| The scorer (`eval/score.mjs`): S1 to S12 | 12 | 12 | none |
| The core and the calculator: C1 to C12, D1 | 13 | 11 | C6, C11: the compaction penalty at the 5-minute price under 1h, on the continue side and for a coordinator |
| The example: E1 to E15 | 15 | 13 | E12: an adverse-recompute line; E14: a figure in prose |
| Scenario 24: SC1, SC2 | 2 | 2 | none |
| The table in force: P1 to P8 | 8 | 8 | none; three of them (Haiku's and Fable 5.1's 1-hour figures, `max_age_days`) fail only the table's own test |
| The table rules: R1 to R9 | 9 | 7 | R2: a model stale at exactly 14 days; R8: an unpriced family counted stale |
| The validator and `pricing-new.mjs`: K1, K2, N1 | 3 | 3 | none |
| The pricer: X1 to X7 | 7 | 6 | X4: the last line of a message id wins instead of the largest value |
| The gate's own checks: G1 to G3 | 3 | 3 | none |
| Total | 72 | 65 | 7 |

Each of the seven was checked by hand: the code is right in all seven
places (sections 5.1 and 5.3 for the penalties, claim O6a-2 for the
boundary). Four are now pinned by tests added in this stage, which were
then seen to fail on the same faults: C6 and C11 in
`scripts/dispatch-core.test.mjs`, R2 and R8 in
`scripts/price-table.test.mjs`. Three stay open and are handed on: E12
(the gap the handoff names), E14 and X4 (F8-6).

## 7. The rerun against the thresholds

`eval/results-2026-11-10.md` has the run's notes, the summary and every
run's row. 24 runs, 24 records, none unscorable, none run twice.

| Threshold | Reading (section 1) | Result | Met |
|---|---|---|---|
| T1: final agreement in 23 of 24 or more | `final_ok` | 24 of 24 (Wilson 95 percent interval 86.2 to 100.0 percent) | yes |
| T2: 22, 23 and 24 right, with To, coordinator and `ttl` equal, 3 of 3 | `final_ok` and the three contract checks | 22: split, To 30, a Sonnet coordinator, 5m; 23: fresh, To 4, this session, 5m; 24: continue, To 0, this session, 1h. 3 of 3 | yes |
| T3: To and `ttl` equal on 01 to 21 in 20 of 21 or more | no miss among the 21; a block with no inputs reads as the defaults | 0 misses. 20 runs state both, 20 equal. Scenario 18's block has no inputs: its expected record is the one line of step 0. Counted the strict way it is 20 of 21, which also meets the threshold | yes |

The other measures: draft agreement 19 of 19; bound guardrails 11 of 11;
guardrail 4, 24 of 24; arithmetic 59 of 60 stated figures (scenario 02
states `cost_split` 7.09 where its own inputs give 7.23); inputs 411 of
411; the coordinator equal in 23 of 23, so the miss the handoff warned of
(a coordinator stated where the scenario has none) did not occur.

What the run does not show. One run per scenario cannot separate 24 of
24 from a true rate of about 21 of 24. Three scenarios carry the new
terms, one of them the lifetime; on the other 21 the brief states the
lifetime and who starts the next session in one line each, so those test
that a subject reads the line and applies the default, not that it
measures a lifetime itself. No Haiku subject ran.

The subjects cost 11.29 USD at the price of the 1-hour entries they
wrote (8.53 as the runner prices them, F8-5), against about 6.7
estimated.

## 8. Rulings

**The table of 2026-11-10 revised in place: accepted.** The handoff asks
for this ruling. The file was made on 2026-11-10; on that day
`pricing-new.mjs` rightly refuses to overwrite it and a file dated
2026-11-11 would have been in the future for the gate. The revision
added eleven fields and changed none (claim O6a-3), so every record that
cites the table reproduces: the gate recomputes the two that do. Its
`max_age_days` went from 8 to 14, which no record depends on. The limit
of this ruling: a table is revised in place only on its own day and only
by addition. On any later day a refresh is a new file from
`pricing-new.mjs`.

**The class floor's last sentence: replaced.** All three thresholds are
met, so the sentence that said neither term had been scored now states
the measured figures, the interval that one run per scenario allows, and
that no Haiku subject has been scored under this formula.

**F8-1 fixed here, not sent back.** The fix is three lines in
`eval/run.mjs` with a test that failed first on each fault. Sending it
back would have cost a stage and changed nothing in the fix. The cost of
doing it here is that the fix has no reviewer of a class above its
author; the coordinating session's own run of the gate and the tests is
the check it gets.

## 9. Findings

Fixed in this stage:

- **F8-1 The evaluation's calculator arm could not run on the O6 tree.**
  Section 2. Commit `e2d046b`.
- **F8-2 One figure in the example's prose was a cent out.** The plan
  with the two sub-agents at their own lifetime is 40.61 USD (section
  5.1). The gate reads no arithmetic in prose (fault E14).
- **F8-3 Four behaviours had no test.** The compaction penalty at the
  1-hour price on each side, a model's staleness at exactly
  `max_age_days`, and an unpriced family with a `fetched` date. The code
  was right in each; four assertions pin them.

Handed on:

- **F8-4 `SKILL.md` step 2 says "Records dated 2026-11-10 used the
  formula of 2026-11-10".** Two records of that date name formula
  2026-11-11: the new example and the F8 handoff's own record. Every
  record names its formula in its Inputs table and the gate reads it
  there, so no figure is at risk. The sentence should say that the date
  decides only where a record names no formula. For the next stage that
  edits step 2.
- **F8-5 The runner and the scorer price a subject's writes at the
  5-minute figure.** `usageFromCli` in `eval/run.mjs` and `decideCost` in
  `eval/score.mjs`. The `claude -p` subjects wrote 1-hour entries only
  (1,840,679 of 1,840,679 tokens), so `usd_priced` and the "USD to
  decide" columns are 24 percent under the cost at the price written.
  The CLI reports the split per run; the pricer already uses it.
- **F8-6 Three gaps in what the checks can see.** The adverse-recompute
  lines of an example (fault E12, carried from F7-6); any figure an
  example states in prose (E14); and the pricer's largest-value rule
  (X4): a pricer that keeps the last line of a message id passes all 7
  tests and agrees with the pricer on every transcript compared (O6 and
  its three sub-agents, O1, F1, S6).
- **F8-7 `SKILL.md` step 7 cites "1,526,208 of 1,526,208 write tokens in
  five transcripts".** The five are not named and three of those
  sessions ran on, so the count cannot be reproduced. What it supports
  holds on every transcript (claim O6a-6). Step 7's row for the Claude
  Code CLI says "Unknown"; this run measured it for `claude -p` 2.1.316
  (1-hour, 24 runs). Both are text for the next stage that edits step 7.
- **F8-8 The session-start helper named the O6 handoff, not this one.**
  The app cut this session's worktree from `main`, where the F8 handoff
  did not exist, so the `thereafter-` name could not help. The brief
  said so and nothing was lost. The helper should prefer a handoff whose
  status is `ready` or `in-progress` (the handoff's open question), and
  a brief for a stage on an unmerged branch should keep naming the file.
- **F8-9 The pricer's "days old" line rounds a difference in UTC.** On
  the table's own day it read "0 days old" until 23:00 local time and
  "1 days old" after it. The pricer refuses nothing on age, so no figure
  moves; `localToday` and `familyAgeDays` in `scripts/price-table.mjs`
  give the calendar figure.

Measured for the handoff's open questions, no ruling needed:

- **The coordinator's wakes.** After its own stage the F7 session made
  25 calls for 6.32 USD up to the start of F8 (3,644 tokens written and
  2,950 output a call), with no cold wake: no call rewrote its context.
  The record priced To 2 for each of four pieces, 8 turns and 1.55 USD.
  The 25 include writing the O6 handoff, so they are an upper bound on
  coordination, and the session is still open. To was the input that was
  wrong, as T was on the stages; the miss term the handoff asks about
  has nothing to measure yet.
- **A per-piece lifetime.** Sub-agents write 5-minute entries (claim
  O6a-6). In the one plan measured, pricing the two sub-agent pieces at
  the record's 1-hour figure adds 0.71 USD to 41.32, 1.7 percent, and it
  touches Step B's piece costs only: Step A's three plans are sessions.
  Decision D16 in `docs/status.md` puts the choice to the operator.
- **The lifetime the CLI subjects write:** 1-hour (F8-5).
- **F7-13,** the local branch `pricing/2026-11-10`: untouched; the
  operator's.

## 10. What this stage changed

Before the run: `eval/run.mjs` and its test in
`scripts/eval-score.test.mjs` (F8-1, `e2d046b`); section 1 of this note
(`79aee38`). After it: the run's files under `eval/runs/2026-11-10/` and
`eval/results-2026-11-10.md`; the class floor's last sentence in
`SKILL.md`; one figure in the example (F8-2); one test in each of
`scripts/dispatch-core.test.mjs` and `scripts/price-table.test.mjs`
(F8-3); the ledger's rows for O6, O6a, O6b, F8 and the subjects, and the
F7 row's 10.52; `docs/status.md`; a changelog entry in `README.md`; the
F8 handoff's status and measured cells; the rest of this note. Nothing
else under `scripts/`, `eval/`, `pricing/` or `templates/`. Then the
release steps: `main` fast-forwarded to this stage's commit and pushed
with this branch, and `node scripts/install.mjs --harness all` run from
the main checkout; the status document carries their outputs. No tag.

## 11. Cost of this acceptance

Projected 17.29 USD at T 60 (`docs/dispatch/2026-11-10-f8.json`, at the
1-hour write). Measured, from the transcript just before the stage's
commit: 21.21 USD on 103 calls (4,123 tokens written and 1,591 output a call), 1.23 times the projection. T was the input that was wrong, as on F1 and F7: 103 calls against 60, because seeding 72 faults and running an evaluation take more calls than reading does. The release steps and the report come after that count. The subjects' 11.29 USD is beside it in the ledger.
