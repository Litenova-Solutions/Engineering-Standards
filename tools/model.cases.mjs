#!/usr/bin/env node
// Reference passing and failing cases for the model builder check.
//
// Each case copies a fixture to a temporary folder, applies one broken
// overlay, runs the builder check, and asserts the exit code and the finding
// code. The clean small and large fixtures exit 0. Each broken overlay exits
// 1 with its one finding code. An open known gap turns its finding into
// exit 0. An expired one exits 1.
//
// Usage:
//   node tools/model.cases.mjs

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Every finding code the builder emits. The same list lives in
// tools/model/fixtures/README.md. Each code has one overlay folder under
// tools/model/fixtures/broken/<code>/.
const FINDING_CODES = [
  'record-shape',
  'identifier-form',
  'identifier-refused-form',
  'identifier-duplicate',
  'reference-unresolved',
  'draft-gate',
  'owner-unknown',
  'draft-without-decider',
  'known-gap-expired',
  'rule-name-negation',
  'use-case-without-success',
  'case-result-unresolved',
  'refusal-not-thrown',
  'use-case-unimplemented',
  'proves-unconfirmed',
  'profile-type-missing',
  'journey-reach',
  'use-case-access',
  'result-status',
  'region-unknown',
];

const repository = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const fixtures = path.join(repository, 'tools', 'model', 'fixtures');
const toolProject = path.join(repository, 'tools', 'model', 'Litenova.Model');

let failures = 0;
const kept = [];

function freshTemp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'litenova-model-cases-'));
}

function cleanup(tmp) {
  if (process.env.KEEP_FIXTURE) {
    kept.push(tmp);
    return;
  }
  fs.rmSync(tmp, { recursive: true, force: true });
}

// Copies the fixture, then overlays only the files that differ. A DELETES.txt
// file lists relative paths to remove, one per line, for cases that break the
// fixture by deleting a file. It is removed before the check runs.
function prepare(fixtureName, overlayName) {
  const tmp = freshTemp();
  fs.cpSync(path.join(fixtures, fixtureName), tmp, { recursive: true });
  if (overlayName) {
    const overlay = path.join(fixtures, 'broken', overlayName);
    for (const entry of fs.readdirSync(overlay, { recursive: true, withFileTypes: true })) {
      if (!entry.isFile()) continue;
      const relative = path.relative(overlay, path.join(entry.parentPath, entry.name));
      if (relative === 'DELETES.txt') continue;
      const target = path.join(tmp, relative);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.copyFileSync(path.join(overlay, relative), target);
    }
    const deletesFile = path.join(overlay, 'DELETES.txt');
    if (fs.existsSync(deletesFile)) {
      for (const line of fs.readFileSync(deletesFile, 'utf8').split('\n')) {
        const relative = line.trim();
        if (relative) fs.rmSync(path.join(tmp, relative), { force: true });
      }
    }
  }
  return tmp;
}

function runCheck(tmp) {
  const result = spawnSync(
    'dotnet',
    ['run', '--project', toolProject, '--', 'check', '--root', tmp, '--format', 'json'],
    { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 },
  );
  return { status: result.status, output: `${result.stdout ?? ''}${result.stderr ?? ''}` };
}

function report(name, expectedStatus, expectedCode, actual) {
  const codeFound = expectedCode === null || actual.output.includes(expectedCode);
  if (actual.status === expectedStatus && codeFound) {
    console.log(`  pass  ${name}`);
    return;
  }
  failures += 1;
  console.log(`  FAIL  ${name}`);
  console.log(`        expected exit ${expectedStatus}${expectedCode ? ` with '${expectedCode}'` : ''}, got exit ${actual.status}`);
  if (expectedCode && !codeFound) console.log(`        output carries no '${expectedCode}'`);
}

function gapFile(endsBy) {
  const meta = {
    type: 'known-gap',
    id: 'known-gap/list-loans-unimplemented',
    title: 'List loans unimplemented',
    owner: 'lending-team',
    status: 'approved',
    check: 'use-case-unimplemented',
    subject: ['use-case/lending.list-loans'],
    endsBy,
    reason: 'Listing waits for the search index.',
  };
  return `---\n${JSON.stringify(meta, null, 2)}\n---\n\n# List loans unimplemented\n\nListing loans has no handler yet.\n`;
}

console.log('Clean fixtures');
{
  const tmp = prepare('small', null);
  report('clean small fixture exits 0', 0, null, runCheck(tmp));
  cleanup(tmp);
}
{
  const tmp = prepare('large', null);
  report('clean large fixture exits 0', 0, null, runCheck(tmp));
  cleanup(tmp);
}

console.log('\nBroken overlays');
for (const code of FINDING_CODES) {
  const overlay = path.join(fixtures, 'broken', code);
  if (!fs.existsSync(overlay)) {
    failures += 1;
    console.log(`  FAIL  overlay '${code}' is missing under fixtures/broken/`);
    continue;
  }
  const tmp = prepare('large', code);
  report(`broken overlay '${code}' exits 1`, 1, code, runCheck(tmp));
  cleanup(tmp);
}

console.log('\nKnown gaps');
{
  // An open gap names the finding code and the subject, so the finding is
  // reported as known and the run exits 0.
  const tmp = prepare('large', 'use-case-unimplemented');
  fs.writeFileSync(path.join(tmp, 'docs/known-gaps/list-loans-unimplemented.md'), gapFile('2027-06-01'));
  report('open known gap turns its finding into exit 0', 0, null, runCheck(tmp));
  cleanup(tmp);
}
{
  // The same gap past its end date no longer covers the finding.
  const tmp = prepare('large', 'use-case-unimplemented');
  fs.writeFileSync(path.join(tmp, 'docs/known-gaps/list-loans-unimplemented.md'), gapFile('2020-01-01'));
  report('expired known gap exits 1', 1, null, runCheck(tmp));
  cleanup(tmp);
}

console.log('\nRefused bare prefixes');
{
  // A bare refused prefix with nothing after it, as documentation listing
  // the refused forms writes it, is not a finding.
  const tmp = prepare('large', 'refused-bare-prefix');
  report('bare refused prefixes exit 0', 0, null, runCheck(tmp));
  cleanup(tmp);
}

if (process.env.KEEP_FIXTURE) for (const tmp of kept) console.log(`fixture: ${tmp}`);
console.log(`\n${failures ? `FAIL (${failures} case(s))` : 'PASS: every case behaved as specified'}`);
process.exit(failures ? 1 : 0);
