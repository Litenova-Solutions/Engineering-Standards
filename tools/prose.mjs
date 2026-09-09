// Controlled technical prose measures and the project language record.
//
// Both validators read this module. `validate-standards.mjs` applies it to the
// standards repository's own pages, and `validate-consumer.mjs` applies it to a
// consumer's specification tree. A second copy of these rules would drift from
// the first, and the drift would be invisible: each validator would keep
// reporting a pass against its own idea of the profile.
//
// The measures come from `docs/core/authoring.md`. The language record comes
// from `schemas/language.schema.json`, which is the project's own vocabulary
// rather than anything this file names.

const VAGUE_TERMS = [
  ['etc.', /\betc\./i],
  ['and so on', /\band so on\b/i],
  ['as appropriate', /\bas appropriate\b/i],
  ['as needed', /\bas needed\b/i],
  ['simply', /\bsimply\b/i],
  ['just', /\bjust\b/i],
  ['basically', /\bbasically\b/i],
  ['obvious', /\bobvious(?:ly)?\b/i],
  ['clearly', /\bclearly\b/i],
  ['very', /\bvery\b/i],
  ['really', /\breally\b/i],
];

const CONTRACTIONS = /\b(?:ain't|aren't|can't|couldn't|didn't|doesn't|don't|hadn't|hasn't|haven't|he'd|he'll|he's|how'd|how'll|how's|i'd|i'll|i'm|i've|isn't|it'd|it'll|it's|let's|mightn't|mustn't|shan't|she'd|she'll|she's|shouldn't|that's|there'd|there'll|there's|they'd|they'll|they're|they've|wasn't|we'd|we'll|we're|we've|weren't|what'd|what'll|what're|what's|what've|where'd|where'll|where's|who'd|who'll|who's|won't|wouldn't|you'd|you'll|you're|you've)\b/i;

const AND_OR = /\band\/or\b/i;

export const PROSE_LIMITS = Object.freeze({
  sentence: 25,
  listSentence: 20,
  tableCell: 20,
  paragraphSentences: 6,
});

export const PROSE_DIAGNOSTIC_CODES = Object.freeze([
  'PROSE_AND_OR',
  'PROSE_CONTRACTION',
  'PROSE_LIST_LENGTH',
  'PROSE_PARAGRAPH_LENGTH',
  'PROSE_SENTENCE_LENGTH',
  'PROSE_TABLE_CELL_LENGTH',
  'PROSE_VAGUE_TERM',
]);

export const LANGUAGE_DIAGNOSTIC_CODES = Object.freeze([
  'LANGUAGE_MANNERED_TERM',
  'LANGUAGE_REJECTED_SYNONYM',
]);

export { VAGUE_TERMS, CONTRACTIONS, AND_OR };

// ---- text reduction --------------------------------------------------------

// A fenced block is literal content, so the measures do not reach inside one.
// The line is replaced rather than dropped, which keeps every reported line
// number equal to the line number in the file.
export function stripFences(lines) {
  const result = [];
  let fence = false;
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const fenceMarkers = line.match(/```/g)?.length ?? 0;
    if (fenceMarkers) {
      if (fenceMarkers % 2 === 1) fence = !fence;
      result.push({ line: '', number: index + 1, fenced: true });
      continue;
    }
    result.push({ line: fence ? '' : line, number: index + 1, fenced: fence });
  }
  return result;
}

// Inline code, a link destination, and a URL each count as one word, so each
// reduces to a single token rather than to its own character content.
export function visibleText(value) {
  return value
    .replace(/^\s*\*\*(?:Requirement|Deviation|Rationale|Example|Default|Replacement):\*\*\s*/i, '')
    .replace(/`[^`]*`/g, ' TOKEN ')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/<https?:[^>]+>/g, ' URL ')
    .replace(/https?:\/\/\S+/g, ' URL ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[*_~]/g, '')
    .replace(/\{#[^}]+\}/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function words(value) {
  return visibleText(value).match(/[A-Za-z0-9][A-Za-z0-9@#%+&'./:-]*/g) ?? [];
}

export function sentences(value) {
  const text = visibleText(value)
    .replace(/\b(?:Mr|Mrs|Ms|Dr|vs)\./g, (match) => match.replace('.', ''))
    .replace(/\b[A-Z]\./g, (match) => match.replace('.', ''))
    .replace(/\.(?=[A-Za-z0-9])/g, '')
    .replace(/(?<=[A-Za-z0-9])\.(?=[A-Za-z0-9])/g, '')
    .trim();
  if (!text) return [];
  const found = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [];
  return found.map((item) => item.trim()).filter(Boolean);
}

// ---- prose measures --------------------------------------------------------

// Walks a Markdown page and reports every controlled-prose measure it breaks.
// `add(relative, line, code, message)` receives each finding.
export function checkProseMeasures(relative, raw, add) {
  const lines = stripFences(raw.split(/\r?\n/));
  let paragraph = [];
  let list = [];

  const scanTerms = (value, number) => {
    const visible = visibleText(value);
    for (const [term, pattern] of VAGUE_TERMS) {
      if (pattern.test(visible)) add(relative, number, 'PROSE_VAGUE_TERM', `replace vague term '${term}'`);
    }
    const contraction = visible.match(CONTRACTIONS);
    if (contraction) add(relative, number, 'PROSE_CONTRACTION', `replace contraction '${contraction[0]}' with its full form`);
    if (AND_OR.test(visible)) add(relative, number, 'PROSE_AND_OR', "replace 'and/or' with an exact relationship");
  };

  const flushParagraph = () => {
    if (!paragraph.length) return;
    const number = paragraph[0].number;
    const value = paragraph.map((item) => item.line).join(' ');
    const found = sentences(value);
    if (found.length > PROSE_LIMITS.paragraphSentences) {
      add(relative, number, 'PROSE_PARAGRAPH_LENGTH', `paragraph has ${found.length} sentences; maximum is ${PROSE_LIMITS.paragraphSentences}`);
    }
    for (const sentence of found) {
      const count = words(sentence).length;
      if (count > PROSE_LIMITS.sentence) {
        add(relative, number, 'PROSE_SENTENCE_LENGTH', `sentence has ${count} words; maximum is ${PROSE_LIMITS.sentence}: '${visibleText(sentence).slice(0, 120)}'`);
      }
    }
    scanTerms(value, number);
    paragraph = [];
  };

  const flushList = () => {
    if (!list.length) return;
    const number = list[0].number;
    const value = list.map((item) => item.line).join(' ');
    const content = value.replace(/^\s*(?:[-*+] |\d+\.\s+)/, '');
    for (const sentence of sentences(content)) {
      const count = words(sentence).length;
      if (count > PROSE_LIMITS.listSentence) {
        add(relative, number, 'PROSE_LIST_LENGTH', `list sentence has ${count} words; maximum is ${PROSE_LIMITS.listSentence}: '${visibleText(sentence).slice(0, 120)}'`);
      }
    }
    scanTerms(value, number);
    list = [];
  };

  for (const item of lines) {
    const line = item.line;
    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }
    if (/^\s*(?:[-*+] |\d+\.\s+)/.test(line)) {
      flushParagraph();
      flushList();
      list.push(item);
      continue;
    }
    if (list.length && /^\s{2,}\S/.test(line)) {
      list.push(item);
      continue;
    }
    flushList();
    if (/^#{1,6}\s/.test(line) || /^\s*</.test(line) || /^\s*---\s*$/.test(line)) {
      flushParagraph();
      continue;
    }
    if (/^\s*\|/.test(line)) {
      flushParagraph();
      if (!/^\s*\|?\s*:?-+/.test(line)) {
        const cells = line.split('|').slice(1, -1);
        for (const cell of cells) {
          const count = words(cell).length;
          if (count > PROSE_LIMITS.tableCell) {
            add(relative, item.number, 'PROSE_TABLE_CELL_LENGTH', `table cell has ${count} words; maximum is ${PROSE_LIMITS.tableCell}: '${visibleText(cell).slice(0, 120)}'`);
          }
          scanTerms(cell, item.number);
        }
      }
      continue;
    }
    paragraph.push(item);
  }
  flushParagraph();
  flushList();
}

// ---- language record -------------------------------------------------------

// A word is matched on its own, so `place` does not fire inside `placement` and
// a rejection of `seat` leaves `seating-plan` alone. The boundary is built from
// the term rather than taken from `\b`, because a term can carry a hyphen.
function termPattern(term) {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?<![A-Za-z0-9-])${escaped}(?:'s|s'|s|es)?(?![A-Za-z0-9-])`, 'gi');
}

// A column that exists to list rejected words has to be able to contain them.
// A glossary states `Avoid` beside each term and a module states
// `Rejected synonyms`, so those cells are the rule rather than a breach of it.
const REJECTION_COLUMN = /^\s*(?:avoid|rejected|rejected names?|rejected synonyms?)\s*$/i;

// Blanks the cells that sit under a rejection column, keeping every other
// character in place so a reported offset still maps to its own line.
function blankRejectionColumns(text) {
  const lines = text.split('\n');
  let columns = null;
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!/^\s*\|/.test(line)) { columns = null; continue; }
    const cells = line.split('|');
    if (/^\s*\|?[\s:|-]+$/.test(line)) continue;
    if (columns === null) {
      columns = new Set();
      for (let cell = 0; cell < cells.length; cell += 1) if (REJECTION_COLUMN.test(cells[cell])) columns.add(cell);
      continue;
    }
    if (!columns.size) continue;
    for (const cell of columns) if (cells[cell] !== undefined) cells[cell] = ' '.repeat(cells[cell].length);
    lines[index] = cells.join('|');
  }
  return lines.join('\n');
}

// A metadata block is machine content and an owner name is not prose, so the
// scan starts after the block. A fenced block is code, and a link destination
// is a path rather than a sentence.
function scannableProse(raw) {
  return blankRejectionColumns(raw
    .replace(/^---\r?\n\{[\s\S]*?\r?\n\}\r?\n---\r?\n/, (match) => match.replace(/[^\n]/g, ' '))
    .replace(/```[\s\S]*?```/g, (match) => match.replace(/[^\n]/g, ' '))
    .replace(/`[^`\n]*`/g, (match) => ' '.repeat(match.length))
    .replace(/\]\([^)\n]*\)/g, (match) => ' '.repeat(match.length)));
}

function lineOf(text, index) {
  return text.slice(0, index).split('\n').length;
}

// Compiles a language record once so a scan over many files does not rebuild
// every pattern per file.
export function compileLanguage(language) {
  if (!language) return null;
  const mannered = (language.mannered ?? []).map((entry) => ({
    term: entry.term,
    instead: entry.instead,
    pattern: termPattern(entry.term),
  }));
  const rejected = [];
  for (const entry of language.terms ?? []) {
    for (const synonym of entry.rejected ?? []) {
      rejected.push({
        term: entry.term,
        synonym,
        scope: entry.scope ? new RegExp(entry.scope) : null,
        reason: entry.reason,
        pattern: termPattern(synonym),
      });
    }
  }
  return { mannered, rejected };
}

// Reports every mannered term and every rejected synonym inside its scope.
// `relative` is compared against a scope with forward slashes, so the caller
// normalizes the separator before calling.
export function checkLanguage(relative, raw, compiled, add) {
  if (!compiled) return;
  const prose = scannableProse(raw);

  for (const entry of compiled.mannered) {
    entry.pattern.lastIndex = 0;
    let match;
    while ((match = entry.pattern.exec(prose)) !== null) {
      add(relative, lineOf(prose, match.index), 'LANGUAGE_MANNERED_TERM',
        `'${match[0]}' is mannered prose; state it literally, such as '${entry.instead}'`);
    }
  }

  for (const entry of compiled.rejected) {
    if (entry.scope && !entry.scope.test(relative)) continue;
    entry.pattern.lastIndex = 0;
    let match;
    while ((match = entry.pattern.exec(prose)) !== null) {
      const because = entry.reason ? `; ${entry.reason}` : '';
      add(relative, lineOf(prose, match.index), 'LANGUAGE_REJECTED_SYNONYM',
        `'${match[0]}' is a rejected synonym here; the term is '${entry.term}'${because}`);
    }
  }
}
