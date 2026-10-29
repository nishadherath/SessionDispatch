// Shared by the three script test files: temporary trees, child-process
// runs and the date helper. Tests never write into the live tree; every
// script runs from a copy under the operating system's temp folder.
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
export const FIXTURES = path.join(ROOT, "scripts", "fixtures");

const two = (n) => String(n).padStart(2, "0");
// The local calendar day: the one convention pricing-new.mjs, check.mjs and
// dispatch.mjs share (check.mjs and dispatch.mjs take --today to override it).
export const localDate = () => { const d = new Date(); return `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())}`; };

export const tmpDir = (label) => fs.mkdtempSync(path.join(os.tmpdir(), `sd-${label}-`));
export const rm = (dir) => fs.rmSync(dir, { recursive: true, force: true });

// A copy of the repository without version control, nested worktrees or
// dependencies, ready to be mutated by one test.
export function copyTree(dest) {
  fs.cpSync(ROOT, dest, {
    recursive: true,
    filter: (src) => {
      const rel = path.relative(ROOT, src).split(path.sep).join("/");
      return !(rel === ".git" || rel.startsWith(".git/") || rel === ".claude/worktrees" || rel.startsWith(".claude/worktrees/") || rel === "node_modules" || rel.startsWith("node_modules/"));
    },
  });
}

// Adds a synthetic family with a null price beside a fetched date to the
// newest table of a tree copy: the shape the gate must reject. The
// repository's own rows stay, because the gate recomputes every worked
// example from the table that example names.
export function addNullPrice(tree) {
  const dir = path.join(tree, "pricing");
  const newest = fs.readdirSync(dir).filter((n) => /^\d{4}-\d{2}-\d{2}\.json$/.test(n)).sort().pop();
  const file = path.join(dir, newest);
  const table = JSON.parse(fs.readFileSync(file, "utf8"));
  table.families.fixture = {
    source: "https://example.test/pricing",
    fetched: table.table_date,
    models: { "fixture-model-a": { class: "haiku", input: 1, output: null, cache_read: 0.1, cache_write: 1.25 } },
  };
  fs.writeFileSync(file, JSON.stringify(table, null, 2) + "\n");
}

export function run(script, args = [], opts = {}) {
  const r = spawnSync(process.execPath, [script, ...args], { encoding: "utf8", cwd: opts.cwd, env: { ...process.env, ...opts.env } });
  return { status: r.status, stdout: r.stdout, stderr: r.stderr, out: `${r.stdout}${r.stderr}` };
}

// An environment that points the home folder at a temp folder, so an
// install lands there. Windows reads USERPROFILE, POSIX reads HOME.
export const homeEnv = (home) => ({ HOME: home, USERPROFILE: home });
