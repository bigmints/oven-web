import { readFile, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const brand = path.join(root, "site/brand");
const tokens = await readFile(path.join(root, "site/tokens.css"), "utf8");
const color = name => tokens.match(new RegExp(`--color-${name}:\\s*(#[a-f0-9]+)`))[1];
const markSource = await readFile(path.join(brand, "symbol.svg"), "utf8");
const mark = markSource.match(/<g[\s\S]*<\/g>/)[0].replace(/fill="#[a-f0-9]+"/g, `fill="${color("accent")}"`);
const svg = (width, height, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${body}</svg>\n`;
await writeFile(path.join(brand, "mark-teal.svg"), svg(128, 128, mark));
await writeFile(path.join(root, "site/favicon.svg"), svg(128, 128, `<rect width="128" height="128" rx="28" fill="${color("bg")}"/>${mark}`));

const font = path.join(root, "site/fonts/Manrope-Semibold.ttf");
const fontData = (await readFile(font)).toString("base64");
const background = `<rect width="1200" height="630" fill="${color("bg")}"/><rect x="32" y="32" width="1136" height="566" rx="16" fill="none" stroke="${color("border")}"/><g transform="translate(64 57) scale(.36)">${mark}</g><path d="M76 498h1048" stroke="${color("border")}"/>`;
const text = `<style>@font-face{font-family:Manrope;src:url(data:font/ttf;base64,${fontData})}text{font-family:Manrope,sans-serif}</style><text x="123" y="91" fill="${color("text")}" font-size="26">PicoRunner</text><text x="76" y="278" fill="${color("text")}" font-size="64">Open-source apps.</text><text x="76" y="365" fill="${color("accent")}" font-size="64">Open to everyone.</text><text x="76" y="552" fill="${color("muted")}" font-size="20">picorunner.com</text><text x="864" y="552" fill="${color("muted")}" font-size="20">No coding needed.</text>`;
await writeFile(path.join(brand, "social-card.svg"), svg(1200, 630, background + text));
// ImageMagick receives the bundled font explicitly; no installed font is needed.
execFileSync("magick", ["svg:-", "-font", font, "-fill", color("text"), "-pointsize", "26", "-annotate", "+123+91", "PicoRunner", "-pointsize", "64", "-annotate", "+76+278", "Open-source apps.", "-fill", color("accent"), "-annotate", "+76+365", "Open to everyone.", "-fill", color("muted"), "-pointsize", "20", "-annotate", "+76+552", "picorunner.com", "-annotate", "+864+552", "No coding needed.", path.join(brand, "social-card.png")], {input: svg(1200,630,background), stdio: ["pipe", "inherit", "inherit"]});
console.log("Built teal website mark, favicon, and social card.");
