// Local static QA server, not an IPFS node or publisher. No SPA fallback.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname } from "node:path";
const root = resolve("dist");
const port = Number(process.env.PORT || 4173);
const cid = "bafybeic5ti5om22inn4cwndj5xerywdhexcyygoxrauqcpkzxjd4okq27e";
const prefixes = ["/", `/ipfs/${cid}/`, `/gateway/v2/ipfs/${cid}/`, "/ipns/community.example/"];
const mime = { ".html":"text/html; charset=utf-8", ".js":"text/javascript; charset=utf-8", ".css":"text/css; charset=utf-8", ".svg":"image/svg+xml", ".json":"application/json" };
createServer(async (req,res) => {
  try {
    const url = new URL(req.url,"http://localhost");
    for (const prefix of prefixes.filter(x=>x!=="/"))
      if (url.pathname === prefix.slice(0,-1)) {
        res.writeHead(308,{Location: prefix+url.search});res.end();return;
      }
    const prefix = prefixes.filter(p=>url.pathname.startsWith(p)).sort((a,b)=>b.length-a.length)[0];
    let path = decodeURIComponent(url.pathname.slice(prefix.length));
    if (!path || path.endsWith("/")) path += "index.html";
    const file = resolve(root,path);
    if (!file.startsWith(root+"/") || path.split("/").includes("..")) throw new Error("Invalid path");
    if (!(await stat(file)).isFile()) throw new Error("Not a file");
    res.writeHead(200,{"Content-Type":mime[extname(file)] || "application/octet-stream","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"});
    res.end(await readFile(file));
  } catch {
    res.writeHead(404,{"Content-Type":"text/plain"});res.end("Not found");
  }
}).listen(port,"0.0.0.0",()=>console.log(`Static QA on port ${port}; prefixes: ${prefixes.join(", ")}`));
