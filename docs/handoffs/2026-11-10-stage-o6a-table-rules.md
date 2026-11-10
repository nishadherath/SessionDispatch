---
stage: "Stage O6a: one owner for the price-table rules, the 1-hour write figure, the Fable 5.1 row, the pricer"
model: claude-sonnet-5-5
effort: medium
status: ready
created: 2026-11-10
from: "Stage O6 session local_742a5347 (claude-opus-5-5, high), branch claude/stage-o6-write-price-003ba0"
---

# Stage O6a: the table rules

## Goal
Done when, on your own branch (a worktree cut from the O6 branch), all of these hold. (1) One new module, `scripts/price-table.mjs`, holds every rule of both price-table validators, with the API below. (2) `scripts/check-pricing.mjs` and the `checkPricing` function of `scripts/check.mjs` both import it and keep no rule of their own. (3) Staleness counts from each family's `fetched` date. (4) `pricing/2026-11-10.json` carries `cache_write_1h`, the `claude-fable-5-1` row and `max_age_days` 14. (5) The pricer prices 1-hour write tokens at `cache_write_1h` where the row has it and says which figure it used. (6) The fixture repeats a message under a second `uuid` with a larger count on its later line. (7) `node scripts/check.mjs` and `node --test "scripts/*.test.mjs"` are green, counts quoted, work committed on your branch.

## Decisions already made
- Staleness: a family's figures are stale when today is more than `max_age_days` (14) days after its `fetched`. Only families with at least one numeric figure count. `table_date` only names the file: it must equal the filename and not be after today, and its age decides nothing. A family with `fetched` null and a numeric figure is an error, as now.
- Exit codes, the same in both commands: 0 valid; 2 when one or more priced families are stale and nothing else is wrong; 1 for anything else. The gate keeps its own wording and its other checks; only `checkPricing` changes.
- The table is revised in place, not copied. Today is 2026-11-10 in the operator's zone, a file of that date exists, `pricing-new.mjs` refuses to overwrite it, and a file dated 2026-11-11 would be in the future. Every figure on file stays as it is, so every record that cites the table still reproduces. Changes: `max_age_days` 14; `cache_write_1h` on each Anthropic row and inside Haiku's `long_context`; a `claude-fable-5-1` row listed after `claude-fable-5-2` (the class resolves to the first row listed); the notes on eight days and on the removed row replaced by one note each that says what the file now holds and why; the Anthropic `fetched_by` names the second read of 2026-11-10 and the 1-hour figures.
- The figures, USD per million, read twice on 2026-11-10 (a Stage F7 sub-agent and a Stage O6 sub-agent, identical): Haiku 5.5 `cache_write_1h` 0.2, and 1 above 100,000 tokens; Sonnet 5.5 4; Opus 5.5 8; Fable 5.2 16; Fable 5.1 input 10, cache_write 12.5, cache_write_1h 20, cache_read 0.25, output 50, class fable, no long-context tier. The page states 1-hour writes at 2 times base input and 5-minute writes at 1.25 times. OpenAI rows get no `cache_write_1h` (30-minute writes): absent means the row offers none.
- `cache_write_1h` is a number, null or absent, in a row and inside `long_context`. Null in a fetched family is a missing figure (the partial-null rule applies to it); absent is not.
- `pricing-new.mjs` keeps copying the newest table; its null listing also names a null `cache_write_1h`.
- The pricer: where a row has `cache_write_1h`, 1-hour write tokens (`cache_creation.ephemeral_1h_input_tokens`) are priced at it and the rest of the writes at `cache_write`; where it has none, all writes at `cache_write`, as now. The printed report and `--json` say which figure priced the 1-hour tokens per model.

## The module API (fixed: the O6 session imports it after the merge)
```
export const PRICE_KEYS          // ["input", "output", "cache_read", "cache_write"]
export function localToday(now = new Date())            // "YYYY-MM-DD", local calendar day
export function newestTableFile(dir)                    // absolute path of the newest YYYY-MM-DD.json, or null
export function familyAgeDays(table, family, today)     // whole days since fetched, or null when fetched is null
export function staleFamilies(table, today)             // [{ family, fetched, ageDays }] for priced families past max_age_days
export function modelStaleness(table, modelId, today)   // { stale, family, fetched, ageDays }, or null when the id is not listed
export function validateTable(table, { fileName, today }) // { errors: string[], warnings: string[], stale: [{ family, fetched, ageDays }] }
```
Pure functions, standard library only, a module header of the persona's section 10.4 (what it owns, what it does not, the one non-obvious thing), a doc comment per export, every error message naming the field, the value found and what is accepted. `validateTable` holds the union of both validators' rules today (read both before writing it). The calculator and the scorer are not yours: leave `scripts/dispatch.mjs` and `eval/` alone even where they judge staleness; the O6 session moves them onto the module.

## Files you own
`scripts/price-table.mjs` (new) and its test `scripts/price-table.test.mjs`; `scripts/check-pricing.mjs` (give it a module header, F7-12) and its test; `scripts/pricing-new.mjs` and its test; `scripts/session-cost.mjs` and its test; `scripts/fixtures/` files the pricer tests use; `pricing/2026-11-10.json`; `pricing/README.md` (its "(14)" made true: the rule is 14 days from each family's `fetched`); the `checkPricing` function of `scripts/check.mjs` and its imports, nothing else in that file. Touch nothing else. If a test outside your files breaks, stop and escalate.

## Oracle
- The dated sweep as a test: for every day from 2026-11-10 to 2026-11-30, `validateTable` on the real table and `node scripts/check-pricing.mjs --today <day>` agree (expected: exit 0 to 2026-11-18, exit 2 from 2026-11-19, when OpenAI's `fetched` of 2026-11-04 passes 14 days). Run the gate with `--today` on 2026-11-18, 2026-11-19 and 2026-11-30 and assert the same exit codes (the gate is slow; three days are enough).
- A test that `modelForClass(table, "anthropic", "fable")` from `scripts/dispatch-core.mjs` on the real table gives `claude-fable-5-2`.
- Seeded faults in the module test: a figure as a string, `cache_write_1h` negative, a partial null with `fetched` set, a future `fetched`, `table_date` against the filename. Each fails.
- The pricer on the fixture, worked by hand in a comment in the test: the tokens per category and the USD, with the 1-hour figure. A pricer keyed on `uuid` must now fail a test (F7-8). Break the code once and see the test fail before you trust it.

## Prose and conduct
Australian English, no em-dashes, none of the banned vocabulary of `ENGINEERING_PERSONA.sonnet.md` section 14.1 (the gate lists it in `scripts/check.mjs`). The gate checks Markdown; check your code comments by eye. Windows is the platform: paths through `path.join`, no POSIX-only commands in tests. Commit on your branch in one or two commits ending with the line `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. Do not push, do not merge into `main`, do not touch the O6 branch. Your final message gives the branch, the last commit, the gate's line and the test counts, then anything you are unsure of.

## Escalation
Stop and answer in five lines (Task, Tried, Evidence, Hypothesis, Decision) when: a rule of the two validators conflicts and this brief does not settle it; a test outside your files fails; a hypothesis fails twice; or the API above cannot hold a rule you need.

## Exact next action
Check `git log -1` shows the O6 branch's commit that adds this file (else `git merge --ff-only claude/stage-o6-write-price-003ba0`). Run the gate and the tests and note the counts. Read `scripts/check-pricing.mjs`, `checkPricing` in `scripts/check.mjs`, `scripts/session-cost.mjs` and its test. Write the module test first.

## Cost projection
1.74 USD at T 60 (the O6 handoff's Step B row, `docs/dispatch/2026-11-10-o6-chain.json`; an estimate, low by about 10 to 20 percent for the 1-hour writes).

## Time projection
20 to 45 minutes of wall clock (protocol section 7, Sonnet), inside Stage O6.

## Session dispatch decision
Decided in the O6 handoff's Step B (`docs/handoffs/2026-11-10-then-stage-o6-write-price-scorer-contract.md`): this piece on claude-sonnet-5-5 at medium, a sub-agent in its own worktree, in parallel with O6b and part C. Nothing here changes it.
