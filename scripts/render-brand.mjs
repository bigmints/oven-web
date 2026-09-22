import { execFileSync } from 'node:child_process';
import { copyFile, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';

// Developer asset tooling: requires ImageMagick. Lettering is already paths.
const root = path.resolve(import.meta.dirname, '..');
const brand = path.join(root, 'site/brand');
for (const name of ['social-card', 'preview']) {
  execFileSync('magick', ['-background', 'none', path.join(brand, `${name}.svg`), path.join(brand, `${name}.png`)], { stdio: 'inherit' });
}
if (process.argv[2] === '--desktop') {
  const desktop = path.resolve(process.argv[3] || path.join(root, '../node-launcher'));
  await mkdir(path.join(desktop, 'public/brand'), { recursive: true });
  for (const file of await readdir(brand)) {
    if (file.endsWith('.svg')) await copyFile(path.join(brand, file), path.join(desktop, 'public/brand', file));
  }
  await copyFile(path.join(brand, 'icon.svg'), path.join(desktop, 'public/picorunner-mark.svg'));
  await copyFile(path.join(brand, 'icon.svg'), path.join(desktop, 'site/favicon.svg'));
  await copyFile(path.join(brand, 'preview.png'), path.join(desktop, 'docs/picorunner-logotype.png'));
  execFileSync('magick', ['-background', 'none', path.join(brand, 'symbol.svg'), '-resize', '36x36', '-depth', '8', `rgba:${path.join(desktop, 'src-tauri/icons/tray-icon.rgba')}`], { stdio: 'inherit' });
  execFileSync('pnpm', ['tauri', 'icon', 'public/brand/app-icon.svg'], { cwd: desktop, stdio: 'inherit' });
}
console.log('Rendered Folded P raster assets.');
