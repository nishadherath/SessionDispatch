# Acceptance of Stage S7 and the paired check at high and xhigh, 2026-11-12

Stage F10: adversarial acceptance of Stage S7 (Sonnet 5.5 at high; commits
`e996819`, `bc61ce4`, `9e84f65`, `b93a809`, `de347fc` on branch
`claude/stage-s7-fable-note-45951a`), by `claude-fable-5-2` at xhigh in a
fresh session (app id `local_17f1e88d`, transcript `310e166e`), under
matrix row 4 and guardrail 6. Brief:
`docs/handoffs/2026-11-12-then-stage-f10-acceptance.md`. Tree under review:
`de347fc`. Model note: `models/claude-fable-5-2.md` applied except the
effort cap, which this stage tests.

**Verdict: accepted.** Eleven claims checked, eleven accepted, none
rejected. The four thresholds are met. P1: each arm of the paired check
found six of six seeded faults, so the cap at `high` stays. P2: both arms
are in the ledger and in the note's table. P3: scenario 25 gave effort
`high` in 2 of 2 runs. P4: scenarios 09 and 02 gave their expected
verdict, model and effort with the note in the sandbox, 2 of 2. Nine
findings are in section 7: three are fixed here, three are handed on as
low, three are recorded. Beyond the seeded faults the `xhigh` arm found
four low defects in code that the `high` arm did not, at 1.63 times the
cost (section 6.4); one pair is weak evidence either way. Gate at the
stage commit: `node scripts/check.mjs`, 138 files read, 0 findings; `npm test`: 126 tests, 126 pass, 0 fail, 627 s.

## 1. The thresholds and how they are read

The four thresholds were fixed on 2026-11-12 in
`docs/assessment-2026-11-12.md` section 8.2, before any run.

- **P1.** The cap of note rule 1.2 stays for matrix row 4 if the `high`
  arm finds at least the `xhigh` arm's count of seeded faults less one.
- **P2.** Each arm's calls, output a call, cache write a call and cost go
  to the ledger and to the note's table, n = 1 for each level.
- **P3.** Scenario 25, two runs: the final verdict as expected and effort
  `high`, 2 of 2.
- **P4.** Scenarios 09 and 02, one run each, with the note in the sandbox:
  each gives its expected verdict, model and effort, 2 of 2.

How P1 is counted was fixed before either arm started. The six faults and
the rule are in section 6.1 as written then (a file in this session's
scratchpad, SHA-256 `8b26b2d5f716`, written before the two `Agent` calls
of transcript `310e166e`): a fault counts when the arm's written report
names the file and the defect; an accept or reject label does not matter;
a fault that an arm met and did not report does not count; other true
findings are listed apart.

P3 and P4 are the scorer's `final_ok` on each run. I also read each record
for the line that names the note (step 1.4.6 asks for it); that reading is
not a threshold.

## 2. The claims

Eleven claims, from the brief. Each check ran in this session on the tree
at `de347fc`, or on a temporary copy of it.

| No. | Claim | Verdict | The check and its output |
|---|---|---|---|
| 1 | The note is appendix A as it stands | accepted | A script took the text between the two fences of appendix A and compared it with `models/claude-fable-5-2.md`: 3,864 bytes against 3,864, equal, no carriage return in either |
| 2 | `SKILL.md` has the two insertions of appendix B and no other change | accepted | `git diff --numstat 3cf34ce..de347fc -- SKILL.md`: 8 added, 0 removed. A script put appendix B's two blocks into the base file at the two places the appendix names: the result equals the S7 file byte for byte |
| 3 | The template and the protocol have the changes of appendix C | accepted | numstat 2 and 1 for the template, 1 and 1 for the protocol. The same script: the base template plus the row and the effort line equals the S7 template; the base protocol plus the clause equals the S7 protocol |
| 4 | `checkModels` covers rules (a) to (h), and each message names the file, the bad value and the fix | accepted | The function read line by line. 23 single-fault cases in a temporary copy (section 3): every rule exits 1 with one finding that names the note; the three cases that must pass exit 0 |
| 5 | The three seeded-fault tests catch their faults | accepted | In a temporary copy without `checkModels` in the step list the three tests fail, 0 of 3 pass. In an unchanged copy 3 of 3 pass |
| 6 | The installer ships `models/` | accepted | `node scripts/install.mjs --harness claude --dry-run`: "would copy 19 file(s)". The new test installs into a temporary home, compares the note, deletes it and reads "missing models/claude-fable-5-2.md" from `--check` (it passes in the full run). `--check` against the four real copies names the note as missing in each before the install of section 8 |
| 7 | The evaluation sandbox carries `models/` | accepted | `eval/run.mjs` line 41. The test prepares scenario 25 and compares the sandbox's note with the repository's. The four sandboxes of section 5 each held `models/claude-fable-5-2.md` |
| 8 | Scenario 25 is correct | accepted | Section 4: every figure by hand. The brief states the 1-hour write, To 0 and no coordinator. `git diff --stat 3cf34ce..de347fc -- eval/scenarios`: one file, 93 lines added; the other 24 are unchanged. Against scenario 09 only the listed fields differ |
| 9 | No formula, calculator, matrix or guardrail change | accepted | `git diff 3cf34ce..de347fc --stat -- scripts/dispatch.mjs scripts/dispatch-core.mjs` is empty; `examples/`, `pricing/` and `adapters/` are unchanged; claim 2 covers `SKILL.md` |
| 10 | The gate and the tests are green as quoted | accepted | `node scripts/check.mjs`: 136 files read, 0 findings, exit 0. `npm test`: 125 tests, 125 pass, 0 fail, 346 s |
| 11 | Prose conventions hold in every new file | accepted | The gate's prose step covers `models/` (an em-dash seeded in the note is found at its line). I read the note and the brief once: Australian spelling, no em-dash, none of the banned words |

## 3. How claim 4 was checked

A driver copied the tree to the operating system's temp folder
(`scripts/fixtures/helpers.mjs`, `copyTree`), changed the note for one case,
ran the gate and restored the note. The live tree was not edited.

| Rule | Case | Exit | The finding |
|---|---|---|---|
| none | the tree as it stands | 0 | 136 files read, 0 findings |
| a | the file renamed to `claude-fable-5-3.md` | 1 | the file name must be the front matter's model plus .md |
| b | model `claude-fable-9-9` in a file of that name | 1 | model claude-fable-9-9 is not in pricing/2026-11-10.json |
| b | model `fable` (a class name) in `fable.md` | 1 | model fable is not in the table |
| c | `fetched: 2026-02-30` | 1 | fetched must be a valid YYYY-MM-DD date, found "2026-02-30" |
| c | `fetched: 2027-01-01` | 1 | fetched 2027-01-01 is in the future |
| c | no `fetched` line | 1 | found null |
| d | an empty `sources` list | 1 | sources must list one or more https:// addresses, found [] |
| d | one source with `http://` | 1 | the same message, with the three addresses |
| e | `effort_start: ultra` | 1 | must be one of low, medium, high, xhigh, max, found "ultra" |
| e | no `effort_start` line | 1 | found null |
| f | `effort_switch: maybe` | 1 | must be one of miss, kept, unmeasured, found "maybe" |
| f | no `effort_switch` line | 1 | found null |
| g | heading 1 reworded | 1 | missing required heading "## 1. Effort" |
| g | heading 2 removed | 1 | missing required heading "## 2. Inputs for step 1.2" |
| h | exactly 5,000 characters | 0 | none: the limit is 5,000 or less |
| h | 5,001 characters | 1 | 5001 characters, over the limit of 5000; cut 1 characters |
| other | no front matter | 1 | missing YAML front matter |
| other | CRLF line endings | 0 | none |
| other | `models/` with no `.md` file | 0 | none: no note, no change |
| other | an em-dash in the note | 1 | line 20: em-dash |
| other | a byte order mark before the front matter | 1 | missing YAML front matter (finding F10-2) |
| other | a second note for a model in the table | 0 | none |

23 cases, 0 unexpected exits. Every finding names the file. The messages
for rules (e) and (g) give the accepted values or the heading, which is the
fix; they add no further sentence.

## 4. Scenario 25 by hand

Prices per million, `pricing/2026-11-10.json`, `claude-fable-5-2`: cache
read 0.20, 1-hour write 16, output 40. Inputs: C0 150,000; B 86,450;
R 30,000; H 2,500; T 12; F 5,000; O 3,000; To 0; M 0; L 0.

```
G       = 5,000 + 3,000                           = 8,000
C_cont  = 150,000 + 12 * 8,000 / 2                = 198,000
C_fresh = 86,450 + 30,000 + 48,000                = 164,450
cost_continue = 12 * 198,000 * 0.2e-6  = 0.4752
              + 12 * 8,000 * 16e-6     = 1.5360
              + 12 * 3,000 * 40e-6     = 1.4400      = 3.4512  (3.45)
cost_fresh    = 2,500 * 40e-6          = 0.1000
              + 116,450 * 16e-6        = 1.8632
              + 12 * 164,450 * 0.2e-6  = 0.3947
              + 1.5360 + 1.4400                      = 5.3339  (5.33)
T*      = (0.1000 + 1.8632) / (33,550 * 0.2e-6)   = 1.9632 / 0.00671 = 292.6
margin  = (5.3339 - 3.4512) / 3.4512              = 54.6 percent
split   = 0.1000 + run on claude-sonnet-5-5 (0.4658 + 0.1973 + 0.3840 + 0.3600 = 1.4071)
        + acceptance on claude-opus-5-5 (2.8143)  = 4.3214  (4.32)
```

The calculator prints the same figures. T 12 is under T* 292.6, so the
draft is continue by break-even. Guardrail 6 makes the verdict fresh: the
author is the top class. The note makes the effort `high`.

## 5. The mini-evaluation

Four Sonnet subjects, calculator arm, the CLI runner (CLI 2.1.316), skill
commit `de347fc`, `eval/results-2026-11-12.md`. Each sandbox held
`models/claude-fable-5-2.md`.

| Run | Outcome | Model | Effort | What the record says of the note |
|---|---|---|---|---|
| 25, first | fresh, as expected | `claude-fable-5-2` | `high` | applied; "xhigh not measured"; guardrail 6 binds at effort high |
| 25, second | fresh, as expected | `claude-fable-5-2` | `high` | applied (section 1.2); gives the cost one level below, as note section 2 asks |
| 09 | fresh, as expected | `claude-fable-5-1` | `xhigh` | "none: `models/claude-fable-5-2.md` exists only for another model id" |
| 02 | fresh, as expected | `claude-opus-5-5` | `high` | "none": no piece, coordinator or session runs that model |

- **P3: met, 2 of 2.**
- **P4: met, 2 of 2.**

The scorer gives final agreement 4 of 4 (51.0 to 100.0 percent, Wilson),
draft 4 of 4, inputs 76 of 76, arithmetic 15 of 15. Two of two bounds a
rate at 34 percent or more, so P3 shows that the wording works, not how
often. Scenario 09's record states guardrail 8 as binding, which the
scenario does not expect (a false alarm in the scorer's count, as in
earlier runs of 09); its verdict is right.

Measured: 25 turns in 4 runs, 3.13 USD at the 1-hour write (every write
was a 1-hour write, 649,436 tokens) against 1.88 projected; the runner's
`usd_priced` gives 2.15 at the 5-minute figure (finding F8-5, open).

## 6. The paired check

### 6.1 The copy, the six faults and the rule

The copy is a clone of the S7 branch in this session's scratchpad. Each
fault went into the S7 commit that owns its file (fixup commits, then an
autosquash rebase), so `git diff 3cf34ce..HEAD` shows the faults as part of
S7's work. The clone's documents name the clone's commit ids, the old
objects were pruned (`git cat-file -e` fails on each old id) and the clone
has no remote. On the seeded clone the gate reads 136 files with 0
findings and `npm test` gives 125 tests, 125 pass (323 s): neither oracle
finds a fault. Each arm had its own byte-identical copy.

| Id | Kind | Place | The fault | `high` | `xhigh` |
|---|---|---|---|---|---|
| A1 | arithmetic | `eval/scenarios/25-*.json`, `Ra` and `cost_split` | `Ra` 33,000 where the brief and scenario 09 say 30,000; `cost_split` regenerated to 4.35 (4.32 from the brief's inputs); the brief's quoted figure changed to match | found (its finding 3) | found (4) |
| A2 | arithmetic | `scripts/check.mjs`, the size rule | `>=` in place of `>`: a note of exactly 5,000 characters fails | found (4) | found (3) |
| T1 | text against a file | `models/claude-fable-5-2.md`, section 2 | O 1,570 where appendix A has 1,750 | found (1) | found (1) |
| T2 | text against a file | `README.md`, the changelog line | "4,000 characters" where the gate's limit is 5,000 | found (6) | found (5) |
| P1 | payload | `SKILL.md`, step 1.4 item 6 | "for that model only," removed, the lines wrapped again so that the count stays 8 and 0 | found (2) | found (2) |
| P2 | payload | `scripts/install.mjs`, `checkCopy` | `models` left out of the folders searched for installed-only files | found (7) | found (6) |

The rule is in section 1. Each arm named every fault with its file, its
line and the evidence.

### 6.2 The brief and the runs

Both arms are sub-agents of this session on `claude-fable-5-2`, arm A at
`high` and arm B at `xhigh`, started in one message and run at the same
time. The brief is one text with the arm's folder filled in (SHA-256
`7c15c6332a5d` before the fill): the eleven claims with their checks, the
method left open, the constraints, the oracles and the shape of the
report. It follows the note's section 3. It says that the copy can hold
seeded faults and that the count is not a target. The design in the
copy's own documents (six faults, three kinds) was open to both arms.

I read every tool call of both transcripts with a script: every path is
inside the arm's own folder, neither arm started a sub-agent, and each
install ran with `--dry-run` or in a temporary home. The four installed
copies were unchanged after the runs. The harness refused each arm's
`report.md` (a rule for sub-agents), so each reply is the report.

### 6.3 The result

| Measure | Arm at `high` | Arm at `xhigh` | `xhigh` over `high` |
|---|---|---|---|
| Seeded faults found | 6 of 6 | 6 of 6 | |
| Claims rejected | 1, 2, 8; 4 in part | 1, 2, 4, 8; 9 with a reservation | |
| Other true findings | 8 | 13 | |
| Calls | 36 | 48 | 1.33 |
| Output a call | 1,613 | 2,234 | 1.39 |
| Output, total | 58,064 | 107,243 | 1.85 |
| Cache write a call | 5,675 (3,982 after the first) | 5,841 (4,583 after the first) | |
| Cost, 5-minute writes, USD | 5.37 | 8.77 | 1.63 |
| Projected at T 30, USD | 4.97 | 5.52 | 1.11 |
| Wall clock, minutes | 23.5 | 35.2 | 1.50 |

Source: `node scripts/session-cost.mjs 310e166e`, sub-agents `a395859c`
(`high`) and `a1c221e7` (`xhigh`), table 2026-11-10; every write of both
arms is a 5-minute write, and neither arm wrote its context again.

- **P1: met.** 6 is not less than 6 less one. The cap of note rule 1.2
  stays. The sentence does not change.
- **P2: done.** The ledger and the note's table hold a row for each arm.

### 6.4 What the pair shows

1. On six seeded faults the two levels are equal. This is a ceiling: the
   faults did not separate the levels. Six of six bounds each arm's
   detection rate at 61 percent or more (Wilson, 95 percent). One pair
   cannot show equal quality.
2. The first measured cost ratio of the two levels on one task is 1.63.
   The arm at `high` cost 39 percent less. The assessment guessed 22
   percent and gave 61 percent as the upper bound.
3. Beyond the seeded faults the arms differ, and this is outside P1.
   Both found the gap in `eval/README.md`, the stale line in the subject
   prompt and the missing boundary case of the size test. The `xhigh` arm
   alone found four defects in code: the manifest guard of `eval/run.mjs`
   does not cover the note, and three edge cases of `checkModels`
   (finding F10-5). I reproduced the four on the true tree; each is low.
   The `high` arm alone found two bookkeeping defects (F10-3 and one line
   of F10-6). So the extra 3.40 USD bought four low findings in code, on
   one task, n = 1.
4. Limits. I chose the faults and I am the judge. Three of the six can be
   found by an exact comparison with the appendices, which both arms
   made. Both arms knew that seeded faults were possible. The arms ran at
   the same time on one machine (`npm test` took 492 s and 540 s against
   346 s alone). Both are sub-agents with 5-minute writes and a smaller
   baseline than a session, so their rows are not session rows.

A later pair with faults of the kind in item 3 (a guard that does not
cover a new input, an edge case of a parser) would test whether `xhigh`
finds defects that `high` misses. That is the operator's choice; the cap
stands on the rule that was fixed before the run.

## 7. Findings

| No. | Finding | Source | Disposition |
|---|---|---|---|
| F10-1 | `eval/README.md` did not name scenario 25 and said that scenario 24 is the only one under formula 2026-11-11. `README.md` said 20 scenarios. The placeholder table of `eval/subject-prompt.md` named two of the sandbox's three calculator files | this session; both arms | fixed, `38a0525` |
| F10-2 | No test held the size rule at 5,000 and 5,001 characters, and no test planted an installed-only note. Each seeded fault of that kind passed the whole suite | the paired check | fixed, `bc4c186`: two assertions, each fails on its seeded fault |
| F10-3 | The S7 handoff has the status `done` and its own cost row said `pending` | arm at `high` | fixed in this stage's closing commit, from the ledger row |
| F10-4 | The manifest guard of `eval/run.mjs` (one manifest, one text under test) hashes `SKILL.md` and the prompt, not `models/`. A second `prepare` on the same date after a change to the note is accepted | arm at `xhigh`; reproduced | handed on, low. This stage prepared once, before the note changed |
| F10-5 | Edge cases of `checkModels`: a model id that is a property of every object (`constructor`) passes rule (b); a `sources` list with no indent is refused with "found []"; the two headings count when they stand only inside a code fence; a byte order mark gives "missing YAML front matter"; the messages of rules (e) and (g) have no fix clause | arm at `xhigh` (the first three, reproduced); this session; arm at `high` | handed on, low. No case lets the shipped note through in a wrong state |
| F10-6 | The brief of this stage: "24.9 USD ... plus the subjects" already holds the subjects' 1.88; the command list omits `collect`, and "the same" keeps `--repeat 2` | the two arms | recorded. The brief is closed as written; I ran `collect` and one run each for 09 and 02 |
| F10-7 | The four adapters describe the installed folder without `models/` (and without `scripts/`, an older gap) | arm at `xhigh` | handed on, low, older than S7 |
| F10-8 | The assessment gives the note as 3,495 characters, about 875 tokens. It was 3,864 characters (about 966 tokens) as S7 copied it and is 4,208 (about 1,052) with this stage's two rows. The gate's limit is 5,000 | this session; both arms | recorded |
| F10-9 | The runner's `usd_priced` still prices 1-hour writes at the 5-minute figure: 2.15 against 3.13 USD for the four subjects | this session | open as F8-5 |

No finding changes a figure that the formula gives, and none is in the
text of `SKILL.md` or in the rules of the note.

Claim 4 stays accepted: the eight rules hold for every case that the S7
handoff names. F10-5 lists what they do not cover.

## 8. What this stage changed

- `38a0525`: `eval/README.md` describes scenario 25; `README.md` says 25
  scenarios; the placeholder table of `eval/subject-prompt.md` names the
  three calculator files (outside the prompt's fence; the prompt hash is
  the same).
- `7971337`: `eval/runs/2026-11-12/` and `eval/results-2026-11-12.md`.
- `bc4c186`: two assertions (F10-2). The suite has 126 tests.
- The closing commit: the two rows of P2 in `models/claude-fable-5-2.md`
  (the note is no longer appendix A byte for byte; the rules are the
  same), four ledger rows, this note, the brief closed, the S7 handoff's
  cost row, `docs/status.md` and the changelog line.
- No change to `SKILL.md`, the formula, the calculator, a scenario, a
  price table or an adapter.

The release steps, done after the closing commit `db2a105` (the note's
rows are `dfa1e7d`): `main` fast-forwarded from `3cf34ce` to `db2a105`,
the gate run on `main` (138 files read, 0 findings), `git push origin
main` under `approvals.push_origin` (`3cf34ce..db2a105`), then
`node scripts/install.mjs --harness all` from `main`: four copies of 19
files and the Cline rule file, which points at the Claude copy. `node
scripts/install.mjs --check`: 4 installed copies, 0 files behind. The
commit that records these steps changes documents only. No tag: the
operator decides (D18 in the status document).

The message of `38a0525` calls its finding F10-3; in this note it is
F10-1.

Next stage: none, the chain is complete. Session dispatch not run: no
stage follows, no trigger of step 0 holds.

## 9. Cost of this acceptance

`node scripts/session-cost.mjs`, table 2026-11-10, API list price.

| Piece | Projected USD | T projected | Calls measured | Measured USD | Source |
|---|---|---|---|---|---|
| F10 acceptance | 12.55 | 50 | 74 | 14.58 | transcript `310e166e`, priced before the last test run, the closing commit and the release steps; later turns not counted. 4 calls on `claude-sonnet-5-5` (0.24) before the model was set, 70 on `claude-fable-5-2` (14.35); every write a 1-hour write; 1,676 output a call |
| Arm at `xhigh` (sub-agent) | 5.52 | 30 | 48 | 8.77 | sub-agent `a1c221e7` of the same transcript, 5-minute writes |
| Arm at `high` (sub-agent) | 4.97 | 30 | 36 | 5.37 | sub-agent `a395859c`, 5-minute writes |
| 4 evaluation subjects | 1.88 (estimate) | n/a | 25 turns | 3.13 | each run's `cli-result.json`, 1-hour writes |
| Total | 24.92 | | | 31.85 | |

The total is 1.28 times the projection. Three causes, in order of size:
the `xhigh` arm (1.59 times its figure: 48 calls against 30, and 2,234
output a call against the 1,750 the plan used), the subjects (1.66 times:
three of the four runs wrote about 205,000 tokens to the cache at the
1-hour price, against a mean of about 77,000 a run in F8; the cause is
not measured) and this session (1.16 times at the pricing point). The
arm at `high` ran 1.08 times its figure (36 calls against 30, 1,613
output a call against 1,400). This session's 74 calls are 1.48 times a T of 50 that already
held the factor 2, so 2.96 times the plan estimate of 25. The three
`xhigh` acceptance sessions on this model now give 2.45, 1.72 and 2.96.
The note's row says 2 times with n = 2; I did not restate it, because P2
names the arms' rows only. A later stage can.

The session began on `claude-sonnet-5-5` at `high`: it stopped at the
configuration check, and the S7 session set the model and the effort
with the session tools. The first call on the new model wrote the context
again (the ledger's note on a model switch).

Wall clock: about 80 minutes to the pricing point, against 60 to 90
projected; the two arms ran for 23.5 and 35.2 minutes inside it.
