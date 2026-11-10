---
stage: "Stage S6: the transcript pricer, the Measured column, the calibration ledger, sample sizes on the defaults"
model: claude-sonnet-5-5
effort: medium
status: ready
created: 2026-11-10
from: "Stage O5 session local_810f83cf (claude-opus-5-5, high), branch claude/stoic-varahamihira-e520ec"
---

# Stage S6: the calibration loop

## Goal
The skill gets a path from a measured cost back to its defaults (`docs/assessment-2026-11-02.md` section 3.3). Done when: `scripts/session-cost.mjs` prices a Claude Code transcript with the table in force and has tests against a synthetic fixture; `templates/handoff.md` and `docs/handoffs/README.md` carry a Measured column in the cost projection; `docs/dispatch/calibration.md` exists with the Tsunami stage's five rows, the O5 row and the O1 and F1 rows where their transcripts exist; every default in `SKILL.md` step 1.2 states its sample size; `node scripts/check.mjs` exits 0 (or 2 on the stale table and nothing else) with its counts quoted; `node --test "scripts/*.test.mjs"` passes with its count quoted; a changelog line in `README.md`; `docs/status.md` current; the branch pushed; the F7 handoff written and its session proposed as a card naming the model.

## Decisions already made
- D12 option A', the operator on 2026-11-10. Do not reopen the term; O5 settled it (formula 2026-11-10, `cost_coord`).
- `session-cost.mjs` is a port of Tsunami's `scripts/session_cost.py` (read-only at `D:\Code\Claude\Tsunami\scripts\session_cost.py`, 3,703 bytes): usage per assistant message, counted once per message id; priced with `pricing/<newest>.json` or `--table`; standard library; paths by `path.join` and `os.homedir()`. Input: a transcript path, or a session id looked up under `~/.claude/projects/`. Output: calls, context at the last call, cache-read, cache-write and output tokens, cost per model and in total, and the per-call averages the defaults name (cache-write per call as growth, output per call); `--json` too. Sub-agent transcripts, where the harness writes them beside the session's file, are priced and listed separately.
- The ledger moves no default. S6 adds sample sizes in the form "default 3,000 (n = 1, fork_graft 2026-10-11)" and changes no figure: a value change is a formula stage with its own example (AGENTS.md rule 8).
- The ledger has one row per piece and per coordinator: stage, piece, class, effort, T projected and calls measured, per-call cache-write and output, cost projected and measured, source.
- A gate check of the ledger's header row is in scope only if it costs under 30 lines with its test.
- Not in this stage: `pricing/`, `scripts/check-pricing.mjs`, `scripts/pricing-new.mjs`, `scripts/install*.mjs`, step 1.4 of `SKILL.md` (D13); `eval/score.mjs`, `eval/rubric.md`, `eval/subject-prompt.md`, the scenarios; `dispatch-core.mjs`'s arithmetic. No merge into `main`.
- You close your own stage: status, changelog, push, the F7 handoff, the F7 card. F7 is a higher class than S6, so its card names the model and the operator picks it.

## Files and links that matter
- `docs/assessment-2026-11-02.md` sections 1 (the measured figures) and 3.3 (the scope).
- `SKILL.md` step 1.2 (the inputs table; O5 added To, Fo and Oo); `templates/handoff.md`; `docs/handoffs/README.md`.
- `examples/2026-11-02-tsunami-rebalancing-dashboard.md`: the projected and measured table; the ledger's Tsunami rows come from it and from Tsunami's `docs/decisions/DECISION_LOG.md` row D-112 item 4 (read-only).
- This session's transcript, for the O5 row: `C:\Users\Bob\.claude\projects\D--Code-Claude-SessionDispatch--claude-worktrees-stoic-varahamihira-e520ec\69a179e5-bca5-4419-a5c6-ba97809dbad9.jsonl` (and its folder beside it). O5 was projected at 10.06 to 16.34 USD (T 60 to 90) in `docs/handoffs/2026-11-10-stage-o5-coordinator-term.md`.
- O1 and F1 (2026-10-29): 18 transcripts under `C:\Users\Bob\.claude\projects\D--Code-Claude-SessionDispatch\`; identify them by date and first message.
- `scripts/fixtures/helpers.mjs` (temp trees, `run`); `scripts/check.mjs` (`walkMd` lints every Markdown file).

## Verified facts
- `get_session self`, 2026-11-10: the O5 session was `claude-opus-5-5` at `high` in its own worktree.
- `node scripts/check.mjs` after `main` was merged into the O5 branch: 116 files read, 0 findings, exit 0. `node --test "scripts/*.test.mjs"`: 60 pass, 0 fail (133 s). 2026-11-10.
- `--formula 2026-10-29` prints 20.01, 9.49 and 7.23 USD for the Stage O1 example's inputs; scenarios 01 to 21 are byte-identical to `2b160e0` (`git diff --quiet`).
- D13 was decided A on 2026-11-10: the pricing work is on `main` as `1ae8c0d`, merged into the O5 branch. The table in force is now `pricing/2026-11-10.json` (age 0 days of `max_age_days` 8, so the gate exits 2 from 2026-11-19, an expected state); it lists `claude-fable-5-2` and no `claude-fable-5-1`. The O5 example, scenarios 22 and 23 and the core tests pin `pricing/2026-10-29.json`; nothing in O5 reads a `claude-fable-5-1` row from the newest table.
- `git push -u origin claude/stoic-varahamihira-e520ec` created the branch on `origin`, 2026-11-10.

## Work completed
- `2185a2b` the term in the core, the calculator, the gate and the template; `8c1ce01` `SKILL.md` and the Tsunami example; `6eb7efd` scenarios 22 and 23; `d44668f` changelog and status. This commit: this handoff, `docs/dispatch/2026-11-10-s6.json`, the O5 handoff marked done.

## Unresolved questions
- F7: the merge of the O5 and S6 branches into `main`, and the acceptance of the pricing work of `1ae8c0d` (D13's three points in `docs/status.md`).
- F7: `eval/score.mjs` recomputes measure 3 under formula 2026-10-29 and reads no To, so on scenarios 22 and 23 it marks a correct record's coordinator figures wrong (`scripts/eval-score.test.mjs` pins exactly those). The scorer must learn To, the coordinator and the scenario's formula before the next required rerun. That changes the evaluation contract; F7 rules it.
- F7: a tag push is outside `approvals.push_origin` and needs the operator's yes in the session that pushes.

## Exact next action
Confirm `get_session self` reports `claude-sonnet-5-5` at `medium` and a worktree cut from `claude/stoic-varahamihira-e520ec` (stop and name the mismatch otherwise). Run `node scripts/check.mjs` and quote the counts. Then read Tsunami's `session_cost.py` and write the failing test for `scripts/session-cost.mjs` against a synthetic three-message JSONL fixture under `scripts/fixtures/`.

## Cost projection
Table `pricing/2026-11-10.json` (age 0 days of 8; its sonnet and opus rows equal those of 2026-10-29). Sonnet 5.5 at medium, B 63,149 (measured today), R 60,000, F 3,000, O 1,500: 2.21 USD at T 40, 3.43 at T 60, by the calculator's Step B table; the handoff 0.070 at Opus. After it, F7: 6.25 USD (the table's fable row, `claude-fable-5-2`, xhigh, T 20, R 75,000, F 5,000, O 3,000). S6 plus F7: 8.46 to 9.68 USD. Estimates: every T; R by characters. O5 itself: about 8 USD by a self-estimate (about 75 calls from 63,149 to 363,540 tokens); S6's pricer measures it.

## Time projection
S6 20 to 40 minutes of wall clock; operator review about 15 minutes (the ledger and the step 1.2 wording). F7 20 to 30 minutes after it; review about 30 minutes.

## Session dispatch decision
Date: 2026-11-10. Decided by: claude-opus-5-5, effort high, in Claude Code (desktop app). Price table: `pricing/2026-11-10.json` (age 0 days; Step A gives the same figures on `pricing/2026-10-29.json`). Formula 2026-11-10.

### Inputs
W 1,000,000 and K 970,000 (measured, usage tool, 97 percent); C0 363,540 (measured); compacted no; unrecorded context none (this file and the assessment carry it); T 40 to 60 (estimate); F 3,000 and O 1,500 (step 1.2 defaults: a script with a stated test is row 2 work); B 63,149 (measured: total less Messages 300,391); R 60,000 (itemised in `docs/dispatch/2026-11-10-s6.json`); H 3,500 (this file, characters divided by 4); M 0 (default); L 0; To 0, the operator starts S6 from a card and this session ends; task type: a scoped script with its test, a template column, a ledger (matrix row 2); design-heavy no; outward: the branch push under the standing yes.

### Step A: continue or hand off
From `node scripts/dispatch.mjs --json docs/dispatch/2026-11-10-s6.json --today 2026-11-10`:
```
G 4,500; C_end 543,540; crosses false (K 970,000); C_cont 453,540; C_fresh 213,149
cost_continue on claude-opus-5-5 = 3.628 + 0.900 + 1.200 + 0.000 + 0.000 = 5.73 USD
cost_fresh on claude-sonnet-5-5  = 0.070 + 0.308 + 0.853 + 0.450 + 0.600 + 0.000 + 0.000 + 0.000 (cost_coord, To 0) = 2.28 USD
T* = n/a: the model changes
```
Draft verdict: fresh, by cost, margin 3.45 USD (151.2 percent of the smaller).

### Step B: model, effort and concurrency
| Piece | Class | Model id | Effort | Oracle | Serial or parallel | Cost |
|---|---|---|---|---|---|---|
| S6 | sonnet | claude-sonnet-5-5 | medium | the gate, the tests, the pricer's O5 and Tsunami rows against the measured figures in the example | first | 2.21 to 3.43 USD |
| F7 | fable | claude-fable-5-2 (the table's fable row; the operator picks it) | xhigh | an acceptance note, each claim with its command | after S6 | 6.25 USD |

Coordination: the operator, To 0; each finishing session writes the next handoff and proposes the next card. Serial: S6 edits `SKILL.md` step 1.2, which O5 also edited, so it runs from O5's branch.

### Guardrails checked
1 no, T 40. 2 not design-heavy; no compaction. 3 the branch push, under the standing yes; the tag waits for the operator in F7. 4 sonnet and fable from the table's rows. 5 table 0 days old, rows complete. 6 F7 at Fable xhigh, fresh. 7 the record about 900 tokens; about 5 minutes. 8 this session read its own model and effort.

### Adversarial pass
The opposite verdict, argued: this session holds the measured figures and the term, and the pricer is a short port. Inputs: T could be 60 (3.50 USD fresh against 9.13 continue); R could be 80,000 if S6 reads `check.mjs` and the example whole, which adds about 0.05 USD; this session staying to coordinate S6 at To 30 adds 5.44 USD and flips the draft to continue by 34.8 percent, which is why the plan is To 0. Verdict holds: yes.

### Final verdict
Fresh, model claude-sonnet-5-5, effort medium, one piece, then F7. Exact next action: the operator starts S6 from the card, in its own worktree cut from `claude/stoic-varahamihira-e520ec`.

### Cost of deciding
| Row | Value | Source |
|---|---|---|
| Context at start | 363,540 | measured, usage tool |
| Context at end | about 372,000 | self-estimate |
| Input tokens read | about 4,000 | self-estimate: three calculator outputs, the template |
| Output tokens | about 4,500 | self-estimate: this file, characters divided by 4 |
| Wall clock | about 8 minutes | self-estimate |
| Priced | 4,000 x 5e-6 + 4,500 x 20e-6 = 0.11 USD | table `pricing/2026-11-10.json`, opus row (equal to 2026-10-29); self-estimate |
