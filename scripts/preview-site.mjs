import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../site-dist/", import.meta.url));
const port = Number(process.env.PORT || 4178);
const base = process.env.SITE_BASE_PATH || "/";
const types = {".html":"text/html", ".css":"text/css", ".js":"text/javascript", ".json":"application/json", ".svg":"image/svg+xml", ".md":"text/plain", ".txt":"text/plain", ".py":"text/plain"};
http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    if (!pathname.startsWith(base)) throw new Error("outside base");
    const relative = pathname.slice(base.length);
    const file = path.resolve(root, relative + (pathname.endsWith("/") ? "index.html" : ""));
    if (!file.startsWith(root)) throw new Error("outside root");
    const data = await readFile(file);
    res.writeHead(200, {"Content-Type": `${types[path.extname(file)] || "application/octet-stream"}; charset=utf-8`, "X-Content-Type-Options":"nosniff"});
    res.end(data);
  } catch { res.writeHead(404, {"Content-Type":"text/plain"}); res.end("Not found"); }
}).listen(port, "127.0.0.1", () => console.log(`PicoRunner catalog: http://127.0.0.1:${port}${base}`));
