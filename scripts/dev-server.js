import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const files = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/index.html', ['index.html', 'text/html; charset=utf-8']],
  ['/src/app.js', ['src/app.js', 'text/javascript; charset=utf-8']],
  ['/src/colour-model.js', ['src/colour-model.js', 'text/javascript; charset=utf-8']],
  ['/src/colour-picker-model.js', ['src/colour-picker-model.js', 'text/javascript; charset=utf-8']],
  ['/src/wiring.js', ['src/wiring.js', 'text/javascript; charset=utf-8']],
  ['/src/translations.js', ['src/translations.js', 'text/javascript; charset=utf-8']],
  ['/src/styles.css', ['src/styles.css', 'text/css; charset=utf-8']],
]);

createServer(async (request, response) => {
  response.setHeader('X-Content-Type-Options', 'nosniff');
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }

  // Only literal, listed paths can be served; no filesystem path comes from the request.
  const target = request.url?.split('?')[0];
  const entry = target && !target.includes('%') && !target.includes('\\')
    ? files.get(target) : undefined;
  if (!entry) {
    response.writeHead(404).end();
    return;
  }

  try {
    const content = await readFile(fileURLToPath(new URL(entry[0], root)));
    response.writeHead(200, { 'Content-Type': entry[1], 'Content-Length': content.length });
    response.end(request.method === 'HEAD' ? undefined : content);
  } catch {
    response.writeHead(500).end();
  }
}).listen(4173, '127.0.0.1', () => {
  console.log('Open http://127.0.0.1:4173/');
});
