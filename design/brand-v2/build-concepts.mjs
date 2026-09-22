import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
const root = import.meta.dirname;
const upper = JSON.parse(await readFile(path.join(root, 'type-uppercase.json')));
const title = JSON.parse(await readFile(path.join(root, 'type-titlecase.json')));
// Original geometry: a cut, forward-leaning R and a folded geometric P.
// The reference is used for visual direction, not traced or reproduced.
const forward = '<path fill-rule="evenodd" d="M8 112 41 16H94L120 42 108 76 86 85 109 112H74L53 85 44 112ZM62 40 54 63H81L93 51 82 40Z"/>';
const folded = '<path fill-rule="evenodd" d="M12 34 60 6 108 34V78L60 106 40 94V124L12 108ZM40 50V66L60 78 82 65V49L60 36Z"/>';
const types = { forward: upper, folded: title };
const marks = { forward, folded };
const svg = (w,h,body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`;
function lettering(kind,x,y,width,color='#080808') {
  const t = types[kind];
  return `<path fill="${color}" transform="translate(${x} ${y}) scale(${width/t.width})" d="${t.path}"/>`;
}
function mark(kind,x,y,size,color='#080808') {
  return `<g fill="${color}" transform="translate(${x} ${y}) scale(${size/128})">${marks[kind]}</g>`;
}
for (const kind of Object.keys(marks)) {
  await writeFile(path.join(root, `${kind}-symbol.svg`),svg(128,128,mark(kind,0,0,128)));
  await writeFile(path.join(root, `${kind}-wordmark.svg`),svg(types[kind].width,types[kind].height,lettering(kind,0,0,types[kind].width)));
  await writeFile(path.join(root, `${kind}-lockup.svg`),svg(1180,192,mark(kind,12,14,164)+lettering(kind,222,62,930)));
  await writeFile(path.join(root, `${kind}-app-icon.svg`),svg(1024,1024,'<rect x="80" y="80" width="864" height="864" rx="196" fill="#080808"/>'+mark(kind,226,212,580,'#fff')));
}
function row(kind,y,label) {
  const mainTop = y + 202 - types[kind].height / types[kind].width * 1030 / 2;
  const reverseTop = y + 434 - types[kind].height / types[kind].width * 740 / 2;
  return `<text x="84" y="${y+45}" fill="#666" font-family="Arial,sans-serif" font-size="18" letter-spacing="2">${label}</text>`
    +mark(kind,84,y+98,206)+lettering(kind,354,mainTop,1030)
    +`<rect x="84" y="${y+354}" width="1010" height="160" fill="#080808"/>`
    +mark(kind,113,y+378,106,'#fff')+lettering(kind,267,reverseTop,740,'#fff')
    +`<rect x="1160" y="${y+354}" width="160" height="160" rx="36" fill="#080808"/>`
    +mark(kind,1185,y+375,112,'#fff')+mark(kind,1384,y+398,48)
    +`<text x="1384" y="${y+478}" fill="#777" font-family="Arial,sans-serif" font-size="14">Small size</text>`;
}
await writeFile(path.join(root,'directions.svg'),svg(1536,1190,'<rect width="1536" height="1190" fill="#fff"/>'
  +row('forward',24,'01 / FORWARD')
  +'<path d="M84 599H1452" stroke="#ddd"/>'
  +row('folded',626,'02 / FOLDED P')));
await writeFile(path.join(root,'forward-preview.svg'),svg(1440,720,'<rect width="1440" height="720" fill="#fff"/>'+mark('forward',580,72,280)+lettering('forward',160,439,1120)));
console.log('Created two original vector identity directions.');
