import { mkdir, writeFile, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Original PicoRunner vector artwork. No fonts or external assets required.
const root = fileURLToPath(new URL('../', import.meta.url));
const brand = path.join(root, 'site/brand');
await mkdir(brand, { recursive: true });
const symbol = '<path fill-rule="evenodd" d="M18 52V13h17c10 0 17 6 17 15s-7 15-17 15h-7v9zm10-30v13l13-6.5z"/>';
const letters = [
  'M8 51V13h17c17 0 17 24 0 24H8',
  'M53 28v23 M53 15v.1',
  'M89 30c-15-12-29 9-16 19 5 4 11 3 16 0',
  'M111 26c-18 0-18 27 0 27s18-27 0-27Z',
  'M139 51V13h16c17 0 17 24 0 24h-16m16 0 17 14',
  'M184 28v14c0 15 23 15 23 0V28m0 14v9',
  'M221 51V28m0 12c0-18 23-18 23 0v11',
  'M258 51V28m0 12c0-18 23-18 23 0v11',
  'M295 39h25c0-17-25-17-25 1 0 13 16 16 24 9',
  'M334 51V28m0 12c0-9 6-14 15-14',
];
const word = `<g fill="none" stroke="currentColor" stroke-width="5.8" stroke-linecap="round" stroke-linejoin="round">${letters.map(d => `<path d="${d}"/>`).join('')}</g>`;
const svg = (viewBox, body, extras='') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" ${extras}>${body.replaceAll('currentColor', extras.includes('#eaf2cd') ? '#eaf2cd' : '#19392f')}</svg>\n`;
await writeFile(path.join(brand, 'symbol.svg'), svg('0 0 64 64', symbol, 'fill="currentColor"'));
await writeFile(path.join(brand, 'icon.svg'), svg('0 0 64 64', `<rect width="64" height="64" rx="16" fill="#245344"/><g fill="#eaf2cd">${symbol}</g>`));
await writeFile(path.join(brand, 'app-icon.svg'), svg('0 0 1024 1024', `<rect x="80" y="80" width="864" height="864" rx="196" fill="#245344"/><g transform="translate(208 208) scale(9.5)" fill="#eaf2cd">${symbol}</g>`));
await writeFile(path.join(brand, 'wordmark.svg'), svg('0 0 358 66', word, 'color="#19392f"'));
await writeFile(path.join(brand, 'wordmark-light.svg'), svg('0 0 358 66', word, 'color="#eaf2cd"'));
await writeFile(path.join(brand, 'lockup.svg'), svg('0 0 445 66', `<rect width="64" height="64" rx="16" fill="#245344"/><g fill="#eaf2cd">${symbol}</g><g transform="translate(87)">${word}</g>`, 'color="#19392f"'));
await copyFile(path.join(brand, 'icon.svg'), path.join(root, 'site/favicon.svg'));
await writeFile(path.join(brand, 'social-card.svg'), svg('0 0 1200 630', `<rect width="1200" height="630" fill="#f7f8f2"/><g transform="translate(74 62) scale(1.12)"><rect width="64" height="64" rx="16" fill="#245344"/><g fill="#eaf2cd">${symbol}</g><g transform="translate(87)" color="#19392f">${word}</g></g><text x="74" y="315" fill="#19392f" font-family="Arial,sans-serif" font-size="78" font-weight="700">Good apps.</text><text x="74" y="408" fill="#245344" font-family="Arial,sans-serif" font-size="78" font-weight="700">Less setup.</text><text x="78" y="553" fill="#245344" font-family="Arial,sans-serif" font-size="26">A home for useful apps on your Mac.</text><g transform="translate(847 203) scale(4)" fill="#245344">${symbol}</g>`));
console.log('Built PicoRunner vector identity.');
