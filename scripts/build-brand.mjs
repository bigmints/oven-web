import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const brand = path.join(root, 'site/brand');
const type = JSON.parse(await readFile(path.join(root, 'scripts/brand/wordmark.json'), 'utf8'));
await mkdir(brand, { recursive: true });
const headlineFirst = JSON.parse(await readFile(path.join(root, 'scripts/brand/headline-first.json'), 'utf8'));
const headlineSecond = JSON.parse(await readFile(path.join(root, 'scripts/brand/headline-second.json'), 'utf8'));
const headline = (type,y) => `<path fill="#080808" transform="translate(66 ${y}) scale(${86/type.height})" d="${type.path}"/>`;
// Approved Folded P: original geometry, not traced from the reference.
const symbol = '<path fill-rule="evenodd" d="M12 34 60 6 108 34V78L60 106 40 94V124L12 108ZM40 50V66L60 78 82 65V49L60 36Z"/>';
const svg = (w,h,body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>\n`;
const mark = (x,y,size,color='#080808') => `<g fill="${color}" transform="translate(${x+size/32} ${y-size/128}) scale(${size/128})">${symbol}</g>`;
const word = (x,y,width,color='#080808') => `<path fill="${color}" transform="translate(${x} ${y}) scale(${width/type.width})" d="${type.path}"/>`;
const lockup = (color) => mark(0,0,128,color)+word(166,64-type.height/type.width*620/2,620,color);
await writeFile(path.join(brand,'symbol.svg'),svg(128,128,mark(0,0,128)));
await writeFile(path.join(brand,'icon.svg'),svg(128,128,'<rect width="128" height="128" rx="30" fill="#080808"/>'+mark(20,18,88,'#fff')));
await writeFile(path.join(brand,'app-icon.svg'),svg(1024,1024,'<rect x="80" y="80" width="864" height="864" rx="196" fill="#080808"/>'+mark(222,222,580,'#fff')));
await writeFile(path.join(brand,'wordmark.svg'),svg(type.width,type.height,word(0,0,type.width)));
await writeFile(path.join(brand,'wordmark-light.svg'),svg(type.width,type.height,word(0,0,type.width,'#fff')));
await writeFile(path.join(brand,'lockup.svg'),svg(800,128,lockup('#080808')));
await writeFile(path.join(brand,'lockup-light.svg'),svg(800,128,lockup('#fff')));
await copyFile(path.join(brand,'icon.svg'),path.join(root,'site/favicon.svg'));
await writeFile(path.join(brand,'social-card.svg'),svg(1200,630,'<rect width="1200" height="630" fill="#fff"/><g transform="translate(66 46) scale(.72)">'+lockup('#080808')+'</g>'+headline(headlineFirst,238)+headline(headlineSecond,347)+'<text x="69" y="555" fill="#444" font-family="Arial,sans-serif" font-size="25">A home for useful apps on your Mac.</text>'+mark(848,235,258)));
await writeFile(path.join(brand,'preview.svg'),svg(1200,310,'<rect width="1200" height="310" fill="#fff"/><g transform="translate(70 65) scale(1.32)">'+lockup('#080808')+'</g>'));
console.log('Built the approved Folded P identity.');
