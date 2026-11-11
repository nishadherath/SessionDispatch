# Calibration ledger

One row per piece and per coordinator, appended when a stage closes: the figures the record
projected beside the figures the transcript measured. It is the only place a default in
`SKILL.md` step 1.2 can be moved from, and then only in a formula stage with its own worked
example (`AGENTS.md` rule 8). Nothing here moves a default.

Measure a row with `node scripts/session-cost.mjs <transcript or session id> --table pricing/<date>.json`
(sub-agent transcripts are priced and listed apart). Name the table the stage was projected
with: a session on a model the newest table no longer lists needs the older one.

| Stage | Piece | Class | Effort | T projected | Calls measured | Cache write per call | Output per call | Projected USD | Measured USD | Source |
|---|---|---|---|---|---|---|---|---|---|---|
| Tsunami 2026-11-02 | A content | opus | high | 50 | n/a | n/a | n/a | 8.60 | 4.27 | Tsunami D-112 item 4; projected by `docs/dispatch/2026-11-10-example-tsunami.json` |
| Tsunami 2026-11-02 | B build | sonnet | high | 100 | n/a | n/a | n/a | 9.85 | 4.89 | the same |
| Tsunami 2026-11-02 | C content acceptance | fable | high | 30 | n/a | n/a | n/a | 9.08 | 6.53 | the same |
| Tsunami 2026-11-02 | D page acceptance | opus | high | 40 | n/a | n/a | n/a | 5.83 | 9.80 | the same |
| Tsunami 2026-11-02 | coordinator | fable | high | 25 by hand (handoff 38); 120 under formula 2026-11-10 (To 30 x 4) | 166 | 6,446 | 2,825 | 5.30 by hand; 42.35 under formula 2026-11-10 | about 56 | Tsunami D-112 item 4: 52.42 measured at 14:06 plus about 4 for the rest of the turn; per-call figures from `SKILL.md` step 1.2 (Fo, Oo) |
| SessionDispatch O1 2026-10-29 | formula, calculator, example | opus | high | 60 | 49 | 4,856 (4,177 after the first call) | 2,088 | 8.43 (quote 7 to 12) | 6.05 | session 4a645017, table 2026-10-29; re-priced in Stage O6 at the 1-hour write (`--table pricing/2026-11-10.json`): 6.049; 5.34 at the 5-minute figure |
| SessionDispatch F1 2026-10-29 | adversarial acceptance of O1 | fable | xhigh | 15 | 24 | 11,282 (10,061 after the first call) | 4,263 | 5.89 (quote 5 to 15) | 12.00 | session 99f38ac8, table 2026-10-29; re-priced in Stage O6 at the 1-hour write: 11.997; 9.97 at the 5-minute figure |
| SessionDispatch O5 2026-11-10 | coordinator term, formula, example, two scenarios | opus | high | 60 to 90 | 101 | 3,596 (3,220 after the first call) | 1,371 | 10.06 to 16.34 | 11.80 | session 69a179e5, table 2026-11-10, priced by F7 after the session's last turn (S6 priced it at 20:04 local, before them: 96 calls, 10.25); at the 1-hour write 11.80 for the stage's 101 calls (F7's 10.706 + 1.09, finding F7-1; the pricer now counts 103 calls, 11.98, because the session ran on); 10.71 at the 5-minute figure |
| SessionDispatch S6 2026-11-10 | transcript pricer, ledger | sonnet | medium | 40 to 60 | 72 | 2,356 (1,809 after the first call) | 623 | 2.21 to 3.43 | 2.34 | transcript d715dfd0 (app session 64c9f68d), table 2026-11-10, the Sonnet calls; six more calls on claude-fable-5-2 after the stage cost 2.06 (see the notes); re-priced in Stage O6 at the 1-hour write: 2.340 for the 72 Sonnet calls; 2.09 at the 5-minute figure |
| SessionDispatch F7 2026-11-10 | adversarial acceptance of O5, S6 and `1ae8c0d`; release | fable | xhigh | 20 | 49 | 6,594 (5,896 after the first call) | 1,909 | 6.33 | 10.52 | transcript 95cd0d09 (app session 3066f14f), table 2026-11-10, priced just before the stage's commit, later turns not counted; 3 calls on claude-sonnet-5-5 before the operator switched the model (0.14 USD), 46 on claude-fable-5-2 (8.64), one Haiku sub-agent read of the price page (0.004); at the 1-hour write 10.52 for the stage's 49 calls, counted in Stage F8 from the first 49 message ids (46 Fable calls 10.324, 3 Sonnet calls 0.200; Stage O6's estimate by hand was 10.53); the session ran on as the coordinator (66 calls and 15.62 when Stage O6 priced it, 74 and 16.84 when Stage F8 did); 8.78 at the 5-minute figure |
| SessionDispatch O6 2026-11-10 | formula 2026-11-11, text, calculator, gate, example, scenario 24, integration | opus | high | 120 | 120 | 3,266 (2,946 after the first call) | 1,203 | 16.06 at the 5-minute figure (the record); 17.94 at the 1-hour one (the example) | 13.60 | transcript 199d74f5, table 2026-11-10, priced by Stage F8 after the session's last turn: 13.595, every write a 1-hour write (391,870 tokens); 12.42 at the 5-minute figure; one Haiku read of the price page in a sub-agent, 2 calls, 0.004 |
| SessionDispatch O6a 2026-11-10 | the table rules, the table, the pricer (sub-agent) | sonnet | medium | 60 | 41 | 3,616 (2,154 after the first call) | 970 | 1.74 at the 5-minute figure (the record); 2.05 at the 1-hour one | 1.23 | sub-agent agent-a850f0dc31832dc4e under transcript 199d74f5, table 2026-11-10: 1.234; every write a 5-minute write (148,241 tokens), so the 1-hour figure prices none of it |
| SessionDispatch O6b 2026-11-10 | the scorer contract, rubric, prompt, 23 briefs (sub-agent) | sonnet | high | 70 | 48 | 4,449 (3,221 after the first call) | 1,138 | 2.37 at the 5-minute figure (the record); 2.76 at the 1-hour one | 1.89 | sub-agent agent-a2a9c5d014d1ad6b3 under the same transcript: 1.892; every write a 5-minute write (213,550 tokens) |
| SessionDispatch F8 2026-11-10 | adversarial acceptance of O6; the rerun; the release | fable | xhigh | 60 | 103 | 4,497 (4,123 after the first call) | 1,591 | 17.29 | 21.21 | transcript 5554ef6c (app session ae00f601), table 2026-11-10, priced just before the stage's commit, later turns not counted: 21.212, every write a 1-hour write (463,155 tokens); 18.43 at the 5-minute figure; one Haiku read of the price page in a sub-agent, 2 calls, 0.004 |
| SessionDispatch F8 2026-11-10 | 24 evaluation subjects (`claude -p`, calculator arm) | sonnet | the CLI's default | n/a | 157 turns in 24 runs | 11,724 | 1,006 | about 6.7 (estimate) | 11.29 | each run's `usage.json` and `cli-result.json` under `eval/runs/2026-11-10/`, table 2026-11-10; every write a 1-hour write (1,840,679 tokens); the runner's `usd_priced` prices them at the 5-minute figure, 8.53 (finding F8-5) |
| SessionDispatch F9 2026-11-12 | plan for the Fable 5.2 model note: the vendor's pages, the design, the S7 handoff | fable | high | n/a (the operator started the stage; no projection) | 23 | 16,079 (14,320 after the first call) | 4,066 | n/a | 11.03 | transcript 928b13c6, table 2026-11-10, priced just before the stage's commit, later turns not counted: 11.032, every write a 1-hour write (369,827 tokens); 6,867,176 tokens read; the first row on claude-fable-5-2 at high |
| SessionDispatch F7 2026-11-10 | coordinator of the O6 chain: the plan and the O6 handoff, then the wakes | fable | xhigh | 8 (To 2 x 4) | 30 (17 for the plan, 13 in the wakes) | 3,454 | 2,763 | 1.39 for the wakes, and up to 7.40 more for two cold wakes; 0.20 for the handoff | 7.31 (5.10 for the plan, 2.21 for the wakes) | transcript 95cd0d09, table 2026-11-10 at the 1-hour figure, the calls after the F7 stage's 49, priced just before this row's commit; no wake was cold |
| SessionDispatch S7 2026-11-12 | model note, `SKILL.md` insertions, template, gate check, installer, scenario 25 | sonnet | high | 80 (60 to 100) | 48 | 4,998 (4,240 after the first call) | 899 | 4.91 (3.8 to 6.0) | 2.48 | transcript 6577132b (app session 3db2e510), table 2026-11-10, priced just before the closing commit |

## Notes on the rows

- **The coordinator of the O6 chain (F7, n = 1).** The record gave the handoff 0.20 USD (H x p_out) and the
  coordinator 1.39 for 8 turns. Measured: the turn that planned the chain and wrote the O6 handoff took 17
  calls and 5.10 USD on a context of about 390,000 tokens; the wakes took 13 calls and 2.21 USD.
  Both wakes came 55 and 56 minutes after the session's last call, inside the 1-hour lifetime, so neither
  wrote the context again and the cold-wake cost stays unmeasured. The handoff term prices the handoff's
  output only; the calls that write it each read the whole context.
- **Identification (estimate).** The O1 and F1 transcripts are identified by model, by the commit
  times of `0cc7d52` (22:09 on 2026-10-29, UTC+11) and `17c9526` (22:37), and by the session
  windows (10:47 to 11:13 UTC and 11:16 to 11:54 UTC). No transcript names its stage in its
  first message. The costs are right for those sessions; the stage labels are inferred.
- **Cache writes at the 1-hour figure (Stage O6, 2026-11-10).** Every write in these transcripts
  is marked as a 1-hour write. Until Stage O6 the table priced it at `cache_write`, the 5-minute
  figure, so each measured cost was a lower bound. The table of 2026-11-10 now carries
  `cache_write_1h` and the pricer uses it; the SessionDispatch rows above are re-priced at it, the
  5-minute figure kept in each Source cell. The Tsunami rows are another repository's and stay as
  measured there. The ratios below were computed at the 5-minute figure.
- **The size of the 1-hour bias (F7, 2026-11-10).** The vendor's page, read that day, prices a
  1-hour write at twice base input; the table's `cache_write` is the 5-minute figure (1.25 times).
  At the 1-hour figure the measured costs rise by 0.71 USD for O1 (13.4 percent), 2.03 for F1
  (20.4), 1.09 for O5 (10.2) and 0.25 for S6's Sonnet calls (12.2). The table has no field for
  it, so the Measured column stays at the table's figure (`docs/acceptance-2026-11-10-f7.md`,
  finding F7-1, decision D15).
- **A model switch is a cache miss of the whole context.** The S6 session was switched from
  Sonnet to Fable 5.2 after its stage, so that it could set F7's model: the first call on the new
  model wrote 160,458 tokens and the six calls cost 2.06 USD, as much as the stage's 72. F7
  began on Sonnet and was switched the same way; its Source cell gives the split.
- **The O6 chain (Stage F8, 2026-11-10).** O6's two Sonnet pieces ran as sub-agents, which write 5-minute
  entries in this harness while their session writes 1-hour ones (208 sub-agent transcripts under this
  project's folders: 0 of 11,964,150 write tokens are 1-hour; 24 session transcripts: 7,889,957 of 7,889,957
  are). So a sub-agent piece is compared with its projection at the 5-minute figure and a session piece at
  the 1-hour one. The calculator prices every piece at the record's one ttl (`SKILL.md` step 3.3).
- **An effort change kept the cache (Stage F9 probe, 2026-11-12, n = 1).** A fresh session on
  claude-fable-5-2 at high (transcript e932f360, 4 calls, 1.31 USD) read two files and answered twice.
  Its parent then set its effort to low with the app's session tool. The call before the change read
  124,950 tokens from the cache and wrote 267; the call after it read 125,223 and wrote 263. One
  direction, one model, the Claude Code desktop app.
- **A fresh session can read its common prefix from the cache (the same probe, n = 1).** Its first call
  read 48,935 tokens and wrote 41,117: another session on the same model had written the prefix inside
  the hour. The formula prices all of B + R as a write, so it reads high by that part for such a start.
- **Transcript ids are not the app's session ids.** The pricer finds `<transcript id>.jsonl`
  under `~/.claude/projects/<folder>/`; a handoff that names the app's id (`local_...`) does not
  locate it. The Source cells give the transcript id first.
- **Per-call figures for the Tsunami pieces were not recorded**, only costs. The coordinator's
  per-call figures are the ones `SKILL.md` step 1.2 already cites.
- **Cache write per call is not F.** The first call writes the whole base (B), so the figure
  after the first call is the closer estimate of growth per turn (F + O).

## What the rows say so far (n = 16 measured rows, estimates of the spread, not findings)

| Quantity | Value | Reading |
|---|---|---|
| Measured over projected, six pieces (Tsunami A to D, O1, F1) | 0.50, 0.50, 0.72, 1.68, 0.63, 1.69; mean 0.95; pooled 40.79 over 47.68 = 0.86 | The pooled projection runs about 14 percent high; the spread is 0.5 to 1.7, so one piece is not predictable within a factor of 2. |
| Measured over projected, O5 | 1.06 at T 60; 0.66 at T 90 | Inside the quoted range. |
| Measured over projected, S6 | 0.94 at T 40; 0.61 at T 60 | Under the range, on 72 calls against 40 to 60: output per call was 623 against the 1,500 assumed. |
| Measured over projected, F7 | 1.39 at T 20 | Over the projection and a little over the handoff's adverse case of about 8: 49 calls against 20, at 1,909 output per call against the 3,000 assumed. |
| Measured over projected, O6 and its two sub-agents | 0.76 (13.60 over 17.94, both at the 1-hour write); 0.71 (1.23 over 1.74) and 0.80 (1.89 over 2.37), each at the 5-minute write a sub-agent makes | Under the projection on all three. O6 made 120 calls against T 120; the sub-agents 41 against 60 and 48 against 70. Output per call was 1,203, 970 and 1,138 against the 1,500, 700 and 900 assumed. |
| Measured over projected, F8 | 1.23 (21.21 over 17.29) at T 60 | Over the projection: 103 calls against T 60, at 1,591 output a call against the 2,000 assumed and 4,123 written a call against 6,000. T was the input that was wrong, as on F1 and F7. |
| Measured over projected, the 24 evaluation subjects | 1.68 (11.29 over about 6.7) | The estimate scaled H3's 5.89 USD for 21 runs, priced at the 5-minute figure on an earlier CLI. These runs wrote 1-hour entries, and five of them each wrote the CLI's own baseline of about 200,000 tokens. |
| Calls over T projected | O1 49 over 60; F1 24 over 15; O5 101 over 60 to 90; S6 72 over 40 to 60; F7 49 over 20; Tsunami coordinator 166 over 25 by hand | T is the input that moves most. The two acceptance stages (F1, Tsunami C and D by cost) ran over; the two build stages ran under. |
| Output per call, four sessions | 2,088 (O1); 4,263 (F1); 1,371 (O5); 623 (S6, Sonnet at medium) | The 1,500 default holds for O5, is low for O1 and F1 (one of them an xhigh acceptance: reasoning is billed as output) and is more than twice S6. |
| Cache write per call after the first, four sessions | 4,177; 10,061; 3,220; 1,809 (S6) | Against F + O of 4,500 (defaults 3,000 + 1,500) and 6,000 (3,000 + 3,000): three of four are inside it; F1, a read-heavy acceptance, is above. |

No default moves on fifteen rows of mixed class and effort. The next formula stage that wants one
moved brings its rows split by class and effort, with a sample size for each.
