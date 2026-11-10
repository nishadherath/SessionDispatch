#!/usr/bin/env node
// Validate an installed session-dispatch price table without the source repo.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
function option(name) {
  const index = args.indexOf(name);
  if (index < 0) return undefined;
  if (!args[index + 1] || args[index + 1].startsWith('--')) throw Error(`${name} requires a value`);
  return args[index + 1];
}
function validDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}
try {
  const directory = path.join(root, 'pricing');
  const files = fs.readdirSync(directory).filter(n => /^\d{4}-\d{2}-\d{2}\.json$/.test(n)).sort();
  const file = option('--table') ?? path.join(directory, files.at(-1) ?? '');
  const now = new Date();
  const today = option('--today') ?? `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  const table = JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
  const errors = [], warnings = [];
  const fail = message => errors.push(message);
  if (!validDate(today) || !validDate(table.table_date)) fail('today and table_date must be valid YYYY-MM-DD dates');
  if (path.basename(file) !== `${table.table_date}.json`) fail('table_date must match the filename');
  if (!Number.isInteger(table.max_age_days) || table.max_age_days < 1) fail('max_age_days must be a positive integer');
  if (table.currency !== 'USD' || table.unit !== 'per million tokens') fail('currency and unit must be USD per million tokens');
  if (!table.families || typeof table.families !== 'object' || Array.isArray(table.families)) fail('families must be an object');
  const priceKeys = ['input', 'output', 'cache_read', 'cache_write'];
  const ids = new Set();
  const dateAge = d => (Date.parse(today) - Date.parse(d)) / 86400000;
  if (validDate(today) && validDate(table.table_date)) {
    if (dateAge(table.table_date) < 0) fail('table_date is in the future');
    else if (dateAge(table.table_date) > table.max_age_days) fail('table is stale');
  }
  for (const [family, info] of Object.entries(table.families ?? {})) {
    if (!info || typeof info !== 'object' || typeof info.source !== 'string' || !/^https:\/\//.test(info.source) || !info.models || typeof info.models !== 'object' || Array.isArray(info.models)) { fail(`${family}: source or models invalid`); continue; }
    const models = Object.entries(info.models);
    if (info.fetched !== null && (!validDate(info.fetched) || (validDate(today) && dateAge(info.fetched) < 0))) fail(`${family}: fetched date invalid`);
    if (!models.length) warnings.push(`${family}: no models`);
    for (const [id, model] of models) {
      if (ids.has(id)) fail(`${id}: duplicate model id`); ids.add(id);
      if (!model || typeof model !== 'object') { fail(`${id}: invalid model`); continue; }
      if (model.class !== null && !['haiku','sonnet','opus','fable'].includes(model.class)) fail(`${id}: invalid class`);
      const validateRates = (rates, label) => {
        for (const key of priceKeys) {
          const v = rates[key];
          if (v === null) warnings.push(`${label}.${key} is null`);
          else if (typeof v !== 'number' || !Number.isFinite(v) || v < 0) fail(`${label}.${key} must be non-negative or null`);
        }
      };
      if (model.class === null) warnings.push(`${id}.class is null`);
      validateRates(model, id);
      if (model.long_context !== undefined) {
        const lc = model.long_context;
        if (!lc || typeof lc !== 'object' || !Number.isInteger(lc.threshold_tokens) || lc.threshold_tokens <= 0) fail(`${id}.long_context threshold invalid`);
        else validateRates(lc, `${id}.long_context`);
      }
      const hasPrice = priceKeys.some(key => typeof model[key] === 'number');
      if (hasPrice && !validDate(info.fetched)) fail(`${family}: priced models require a fetched date`);
      if (hasPrice && validDate(info.fetched) && validDate(today) && dateAge(info.fetched) > table.max_age_days) fail(`${family}: source figures are stale`);
    }
  }
  for (const warning of warnings) console.log(`warning: ${warning}`);
  if (errors.length) { for (const error of errors) console.error(`error: ${error}`); process.exitCode = 1; }
  else console.log(`Price table valid: ${file} (${ids.size} models; ${warnings.length} incomplete entries).`);
} catch (error) { console.error(`price-check: ${error.message}`); process.exitCode = 1; }
