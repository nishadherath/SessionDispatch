#!/usr/bin/env node
// Starts a price-table refresh: copies the newest pricing/<date>.json to
// today's date with table_date updated and every figure unchanged, then
// lists the nulls so the operator (or a model with the operator's yes)
// knows what to fill from each family's source page. Refuses to overwrite
// today's file. Standard library only, Node 20 or later.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dir = path.join(ROOT, "pricing");
const names = fs.readdirSync(dir).filter((n) => /^\d{4}-\d{2}-\d{2}\.json$/.test(n)).sort();
if (names.length === 0) { console.error(`pricing-new: no table in ${dir} to copy from`); process.exit(1); }
const today = new Date().toISOString().slice(0, 10);
const target = path.join(dir, `${today}.json`);
if (fs.existsSync(target)) { console.error(`pricing-new: ${target} exists; edit it rather than starting again`); process.exit(1); }

const source = path.join(dir, names[names.length - 1]);
const table = JSON.parse(fs.readFileSync(source, "utf8"));
table.table_date = today;
fs.writeFileSync(target, JSON.stringify(table, null, 2) + "\n");
console.log(`pricing-new: ${path.relative(ROOT, source)} -> ${path.relative(ROOT, target)} (figures unchanged)`);

let nulls = 0;
for (const [fam, f] of Object.entries(table.families ?? {})) {
  const missing = [];
  for (const [id, m] of Object.entries(f.models ?? {})) {
    const keys = ["class", "input", "output", "cache_read", "cache_write"].filter((k) => m[k] === null);
    if (keys.length) missing.push(`${id} (${keys.join(", ")})`);
  }
  if (Object.keys(f.models ?? {}).length === 0) missing.push("no models listed");
  if (missing.length) { nulls += missing.length; console.log(`  ${fam}: fill from ${f.source}: ${missing.join("; ")}`); }
}
console.log(`pricing-new: ${nulls} item(s) to fill; set each family's "fetched" to the day you read its page, then run node scripts/check.mjs`);
