// pochipo ルートの静的サーバー：/mock-app/ /mock-admin/ /mock-nacs/ /mock-demo/ を同一オリジンで配信（localStorage を共有）
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = path.dirname(fileURLToPath(import.meta.url));
const documentPaths = JSON.parse(await readFile(new URL('./scripts/document-paths.json', import.meta.url), 'utf8'));
const port = Number(process.env.PORT || 4174);
const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml', '.md': 'text/plain; charset=utf-8', '.json': 'application/json',
  '.gif':'image/gif', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2',
};
http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    let pathname = decodeURIComponent(url.pathname);
    for (const [from, to] of Object.entries(documentPaths)) {
      const oldPath = '/' + from;
      if (pathname === oldPath || (from.endsWith('/') && pathname.startsWith(oldPath))) {
        const destination = '/' + to + pathname.slice(oldPath.length);
        res.writeHead(302, {Location: encodeURI(destination) + url.search, 'Cache-Control': 'no-store'});
        res.end();
        return;
      }
    }
    if (pathname === '/') pathname = '/index.html';
    if (pathname.endsWith('/')) pathname += 'index.html';
    const file = path.resolve(root, '.' + pathname);
    if (!file.startsWith(root + path.sep)) throw Error('Outside root');
    const data = await readFile(file);
    res.writeHead(200, {'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store'});
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
}).listen(port, '127.0.0.1', () => console.log(`pochipo-en: http://localhost:${port}/`));
