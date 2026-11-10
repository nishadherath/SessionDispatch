---
stage: "Stage F7: acceptance of O5, S6 and the pricing work of 1ae8c0d; merge into main; install; tag v1.1.0; ruling on the scorer gap"
model: claude-fable-5-2
effort: xhigh
status: ready
created: 2026-11-10
from: "Stage S6 session local_64c9f68d (claude-sonnet-5-5, medium), branch claude/strange-thompson-08340e"
---

# Stage F7: acceptance and release of v1.1.0

## Goal
Done when: each of O5 (formula 2026-11-10, `cost_coord`), S6 (the pricer, the Measured column, the ledger, the sample sizes) and the D13 pricing work (`1ae8c0d`) has an acceptance note in `docs/acceptance-2026-11-10-f7.md`, every claim with the command that checked it; the two branches are merged into `main`; `node scripts/install.mjs --harness all` has run and `--check` reports 0 files behind; the tag v1.1.0 is pushed with the operator's yes; the scorer gap below has a ruling; `node scripts/check.mjs` and `node --test "scripts/*.test.mjs"` are green with counts quoted; status and changelog are current; the push is named in the report.

## Decisions already made
- D12 option A' (2026-11-10): three stages in series, each started by the operator. O5 and S6 are done; F7 is last.
- D13 option A (2026-11-10): the pricing work is on `main` as `1ae8c0d`, unaccepted until this stage. Its three points are in `docs/status.md`.
- S6 moved no default: `SKILL.md` step 1.2 gained sample sizes only. A default moves only on `docs/dispatch/calibration.md` in a formula stage with its own example (`AGENTS.md` rule 8).
- A tag push is outside `approvals.push_origin`; ask the operator in this session before pushing it.
- The branches are not merged. S6's branch `claude/strange-thompson-08340e` already contains O5's (`claude/stoic-varahamihira-e520ec` at `1594a3e`, fast-forwarded in), so one merge of S6's branch into `main` carries both. `main` is an ancestor of O5's branch (it was merged in).

## Files and links that matter
- `docs/handoffs/2026-11-10-stage-o5-coordinator-term.md` and `docs/handoffs/2026-11-10-stage-s6-calibration.md` (S6 marked done by this stage's author).
- S6: `scripts/session-cost.mjs`, `scripts/session-cost.test.mjs`, `scripts/fixtures/session-transcript.jsonl`, `scripts/fixtures/session-subagent.jsonl`, `docs/dispatch/calibration.md`, `checkLedger` in `scripts/check.mjs`, `SKILL.md` step 1.2, `templates/handoff.md`, `docs/handoffs/README.md`.
- O5: `scripts/dispatch-core.mjs`, `scripts/dispatch.mjs`, `examples/2026-11-02-tsunami-rebalancing-dashboard.md`, scenarios 22 and 23, `docs/assessment-2026-11-02.md`.
- D13: `pricing/2026-11-04.json`, `pricing/2026-11-10.json`, `scripts/check-pricing.mjs`, `scripts/pricing-new.mjs`.
- The scorer gap: `eval/score.mjs`, `scripts/eval-score.test.mjs`, scenarios 22 and 23.

## Verified facts
- `get_session self`, 2026-11-10: the S6 session was `claude-sonnet-5-5` at `medium`, in its own worktree.
- `node scripts/session-cost.mjs` on the O5 transcript (`69a179e5`, table 2026-11-10): 96 calls, 10.246 USD, cache write per call 3,734 (3,340 after the first), output per call 1,428. On the O1 session (`4a645017`, table 2026-10-29): 49 calls, 5.335 USD. On F1 (`99f38ac8`, same table): 24 calls, 9.966 USD. The O1 and F1 labels are inferred from commit times (`0cc7d52` 22:09, `17c9526` 22:37, UTC+11) and models; no transcript names its stage.
- Every cache write in those transcripts is a 1-hour write; the table prices one `cache_write` figure, so the measured costs are lower bounds. The pricer prints the 1-hour token count.
- Pooled over six pieces, measured over projected is 40.79 over 47.68 = 0.86; per piece 0.50 to 1.69. Eight rows of mixed class and effort: no default moves.
- Gate and test counts at S6's close are in the stage report that carries this handoff's kickoff prompt (the commit adding this file records them).
- The Tsunami coordinator's measured per-call figures come from `SKILL.md` step 1.2 (Fo, Oo); per-piece call counts for Tsunami pieces were never recorded, so those ledger cells say n/a.

## Work completed
- S6, one commit set on `claude/strange-thompson-08340e` (see `git log claude/stoic-varahamihira-e520ec..HEAD`): the pricer and its six tests; the ledger and its gate check with a mutation test; the Measured columns; the sample sizes; the README changelog line; `docs/status.md`; this handoff and `docs/dispatch/2026-11-10-f7.json`.

## Unresolved questions
- The scorer gap (F7 rules it): `eval/score.mjs` recomputes measure 3 under formula 2026-10-29 and reads no To, so on scenarios 22 and 23 it marks a correct record's coordinator figures wrong; `scripts/eval-score.test.mjs` pins exactly that. Options to put to the operator in the five-part form: (A) teach the scorer To, the coordinator and the scenario's formula before the next required rerun; (B) keep scenarios 22 and 23 out of the scored set until a rerun is required; (C) accept the mismatch and document it in the contract. Changing the scorer changes the evaluation contract, so it needs the operator's yes.
- Whether the ledger's 1-hour-write bias deserves a table field (a `cache_write_1h` figure) so the pricer can be exact. That is a pricing-table change (D13's area); raise it, do not do it here.
- Any ledger row whose class and effort cell is a guess: the O1 and F1 stage labels (see Verified facts).

## Exact next action
Confirm `get_session self` reports `claude-fable-5-2` at `xhigh` (stop and name the mismatch otherwise). Create a worktree cut from `claude/strange-thompson-08340e` or check it out here, run `node scripts/check.mjs` and `node --test "scripts/*.test.mjs"`, and quote the counts. Then start the acceptance note with O5: derive `cost_coord` by hand for the Tsunami example before reading the calculator.

## Cost projection
Table `pricing/2026-11-10.json` (age 0 days of 8). Fable 5.2 at xhigh, T 20, F 5,000, O 3,000, R 80,000, B 63,443 (measured at S6's close): 6.33 USD by `node scripts/dispatch.mjs --json docs/dispatch/2026-11-10-f7.json --today 2026-11-10`; the handoff 0.035 at Sonnet. Estimates: T, F, O (an xhigh acceptance; the ledger's F1 row measured 4,263 output per call at xhigh against the 3,000 assumed, so the adverse case is about 8 USD) and R (by characters).

| Piece | Projected USD | T projected | Calls measured | Measured USD | Source |
|---|---|---|---|---|---|
| F7 | 6.33 | 20 | pending | pending | `node scripts/session-cost.mjs <transcript>`; append the row to `docs/dispatch/calibration.md` |
| S6 | 2.21 to 3.43 | 40 to 60 | pending | pending | F7 prices S6's transcript (session `64c9f68d`) and fills its ledger row |

## Time projection
F7: 20 to 30 minutes of wall clock; operator review about 30 minutes, plus the tag decision. Estimates.

## Session dispatch decision
Date: 2026-11-10. Decided by: claude-sonnet-5-5, effort medium, in Claude Code (desktop app). Price table: `pricing/2026-11-10.json` (age 0 days). Formula 2026-11-10.

### Inputs
W 1,000,000 and K 970,000 (measured, 97 percent); C0 202,722 (measured, usage tool); compacted no; unrecorded context none (this file carries it); T 20 (estimate); F 5,000 and O 3,000 (estimates: xhigh acceptance); B 63,443 (measured: total less Messages 139,279); R 80,000 (characters divided by 4); H 3,500 (this file); M 0; L 0; To 0 (the operator starts F7 from a card); task type: adversarial acceptance and a release (matrix row 4); design-heavy no; outward: the merge, the push and the tag push (the tag needs the operator's yes).

### Step A: continue or hand off
From `node scripts/dispatch.mjs --json docs/dispatch/2026-11-10-f7.json --today 2026-11-10`: cost_continue on claude-sonnet-5-5 = 1.57 USD; cost_fresh on claude-fable-5-2 = 6.36 USD; T* n/a (the model changes). The work needs fable and this session is sonnet, so the verdict is fresh by class (guardrail: never accept row 4 work at a lower class), margin 4.80 USD.

### Step B: model, effort and concurrency
| Piece | Class | Model id | Effort | Oracle | Serial or parallel | Cost |
|---|---|---|---|---|---|---|
| F7 | fable | claude-fable-5-2 (the table's fable row; the operator picks it) | xhigh | the gate, the tests, the acceptance note's commands, `install --check` | after S6 | 6.33 USD |

### Adversarial pass
The opposite verdict, argued: this session holds the S6 context and continuing costs 1.57 USD against 6.36. Rejected by class, not cost: an acceptance of Opus and Sonnet work at Sonnet would check its own stage. Inputs: T 30 and R 100,000 move the fresh figure by about 3 USD and do not change the verdict. The verdict holds: yes.

### Final verdict
Fresh, model claude-fable-5-2, effort xhigh, one piece. Exact next action: the operator picks the model on the card and starts F7.

### Cost of deciding
| Row | Value | Source |
|---|---|---|
| Context at start | 202,722 | measured, usage tool |
| Input tokens read | about 3,000 | self-estimate: the calculator output |
| Output tokens | about 3,000 | self-estimate: this section, characters divided by 4 |
| Wall clock | about 5 minutes | self-estimate |
| Priced | 3,000 x 2e-6 + 3,000 x 10e-6 = 0.036 USD | table `pricing/2026-11-10.json`, sonnet row; self-estimate |
