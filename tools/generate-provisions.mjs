#!/usr/bin/env node

// Writes docs/reference/provisions.md from the active standards. Pass --check to
// compare without writing. (CORE.AUTHORING.INDEX.001)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildProvisionIndex, INDEX_PATH } from './provisions.mjs';

const USAGE = `Usage: node tools/generate-provisions.mjs [repositoryRoot] [--check] [--help]

Writes ${INDEX_PATH} from the active standards in repositoryRoot, which defaults
to the repository this file sits in.

  --check   Compare the tracked index with the generated one and write nothing.
  --help    Print this text and exit.

Exit codes: 0 written or current, 1 stale under --check, 2 usage error.`;

const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(USAGE);
  process.exit(0);
}
const check = args.includes('--check');
const unknown = args.filter((item) => item.startsWith('-') && item !== '--check');
if (unknown.length) {
  console.error(`Unknown option ${unknown.join(', ')}`);
  console.error(USAGE);
  process.exit(2);
}
const here = path.dirname(fileURLToPath(import.meta.url));
const root = args.find((item) => !item.startsWith('-')) ?? path.join(here, '..');

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
