# Worked example: SessionDispatch, 2026-10-29, dispatching Stage O1

On 2026-10-29 a Claude Code desktop session on `D:\Code\Claude\SessionDispatch`,
running Claude Fable 5.1 at xhigh effort, had finished the project's first
assessment and stood at 254,081 tokens of context, measured. The next stage
was Stage O1: revise the step 2 formula, write the calculator, make the gate
recompute the examples, and add this example. The session wrote a handoff
and proposed a fresh Opus session. This record re-runs that decision under
the formula of 2026-10-29 with the session's measured inputs unchanged, and
shows the figures of the formula of 2026-10-27 beside the new ones.

It is the first record with a class change (Fable to Opus), a cache-miss
term and the split comparison. The gate recomputes every figure in Step A
and in the comparison table from the Inputs table below.

## Session dispatch decision

Date: 2026-10-29. Decided by: claude-fable-5-1, effort xhigh, in Claude
Code (desktop app). Price table: `pricing/2026-10-18.json` (age 11 days).

### Inputs

| Input | Value | Source |
|---|---|---|
| Formula | 2026-10-29 | `SKILL.md` step 2 as revised in Stage O1 |
| Current model | claude-fable-5-1 | Reported by the harness |
| Target model | claude-opus-5-5 | Matrix row 3 and protocol section 2: changes to the procedure's arithmetic are Opus work; the table's opus row |
| Window W | 1,000,000 | Measured: usage tool, `contextWindow` |
| Compaction point K | 970,000 | Measured: `autoCompactsAtPercent` 97 times W |
| Current context C0 | 254,081 | Measured: usage tool, after the assessment was written |
| Compacted already | no | Measured: no compaction in the session |
| Unrecorded context | none | Findings, derivations and arithmetic are in `docs/assessment-2026-10-29.md` |
| Expected turns T | 60 | Estimate from the stage plan |
| Fresh input per turn F | 3,000 | Step 1.2 default |
| Output per turn O | 3,000 | Step 1.2, writing-heavy; at high effort, the effort the target runs at |
| Fresh baseline B | 86,450 | Measured: usage tool total less the Messages category |
| Re-read set R | 20,000 | Estimate, characters divided by 4: assessment 7k, `SKILL.md` 4.7k, `check.mjs` 2.8k, example 2.3k, template 0.7k, handoff 2.5k |
| Handoff size H | 2,500 | Step 1.2 default; the handoff written was about 100 lines |
| Cache misses M | 0 | Unmeasured, so the default; the adversarial pass uses 6 |
| Rediscovery turns L | 0 | The unrecorded list is empty |
| Acceptance turns Ta | 15 | Estimate for the split: an Opus acceptance of a Sonnet run |
| Acceptance re-read Ra | 30,000 | Estimate: R plus the diff and the gate output |
| Task type | changes to the procedure's arithmetic, plus a script and an example | Matrix row 3 |
| Design-heavy | yes | The stage chooses the formula's terms |
| Irreversible or outward-facing steps | none | Commits only; a push needs the operator's yes |

### Step A: continue or hand off

The block below is the output of
`node scripts/dispatch.mjs --json inputs.json` with the inputs above,
less its header lines and its Step B table (which is under Step B).

```
G       = F + O                   = 6,000
C_end   = C0 + T * G              = 614,081
crosses = C_end > K               = false   (K 970,000)
C_cont  = C0 + T * G / 2          = 434,081
C_fresh = B + R + T * G / 2       = 286,450

cost_continue on claude-fable-5-1
  T*C_cont*p_cr                   = 6.511   (cache reads)
  T*G*p_cw                        = 4.500   (new context written to cache)
  T*O*p_out                       = 9.000   (output)
  M*C_cont*(p_cw - p_cr)          = 0.000   (cache misses, M 0)
  penalty_compaction              = 0.000   (no compaction ahead)
  = 20.01 USD
cost_fresh on claude-opus-5-5
  H*p_out                         = 0.125   (the handoff, at claude-fable-5-1)
  (B+R)*p_cw                      = 0.532   (the fresh session's first read)
  T*C_fresh*p_cr                  = 3.437   (cache reads)
  T*G*p_cw                        = 1.800   (new context written to cache)
  T*O*p_out                       = 3.600   (output)
  M*C_fresh*(p_cw - p_cr)         = 0.000   (cache misses, M 0)
  penalty_loss                    = 0.000   (L 0 rediscovery turns)
  = 9.49 USD
Prices per million: claude-fable-5-1 cache_read 0.25, cache_write 12.50, output 50.00; claude-opus-5-5 cache_read 0.20, cache_write 5.00, output 20.00

T* = n/a: the model changes; compare the totals

cost_split: brief by claude-fable-5-1, run on claude-sonnet-5-5, acceptance on claude-opus-5-5
  H*p_out                         = 0.125   (the brief)
  run, fresh session              = 4.685   (T 60, R 20,000)
  acceptance, fresh session       = 2.417   (Ta 15, Ra 30,000)
  = 7.23 USD
```

Draft verdict: fresh, by cost, margin 10.52 USD (110.8 percent of the
smaller). Opus is below Fable, so continuing is allowed by class and the
cost decides.

The two formulas side by side, same inputs:

| Figure | Formula 2026-10-27 | Formula 2026-10-29 | What moved |
|---|---|---|---|
| cost_continue | 16.41 | 20.01 | Growth F + O: reads 5.16 to 6.51; writes T * G instead of T * F, 2.25 to 4.50 |
| cost_fresh | 7.44 | 9.49 | The same two terms at Opus prices, 2.36 to 3.44 and 0.90 to 1.80; H at Fable's output rate, 0.050 to 0.125 |
| cost_split | 5.94 | 7.23 | Not part of the formula of 2026-10-27; shown for the comparison only |

The handoff's own record gave 16.41 and 7.51. Its 7.51 already priced H
at Fable (0.125), the rule this formula adopts; the records of 2026-10-27
priced it at the target (0.050 here), which is what `--formula 2026-10-27`
reproduces. The verdict and its direction are the same under both
formulas; the margin grows from 8.97 to 10.52 USD because output now
grows the context and the continuing side pays Fable's rates on it.

### Step B: model, effort and concurrency

| Piece | Class | Model id | Effort | Oracle | Serial or parallel | Cost |
|---|---|---|---|---|---|---|
| Stage O1: formula, calculator, gate recompute, this example | Opus | claude-opus-5-5 | high | `node scripts/check.mjs` exit 0 with the recompute; `--formula 2026-10-27` reproduces the two older records | serial; Stage S1 (Sonnet, own worktree, disjoint files) beside it | 9.37 USD (T 60, F 3,000, O 3,000, R 20,000), plus the handoff 0.125 |
| Stage F1: acceptance of O1 | Fable (author is Opus) | claude-fable-5-1 | xhigh | An acceptance note listing each claim and the command that checked it | serial, after O1 | 5.87 USD (T 15, F 5,000, O 3,000, R 30,000; estimate) |

The costs are the calculator's Step B table for these two pieces. Serial
chain: handoff and commit 10 minutes; O1 45 to 75 minutes; F1 20 to 30
minutes. Operator review about 30 minutes for O1, separately.

Effort raised or lowered because: no change; high is the matrix default
for row 3, xhigh for an acceptance.

Split (step 2.1): not an option. Writing the formula text and choosing
its terms is design work; a brief that settled every choice would be the
stage itself. The 2.27 USD the split would save is the price of that.

### Guardrails checked

1. Under 10 turns: no, T = 60.
2. Design-heavy across a compaction: design-heavy, but no compaction has
   happened or is ahead (C_end 614,081 under K 970,000).
3. Irreversible steps and their approval step: none; a push waits for
   the operator's yes.
4. Model chosen from the table, not memory: claude-opus-5-5 is the
   table's opus row.
5. Table age and nulls: 11 days, under 14; the Fable, Opus and Sonnet
   rows are complete.
6. Acceptance one class above the author: Fable at xhigh in a fresh
   session (Stage F1).
7. Decision budget: within it; see the cost table.
8. Class and effort match the harness: the O1 session read its own
   model and effort with `get_session self` and matched the handoff.

### Adversarial pass

The opposite verdict, argued: the deciding session holds every
derivation behind the findings and would write the formula and the
example faster than an Opus session reading them cold. The stage is
small in money either way, and the operator chose xhigh Fable for this
project's quality that day. Step 2 is the centre of the skill, so the
task type could be argued up to Fable.

Each input, the way it could be wrong:

- C0: measured; reasoning tokens inflate it, which favours fresh.
- T: could reach 90 if the recompute check needs iteration, or be 15 if
  the brief turns out to be most of the work.
- F and O: O at 3,000 assumes high effort; xhigh would be larger and
  would raise the Fable side more.
- B and R: B measured; R could be 35,000 if the Opus session reads the
  protocol in full.
- M: the operator reviews between stages, not between turns, so 0 is
  plausible; six review pauses over the stage give M 6.
- Task type: protocol section 2 puts arithmetic changes at Opus and
  reserves Fable for acceptance, which Stage F1 provides.
- Prices: 11 days old; no long-context tier on Fable, Opus or Sonnet.
- Unrecorded context: none named; the assessment carries the reasoning.

Recomputed with the adverse values, from the calculator:

```
T 90, R 35,000, M 6:  cost_continue = 70.56 USD   cost_fresh = 27.15 USD   (fresh by 159.9 percent)
T 15, R 35,000, M 0:  cost_continue =  4.50 USD   cost_fresh =  2.58 USD   (fresh by 74.2 percent)
M 6 alone:            cost_continue = 51.92 USD   cost_fresh = 17.74 USD   (misses 31.91 against 8.25)
```

No adverse value brings the sides within the band: every term on the
continuing side is at Fable's rates and every term on the fresh side at
Opus's. The miss term is the largest single mover, six misses on the
continuing context costing more than the whole stage at M 0, which is
finding 2 of the assessment in numbers.

Verdict holds: yes.

### Final verdict

Fresh, model claude-opus-5-5, effort high, one piece, serial, with a
Fable xhigh acceptance after it. Exact next action: commit, write
`docs/handoffs/2026-10-29-stage-o1-formula-calculator.md`, and propose
the session with that handoff as its brief.

### Cost of deciding

| Row | Value | Source |
|---|---|---|
| Context at start | 254,081 | usage tool, read before the record was written |
| Context at end | about 258,500 | estimate: the record's output plus one tool result |
| Input tokens read | about 1,000 | the arithmetic check's output; everything else was in context |
| Output tokens | about 3,600 | the record, characters divided by 4; estimate |
| Wall clock | about 7 minutes | session timestamps, 10:35 to 10:42 UTC |
| Priced | 1,000 x 12.5e-6 + 3,600 x 50e-6 = 0.19 USD | table `pricing/2026-10-18.json`, fable row |

These rows are the deciding session's, copied from its handoff. Re-running
the decision under the new formula for this example cost the Stage O1
session one calculator run and is not counted here.
