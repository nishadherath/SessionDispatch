---
stage: "Stage S1: install portability, seed command, script tests"
model: claude-sonnet-5-5
effort: medium
status: done
created: 2026-10-29
from: "Session local_af23607d (Fable 5.1): Stage 0b dispatched S1; this session is local_e4c1f871"
---

# Stage S1: install portability, seed command, script tests

## Goal
Installed copies can run their own price refresh; `install.mjs --check` says which installed files are
behind; `install.mjs --seed <repo>` copies the protocol kit of protocol section 9 into a new project;
`--user` is parsed; the scripts name dates by the local day; the three scripts have `node:test` suites.
Done: `npm test` green, `node scripts/check.mjs` exit 0, a real seed into a temp folder whose hook
prints the reminder lines. All hold (below).

## Decisions already made
- Branch `claude/modest-swirles-cae434`, worktree `.claude/worktrees/modest-swirles-cae434`, commit `9734bfd`. Not merged, rebased or pushed, as briefed. The branch was fast-forwarded to main `7f1de23` first, because it was cut from `6ff89f1` and lacked the assessment.
- Shipped scripts are every top-level `scripts/*.mjs` except `check.mjs`, `install.mjs` and `*.test.mjs`. The rule picks up Stage O1's `dispatch.mjs` and `dispatch-core.mjs` with no further edit. Reason: they find `pricing/` by their own location, the gate and installer need the whole repository.
- `--check` compares size and SHA-256 per payload file. A file only in the installed copy is listed as `extra` and not counted (old tables are harmless: the newest by name is in force). Default scope is every known harness folder that exists; `--harness` or `--project` narrows it and then an absent copy counts as behind.
- `--seed` refuses a file that differs unless `--force`. `AGENTS.md` and `.claude/settings.json` are merged under `--force`, never replaced; invalid settings JSON is refused even with `--force`. Identical files are skipped, so a rerun is idempotent. Seeding this repository itself is refused. The new `AGENTS.md` is the pointer paragraph, a `# AGENTS.md: <folder name>` title and the Operator protocol section.
- Unknown flags now exit 1 with the accepted list (a typo like `--usr` used to run the default install).
- Date convention: local calendar day, stated in the `pricing-new.mjs` comment. Test fixtures use the earlier of the local and UTC day, so they pass the gate under either convention.
- `package.json` `test` is `node --test "scripts/*.test.mjs"`. The briefed `node --test scripts/` fails on Node 26.7.0 (`Cannot find module ...\scripts`); the glob needs Node 21 or later.

## Files and links that matter
- `scripts/install.mjs` (rewritten, 6 modes of use in its header), `scripts/pricing-new.mjs` (date only).
- `scripts/check.test.mjs`, `scripts/install.test.mjs`, `scripts/pricing-new.test.mjs`; `scripts/fixtures/helpers.mjs` and three synthetic price tables (`@TODAY@` placeholders, no vendor figures).
- `README.md` (layout row, install, `--check`, `--seed`, tests, changelog line), `package.json`.

## Verified facts
- `npm test`: tests 22, pass 22, fail 0, about 10.5 s (2026-10-29).
- `node scripts/check.mjs`: 52 files read, 0 findings, exit 0.
- Seed oracle: `node scripts/install.mjs --seed <temp> --dry-run` listed all 23 files; a real seed then `node .claude/helpers/operator-protocol.cjs` in the temp folder printed five `[operator-protocol]` lines (in force, no handoff yet, live status, two unanswered questions). A second seed run: 0 written, 23 unchanged.
- Mutation checks, each caught by a test: hash ignored in `--check` (needed a same-size edit in the test), `check.mjs` shipped, conflict refusal removed, dry run writing, stale exit 2 changed to 1.
- Finding 5 confirmed on the operator's machine: `node scripts/install.mjs --check` reports `scripts/pricing-new.mjs` missing in all three installed copies (claude, codex, opencode). The codex copy also holds `pricing/2026-10-29.json`, absent from the repository at that time.
- Not tested: the local-versus-UTC date difference itself (no clock injection; the script reads the system clock), `--harness` targets other than claude and codex end to end, Cline's rule file write.

## Work completed
- `9734bfd`: install.mjs, pricing-new.mjs, three test files, fixtures, README, package.json.
- This handoff and `docs/status.md`.

## Unresolved questions
- Stage O1: `scripts/check.mjs` still uses UTC. The one-line change to match: replace the body of its `todayIso` with the local-day form `pricing-new.mjs` uses (`getFullYear()`, `getMonth() + 1` and `getDate()`, zero-padded, joined with hyphens). The tests accept either clock.
- Stage O1: `SKILL.md` step 1.4 should say to refresh in the repository and then reinstall. Run in an installed copy, `pricing-new.mjs` writes the new table there only, and `--check` then lists it as `extra` while the repository stays stale. Any runtime file O1 adds to `scripts/` that is not `.mjs` is not shipped.
- Merge: O1 and S1 both edit the `README.md` changelog and `scripts/` layout row; keep both lines. By filename `stage-s1` sorts after `stage-o1`, so the hook will announce this handoff as active once merged; set the next handoff accordingly.
- Operator: protocol sections 9 and 10 still describe the hand copy and omit `--check` and `--seed` (the operator's text, not edited here). Then run `node scripts/install.mjs` after merge to refresh the three installed copies.
- Operator questions D1 (autonomy) and D2 (ASD-STE100) remain unanswered; not asked here because this session reports to its parent.

## Exact next action
Operator or the parent session: review `git diff main...claude/modest-swirles-cae434`, merge it after Stage O1 (or before; the files are disjoint apart from the two README lines), run `npm test` and `node scripts/check.mjs`, then `node scripts/install.mjs` and `node scripts/install.mjs --check` (expect "0 file(s) behind").

## Cost projection
Estimate, not measured (no usage reading taken): Sonnet, about 30 turns, average context 60k, F 3k, O 1.5k (protocol section 6). Prices from `pricing/2026-10-18.json`: cache reads 30 x 60k x 0.10 = 0.18 USD; fresh input 30 x 3k x 2.50 = 0.23; output 30 x 1.5k x 10 = 0.45; total about 0.86 USD against the 2 to 4 USD in the roadmap.

## Time projection
Wall clock about 15 minutes (session created 21:56 local, committed 22:11), against 30 to 45 planned. Operator review: about 20 minutes (install.mjs diff and the seed output).

## Session dispatch decision
Session dispatch not run: model, effort and worktree were fixed by the dispatching session's roadmap (assessment section 6.1, S1) and the work fitted one session without compaction.
