const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const sourceRoot = process.argv[2];
const galleryRoot = path.join(__dirname, '../public/gallery');

const groups = [
  { source: 'Wix1', target: 'classic-wedding-archive' },
  { source: 'Wix2', target: 'classic-wedding-archive' },
  { source: 'Wix3', target: 'white-silver-reception' },
  { source: 'Wix4', target: 'editorial-wedding-archive' },
  { source: 'Wix5', target: 'grand-staircase-wedding' },
];

if (!sourceRoot) {
  console.error('Usage: node scripts/import-wix-gallery.js <folder-containing-Wix1-Wix5>');
  process.exit(1);
}

const missingFolders = groups
  .map(({ source }) => path.join(sourceRoot, source))
  .filter((folder) => !fs.existsSync(folder));

if (missingFolders.length > 0) {
  console.error(`Missing source folders:\n${missingFolders.join('\n')}`);
  process.exit(1);
}

const existingTargets = groups
  .map(({ target }) => path.join(galleryRoot, target))
  .filter((folder) => fs.existsSync(folder));

if (existingTargets.length > 0) {
  console.error(`Import targets already exist; refusing to overwrite them:\n${existingTargets.join('\n')}`);
  process.exit(1);
}

const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });
const seenHashes = new Set();
let importedTotal = 0;
let duplicateTotal = 0;

for (const { source, target } of groups) {
  const sourceFolder = path.join(sourceRoot, source);
  const targetFolder = path.join(galleryRoot, target);
  const files = fs
    .readdirSync(sourceFolder)
    .filter((file) => /\.(jpe?g|png|webp)$/i.test(file))
    .sort(collator.compare);

  fs.mkdirSync(targetFolder, { recursive: true });

  let importedForGroup = 0;
  let duplicatesForGroup = 0;

  for (const file of files) {
    const sourceFile = path.join(sourceFolder, file);
    const hash = crypto.createHash('sha1').update(fs.readFileSync(sourceFile)).digest('hex');

    if (seenHashes.has(hash)) {
      duplicateTotal += 1;
      duplicatesForGroup += 1;
      continue;
    }

    seenHashes.add(hash);
    importedForGroup += 1;
    importedTotal += 1;

    const destinationFile = path.join(
      targetFolder,
      `${target}-${String(importedForGroup).padStart(2, '0')}.jpg`,
    );

    const result = spawnSync(
      'sips',
      ['-Z', '2200', '-s', 'format', 'jpeg', '-s', 'formatOptions', '82', sourceFile, '--out', destinationFile],
      { encoding: 'utf8' },
    );

    if (result.status !== 0) {
      console.error(`Failed to optimize ${sourceFile}:\n${result.stderr || result.stdout}`);
      process.exit(1);
    }
  }

  console.log(`${source}: imported ${importedForGroup}, skipped ${duplicatesForGroup} duplicates.`);
}

console.log(`Imported ${importedTotal} unique images and skipped ${duplicateTotal} duplicate copies.`);
