import { promises as fs } from "node:fs";
import { createReadStream, createWriteStream } from "node:fs";
import { createGzip } from "node:zlib";
import { pipeline } from "node:stream/promises";
import { createHash } from "node:crypto";
import path from "node:path";

const [source, destination] = process.argv.slice(2);
if (!source || !destination) {
  console.error("Usage: node scripts/build-nhpa-deer-public-package.mjs <source-package> <destination-directory>");
  process.exit(2);
}
await fs.rm(destination, { recursive: true, force: true });
await fs.mkdir(path.dirname(destination), { recursive: true });
await fs.cp(source, destination, { recursive: true });

const cells = path.join(destination, "assets", "cells");
for (const name of await fs.readdir(cells)) {
  if (!name.endsWith(".json")) continue;
  const input = path.join(cells, name);
  const output = input + "z";
  await pipeline(createReadStream(input), createGzip({ level: 9 }), createWriteStream(output));
  await fs.unlink(input);
}

const appPath = path.join(destination, "assets", "app.js");
let app = await fs.readFile(appPath, "utf8");
const before = "cache.set(k,await fetch('assets/cells/'+k).then(r=>{if(!r.ok)throw 0;return r.json()}))";
const after = "cache.set(k,await fetch('assets/cells/'+k+'z').then(async r=>{if(!r.ok)throw 0;const ds=new DecompressionStream('gzip');return JSON.parse(await new Response(r.body.pipeThrough(ds)).text())}))";
if (!app.includes(before)) throw new Error("Expected detail-loader expression was not found");
app = app.replace(before, after);
await fs.writeFile(appPath, app);

const sourceManifest = path.join(destination, "interactive_map_manifest.csv");
try { await fs.rename(sourceManifest, path.join(destination, "source_package_manifest.csv")); } catch {}
await fs.writeFile(path.join(destination, "PUBLIC_PACKAGE_README.md"), `# Public package

Derived from the governed interactive-map package for decision DEC-NHPA-W002-T03-2026-09-18-01.

The public transform changes only transport packaging: the 416 cell-detail JSON chunks are gzip-compressed as .jsonz and decompressed in the browser on demand. Raster tiles, values, layer defaults, claim boundaries, and interface content are unchanged. No confidential camera coordinates, raw source archives, credentials, restricted interviews, or local absolute paths are included.

Rebuild from the canonical package with:

    node scripts/build-nhpa-deer-public-package.mjs <source-package> assets/maps/northern-hardwood-deer-relative-v1

The authoritative public integrity record is public_package_manifest.csv. source_package_manifest.csv records the pre-transform governed package and is retained for lineage.
`);

async function walk(dir) {
  const out = [];
  for (const ent of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...await walk(p));
    else out.push(p);
  }
  return out;
}
const manifestPath = path.join(destination, "public_package_manifest.csv");
const files = (await walk(destination)).filter(p => p !== manifestPath).sort();
const csv = ['artifact,bytes,sha256'];
for (const file of files) {
  const data = await fs.readFile(file);
  const rel = path.relative(destination, file).split(path.sep).join("/");
  csv.push(`${JSON.stringify(rel)},${data.length},${createHash("sha256").update(data).digest("hex")}`);
}
await fs.writeFile(manifestPath, csv.join("\n") + "\n");
const total = (await Promise.all(files.map(async p => (await fs.stat(p)).size))).reduce((a,b)=>a+b,0);
console.log(`Public package: ${files.length} files, ${(total/1048576).toFixed(2)} MiB`);
