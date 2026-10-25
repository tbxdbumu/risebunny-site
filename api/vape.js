import { botBase } from '../lib/_session.js';
import { originalPath } from '../lib/_helpers.js';

/* Vape istemcisi → bot köprüsü: /api/vape/<bot-yolu> isteklerini botun
   kendi HTTP API'sine aktarır. Yalnızca istemcinin kullandığı uçlar
   whitelist'lidir; bot admin uçlarına (/api/user/:id gibi) geçit yoktur.
   /api/iletisim için x-bot-secret sunucu tarafında eklenir. */

const ALLOW_PREFIXES = [
  '/api/public/',
  '/api/dogrula/',
  '/api/kullanici/',
  '/api/config/',
];
const ALLOW_EXACT = new Set(['/api/public', '/api/iletisim']);

const BOT_TIMEOUT_MS = 9500;
const MAX_BODY = 1.5 * 1024 * 1024; // config base64 ~1 MB sınırına başlık payı

async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const c of req) {
    size += c.length;
    if (size > MAX_BODY) throw new Error('body too large');
    chunks.push(c);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const bBase = botBase();
  if (!bBase) return res.status(502).json({ error: 'BOT_API_URL tanimli degil' });

  const url = new URL(req.url, `https://${req.headers.host}`);
  const op = originalPath(req, url).replace(/^\/api\/vape/, '') || '/';
  const allowed = ALLOW_PREFIXES.some(p => op.startsWith(p)) || ALLOW_EXACT.has(op);
  if (!allowed) return res.status(404).json({ error: 'yol izinli degil', path: op });

  const headers = { 'user-agent': 'RiseBunnySiteProxy' };
  if (op === '/api/iletisim') {
    const sec = process.env.BOT_API_SECRET || '';
    if (sec) headers['x-bot-secret'] = sec;
  }
  /* Yazma uçları (upload/mine/delete/edit) launcher biletini ister;
   yalnızca /api/public/* için Authorization başlığı iletilir. */
  if (op.startsWith('/api/public/')) {
    const auth = req.headers['authorization'];
    if (auth && /^Bearer [\w.-]{10,300}$/i.test(String(auth))) headers['authorization'] = String(auth);
  }

  const init = {
    method: req.method,
    headers,
    signal: AbortSignal.timeout(BOT_TIMEOUT_MS),
  };
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    try {
      const body = await readBody(req);
      if (body.length) init.body = body;
      headers['content-type'] = req.headers['content-type'] || 'application/json';
    } catch (e) {
      return res.status(413).json({ error: String(e.message || e) });
    }
  }

  try {
    const hedef = `${bBase}${op}${url.search || ''}`;
    console.log('[vape] →', req.method, hedef);
    const cevap = await fetch(hedef, init);
    const metin = await cevap.text();
    res.status(cevap.status)
      .setHeader('Content-Type', cevap.headers.get('content-type') || 'application/json')
      .send(metin || '{}');
  } catch (e) {
    res.status(502).json({ error: 'bot yanit vermedi', detay: String((e && e.message) || e) });
  }
}
