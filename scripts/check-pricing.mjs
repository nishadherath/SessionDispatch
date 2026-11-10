#!/usr/bin/env node
// Validates an installed session-dispatch price table without the source repo: reads the
// newest pricing/<date>.json (or --table), applies the rules of scripts/price-table.mjs,
// prints warnings and errors. Not here: any rule of its own (price-table.mjs owns them all),
// or a fix to the table.
//
// Non-obvious: staleness is judged per family from its `fetched` date, so a table made today
// can still hold a stale family. Exit codes, the same as the gate's: 0 valid; 2 one or more
// priced families are stale and nothing else is wrong; 1 anything else. Flags: --table <file>,
// --today YYYY-MM-DD (tests and dry runs; default the local calendar day).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { localToday, newestTableFile, validateTable } from './price-table.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
function option(name) {
  const index = args.indexOf(name);
  if (index < 0) return undefined;
  if (!args[index + 1] || args[index + 1].startsWith('--')) throw Error(`${name} requires a value`);
  return args[index + 1];
}
try {
  const file = option('--table') ?? newestTableFile(path.join(root, 'pricing'));
  if (!file) throw Error(`no pricing/YYYY-MM-DD.json in ${path.join(root, 'pricing')}; create one with node scripts/pricing-new.mjs`);
  const today = option('--today') ?? localToday();
  const table = JSON.parse(fs.readFileSync(file, 'utf8').replace(/^﻿/, ''));
  const { errors, warnings, stale } = validateTable(table, { fileName: path.basename(file), today });
  for (const warning of warnings) console.log(`warning: ${warning}`);
  for (const error of errors) console.error(`error: ${error}`);
  for (const s of stale) console.error(`stale: families.${s.family} was fetched ${s.fetched}, ${s.ageDays} days before ${today}, past max_age_days ${table.max_age_days}; refresh it from its source page`);
  if (errors.length) process.exitCode = 1;
  else if (stale.length) process.exitCode = 2;
  else console.log(`Price table valid: ${file} (${warnings.length} incomplete entries).`);
} catch (error) { console.error(`price-check: ${error.message}`); process.exitCode = 1; }
