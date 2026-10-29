---
stage: "Stage O1: formula revision, dispatch calculator, gate recompute, new worked example"
model: claude-opus-5-5
effort: high
status: ready
created: 2026-10-29
from: "Session local_af23607d (Fable 5.1, xhigh): Stage 0b, first assessment and protocol revision"
---

# Stage O1: formula revision, calculator, recompute, example

## Goal
`SKILL.md` step 2 prices `continue` at the current session's model and `fresh` at the target class,
grows context by F + O, carries a cache-miss term with M stated, gives the break-even line, and names
the split pattern (top class writes the brief, Sonnet runs it, Opus accepts). `scripts/dispatch.mjs`
(standard library, Node 20) takes the step 1 inputs as flags or a JSON file and prints the filled
Step A and Step B blocks with per-turn long-context accounting. `scripts/check.mjs` recomputes every
example's figures from its inputs table and fails on a mismatch. A new worked example records this
session's measured decision (below) under the new formula. Done when `node scripts/check.mjs` exits 0
(or 2 with only the stale-table line after 2026-11-02), the calculator reproduces the two existing
records under an old-formula switch (10.10 and 9.74 USD; 4.22 and 1.19 USD), the template matches,
and `README.md` has its changelog line.

## Decisions already made
- Opus, high, fresh session: dispatch record below. Protocol section 2 puts changes to the procedure's arithmetic at Opus; the class change forces a fresh session (guardrail 8).
- Acceptance of this stage is Fable at xhigh in a fresh session (matrix row 4, guardrail 6). Not part of this stage.
- The 10 percent band, the 10-turn floor and the 8,000-token cap stay unchanged; they are retuned only on evaluation data (Stage F2).
- The current formula stays reproducible behind a switch so the existing example's figures remain checkable; the new example uses the new formula.
- Prices stay in `pricing/`; the calculator reads the newest table and refuses stale or null exactly as step 1.4 says.
- No change to adapters, persona files or the protocol kit in this stage. Stage S1 (Sonnet, own worktree) owns `scripts/install.mjs` and `scripts/*.test.mjs`; this stage owns `SKILL.md`, `scripts/check.mjs`, `scripts/dispatch.mjs`, `templates/`, `examples/`. Both add a README changelog line; the later merge keeps both.

## Files and links that matter
- `docs/assessment-2026-10-29.md`: findings 1 to 4, 6, 12, 14, 15 (section 3.2); the economics (3.3); improvements A and B (section 5); stage detail O1 (6.1).
- `SKILL.md` steps 1.3, 2, 3.3 and 6; `templates/decision-record.md`; `examples/2026-10-27-fork-graft-stage-26.md`.
- `scripts/check.mjs` (`checkExamples`, `RECORD_HEADINGS`, `COST_ROWS`); `pricing/2026-10-18.json`.
- `docs/handoffs/2026-10-27-stage-0-bootstrap.md` Step A (4.22 and 1.19 USD) for the reproduction check.
- `docs/operator-protocol.md` sections 2, 5, 6 and 10.

## Verified facts
- Gate after Stage 0b: `node scripts/check.mjs`, 51 files read, 0 findings, exit 0 (2026-10-29, Node 26.7.0).
- Both shipped records recompute to the cent (node, 2026-10-29): example 10.10 and 9.74, adverse 9.60 and 11.39; Stage 0 handoff 4.22 and 1.19.
- Baseline B in this app 86,450 tokens, window 1,000,000, compaction at 97 percent (`get_usage self`, 2026-10-29).
- `start_session` accepts `model` and `effort` at or below the parent's (tool schema, 2026-10-29).
- Break-even in the worked example T* = 72.2 turns (assessment section 2.2).
- Table age 11 days on 2026-10-29; the gate exits 2 from 2026-11-02 UTC.

## Work completed
- `9e821b7`, `6ff89f1`: Stage 0 (2026-10-27).
- Stage 0b (this session): `docs/assessment-2026-10-29.md`; protocol sections 1.2, 1.3, 5, 9, 10 revised and a Haiku note in 2; `AGENTS.md` rules 3, 9, 10, 11; `docs/status.md`; `docs/operator-preferences.json`; the hook announces status and unanswered questions; the gate checks both; README changelog; `.gitignore` for the graft cache. Commit hash on the last line of this file.

## Unresolved questions
- Operator: decisions D1 to D4 in the assessment (autonomy, ASD-STE100, price refresh method, stage order). This handoff assumes D4 option A.
- Operator: price refresh (Stage H0) before 2026-11-02, or accept gate exit 2 during this stage.
- Stage O1: the cache-miss rate M has no measurement; take M as an input with default 0 and say so in the text.
- Stage O1: do not add fields to the skill's front matter; whether every harness tolerates extra keys is untested.

## Exact next action
Read this file, confirm `get_session self` reports `claude-opus-5-5` at `high` (stop and name the mismatch otherwise), then open `docs/assessment-2026-10-29.md` section 6.1 "O1" and begin with the Step 2 text fix in `SKILL.md`.

## Cost projection
Opus 5.5, high, 60 turns, B 86,450, R 20,000, F 3,000, O 3,000, growth F + O: first read 106,450 x 5.00e-6 = 0.53; reads over 60 turns averaging 286,450 x 0.20e-6 = 3.40; fresh 60 x 3,000 x 5.00e-6 = 0.90; output 60 x 3,000 x 20e-6 = 3.60. About 8.43 USD; quote 7 to 12. No cache-miss term (finding 2), so a floor.

## Time projection
45 to 75 minutes wall clock (protocol section 7, Opus); operator review about 30 minutes (the formula text and the example). Fable acceptance (Stage F1) 20 to 30 minutes more, separately.

## Session dispatch decision
Date: 2026-10-29. Decided by: claude-fable-5-1, xhigh, Claude Code desktop. Table `pricing/2026-10-18.json` (11 days).

### Inputs
W 1,000,000 and K 970,000 (measured, usage tool); C0 254,081 (measured after the assessment was written); compacted no; unrecorded context none (findings, derivations and arithmetic are in the assessment); T 60 (estimate); F 3,000 and O 3,000 (writing-heavy row of step 1.2); B 86,450 (measured); R 20,000 (assessment 7k, SKILL.md 4.7k, check.mjs 2.8k, example 2.3k, template 0.7k, this file 2.5k; characters divided by 4); H 2,500; task type: changes to the procedure's arithmetic plus a script and an example (Opus row of the matrix and of protocol section 2); design-heavy yes; outward-facing none (commits only; a push needs the operator's yes).

### Step A: continue or hand off
Growth F only, as the current step 1.3 says. Continue on Fable: C_end 434,081 < K, no compaction; C_cont 344,081; reads 60 x 344,081 x 0.25e-6 = 5.16; fresh 60 x 3,000 x 12.5e-6 = 2.25; output 60 x 3,000 x 50e-6 = 9.00: 16.41 USD. Fresh on Opus: handoff 2,500 x 50e-6 = 0.125; first read 106,450 x 5e-6 = 0.532; C_fresh 196,450; reads 60 x 196,450 x 0.2e-6 = 2.357; fresh 60 x 3,000 x 5e-6 = 0.90; output 60 x 3,000 x 20e-6 = 3.60; loss 0: 7.51 USD.
Draft verdict: fresh, by cost, margin 8.90 USD (118 percent of the smaller). Guardrail 8 forces it in any case: the class changes.

### Step B: model, effort and concurrency
One piece, Opus, `claude-opus-5-5`, high, oracle `node scripts/check.mjs` exit 0 with the recompute check plus the two reproduction figures; serial within the stage. Stage S1 (Sonnet, medium, own worktree) may run beside it: disjoint files, both add a changelog line. Effort unchanged: no irreversible step, no credentials, not a merge or release.

### Guardrails checked
1 no (T 60). 2 design-heavy, but no compaction has happened or is projected, so not triggered; fresh anyway. 3 none outward. 4 model from the table's opus row. 5 table 11 days, Opus row complete. 6 acceptance by Fable at xhigh in a fresh session (author Opus). 7 within budget (table below). 8 the new session checks its front matter.

### Adversarial pass
For continuing: this session holds the derivations behind every finding and would write the calculator and the example faster than an Opus session reading them cold; at 16 USD the stage is small in money; xhigh is the effort the operator chose for quality on this project today. Inputs: C0 measured, but reasoning tokens inflate it and the next turns would add more (favours fresh further); T could reach 90 if the recompute check needs iteration; task type could be argued up to Fable because step 2 is the heart of the skill, but protocol section 2 puts arithmetic changes at Opus and reserves Fable for acceptance, which Stage F1 provides; prices 11 days old, no long-context tier on Opus or Fable; R could be 35,000 if the Opus session reads the protocol in full. Recomputed with T 90 and R 35,000: continue 25.63 USD, fresh 12.10 USD.
Verdict holds: yes.

### Final verdict
Fresh session, `claude-opus-5-5`, high, one piece, serial, with Fable xhigh acceptance after it. Exact next action: the operator starts the proposed session (or answers D1 and later sessions start themselves); it reads this file first.

### Cost of deciding
| Row | Value | Source |
|---|---|---|
| Context at start | 254,081 | usage tool, read before this section was written |
| Context at end | about 258,500 | estimate: this file's output plus one tool result |
| Input tokens read | about 1,000 | the arithmetic check's output; everything else was already in context |
| Output tokens | about 3,600 | this file, characters divided by 4; estimate |
| Wall clock | about 7 minutes | session timestamps, 10:35 to 10:42 UTC |
| Priced | 1,000 x 12.5e-6 + 3,600 x 50e-6 = 0.19 USD | table `pricing/2026-10-18.json`, fable row |

Whole Stage 0b session, for the record: context 86,450 to about 258,500 over about 34 turns; cache reads about 5.9M tokens x 0.25e-6 = 1.47; cache writes about 172k x 12.5e-6 = 2.15; output between 25k and 100k tokens x 50e-6 = 1.25 to 5.00 (the usage tool does not say whether reasoning tokens are in its Messages category): 4.9 to 8.6 USD, estimate. Wall clock 10:02 to about 10:45 UTC.

Stage 0b commit: `876e493` (this line added by the follow-up docs commit).
