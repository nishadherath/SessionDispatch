---
stage: "Stage 0: bootstrap SessionDispatch (project, skill, adapters, pricing, scripts)"
model: claude-fable-5-1
effort: high
status: done
created: 2026-10-27
from: "Session local_c97818f5 (Fable 5.1, high), started by the fork_graft coordinating session local_60e06b5a with the operator's brief"
---

# Stage 0: bootstrap

## Goal
The project exists at `D:\Code\Claude\SessionDispatch` with a first commit on `main`; the skill is
installed user-level for Claude Code; each adapter states where it goes; `node scripts/check.mjs`
exits 0; the operator's six clarifications are answered and applied; this handoff records the token
cost of this session's own decisions. Done when the first commit is on `main` and the private
remote the operator chose holds it.

## Decisions already made
- (a) One canonical `SKILL.md` plus pointer adapters under `adapters/`; no generator. Operator, 2026-10-27.
- (b) Install script, user-level default (`~/.claude/skills/session-dispatch/`), `--project` copies, pointer block printed, instruction files never edited by the script. Operator.
- (c) `pricing/2026-10-18.json` seeded with the Anthropic figures the fork verified; other families null; `max_age_days` 14 (operator lowered it from my 14-or-30 proposal to 14); a null met mid-decision gives the operator the choice of a live assessment, and with a further yes a pull request against origin. Operator.
- (d) Decision record is a section of the handoff; standalone under `docs/dispatch/` only where a project has no handoff convention; cost of deciding as a six-row table. Operator.
- (e) Private GitHub remote under the operator's account, MIT licence in the operator's name. Operator.
- (f) Persona editions copied verbatim from the Orchestrator repository (four classes; bash, node-ts-js, ai-prompting); protocol adapted: sections 1 to 9 kept, section 2 points at `pricing/`, section 10 is this project's. Operator.
- Decision budget 8,000 tokens and 10 minutes; fresh-session floor 10 turns; the 10 percent cost band before quality terms decide. Mine, in `SKILL.md`; the operator may retune them.

## Files and links that matter
- `SKILL.md` (the procedure), `templates/decision-record.md`, `examples/2026-10-27-fork-graft-stage-26.md`.
- `pricing/2026-10-18.json`, `pricing/README.md`, `scripts/check.mjs`, `scripts/install.mjs`, `scripts/pricing-new.mjs`.
- `adapters/*.md` (nine files; the Verified or to-be-checked status is in each "Where it goes").
- `docs/operator-protocol.md` section 10; `AGENTS.md`; `.claude/helpers/operator-protocol.cjs`.

## Verified facts
- Session configuration (`get_session self`, 2026-10-27): `claude-fable-5-1`, `high`; matches this file.
- `node scripts/check.mjs`: 47 files read, 0 findings, exit 0 (2026-10-27, Node 26.7.0, after the first commit 9e821b7).
- `node scripts/install.mjs --harness all --dry-run`: six targets printed; no file written.
- Harness folders present on the machine (`ls`, 2026-10-27): `~/.claude/skills` (skills listed in this session), `~/.codex/AGENTS.md` and `config.toml`, `~/.cline`, `~/Documents/Cline`, `~/.config/opencode/opencode.jsonc`, `~/.gemini/GEMINI.md` (empty), `~/.zcode/skills` (same layout as Claude's), `~/.antigravity`. Not present: `~/.codex/skills`, `~/.config/opencode/skill`, `~/Documents/Cline/Rules`, any Kimi or DeepSeek folder.
- Context window in this harness (`get_usage self`): 1,000,000 tokens, auto-compact at 97 percent; baseline before any message 85,242 tokens (total 116,156 less the Messages category 30,914).

## Work completed
- `9e821b7`, the first commit on `main`: skill, nine adapters, first price table, templates, worked example, three scripts, protocol, AGENTS.md, README, LICENSE, persona copies, session-start hook, this handoff.
- User-level install run once (`node scripts/install.mjs`).

## Unresolved questions
- Operator: fill the null families in the price table (OpenAI, Google, DeepSeek, Kimi, GLM) and place each model in a class; until then the skill refuses to price those harnesses.
- Operator or Stage 1: verify the Codex, OpenCode, Cline, Gemini, Antigravity, Kimi and DeepSeek locations in `adapters/` on first use and correct the files.
- Operator: whether to paste the pointer blocks into `~/.codex/AGENTS.md`, `~/.config/opencode/AGENTS.md` and `~/.gemini/GEMINI.md` (the script printed them and edited nothing).

## Exact next action
Operator reviews `SKILL.md`; then Stage 1 (below) on Sonnet 5.5 at medium.

## Cost projection
Stage 1 (verify adapters on each harness, refresh the price table with the operator's figures, run the
check): Sonnet 5.5, medium, about 25 turns, context 85k baseline plus 15k re-read growing to 160k
(average 137k). Cache reads 25 x 137k x $0.10 = $0.34; fresh 25 x 3k x $2.50 = $0.19; output 25 x
1.5k x $10 = $0.38; first read 100k x $2.50 = $0.25. About $1.20 (quote $1 to $2.50).

## Time projection
Stage 1: 30 to 45 minutes wall clock, of which the operator's own harness checks are the longer
part; operator review of this stage about 40 minutes (`SKILL.md` and the example).

## Session dispatch decision
Date: 2026-10-27. Decided by: claude-fable-5-1, high, Claude Code desktop. Table `pricing/2026-10-18.json` (9 days).

### Inputs
W 1,000,000 and K 970,000 (measured, usage tool); C0 188,039 (measured, after the build); compacted no;
unrecorded context none (everything is in files); T 25 (Stage 1, estimated); F 3,000 and O 1,500
(protocol defaults); B 85,242 (measured); R 15,000 (SKILL.md 6k, adapters 5k, pricing README 1k,
this handoff 2k, AGENTS.md 1k; estimated from characters); H 2,500; task type scoped verification
and data entry with the check script as oracle (Sonnet row); design-heavy no; outward-facing: one
pull request if the operator asks for it, approval step named.

### Step A: continue or hand off
Continue on Fable: C_cont = 188k + 37.5k = 225.5k; reads 25 x 225.5k x 0.25e-6 = 1.41; fresh input
25 x 3k x 12.5e-6 = 0.94; output 25 x 1.5k x 50e-6 = 1.88; no compaction (C_end 263k < K): 4.22 USD.
Fresh on Sonnet: handoff 2.5k x 10e-6 = 0.03; first read 100k x 2.5e-6 = 0.25; reads 25 x 137.7k x
0.1e-6 = 0.34; fresh input 25 x 3k x 2.5e-6 = 0.19; output 25 x 1.5k x 10e-6 = 0.38; loss 0: 1.18 USD
(corrected 2026-10-29 by Stage F1: the original added the five terms after rounding each to the cent; the
exact sum is 1.1825, and the margin below was 3.03 USD, 255 percent, by the same cent).
Draft verdict: fresh, by cost, margin 3.04 USD (257 percent of the smaller). The class change alone
would force it (guardrail 8).

### Step B: model, effort and concurrency
One piece, Sonnet, `claude-sonnet-5-5`, medium, oracle `node scripts/check.mjs` exit 0 plus one line
per adapter naming the command that verified it; serial (the harness checks need the operator's
machine one at a time). Effort unchanged: no irreversible step without an approval line.

### Guardrails checked
1 no (T 25). 2 not design-heavy. 3 the pull request names the operator's yes. 4 model from the table.
5 table 9 days, Sonnet row complete. 6 acceptance of Stage 1 by Opus at high, one class above.
7 within budget (table below). 8 the new session checks its front matter.

### Adversarial pass
For continuing: this session holds the reasoning behind every adapter's wording and would correct
them faster than a Sonnet session reading them cold; 25 turns at Fable is 4 USD, small in money.
Inputs: C0 measured; T could be 40 if harness documentation is contradictory (fresh scales to 1.8
USD, continue to 6.6, verdict unchanged); task type could hide judgement calls about harness
behaviour, which Sonnet escalates in five lines rather than guessing; prices 9 days old; R could be
30k (adds 0.04 USD). Recomputed with T 40 and R 30k: continue 6.60 USD, fresh 1.86 USD.
Verdict holds: yes.

### Final verdict
Fresh session, `claude-sonnet-5-5`, medium, one piece, serial. Exact next action: the operator
reviews `SKILL.md`, fills what prices they have, then starts Stage 1 with the kickoff prompt in the
stage report.

### Cost of deciding
| Row | Value | Source |
|---|---|---|
| Context at start | 85,242 (clarifications), 188,039 (dispatch) | usage tool, two readings |
| Context at end | 116,156 (clarifications), 196,043 (dispatch, read after this file was written) | usage tool |
| Input tokens read | about 25,000 (clarifications: protocol, template, persona sections, harness folders); about 2,000 (dispatch) | difference of the readings less output; estimate |
| Output tokens | about 3,600 (clarifications: the message and the notes file); about 2,200 (dispatch: this section) | characters divided by 4; estimate |
| Wall clock | 16 minutes (clarifications, 09:29 to 09:45 local); 6 minutes (dispatch) | session timestamps |
| Priced | clarifications 25k x 12.5e-6 + 3.6k x 50e-6 = 0.49 USD; dispatch 2k x 12.5e-6 + 2.2k x 50e-6 = 0.14 USD; together 0.63 USD | table `pricing/2026-10-18.json`, fable row |
