#!/usr/bin/env node

// Writes docs/reference/provisions.md from the active standards. Pass --check to
// compare without writing. (CORE.AUTHORING.INDEX.001)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildProvisionIndex, INDEX_PATH } from './provisions.mjs';

const args = process.argv.slice(2);
const check = args.includes('--check');
const here = path.dirname(fileURLToPath(import.meta.url));
const root = args.find((item) => !item.startsWith('--')) ?? path.join(here, '..');

const target = path.join(root, INDEX_PATH);
const expected = `${buildProvisionIndex(root)}\n`;
const actual = fs.existsSync(target) ? fs.readFileSync(target, 'utf8').replace(/\r\n/g, '\n') : null;

if (check) {
  if (actual === expected) {
    console.log(`${INDEX_PATH} is current.`);
    process.exit(0);
  }
  console.error(`${INDEX_PATH} is stale. Run: node tools/generate-provisions.mjs`);
  process.exit(1);
}

fs.mkdirSync(path.dirname(target), { recursive: true });
fs.writeFileSync(target, expected);
console.log(`Wrote ${INDEX_PATH}.`);
