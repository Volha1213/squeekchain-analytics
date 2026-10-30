import { readFile, readdir, stat } from "node:fs/promises";
import { resolve, dirname } from "node:path";
const root = resolve("dist");
const html = await readFile(resolve(root,"index.html"),"utf8");
const references = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(m=>m[1]);
for (const path of references) {
  if (!path.startsWith("./") || path.includes("..")) throw new Error(`Non-relative HTML asset: ${path}`);
  if (!(await stat(resolve(root,path))).isFile()) throw new Error(`Missing asset: ${path}`);
}
let bytes = 0;
async function walk(directory) {
  for (const entry of await readdir(directory,{withFileTypes:true})) {
    const path = resolve(directory,entry.name);
    if (entry.isDirectory()) { await walk(path); continue; }
    if (!entry.isFile()) throw new Error(`Non-file in dist: ${entry.name}`);
    bytes += (await stat(path)).size;
    if (/\.(js|css|html)$/.test(path)) {
      const content = await readFile(path,"utf8");
      if (/(?:["'])\/_next\/|["']\/api\/analytics/.test(content)) throw new Error(`Server-only reference in ${path}`);
      if (path.endsWith(".js") && /\bnew\s+Function\s*\(|\beval\s*\(/.test(content)) throw new Error(`Dynamic code evaluation in ${path}`);
      if (path.endsWith(".css")) for (const m of content.matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
        if (m[1].startsWith("data:")) continue;
        if (m[1].startsWith("/") || m[1].includes("://")) throw new Error(`Non-relative CSS resource: ${m[1]}`);
        await stat(resolve(dirname(path),m[1]));
      }
    }
  }
}
await walk(root);
if (!references.some(p=>p.endsWith(".js")) || !references.some(p=>p.endsWith(".css"))) throw new Error("JS/CSS bundle missing");
if (!html.includes("Content-Security-Policy") || html.includes("unsafe-eval")) throw new Error("Static CSP missing or weakened");
console.log(`PASS: ${references.length} relative entry assets; no Next server paths or eval; ${bytes} bytes in dist.`);
