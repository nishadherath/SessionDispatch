# Worked example: fork_graft, 2026-10-27, dispatching Stage 26

On 2026-10-27 a Claude Code desktop session on `D:\Code\Claude\fork_graft`,
running Claude Fable 5.1 at high effort, had been compacted once and
stood at about 100k tokens of context. The next stage was Stage 26: a
whole-project assessment answering the operator's six-question brief,
about 60 turns of reading, measuring and writing. The session chose to
write a handoff and start a fresh session rather than continue. This
record re-runs that choice through the skill's procedure, with the
inputs the session stated and the defaults marked where it stated none.
The decision this record documents was made before the skill existed;
figures marked "reconstructed" were not written down at the time.

## Session dispatch decision

Date: 2026-10-27. Decided by: claude-fable-5-1, effort high, in Claude
Code (desktop app). Price table: `pricing/2026-10-18.json` (age 9 days).

### Inputs

| Input | Value | Source |
|---|---|---|
| Window W | 200,000 | Reconstructed: the session did not record it. The adversarial pass recomputes with 1,000,000, which the sibling session that wrote this example measured on the same day. |
| Compaction point K | 190,000 | Assumed 0.95 W, stated as an assumption. |
| Current context C0 | 100,000 | Stated by the session after its compaction ("roughly 100k"). |
| Compacted already | yes | Stated by the session. |
| Unrecorded context | none | The session wrote its verified facts (upstream head, diff sizes, startup timings, graph counts) into the Stage 26 handoff before deciding. |
| Expected turns T | 60 | The protocol's standard stage length for an assessment. |
| Fresh input per turn F | 3,000 | Protocol default. |
| Output per turn O | 1,500 | Protocol default. |
| Fresh baseline B | 25,000 | Skill default. The sibling session measured 85,000 in the desktop app with many MCP tools loaded; the adversarial pass uses that. |
| Re-read set R | 30,000 | Estimated: the handoff (about 1k), the previous assessment (about 12k), three prior handoffs (about 6k), AGENTS.md and the protocol (about 9k), a retrieval baseline (about 2k). |
| Handoff size H | 2,500 | Skill default; the handoff written was 60 lines. |
| Task type | whole-project assessment and roadmap | Matrix row 5. |
| Design-heavy | yes | An assessment chooses what to recommend and prices a roadmap. |
| Irreversible or outward-facing steps | one push to origin at the end | Approval: the operator's standing instruction to push after a green gate; the push is by the same top-class session, not delegated. |

### Step A: continue or hand off

Prices for claude-fable-5-1, per million: input 10.00, output 50.00,
cache_read 0.25, cache_write 12.50.

```
C_end   = 100,000 + 60 * 3,000          = 280,000
crosses = 280,000 > 190,000             = true
C_cont  = 100,000 + 180,000 / 2         = 190,000
C_fresh = 25,000 + 30,000 + 180,000 / 2 = 145,000

cost_continue = 60*190,000*0.25e-6  = 2.850   (cache reads)
              + 60*3,000*12.5e-6    = 2.250   (fresh input written to cache)
              + 60*1,500*50e-6      = 4.500   (output)
              + penalty_compaction  = 0.500   (30,000*12.5e-6 + 2,500*50e-6)
              = 10.10 USD

cost_fresh    = 2,500*50e-6         = 0.125   (writing the handoff)
              + 55,000*12.5e-6      = 0.688   (the fresh session's first read)
              + 60*145,000*0.25e-6  = 2.175   (cache reads)
              + 60*3,000*12.5e-6    = 2.250
              + 60*1,500*50e-6      = 4.500
              + penalty_loss        = 0       (nothing unrecorded)
              = 9.74 USD
```

Draft verdict: fresh, by quality, margin 0.36 USD (3.7 percent of the
smaller, inside the 10 percent band). The quality terms are both against
continuing: the session had compacted once, and `crosses` is true.
Guardrail 2 reaches the same verdict on its own: a design-heavy stage
does not continue across a compaction.

The per-turn cache-read difference is 45,000 tokens here (190,000
against 145,000). The deciding session quoted about 80,000; the gap is
its smaller baseline and its expectation that the compacted context
would keep growing faster than F. Either figure leaves the verdict
where it is.

### Step B: model, effort and concurrency

| Piece | Class | Model id | Effort | Oracle | Serial or parallel | Cost |
|---|---|---|---|---|---|---|
| Stage 26 assessment and roadmap | Fable | claude-fable-5-1 | high | `docs/assessment-2026-10-27.md` answers the six questions with a command beside each number; gate green under decision D13 | serial (one gate at a time on that machine) | 9.74 USD as above, quoted as 8 to 16 |
| Acceptance of the assessment | Fable (author is top class) | claude-fable-5-1 | xhigh | The acceptance note lists each claim checked with its command | serial, after the stage | about 2 USD for 15 turns at 100k average |

Serial chain: handoff write and commit 10 minutes; fresh session reads
5 minutes; assessment about 90 minutes; one gate 25 to 41 minutes
running in the background while writing continues; commit and push 10
minutes. Operator review about 30 minutes, separately.

Effort: no change. High is the matrix default for the row; xhigh only
for acceptance.

### Guardrails checked

1. Under 10 turns: no, T = 60.
2. Design-heavy across a compaction: yes on both counts, so fresh.
3. Irreversible steps: one push, by the top class, after a green gate;
   the standing instruction is the approval.
4. Model from the table: claude-fable-5-1 is the table's fable row.
5. Table age 9 days, under 14; no null used.
6. Acceptance one class above: author is top class, so acceptance is
   top class at xhigh in a fresh session.
7. Decision budget: see the cost table; under 8,000 tokens.
8. Class and effort match: the new session's handoff front matter says
   `claude-fable-5-1`, `high`; the new session checked itself and
   matched.

### Adversarial pass

The opposite verdict, argued: continuing avoids writing a handoff,
avoids the operator's click to start a session, and keeps the 60-tool-
call history of measurements in context where the assessment can cite
it. With a 1,000,000-token window the stage never crosses the
compaction point, so the penalty vanishes and continuing is the cheaper
side on paper. The measurements were already in the handoff, so the
fresh session loses nothing it cannot read back.

Each input, the way it could be wrong:

- C0: stated, not read from the usage tool; could be 30 percent higher
  after a compaction that keeps tool definitions.
- T: an assessment that also reruns a 27-minute gate baseline could
  reach 80 turns.
- F and O: an assessment reads more than 3,000 tokens a turn; 5,000 is
  closer, which raises both sides equally.
- B and R: B measured at 85,000 in the desktop app, not 25,000; R could
  be 45,000 if the fresh session reads the retrieval question set.
- Task type: not in doubt; an assessment is the matrix's top row.
- Prices: table 9 days old; Fable has no long-context tier.
- Unrecorded context: the session's reading of 115 open upstream pull
  requests was summarised to one count in the handoff; the detail is
  lost either way, since it was not written.

Recomputed with the inputs that move the result most (W = 1,000,000 so
`crosses` is false, and B = 85,000):

```
cost_continue = 2.850 + 2.250 + 4.500 + 0     = 9.60 USD
C_fresh       = 85,000 + 30,000 + 90,000      = 205,000
cost_fresh    = 0.125 + 115,000*12.5e-6 (1.438)
              + 60*205,000*0.25e-6 (3.075) + 2.250 + 4.500
              = 11.39 USD
```

Under the adverse values continuing is cheaper by 1.79 USD (18.6
percent), past the 10 percent band, so cost would say continue. The
verdict still does not change, because guardrail 2 is not arithmetic:
the session had already compacted once and the stage is design-heavy.
The input that would change the verdict is the task type: had the stage
been mechanical (say, applying a reviewed list of changelog edits), the
guardrail would not apply and the adverse arithmetic would carry.

Verdict holds: yes, on guardrail 2; the cost case is sensitive to B and
W and the record says so.

### Final verdict

Fresh session, claude-fable-5-1, effort high, one piece, serial, with a
top-class xhigh acceptance after it. Exact next action: write
`docs/handoffs/2026-10-27-stage-26-assessment.md`, commit, start the
session with that handoff as its brief.

### Cost of deciding

| Row | Value | Source |
|---|---|---|
| Context at start | about 100,000 | stated by the deciding session |
| Context at end | about 104,000 | estimate: two turns of deliberation |
| Input tokens read | about 200,000 cache reads (two turns at 100k) | estimate |
| Output tokens | about 4,000 | estimate from the two messages' length divided by 4 |
| Wall clock | about 8 minutes | estimate |
| Priced | 0.05 + 0.20 = 0.25 USD | table `pricing/2026-10-18.json`, fable row; cache reads at 0.25, output at 50 |

The deciding session did not measure its own cost; this table is a
reconstruction, marked as such. The sibling session that built this
skill recorded its own measured figures in its handoff.
