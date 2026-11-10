# Worked example: SessionDispatch, 2026-11-10, dispatching Stages O6 and F8

On 2026-11-10 the Stage F7 session of this repository, on Claude Fable
5.2 at xhigh in the Claude Code desktop app, dispatched the D14 and D15
chain: Stage O6 on Opus with two Sonnet sub-agents, then Stage F8, a
Fable acceptance. Its record (the Stage O6 handoff,
`docs/handoffs/2026-11-10-then-stage-o6-write-price-scorer-contract.md`)
priced every cache write at the table's 5-minute figure, under the
formula of 2026-11-10. The same session had measured that this harness
writes 1-hour entries only (finding F7-1).

This record re-runs that decision under the formula of 2026-11-11 at
ttl `1h`, with every other input unchanged, and sets the 5-minute
figures beside it. It is the first record under that formula. The gate
recomputes Step A, the cost_coord block, the comparison table, the Step
B costs, the coordination row, the plan total and the draft margin from
the Inputs table below; the calculator input is
`docs/dispatch/2026-11-10-example-o6.json`.

## Session dispatch decision

Date: 2026-11-10, re-run the same day in Stage O6. Decided by:
claude-fable-5-2, effort xhigh, in Claude Code (desktop app).
Price table: `pricing/2026-11-10.json` (age 0 days; the anthropic
family fetched 2026-11-10).

### Inputs

| Input | Value | Source |
|---|---|---|
| Formula | 2026-11-11 | `SKILL.md` step 2 as revised in Stage O6 |
| Current model | claude-fable-5-2 | Reported by the harness |
| Target model | claude-opus-5-5 | Matrix row 3 (formula arithmetic and evaluation design), with two row 2 parts |
| Window W | 1,000,000 | Measured: usage tool |
| Compaction point K | 970,000 | Measured: 97 percent of W |
| Current context C0 | 372,602 | Measured: usage tool |
| Compacted already | no | Measured |
| Cache lifetime ttl | 1h | Measured: 1,526,208 of 1,526,208 write tokens in five transcripts of this harness are 1-hour writes (`SKILL.md` step 7) |
| Unrecorded context | none | The F7 note and the handoff carry it |
| Expected turns T | 120 | Estimate from O5's ledger row (101 calls) |
| Fresh input per turn F | 2,500 | Estimate from O5's row: 3,220 written a call, less output |
| Output per turn O | 1,500 | Estimate from O5's row: 1,371 a call |
| Fresh baseline B | 63,170 | Measured: usage tool total less Messages |
| Re-read set R | 85,000 | Characters divided by 4 |
| Handoff size H | 5,000 | The handoff, characters divided by 4 |
| Cache misses M | 0 | Unmeasured, so the default; under 1h a review pause under an hour does not miss |
| Rediscovery turns L | 0 | The unrecorded list is empty |
| Acceptance turns Ta | 60 | F8's estimate |
| Acceptance re-read Ra | 90,000 | F8's set |
| Coordinating turns To | 2 per piece | Estimate: this session starts O6 and F8, reads each note and checks each result |
| Coordinator | this session (claude-fable-5-2) | Only it can start F8 without the operator (step 3.2 rule 7) |
| Coordinator's fresh input per turn Fo | 2,000 | Estimate: short coordinating turns |
| Coordinator's output per turn Oo | 1,500 | Estimate: the same |
| Task type | row 3, with two row 2 parts | Split into four pieces in Step B |
| Design-heavy | yes | Formula and evaluation design |
| Irreversible or outward-facing steps | branch pushes under the standing yes; the merge, the install and the tag are F8's and the operator's | `docs/operator-preferences.json` |

### Step A: continue or hand off

The block below is the output of
`node scripts/dispatch.mjs --json docs/dispatch/2026-11-10-example-o6.json --today 2026-11-10`,
less its header lines and its Step B table (which is under Step B).

```
G       = F + O                   = 4,000
C_end   = C0 + T * G              = 852,602
crosses = C_end > K               = false   (K 970,000)
C_cont  = C0 + T * G / 2          = 612,602
C_fresh = B + R + T * G / 2       = 388,170

cost_continue on claude-fable-5-2
  T*C_cont*p_cr                   = 14.702   (cache reads)
  T*G*p_cw                        = 7.680   (new context written to cache)
  T*O*p_out                       = 7.200   (output)
  M*C_cont*(p_cw - p_cr)          = 0.000   (cache misses, M 0)
  penalty_compaction              = 0.000   (no compaction ahead)
  = 29.58 USD
cost_fresh on claude-opus-5-5
  H*p_out                         = 0.200   (the handoff, at claude-fable-5-2)
  (B+R)*p_cw                      = 1.185   (the fresh session's first read)
  T*C_fresh*p_cr                  = 9.316   (cache reads)
  T*G*p_cw                        = 3.840   (new context written to cache)
  T*O*p_out                       = 3.600   (output)
  M*C_fresh*(p_cw - p_cr)         = 0.000   (cache misses, M 0)
  penalty_loss                    = 0.000   (L 0 rediscovery turns)
  cost_coord                      = 0.384   (To 2 x 1 piece on claude-fable-5-2)
  = 18.53 USD
Prices per million: claude-fable-5-2 cache_read 0.20, cache_write_1h 16.00, output 40.00; claude-opus-5-5 cache_read 0.20, cache_write_1h 8.00, output 20.00

T* = n/a: the model changes; compare the totals

cost_split: brief by claude-fable-5-2, run on claude-sonnet-5-5, acceptance on claude-opus-5-5
  H*p_out                         = 0.200   (the brief)
  run, fresh session              = 8.971   (T 120, R 85,000)
  acceptance, fresh session       = 8.223   (Ta 60, Ra 90,000)
  cost_coord                      = 0.772   (To 2 x 2 pieces on claude-fable-5-2)
  = 18.17 USD

cost_coord: To 2 per piece on claude-fable-5-2, this session, from C0 + H = 377,602; Fo 2,000, Oo 1,500
  fresh, 1 piece, 2 turns         = 0.38 USD
  split, 2 pieces, 4 turns        = 0.77 USD
  Step B, 4 pieces, 8 turns       = 1.55 USD
  on claude-sonnet-5-5, a fresh session from B + H = 68,170: fresh 0.35, split 0.42, Step B 0.57 USD
```

By hand, the terms the lifetime moves: the continue side writes 120 x
4,000 = 480,000 tokens at 16e-6, 7.680 USD (4.800 at the 5-minute
10e-6); the fresh side's first read is 148,170 tokens at 8e-6, 1.185
(0.741 at 5e-6), and its growth 480,000 at 8e-6, 3.840 (2.400). Reads
and output do not move.

Draft verdict: fresh, by cost, margin 11.06 USD (59.7 percent of the
smaller).

The two formulas side by side, same inputs:

| Figure | Formula 2026-11-10 | Formula 2026-11-11 | What moved |
|---|---|---|---|
| cost_continue | 26.70 | 29.58 | The growth written at 16e-6 instead of 10e-6: plus 2.88 |
| cost_fresh | 16.60 | 18.53 | The first read and the growth at 8e-6 instead of 5e-6, and cost_coord's writes: plus 1.93 |
| cost_split | 15.96 | 18.17 | The split's writes and first reads on two fresh sessions: plus 2.21; it goes from 4.0 to 2.0 percent cheaper than fresh |

The verdict does not move: fresh by 60.9 percent becomes fresh by 59.7.
The lifetime moves the money, about 11 to 14 percent per figure here, and
it moves a verdict only near a line: scenario 24 of the evaluation is a
stage where it does.

### Step B: model, effort and concurrency

| Piece | Class | Model id | Effort | Oracle | Serial or parallel | Cost |
|---|---|---|---|---|---|---|
| O6 formula, text, integration | opus | claude-opus-5-5 | high | The gate's recompute of this example and scenario 24; the tests | from the start; merges after O6a and O6b | 17.94 USD (T 120, F 2,500, O 1,500, R 85,000) |
| O6a pricing rules | sonnet | claude-sonnet-5-5 | medium | The dated sweep test; the pricer on its fixture | parallel, sub-agent, own worktree | 2.05 USD (T 60, F 2,000, O 700, R 30,000, B 20,000) |
| O6b scorer contract | sonnet | claude-sonnet-5-5 | high | A perfect block clean on every scenario; one seeded fault per new field | parallel, sub-agent, own worktree | 2.76 USD (T 70, F 2,000, O 900, R 35,000, B 20,000) |
| F8 acceptance, rerun, release | fable | claude-fable-5-2 | xhigh | Hand derivation, seeded faults, the thresholds of the O6 handoff | after O6; the rerun inside it | 17.01 USD (T 60, F 4,000, O 2,000, R 90,000) |
| Coordination | fable | claude-fable-5-2 | xhigh | Each stage's quoted counts, run again on its branch | two wakes | To 2 x 4 pieces: 1.55 USD |

Pieces 39.76 USD, cost_coord 1.55 USD, plan 41.32 USD, plus about 6.7
for the evaluation's subjects. Under the 5-minute figure the record said
34.09, 1.39 and 35.48: the plan is 5.84 USD or 16.5 percent higher at
the lifetime this harness writes. The two Sonnet pieces are sub-agents,
which in this harness write 5-minute entries (`SKILL.md` step 7, measured
on these two after the fact): at that lifetime they are 1.74 and 2.37
USD, not 2.05 and 2.76, and the plan is 40.61 USD. The table above keeps
the record's one ttl, as the calculator does. Serial chain: O6 (90 to 120 minutes),
F8 (70 to 100). Coordinator: the F7 session, held to To 2 per piece
because its class is above the coordinator row.

Effort: O6b raised to high, because the result block is the
evaluation's interface. Split (step 2.1): a figure, not the plan; the
formula work is row 3 and its brief cannot make it row 1 or 2 work.

### Guardrails checked

1. Under 10 turns: no, T 120.
2. Design-heavy across a compaction: not binding; no compaction, crosses
   false.
3. Irreversible steps and their approval step: the branch pushes carry
   the standing yes; the merge, the install and the tag are named in the
   F8 handoff, the tag with the operator's yes.
4. Model chosen from the table, not memory: the opus, sonnet and fable
   rows of the table of 2026-11-10.
5. Each needed family's age from its fetched date, and nulls: anthropic
   fetched 2026-11-10, 0 days; the rows used are complete, with
   `cache_write_1h`.
6. Acceptance at matrix row 4's class and effort: F8 on Fable at xhigh
   in a fresh session.
7. Decision budget: the record is under 4,000 tokens; the decision took
   about 9 minutes.
8. Class and effort match the harness: Fable xhigh, as reported.

### Adversarial pass

The opposite verdict, argued: the session holds every finding, and a
handoff can lose the reason behind one; continuing avoids two re-reads,
and under 1h the re-reads cost more than they did.

Each input, the way it could be wrong:

- C0: measured.
- T: 120 is an estimate from one stage; it could double.
- F and O: estimates from O5's row at high effort.
- B and R: B measured; R by characters.
- M (review pauses): 0; under 1h only a pause over an hour misses.
- Task type: row 3; the two Sonnet parts have their own oracles.
- Prices: the anthropic family read the same day, twice, with the
  1-hour figures.
- ttl: measured in this harness; 5m in usage overage, which the second
  column shows.
- Unrecorded context: none.

Recomputed with the adverse values, from the calculator:

```
T 240:            cost_continue = 72.24 USD   cost_fresh = 46.80 USD   (fresh by 54.4 percent)
To 6 per piece:   cost_continue = 29.58 USD   cost_fresh = 19.30 USD   (fresh by 53.3 percent)
ttl 5m:           cost_continue = 26.70 USD   cost_fresh = 16.60 USD   (fresh by 60.9 percent)
```

The input the formula does not hold is the coordinator's cold wakes:
two wakes after more than an hour write 377,602 tokens again each, by
hand 2 x 377,602 x (16 - 0.2) x 1e-6 = 11.93 USD at the 1-hour figure
(7.40 at the 5-minute one). Recorded as a cost, not a reason to
continue.

Verdict holds: yes. No stated range or measurement brings the two sides
within 10 percent.

### Final verdict

Fresh, model claude-opus-5-5, effort high, with two Sonnet sub-agents
in parallel; then F8 on claude-fable-5-2 at xhigh. Coordinator: the F7
session, two wakes. Exact next action: commit the handoff, start the O6
session.

### Cost of deciding

| Row | Value | Source |
|---|---|---|
| Context at start | 372,602 | measured, usage tool |
| Context at end | about 392,000 | self-estimate |
| Input tokens read | about 6,000 | self-estimate: the calculator output, one memory file, the helper's lines |
| Output tokens | about 13,000 | self-estimate: the handoff and the JSON, characters divided by 4 |
| Wall clock | about 9 minutes | self-estimate from the shell clock |
| Priced | 6,000 x 16e-6 + 13,000 x 40e-6 = 0.62 USD | table `pricing/2026-11-10.json`, fable row, at the 1-hour write price; the record said 0.58 at the 5-minute one; self-estimate |

These rows are the deciding session's, copied from the O6 handoff and
re-priced at the 1-hour write. Re-running the decision for this example
cost the Stage O6 session five calculator runs and is not counted here.
