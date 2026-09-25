import {execFileSync} from 'node:child_process';
import {copyFile, mkdir, rm, writeFile, lstat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, '_site');
const directories = ['mock-app', 'mock-admin', 'mock-nacs', 'mock-demo'];
const extensions = new Set(['.html', '.css', '.js', '.svg', '.png', '.jpg', '.jpeg', '.webp', '.gif', '.woff', '.woff2', '.ico']);
// Only tracked runtime assets are published. Never copy the repository root.
const files = execFileSync('git', ['ls-files', '-z', '--', ...directories], {cwd: root, encoding: 'utf8'})
  .split('\0').filter(Boolean).filter(name =>
    extensions.has(path.extname(name)) &&
    !name.split('/').some(part => ['tests', 'design-system'].includes(part)));
await rm(output, {recursive: true, force: true});
await mkdir(output, {recursive: true});
for (const name of files) {
  const source = path.join(root, name);
  if (!(await lstat(source)).isFile()) throw new Error(`Expected regular file: ${name}`);
  const destination = path.join(output, name);
  await mkdir(path.dirname(destination), {recursive: true});
  await copyFile(source, destination);
}
for (const dir of directories) {
  if (!files.includes(`${dir}/index.html`)) throw new Error(`Missing entry point: ${dir}`);
}
await writeFile(path.join(output, 'index.html'), `<!doctype html>
<html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Pochipo モック</title>
<style>body{font-family:system-ui,sans-serif;max-width:640px;margin:48px auto;padding:0 24px;background:#f1f7f4;color:#1e2a26}a{display:block;padding:20px;margin:16px 0;background:white;border:1px solid #dce6e1;border-radius:12px;color:#12806b;font-weight:700;text-decoration:none}p{line-height:1.7}</style></head>
<body><h1>Pochipo モック</h1><a href="mock-app/">アプリモック</a><a href="mock-admin/">管理画面モック</a><a href="mock-nacs/">NACSモック</a><a href="mock-demo/">連動デモ</a><p>操作確認用のサンプルです。同じブラウザーで開いたアプリと管理画面はデモデータを共有します。</p></body></html>`);
await writeFile(path.join(output, '.nojekyll'), '');
await writeFile(path.join(output, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
console.log(`Prepared ${files.length} runtime files in _site (no PRD, meeting notes, tests or source history).`);
