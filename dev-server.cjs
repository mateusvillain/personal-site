const browserSync = require('browser-sync').create();
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
require('dotenv').config({ path: path.resolve(__dirname, '.env.local') });

const distDir = path.resolve(__dirname, 'dist');
const apiDir = path.resolve(__dirname, 'api');

function resolveHtmlRoute(urlPath) {
  if (!urlPath || urlPath === '/') return null;
  if (path.extname(urlPath)) return null;

  const normalizedPath = urlPath.replace(/\/+$/, '');
  const relativePath = normalizedPath.replace(/^\/+/, '');
  if (!relativePath) return null;

  const htmlFilePath = path.join(distDir, `${relativePath}.html`);
  return fs.existsSync(htmlFilePath) ? `/${relativePath}.html` : null;
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body)
  });
  res.end(body);
}

function sendText(res, statusCode, message) {
  res.writeHead(statusCode, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(message);
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    if (req.method === 'GET' || req.method === 'HEAD') {
      resolve(undefined);
      return;
    }

    let rawBody = '';
    req.on('data', chunk => {
      rawBody += chunk;
    });
    req.on('end', () => {
      if (!rawBody) {
        resolve(undefined);
        return;
      }

      const contentType = req.headers['content-type'] || '';

      try {
        if (contentType.includes('application/json')) {
          resolve(JSON.parse(rawBody));
          return;
        }

        if (contentType.includes('application/x-www-form-urlencoded')) {
          resolve(Object.fromEntries(new URLSearchParams(rawBody)));
          return;
        }

        resolve(rawBody);
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

async function handleApiRequest(req, res) {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  const apiName = pathname.replace(/^\/api\/+/, '');

  if (!apiName) {
    sendText(res, 404, 'API route not found');
    return true;
  }

  const apiFilePath = path.join(apiDir, `${apiName}.js`);
  if (!fs.existsSync(apiFilePath)) {
    sendText(res, 404, 'API route not found');
    return true;
  }

  try {
    req.body = await parseBody(req);
  } catch {
    sendJson(res, 400, { error: 'Invalid request body' });
    return true;
  }

  const originalUrl = req.url;
  req.query = Object.fromEntries(new URL(req.url, 'http://localhost').searchParams.entries());

  const response = {
    statusCode: 200,
    headers: {},
    ended: false,
    status(code) {
      this.statusCode = code;
      return this;
    },
    setHeader(name, value) {
      this.headers[name] = value;
      return this;
    },
    json(payload) {
      if (this.ended) return this;
      this.ended = true;
      sendJson(res, this.statusCode, payload);
      return this;
    },
    send(payload) {
      if (this.ended) return this;
      this.ended = true;

      if (typeof payload === 'object' && payload !== null) {
        return this.json(payload);
      }

      res.writeHead(this.statusCode, this.headers);
      res.end(payload);
      return this;
    },
    end(payload = '') {
      if (this.ended) return this;
      this.ended = true;
      res.writeHead(this.statusCode, this.headers);
      res.end(payload);
      return this;
    }
  };

  try {
    const moduleUrl = `${pathToFileURL(apiFilePath).href}?t=${Date.now()}`;
    const apiModule = await import(moduleUrl);
    const handler = apiModule.default;

    if (typeof handler !== 'function') {
      sendText(res, 500, 'Invalid API handler');
      return true;
    }

    await handler(req, response);

    if (!response.ended && !res.writableEnded) {
      response.end();
    }
  } catch (error) {
    console.error(`API error on ${originalUrl}`, error);
    if (!res.writableEnded) {
      sendJson(res, 500, { error: 'Internal server error' });
    }
  }

  return true;
}

browserSync.init({
  server: {
    baseDir: distDir,
    middleware: [
      async (req, res, next) => {
        if (req.url.startsWith('/api/')) {
          await handleApiRequest(req, res);
          return;
        }

        const [pathname, search = ''] = req.url.split('?');
        const rewrittenPath = resolveHtmlRoute(pathname);

        if (rewrittenPath) {
          req.url = search ? `${rewrittenPath}?${search}` : rewrittenPath;
        }

        next();
      }
    ]
  },
  files: ['dist/**/*'],
  open: true
});
