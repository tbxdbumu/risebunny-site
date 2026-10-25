import { getSession, botBase, botHeaders } from '../lib/_session.js';
import { readJson, originalPath } from '../lib/_helpers.js';

const STATIC_SHOP = [
  { id: 'premium_30', ad: '💎 Premium 30 Gün', fiyat: 250000, tip: 'premium', premiumGerek: false },
  { id: 'pet_tavsan', ad: '🐰 Tavşan', fiyat: 72000, tip: 'pet', premiumGerek: false },
  { id: 'pet_kopek', ad: '🐶 Köpek', fiyat: 90000, tip: 'pet', premiumGerek: false },
  { id: 'pet_kedi', ad: '🐱 Kedi', fiyat: 135000, tip: 'pet', premiumGerek: false },
  { id: 'pet_balik', ad: '🐠 Balık', fiyat: 162000, tip: 'pet', premiumGerek: false },
  { id: 'pet_aslan', ad: '🦁 Aslan', fiyat: 315000, tip: 'pet', premiumGerek: true },
  { id: 'pet_kaplan', ad: '🐅 Kaplan', fiyat: 342000, tip: 'pet', premiumGerek: true }
];

export default async function handler(req, res) {
  const url = new URL(req.url, `https://${req.headers.host}`);
  const op = originalPath(req, url);
  const bBase = botBase();
  const bSec = process.env.BOT_API_SECRET || '';

  console.log('[shop] path:', op, 'method:', req.method);

  if (op.endsWith('/catalog')) {
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60');
    if (bBase && bSec) {
      try {
        const r = await fetch(`${bBase}/api/shop`, { headers: botHeaders() });
        if (r.ok) {
          const j = await r.json();
          if (j.items?.length) return res.json({ items: j.items, live: true });
        }
      } catch {}
    }
    return res.json({ items: STATIC_SHOP, live: false });
  }

  if (op.endsWith('/buy') && req.method === 'POST') {
    const s = getSession(req);
    if (!s) return res.status(401).json({ error: 'Önce Discord ile giriş yap.' });
    if (!bBase || !bSec) return res.status(503).json({ error: 'Mağaza şu an kapalı (bot çevrimdışı).' });
    const body = await readJson(req);
    if (!body.item) return res.status(400).json({ error: 'Ürün seçilmedi.' });
    try {
      const r = await fetch(`${bBase}/api/shop/buy`, {
        method: 'POST',
        headers: { ...botHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: s.id, item: String(body.item) })
      });
      const j = await r.json().catch(() => ({}));
      return res.status(r.status).json(j);
    } catch {
      return res.status(503).json({ error: 'Mağaza şu an kapalı (bot çevrimdışı).' });
    }
  }

  return res.status(404).json({ error: 'not found', path: op });
}