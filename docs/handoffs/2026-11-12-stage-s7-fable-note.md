---
stage: "Stage S7: the model note for claude-fable-5-2, the two sentences in SKILL.md, the gate check, the installer, scenario 25"
model: claude-sonnet-5-5
effort: high
status: done
created: 2026-11-12
from: "Stage F9 session local_49ddae15 (claude-fable-5-2, high), the planning session of docs/assessment-2026-11-12.md"
---

# Stage S7: the model note for claude-fable-5-2

## Goal
Done when all of these hold on a branch of your own worktree:
1. `models/claude-fable-5-2.md` holds the text of appendix A of `docs/assessment-2026-11-12.md`.
2. `SKILL.md` has the two insertions of appendix B and no other change.
3. `templates/decision-record.md` and `docs/operator-protocol.md` section 2 have the changes of appendix C.
4. `scripts/check.mjs` has a `checkModels` function, and `scripts/check.test.mjs` has three tests that seed faults.
5. `scripts/install.mjs` ships `models/`, and `scripts/install.test.mjs` checks it.
6. `eval/scenarios/25-*.json` exists, the evaluation sandbox carries `models/`, and `checkEval` is green.
7. `node scripts/check.mjs` exits 0 and `npm test` passes. Quote both counts.
8. The F10 handoff, the ledger row, `docs/status.md`, a changelog line and the F10 card exist (see "Then").

Not in this stage: a push, a merge into `main`, an install into user folders, a tag. No change to the formula, the calculator, the matrix, the guardrails or any other sentence of `SKILL.md`.

## Decisions already made
- The design is `docs/assessment-2026-11-12.md` sections 5 and 8. Do not reopen it.
- D17 (assessment section 10): read the operator's answer in `docs/status.md` under "Decisions waiting". With A or C, copy appendix A as it is. With B, use the two replacement sentences below appendix A. With no answer, use C.
- No formula change, so no new worked example (`AGENTS.md` rule 8 does not apply).
- `checkModels`, for each `models/*.md`: (a) the file name is the front matter's `model` plus `.md`; (b) `model` is a model id in the newest price table; (c) `fetched` is a valid date, not after today; (d) `sources` has one or more `https://` addresses; (e) `effort_start` is one of low, medium, high, xhigh, max; (f) `effort_switch` is one of miss, kept, unmeasured; (g) the headings `## 1. Effort` and `## 2. Inputs for step 1.2` are present; (h) the file is 5,000 characters or less. Each finding names the file, the bad value and the fix.
- The three seeded faults: an unknown model id; `effort_start: ultra`; a file of more than 5,000 characters. Seed them in a temporary copy of the tree, never in the working tree.
- Scenario 25 is scenario 09 with these changes: current and target `claude-fable-5-2`, the table `pricing/2026-11-10.json`, formula 2026-11-11, and the fields that formula needs (follow scenario 24). Its expected effort is `high`. Take every expected figure from `node scripts/dispatch.mjs`. If the scorer cannot compare the effort, stop and escalate.
- The other 24 scenarios do not change. None names `claude-fable-5-2`.

## Files and links that matter
- `docs/assessment-2026-11-12.md`: appendix A (the note), B (the two sentences), C (template and protocol), section 8.2 (the fixed design of F10).
- `SKILL.md`: the list "Files this skill uses" (lines 9 to 28) and step 1.4 (items 1 to 5, then "Never pick a model by name from memory").
- `scripts/check.mjs`: `checkPricing` (L84) and `checkSkill` (L372) show the pattern; `scripts/price-table.mjs` has `newestTableFile` and `validDate`.
- `scripts/install.mjs` L32: `PAYLOAD_ITEMS`. `docs/installing.md` line 20 and `README.md` "Layout" list the payload.
- `eval/scenarios/09-accept-fable-work.json`, `eval/scenarios/24-cache-lifetime-break-even.json`, `eval/run.mjs` (`prepare`), `eval/README.md`.
- `docs/dispatch/calibration.md`: the ledger. The F9, F7 and F8 rows are the sources of the note's table.

## Verified facts
- Gate on `main` at the F9 commits: `check: 132 files read, 0 finding(s)`, exit 0; `npm test`: 120 tests, 120 pass (2026-11-12).
- `grep -l "fable-5-2" eval/scenarios/*` gives 0 files (2026-11-12).
- The table in force has `claude-fable-5-2`: output 40, cache_write_1h 16, cache_read 0.20 USD per million (`pricing/2026-11-10.json`).
- The probe (assessment sections 5.4 and 8.1): `kept`. Transcript `e932f360`, 2026-11-12: the call after the change from `high` to `low` read 125,223 tokens from the cache and wrote 263. Appendix A already holds `effort_switch: kept`.
- D17: C, decided by the operator on 2026-11-12 ("Go with C"). Copy appendix A as it is.

## Work completed
- Stage S7 done on 2026-11-12 by the S7 session: `node scripts/check.mjs` exits 0, 136 files read, 0 findings; `npm test` 125 tests, 125 pass, 0 fail (396 s). Commits `e996819`, `bc61ce4`, `9e84f65`, `b93a809`, then the closing commit. Measured: 48 calls, 2.48 USD (ledger row S7). Next: `docs/handoffs/2026-11-12-then-stage-f10-acceptance.md`.
- `docs/assessment-2026-11-12.md`, `docs/dispatch/2026-11-12-fable-note.json`, this handoff, the F9 ledger row and the status update: the F9 commit on `main`.

## Unresolved questions
- The tag for the release: the operator, after F10.

## Exact next action
Read your own configuration with the session tool (`self`). Stop if the model is not `claude-sonnet-5-5` or the effort is not `high`. Then read appendix A of the assessment and create `models/claude-fable-5-2.md`.

## Then
1. Commit: one logical change in each commit, gate green before each.
2. Write `docs/handoffs/2026-11-12-then-stage-f10-acceptance.md` (model `claude-fable-5-2`, effort `xhigh`) from the template in `docs/handoffs/README.md`. Its design is assessment section 8.2, word for word in meaning. Add your list of claims, each with its check, and your commits.
3. Price your transcript with `node scripts/session-cost.mjs` and add the S7 row to the ledger. Update `docs/status.md` in short active sentences. Add the changelog line to `README.md`.
4. Propose F10 as a card that names `claude-fable-5-2` and `xhigh`. You cannot start a session yourself.
5. End your report with the model, the effort and the kickoff prompt for F10.

If you are blocked, write the five lines of the persona's section 3.4 and stop.

## Cost projection
`node scripts/dispatch.mjs --json docs/dispatch/2026-11-12-fable-note.json --today 2026-11-12`, API list price, table 2026-11-10.

| Piece | Projected USD | T projected | Calls measured | Measured USD | Source |
|---|---|---|---|---|---|
| S7 (this stage) | 4.91 (3.8 to 6.0 at T 60 to 100) | 80 | pending | pending | `node scripts/session-cost.mjs <transcript>` |
| F10 acceptance | 12.55 | 50 | pending | pending | the same |
| F10 arm at `xhigh` (sub-agent) | 5.52 at the 5-minute write | 30 | pending | pending | the same |
| F10 arm at `high` (sub-agent) | 4.97 at the 5-minute write | 30 | pending | pending | the same |

## Time projection
S7: 45 to 60 minutes. F10: 60 to 90 minutes. Operator: about 10 minutes for D17 and 15 minutes for F10's report.

## Session dispatch decision

Date: 2026-11-12. Decided by: claude-fable-5-2, effort high, in the Claude Code desktop app.
Price table: `pricing/2026-11-10.json` (age 2 days).

### Inputs

| Input | Value | Source (measured or estimated, and how) |
|---|---|---|
| Formula | 2026-11-11 | `SKILL.md` step 2 |
| Current model | claude-fable-5-2 | measured: `get_session self` |
| Target model | claude-sonnet-5-5 | matrix row 2, then the table's sonnet model |
| Window W | 1,000,000 | measured: `get_usage self` |
| Compaction point K | 970,000 | measured: 97 percent of W |
| Current context C0 | 349,474 | measured: `session-cost.mjs`, transcript 928b13c6, call 12 |
| Compacted already | no | |
| Cache lifetime ttl | 1h | measured: 300,537 of 300,537 write tokens |
| Unrecorded context | none | the design is in the assessment |
| Expected turns T | 80 (60 to 100) | estimate: ledger rows S6 72 calls, O6a 41, O6b 48 |
| Fresh input per turn F | 3,000 | the default |
| Output per turn O | 1,000 | estimate at effort high: Sonnet rows 623, 970, 1,138 |
| Fresh baseline B | 65,242 | measured: 224,284 total less 159,042 Messages |
| Re-read set R | 64,000 | estimate, characters / 4: persona 12,630; SKILL.md 9,700; check.mjs 9,545; protocol 8,144; install.mjs 5,223; assessment parts 4,000; handoff 3,000; install test 2,853; check test 2,589; status head 2,000; templates 1,800; README part 1,500; profiles 1,000 |
| Handoff size H | 3,000 | estimate |
| Cache misses M | 0 | unmeasured; no review pause in the stage |
| Rediscovery turns L | 0 | the list is empty |
| Acceptance turns Ta, re-read Ra | not used | the target is below opus |
| Coordinating turns To | 0 | this session starts S7 and ends; the operator starts F10 from a card |
| Coordinator | the operator | a child session cannot start sessions |
| Task type | row 2 (S7); row 4 (F10) | |
| Design-heavy | no | the design is fixed |
| Irreversible or outward-facing steps | S7 none; F10 pushes `main` | `approvals.push_origin` |

### Step A: continue or hand off

```
G       = F + O                   = 4,000
C_end   = C0 + T * G              = 669,474
crosses = C_end > K               = false   (K 970,000)
C_cont  = C0 + T * G / 2          = 509,474
C_fresh = B + R + T * G / 2       = 289,242

cost_continue on claude-fable-5-2
  T*C_cont*p_cr = 8.152   T*G*p_cw = 5.120   T*O*p_out = 3.200   misses 0   compaction 0
  = 16.47 USD
cost_fresh on claude-sonnet-5-5
  H*p_out = 0.120 (at claude-fable-5-2)   (B+R)*p_cw = 0.517   T*C_fresh*p_cr = 2.314
  T*G*p_cw = 1.280   T*O*p_out = 0.800   misses 0   loss 0   cost_coord 0.000 (To 0)
  = 5.03 USD
T* = n/a: the model changes
cost_split = not computed: the target is below opus
```

Prices used (per million): claude-fable-5-2 cache_read 0.20, cache_write_1h 16.00, output 40.00; claude-sonnet-5-5 cache_read 0.10, cache_write_1h 4.00, output 10.00.

Draft verdict: fresh, by cost, margin 11.44 USD (227.4 percent of the smaller).

### Step B: model, effort and concurrency

| Piece | Class | Model id (from table) | Effort | Oracle | Serial or parallel | Cost |
|---|---|---|---|---|---|---|
| S7 | sonnet | claude-sonnet-5-5 | high | `node scripts/check.mjs` exit 0; `npm test` | serial, first | 4.91 |
| F10 acceptance | fable | claude-fable-5-2 | xhigh | thresholds P1 to P4 of assessment section 8.2 | serial, after S7 | 12.55 |
| F10 arm at xhigh | fable | claude-fable-5-2 | xhigh | seeded faults found, of 6 | parallel, inside F10 | 6.97 (5.52 at 5m) |
| F10 arm at high | fable | claude-fable-5-2 | high | the same | parallel, inside F10 | 6.35 (4.97 at 5m) |

Coordination: the operator, To 0 per piece, cost_coord 0.00 USD; the plan's total, pieces plus cost_coord: 30.79 USD at the 1-hour write. The two arms are sub-agents and write 5-minute entries: 27.95 USD with their 5-minute figures.

Serial chain and its wall clock: S7 then F10, 105 to 150 minutes. Operator review time: about 25 minutes.

Effort raised or lowered because: S7 is raised from medium to high: it changes `SKILL.md` and the installed payload, which are public interfaces (matrix row 2). F10 is at xhigh: the author of the design is the top class (matrix row 4).

Split (step 2.1): not an option: the target is below opus.

### Guardrails checked

1. Under 10 turns: no, T = 80.
2. Design-heavy across a compaction: no; not design-heavy, and `crosses` is false.
3. Irreversible steps and their approval step: S7 has none. F10 (fable) pushes `main` under `approvals.push_origin`, named in its brief.
4. Model chosen from the table, not memory: yes, the sonnet and fable rows of `pricing/2026-11-10.json`.
5. Each needed family's age from its fetched date, and nulls: anthropic 2 days of 14; no null.
6. Acceptance at matrix row 4's class and effort: F10, fable at xhigh, a fresh session.
7. Decision budget: the record is about 3,100 tokens against 4,000; about 10 minutes against 10 (self-estimate).
8. Class and effort match the harness: this session is claude-fable-5-2 at high (`get_session self`).

### Adversarial pass

The opposite verdict, argued: this session holds the whole design in a warm cache. A fresh Sonnet session must read 64,000 tokens and can misread the appendices. One session would also remove the handoff. But the design is on disk, the work is row 2 work with the gate as its oracle, and each turn here reads 509,474 tokens at the top class's output price.

Each input, the way it could be wrong:

- C0: measured. At 30 percent less (244,632), continue is 14.79 USD.
- T: the ledger's Sonnet stages ran 41 to 72 calls. At T 160, continue is 39.21 and fresh 11.98 USD.
- F and O (and the effort O assumes): O 1,000 at high is above two of three Sonnet rows. A larger O costs four times more on the continue side.
- B and R: R can be double if S7 reads all of `docs/status.md` and the evaluation files. At R 128,000, fresh is 5.80 USD.
- M (review pauses): none expected. One miss costs more on the larger context, so it favours fresh.
- Task type: S7 has one judgement, scenario 25's fields. The handoff tells it to follow scenario 24 and to escalate.
- Prices: 2 days old; no long-context tier for these two models.
- Unrecorded context: none found.

Recomputed with the adverse value that moves the result most (R 128,000):

```
cost_continue = 16.47
cost_fresh    = 5.80
```

Verdict holds: yes. No adverse value comes near the 10 percent line.

### Final verdict

fresh, model claude-sonnet-5-5, effort high, pieces 4 (S7, then F10 with its two arms in parallel). Exact next action: the operator answers D17; this session runs the probe and starts S7.

### Cost of deciding

| Row | Value | Source (measured, naming the harness report, or self-estimate) |
|---|---|---|
| Context at start | 349,474 | measured: `session-cost.mjs`, call 12 |
| Context at end | about 360,000 | self-estimate: the later `get_usage` figure of 408,592 includes the assessment |
| Input tokens read | about 8,000 | self-estimate: a past input file, the calculator's output five times, file sizes |
| Output tokens | about 3,800 | self-estimate: the input file and this record, characters / 4 |
| Wall clock | about 10 minutes | self-estimate |
| Priced | 0.28 USD | 8,000 at 16 plus 3,800 at 40 USD per million, table `pricing/2026-11-10.json`; self-estimate |
