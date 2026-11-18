const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const PORT = 3000;
const BACKEND_PORT = 5000;
const DIST_DIR = path.join(__dirname, 'dist');

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.map': 'application/json'
};

const server = http.createServer((req, res) => {
  // Check if this is an API route that should proxy to backend
  const apiPaths = ['/feed', '/api/feed', '/swipe', '/api/swipe', '/matches', '/api/matches', '/reset', '/api/reset', '/health', '/stats'];
  const isApi = apiPaths.some(p => req.url.startsWith(p));

  if (isApi) {
    // Proxy request to backend server
    const proxyReq = http.request({
      hostname: '127.0.0.1',
      port: BACKEND_PORT,
      path: req.url,
      method: req.method,
      headers: {
        ...req.headers,
        host: `127.0.0.1:${BACKEND_PORT}`
      }
    }, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      console.error(`[Proxy Error] Unable to connect to backend on port ${BACKEND_PORT}:`, err.message);
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'Backend unavailable. Ensure backend server is running on port ' + BACKEND_PORT
      }));
    });

    req.pipe(proxyReq);
    return;
  }

  // Serve static frontend assets
  let filePath = path.join(DIST_DIR, req.url === '/' ? 'index.html' : req.url.split('?')[0]);

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    // SPA fallback to index.html
    filePath = path.join(DIST_DIR, 'index.html');
  }

  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500);
      res.end('Server Error loading ' + filePath);
      return;
    }
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(` Coy Frontend Dev Server running on port ${PORT}`);
  console.log(` URL: http://localhost:${PORT}`);
  console.log(` Proxying API calls to http://localhost:${BACKEND_PORT}`);
  console.log(`===============================================`);
});
