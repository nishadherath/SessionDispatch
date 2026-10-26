## Session dispatch decision

Date: YYYY-MM-DD. Decided by: <model id>, effort <level>, in <harness>.
Price table: `pricing/<date>.json` (age N days).

### Inputs

| Input | Value | Source (measured or estimated, and how) |
|---|---|---|
| Window W | | |
| Compaction point K | | |
| Current context C0 | | |
| Compacted already | yes or no | |
| Unrecorded context | list or "none" | |
| Expected turns T | | |
| Fresh input per turn F | | |
| Output per turn O | | |
| Fresh baseline B | | |
| Re-read set R | list with sizes, total | |
| Handoff size H | | |
| Task type | row of the matrix | |
| Design-heavy | yes or no | |
| Irreversible or outward-facing steps | list or "none" | |

### Step A: continue or hand off

```
C_end   = C0 + T * F            =
crosses = C_end > K             =
C_cont  = C0 + T * F / 2        =
C_fresh = B + R + T * F / 2     =

cost_continue = T*C_cont*p_cr + T*F*p_cw + T*O*p_out + penalty_compaction
              =
cost_fresh    = H*p_out + (B+R)*p_cw + T*C_fresh*p_cr + T*F*p_cw + T*O*p_out + penalty_loss
              =
```

Prices used (per million): input, output, cache_read, cache_write for
<model id>.

Draft verdict: <continue | fresh>, by <cost | quality>, margin <amount
and percent of the smaller>.

### Step B: model, effort and concurrency

| Piece | Class | Model id (from table) | Effort | Oracle | Serial or parallel | Cost |
|---|---|---|---|---|---|---|
| | | | | | | |

Serial chain and its wall clock: <>. Operator review time: <>.

Effort raised or lowered because: <rule from step 3.1, or "no change">.

### Guardrails checked

1. Under 10 turns: <no, T = >
2. Design-heavy across a compaction: <>
3. Irreversible steps and their approval step: <>
4. Model chosen from the table, not memory: <>
5. Table age and nulls: <>
6. Acceptance one class above the author: <>
7. Decision budget: <>
8. Class and effort match the harness: <>

### Adversarial pass

The opposite verdict, argued: <two to five sentences>.

Each input, the way it could be wrong:

- C0:
- T:
- F and O:
- B and R:
- Task type:
- Prices:
- Unrecorded context:

Recomputed with the adverse value that moves the result most (<which>):

```
cost_continue =
cost_fresh    =
```

Verdict holds: <yes | no, changed because <input>>.

### Final verdict

<continue | fresh>, model <id>, effort <level>, pieces <n> (<serial |
parallel> as above). Exact next action: <>.

### Cost of deciding

| Row | Value | Source |
|---|---|---|
| Context at start | | |
| Context at end | | |
| Input tokens read | | |
| Output tokens | | |
| Wall clock | | |
| Priced | | table `pricing/<date>.json` |
