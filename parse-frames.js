#!/usr/bin/env node
'use strict';

const fs = require('fs');

const mdPath = process.argv[2];
if (!mdPath) {
  console.error('Usage: node parse-frames.js <frames.md>');
  process.exit(1);
}

const src = fs.readFileSync(mdPath, 'utf8');

// ── Tree builder ─────────────────────────────────────────────────────────────
// Given all selectedFile paths seen so far, derive a DFS-ordered tree where
// folders come before files at each level, both sorted alphabetically.
function buildTree(selectedFiles) {
  const nodes = new Map(); // path → 'file' | 'folder'

  for (const filePath of selectedFiles) {
    nodes.set(filePath, 'file');
    const parts = filePath.split('/');
    for (let i = 1; i < parts.length; i++) {
      const folderPath = parts.slice(0, i).join('/');
      if (!nodes.has(folderPath)) nodes.set(folderPath, 'folder');
    }
  }

  function getChildren(parentPath) {
    const parentDepth = parentPath ? parentPath.split('/').length : 0;
    const children = [];
    for (const [p, type] of nodes) {
      const parts = p.split('/');
      if (parts.length !== parentDepth + 1) continue;
      if (parentPath && !p.startsWith(parentPath + '/')) continue;
      children.push({ path: p, type });
    }
    return children;
  }

  const result = [];

  function dfs(parentPath) {
    const children = getChildren(parentPath);
    const folders = children
      .filter(c => c.type === 'folder')
      .sort((a, b) => a.path.localeCompare(b.path));
    const files = children
      .filter(c => c.type === 'file')
      .sort((a, b) => a.path.localeCompare(b.path));
    for (const f of folders) {
      result.push({ path: f.path, type: 'folder' });
      dfs(f.path);
    }
    for (const f of files) {
      result.push({ path: f.path, type: 'file' });
    }
  }

  dfs('');
  return result;
}

// ── Frame parser ──────────────────────────────────────────────────────────────
function parseFrame(raw, frameIndex, seenFiles) {
  const lines = raw.split('\n');
  const meta = {};
  let inCodeBlock = false;
  let codeFence = '';
  let codeLang = '';
  const codeLines = [];

  for (const line of lines) {
    if (!inCodeBlock) {
      // Detect opening fence: ``` or ~~~, optionally followed by a language tag
      const fenceMatch = line.match(/^(`{3,}|~{3,})(\w*)\s*$/);
      if (fenceMatch) {
        codeFence = fenceMatch[1];
        codeLang = fenceMatch[2] || '';
        inCodeBlock = true;
      } else {
        // Parse key: value metadata (key must be a bare word)
        const colonIdx = line.indexOf(':');
        if (colonIdx > 0) {
          const key = line.slice(0, colonIdx).trim();
          const val = line.slice(colonIdx + 1).trim();
          if (/^\w+$/.test(key)) meta[key] = val;
        }
      }
    } else {
      // Closing fence: same characters as opening, nothing else on the line
      if (line.trimEnd() === codeFence) {
        inCodeBlock = false;
      } else {
        codeLines.push(line);
      }
    }
  }

  if (!meta.text) {
    throw new Error(`Frame ${frameIndex + 1}: missing required field "text"`);
  }
  if (!meta.selectedFile) {
    throw new Error(`Frame ${frameIndex + 1}: missing required field "selectedFile"`);
  }

  const scrollLine = meta.scrollLine !== undefined ? parseInt(meta.scrollLine, 10) : 0;

  let highlights = [];
  if (meta.highlights) {
    const m = meta.highlights.match(/\[([^\]]*)\]/);
    if (m && m[1].trim()) {
      highlights = m[1]
        .split(',')
        .map(s => parseInt(s.trim(), 10))
        .filter(n => !isNaN(n));
    }
  }

  seenFiles.push(meta.selectedFile);

  return {
    text: meta.text,
    tree: buildTree([...seenFiles]),
    selectedFile: meta.selectedFile,
    content: codeLines.join('\n'),
    language: codeLang,
    scrollLine,
    highlights,
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────
// Split on lines that are exactly `---` (horizontal rule)
const rawFrames = src.split(/^---$/m);
const seenFiles = [];
const frames = [];

for (let i = 0; i < rawFrames.length; i++) {
  if (!rawFrames[i].trim()) continue;
  frames.push(parseFrame(rawFrames[i], frames.length, seenFiles));
}

if (frames.length === 0) {
  console.error('Error: no frames found in ' + mdPath);
  process.exit(1);
}

process.stdout.write(JSON.stringify(frames, null, 2) + '\n');
