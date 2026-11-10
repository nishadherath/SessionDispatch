# Worked example: Tsunami, 2026-11-02, dispatching the rebalancing dashboard

On 2026-11-02 a Claude Code desktop session on the Tsunami project,
running Claude Fable 5.1 at high effort and compacted once, dispatched a
client dashboard stage as four pieces: A the content (Opus), B the build
(Sonnet), then C and D the acceptances (Fable and Opus). The session
stayed alive to start the pieces, verify them, merge and record. Its
record (Tsunami handoff 38, sections 10 and 13) priced that orchestration
by hand at 25 turns and 5.3 USD; the transcripts later measured 166 calls
and about 56 USD (Tsunami decision D-112, item 4).

This record re-runs that decision on 2026-11-10 under the formula of
2026-11-10, with the session's inputs unchanged and the coordinator
stated as it was on the day: this session, at To 30 per piece, the step
1.2 default. It is the first record with a coordinator. The gate
recomputes Step A, the cost_coord block, the comparison table and the
Step B costs from the Inputs table below; the calculator input is
`docs/dispatch/2026-11-10-example-tsunami.json`.

## Session dispatch decision

Date: 2026-11-02, re-run 2026-11-10. Decided by: claude-fable-5-1, effort
high, in Claude Code (desktop app). Price table: `pricing/2026-10-29.json`
(age 4 days on 2026-11-02).

### Inputs

| Input | Value | Source |
|---|---|---|
| Formula | 2026-11-10 | `SKILL.md` step 2 as revised in Stage O5 |
| Current model | claude-fable-5-1 | Reported by the harness |
| Target model | claude-opus-5-5 | Step A prices piece A, the content: matrix row 3; the other pieces are Step B's |
| Window W | 1,000,000 | Measured: usage tool |
| Compaction point K | 970,000 | Measured: 97 percent of W |
| Current context C0 | 145,115 | Measured: usage tool |
| Compacted already | yes | Measured: the session was summarised once |
| Unrecorded context | none | Every fact the stage needs is in the files handoff 38 names |
| Expected turns T | 50 | Estimate: piece A's figure in handoff 38 section 10 |
| Fresh input per turn F | 4,000 | Estimate: the build re-reads its own page |
| Output per turn O | 3,000 | Step 1.2, writing-heavy, at high effort |
| Fresh baseline B | 88,186 | Measured: usage tool total less Messages |
| Re-read set R | 52,000 | Piece A's set, `wc -c` divided by 4 |
| Handoff size H | 6,500 | Handoff 38, characters divided by 4 |
| Cache misses M | 0 | Unmeasured, so the default; no review pause inside a session |
| Rediscovery turns L | 0 | The unrecorded list is empty |
| Acceptance turns Ta | 30 | Piece C's estimate |
| Acceptance re-read Ra | 45,000 | Piece C's set |
| Coordinating turns To | 30 per piece | Step 1.2 default; this session started, verified, merged and recorded every piece |
| Coordinator | claude-fable-5-1 (this session) | As on the day; step 3.2 rule 7 did not exist |
| Task type | mixed: rows 3 (the narrative), 2 (the exporter, page and test), 4 (acceptances) | Split into four pieces in Step B |
| Design-heavy | yes | The information architecture and the register |
| Irreversible or outward-facing steps | none | The operator pushes and shares the page |

### Step A: continue or hand off

The block below is the output of
`node scripts/dispatch.mjs --json docs/dispatch/2026-11-10-example-tsunami.json --table pricing/2026-10-29.json --today 2026-11-02`,
less its header lines and its Step B table (which is under Step B).

```
G       = F + O                   = 7,000
C_end   = C0 + T * G              = 495,115
crosses = C_end > K               = false   (K 970,000)
C_cont  = C0 + T * G / 2          = 320,115
C_fresh = B + R + T * G / 2       = 315,186

cost_continue on claude-fable-5-1
  T*C_cont*p_cr                   = 4.001   (cache reads)
  T*G*p_cw                        = 4.375   (new context written to cache)
  T*O*p_out                       = 7.500   (output)
  M*C_cont*(p_cw - p_cr)          = 0.000   (cache misses, M 0)
  penalty_compaction              = 0.000   (no compaction ahead)
  = 15.88 USD
cost_fresh on claude-opus-5-5
  H*p_out                         = 0.325   (the handoff, at claude-fable-5-1)
  (B+R)*p_cw                      = 0.701   (the fresh session's first read)
  T*C_fresh*p_cr                  = 3.152   (cache reads)
  T*G*p_cw                        = 1.750   (new context written to cache)
  T*O*p_out                       = 3.000   (output)
  M*C_fresh*(p_cw - p_cr)         = 0.000   (cache misses, M 0)
  penalty_loss                    = 0.000   (L 0 rediscovery turns)
  cost_coord                      = 8.562   (To 30 x 1 piece on claude-fable-5-1)
  = 17.49 USD
Prices per million: claude-fable-5-1 cache_read 0.25, cache_write 12.50, output 50.00; claude-opus-5-5 cache_read 0.20, cache_write 5.00, output 20.00

T* = n/a: the model changes; compare the totals

cost_split: brief by claude-fable-5-1, run on claude-sonnet-5-5, acceptance on claude-opus-5-5
  H*p_out                         = 0.325   (the brief)
  run, fresh session              = 4.301   (T 50, R 52,000)
  acceptance, fresh session       = 4.945   (Ta 30, Ra 45,000)
  cost_coord                      = 18.474   (To 30 x 2 pieces on claude-fable-5-1)
  = 28.05 USD

cost_coord: To 30 per piece on claude-fable-5-1, this session, from C0 + H = 151,615; Fo 3,000, Oo 3,000
  fresh, 1 piece, 30 turns        = 8.56 USD
  split, 2 pieces, 60 turns       = 18.47 USD
  Step B, 4 pieces, 120 turns     = 42.35 USD
  on claude-sonnet-5-5, a fresh session from B + H = 94,686: fresh 2.14, split 4.58, Step B 11.09 USD
```

Draft verdict: continue, by cost, margin 1.61 USD (10.2 percent of the
smaller). Guardrail 2 overrides it below: the stage is design-heavy and
the session has compacted.

The two formulas side by side, same inputs:

| Figure | Formula 2026-10-29 | Formula 2026-11-10 | What moved |
|---|---|---|---|
| cost_continue | 15.88 | 15.88 | Nothing: the coordinator never sits on the continue side |
| cost_fresh | 8.93 | 17.49 | cost_coord, 30 Fable turns at 0.285 USD a turn, 6.75 of the 8.56 output and writes |
| cost_split | 9.57 | 28.05 | cost_coord for two pieces, 18.47; the split goes from 7 percent dearer than fresh to 60 percent |

Under the formula of 2026-10-29 the draft was fresh by 77.8 percent. A
Fable coordinator at the default turn count turns it into continue by
10.2 percent: the session that stays to coordinate costs about as much
as the piece it hands off.

### Step B: model, effort and concurrency

| Piece | Class | Model id | Effort | Oracle | Serial or parallel | Cost |
|---|---|---|---|---|---|---|
| A content | opus | claude-opus-5-5 | high | The contract test and the Source cell rule after the merge; acceptance C | parallel with B | 8.60 USD (T 50, F 4,000, O 3,000, R 52,000) |
| B build | sonnet | claude-sonnet-5-5 | high | The dashboard test; headless Chrome, 0 blank tiles; the print PDF | parallel with A | 9.85 USD (T 100, F 4,000, O 3,000, R 40,000) |
| C content acceptance | fable | claude-fable-5-1 | high | A decision entry: pass or the defect list | parallel with D, after the merge | 9.08 USD (T 30, F 5,000, O 2,000, R 45,000) |
| D page acceptance | opus | claude-opus-5-5 | high | The test, the browser, the print | parallel with C, after the merge | 5.83 USD (T 40, F 5,000, O 2,000, R 43,000) |
| Coordination | fable | claude-fable-5-1 | high | Each piece's oracle, run on its branch before the merge | throughout | To 30 x 4 pieces: 42.35 USD |

Pieces 33.36 USD, cost_coord 42.35 USD, plan 75.71 USD. Coordination is
four pieces, not five: the merge and re-export are coordinating turns,
not a piece. Serial chain: A or B (2.5 hours), merge (20 minutes), C or D
(1 hour), close (20 minutes), about 4.5 hours. Operator review about 45
minutes.

Effort raised: B to high, because the previous medium build of a client
page needed eleven fixes in acceptance. Split (step 2.1): an option for B
and taken; for A a figure only, since the register has no oracle short
of the acceptance.

Projected beside measured (Tsunami D-112 item 4, from the transcripts
priced with the same table):

| Row | Handoff 38, by hand | This record | Measured |
|---|---|---|---|
| Pieces A to D | 33.4 | 33.36 | 25.49 (0.76 of this record) |
| Coordination, Fable | 5.3 (T 25) | 42.35 (To 30 x 4); 62.24 at To 40 | about 56 (166 calls) |
| Stage | 38.7 | 75.71 | about 82 |

The term brings the coordinator from a factor of about 10 under the
measurement to 0.76 of it at To 30 and 1.11 at To 40. The fit is partly
circular (the default comes from this stage) and the per-call figure
differs: the formula reads a context growing to 871,615 tokens, the
measured session averaged 299K because it compacted once. The pieces
came in under the formula, as on the five Tsunami stages before.

### Guardrails checked

1. Under 10 turns: no, T 50 for piece A and 30 or more for every piece.
2. Design-heavy across a compaction: yes, the session has compacted, so
   fresh whatever the draft says. Binding.
3. Irreversible steps and their approval step: none in the sessions; the
   operator pushes and shares.
4. Model chosen from the table, not memory: the fable, opus and sonnet
   rows of the table of 2026-10-29.
5. Table age and nulls: 4 days on 2026-11-02; the rows used are complete.
6. Acceptance at matrix row 4's class and effort: Fable high over the
   Opus content, Opus high over the Sonnet build, fresh sessions.
7. Decision budget: the deciding session took about 25 minutes, over the
   10 minute cap; the overrun was recorded and step 5 cut. This re-run
   restores step 5 to show the term under stress.
8. Class and effort match the harness: Fable high, as reported.

### Adversarial pass

The opposite verdict, argued: the session holds the design, the register
and the skeleton; 30 turns of coordination are a default with one data
point; and with a cheaper coordinator the arithmetic agrees with the
guardrail, so the draft's continue is an artefact of who coordinates, not
of the work.

Each input, the way it could be wrong:

- C0: measured; a second compaction inside coordination would lower the
  reads the formula assumes, as the measurement shows.
- T: piece A's 50 is an estimate; A took 42 calls.
- F and O: estimates at high effort; the pieces came in at 0.76.
- B and R: B measured; R by characters.
- M: 0; the measured cache writes were 2.6 times the growth, about one
  or two whole-context rewrites the formula does not price.
- To: 30 is the default; the measurement is about 40 per piece, an upper
  bound that included other work.
- Coordinator: step 3.2 rule 7 names a Sonnet session the operator starts.
- Prices: 4 days old; no long-context tier on these rows.

Recomputed with the adverse values, from the calculator:

```
To 40:                  cost_continue = 15.88 USD   cost_fresh = 20.64 USD   (continue by 30.0 percent)
coordinator sonnet:     cost_continue = 15.88 USD   cost_fresh = 11.07 USD   (fresh by 43.4 percent)
To 29:                  cost_continue = 15.88 USD   cost_fresh = 17.18 USD   (inside the band, fresh by quality)
```

Verdict holds: yes. The final verdict rests on guardrail 2, which no
input here moves. The draft is fragile: it enters the band at To 29 or
less, and a Sonnet coordinator turns it into fresh by cost.

### Final verdict

Fresh, four pieces as in Step B, A and B parallel, then C and D parallel
after the merge. Coordinator: not this session (step 3.2 rule 7); this
session writes the briefs, proposes the four sessions and ends, and the
operator or a Sonnet session the operator starts coordinates at To 30,
11.09 USD instead of 42.35. Plan at a Sonnet coordinator: 33.36 + 11.09 =
44.45 USD. Exact next action: commit the skeleton and the handoff,
propose pieces A and B, end this session.

### Cost of deciding

| Row | Value | Source |
|---|---|---|
| Context at start | 145,115 | measured, usage tool |
| Context at end | about 200,000 | self-estimate |
| Input tokens read | about 55,000 | self-estimate: the price table, the templates, status sections, the exporter, the test head |
| Output tokens | about 12,000 | self-estimate: the skeleton, handoff 38, the record |
| Wall clock | about 25 minutes | self-estimate from the shell clock |
| Priced | 55,000 x 12.5e-6 + 12,000 x 50e-6 = 1.29 USD | table `pricing/2026-10-29.json`, fable row; self-estimate |

These rows are the deciding session's, copied from Tsunami handoff 38.
Re-running the decision for this example cost the Stage O5 session seven
calculator runs and is not counted here.
