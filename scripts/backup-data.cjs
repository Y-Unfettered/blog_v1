#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.resolve(ROOT_DIR, process.env.BLOG_DATA_DIR || 'data/seed');
const BACKUP_ROOT = path.resolve(ROOT_DIR, process.env.BLOG_BACKUP_DIR || 'backups/data');
const RETAIN_COUNT = Math.max(1, Number(process.env.BLOG_BACKUP_RETAIN || 10) || 10);

function timestamp() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, '0');
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}

function collectFiles(dirPath, relativeBase = '') {
  return fs.readdirSync(dirPath, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dirPath, entry.name);
    const relativePath = path.join(relativeBase, entry.name);
    if (entry.isDirectory()) {
      return collectFiles(fullPath, relativePath);
    }
    return [relativePath];
  });
}

function hashFile(filePath) {
  const hash = crypto.createHash('sha256');
  hash.update(fs.readFileSync(filePath));
  return hash.digest('hex');
}

function pruneOldBackups() {
  if (!fs.existsSync(BACKUP_ROOT)) {
    return [];
  }

  const entries = fs.readdirSync(BACKUP_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
    .reverse();

  const removed = entries.slice(RETAIN_COUNT);
  removed.forEach((name) => {
    fs.rmSync(path.join(BACKUP_ROOT, name), { recursive: true, force: true });
  });
  return removed;
}

function main() {
  if (!fs.existsSync(DATA_DIR)) {
    console.error(`Backup source directory does not exist: ${DATA_DIR}`);
    process.exit(1);
  }

  fs.mkdirSync(BACKUP_ROOT, { recursive: true });

  const backupName = timestamp();
  const destination = path.join(BACKUP_ROOT, backupName);
  fs.cpSync(DATA_DIR, destination, { recursive: true });

  const files = collectFiles(destination);
  const manifest = {
    createdAt: new Date().toISOString(),
    source: path.relative(ROOT_DIR, DATA_DIR).replace(/\\/g, '/'),
    backup: path.relative(ROOT_DIR, destination).replace(/\\/g, '/'),
    fileCount: files.length,
    files: files.map((relativePath) => {
      const fullPath = path.join(destination, relativePath);
      return {
        path: relativePath.replace(/\\/g, '/'),
        size: fs.statSync(fullPath).size,
        sha256: hashFile(fullPath),
      };
    }),
  };

  fs.writeFileSync(path.join(destination, 'manifest.json'), JSON.stringify(manifest, null, 2));
  const removed = pruneOldBackups();

  console.log(`BACKUP_OK ${path.relative(ROOT_DIR, destination).replace(/\\/g, '/')}`);
  console.log(`Files: ${manifest.fileCount}`);
  if (removed.length > 0) {
    console.log(`Pruned: ${removed.join(', ')}`);
  }
}

main();
