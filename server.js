import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import path from 'node:path';

const app = express();
const PORT = 4269;
const BRIDGE_DIR = path.join(process.cwd(), '_bridge');

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

  console.log(`\n--- NEW BRIDGE REQUEST ---`);
  console.log(`Prompt: ${prompt.substring(0, 100)}...`);

  const requestFile = path.join(BRIDGE_DIR, 'request.json');
  const responseFile = path.join(BRIDGE_DIR, 'response.json');
  if (fs.existsSync(requestFile)) fs.unlinkSync(requestFile);
  if (fs.existsSync(responseFile)) fs.unlinkSync(responseFile);
  fs.writeFileSync(requestFile, JSON.stringify(req.body, null, 2));
  console.log(`Waiting for CLI to process request in ${BRIDGE_DIR}...`);
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
              console.log(`SUCCESS: CLI returned ${responseData.length || 0} voxels.`);
              fs.unlinkSync(requestFile);
              fs.unlinkSync(responseFile);

              res.json(responseData);
          } catch (err) {
              parseRetries++;
              if (parseRetries >= MAX_RETRIES) {
                  clearInterval(interval);
                  console.error("FAILED to parse CLI response after retries:", err.message);
                  res.status(500).json({ error: 'Failed to parse CLI response', details: err.message });
              } else {
                  console.log(`Parse attempt ${parseRetries}/${MAX_RETRIES} failed (file may still be writing), retrying...`);
              }
          }
      } else if (Date.now() - startTime > timeout) {
          clearInterval(interval);
          console.error("TIMEOUT: CLI did not respond in time.");
          if (fs.existsSync(requestFile)) fs.unlinkSync(requestFile);
          res.status(504).json({ error: 'CLI Response Timeout', details: 'The CLI in your terminal did not respond within 10 minutes.' });
      }
  }, 1000);
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

    console.log(`\n--- PROXY REQUEST ---`);
    console.log(`Target: ${endpoint}`);

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
        console.log(`Proxy response status: ${upstream.status}`);
        res.status(upstream.status).set('Content-Type', 'application/json').send(text);
    } catch (err) {
        console.error('Proxy fetch failed:', err.message);
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
  console.log(`Voxel Builder Bridge Server running on http://localhost:${PORT}`);
  console.log(`Bridge Folder: ${BRIDGE_DIR}`);
});
