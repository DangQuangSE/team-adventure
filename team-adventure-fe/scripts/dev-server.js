import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';

const port = Number(process.env.PORT || 5173);
const root = resolve(process.cwd());

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml'
};

createServer((request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const requestedPath = url.pathname === '/' ? '/index.html' : url.pathname;
  const filePath = resolve(join(root, requestedPath));

  if (!filePath.startsWith(root) || !existsSync(filePath) || statSync(filePath).isDirectory()) {
    response.writeHead(404);
    response.end('Not found');
    return;
  }

  response.writeHead(200, {
    'Content-Type': contentTypes[extname(filePath)] || 'application/octet-stream'
  });
  createReadStream(filePath).pipe(response);
}).listen(port, () => {
  console.log(`Team Adventure frontend: http://localhost:${port}`);
});
