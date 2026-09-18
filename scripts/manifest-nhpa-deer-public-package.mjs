import { promises as fs } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";

const root = process.argv[2];
if (!root) {
  console.error("Usage: node scripts/manifest-nhpa-deer-public-package.mjs <public-package>");
  process.exit(2);
}
async function walk(dir) {
  const out = [];
  for (const ent of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...await walk(p));
    else out.push(p);
  }
  return out;
}
const manifestPath = path.join(root, "public_package_manifest.csv");
const files = (await walk(root)).filter(p => p !== manifestPath).sort();
const rows = ["artifact,bytes,sha256"];
for (const file of files) {
  const data = await fs.readFile(file);
  const rel = path.relative(root, file).split(path.sep).join("/");
  rows.push(`${JSON.stringify(rel)},${data.length},${createHash("sha256").update(data).digest("hex")}`);
}
await fs.writeFile(manifestPath, rows.join("\n") + "\n");
console.log(`Manifested ${files.length} public files.`);
