---
stage: "Stage S3: adapter verification with the operator present"
model: claude-sonnet-5-5
effort: medium
status: ready
created: 2026-10-30
from: "Session local_9e9ec94a (Fable 5.1, high): Stage F5, the closing assessment on H3"
---

# Stage S3: adapter verification with the operator present

## Goal
Each of the nine files under `adapters/` says whether its harness was verified on the operator's machine and on what date, or that the harness is not installed there, and `node scripts/install.mjs --check` reports 0 files behind for every installed copy. Done when: the installer has run for every harness the operator has (`--harness all`, then `--check`); for each such harness the operator has pasted the printed pointer block where the adapter says, started one session there, given it scenario 03's brief by hand (`eval/scenarios/03-break-even-continue.json`, the `situation` text), and a record in the skill's shape was written; each adapter carries a dated "Verified on <date>" or "Not installed on this machine on <date>" line; the gate exits 0 and `npm test` passes; a changelog line is in `README.md`; `docs/status.md` shows S3 done and nothing under To do; all committed by name. This stage runs only with the operator at the machine; stop and ask when a harness needs a sign-in or a paste.

## Decisions already made
- The skill text is final (S5 `c1890f7`, F5's floor sentences): nothing in `SKILL.md` changes in this stage. A harness that fails to load the skill is an adapter finding, recorded in the adapter, not a text change.
- The three copies refreshed on 2026-10-30 (claude, codex, opencode) count as installed and current; the Claude Code, Codex and Z-Code adapters already carry "Verified on 2026-10-27" lines and keep them, with the 2026-10-30 refresh noted.
- DeepSeek and Kimi Code adapters say "Not verified on the operator's machine" since 2026-10-27; unless the operator has installed one since, that line gains the new date and stays.
- The pointer blocks are pasted by the operator, never by the script (`AGENTS.md` non-negotiable 7's spirit: the installer never edits an instruction file). The Stage 0 question (whether to paste into `~/.codex/AGENTS.md`, `~/.config/opencode/AGENTS.md` and `~/.gemini/GEMINI.md`) is answered by the operator in this stage.
- Prose: Australian English, no em-dashes, none of the persona's banned words; the gate enforces the last two.

## Files and links that matter
- `adapters/*.md` (nine files: claude-code, cline, codex, deepseek, gemini-cli-antigravity, generic, kimi-code, opencode, zcode); `scripts/install.mjs` (`--harness`, `--check`, `--dry-run`); `scripts/install.test.mjs`.
- `docs/assessment-2026-10-30-f4.md` section 2.7, "S3", the method; `docs/assessment-2026-10-30-f5.md` section 4, the done criteria and what is left.
- `eval/scenarios/03-break-even-continue.json` (the brief to give by hand) and `eval/runs/2026-11-01/03-break-even-continue.sonnet.calculator/record.txt` (what a record in the skill's shape looks like).
- `docs/status.md`, `README.md` (changelog).

## Verified facts
- `node scripts/install.mjs --check` on 2026-10-30 (F5 session, after the floor edit and reinstall): claude, codex and opencode copies current, 0 files behind.
- The gate at F5's close: `node scripts/check.mjs` exit 0, counts in the F5 stage report and `docs/status.md`; `npm test` passes there.
- Adapter lines on 2026-10-30: claude-code "Verified on 2026-10-27"; codex "user level, verified ..." (line 10); zcode "Verified on 2026-10-27"; deepseek and kimi-code "Not verified on the operator's machine (... 2026-10-27)"; cline, gemini-cli-antigravity, opencode and generic carry no verification line (`grep -n -i "verified" adapters/*.md`).

## Work completed
- Nothing of this stage yet. F5 (`docs/assessment-2026-10-30-f5.md`) ruled the thresholds, D10 and the floor; its commit is in `git log` under "docs(assessment): Stage F5".

## Unresolved questions
- Operator: which harnesses are installed on the machine today (Cline, OpenCode, Gemini CLI or Antigravity, Z-Code, Kimi Code, DeepSeek); each absent one gets "Not installed on this machine on <date>".
- Operator: the Stage 0 paste question above.
- Operator: D10 (variant C, recommended A) and D11 (the Haiku rerun H4, recommended A), set out in F5 section 2; neither blocks this stage.

## Exact next action
Run `get_session self`; stop unless it reports `claude-sonnet-5-5` at `medium`. Then run `node scripts/install.mjs --harness all --dry-run` and show the operator the list of harness folders it would write and the pointer blocks, and ask which harnesses are installed.

## Cost projection
Sonnet 5.5, medium: T 25, F 3,000, O 1,500, B 87,163 (measured, F5), R 15,000 (estimate: this handoff 4,000, the adapters 7,000, the installer's output 4,000): 1.31 USD fresh by `node scripts/dispatch.mjs --json docs/dispatch/2026-10-30-f5-close.json --today 2026-10-30` (Step B row "S3"), plus the handoff 0.20 at the Fable rate. Quote 1 to 2.5 USD; the operator's pauses add cache misses (M) that are not priced, say one per harness.

## Time projection
30 to 45 minutes of model time; the operator's installs and pastes about 30 to 60 minutes beside it; review about 20 minutes.

## Session dispatch decision
Date: 2026-10-30. Decided by: claude-fable-5-1, effort high, in Claude Code (desktop app).
Price table: `pricing/2026-10-29.json` (age 1 day). Command: `node scripts/dispatch.mjs --json docs/dispatch/2026-10-30-f5-close.json --today 2026-10-30`.

### Inputs

| Input | Value | Source |
|---|---|---|
| Formula | 2026-10-29 | `SKILL.md` step 2 |
| Current, target model | claude-fable-5-1; claude-sonnet-5-5 | `get_session self`; matrix row 2 (a scoped change with a stated check, the installer and the gate), the table's sonnet row |
| W, K | 1,000,000; 970,000 | Usage tool, 97 percent |
| C0 | 214,240 | Measured, `get_usage self` after F5's reading phase |
| T, F, O | 25; 3,000; 1,500 | Estimates (F4's S3 row) |
| B, R, H | 87,163; 15,000; 4,000 | B measured (this session, total less Messages); R and H estimates |
| M, L | 0; 0 | Unmeasured; empty list |

### Step A and B
Calculator: G 4,500; C_end 326,740, crosses false; cost_continue 4.97 USD (Fable), cost_fresh 1.51 (Sonnet, handoff included); T* n/a, the model changes. Draft verdict fresh by cost, margin 3.46 USD (229.8 percent of the smaller). Pieces: S3, claude-sonnet-5-5, medium, 1.31 USD; H4 (conditional on D11), claude-sonnet-5-5, medium, 0.85 USD plus subject runs.

### Guardrails and adversarial pass
Guardrail 3: S3 pastes pointer blocks into the operator's own instruction files and starts sessions in other harnesses; each paste is the operator's own act, named in the goal as the approval step. Table age 1 day, no null; the decision record about 500 tokens, within the cap. Opposite verdict, continuing on Fable: 3.46 USD dearer, and matrix row 2 work on Fable is above class; the class guardrail and the cost agree, so the verdict holds on arithmetic. Effort medium, the Sonnet default; no raise condition of step 3.1 applies.

### Final verdict and cost of deciding
Fresh, claude-sonnet-5-5, effort medium, two pieces serial (H4 only if D11 is B). Cost of deciding: about 1,200 tokens read (the F4 roadmap file and the calculator output), about 600 written, about 2 minutes, about 0.05 USD at Fable rates (self-estimates).
