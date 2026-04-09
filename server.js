import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import path from 'node:path';

const app = express();
const PORT = 4269;
const BRIDGE_DIR = path.join(process.cwd(), '_bridge');
const MAX_LOG_ENTRIES = 200;
const LEVEL_ORDER = { debug: 10, info: 20, warn: 30, error: 40 };
const minLevel = process.env.NODE_ENV === 'production' ? 'warn' : 'info';
const SENSITIVE_KEYS = new Set(['apikey', 'api_key', 'authorization', 'token', 'access_token', 'bearer']);
let diagnosticsLogs = [];

const redactValue = (value) => {
  if (Array.isArray(value)) {
    return value.map(redactValue);
  }
  if (value && typeof value === 'object') {
    const out = {};
    for (const [key, nested] of Object.entries(value)) {
      if (SENSITIVE_KEYS.has(key.toLowerCase())) {
        out[key] = '[REDACTED]';
      } else {
        out[key] = redactValue(nested);
      }
    }
    return out;
  }
  if (typeof value === 'string' && /bearer\s+[A-Za-z0-9_\-\.]+/i.test(value)) {
    return value.replace(/bearer\s+[A-Za-z0-9_\-\.]+/gi, 'Bearer [REDACTED]');
  }
  return value;
};

const emitLog = (level, event, data) => {
  const safeData = redactValue(data);
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: Date.now(),
    source: 'server',
    level,
    event,
    ...(safeData !== undefined ? { data: safeData } : {}),
  };
  diagnosticsLogs = [...diagnosticsLogs, entry].slice(-MAX_LOG_ENTRIES);

  if (LEVEL_ORDER[level] >= LEVEL_ORDER[minLevel]) {
    const method = level === 'debug' ? 'log' : level;
    console[method](`[${level}] ${event}`, safeData ?? {});
  }
};

const logger = {
  debug: (event, data) => emitLog('debug', event, data),
  info: (event, data) => emitLog('info', event, data),
  warn: (event, data) => emitLog('warn', event, data),
  error: (event, data) => emitLog('error', event, data),
};

app.use(cors());
app.use(express.json({ limit: '50mb' }));
if (!fs.existsSync(BRIDGE_DIR)) {
    fs.mkdirSync(BRIDGE_DIR);
}

app.post('/api/generate', (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  logger.info('bridge.request.received', { promptLength: typeof prompt === 'string' ? prompt.length : 0 });

  const requestFile = path.join(BRIDGE_DIR, 'request.json');
  const responseFile = path.join(BRIDGE_DIR, 'response.json');
  if (fs.existsSync(requestFile)) fs.unlinkSync(requestFile);
  if (fs.existsSync(responseFile)) fs.unlinkSync(responseFile);
  fs.writeFileSync(requestFile, JSON.stringify(req.body, null, 2));
  logger.debug('bridge.request.waiting_for_cli', { bridgeDir: BRIDGE_DIR });
  const startTime = Date.now();
  const timeout = 600000;
  let parseRetries = 0;
  const MAX_RETRIES = 5;
  const interval = setInterval(() => {
      if (fs.existsSync(responseFile)) {
          try {
              let rawData = fs.readFileSync(responseFile);
              let responseStr = rawData.toString('utf8');
              if (rawData.length >= 2 && rawData[0] === 0xFF && rawData[1] === 0xFE) {
                  responseStr = rawData.toString('utf16le');
              } else if (responseStr.charCodeAt(0) === 0xFEFF) {
                  responseStr = responseStr.slice(1);
              }
              const startIndex = responseStr.indexOf('[');
              const endIndex = responseStr.lastIndexOf(']');

              if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
                  responseStr = responseStr.substring(startIndex, endIndex + 1);
              }

              const responseData = JSON.parse(responseStr);
              clearInterval(interval);
              logger.info('bridge.response.success', { voxels: responseData.length || 0 });
              fs.unlinkSync(requestFile);
              fs.unlinkSync(responseFile);

              res.json(responseData);
          } catch (err) {
              parseRetries++;
              if (parseRetries >= MAX_RETRIES) {
                  clearInterval(interval);
                  logger.error('bridge.response.parse_failed', { retries: parseRetries, error: err.message });
                  res.status(500).json({ error: 'Failed to parse CLI response', details: err.message });
              } else {
                  logger.debug('bridge.response.parse_retry', { parseRetries, maxRetries: MAX_RETRIES });
              }
          }
      } else if (Date.now() - startTime > timeout) {
          clearInterval(interval);
          logger.error('bridge.response.timeout', { timeoutMs: timeout });
          if (fs.existsSync(requestFile)) fs.unlinkSync(requestFile);
          res.status(504).json({ error: 'CLI Response Timeout', details: 'The CLI in your terminal did not respond within 10 minutes.' });
      }
  }, 1000);
});

app.get('/api/diagnostics/logs', (req, res) => {
  res.json({ logs: diagnosticsLogs });
});

app.post('/api/diagnostics/clear', (req, res) => {
  diagnosticsLogs = [];
  res.json({ ok: true });
});

app.get('/api/skill', (req, res) => {
    const skillFile = path.join(process.cwd(), 'skills', 'VOXEL_SKILL.md');
    if (!fs.existsSync(skillFile)) {
        return res.status(404).json({ error: 'Skill file not found' });
    }
    res.json({ content: fs.readFileSync(skillFile, 'utf8') });
});

app.post('/api/proxy', async (req, res) => {
    const { endpoint, apiKey, ...payload } = req.body;
    if (!endpoint) return res.status(400).json({ error: 'endpoint is required' });

    let endpointHost = 'invalid-url';
    try {
      endpointHost = new URL(endpoint).host;
    } catch {
      endpointHost = 'invalid-url';
    }
    logger.info('proxy.request.received', { endpointHost });

    try {
        const upstream = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {})
            },
            body: JSON.stringify(payload)
        });
        const text = await upstream.text();
        logger.info('proxy.response.received', { endpointHost, status: upstream.status });
        res.status(upstream.status).set('Content-Type', 'application/json').send(text);
    } catch (err) {
        logger.error('proxy.request.failed', { endpointHost, error: err.message });
        res.status(500).json({ error: err.message });
    }
});

const PRESETS_DIR = path.join(process.cwd(), 'presets');
if (!fs.existsSync(PRESETS_DIR)) fs.mkdirSync(PRESETS_DIR);

app.get('/api/presets', (req, res) => {
    const files = fs.readdirSync(PRESETS_DIR).filter(f => f.endsWith('.json'));
    const presets = files.map(f => {
        try { return JSON.parse(fs.readFileSync(path.join(PRESETS_DIR, f), 'utf8')); }
        catch { return null; }
    }).filter(Boolean);
    res.json(presets);
});

app.post('/api/presets', (req, res) => {
    const { name, data } = req.body;
    if (!name || !data) return res.status(400).json({ error: 'Missing name or data' });
    const filename = name.replace(/[^a-z0-9_\-]/gi, '_').toLowerCase() + '.json';
    fs.writeFileSync(path.join(PRESETS_DIR, filename), JSON.stringify({ name, data }, null, 2));
    logger.info('preset.saved', { file: filename, voxels: data.length });
    res.json({ ok: true, file: filename });
});

app.listen(PORT, () => {
  logger.info('server.started', { url: `http://localhost:${PORT}`, bridgeDir: BRIDGE_DIR });
});
