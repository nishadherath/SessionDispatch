// The installer (scripts/install.mjs) run as a child process with the home
// folder pointed at a temporary directory: dry run writes nothing, the
// payload carries the runnable scripts, --check finds files that are
// behind, --seed copies the protocol kit and refuses to overwrite.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { homeEnv, ROOT, rm, run, tmpDir } from "./fixtures/helpers.mjs";

const INSTALL = path.join(ROOT, "scripts", "install.mjs");
const SKILL_DIR = (home) => path.join(home, ".claude", "skills", "session-dispatch");

function withDirs(label, fn) {
  const home = tmpDir(`${label}-home`);
  const repo = tmpDir(`${label}-repo`);
  try { fn(home, repo); } finally { rm(home); rm(repo); }
}
const install = (home, args) => run(INSTALL, args, { env: homeEnv(home) });
const listAll = (dir) => fs.readdirSync(dir, { recursive: true });

// Protocol section 9, file by file.
const SEED_FILES = [
  "AGENTS.md",
  "docs/operator-protocol.md",
  "docs/handoffs/README.md",
  ".claude/helpers/operator-protocol.cjs",
  ".claude/settings.json",
  ...["fable", "haiku", "opus", "sonnet"].map((c) => `ENGINEERING_PERSONA.${c}.md`),
  ...fs.readdirSync(path.join(ROOT, "ENGINEERING_PERSONA_LANGUAGES")).sort().map((n) => `ENGINEERING_PERSONA_LANGUAGES/${n}`),
  "docs/status.md",
  "docs/operator-preferences.json",
];

test("dry run writes nothing for every harness", () => {
  withDirs("dry", (home) => {
    const r = install(home, ["--harness", "all", "--dry-run"]);
    assert.equal(r.status, 0, r.out);
    assert.match(r.stdout, /dry run, nothing written/);
    assert.deepEqual(fs.readdirSync(home), []);
  });
});

test("the payload carries the runnable scripts and not the gate, the installer or tests", () => {
  withDirs("payload", (home) => {
    const r = install(home, []);
    assert.equal(r.status, 0, r.out);
    const files = listAll(SKILL_DIR(home)).map((f) => f.split(path.sep).join("/"));
    assert.ok(files.includes("SKILL.md"));
    assert.ok(files.includes("scripts/pricing-new.mjs"), "the installed copy must be able to run its own refresh");
    assert.ok(!files.includes("scripts/check.mjs"));
    assert.ok(!files.includes("scripts/install.mjs"));
    assert.ok(!files.some((f) => f.endsWith(".test.mjs") || f.startsWith("scripts/fixtures")));
  });
});

test("--user is the explicit form of the default", () => {
  withDirs("user", (home) => {
    const a = install(home, ["--user", "--dry-run"]);
    const b = install(home, ["--dry-run"]);
    assert.equal(a.status, 0, a.out);
    assert.equal(a.stdout, b.stdout);
    assert.ok(a.stdout.includes(SKILL_DIR(home)), a.stdout);
  });
});

test("an unknown argument is refused with the accepted list", () => {
  withDirs("unknown", (home) => {
    const r = install(home, ["--usr"]);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /unknown argument "--usr"; accepted:/);
    assert.deepEqual(fs.readdirSync(home), []);
  });
});

test("--check passes on a fresh install, names a changed and a missing file, and ignores extras", () => {
  withDirs("check", (home) => {
    assert.equal(install(home, []).status, 0);
    let r = install(home, ["--check"]);
    assert.equal(r.status, 0, r.out);
    assert.match(r.stdout, /checked 1 installed copy, 0 file\(s\) behind/);

    // Same size, different bytes: only the hash can see it.
    const skill = path.join(SKILL_DIR(home), "SKILL.md");
    const original = fs.readFileSync(skill, "utf8");
    fs.writeFileSync(skill, original.replace("session-dispatch", "session-dispatcX"));
    assert.equal(fs.statSync(skill).size, Buffer.byteLength(original));
    fs.rmSync(path.join(SKILL_DIR(home), "templates", "handoff.md"));
    fs.writeFileSync(path.join(SKILL_DIR(home), "pricing", "2019-01-01.json"), "{}\n");
    r = install(home, ["--check"]);
    assert.equal(r.status, 1, r.out);
    assert.match(r.stdout, /behind {2}SKILL\.md \(repository \d+ bytes sha256 [0-9a-f]{12}, installed \d+ bytes sha256 [0-9a-f]{12}\)/);
    assert.match(r.stdout, /missing templates\/handoff\.md/);
    assert.match(r.stdout, /extra {3}pricing\/2019-01-01\.json/);
    assert.match(r.stdout, /2 of \d+ file\(s\) behind/);

    // --check is read only: with --dry-run the result is the same and nothing is written.
    const before = fs.readFileSync(path.join(SKILL_DIR(home), "SKILL.md"), "utf8");
    r = install(home, ["--check", "--dry-run"]);
    assert.equal(r.status, 1);
    assert.equal(fs.readFileSync(path.join(SKILL_DIR(home), "SKILL.md"), "utf8"), before);
  });
});

test("--check with nothing installed says so; naming an absent harness fails", () => {
  withDirs("check-none", (home) => {
    let r = install(home, ["--check"]);
    assert.equal(r.status, 0, r.out);
    assert.match(r.stdout, /checked 0 installed copies, 0 file\(s\) behind \(nothing is installed/);
    r = install(home, ["--check", "--harness", "codex"]);
    assert.equal(r.status, 1, r.out);
    assert.match(r.stdout, /is not installed; run node scripts\/install\.mjs --harness codex/);
  });
});

test("--check covers a project copy", () => {
  withDirs("check-project", (home, repo) => {
    assert.equal(install(home, ["--project", repo]).status, 0);
    assert.equal(install(home, ["--check", "--project", repo]).status, 0);
    fs.appendFileSync(path.join(repo, ".claude", "skills", "session-dispatch", "SKILL.md"), "x");
    const r = install(home, ["--check", "--project", repo]);
    assert.equal(r.status, 1, r.out);
    assert.match(r.stdout, /behind {2}SKILL\.md/);
  });
});

test("--seed dry run lists every file of protocol section 9 and writes nothing", () => {
  withDirs("seed-dry", (home, repo) => {
    const r = install(home, ["--seed", repo, "--dry-run"]);
    assert.equal(r.status, 0, r.out);
    for (const rel of SEED_FILES) assert.ok(r.stdout.includes(` ${rel}\n`), `dry run does not list ${rel}`);
    assert.match(r.stdout, new RegExp(`${SEED_FILES.length} of ${SEED_FILES.length} file\\(s\\) would be written`));
    assert.deepEqual(fs.readdirSync(repo), []);
  });
});

test("--seed produces a tree whose hook prints the reminder lines, with the skeletons reset", () => {
  withDirs("seed", (home, repo) => {
    const r = install(home, ["--seed", repo]);
    assert.equal(r.status, 0, r.out);
    for (const rel of SEED_FILES) assert.ok(fs.existsSync(path.join(repo, ...rel.split("/"))), `${rel} not written`);

    const hook = run(path.join(repo, ".claude", "helpers", "operator-protocol.cjs"), [], { cwd: repo, env: { CLAUDE_PROJECT_DIR: repo } });
    assert.equal(hook.status, 0, hook.out);
    assert.match(hook.stdout, /\[operator-protocol\] docs\/operator-protocol\.md is in force/);
    assert.match(hook.stdout, /No handoff on file yet/);
    assert.match(hook.stdout, /Unanswered operator question \(ste100:/);
    assert.match(hook.stdout, /Unanswered operator question \(autonomy:/);

    const prefs = JSON.parse(fs.readFileSync(path.join(repo, "docs", "operator-preferences.json"), "utf8"));
    for (const q of Object.values(prefs.questions)) assert.deepEqual([q.answer, q.asked, q.recorded, q.note], [null, null, null, null]);
    const status = fs.readFileSync(path.join(repo, "docs", "status.md"), "utf8");
    for (const h of ["## Done", "## In progress", "## To do", "## Decisions waiting"]) assert.ok(status.includes(`\n${h}\n`), h);
    assert.ok(!status.includes("Stage O1"), "status must not carry this project's rows");
    assert.deepEqual(fs.readdirSync(path.join(repo, "docs", "handoffs")), ["README.md"]);

    const agents = fs.readFileSync(path.join(repo, "AGENTS.md"), "utf8");
    assert.ok(agents.startsWith("Model class:"));
    assert.ok(agents.includes("## Operator protocol (always on)"));
    assert.ok(!agents.includes("## Daily commands"), "only the protocol section is seeded");
    const settings = JSON.parse(fs.readFileSync(path.join(repo, ".claude", "settings.json"), "utf8"));
    assert.ok(JSON.stringify(settings.hooks.SessionStart).includes("operator-protocol.cjs"));
  });
});

test("--seed is idempotent and refuses to overwrite a changed file unless --force", () => {
  withDirs("seed-force", (home, repo) => {
    assert.equal(install(home, ["--seed", repo]).status, 0);
    let r = install(home, ["--seed", repo]);
    assert.equal(r.status, 0, r.out);
    assert.match(r.stdout, /0 written, \d+ unchanged/);

    const proto = path.join(repo, "docs", "operator-protocol.md");
    fs.writeFileSync(proto, "local text\n");
    r = install(home, ["--seed", repo]);
    assert.equal(r.status, 1, r.out);
    assert.match(r.stderr, /already differ: docs\/operator-protocol\.md; nothing written/);
    assert.equal(fs.readFileSync(proto, "utf8"), "local text\n");

    r = install(home, ["--seed", repo, "--force"]);
    assert.equal(r.status, 0, r.out);
    assert.equal(fs.readFileSync(proto, "utf8"), fs.readFileSync(path.join(ROOT, "docs", "operator-protocol.md"), "utf8"));
  });
});

test("--seed merges into an existing AGENTS.md and settings.json only with --force", () => {
  withDirs("seed-merge", (home, repo) => {
    const agents = path.join(repo, "AGENTS.md");
    const settings = path.join(repo, ".claude", "settings.json");
    fs.mkdirSync(path.dirname(settings), { recursive: true });
    fs.writeFileSync(agents, "# My project\n\nOwn rules.\n");
    fs.writeFileSync(settings, JSON.stringify({ permissions: { allow: ["Bash(node:*)"] } }));

    let r = install(home, ["--seed", repo]);
    assert.equal(r.status, 1, r.out);
    assert.equal(fs.readFileSync(agents, "utf8"), "# My project\n\nOwn rules.\n");

    r = install(home, ["--seed", repo, "--force"]);
    assert.equal(r.status, 0, r.out);
    const merged = fs.readFileSync(agents, "utf8");
    assert.ok(merged.startsWith("Model class:"));
    assert.ok(merged.includes("# My project\n\nOwn rules."), "the project's own text survives");
    assert.ok(merged.includes("## Operator protocol (always on)"));
    const s = JSON.parse(fs.readFileSync(settings, "utf8"));
    assert.deepEqual(s.permissions, { allow: ["Bash(node:*)"] });
    assert.equal(s.hooks.SessionStart.length, 1);

    // A second forced run changes nothing further.
    r = install(home, ["--seed", repo, "--force"]);
    assert.equal(r.status, 0, r.out);
    assert.equal(fs.readFileSync(agents, "utf8"), merged);
    assert.equal(JSON.parse(fs.readFileSync(settings, "utf8")).hooks.SessionStart.length, 1);
  });
});

test("--seed refuses invalid settings.json even with --force, this repository, and mixed modes", () => {
  withDirs("seed-refuse", (home, repo) => {
    fs.mkdirSync(path.join(repo, ".claude"));
    fs.writeFileSync(path.join(repo, ".claude", "settings.json"), "{ not json");
    let r = install(home, ["--seed", repo, "--force"]);
    assert.equal(r.status, 1, r.out);
    assert.match(r.stderr, /not valid JSON/);
    assert.equal(fs.readFileSync(path.join(repo, ".claude", "settings.json"), "utf8"), "{ not json");

    r = install(home, ["--seed", ROOT, "--dry-run"]);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /this repository/);

    r = install(home, ["--seed", repo, "--harness", "codex"]);
    assert.equal(r.status, 1);
    r = install(home, ["--force"]);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /--force applies to --seed only/);
  });
});
