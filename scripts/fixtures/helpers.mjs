// Shared by the three script test files: temporary trees, child-process
// runs and the date helpers. Tests never write into the live tree; every
// script runs from a copy under the operating system's temp folder.
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
export const FIXTURES = path.join(ROOT, "scripts", "fixtures");

const two = (n) => String(n).padStart(2, "0");
export const localDate = () => { const d = new Date(); return `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())}`; };
export const utcDate = () => new Date().toISOString().slice(0, 10);
// The gate reads the UTC day today and pricing-new reads the local day. The
// earlier of the two is never "in the future" under either convention and
// is at most one day old, so a fixture dated with it passes both.
export const safeDate = () => [localDate(), utcDate()].sort()[0];

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

// Replaces every price table in a tree copy with one fixture, filled in
// with a date and named for it.
export function setPricing(tree, fixtureName, date) {
  const dir = path.join(tree, "pricing");
  for (const n of fs.readdirSync(dir)) if (n.endsWith(".json")) fs.rmSync(path.join(dir, n));
  const text = fs.readFileSync(path.join(FIXTURES, fixtureName), "utf8").replaceAll("@TODAY@", date);
  fs.writeFileSync(path.join(dir, `${JSON.parse(text).table_date}.json`), text);
}

export function run(script, args = [], opts = {}) {
  const r = spawnSync(process.execPath, [script, ...args], { encoding: "utf8", cwd: opts.cwd, env: { ...process.env, ...opts.env } });
  return { status: r.status, stdout: r.stdout, stderr: r.stderr, out: `${r.stdout}${r.stderr}` };
}

// An environment that points the home folder at a temp folder, so an
// install lands there. Windows reads USERPROFILE, POSIX reads HOME.
export const homeEnv = (home) => ({ HOME: home, USERPROFILE: home });
