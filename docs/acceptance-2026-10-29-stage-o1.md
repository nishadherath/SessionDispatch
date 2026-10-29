# Acceptance of Stage O1, 2026-10-29

Stage F1: adversarial acceptance of commit `0cc7d52` (Stage O1, Opus 5.5
at high) by `claude-fable-5-1` at xhigh in a fresh session
(`local_ec0281d1`), under matrix row 4 and guardrail 6. Brief:
`docs/handoffs/2026-10-29-stage-f1-acceptance.md`.

**Verdict: accepted.** Fourteen claims checked, fourteen accepted, none
rejected. One claim's wording is corrected (row 3). The 1.18 against 1.19
question is settled for 1.18 and the Stage 0 record is corrected (section
5). Six findings outside the claims are handed on (section 7); none blocks
acceptance. Gate after this note: `node scripts/check.mjs`, 59 files read,
0 findings, exit 0.

## 1. How the checks were made

- Step 2 was derived by hand from `SKILL.md` alone (section 2), then
  compared term by term with `scripts/dispatch-core.mjs`.
- Every stated figure was recomputed by a script of my own with the
  table's prices typed in, importing nothing from `scripts/`; the
  arithmetic is quoted beside each row. Prices from
  `pricing/2026-10-29.json`, Anthropic rows, which a `diff` of the two
  tables' `anthropic.models` shows identical to `pricing/2026-10-18.json`
  (the table both examples name).
- The calculator was run on every record and probed on its refusal paths
  (section 6). Four mutations were seeded into the examples to see the
  gate name them (row 7).
- A probe directory with a `.git` file was created and removed to see the
  gate skip a nested checkout (row 8).

## 2. Step 2 derived by hand

A turn is one model call. Its prompt is everything in context: the
baseline B, the material read so far, every earlier output. With a cache
breakpoint at the end of the conversation, which is how Claude Code
requests, the prompt splits at the longest cached prefix: the prefix is
read at p_cache_read, the remainder is written at p_cache_write, and the
output O is billed at p_output. From one turn to the next the prompt grows
by what the last turn added: its output O and the fresh input F that
followed it. So the remainder written on turn t is G = F + O, and turn t
reads what was there before, C_start + (t - 1) G plus that turn's fresh
input, which the midpoint C_start + (t - 1/2) G approximates within
(F - O) / 2 tokens a turn. Summing t = 1 to T: reads T x C_start + G x T^2
/ 2 = T x (C_start + T G / 2) = T x C_avg; writes T x G; output T x O. A
miss (the prefix has fallen out of cache) writes the whole prompt instead
of reading it, C_t (p_cw - p_cr) extra; M of them spread evenly give M x
C_avg (p_cw - p_cr).

`continue` runs these T turns from C0 on the current model, plus the
compaction penalty when C_end passes K. `fresh` writes the handoff H in
this session (output at the current model), then the new session's first
request has no cached prefix, so B + R is written at p_cw; then T turns
from B + R on the target model; then L rediscovery turns at the average.
The split is the same fresh session on the sonnet row, plus an acceptance
session of Ta turns from B + Ra on the opus row, plus the brief.

This reproduces every term of `SKILL.md` step 2 and 2.1 and every line of
`sessionTurns`, `freshSession`, `continueSide`, `freshSide`, `breakEven`
and `splitCost` in `scripts/dispatch-core.mjs`. The derivation and the
formula differ only at the boundaries:

- (a) The handoff turn itself also reads C0 and writes its delta at the
  current model, C0 p_cr + G p_cw. Omitted from `fresh`.
- (b) The fresh session reads R in over about R / F turns before work
  starts, each reading B and the files so far. The first write of B + R
  is counted; the reads of B on those turns are not.
- (c) The fresh session's turn 1 is counted as a cache read of B + R on
  top of its first write: an overcount of (B + R) p_cr.
- (d) The stage's last output is never written to cache, so T x G
  overcounts by O p_cw on both sides.

Finding F1-1 sizes (a) to (c) on the three records on file. None moves a
verdict on file.

## 3. The claims

Prices per million tokens, from the table: Fable cache_read 0.25,
cache_write 12.50, output 50; Opus 0.20, 5, 20; Sonnet 0.10, 2.5, 10;
Haiku 0.01, 0.125, 0.5, and above 100,000 tokens 0.05, 0.625, 2.5.

| No. | Claim (O1) | Check | Result | Verdict |
|---|---|---|---|---|
| 1 | Writes are T x G, not T x F: output enters the next prompt and is written to cache once | Section 2: each turn's output is part of the next prompt's uncached remainder, written once with the fresh input that follows it. `sessionTurns` adds `G * r.cw` per turn. Stage 0b: 60 x 6,000 x 12.5e-6 = 4.500 (continue), 60 x 6,000 x 5e-6 = 1.800 (fresh), as stated. | Holds for a harness that keeps earlier reasoning in context, which `SKILL.md` step 1.3 states as the assumption. Boundary (d) is one O p_cw per stage, 0.0375 USD on Fable. The reasoning question is finding F1-2. | Accept |
| 2 | H is priced at the current model's output rate; `--formula 2026-10-27` prices it at the target | `freshSide`: `inp.H * ratesAt(current, inp.C0).out` in force, `ratesAt(target, 0).out` under the old formula. Calculator with the Stage 0 inputs and `--formula 2026-10-27`: H 0.025 (Sonnet); Stage 0b: 0.125 (Fable). | Right: the handoff is this session's output. The handoff turn's context read is omitted (F1-1). | Accept |
| 3 | Turn t reads C_start + (t - 1/2) G; the sum equals T x C_avg when no tier applies; a turn pays the tier when its context exceeds the threshold; the first read is tiered on B + R; penalties use base rates | Algebra: the sum of (t - 1/2) over t = 1..T is T^2 / 2. Haiku probe (section 6): 18 of 20 and 19 of 20 turns at the tier, 0.2482 and 0.2768 USD by hand against 0.25 and 0.28 printed. `freshSession`: `first = cStart * ratesAt(model, cStart).cw`. `continueSide` prices the compaction penalty with `ratesAt(current, 0)`; `freshSession` prices the L turns with `ratesAt(model, cAvg)`. | The last clause is true of the compaction penalty only. The loss turns are priced at the tier C_fresh sits in, which is what step 2 says ("L turns at the fresh session's average"). Wording, not arithmetic. | Accept; the claim reads "compaction penalty at base rates, loss turns at the rate of C_fresh" |
| 4 | M is spread as M / T per turn, the same M on both sides; the split's acceptance session carries no misses | `sessionTurns`: `(M / T) * c * (r.cw - r.cr)` summed over turns is M x C_avg (p_cw - p_cr). Stage 0b with M 6 by hand: misses 6 x 434,081 x 12.25e-6 = 31.905 and 6 x 286,450 x 4.8e-6 = 8.250; totals 51.916 and 17.744; stated 51.92 and 17.74. `splitCost` builds the acceptance with `freshSession(acceptor, ...)` and no M. | Step 2.1 does not say the acceptance session is miss-free (F1-5). | Accept |
| 5 | Split: brief H, run on the family's sonnet row, acceptance on its opus row over Ta turns reading Ra; computed when the target is opus or fable and Ta, Ra are given | By hand: brief 2,500 x 50e-6 = 0.125; run on Sonnet 106,450 x 2.5e-6 + 60 x 286,450 x 0.1e-6 + 60 x 6,000 x 2.5e-6 + 60 x 3,000 x 10e-6 = 0.266 + 1.719 + 0.900 + 1.800 = 4.685; acceptance on Opus 116,450 x 5e-6 + 15 x 161,450 x 0.2e-6 + 15 x 6,000 x 5e-6 + 15 x 3,000 x 20e-6 = 0.582 + 0.484 + 0.450 + 0.900 = 2.417; total 7.226, stated 7.23. Old-formula column 0.125 + 3.695 + 2.124 = 5.944, stated 5.94. Without Ta and Ra the calculator prints "not computed; give Ta and Ra" (fork_graft run). | Under the 2026-10-27 column the brief stays at the current model while H moves to the target: a hybrid, which the example labels "shown for the comparison only". | Accept |
| 6 | Verdict labels: "by class" when the target class is above the current one; "by break-even" when T is under T* and the short path's conditions hold | `draftVerdict` tests `classUp` first. Algebra: with p_cr' = p_cr + (M / T)(p_cw - p_cr), T < fixed / (gap x p_cr') multiplies out to T gap p_cr + M gap (p_cw - p_cr) < fixed, which is cost_continue < cost_fresh when the model is the same, no tier applies, crosses is false and L is 0. The test is exact; the printed T* is a true break-even only at M 0. fork_graft: T* (0.125 + 0.6875) / (45,000 x 0.25e-6) = 72.22 by hand, 72.2 printed, blocked by "a compaction is ahead; the session has compacted". Haiku probe: "never (C0 is not above B + R)", blocked by the tier. | | Accept |
| 7 | Gate tolerance: half a unit of the stated figure's last decimal place | `matchesStated`. Four mutations, each run then restored: fresh total 9.49 to 9.50, "cost_fresh is 9.50 USD, the inputs give 9.4947"; draft side fresh to continue, "Draft verdict says continue, the arithmetic says fresh (by cost)"; fork_graft C0 100,000 to 110,000, "cost_continue is 10.10 USD, the inputs give 10.2500"; comparison table 16.41 to 16.42, "cost_continue under formula 2026-10-27 is 16.42, the inputs give 16.4112". Each exit 1; restored, 58 files, 0 findings, exit 0. | The recompute reads the three totals, T*, the draft side and the comparison table only (F1-3). | Accept |
| 8 | `check.mjs` no longer lints directories the root `.gitignore` names or nested checkouts | `.gitignore` carries `/graft/`, which `ignoredDirs` matches; `walkMd` skips a directory that holds `.git`. `git worktree list` shows S1's worktree at `.claude/worktrees/modest-swirles-cae434` inside this checkout. A probe directory with a `.git` file and a Markdown file carrying an em-dash and a banned word left the gate at 58 files, 0 findings; removed, `git status` clean of it. | Only `dir/` and `/dir/` patterns are honoured; a wildcard in `.gitignore` would not be. | Accept |
| 9 | Arithmetic in `dispatch-core.mjs`, CLI in `dispatch.mjs`; nothing imports an entry point; no front matter change; adapters, persona and protocol untouched | `grep -n "import .* from" scripts/*.mjs`: `check.mjs` and `dispatch.mjs` import `./dispatch-core.mjs` and the standard library only. `git diff 0cc7d52^ 0cc7d52 -- SKILL.md` begins at line 18, below the front matter. `git show --stat 0cc7d52`: eight files, none under `adapters/`, no persona file, not `docs/operator-protocol.md`. | | Accept |
| 10 | The fork_graft example reproduces under `--formula 2026-10-27`: 10.10 and 9.74 USD, T* 72.2; adverse 9.60 and 11.39 | By hand: continue 60 x 190,000 x 0.25e-6 + 60 x 3,000 x 12.5e-6 + 60 x 1,500 x 50e-6 + (30,000 x 12.5e-6 + 2,500 x 50e-6) = 2.850 + 2.250 + 4.500 + 0.500 = 10.100; fresh 0.125 + 55,000 x 12.5e-6 + 60 x 145,000 x 0.25e-6 + 2.250 + 4.500 = 0.125 + 0.688 + 2.175 + 2.250 + 4.500 = 9.7375; margin 0.3625 (3.72 percent). Adverse (W 1,000,000, B 85,000): 9.600 and 11.3875 (18.6 percent). | | Accept |
| 11 | The Stage 0b example: 20.01, 9.49 and split 7.23; comparison column 16.41, 7.44, 5.94; adverse 70.56 and 27.15, 4.50 and 2.58, 51.92 and 17.74; Step B pieces 9.37 and 5.87 | By hand: continue 6.511 + 4.500 + 9.000 = 20.011; fresh 0.125 + 0.532 + 3.437 + 1.800 + 3.600 = 9.495; margin 10.52 (110.8 percent). Old formula: 5.161 + 2.250 + 9.000 = 16.411; 0.050 + 0.532 + 2.357 + 0.900 + 3.600 = 7.440. T 90, R 35,000, M 6: 70.562 and 27.152 (159.9 percent). T 15, R 35,000: 4.497 and 2.582 (74.2 percent). M 6: 51.916 and 17.744. Pieces: O1 9.370 (the fresh side less its handoff); F1 116,450 x 12.5e-6 + 15 x 176,450 x 0.25e-6 + 15 x 8,000 x 12.5e-6 + 15 x 3,000 x 50e-6 = 5.867. | | Accept |
| 12 | The Stage 0 record reproduces: 4.22 and 1.19 | By hand: continue 25 x 225,539 x 0.25e-6 + 25 x 3,000 x 12.5e-6 + 25 x 1,500 x 50e-6 = 1.4096 + 0.9375 + 1.8750 = 4.2221; fresh 2,500 x 10e-6 + 100,242 x 2.5e-6 + 25 x 137,742 x 0.1e-6 + 25 x 3,000 x 2.5e-6 + 25 x 1,500 x 10e-6 = 0.0250 + 0.2506 + 0.3444 + 0.1875 + 0.3750 = 1.1825. The five terms rounded to the cent (0.03, 0.25, 0.34, 0.19, 0.38) sum to 1.19. | The record carried its own rounding error; the calculator is right. | Accept 1.18; the record is corrected (section 5) |
| 13 | The three rows added to the fork_graft example change no figure | `git show 0cc7d52 -- examples/2026-10-27-fork-graft-stage-26.md`: three added lines, the Formula, Current model and Target model rows of the Inputs table. | | Accept |
| 14 | O1's verified facts: gate 57 files, 0 findings; seven seeded mutations caught; Haiku with B 86,450 at the tier on 18 of 20 turns; `--today 2026-11-02` against the 2026-10-18 table exits 2; `gpt-6.1-sol` exits 3; the 2026-10-29 table is identical for the Anthropic rows | Gate 58 files before this note (the F1 handoff is the extra file); four mutations of my own (row 7); Haiku probe 18 of 20 continuing and 19 of 20 fresh; stale and null probes in section 6; `diff` of the two tables' Anthropic rows: no difference. | | Accept |

## 4. The guardrails against the new text

| No. | Guardrail | Against the new step 2 | Result |
|---|---|---|---|
| 1 | No handoff for work under 10 turns | The break-even settles only `continue`; `fresh` still needs T of 10 or more. T* in every record on file is above 10. | Consistent |
| 2 | Never continue a design-heavy stage across a compaction | Step 2 repeats it where the compaction penalty is priced ("the arithmetic is moot"). The calculator does not know "design-heavy", by design; `check.mjs` compares the draft side only and says a guardrail changes the final verdict, not the draft. The fork_graft example's final verdict rests on this guardrail and its draft agrees. | Consistent |
| 3 | No outward step to a class below Opus without a written approval step | The split hands the run to Sonnet. Step 2.1 does not repeat guardrail 3; the record applies it when the stage has an outward step. One line in 2.1 would help (F1-5). | Consistent; a doc gap |
| 4 | Never pick a model by name from memory | `--target` takes a class and `modelForClass` resolves it in the current model's family from the table, next class up when the class is absent, never down. `--current` is the harness's statement. | Consistent |
| 5 | Never compute from a stale table or a null price | Exit 2 at 15 days, computes at 14 (step 1.4 says "older than"); exit 3 on a null row with the verdict marked incomplete and the two options printed (section 6). | Consistent |
| 6 | Acceptance one class above the author | The split's acceptance is the opus row over a sonnet run. This stage is Fable over Opus. | Consistent |
| 7 | The decision is capped at 8,000 tokens and 10 minutes | The calculator replaces the hand arithmetic; one run prints Step A, T*, the split and the pieces. The example's cost-of-deciding rows are O1's own. | Consistent |
| 8 | A session never changes its own class | Step 2 now cites it as the reason `continue` is priced at the current model, which is the comparison both shipped records made and the old text contradicted (assessment finding 1). | Consistent |

## 5. The 1.18 against 1.19 question

The Stage 0 record (`docs/handoffs/2026-10-27-stage-0-bootstrap.md`, Step
A) states five fresh-side terms and a total of 1.19 USD. The terms are
right to the cent; their exact values sum to 1.1825 USD (row 12), which
rounds to 1.18. The record added the terms after rounding each to the
cent, and its margin line (3.03 USD, 255 percent) carries the same cent.
The assessment of 2026-10-29 copied the record's figure twice (section
3.1 "agrees to the cent" and the Stage O1 oracle in 6.1), so the oracle
"4.22 and 1.19 to the cent" was never satisfiable by correct arithmetic.
O1 was right to print 1.18 and to say so rather than fit the figure.

Ruling: the record carries 1.18 USD, margin 3.04 USD (257 percent of the
smaller). Changed in this stage: the two lines of the Stage 0 record, with
a dated note of what the original said and why. Left as written: the
assessment, a dated snapshot whose two mentions this section explains.
The oracle is met in substance: 10.10, 9.74 and 4.22 reproduce to the
cent, and the fourth figure reproduces the record's terms and corrects
the record's sum.

## 6. Calculator probes

All on `pricing/2026-10-29.json` unless said; flags other than the one
under test are the Stage 0b inputs.

| Probe | Command (abridged) | Result |
|---|---|---|
| Stale table, 15 days | `--today 2026-11-13` | exit 2; "is 15 days old, past max_age_days 14. Nothing computed (SKILL.md step 1.4.2)", the refresh command and the default named; nothing else printed |
| Table at the limit, 14 days | `--today 2026-11-12` | exit 0; "age 14 days of 14"; computes, as step 1.4's "older than" says |
| Null target | `--target gpt-6.1-sol` | exit 3; `continue` priced (20.01), `fresh` "unknown, price of gpt-6.1-sol unknown"; "Draft verdict: incomplete: price of gpt-6.1-sol (input, output, cache_read, cache_write, class) unknown"; step 1.4.4's two options printed |
| Null current, target itself | `--current gpt-6.1-sol --target gpt-6.1-sol` | exit 3; both sides unknown; the same incomplete verdict |
| Null current, class target | `--current gpt-6.1-sol --target sonnet` | exit 1; "has no model at or above that class in family openai", models listed |
| T 0 | `--T 0` | exit 1; "T must be a whole number of turns, 1 or more, found 0" |
| T 2.5, compacted maybe, formula 2026-01-01 | the three flags together | exit 1; all three named in one message, each with the value found and what is accepted |
| No current | `--current` omitted | exit 1; "--current must name the model id this session runs on" |
| JSON with a byte-order mark, "1m" and "20k" tokens, two pieces | `--json inputs-bom.json` | exit 0; the split and the Step B table printed: O2 (Opus, T 40, R 25,000) 6.01, S2 (Sonnet, T 40, R 15,000) 2.07 |
| Haiku crossing the tier | `--current claude-haiku-5-5 --target haiku --C0 90000 --T 20 --F 3000 --O 1500 --B 86450 --R 10000` | exit 0; "Long-context tier: 18 of 20 turns (continue), 19 of 20 (fresh)"; 0.25 and 0.28 USD; T* "never (C0 is not above B + R)"; "Short path does not settle step A: a long-context tier applies"; continue by cost, 11.5 percent. By hand (turn t at 90,000 + (t - 1/2) 4,500 passes 100,000 from t = 3; from 96,450 from t = 2): 0.1274 + 0.0518 + 0.0690 = 0.2482; 0.0013 + 0.0121 + 0.1375 + 0.0540 + 0.0720 = 0.2768 |

## 7. Findings beyond the claims

None of these is a reason to reject O1: no claim in the brief is wrong,
and no verdict on file moves. Each names where it goes.

**F1-1. The fresh side's fixed cost is understated.** Boundaries (a) to
(c) of section 2, sized with the read-in modelled as R / F turns of 150
output tokens (an estimate; the handoff-turn term is exact mechanics):

| Record | Handoff turn (a) | Read-in turns (b) | Turn 1 overcount (c) | Net fresh understated | Of the smaller side |
|---|---|---|---|---|---|
| fork_graft (Fable to Fable) | 0.063 | 0.171 | 0.014 | 0.220 USD | 2.3 percent; T* would move from 72.2 to about 92 turns |
| Stage 0 record (Fable to Sonnet) | 0.085 | 0.053 | 0.010 | 0.128 USD | 10.8 percent |
| Stage 0b (Fable to Opus) | 0.139 | 0.155 | 0.021 | 0.272 USD | 2.9 percent |

Each record stays where it is (by class, by cost at over 100 percent, or
on guardrail 2), but the Stage 0 figure shows the omission can exceed the
band on a short stage, and T* moves by a quarter in the only same-model
record. To Opus: fold (a) into `fresh` and T* as C0 p_cr + G p_cw at the
current model, and price the read-in turns, both in `SKILL.md` step 2 and
`dispatch-core.mjs`; O2's scenario set should hold one case within 10
percent of the band so the evaluation sees whether the omission flips a
verdict. F2 retunes on measured data.

**F1-2. Reasoning retention is assumed, not measured.** G = F + O takes
every output token to stay in context. Where a harness strips earlier
reasoning on a new user turn, growth is nearer F plus visible output
(`SKILL.md` step 1.3 says so), and the stripping itself changes the
prompt after the last user message, which would be a cache miss the
pause model of M does not count. Hypothesis, confidence medium, unmeasured
in this harness, though one reading from this session points the other way:
between 11:25 and 11:35 UTC the context grew from 200,282 to 273,098 over
four model calls whose tool results were about 18,000 tokens and whose
visible output about 8,000 (estimates from the transcript); the remaining
47,000 tokens are consistent with reasoning retained in context inside a
tool loop, where no user message has arrived to strip it. One sample,
confidence medium. To H1: measure context growth per turn and the miss rate
across operator messages; to O2: one scenario with G = F plus visible O.

**F1-3. The gate's recompute stops at the totals.** `recomputeExample`
checks the three totals, T*, the draft side and the comparison table. The
term lines inside the fenced block, the adverse recomputes and the Step B
cost column are not checked; this note checked them by hand once. To
Sonnet, with `node scripts/check.mjs` as the oracle: parse the block's
"= x.xxx" lines and the Step B cost column and compare at the same
tolerance.

**F1-4. Three texts give three effort rules for acceptance.** Matrix row
4: high, xhigh for a release or a merge. Guardrail 6: xhigh when the
author is the top class. Protocol section 2: Fable xhigh only for
acceptance. This stage ran at xhigh under the protocol's rule and the
assessment's roadmap. An effort rule is a tiering rule, so it is F2's to
settle on the evaluation's cost and verdict data, then one text states it
and the others point at it.

**F1-5. Two sentences missing from step 2.1.** That the acceptance
session is priced without misses, and that an outward step in the split's
run needs guardrail 3's approval line in the brief. Both are what the code
and the guardrails already do. For the next Opus stage that edits
`SKILL.md` (O2 does not), with this note as the source.

**F1-6. A claim's wording.** "Penalties use base rates" is true of the
compaction penalty; the loss turns are priced at C_fresh's tier, which
follows step 2. Corrected in row 3; no change to code or text.

## 8. What this stage changed

- `docs/handoffs/2026-10-27-stage-0-bootstrap.md`, Step A: 1.18 USD and
  margin 3.04 USD (257 percent), with a dated note of the original.
- This note; `docs/handoffs/2026-10-29-stage-f1-acceptance.md` status;
  `docs/status.md`.

Nothing in `SKILL.md`, `scripts/`, `examples/`, `templates/`, `adapters/`
or `pricing/`. The installed user copy is refreshed after the S1 merge,
as `docs/status.md` says.

## 9. Cost of this acceptance

| Row | Value | Source |
|---|---|---|
| Context at start of the checks | 200,282 | `get_usage self`, 11:25 UTC, after the reading phase; baseline 86,931 (total less Messages 113,351) |
| Context at end | 273,098 | `get_usage self`, 11:35 UTC, after the probes and this note; about 290,000 by the commit (estimate) |
| Turns | 14 | model calls: 9 to the 11:35 reading, about 5 more to the O2 handoff (estimate) |
| Input tokens read | about 95,000 | brief, personas, protocol, `SKILL.md`, the three scripts, both examples, the table, the template, the assessment sections, the two older handoffs: characters divided by 4, estimate |
| Output tokens | about 12,000 visible | this note, the handoff and status edits, the probe scripts; characters divided by 4, estimate |
| Wall clock | about 25 minutes | session clock, 11:16 UTC to about 11:41 UTC |
| Priced | about 5.0 USD counting visible output: baseline 86,931 x 12.5e-6 = 1.09; growth to about 290,000 at the commit, 203,069 x 12.5e-6 = 2.54; cache reads about 3.1M tokens over 14 turns x 0.25e-6 = 0.78; visible output 12,000 x 50e-6 = 0.60. The usage tool does not separate reasoning from Messages; the 47,000 tokens F1-2 cannot otherwise explain would add 2.35: about 7.4 USD, estimate | table `pricing/2026-10-29.json`, fable row: cache reads at 0.25, cache writes at 12.50, output at 50 per million |

The F1 handoff projected 5.89 USD for 15 turns at O 3,000 and R 30,000.
The actual R was about three times that (the persona and protocol alone
are 21,000 tokens, and the brief named them), which is where the
difference sits; the turn count was near the estimate.
