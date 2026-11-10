# Acceptance of Stage O6 and the 24-scenario rerun, 2026-11-10

Stage F8. This file is written in two parts. Section 1 was committed
before the first subject ran, so the way the thresholds are read cannot
follow the figures. The rest is added when the run is scored.

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
