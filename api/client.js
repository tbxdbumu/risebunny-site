import { botBase } from '../lib/_session.js';
import { originalPath } from '../lib/_helpers.js';

/* Vape istemcisi → bot köprüsü: /api/client/<bot-yolu> isteklerini botun
   kendi HTTP API'sine aktarır. İstemcinin (RisebunnyApi.java) kullandığı
   uçlar whitelist'lidir; bot admin uçlarına (/api/user/:id, /api/shop gibi
   x-bot-secret isteyenler) geçit yoktur.

   Eşlemeler (istemci apiBase = .../api/client):
     GET  /dogrula/{id}      → bot /api/dogrula/{id}
     GET  /user/{id}          → bot /api/kullanici/{id}
     GET  /config/{id}        → bot /api/config/{id}
     /public/*                → bot /api/public/*   (yazma uçları launcher bileti ister)
     /friends/*               → bot /api/friends/* (launcher bileti ister)
     /presence, /presence/leave, /presence/same → bot aynısı (bilet ister)
     /party/*                 → bot /api/party/*   (bilet ister)

   NOT: bu dosya rb-main'deki api/vape.js'ten farklı olarak Authorization
   başlığını /public/, /friends/, /party/ ve presence uçlarına da iletir —
   botun _ticketIzinli doğrulaması başlıktan okur. */

const ALLOW_PREFIXES = [
  '/dogrula/',
  '/kullanici/',
  /* ── '/user/' ÖLÇÜLDÜ (2026-10-23, canlı): YOKTU ────────────────────────
     RisebunnyApi.java:321 `apiBase()+"/user/"+id` çağırıyor ve yorumunda
     "bot /api/kullanici/{id} ↔ proxy GET /user/{id}" yazıyor; ama proxy
     yalnızca '/kullanici/' (Türkçe) rotasını tanıyordu.
     Canlı ölçüm:  GET /api/client/user/1153...  ->  404 {"error":"yol izinli degil"}
     Sonuç: Vape Online hesap özeti (isim, avatar, bakiye, seviye) hiç
     dolmuyordu; profil sahte/identicon gösteriyordu.
     Bot'ta bu yolun karşılığı /api/kullanici/{id}'dir; aşağıdaki
     ROTA_ESLEME bu çeviriyi yapar. */
  '/user/',
  '/config/',
  '/public/',
  '/friends/',
  '/party/',
];
const ALLOW_EXACT = new Set([
  '/public',
  '/presence',
  '/presence/leave',
  '/presence/same',
]);

/* ÖLÇÜLEN HATA: '/dogrula/' ve '/config/' bu listede DEĞİLDİ.
   Sonuç: Authorization başlığı proxy'de düşürülüyordu, bot isteği
   yetkisiz görüyordu ve her turda log'a şu düşüyordu:

     RiseBunny API 401 GET /api/client/dogrula/{id} -> {"error":"unauthorized"}
     RiseBunny API 401 GET /api/client/config/{id}  -> {"error":"unauthorized"}
     Risebunny config store guncellendi: 0 onayli config

   İstemci bu iki uca bilet GÖNDERMİYORDU (RisebunnyApi.java:133 ve :162);
   o da ayrıca düzeltildi. İki katman da eksikti — biri düzeltilse yetmez.
   Sonuç zinciri: dogrula() -> null -> RisebunnyConfigStore.getHesap() -> null
   -> config sahipliği ve hesap etiketi hep boş. */
const TICKET_PREFIXES = [
  '/public/',
  '/friends/',
  '/party/',
  '/presence',
  '/dogrula/',
  '/config/',
  /* '/kullanici/' ÖLÇÜLDÜ (2026-10-23, deploy sonrası canlı test):
     ALLOW_PREFIXES'te vardı ama bu listede YOKTU. Sonuç: uç proxy'den geçiyor
     ama Authorization başlığı düşüyor ve bot "unauthorized" dönüyordu:
       canlı   /kullanici/{id} -> 401 {"error":"unauthorized"}   (başlık YOK)
       yerel   /api/kullanici/{id} -> 401 {"error":"bilet gecersiz"} (başlık VAR)
     İki farklı metin = iki farklı katman. RisebunnyApi.kullaniciGetir() bu
     ucu çağırıyor ve dönen değer null olunca hesap özeti (seviye, bakiye,
     pelerin) boş kalıyordu. */
  '/kullanici/',
  '/user/',
];

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
  /* x-vercel-original-url rewrite'ten ÖNCEKI (gerçek) yolu verir:
     /api/client/public/configs → op = /public/configs → bot /api/public/configs */
  const op = originalPath(req, url).replace(/^\/api\/client/, '') || '/';
  const allowed = ALLOW_PREFIXES.some(p => op.startsWith(p)) || ALLOW_EXACT.has(op);
  if (!allowed) return res.status(404).json({ error: 'yol izinli degil', path: op });

  const headers = { 'user-agent': 'RiseBunnySiteProxy' };
  if (TICKET_PREFIXES.some(p => op.startsWith(p))) {
    const auth = req.headers['authorization'];
    if (auth && /^Bearer [\w.-]{10,300}$/i.test(String(auth))) {
      headers['authorization'] = String(auth);
    }
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
    /* Yol çevirisi: istemci İngilizce adlar kullanıyor, bot Türkçe uçlar
       yayıyor. Eşleme burada tek yerde tutulur. */
    const hedefYol = op.startsWith('/user/')
      ? '/kullanici/' + op.slice('/user/'.length)
      : op;
    const hedef = `${bBase}/api${hedefYol}${url.search || ''}`;
    const cevap = await fetch(hedef, init);
    const metin = await cevap.text();
    res.status(cevap.status)
      .setHeader('Content-Type', cevap.headers.get('content-type') || 'application/json')
      .send(metin || '{}');
  } catch (e) {
    res.status(502).json({ error: 'bot yanit vermedi', detay: String((e && e.message) || e) });
  }
}
