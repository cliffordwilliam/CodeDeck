#!/usr/bin/env node
'use strict';

const fs = require('fs');

// ── Phonetic replacement rules ────────────────────────────────────────────────
// Order matters: more specific / longer patterns must come before shorter ones.
const PHONETIC_RULES = [
  // Markdown formatting — strip markers, keep text
  [/\*\*(.+?)\*\*/g, '$1'],           // **bold** → bold
  [/\*(.+?)\*/g, '$1'],               // *italic* → italic
  [/`([^`\n]+)`/g, '$1'],             // `code` → code (strip backticks)
  [/\[([^\]]+)\]\([^)]+\)/g, '$1'],   // [text](url) → text

  // Operators (specific before general)
  [/===/g, 'strictly equals'],
  [/!==/g, 'strictly not equals'],
  [/==/g, 'loosely equals'],
  [/!=/g, 'loosely not equals'],
  [/\|\|/g, 'or'],
  [/&&/g, 'and'],
  [/=>/g, 'which returns'],
  [/\.\.\./g, 'rest'],

  // Common slash-separated idioms (before keyword rules split the words)
  [/\basync\/await\b/g, 'ay-sink and ah-weight'],
  [/\btry\/catch\b/g, 'try and catch'],
  [/\bread\/write\b/g, 'read and write'],

  // Combined / qualified forms first (before their shorter counterparts)
  [/\bconsole\.log\b/g, 'console log'],
  [/\bJSON\.stringify\b/g, 'Jay-son dot stringify'],
  [/\bJSON\.parse\b/g, 'Jay-son dot parse'],
  [/\bJSON\b/g, 'Jay-son'],
  [/\bPromise\.all\b/g, 'Promise dot all'],
  [/\bPromise\.race\b/g, 'Promise dot race'],
  [/\bURL\b/g, 'you are ell'],
  [/\bnew Map\(\)/g, 'a new map'],
  [/\bnew Set\(\)/g, 'a new set'],

  // Keywords
  [/\basync\b/g, 'ay-sink'],
  [/\bawait\b/g, 'ah-weight'],

  // Dot-method calls: "foo.method" → "foo dot method"
  // Using a capture group for the preceding word char avoids "responsedotthen".
  [/(\w)\.then\b/g,      '$1 dot then'],
  [/(\w)\.catch\b/g,     '$1 dot catch'],
  [/(\w)\.finally\b/g,   '$1 dot finally'],
  [/(\w)\.forEach\b/g,   '$1 for each'],
  [/(\w)\.map\b/g,       '$1 dot map'],
  [/(\w)\.filter\b/g,    '$1 dot filter'],
  [/(\w)\.reduce\b/g,    '$1 dot reduce'],
  [/(\w)\.json\b/g,      '$1 dot json'],
  [/(\w)\.ok\b/g,        '$1 dot ok'],
  [/(\w)\.status\b/g,    '$1 dot status'],
  [/(\w)\.stringify\b/g, '$1 dot stringify'],
  [/(\w)\.parse\b/g,     '$1 dot parse'],
  [/(\w)\.keys\b/g,      '$1 dot keys'],
  [/(\w)\.values\b/g,    '$1 dot values'],
  [/(\w)\.entries\b/g,   '$1 dot entries'],
  [/(\w)\.length\b/g,    '$1 dot length'],
  [/(\w)\.push\b/g,      '$1 dot push'],
  [/(\w)\.pop\b/g,       '$1 dot pop'],
  [/(\w)\.shift\b/g,     '$1 dot shift'],
  [/(\w)\.includes\b/g,  '$1 dot includes'],
  [/(\w)\.indexOf\b/g,   '$1 dot index of'],
  [/(\w)\.find\b/g,      '$1 dot find'],
  [/(\w)\.all\b/g,       '$1 dot all'],

  // Trailing empty parens left over after method replacement (e.g. "dot json()")
  [/\(\)/g, ''],

  // Stray backticks not caught by the inline-code rule above
  [/`/g, ''],
];

function sanitizeText(raw) {
  // 1. Flatten any internal newlines to spaces
  let s = raw.replace(/\n+/g, ' ').trim();
  // 2. Apply phonetic rules in order; count individual replacements
  let count = 0;
  for (const [pattern, replacement] of PHONETIC_RULES) {
    const matches = s.match(pattern);
    if (matches) count += matches.length;
    s = s.replace(pattern, replacement);
  }
  // 3. Collapse any double-spaces introduced by replacements
  return { text: s.replace(/ {2,}/g, ' ').trim(), count };
}

// ── File processor ────────────────────────────────────────────────────────────
// State machine: reads the file line by line.
//   normal   — scanning for text: or a code fence
//   in_text  — accumulating lines of a text: value
//   in_code  — inside a ```...``` block (pass through untouched)
//
// An LLM may write multi-line text: values like:
//
//   text: This is the first sentence.
//   And this continues the thought.
//   selectedFile: foo.js
//
// We accumulate lines until we see a metadata key, code fence, separator, or
// blank line, then emit a single sanitized text: line.

function sanitizeFile(src) {
  const lines = src.split('\n');
  const out = [];
  let state = 'normal';
  let textBuf = [];
  let codeFence = '';

  let totalSubstitutions = 0;

  function flushText() {
    const { text, count } = sanitizeText(textBuf.join('\n'));
    out.push('text: ' + text);
    totalSubstitutions += count;
    textBuf = [];
  }

  for (const line of lines) {
    if (state === 'in_code') {
      out.push(line);
      if (line.trimEnd() === codeFence) state = 'normal';
      continue;
    }

    if (state === 'in_text') {
      const isFence = /^(`{3,}|~{3,})/.test(line);
      const isMeta  = /^\w+:/.test(line);
      const isSep   = line.trimEnd() === '---';
      const isEmpty = line.trim() === '';

      if (isFence || isMeta || isSep || isEmpty) {
        // End of text block — flush accumulated lines as one sanitized line
        flushText();
        state = 'normal';
        // Fall through to handle the current line in normal state
      } else {
        textBuf.push(line);
        continue;
      }
    }

    // state === 'normal'
    if (line.startsWith('text:')) {
      textBuf = [line.slice('text:'.length)]; // may be empty if LLM put value on next line
      state = 'in_text';
      continue;
    }

    const fenceMatch = line.match(/^(`{3,}|~{3,})/);
    if (fenceMatch) {
      codeFence = fenceMatch[1];
      state = 'in_code';
    }
    out.push(line);
  }

  // File ended while still in text state
  if (state === 'in_text') flushText();

  return { result: out.join('\n'), substitutions: totalSubstitutions };
}

// ── Main ──────────────────────────────────────────────────────────────────────
const mdPath = process.argv[2];
if (!mdPath) {
  console.error('Usage: node sanitize-frames.js <frames.md>');
  process.exit(1);
}

const src = fs.readFileSync(mdPath, 'utf8');
const { result, substitutions } = sanitizeFile(src);

if (result === src) {
  console.log('No changes needed: ' + mdPath);
} else {
  fs.writeFileSync(mdPath, result, 'utf8');
  const s = substitutions === 1 ? 'substitution' : 'substitutions';
  console.log(`Sanitized: ${mdPath} (${substitutions} TTS ${s} made)`);
}
