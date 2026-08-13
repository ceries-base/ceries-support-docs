#!/usr/bin/env node
/**
 * update-doc.js — called by close-task Step 4 after screenshots are taken
 *
 * Usage:
 *   node update-doc.js --page <page> --section <section-id> --screenshot <filename> [--caption <text>]
 *
 * Pages: order-tracking | label-issues | inventory | pack-verify | shopify-sync
 * Screenshot: filename of the image saved in assets/screenshots/
 *
 * This script:
 *   1. Reads the target HTML file
 *   2. Finds the <!-- SCREENSHOT: <section-id> --> placeholder comment
 *   3. Replaces it with a <figure class="screenshot"> block
 *   4. Updates the "Last updated" date in the article header
 *   5. Writes the file back
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const get = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };

const page = get('--page');
const section = get('--section');
const screenshot = get('--screenshot');
const caption = get('--caption') || '';

if (!page || !section || !screenshot) {
  console.error('Usage: node update-doc.js --page <page> --section <section-id> --screenshot <filename> [--caption <text>]');
  process.exit(1);
}

const docsDir = path.join(__dirname, '..');
const filePath = path.join(docsDir, `${page}.html`);

if (!fs.existsSync(filePath)) {
  console.error(`File not found: ${filePath}`);
  process.exit(1);
}

let html = fs.readFileSync(filePath, 'utf8');

// Replace screenshot placeholder
const placeholder = `<!-- SCREENSHOT: ${section} -->`;
const figureHtml = `<figure class="screenshot">
  <img src="assets/screenshots/${screenshot}" alt="${caption || section}">
  ${caption ? `<figcaption>${caption}</figcaption>` : ''}
</figure>`;

if (!html.includes(placeholder)) {
  console.warn(`Placeholder "${placeholder}" not found in ${page}.html — skipping screenshot injection`);
} else {
  html = html.replace(placeholder, figureHtml);
  console.log(`Injected screenshot into ${page}.html at #${section}`);
}

// Update "Last updated" date
const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
html = html.replace(/Last updated: <!-- AUTO-UPDATED -->/, `Last updated: ${today}`);
html = html.replace(/Last updated: [A-Za-z]+ \d{1,2}, \d{4}/, `Last updated: ${today}`);

fs.writeFileSync(filePath, html, 'utf8');
console.log(`Updated ${page}.html — Last updated: ${today}`);
