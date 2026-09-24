import {readFile, readdir, access} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const exceptions = new Set([
  'docs/product/personalization/references/affiliate-api-reference.md',
  'docs/product/personalization/references/conversion-reference.md',
  'docs/product/personalization/references/nacs-integration-reference.md',
]);
async function markdownFiles(dir) {
  const files = [];
  for (const entry of await readdir(path.join(root, dir), {withFileTypes: true})) {
    const name = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await markdownFiles(name));
    else if (entry.name.endsWith('.md')) files.push(name);
  }
  return files;
}
const files = ['README.md', 'AGENTS.md', 'mock-app/README.md', 'mock-admin/README.md',
  'mock-nacs/README.md', 'mock-demo/README.md', ...await markdownFiles('docs'),
  ...await markdownFiles('mock-app/design-system')];
const errors = [];
let links = 0;
for (const name of files) {
  if (exceptions.has(name)) continue;
  const source = (await readFile(path.join(root, name), 'utf8')).replace(/```[^]*?```/g, '');
  for (const match of source.matchAll(/!?\[[^\]]*\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g)) {
    const href = match[1];
    if (/^(?:[a-z][a-z\d+.-]*:|#|\/\/)/i.test(href)) continue;
    const clean = decodeURIComponent(href.split(/[?#]/)[0]);
    const target = path.resolve(root, path.dirname(name), clean);
    if (!target.startsWith(root)) { errors.push(`${name}: outside repository: ${href}`); continue; }
    try { await access(target); links++; }
    catch { errors.push(`${name}: missing ${href}`); }
  }
}
const moves = JSON.parse(await readFile(new URL('./document-paths.json', import.meta.url), 'utf8'));
for (const [oldPath, newPath] of Object.entries(moves)) {
  try { await access(path.join(root, newPath)); }
  catch { errors.push(`Moved document missing: ${oldPath} → ${newPath}`); }
}
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Checked ${files.length - exceptions.size} Markdown files, ${links} local links and ${Object.keys(moves).length} moved paths.`);
  console.log('Excluded 3 preserved NACS reference copies with unsupplied relative links. External URLs and anchors are not checked.');
}
