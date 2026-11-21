---
stage: "Public repository scrub: scan, itemised decisions, history rewrite"
model: claude-fable-5-2
effort: high
status: done
created: 2026-11-21
from: "the operator's request of 2026-11-21 in the scan session"
---

# Public repository scrub

## Goal
The repository became public. The operator asked for a scan for information that should not be there, and for each removal to be approved item by item. Done when the approved items are absent from every commit and tag on `origin`, the gate is green, and the items kept are recorded as the operator's choice.

## Decisions already made
All by the operator on 2026-11-21, one question each. Do not reopen these.

- Removed: the Windows account name inside user-profile paths, replaced by `<user>` (item 1).
- Removed: the sentence naming the connectors on the operator's claude.ai account, in seven `cli-result.json` files (item 2).
- Removed: the local projects folder in paths, replaced by `<projects>`; the project names stay (item 4, "Remove folder paths only").
- Removed: the time zone offset, the Node and Windows version details, and the name of the credential store (item 6, "Remove all three").
- Kept: session identifiers (item 3), the verbatim standing instructions and quoted replies (item 5), the cost figures (item 7), the operator's name in `LICENSE`, commits and tags (item 8), the sixteen persona files under the MIT licence (item 9).
- History: rewritten ("Rewrite history"), because a commit on top would leave the old text in 117 public commits.

## Files and links that matter
- `.git/pre-rewrite-2026-11-21.bundle` and the local refs under `refs/pre-rewrite/`: the history as it was. Local only. Never push them.
- The local branch `claude/kind-curie-d09472` (an app worktree) still holds the old history. Never push it.
- `docs/status.md`: decisions D19 and D20.

## Verified facts
- Scan of 2026-11-21 over 1,394 tracked files and every patch of 117 commits: no credential, key, token, IP address or email address other than the noreply addresses (`git grep` and `grep` over `git log --all -p`, 16 patterns).
- The remote held `main`, four tags, no forks, stars, issues, pull requests or releases (`git ls-remote origin`, the public REST API, 2026-11-21).
- The rewrite: 117 commits and 4 annotated tags rebuilt by a script on git plumbing; 488 of 1,647 distinct blobs changed; 363 files differ at the tip. `SKILL.md`, the templates, the price tables and the adapters are byte-identical.
- After the rewrite, twelve search patterns for the removed text give 0 matches over every patch and tag message of the new history. Every commit and tag date is the same instant written in UTC.
- Commit ids changed. 82 distinct cited ids (1,588 citations in files and messages) were mapped to the new ids in the same pass; 0 old ids remain at the tip.
- Gate on the new tree: `node scripts/check.mjs`, 138 files read, 0 findings, exit 0 (2026-11-21).
- `node scripts/install.mjs --harness all --check`: 4 copies, 12 files behind (two examples and `scripts/pricing-new.mjs` in each).

## Work completed
- The scan and its report, nine items put to the operator one at a time.
- The rewritten history on `main` and the tags `v1.0.0` to `v1.2.1`. The tip before this handoff's commit is `e779948`.
- The changelog line, the status update and this handoff, in the commit that holds this file.
- The force push of `main` and the four tags to `origin`, on the operator's answer "Rewrite history" of 2026-11-21. The stage report names the result.

## Unresolved questions
- D19, the standing push approval: decided A by the operator on 2026-11-21 ("Keep the standing approval"), against the session's recommendation of B. The scope in `docs/operator-preferences.json` says "public". Closed.
- D20, commit dates: decided A by the operator on 2026-11-21 ("Yes, add rule"). `AGENTS.md` non-negotiable 9 holds the rule. Closed.
- One `cli-result.json` (run `15-null-price.haiku.calculator`, 2026-11-01) says four connectors need authorisation and names none. It was outside item 2 and is unchanged. Operator.
- The old commits on GitHub: closed on 2026-11-21. The operator renamed the first repository and made it private, and a new public repository of the same name holds only the rewritten history (`docs/status.md`, fiftieth update).
- The installed copies are 12 files behind. `node scripts/install.mjs --harness all` fixes it. Operator, or the next session.
- Residual inference: handoff file names use the local date and the text says so, so a reader can still tell that local time is ahead of UTC. The offset itself is gone.

## Exact next action
None is scheduled. The next session reads `docs/status.md` and decisions D19 and D20.

## Cost projection
`claude-fable-5-2`, API list price, table `pricing/2026-11-20.json`, 1-hour cache writes. The scan: 25 turns from a context of 120,180 tokens, 5.57 USD. The rewrite: 35 turns from 154,690 tokens, 6.25 USD. Both by `node scripts/dispatch.mjs`; the turn counts are estimates.

| Piece | Projected USD | T projected | Calls measured | Measured USD | Source |
|---|---|---|---|---|---|
| scan and decisions | 5.57 | 25 | 39 (both pieces) | 7.164 (both pieces) | `node scripts/session-cost.mjs` on transcript `41c83aca`, priced before the closing commit and the push |
| history rewrite | 6.25 | 35 | counted above | counted above | the same run |

## Time projection
Projected 45 to 120 minutes for a Fable stage (protocol section 7). Measured: about 90 minutes of wall clock, of which the rewrite script ran for 20.5 minutes and the tests for about 10. Operator review: ten answers, a few minutes.

## Session dispatch decision

Date: 2026-11-21. Decided by: claude-fable-5-2, effort high, in Claude Code (desktop app). Price table: `pricing/2026-11-20.json` (Anthropic figures fetched 2026-11-10, 11 days of 14).

### Inputs

| Input | Value | Source (measured or estimated, and how) |
|---|---|---|
| Formula | 2026-11-11 | `SKILL.md` step 2 |
| Current model | claude-fable-5-2 | The harness |
| Target model | claude-fable-5-2 | Matrix row 5: an audit of the whole project, then an outward step |
| Window W | 1,000,000 | Measured: usage tool |
| Compaction point K | 970,000 | Measured: 97 percent of W |
| Current context C0 | 120,180 for the scan; 154,690 for the rewrite | Measured: usage tool |
| Compacted already | no | Measured |
| Cache lifetime ttl | 1h | The harness default of step 7; no usage overage |
| Unrecorded context | none | The findings went to the operator in the reply |
| Expected turns T | 25 for the scan; 35 for the rewrite | Estimates |
| Fresh input per turn F | 6,000 for the scan; 3,000 for the rewrite | Estimates: step 1.2, read-heavy and default |
| Output per turn O | 1,500 | Step 1.2 default, at high effort |
| Fresh baseline B | 65,082 | Measured: total less the Messages category |
| Re-read set R | 12,000 | Estimate: `AGENTS.md`, the protocol, a handoff, the preferences file |
| Handoff size H | 2,500 | Step 1.2 default |
| Cache misses M | 0 | Default; unmeasured |
| Rediscovery turns L | 0 | The unrecorded list is empty |
| Coordinating turns To | 0 | Nobody coordinates: one session does the work |
| Coordinator | this session | |
| Task type | row 5 | |
| Model note | `models/claude-fable-5-2.md` exists; its effort cell agrees with the session's `high` | Step 1.4.6 |
| Design-heavy | no | |
| Irreversible or outward-facing steps | a force push of `main` and four tags | The operator's answer to the history question is the approval step |

### Step A: continue or hand off
Scan: cost_continue 5.57 USD, cost_fresh 6.69 USD, T* 154.7 turns. Rewrite: cost_continue 6.25 USD, cost_fresh 7.04 USD, T* 85.9 turns. Draft verdict for each: continue, by break-even, T under T*; margins 1.12 USD (20.1 percent of the smaller) and 0.79 USD (12.6 percent).

### Step B: model, effort and concurrency

| Piece | Class | Model id (from table) | Effort | Oracle | Serial or parallel | Cost |
|---|---|---|---|---|---|---|
| scan and decisions | fable | claude-fable-5-2 | high | the pattern searches over files and history | serial | 5.57 USD |
| history rewrite | fable | claude-fable-5-2 | high | 0 matches over the new history; the gate | serial | 6.25 USD |

### Guardrails checked
1 holds (no handoff). 2 does not apply. 3: the force push is named and carries the operator's approval. 4 and 5: the model and prices are the table's, within 14 days. 6 does not apply. 7: record under 4,000 tokens. 8: model and effort read from the harness.

### Adversarial pass
The case for fresh: the session read the protocol, the skill twice and many search results, so each later turn re-reads a larger context than a fresh session would. The inputs that could be wrong: T (the rewrite took more turns than 35 because the script ran 20 minutes and was watched), F (an estimate), R (a fresh session would also need the scan's findings, which raises R and favours continue). Recompute with T doubled to 70 for the rewrite: still under T* 85.9. The verdict holds. It is close for the rewrite: fragile at T of 86 or more.

### Final verdict
Continue in this session, same model, same effort, for both pieces.

### Cost of deciding

| Row | Value | Source (measured, naming the harness report, or self-estimate) |
|---|---|---|
| Context at start | 120,180 | Measured: usage tool |
| Context at end | 154,690 at the end of the scan | Measured: usage tool; this covers the scan, not the decision alone |
| Input tokens read | about 9,000 for the decision | Self-estimate: the calculator's output twice and the template headings |
| Output tokens | about 1,600 | Self-estimate: this record, characters divided by 4 |
| Wall clock | under 5 minutes | Self-estimate |
| Priced | about 0.21 USD | table `pricing/2026-11-20.json`; self-estimate from the two rows above |
