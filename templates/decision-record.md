## Session dispatch decision

Date: YYYY-MM-DD. Decided by: <model id>, effort <level>, in <harness>.
Price table: `pricing/<date>.json` (age N days).

### Inputs

| Input | Value | Source (measured or estimated, and how) |
|---|---|---|
| Formula | 2026-10-29 | `SKILL.md` step 2 as of that date |
| Current model | | The harness's report of this session's model |
| Target model | | Matrix row of step 3.1, then the table's model for that class; null with the reason when the table cannot give one (step 1.4.4) |
| Window W | | |
| Compaction point K | | |
| Current context C0 | | |
| Compacted already | yes or no | |
| Unrecorded context | list or "none" | |
| Expected turns T | | |
| Fresh input per turn F | | |
| Output per turn O | | Effort the figure assumes |
| Fresh baseline B | | |
| Re-read set R | list with sizes, total | |
| Handoff size H | | |
| Cache misses M | 0 unless measured | Review pauses expected, cache lifetime the harness states |
| Rediscovery turns L | 0 when the unrecorded list is empty | |
| Acceptance turns Ta | split only | |
| Acceptance re-read Ra | split only | |
| Task type | row of the matrix | |
| Design-heavy | yes or no | |
| Irreversible or outward-facing steps | list or "none" | |

### Step A: continue or hand off

Paste the block `node scripts/dispatch.mjs` prints, or fill this by hand:

```
G       = F + O                 =
C_end   = C0 + T * G            =
crosses = C_end > K             =
C_cont  = C0 + T * G / 2        =
C_fresh = B + R + T * G / 2     =

cost_continue = T*C_cont*p_cr + T*G*p_cw + T*O*p_out + M*C_cont*(p_cw - p_cr) + penalty_compaction
              =      USD
cost_fresh    = H*p_out[current] + (B+R)*p_cw + T*C_fresh*p_cr + T*G*p_cw + T*O*p_out
                + M*C_fresh*(p_cw - p_cr) + penalty_loss
              =      USD
T* = (H*p_out + (B+R)*p_cw) / ((C0 - B - R) * p_cr) = <n> turns, or n/a: the model changes
cost_split    = H*p_out[current] + run at sonnet + acceptance at opus (Ta, Ra)
              =      USD, or not computed: the target is below opus
```

Prices used (per million): input, output, cache_read, cache_write for
<current model id> and <target model id>.

Draft verdict: <continue | fresh>, by <class | cost | quality |
break-even>, margin <amount and percent of the smaller>.

### Step B: model, effort and concurrency

| Piece | Class | Model id (from table) | Effort | Oracle | Serial or parallel | Cost |
|---|---|---|---|---|---|---|
| | | | | | | |

Serial chain and its wall clock: <>. Operator review time: <>.

Effort raised or lowered because: <rule from step 3.1, or "no change">.

Split (step 2.1): <an option or not, and why>.

### Guardrails checked

1. Under 10 turns: <no, T = >
2. Design-heavy across a compaction: <>
3. Irreversible steps and their approval step: <>
4. Model chosen from the table, not memory: <>
5. Table age and nulls: <>
6. Acceptance at matrix row 4's class and effort: <>
7. Decision budget: <record size in tokens against 4,000; minutes against 10>
8. Class and effort match the harness: <>

### Adversarial pass

The opposite verdict, argued: <two to five sentences>.

Each input, the way it could be wrong:

- C0:
- T:
- F and O (and the effort O assumes):
- B and R:
- M (review pauses):
- Task type:
- Prices:
- Unrecorded context:

Recomputed with the adverse value that moves the result most (<which>):

```
cost_continue =
cost_fresh    =
```

Verdict holds: <yes | yes, fragile: flips at <input> of <n> | no, changed
because <input>, a value inside its stated range or a measurement the
draft ignored>.

### Final verdict

<continue | fresh | split>, model <id>, effort <level>, pieces <n>
(<serial | parallel> as above). Exact next action: <>.

### Cost of deciding

| Row | Value | Source (measured, naming the harness report, or self-estimate) |
|---|---|---|
| Context at start | | |
| Context at end | | |
| Input tokens read | | |
| Output tokens | | |
| Wall clock | | |
| Priced | | table `pricing/<date>.json`; measured or self-estimate as the rows above |
