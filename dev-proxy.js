const http = require('http');
const { URL } = require('url');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:8081';

function proxyRequest(req, res) {
  const requestPath = req.url?.startsWith('/api') ? req.url.replace(/^\/api/, '') || '/' : req.url || '/';
  const targetUrl = new URL(requestPath, BACKEND_URL);

  console.log(`[proxy] ${req.method} ${req.url} -> ${targetUrl.href}`);

  const proxyReq = http.request(
    {
      hostname: targetUrl.hostname,
      port: targetUrl.port || (targetUrl.protocol === 'https:' ? 443 : 80),
      path: `${targetUrl.pathname}${targetUrl.search}`,
      method: req.method,
      headers: {
        ...req.headers,
        host: targetUrl.host,
        origin: FRONTEND_ORIGIN,
      },
    },
    (proxyRes) => {
      const headers = {
        ...(proxyRes.headers || {}),
        'Access-Control-Allow-Origin': FRONTEND_ORIGIN,
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      };

      res.writeHead(proxyRes.statusCode || 200, headers);
      proxyRes.pipe(res);
    },
  );

  proxyReq.on('error', (error) => {
    res.writeHead(502, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': FRONTEND_ORIGIN,
    });
    res.end(JSON.stringify({ success: false, message: 'Proxy request failed', error: error.message }));
  });

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    req.pipe(proxyReq);
  } else {
    proxyReq.end();
  }
}

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': FRONTEND_ORIGIN,
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    });
    res.end();
    return;
  }

  proxyRequest(req, res);
});

server.listen(8082, () => {
  console.log('HomeNet dev proxy listening on http://localhost:8082');
});
