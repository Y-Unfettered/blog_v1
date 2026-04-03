#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT_DIR = path.resolve(__dirname, '..');
const TMP_DIR = path.join(ROOT_DIR, '.tmp-inline-lint');

const JS_FILES = [
  'vite.config.js',
  'postcss.config.js',
  'tailwind.config.js',
  'src/main.js',
  'admin/admin-common.js',
  'scripts/admin-server.cjs',
  'scripts/init-data.cjs',
  'scripts/validate-data.cjs',
  'scripts/backup-data.cjs',
  'scripts/smoke-test.cjs',
];

const HTML_FILES = [
  'article.html',
  'admin/index.html',
  'admin/dashboard.html',
  'admin/settings.html',
  'admin/categories.html',
  'admin/sections.html',
  'admin/tags.html',
  'admin/posts.html',
  'admin/editor.html',
];

function stripHashbang(source) {
  return String(source).replace(/^#![^\n]*\n/, '\n');
}

function convertModuleToScript(source) {
  return String(source)
    .replace(/^\uFEFF/, '')
    .replace(/^\s*import[\s\S]*?;\s*$/gm, '')
    .replace(/\bimport\.meta\b/g, '__lint_import_meta__')
    .replace(/^\s*export\s+default\s+/gm, 'const __lint_default__ = ')
    .replace(/^\s*export\s+(async\s+function|function|class|const|let|var)\b/gm, '$1')
    .replace(/^\s*export\s*\{[\s\S]*?\}\s*;?\s*$/gm, '');
}

function parseAsScript(source, filePath) {
  new vm.Script(source, { filename: filePath });
}

function runSyntaxCheck(relativePath, source) {
  const normalized = stripHashbang(source);
  const fullPath = path.join(ROOT_DIR, relativePath);
  if (relativePath.endsWith('.cjs')) {
    parseAsScript(normalized, fullPath);
    return;
  }
  parseAsScript(convertModuleToScript(normalized), fullPath);
}

function checkInlineScripts(relativePath, errors) {
  const fullPath = path.join(ROOT_DIR, relativePath);
  const html = fs.readFileSync(fullPath, 'utf8');
  const regex = /<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  let index = 0;

  while ((match = regex.exec(html))) {
    const scriptBody = String(match[1] || '').trim();
    if (!scriptBody) {
      index += 1;
      continue;
    }

    try {
      parseAsScript(scriptBody, `${relativePath}#script-${index + 1}`);
    } catch (error) {
      errors.push(`[inline] ${relativePath}#script-${index + 1}: ${error.message}`);
    }

    index += 1;
  }
}

function main() {
  const errors = [];

  fs.rmSync(TMP_DIR, { recursive: true, force: true });
  fs.mkdirSync(TMP_DIR, { recursive: true });

  try {
    JS_FILES.forEach((relativePath) => {
      const fullPath = path.join(ROOT_DIR, relativePath);
      if (!fs.existsSync(fullPath)) {
        errors.push(`[missing] ${relativePath}`);
        return;
      }

      try {
        runSyntaxCheck(relativePath, fs.readFileSync(fullPath, 'utf8'));
      } catch (error) {
        errors.push(`[syntax] ${relativePath}: ${error.message}`);
      }
    });

    HTML_FILES.forEach((relativePath) => {
      if (!fs.existsSync(path.join(ROOT_DIR, relativePath))) {
        errors.push(`[missing] ${relativePath}`);
        return;
      }
      checkInlineScripts(relativePath, errors);
    });

    const mainEntry = fs.readFileSync(path.join(ROOT_DIR, 'src/main.js'), 'utf8');
    if (!mainEntry.includes(`'./index.css'`) && !mainEntry.includes(`"./index.css"`)) {
      errors.push('[rule] src/main.js must import ./index.css');
    }

    const indexHtml = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');
    if (/cdn\.tailwindcss\.com/i.test(indexHtml)) {
      errors.push('[rule] index.html must not depend on Tailwind CDN');
    }
    if (/md-editor-v3/i.test(indexHtml)) {
      errors.push('[rule] index.html must not depend on md-editor-v3 CDN CSS');
    }
    if (/code\.iconify\.design/i.test(indexHtml)) {
      errors.push('[rule] index.html must not depend on Iconify CDN');
    }

    if (errors.length > 0) {
      console.error('Project lint failed:');
      errors.forEach((item) => console.error(`- ${item}`));
      process.exit(1);
    }

    console.log(`LINT_OK (${JS_FILES.length} JS files, ${HTML_FILES.length} HTML files)`);
  } finally {
    fs.rmSync(TMP_DIR, { recursive: true, force: true });
  }
}

main();
