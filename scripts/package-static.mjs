import { mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
mkdirSync("release", { recursive: true });
// Offline only. No upload, pinning, paid request or signing.
execFileSync("python3", ["-c", String.raw`
import pathlib,zipfile,hashlib,json
root=pathlib.Path.cwd();release=root/'release'
files=sorted(p for p in (root/'dist').rglob('*') if p.is_file())
if not files or not (root/'dist/index.html').is_file():raise SystemExit('Build dist first')
manifest={'files':[{'path':str(p.relative_to(root/'dist')),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in files]}
(release/'dist-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
def archive(name,paths,relative):
 with zipfile.ZipFile(release/name,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
  for p in sorted(set(paths)):
   if p.is_symlink():raise SystemExit('Symlink refused: '+str(p))
   info=zipfile.ZipInfo(str(p.relative_to(relative)),(2026,1,1,0,0,0))
   info.external_attr=0o100644<<16;info.compress_type=zipfile.ZIP_DEFLATED
   z.writestr(info,p.read_bytes(),compress_type=zipfile.ZIP_DEFLATED,compresslevel=9)
archive('squeekchain-analytics-ipfs-dist.zip',files,root/'dist')
source=[]
for name in ['src','scripts','tests','public','docs','.github','handoff','dist']:
 source.extend(p for p in (root/name).rglob('*') if p.is_file())
for name in ['package.json','package-lock.json','index.html','vite.config.ts','tsconfig.json','postcss.config.mjs','README.md','AGENTS.md','LICENSE','vercel.json','.gitignore','.gitleaks.toml','.nvmrc']:
 p=root/name
 if p.is_file():source.append(p)
archive('squeekchain-analytics-ipfs-source.zip',source,root)
rows=[]
for p in sorted(release.glob('*.zip')):
 rows.append(hashlib.sha256(p.read_bytes()).hexdigest()+'  '+p.name)
 print(p.name,p.stat().st_size,'bytes')
(release/'SHA256SUMS').write_text('\n'.join(rows)+'\n')
print('Offline archives ready. Nothing has been uploaded or published.')
`], { stdio: "inherit" });
