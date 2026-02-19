#!/usr/bin/env node
'use strict';

const fs = require('fs');
const { sanitizeFile } = require('./sanitize-frames');

const mdPath = process.argv[2];
if (!mdPath) {
  console.error('Usage: node check-frames.js <frames.md>');
  process.exit(1);
}

let src = fs.readFileSync(mdPath, 'utf8');
const { result } = sanitizeFile(src);
if (result !== src) {
  fs.writeFileSync(mdPath, result, 'utf8');
  src = result;
}

const rawFrames = src.split(/^---$/m).filter(f => f.trim());

let failed = false;

// Validate file ends with ---
const lastNonEmptyLine = src.split('\n').filter(l => l.trim()).pop();
if (lastNonEmptyLine !== '---') {
  console.log('File does not end with --- ✗');
  failed = true;
}

for (let i = 0; i < rawFrames.length; i++) {
  const frame = rawFrames[i];
  const lines = frame.split('\n');
  let inCodeBlock = false;
  let codeFence = '';
  let lineCount = 0;
  let hasText = false;
  let hasSelectedFile = false;
  const errors = [];

  for (const line of lines) {
    if (!inCodeBlock) {
      if (line.startsWith('text:')) hasText = true;
      if (line.startsWith('selectedFile:')) hasSelectedFile = true;
      if (line.startsWith('highlights:')) {
        errors.push('highlights: field is deprecated — use // hl markers inside code lines instead');
      }

      const fenceMatch = line.match(/^(`{3,}|~{3,})\w*\s*$/);
      if (fenceMatch) {
        inCodeBlock = true;
        codeFence = fenceMatch[1];
      }
    } else {
      if (line.trimEnd() === codeFence) {
        inCodeBlock = false;
      } else {
        lineCount++;
      }
    }
  }

  if (!hasText) errors.push('missing text:');
  if (!hasSelectedFile) errors.push('missing selectedFile:');

  const over = lineCount - 24;
  if (over > 0) errors.push(`${lineCount}/24 lines (${over} over)`);
  if (over > 0 || errors.length > 0) {
    failed = true;
    console.log(`Frame ${i + 1}: ✗  → ${errors.join(', ')}`);
  } else {
    console.log(`Frame ${i + 1}: ✓`);
  }
}

process.exit(failed ? 1 : 0);
