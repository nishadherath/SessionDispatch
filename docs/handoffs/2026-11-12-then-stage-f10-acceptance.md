---
stage: "Stage F10: acceptance of Stage S7, the paired check at high and xhigh, the mini-evaluation, the release steps"
model: claude-fable-5-2
effort: xhigh
status: done
created: 2026-11-12
from: "Stage S7 session local_3db2e510 (claude-sonnet-5-5, high), branch claude/stage-s7-fable-note-45951a"
---

# Stage F10: accept the Fable 5.2 model note

## Goal
Done when all of these hold:
1. Each claim in the list below is accepted or rejected, each with the check you ran and its output.
2. The paired check of assessment section 8.2 has run and thresholds P1 and P2 have a recorded result.
3. The mini-evaluation has run and thresholds P3 and P4 have a recorded result.
4. The note's table (`models/claude-fable-5-2.md` section 2) and the ledger hold the measured rows of both arms (n = 1 for each level).
5. Where all pass: `main` is fast-forwarded to the S7 branch plus your commits, pushed under `approvals.push_origin`, the installer has run with `--harness all`, and `--check` reports 0 files behind.
6. The acceptance note, the ledger rows (S7, F10, the two arms, the subjects), `docs/status.md` and a `README.md` changelog line are committed. No tag: ask the operator.

## Decisions already made
- The design is `docs/assessment-2026-11-12.md` sections 5 and 8.2. Do not reopen it.
- D17 is option C (the operator, 2026-11-12, "Go with C"). The note caps effort at `high` and you test the cap once.
- F10 runs at `xhigh`. The note is under acceptance, so matrix row 4 stays in force for this stage (assessment section 8). Your record says: "Model note: `models/claude-fable-5-2.md` applied except the effort cap, which F10 tests."
- The note says `effort_switch: kept` (probe, transcript `e932f360`, n = 1, one direction, the desktop app only). Keep it.
- No formula change, so no new worked example (`AGENTS.md` rule 8).
- Threshold P1: the cap of note rule 1.2 stays for matrix row 4 if the `high` arm finds at least the `xhigh` arm's count less one. If not, change that sentence so that row 4 keeps `xhigh`, and say so in your report.
- Thresholds P3 and P4 are in "The mini-evaluation" below.

## Files and links that matter
- Branch `claude/stage-s7-fable-note-45951a`, worktree `D:\Code\Claude\SessionDispatch\.claude\worktrees\stage-s7-fable-note-45951a`. Base: `main` at `3cf34ce`.
- S7 commits: `e996819` (note, `SKILL.md`, template, protocol, README), `bc61ce4` (gate check and its tests), `9e84f65` (installer), `b93a809` (scenario 25 and the sandbox). The branch tip also holds this handoff, the ledger row, the status update and the changelog line.
- The design: `docs/assessment-2026-11-12.md` appendices A, B, C and section 8.2. The S7 handoff: `docs/handoffs/2026-11-12-stage-s7-fable-note.md`.
- `models/claude-fable-5-2.md`; `scripts/check.mjs` (`checkModels`); `scripts/check.test.mjs` (last three tests); `scripts/install.mjs` L32; `eval/scenarios/25-fable-note-acceptance-effort.json`; `eval/run.mjs` L41; `eval/README.md` (runner commands).
- `docs/dispatch/calibration.md`: the ledger. `node scripts/session-cost.mjs <transcript>` prices a transcript.

## Verified facts
- On the S7 branch: `node scripts/check.mjs` exits 0, 136 files read, 0 findings; `npm test` 125 tests, 125 pass, 0 fail (396 s) (2026-11-12, by the S7 session).
- `node scripts/install.mjs --harness claude --dry-run` reports 19 files (18 before `models/`).
- `grep -l "fable-5-2" eval/scenarios/*` lists only scenario 25. Scenarios 02 and 09 name `claude-fable-5-1`.
- `git diff 3cf34ce..HEAD --stat -- scripts/dispatch.mjs scripts/dispatch-core.mjs` is empty.
- Scenario 25's figures come from `node scripts/dispatch.mjs --json eval/scenarios/25-fable-note-acceptance-effort.json`: continue 3.45, fresh 5.33, split 4.32 USD, T* 292.6 turns, draft continue by break-even at 54.6 percent. Final: fresh, `claude-fable-5-2`, effort `high`.

## Work completed
S7 is complete on its branch: the four commits above, this handoff, the S7 ledger row, the status update and the changelog line.

Stage F10 done on 2026-11-12 by session `local_17f1e88d` (`claude-fable-5-2`, xhigh): `docs/acceptance-2026-11-12-f10.md`. Eleven claims accepted, none rejected. P1 met (each arm 6 of 6, the cap stays), P2 done, P3 and P4 met (2 of 2 each). Commits `38a0525`, `7971337`, `bc4c186`, then the closing commit. Gate 138 files read, 0 findings; `npm test` 126 tests, 126 pass. The release steps and the tag question are in `docs/status.md`. The acceptance note's finding F10-6 lists two faults of this brief's own text.

## The claims of S7, each with its check
1. **The note is appendix A as it stands.** Extract the text between the two fences of appendix A in the assessment and compare it with `models/claude-fable-5-2.md` byte for byte.
2. **`SKILL.md` has the two insertions of appendix B and no other change.** `git diff 3cf34ce..HEAD -- SKILL.md` shows 8 added lines, 0 removed, equal to appendix B.
3. **The template and the protocol have the changes of appendix C.** `git diff 3cf34ce..HEAD -- templates/decision-record.md docs/operator-protocol.md`: one new row, one changed line, one added clause.
4. **`checkModels` covers rules (a) to (h) of the S7 handoff and each message names the file, the bad value and the fix.** Read the function. Run the gate against one single-fault copy of the tree for each of the eight rules, not only the three that the tests seed.
5. **The three seeded-fault tests catch their faults.** Remove `checkModels` from the step list in a temporary copy and run the three tests: each must fail.
6. **The installer ships `models/`.** `--dry-run` reports 19 files; `scripts/install.test.mjs` has the new test; `--check` names a deleted note.
7. **The evaluation sandbox carries `models/`.** `eval/run.mjs` L41; the test in `scripts/eval-run.test.mjs`.
8. **Scenario 25 is correct.** Recompute its figures by hand (T* = (2,500 x 40e-6 + 116,450 x 16e-6) / (33,550 x 0.2e-6)). Its brief states the 1-hour write, To 0 and no coordinator. The other 24 scenarios are unchanged.
9. **No formula, calculator, matrix or guardrail change.** The empty diff above, and `SKILL.md` claim 2.
10. **The gate and the tests are green as quoted.** Run both again on the branch tip.
11. **Prose conventions hold in every new file.** The gate checks them; read `models/claude-fable-5-2.md` and this handoff once.

## The paired check (assessment section 8.2)
Make a copy of the accepted tree. Seed six faults that the gate does not find: two in arithmetic, two where a text contradicts a file, two in the payload or a test. Start two sub-agents on `claude-fable-5-2`, one at `high` and one at `xhigh`, with the same brief: accept or reject S7's claims on that copy, each finding with its file and line. Price each arm with `node scripts/session-cost.mjs`. Sub-agents write 5-minute entries. Count the seeded faults that each arm finds. Apply P1. For P2, add each arm's calls, output a call, cache write a call and cost to the ledger and to the note's table. One pair is weak evidence: six of six bounds a detection rate at 61 percent or more (Wilson, 95 percent). Say so in the report.

## The mini-evaluation (Sonnet subjects, calculator arm, the CLI runner)
- P3: scenario 25, two runs: the final verdict as expected and effort `high`, 2 of 2.
- P4: scenarios 09 and 02, one run each, with the note in the sandbox: each gives its expected verdict, model and effort, 2 of 2. They name `claude-fable-5-1`, so the note must not apply.
- Commands: `node eval/run.mjs prepare --date <d> --subjects sonnet --arms calculator --only 25 --repeat 2`, then the same with `--only 09,02`, then `node eval/run.mjs run --date <d> --runner cli` and `score`. `eval/README.md` has the flags.
- If P3 or P4 fails, reject the wording that failed and give the operator the choice in five parts. You may run all 25 scenarios (about 11.8 USD) if you find a reason.

## Then
1. Fast-forward `main` to the branch tip plus your commits. Push `main` to `origin` (`approvals.push_origin`, after a green gate and a clean commit). Name the push in the report.
2. `node scripts/install.mjs --harness all`, then `node scripts/install.mjs --check` at 0 files behind.
3. Ledger rows for S7, F10, the two arms and the subjects. Update `docs/status.md` in short active sentences. Add the changelog line.
4. No tag: ask the operator for v1.2.0 or another name.
5. End your report with the next stage's model, effort and kickoff prompt, or "none: the chain is complete".

## Unresolved questions
- The tag name and whether to make one: the operator, after F10.
- Removing the three stray files in the Codex copy: the operator (status document).

## Exact next action
Read your own configuration with the session tool (`self`). Stop if the model is not `claude-fable-5-2` or the effort is not `xhigh`, and name the value to pick. Then `git log --oneline 3cf34ce..HEAD` on the S7 branch and run claim 1.

## Cost projection
`node scripts/dispatch.mjs --json docs/dispatch/2026-11-12-fable-note.json --today 2026-11-12`, API list price, table 2026-11-10, formula 2026-11-11, 1-hour writes for sessions.

| Piece | Projected USD | T projected | Calls measured | Measured USD | Source |
|---|---|---|---|---|---|
| F10 acceptance | 12.55 | 50 | 74 | 14.58 | transcript `310e166e`, table 2026-11-10, priced before the last test run, the closing commit and the release steps |
| F10 arm at `xhigh` (sub-agent) | 5.52 at the 5-minute write (6.97 at 1 hour) | 30 | 48 | 8.77 | sub-agent `a1c221e7` of the same transcript, 5-minute writes |
| F10 arm at `high` (sub-agent) | 4.97 at the 5-minute write (6.35 at 1 hour) | 30 | 36 | 5.37 | sub-agent `a395859c`, 5-minute writes |
| 4 evaluation subjects | 1.88 (estimate: 4 times the measured mean of 0.47) | n/a | 25 turns | 3.13 | each run's `cli-result.json`, 1-hour writes |

Total about 24.9 USD at the 5-minute figure for the arms, plus the subjects. Assumption: T 50 is 25 turns times the factor 2 of the note's table.

## Time projection
F10: 60 to 90 minutes of wall clock. Operator: about 15 minutes to read F10's report and answer the tag question.

## Session dispatch decision

Date: 2026-11-12. Decided by: Stage F9 (`claude-fable-5-2`, high), restated by Stage S7 (`claude-sonnet-5-5`, high).
Price table: `pricing/2026-11-10.json` (age 2 days).

The decision for this stage is the Step B row "F10 acceptance" of the record in `docs/handoffs/2026-11-12-stage-s7-fable-note.md`: class fable, effort xhigh, a fresh session, serial after S7, 12.55 USD. No input has changed since: the design is fixed, S7 changed no formula, and the plan's total of 30.79 USD at the 1-hour write stands.

Guardrails checked for this stage:
1. Under 10 turns: no, T = 50.
2. Design-heavy across a compaction: not design-heavy; the context stays under K.
3. Irreversible steps: F10 pushes `main`; `approvals.push_origin` covers it and the brief names it.
4. Model from the table: `claude-fable-5-2` is in `pricing/2026-11-10.json`.
5. Table age: anthropic 2 days of 14; no null.
6. Acceptance at matrix row 4's class and effort: fable at xhigh, a fresh session, not the author's.
7. Decision budget: this section is the restatement; the record is in the S7 handoff.
8. Class and effort match the harness: F10 checks `get_session self` first.

Adversarial pass: the opposite verdict is "accept S7 on Opus at high, or in the S7 session". The S7 session cannot accept its own work (guardrail 6). Row 4 asks for one class above the author, which is Opus for a Sonnet author. F9 chose Fable at xhigh instead because the design is Fable's own and the cap changes the effort of the project's own quality gate, so D17 asked for a direct test on this model. An Opus acceptance would cost less and could not run the paired check on `claude-fable-5-2`.

Final verdict: fresh, model `claude-fable-5-2`, effort `xhigh`, started by the operator from the card that S7 proposes. Cost of deciding: this section, about 700 output tokens at 10 USD per million on Sonnet, 0.01 USD (self-estimate).
