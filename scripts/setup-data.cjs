#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const exampleDir = path.join(__dirname, '..', 'data', 'example');
const seedDir = path.join(__dirname, '..', 'data', 'seed');

const dataFiles = [
  'posts.json',
  'categories.json',
  'tags.json',
  'sections.json',
  'settings.json',
  'nav.json',
  'graphics.json',
  'tools.json',
  'issues.json'
];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyFile(source, target) {
  fs.copyFileSync(source, target);
  console.log(`  ✓ Copied: ${path.basename(target)}`);
}

function setupData() {
  console.log('🚀 Setting up blog data...\n');

  ensureDir(seedDir);

  let copiedCount = 0;
  let skippedCount = 0;

  for (const file of dataFiles) {
    const source = path.join(exampleDir, file);
    const target = path.join(seedDir, file);

    if (!fs.existsSync(source)) {
      console.log(`  ⚠️  Skipped: ${file} (not found in example)`);
      continue;
    }

    if (fs.existsSync(target)) {
      console.log(`  ⚠️  Skipped: ${file} (already exists)`);
      skippedCount++;
      continue;
    }

    copyFile(source, target);
    copiedCount++;
  }

  console.log(`\n✅ Setup complete!`);
  console.log(`   - Copied: ${copiedCount} files`);
  console.log(`   - Skipped: ${skippedCount} files`);
  console.log(`\n💡 Next steps:`);
  console.log(`   1. Review the data in data/seed/`);
  console.log(`   2. Customize as needed`);
  console.log(`   3. Start the dev server: npm run dev`);
}

function resetData() {
  console.log('🔄 Resetting blog data...\n');

  ensureDir(seedDir);

  let resetCount = 0;

  for (const file of dataFiles) {
    const source = path.join(exampleDir, file);
    const target = path.join(seedDir, file);

    if (!fs.existsSync(source)) {
      console.log(`  ⚠️  Skipped: ${file} (not found in example)`);
      continue;
    }

    copyFile(source, target);
    resetCount++;
  }

  console.log(`\n✅ Reset complete!`);
  console.log(`   - Reset: ${resetCount} files`);
}

function backupData() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(__dirname, '..', 'backups', `data-${timestamp}`);

  console.log(`📦 Backing up data to ${backupDir}...\n`);

  ensureDir(backupDir);

  let backupCount = 0;

  for (const file of dataFiles) {
    const source = path.join(seedDir, file);
    const target = path.join(backupDir, file);

    if (!fs.existsSync(source)) {
      continue;
    }

    copyFile(source, target);
    backupCount++;
  }

  console.log(`\n✅ Backup complete!`);
  console.log(`   - Backed up: ${backupCount} files`);
  console.log(`   - Location: ${backupDir}`);
}

function showHelp() {
  console.log(`
📊 Blog Data Management Tool

Usage:
  node scripts/setup-data.cjs [command]

Commands:
  setup     - Setup data from examples (default, skips existing files)
  reset     - Reset all data from examples (overwrites existing files)
  backup    - Backup current data to backups/ directory
  help      - Show this help message

Examples:
  node scripts/setup-data.cjs
  node scripts/setup-data.cjs reset
  node scripts/setup-data.cjs backup
`);
}

const command = process.argv[2] || 'setup';

switch (command) {
  case 'setup':
    setupData();
    break;
  case 'reset':
    resetData();
    break;
  case 'backup':
    backupData();
    break;
  case 'help':
  case '--help':
  case '-h':
    showHelp();
    break;
  default:
    console.log(`❌ Unknown command: ${command}`);
    showHelp();
    process.exit(1);
}
