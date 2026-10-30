# Install the skill

This document is written in Simplified Technical English (ASD-STE100)
style: short sentences, one instruction in each step, no idioms. Use it
to install the `session-dispatch` skill on your computer.

## What you need

- Node.js 20 or later. Type `node --version` to check.
- A copy of this repository on your disk.
- At least one supported harness: Claude Code, Codex, Z-Code, OpenCode,
  Cline, Gemini CLI or Antigravity.

You do not need `npm install`. The scripts use only the Node.js standard
library.

## What the installer does

The installer copies the skill folder to the place where each harness
looks for skills. The skill folder holds `SKILL.md`, `pricing/`,
`templates/`, `examples/` and the scripts that can run from an installed
copy.

The installer does not change your instruction files. It prints a
pointer block for each harness. You paste that block into the harness
instruction file yourself.

The installer makes copies. It does not make links. If you move this
repository, the installed copies keep working.

## Install for Claude Code

1. Open a terminal in the repository folder.
2. Run this command:

   ```bash
   node scripts/install.mjs
   ```

3. Wait for the line `install: done`.

The skill is now in `~/.claude/skills/session-dispatch/`. Each Claude
Code session on this computer can use it.

To install in one project only, run this command:

```bash
node scripts/install.mjs --project D:/path/to/repo
```

## Install for other harnesses

Name the harnesses in a comma-separated list:

```bash
node scripts/install.mjs --harness codex,zcode,opencode,cline,gemini
```

To install for all harnesses, use `--harness all`.

| Name | The installer writes | You paste the pointer block into |
|---|---|---|
| `claude` | `~/.claude/skills/session-dispatch/` | The `AGENTS.md` or `CLAUDE.md` of your project |
| `codex` | `~/.codex/skills/session-dispatch/` | `~/.codex/AGENTS.md` |
| `zcode` | `~/.zcode/skills/session-dispatch/` | The `AGENTS.md` or `CLAUDE.md` of your project |
| `opencode` | `~/.config/opencode/skill/session-dispatch/` | `~/.config/opencode/AGENTS.md` |
| `cline` | The rule file `~/Documents/Cline/Rules/session-dispatch.md` | Nothing. The rule file is the pointer. |
| `gemini` | Nothing. It uses the Claude copy. | `~/.gemini/GEMINI.md` |

Gemini CLI and Antigravity read the same `GEMINI.md` file. Install the
`claude` copy first, because the Gemini pointer names that copy.

## Paste the pointer block

1. Read the pointer block that the installer prints.
2. Open the instruction file named in the table above.
3. Paste the block at the end of the file.
4. Save the file.

If the file already holds a `Session dispatch` section, replace that
section. Do not keep two sections.

## Preview before you install

Add `--dry-run` to any command. The installer then prints what it would
do and writes nothing.

```bash
node scripts/install.mjs --harness all --dry-run
```

## Check that the installed copies are current

After you change the skill or refresh a price table, run this command:

```bash
node scripts/install.mjs --check
```

The command compares each installed file with the repository. It reports
`current` for a copy that matches. It reports the number of files that
are behind for a copy that does not match. The exit code is 0 when no
file is behind. The exit code is 1 when one or more files are behind.

To fix a copy that is behind, run the install command that the check
prints for that copy.

Use `--harness` or `--project` to check only some copies. A missing copy
then counts as behind.

## Start a new project with the operator protocol

```bash
node scripts/install.mjs --seed D:/path/to/new-repo --dry-run
```

Use an existing, empty folder. Read the preview. Then run the command
again without `--dry-run`. The installer refuses to overwrite a file
that differs. Add `--force` to replace such a file. With `--force`, an
existing `AGENTS.md` and an existing `.claude/settings.json` are merged
and never replaced.

## Test that the skill loads

1. Start a new session in the harness.
2. Give the session a task of more than ten turns, or ask it to plan
   a model change.
3. Look for a decision record with the headings from
   `templates/decision-record.md`.

If the session does not run the skill, check two things. First, check
that the pointer block is in the instruction file that the harness
reads. Second, check that the path in the pointer block exists.

## Update the price table

The skill refuses a price table that is more than 14 days old. When
this happens, run the following command in this repository:

```bash
node scripts/pricing-new.mjs
```

Fill the figures from the source pages that the new file names. Then
run `node scripts/check.mjs` and `node scripts/install.mjs --check`.

## Troubleshooting

| Symptom | Cause | Action |
|---|---|---|
| `node` is not found | Node.js is not installed or not on the path | Install Node.js 20 or later |
| `--check` reports files behind | The repository changed after the last install | Run the install command again |
| The harness does not use the skill | The pointer block is not in the instruction file | Paste the block (see above) |
| The skill says the table is stale | The newest price table is more than 14 days old | Refresh the table (see above) |
| The installer says a flag is not valid | A flag has a typing error | Use a flag from `node scripts/install.mjs --help` |

For harness-specific detail, read `adapters/<harness>.md`.
