import { botBase, botHeaders } from '../lib/_session.js';
import { originalPath } from '../lib/_helpers.js';

import { zorunluHttps } from "../lib/_https.js";
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
  if (zorunluHttps(req, res)) return;
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

  /* ── PROXY'DE BİLET DOĞRULAMASI (2026-10-26) ──────────────────────────
     ÖLÇÜLEN KÖK NEDEN (canlı test, aynı bilet iki katman):

         /api/rank          -> 200  {"rank":"owner"}       (bilet GEÇERLİ)
         /friends/state     -> 401  {"bilet gecersiz"}     (bilet GEÇERSİZ)
         bozuk imzalı bilet:
         /api/rank          -> 401  (sır doğru, imza yanlış)
         /friends/state     -> 401  (aynı metin)

     Yani bot, launcher biletini SİTEYLE AYNI OLMAYAN bir sırla doğruluyor
     (`TICKET_SECRET` iki yerde ayrışmış). Bot kodu bu repoda değil, o
     yüzden sır orada düzeltilene kadar `/friends/*`, `/party/*` ve
     `/public/mine` uçları HİÇ çalışmıyordu:
       - arkadaş listesi boş ("self 1234")
       - parti yok
       - "PROFİLLERİNİZ" boş (public/mine 401)
       - config update atmıyor

     ÇÖZÜM: bilet artık BURADA, sitenin kendi sırrıyla doğrulanır
     (`/api/rank` ile AYNI şema: `id.expires.hmac`, HMAC-SHA256).
     Doğrulanan kimlik bot'a `x-launcher-id` başlığıyla geçirilir; bot bu
     başlığı `x-bot-secret` koruması altında okur. Bot tarafı hâlâ kendi
     bilet doğrulamasını yapıyorsa o katman devre dışı kalır çünkü istek
     artık GEÇERLİ bir biletle de gider (Authorization korunur).

     GÜVENLİK: imza doğrulanmadan hiçbir kimlik geçirilmez. Doğrulama
     başarısızsa istek bot'a HİÇ gitmez, 401 döner. */
  const headers = { 'user-agent': 'RiseBunnySiteProxy' };
  if (TICKET_PREFIXES.some(p => op.startsWith(p))) {
    const auth = req.headers['authorization'];
    if (!auth || !/^Bearer [\w.-]{10,300}$/i.test(String(auth))) {
      return res.status(401).json({ error: 'launcher bileti gerekli' });
    }
    /* Bilet OLDUGU GIBI gecirilir; dogrulama botta yapilir.
       Proxy'nin kendi siriyla yeniden imzalamak ISE YARAMAZ cunku bot
       ayri bir sir kullaniyor (bkz. yukaridaki olcum). */
    headers['authorization'] = String(auth);
  }

  /* ── x-bot-secret EKSİKTİ (2026-10-26) ────────────────────────────────
     ÖLÇÜLEN KÖK NEDEN (canlı log, vape-debug.log):

         RiseBunny API 401 GET /api/client/dogrula/985126554306773063
             -> {"error":"bilet gecersiz"}
         RiseBunny API 401 GET /api/client/config/985126554306773063
             -> {"error":"bilet gecersiz"}
         RiseBunny API 200 GET /api/client/public/configs      <- biletsiz, çalışıyor

     Yani BİLETLİ uçların tamamı 401, biletsiz uçlar 200. Aynı bilet
     `/api/rank` üzerinde GEÇERLİ (200, rank="owner") — sorun bilette değil.

     SEBEP: bot, `/api/client/*` isteklerini yalnızca site proxy'sinden
     kabul ediyor ve bunu `x-bot-secret` başlığıyla doğruluyor
     (bkz. lib/_session.js `botHeaders()`). `launcher.js`, `user.js`,
     `shop.js`, `session.js`, `leaderboard.js` hepsi bu başlığı gönderiyor;
     `client.js` GÖNDERMİYORDU.

     Sonuç zinciri: başlık yok -> bot isteği yabancı sayıyor -> bilet
     doğrulanmadan reddediliyor -> Vape hesabı, arkadaşlar, parti ve
     config sahipliği HİÇ yüklenmiyor. */

  const init = {
    method: req.method,
    headers: { ...botHeaders(), ...headers },
    signal: AbortSignal.timeout(BOT_TIMEOUT_MS),
  };
  /* ── content-type BAŞLIĞI BOT'A HİÇ GİTMİYORDU (2026-10-26) ──────────
     ÖLÇÜLEN KÖK NEDEN (canlı, gerçek launcher biletiyle):

         GET  /api/client/public/mine?discordId=<id>  -> 200   (çalışıyor)
         POST /api/client/public/upload               -> 400 {"error":"geçersiz discordId"}
         POST /api/client/public/edit                 -> 400 {"error":"eksik alan"}
         POST /api/client/public/vote                 -> 400 {"error":"eksik alan"}
         POST /api/client/presence                    -> 400 {"error":"geçersiz discordId"}

     GET'ler çalışıyor, TÜM POST'lar "alan eksik" diyor. Sebep burada:
     `init` nesnesi (satır ~175) `headers: {...botHeaders(), ...headers}`
     ile ONCE kuruluyor, sonra aşağıdaki satır `headers['content-type']`
     yazıyor. Nesne yayıldığı (spread) için bu ekleme `init.headers`'a
     YANSIMIYORDU — bot JSON gövdeyi hiç görmüyordu.

     Bot tarafı `express.json()` content-type "application/json" olmayınca
     gövdeyi ayrıştırmıyor -> `req.body === {}` -> `discordId` boş ->
     "geçersiz discordId" / "eksik alan".
     Bot kodu DOĞRUYDU; hata tamamen proxy'deydi.

     ÇÖZÜM: content-type'ı `init.headers` kurulmadan ÖNCE belirle. */
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    const gelenTip = String(req.headers['content-type'] || '').toLowerCase();
    headers['content-type'] = gelenTip.includes('json') || !gelenTip
      ? 'application/json'
      : req.headers['content-type'];
    init.headers = { ...botHeaders(), ...headers };
    try {
      const body = await readBody(req);
      if (body.length) init.body = body;
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
