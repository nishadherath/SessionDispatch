---
stage: "Stage F5: closing assessment on H3"
model: claude-fable-5-1
effort: high
status: ready
created: 2026-10-30
from: "Session local_e1d2c989 (Sonnet 5.5, medium): Stage H3, clean-harness regression"
---

# Stage F5: closing assessment on H3

## Goal
Read H3's results, rule on the two thresholds and on D10, update the class floor's figures in `SKILL.md` if they moved, and declare the project done or name what is not. Done is F4 section 3.7: (1) `SKILL.md` carries the measured class position and no verdict waits on a text change; (2) the evaluation runs by script on a clean harness and its results file on the final text is on file (it is: `eval/results-2026-11-01.md`); (3) the adapters say whether each was verified on a machine and when, and `install --check` reports 0 behind (S3, still to do, operator present); (4) `docs/status.md` lists nothing under "In progress" or "To do" and the decisions waiting are empty or recorded as declined. Write the dated assessment `docs/assessment-2026-10-30-f5.md` (or the date of the run) with the answer first.

## Decisions already made
- Thresholds, fixed in F4 section 3.6 before any run: Sonnet calculator 20 of 21 (Wilson lower bound 77.3 percent); Haiku calculator 19 of 21 (71.1 percent); below either, F5 reads the misses and says which it is.
- D10 (variant C): F4 recommended A (leave C1 unstaged). Its blast-radius line names the reopening condition: Haiku's clean-harness cell below 19 of 21. That condition now holds (13 of 21), so D10 reopens for F5 to rule on; the operator has not overruled A.
- H2 to H3 moves are not attributable to the text alone (the harness changed). Scenarios 01 to 20 are comparable cell by cell; 21 is new. Do not rescore H1 or H2.
- Nothing in H3 argues for more scenarios, more arms or a formula change (F4 section 3.7); do not stage them without a measured reason.

## Files and links that matter
- `eval/results-2026-11-01.md`: the results file; read its Notes first (thresholds, provenance, Haiku failures, measured cost). Runs under `eval/runs/2026-11-01/` (read a record only to settle a specific miss).
- `docs/assessment-2026-10-30-f4.md` sections 1.2, 1.4, 3.6, 3.7 and 4 (D10).
- `SKILL.md` class floor paragraph before step 0 (S5, `c1890f7`); `eval/README.md` "The CLI runner".
- `docs/status.md` (To do: S3, F5; Decisions waiting: D10); `docs/dispatch/2026-10-30-h3-close.json` (this handoff's dispatch record).

## Verified facts
- `node eval/run.mjs run/collect/score --date 2026-11-01` on the S5 text (`SKILL.md` SHA-256 `0bad1334f4318615f51da92fd5c2053b61669a3d60589b589c02fc86b1be0de9`), 2026-10-30: 42 of 42 runs have a `usage.json`; 41 have a `record.md` and a score.
- Sonnet calculator: 21 of 21 final agreement (84.5 to 100.0 percent). Threshold met. Draft agreement 15 of 16 (scenario 12 wrong), arithmetic 48 of 50 (scenarios 02 and 05, `cost_split`), inputs 297 of 298 (scenario 14), 2 of 21 records over the cap.
- Haiku calculator: 13 of 21 (40.9 to 79.2 percent), counting 7 unscorable and 1 no-record run as misses. Threshold not met. All 13 scorable records reached the expected outcome. Unscorable: 01 (`cost_of_deciding.input_tokens` not a number), 02, 12, 17 (`inputs.current` not a string), 05, 10, 20 (`skill_ran` not a boolean). 03 wrote no record: the subject stopped and asked for the stage figures.
- Measured subject cost, `usd_priced` summed: Sonnet 21 runs 5.8917 USD (mean 0.2806), Haiku 21 runs 0.7221 USD (mean 0.0344), total 6.6138 USD. The CLI's own Haiku cost (2.5 to 5.5 USD a run, basis unknown) is not credible.
- The scoped `Bash(node *dispatch.mjs*)` grant for the calculator arm ran without refusal.
- Gate (`node scripts/check.mjs`) and tests (`npm test`) at this commit: see the stage report that started this session and `docs/status.md`.

## Work completed
- H3: `prepare` (42 runs, one manifest), the Bash grant test, 21 Haiku runs, 20 Sonnet runs, `collect`, `score`, the results file with its Notes. Interim commit `cbd0f26`; closing commit in `git log`.
- Not done: S3 (adapter verification, operator present); the scorer header line "Skill commit: efdb2ef" does not match S5's `c1890f7` (guess: a stale ref in the scorer; not touched, `eval/score.mjs` was out of scope).

## Unresolved questions
- F5: is the Haiku miss the subject or the contract? The 8 misses are all format or no-record, never a wrong verdict, and the failure types differ from H2's; the harness also changed, so attribution is open. State a ruling and its confidence, and say what the class floor in `SKILL.md` should read (Haiku reaches the right verdict on every scorable run but writes a machine-unreadable block in 7 of 21 and no record in 1).
- F5 / operator: D10 reopened (option A recommended before; B stages C1 at about 12.31 USD of sessions plus about 84 Haiku runs; the operator's overrule is the only thing that changes A). Rule A, B or a new option, in the section 8 shape.
- F5: whether the floor's figures in `SKILL.md` change (an edit is Opus-class or above; an unmeasured edit needs a rerun, so prefer words that match the measured cells).
- Operator: S3 (adapter verification on each harness, operator present).

## Exact next action
Run `get_session self`; stop unless it reports `claude-fable-5-1` at `high`. Then read `eval/results-2026-11-01.md` (Notes and Summary), F4 sections 3.6 and 3.7, and the `SKILL.md` class floor paragraph; read at most the Haiku records for 01, 03 and 10 to settle the format reading; write `docs/assessment-2026-10-30-f5.md` and rule on D10.

## Cost projection
Fable 5.1, high: T 30, F 3,000, O 3,000, B 87,114 (measured, F4), R 25,000 (estimate): 9.71 USD fresh (`node scripts/dispatch.mjs --json docs/dispatch/2026-10-30-h3-close.json --today 2026-10-30`), cache reads 1.52, cache writes 3.65, output 4.50. The roadmap quoted 5.18 (4 to 7) at lower T and O; an estimate, range 5 to 10. No subject runs.

## Time projection
30 to 45 minutes of model time. Operator review about 20 minutes, plus S3 separately.

## Session dispatch decision
Date: 2026-10-30. Decided by: claude-sonnet-5-5, effort medium, in Claude Code (desktop app).
Price table: `pricing/2026-10-29.json` (age 1 day). Command: `node scripts/dispatch.mjs --json docs/dispatch/2026-10-30-h3-close.json --today 2026-10-30`.

### Inputs

| Input | Value | Source |
|---|---|---|
| Formula | 2026-10-29 | `SKILL.md` step 2 |
| Current, target model | claude-sonnet-5-5; claude-fable-5-1 | `get_session self`; matrix row 5 (a whole-project assessment, Fable at high), the table's fable row |
| W, K | 1,000,000; 970,000 | Usage tool, 97 percent |
| C0 | 165,868 | Measured, `get_usage self` at the close of H3 |
| T, F, O | 30; 3,000; 3,000 | Estimates (O at high) |
| B, R, H | 87,114; 25,000; 4,000 | B measured (F4's Fable baseline); R and H estimates |
| M, L | 0; 0 | Unmeasured; empty list |

### Step A and B
Calculator: G 6,000; C_end 345,868, crosses false; cost_continue 2.12 USD (Sonnet), cost_fresh 9.71 (Fable, handoff included); T* n/a, the model changes. Draft verdict fresh by class, margin 7.59 USD. Piece: F5, claude-fable-5-1, high; 9.67 USD.

### Guardrails and adversarial pass
Guardrail on class bound (the work needs Fable, this session is Sonnet); table age 1 day, no null; decision record about 600 tokens, within the cap. Opposite verdict, continuing on Sonnet: 7.59 USD cheaper, but the class guardrail binds (row 5 is Fable, and a Sonnet-written assessment of Sonnet-run evidence is self-review) and the protocol requires a handoff at a finished stage. Final verdict unchanged on a guardrail, not a preference. Effort high, as row 5 says; xhigh applies to row 4 (acceptance by the same class as the author), and the author here is Sonnet, so it does not; raise only if F5 meets a raise-effort condition of step 3.1.

### Final verdict and cost of deciding
Fresh, claude-fable-5-1, effort high. Cost of deciding: about 1,800 tokens read (the S4 dispatch file and the calculator output), about 700 written, about 3 minutes, about 0.02 USD at Sonnet rates (self-estimates).
