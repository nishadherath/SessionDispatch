# Acceptance of Stages O5 and S6 and of the pricing work `1ae8c0d`, 2026-11-10

Stage F7: adversarial acceptance of Stage O5 (Opus 5.5 at high, commits
`2185a2b`, `8c1ce01`, `6eb7efd`, `d44668f`), Stage S6 (Sonnet 5.5 at
medium, commits `016201e`, `969cb49`, `c000f5d`) and the pricing work
committed as found under D13 (`1ae8c0d`, a Codex session of 2026-11-04
and the price-table session of 2026-11-10), by `claude-fable-5-2` at
xhigh in a fresh session (app id `local_3066f14f`, transcript
`95cd0d09`), under matrix row 4 and guardrail 6. Brief:
`docs/handoffs/2026-11-10-stage-f7-acceptance-release.md`. Tree under
review: `c000f5d`, which carries all three.

**Verdict: accepted, all three.** Twenty-one claims checked, twenty-one
accepted, none rejected. Thirteen findings are handed on (section 7);
none blocks the release and none changes a figure on file except the O5
ledger row, which was priced before that session's last turns and is
corrected here. The largest finding is not in the accepted work: every
cache write this harness makes is a 1-hour write, which the table and so
the formula price at the 5-minute figure (section 7, F7-1). Two decisions
go to the operator, D14 (the scorer gap, section 6) and D15 (a follow-up
stage for the pricing findings, section 8), and the tag push waits for
the operator's yes. Gate before this note: `node scripts/check.mjs`, 118
files read, 0 findings, exit 0; `node --test "scripts/*.test.mjs"`: 67
tests, 67 pass, 0 fail, 113 s.

## 1. How the checks were made

- `cost_coord` was derived for the Tsunami example from the text of
  `SKILL.md` step 2, 2.1 and 3.3 before the calculator was opened, by a
  script of my own that imports nothing from `scripts/` and types the
  prices from `pricing/2026-10-29.json`. Scenarios 22 and 23 were
  recomputed the same way (section 3).
- The calculator was then run on the example's command, on its three
  adverse values, on both scenarios, and on nine bad or edge inputs.
- Twenty-four faults were seeded, one at a time, into the calculator
  core, the example, the pricer, the ledger, the template and the table
  in force; the gate and the named test files were run on each and the
  file restored with `git checkout` (section 4).
- The pricer was run on the O1, F1, O5 and S6 transcripts and checked
  against a second count of my own that keeps the last line of each
  message id where the pricer keeps the largest value (section 3.3).
- The Anthropic rows of `pricing/2026-11-10.json` were compared with the
  vendor's page, read on 2026-11-10 by a `web-fetch` sub-agent (a model's
  report of the page, not my own read of it). The OpenAI rows were not
  re-read.
- Not checked: the Tsunami figures (25.49, about 56, 166 calls), which
  live in another repository; they are taken from
  `docs/assessment-2026-11-02.md`, which checked them.

## 2. The claims

| No. | Claim | Check | Verdict |
|---|---|---|---|
| O5-1 | `cost_coord` is To times the pieces, at the coordinator's model: this session from C0 + H with the continue side's terms; another model after a first read of B + H | Hand derivation, section 3.1: 8.562, 18.474 and 42.348 USD on this session; 2.141, 4.585 and 11.093 on a Sonnet session; the calculator prints the same | Accept |
| O5-2 | The term sits on the fresh side (1 piece), the split (2) and the Step B plan (every piece), never on the continue side | `cost_continue` is 15.88 under both formulas; fresh 8.93 to 17.49, split 9.57 to 28.05, plan 33.36 to 75.71; mutation M3 (pieces ignored) fails the gate and 4 tests | Accept |
| O5-3 | T* adds `cost_coord` to its fixed cost | Scenario 23 by hand: 68.3 turns with it, 35.5 without; mutation M5 fails the gate and 3 tests | Accept |
| O5-4 | A coordinator that crosses K pays the continue side's compaction penalty | To 40 on 4 pieces ends at 1,111,615 tokens, over K: 61.265 + 0.975 = 62.24 USD by hand; mutation M6 fails 1 test (the gate has no example that crosses) | Accept |
| O5-5 | Formulas 2026-10-29 and 2026-10-27 reproduce their records; To counts as 0 under them | `--formula 2026-10-29 --To 30` prints 15.88, 8.93, 9.57 and no coordinator line; mutation M4 fails the gate and 3 tests; scenarios 01 to 21 unchanged (`git diff --stat 77a353a c000f5d -- eval/scenarios` lists 22 and 23 only) | Accept |
| O5-6 | Every figure in `examples/2026-11-02-tsunami-rebalancing-dashboard.md` follows from its Inputs table | Section 3.1 reproduces every total, term, percentage and ratio in the file, the adverse recompute and the comparison table included | Accept |
| O5-7 | The gate recomputes the term in examples and scenarios | Mutations M9 to M11 and M14 to M16 fail the gate; `scripts/eval.test.mjs` seeds scenario 22. Four figures in the example are outside the recompute (finding F7-6) | Accept |
| O5-8 | Scenarios 22 and 23 state what the calculator gives, with alternatives at the other end of the term | Section 3.2: every figure of both files and their alternatives by hand | Accept |
| O5-9 | The text of steps 1.2, 2, 2.1, 3.1, 3.2 rule 7 and 3.3 and the class floor matches the code; the floor says the term is unscored | Read against `scripts/dispatch-core.mjs` line by line. Rule 7's two harness facts hold in this session: a session started by another cannot start one (this session's own instructions), and a session sets only models at or below its own (the S6 session was switched to Fable before it could set this one, section 3.3) | Accept, with findings F7-3 to F7-5 |
| O5-10 | The template carries the new rows and lines | `templates/decision-record.md` diff read; the gate's heading and row checks pass | Accept |
| S6-1 | The pricer counts a call once per message id | O1: 167 assistant lines, 49 ids, 49 calls; my second count agrees on every token total for O1 and S6. The test fixture is weaker than the claim (finding F7-8) | Accept |
| S6-2 | It prices with the table in force or `--table`, lists sub-agents apart, and exits 3 on a model with no row | The 6 tests pass; a unique id per line fails 4 of them; the O1 and F1 runs with `--table pricing/2026-10-29.json` exit 0 | Accept |
| S6-3 | The ledger's O1, F1 and O5 rows are what the pricer gives | O1 49 calls and 5.335 USD, F1 24 calls and 9.966 USD: exact. O5 is 101 calls and 10.706 USD now; the row said 96 and 10.25, priced at 20:04 before the last turns, as its Source cell said. Row corrected in this stage | Accept |
| S6-4 | Pooled measured over projected is 0.86 for six pieces, 0.50 to 1.69 per piece | 40.791 over 47.68 = 0.856; the six ratios 0.497, 0.496, 0.719, 1.681, 0.633, 1.693 | Accept |
| S6-5 | Every cache write in those transcripts is a 1-hour write, so each measured cost is a lower bound | 1,209,353 of 1,209,353 write tokens in the four transcripts carry the 1-hour mark. The size of the bias is in finding F7-1 | Accept |
| S6-6 | Step 1.2 states a sample size on each default and moves none | Word diff of `SKILL.md` since `v1.0.0`: six parentheses added to the F, O, H and M rows, no figure changed | Accept |
| S6-7 | The gate checks the ledger header and the Measured columns | Mutations M20 and M21 fail the gate | Accept |
| D13-1 | The Anthropic rows of `pricing/2026-11-10.json` are the page's | The sub-agent's read of 2026-11-10: Haiku 5.5 (both tiers, threshold 100,000), Sonnet 5.5, Opus 5.5 and Fable 5.2 (8, 10 for a 5-minute write, 0.20, 40) match the table figure for figure | Accept |
| D13-2 | `scripts/check-pricing.mjs` validates the table in force without the repository | Exit 0 on the table today; its test rejects six bad tables; mutations M22 and M23 fail the gate | Accept, with rulings 5.1 and 5.3 |
| D13-3 | `SKILL.md` step 1.4.4 and `pricing-new.mjs` name the validator an installed copy has | The payload is `SKILL.md`, `pricing/`, `templates/`, `examples/`, `scripts/` (`scripts/install.mjs` line 32) | Accept |
| D13-4 | The work is green as committed | The gate and the tests above, on a tree that contains it | Accept |

## 3. Hand derivations

### 3.1 The Tsunami example

Prices per token from the table of 2026-10-29: Fable 5.1 reads 0.25e-6,
writes 12.5e-6, output 50e-6; Opus 0.2, 5 and 20; Sonnet 0.1, 2.5 and 10.
No long-context tier is on these rows. Coordinator: this session, from
C0 + H = 145,115 + 6,500 = 151,615, Go = 3,000 + 3,000.

```
1 piece,  30 turns: average 241,615; reads 1.812 + writes 2.250 + output 4.500 =  8.562
2 pieces, 60 turns: average 331,615; reads 4.974 + writes 4.500 + output 9.000 = 18.474
4 pieces, 120 turns: average 511,615; reads 15.348 + writes 9.000 + output 18.000 = 42.348, ending at 871,615, under K
Sonnet, another model: first read 94,686 x 2.5e-6 = 0.237, then the same terms: 2.141, 4.585, 11.093
cost_continue 4.001 + 4.375 + 7.500 = 15.876
cost_fresh    0.325 + 0.701 + 3.152 + 1.750 + 3.000 + 8.562 = 17.490; margin 1.614, 10.2 percent of the smaller
cost_split    0.325 + 4.301 + 4.945 + 18.474 = 28.045
pieces        8.603 + 9.852 + 9.076 + 5.825 = 33.357; plan 75.705
To 40: 11.716, fresh 20.64, continue by 30.0 percent; To 29: 8.255, fresh 17.18, 8.2 percent, inside the band
To 40 on 4 pieces: 61.265 + penalty (52,000 x 12.5e-6 + 6,500 x 50e-6 = 0.975) = 62.24
```

Every figure in the example matches, as do 0.285 USD a turn, 6.75 of the
8.56, the 7 and 60 percent of the comparison table, 77.8 percent under
the older formula, and 0.76 and 1.11 against the measured 56.

### 3.2 Scenarios 22 and 23

Scenario 22 (Fable 5.1 to Opus, T 100, To 30): with a Sonnet coordinator
27.50, 14.90 and 12.89 USD, fresh by 84.6 percent, the split cheaper by
15.5; with this session coordinating 22.86 and 29.84, `cost_coord` 10.07
and 21.49, the split dearer by 30.6; at To 0, 12.79 and 8.36. Scenario 23
(Sonnet to Sonnet, compacted, To 4): `cost_coord` 0.258, 2.45 against
2.63, 7.5 percent, T* 68.3; at To 0, 2.37, 3.2 percent, T* 35.5. All as
the scenario files state.

### 3.3 The transcripts

| Session | Table | Calls | Cache write per call (after the first) | Output per call | USD |
|---|---|---|---|---|---|
| O1 `4a645017` | 2026-10-29 | 49 | 4,856 (4,177) | 2,088 | 5.335 |
| F1 `99f38ac8` | 2026-10-29 | 24 | 11,282 (10,061) | 4,263 | 9.966 |
| O5 `69a179e5` | 2026-11-10 | 101 | 3,596 (3,220) | 1,371 | 10.706 |
| S6 `d715dfd0`, Sonnet calls | 2026-11-10 | 72 | 2,356 (1,809) | 623 | 2.086 |
| S6 `d715dfd0`, Fable 5.2 calls | 2026-11-10 | 6 | 27,972 (1,475) | 666 | 2.062 |

The S6 transcript ends with six calls on `claude-fable-5-2`. The
operator switched that session's model so that it could set this one's
(a session sets only models at or below its own), and the first call on
the new model wrote 160,458 tokens of context to that model's cache:
2.06 USD in six calls, as much as the stage's 72. It is a measured cache
miss of the kind step 1.2's M describes, caused by a model change and
not by a pause.

## 4. Seeded faults

Nineteen of twenty-four caught. The five that passed are in findings
F7-6 and F7-8; each figure they touch was checked by hand in section 3.

| Seed | Where | Caught by |
|---|---|---|
| M1 output term dropped; M2 start at C0, not C0 + H; M3 pieces ignored; M4 To kept under older formulas; M5 T* without the term; M7 no first read on another model; M8 a same-id coordinator priced as fresh | `scripts/dispatch-core.mjs` | The gate (1 to 27 findings) and 2 to 4 of 28 tests |
| M6 the coordinator's compaction penalty removed | the same | 1 test; the gate stays green |
| M9 the `cost_coord` term line; M10 the Step B plan line; M11 the Sonnet comparison line; M14 the To row; M15 the split total; M16 the comparison table | the example | The gate |
| M12 the Step B table's coordination row; M13 the plan total in prose; M17 an adverse-recompute line; M18 the draft verdict's margin | the example | Nothing |
| M19a the pricer keyed on the line's `uuid` first | `scripts/session-cost.mjs` | Nothing: 6 of 6 tests pass |
| M19b a unique id per line | the same | 4 of 6 tests |
| M20 the ledger header; M21 the Measured columns; M22 a figure as a string; M23 `max_age_days` removed | ledger, template, table | The gate |

Calculator probes: a fractional To in the JSON exits 1 with the reason,
and `--To -1` exits 1 on the argument parser's own message; an unknown coordinator exits 1 and lists the models; a
coordinator with null prices exits 3 with step 1.4.4's two choices;
`--coordinator haiku` prices the tier; `--Fo` and `--Oo` override. One
slip: `--To 2.5` on the flag is rounded to 3, not refused.

## 5. The three points of D13

### 5.1 `max_age_days` is 8 in the table and 14 in the prose

Ruling: the table's field governs, and nothing is changed in this
release. Every script reads the field, and step 1.4.2 names it. The 8 is
not a new policy: the table's own note derives it so that figures fetched
on 2026-10-29 would not outlive 14 days (2026-11-04 plus 8). For the
table of 2026-11-10 the same sum bounds the OpenAI figures of 2026-11-04.
So the prose states the rule (14 days from the day a figure was read) and
the field states it for one file. The parenthesis "(14)" in `SKILL.md`
step 1.4.2, `AGENTS.md` rule 3, `pricing/README.md`, protocol section 2,
`docs/installing.md` and `README.md` reads as the field's value, which it
no longer is. The hazard: `pricing-new.mjs` copies the 8 forward, so the
next refresh inherits a number derived for this file. The fix belongs
with 5.3 (D15).

### 5.2 The `claude-fable-5-1` row is gone

Ruling: accepted as the operator's request, which the table's note
records, with its consequence stated. The page still lists Fable 5.1
(10, 12.50, 0.25, 50, read 2026-11-10). The note sends a Fable 5.1
session to an older table; the calculator takes `--table` and refuses a
stale one, and both older tables are stale from 2026-11-13. From that day
a session on Fable 5.1 cannot compute and takes the default. Restoring
the row reverses a request, so it is the operator's (D15).

### 5.3 Two validators for one table

Ruling: accepted for this release; one owner is needed. The two disagree
on dates: with `--today` from 2026-11-13 to 2026-11-18
`check-pricing.mjs` exits 1 ("openai: source figures are stale", by the
family's `fetched` date against the 8) while the gate is green (by
`table_date`). The per-family rule is the better one: `pricing-new.mjs`
gives a copied table today's `table_date` with no figure re-read, which
satisfies the gate. The rules should live in one module that both
commands import, with staleness counted from `fetched` (D15).

## 6. The scorer gap (decision D14)

`eval/score.mjs` recomputes measure 3 under formula 2026-10-29 from the
subject's own inputs, and the result block has no To or coordinator
field. On scenarios 22 and 23 it marks a correct `cost_fresh`,
`cost_split` and `t_star` wrong; `scripts/eval-score.test.mjs` pins that.
Two things widen the gap beyond the handoff's framing: the block
contract has nowhere to state To, so the scorer cannot learn it without
a change to the subject prompt and the rubric; and the briefs of
scenarios 01 to 21 do not say who starts the next session, so a subject
reading the new text may apply the default To 30 where the expected
figures assume none.

```
D14
Decision:      What happens to the scorer gap: measure 3 marks the coordinator's figures wrong on scenarios 22 and 23.
Options:       A at the next required rerun: the stage that reruns first adds To and the coordinator to the result block, teaches the scorer the scenario's formula, states who coordinates in the 21 older briefs, and removes the pin / A-now the same work as its own stage now, with a 23-run Sonnet rerun to score the term / B take 22 and 23 out of the scored set until a rerun / C accept the mismatch and write it into the contract
Pros and cons: A costs nothing until a rerun is needed and keeps the fix beside the run that proves it; the pin and the README note carry the knowledge meanwhile. A-now measures whether a Sonnet subject applies To correctly, the one unscored risk of v1.1.0, for about 15 to 17 USD (a Sonnet stage near S6's 2.09 measured, 23 subject runs near H3's 5.89, a Fable acceptance near this stage's cost; an estimate) and about 2 hours. B hides the only two scenarios that hold the new term. C leaves a scorer that is known to be wrong on a correct record.
Blast radius:  A and C: none now; a rerun before the fix misreports measure 3 on 2 of 23 scenarios. A-now: the evaluation contract (block, prompt, rubric, scorer, 21 briefs), accepted before use. B: the scenario index and the test's count.
Recommended:   A, because D12 option A' already accepted the term as unscored until the next rerun, and real dispatch records show To in their Inputs table, so a misapplied To is visible in the ledger loop at no cost; A-now is the choice if the operator wants the class floor's sentence replaced by a measurement before relying on the term.
```

Ruling: A. Nothing in `eval/` is changed by this stage. Scenarios 22 and
23 stay in the set, and the pin stays until the scorer is taught.

## 7. Findings beyond the claims

- **F7-1 The formula prices cache writes at the 5-minute figure; this
  harness writes 1-hour entries.** All 1,209,353 write tokens in the four
  transcripts are 1-hour writes. The page read on 2026-11-10 prices a
  1-hour write at twice base input and a 5-minute write at 1.25 times,
  and the table's `cache_write` is the 5-minute figure by its own note.
  At the 1-hour figure the measured costs rise by 0.71 USD for O1 (13.4
  percent), 2.03 for F1 (20.4), 1.09 for O5 (10.2) and 0.25 for S6's
  Sonnet calls (12.2). The projections carry the same understatement in
  every write term. It moves verdicts, not only totals: the fresh side's
  first read is a write, so scenario 23's T* at To 0 goes from 35.5 to
  54.8 turns. Against that, a 1-hour lifetime makes a miss from a review
  pause rarer, which supports M's default of 0. This predates the
  accepted work (Stage 0's table). D15.
- **F7-2 The S6 ledger row and this stage's.** Filled in this stage;
  the model switch of section 3.3 is in the ledger's notes.
- **F7-3 "Another model" should read "another session".** Step 2 and
  `planCoord` treat a coordinator with the current model's id as this
  session. A fresh coordinator on the current model (a Sonnet session
  the operator starts, beside a Sonnet briefing session) cannot be priced
  into the plan; the calculator shows it only in its comparison line. In
  scenario 23 the two differ by 0.18 USD.
- **F7-4 To's default is unclear when a session starts the next one
  itself and ends.** Step 1.2 says 0 "when the operator starts the
  sessions and this session ends". Under the autonomy yes the session
  starts its successor and ends, which is the same cost (one turn) and is
  not named. A reader may take the default 30 there, and with it a
  continue verdict.
- **F7-5 Matrix row 6 against two older rules.** The coordinator row says
  Sonnet at medium and lists "merge"; the raise rule says a merge raises
  effort one step, and guardrail 3 wants an approval step in the brief of
  any class below Opus that pushes. The row should say so or point there.
- **F7-6 The gate does not recompute four kinds of figure in an
  example:** the Step B table's coordination row, the plan total in
  prose, the adverse-recompute lines, and the draft verdict's margin and
  percentage (M12, M13, M17, M18). The margin gap predates O5.
- **F7-7 The coordinator's compaction penalty uses the stage's R.** For a
  Step B plan that is piece A's re-read set, which is not what a
  coordinator re-reads. The size is small (0.975 of 62.24) and the branch
  has a unit test and no example.
- **F7-8 The pricer's fixture repeats a message with the same `uuid` and
  the same values.** Real transcripts give each line its own `uuid` (O1:
  167 lines, 167 `uuid` values, 49 message ids). A pricer keyed on `uuid`
  passes all six tests and counts O1 as 167 calls. One fixture line
  fixes it. The "largest value" rule is untested either way: in O1 no
  repeated line carries a larger count than an earlier one.
- **F7-9 `SKILL.md` step 1.2 and `templates/handoff.md` name
  `docs/dispatch/calibration.md`,** which is not in the installed
  payload. In another project the sentence points at a file that is not
  there, and the template tells a session to append to it.
- **F7-10 The handoffs name sessions by the app's id, the pricer looks
  transcripts up by another.** `64c9f68d` is the S6 session's app id; its
  transcript is `d715dfd0-...jsonl` under the worktree's project folder.
  A handoff should give the transcript id, or the pricer should accept
  the folder.
- **F7-11 No changelog line for the table of 2026-11-10,** which replaced
  a model and changed the fable class's prices. Added in this stage.
- **F7-12 `scripts/check-pricing.mjs` has no module header** of the kind
  the persona's section 10.4 asks for, and its style differs from the
  other scripts. For the stage that gives the table one owner.
- **F7-13 A local branch `pricing/2026-11-10` (`d106281`) is not in
  `main`.** Its table equals the one on `main`; it lacks
  `pricing/2026-11-04.json`. It looks superseded by `1ae8c0d`. Left
  alone; deleting it is the operator's.

## 8. The follow-up stage (decision D15)

```
D15
Decision:      Whether the pricing and text findings of this acceptance are staged.
Options:       A an Opus stage at high and a Fable acceptance: a 1-hour write figure in the table and the write price chosen per harness, under a new formula date with its own example (AGENTS.md rule 8); staleness counted from each family's fetched date in one module both validators import; the claude-fable-5-1 row restored from the page; findings F7-3 to F7-10 and F7-12 / B a Sonnet stage at medium and an Opus acceptance: everything in A that needs no formula change (one validator, staleness from fetched, the row, the text and test findings), the 1-hour figure left as a stated lower bound / C nothing now: the findings stay here as maintenance items
Pros and cons: A removes a 10 to 20 percent understatement from every projection and a break-even error of up to about half on the first-read term, and closes the validator split before it shows; about 22 to 25 USD and 2 hours (an estimate from this chain: O5 measured 10.71, this stage's cost below). B costs about 7 to 9 USD (S6 measured 2.09 for the Sonnet part; an Opus acceptance near 5, an estimate) and closes the dated faults; projections stay low by a known amount. C costs nothing; from 2026-11-13 the two validators disagree and a Fable 5.1 session cannot compute; from 2026-11-19 the table is stale and a refresh inherits the 8.
Blast radius:  A: SKILL.md step 2 and 1.4, the table schema, the calculator, the pricer, every installed copy; past records safe by formula date; the class floor's figures stay on the older formulas. B: the table and its validators, six prose lines, the installed copies. C: none now.
Recommended:   A, because the write price is an input to every verdict near the band and the evidence is 1.2 million tokens with no exception; B is the fallback if 2 hours is too much now, and A can follow it. Either way the stage should start before 2026-11-13.
```

Ruling: nothing in D15 is done by this stage. If the operator chooses A
or B, this session writes the handoff, since it holds the findings.

## 9. What this stage changed

This note; the O5 row of `docs/dispatch/calibration.md` corrected and
the S6 and F7 rows filled, with three notes; `docs/status.md`; a
changelog entry in `README.md`; the F7 handoff's status. No file under
`scripts/`, `eval/`, `pricing/`, `templates/` or `examples/`, and not
`SKILL.md`. Then the release steps: `main` fast-forwarded to this
stage's commit and pushed, and `node scripts/install.mjs --harness all`
run from the main checkout; the status document carries their outputs.

## 10. Cost of this acceptance

Projected 6.33 USD at T 20 (`docs/dispatch/2026-11-10-f7.json`); the
handoff gave about 8 as the adverse case. The measured figure is in the
ledger's F7 row, priced from the transcript just before the stage's
commit: about 9 USD on about 50 calls, a little over the adverse case.
T was the input that was wrong, as on the earlier acceptance stages:
about 50 calls against 20, at about 2,000 output tokens a call against
the 3,000 assumed. The session began on Sonnet and was switched to Fable
at 44,000 tokens of context, so that switch cost under half a dollar,
where the S6 session's cost 2.06 at 217,000.
