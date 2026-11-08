/**
 * KAPI: rank akisi uctan uca (bot -> site -> launcher)
 *
 * NEDEN
 * -----
 * Üç ayrı kod tabanı aynı sözleşmeyi konuşuyor:
 *
 *   launcher  -> GET {SITE}/api/rank          Authorization: Bearer <id>.<exp>.<hmac>
 *   site      -> GET {BOT}/api/rank/:id       x-bot-secret
 *   bot       -> { ok, rank, kullaniciAdi, avatar }
 *
 * Bu betik GERÇEK `/api/rank` handler'ını (rb-fixed) çalıştırır:
 *   - gerçek bir HMAC token üretir (api/launcher.js ile aynı şema),
 *   - `fetch`'i sahte bir bota yönlendirir,
 *   - dönen JSON'un launcher'ın beklediği alanlarla uyuştuğunu ölçer.
 *
 * Vercel'e veya Discord'a HİÇ istek gitmez (fetch taklit edilir).
 *
 * Çıkış kodu 0 = hepsi geçti, 2 = kırık.
 */

import crypto from "node:crypto";

/* ── Sahte sunucu ortamı ──────────────────────────────────────────────── */
const SECRET = "kap-test-" + "x".repeat(48);
const BOT_SECRET = "bot-secret-test";
process.env.SESSION_SECRET = SECRET;
process.env.BOT_API_SECRET = BOT_SECRET;
process.env.BOT_API_URL = "https://bot.sahte";
process.env.NODE_ENV = "production";

const ID = "985126554306773063";

/** api/launcher.js `mintAccessToken` ile AYNI şema. */
function token(id, ms = 12 * 3600 * 1000) {
  const expires = Date.now() + ms;
  const payload = `${id}.${expires}`;
  const sig = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

/* Bot cevapları */
const BOT_RANK = { rank: "owner", kullaniciAdi: "ahmetbs", avatar: "https://cdn.discordapp.com/avatars/1/a.png?size=128" };
const BOT_PREMIUM = { bitis: Date.now() + 10 * 86400000 };

let botIstekleri = [];

globalThis.fetch = async (url, secenekler = {}) => {
  const u = String(url);
  botIstekleri.push({ u, headers: secenekler.headers || {} });
  const json = (govde, durum = 200) => ({
    ok: durum >= 200 && durum < 300,
    status: durum,
    json: async () => govde,
    text: async () => JSON.stringify(govde)
  });
  if (u.includes("/api/rank/")) return json({ ok: true, ...BOT_RANK });
  if (u.includes("/api/launcher/premium/")) return json(BOT_PREMIUM);
  return json({ ok: false }, 404);
};

/* ── Sahte req/res ────────────────────────────────────────────────────── */
function cagir(handler, { url, headers }) {
  return new Promise(cozum => {
    let durum = 0;
    const basliklar = {};
    const res = {
      set statusCode(v) {
        durum = v;
      },
      get statusCode() {
        return durum;
      },
      setHeader(k, v) {
        basliklar[k.toLowerCase()] = v;
      },
      json(g) {
        cozum({ durum, basliklar, govde: g });
        return res;
      },
      status(k) {
        durum = k;
        return res;
      },
      end() {
        cozum({ durum, basliklar, govde: null });
        return res;
      }
    };
    const req = {
      method: "GET",
      url,
      headers: { host: "risebunny.vercel.app", "x-forwarded-proto": "https", ...headers },
      socket: {}
    };
    Promise.resolve(handler(req, res)).catch(e => cozum({ durum: -1, hata: String(e) }));
  });
}

/* ── Ölçüm ────────────────────────────────────────────────────────────── */
let hata = 0;
let gecen = 0;
function bekle(ad, kosul, ayrinti) {
  if (kosul) {
    gecen++;
    console.log(`  [OK] ${ad}`);
  } else {
    hata++;
    console.log(`  [KIRIK] ${ad}  ${ayrinti || ""}`);
  }
}

console.log("=".repeat(70));
console.log("KAPI: rank akisi uctan uca (bot -> site -> launcher)");
console.log("=".repeat(70));

const { default: rankHandler } = await import("../api/rank/index.js");

/* 1) Geçerli launcher tokeni */
{
  const r = await cagir(rankHandler, {
    url: "/api/rank",
    headers: { authorization: `Bearer ${token(ID)}` }
  });
  bekle("gecerli token -> 200", r.durum === 200, `durum=${r.durum}`);
  const p = r.govde && r.govde.profil;
  bekle("cevap launcher alanlarini tasiyor", !!p, JSON.stringify(r.govde).slice(0, 120));
  if (p) {
    bekle("kullanici_adi dolu (bot'tan geldi)", p.kullanici_adi === "ahmetbs", `gelen=${p.kullanici_adi}`);
    bekle("rank = owner", p.rank === "owner", `gelen=${p.rank}`);
    bekle("avatar Discord CDN", String(p.avatar).startsWith("https://cdn.discordapp.com/"), `gelen=${p.avatar}`);
    bekle("premium_bitis sayi", Number(p.premium_bitis) > 0, `gelen=${p.premium_bitis}`);
    bekle("discord_id SIZMIYOR", !("discord_id" in p), "discord_id cevapta var!");
  }
}

/* 2) Token YOK */
{
  const r = await cagir(rankHandler, { url: "/api/rank", headers: {} });
  bekle("tokensiz -> 401", r.durum === 401, `durum=${r.durum}`);
}

/* 3) Bozuk imza */
{
  const t = token(ID);
  const parcalar = t.split(".");
  parcalar[2] = "0".repeat(64);
  const r = await cagir(rankHandler, { url: "/api/rank", headers: { authorization: `Bearer ${parcalar.join(".")}` } });
  bekle("bozuk imza -> 401", r.durum === 401, `durum=${r.durum}`);
}

/* 4) Süresi geçmiş token */
{
  const r = await cagir(rankHandler, {
    url: "/api/rank",
    headers: { authorization: `Bearer ${token(ID, -1000)}` }
  });
  bekle("suresi gecmis token -> 401", r.durum === 401, `durum=${r.durum}`);
}

/* 5) Başka sırla imzalanmış token (forge) */
{
  const sahte = crypto
    .createHmac("sha256", "baska-sir")
    .update(`${ID}.${Date.now() + 1000}`)
    .digest("hex");
  const r = await cagir(rankHandler, {
    url: "/api/rank",
    headers: { authorization: `Bearer ${ID}.${Date.now() + 1000}.${sahte}` }
  });
  bekle("yabanci sirlа imzali token -> 401", r.durum === 401, `durum=${r.durum}`);
}

/* 6) Bot'a giden istek x-bot-secret taşıyor mu */
{
  const rankIstegi = botIstekleri.find(x => x.u.includes("/api/rank/"));
  bekle(
    "bot istegi x-bot-secret ile gidiyor",
    rankIstegi && String(rankIstegi.headers["x-bot-secret"] || "") === BOT_SECRET,
    `gelen=${rankIstegi ? rankIstegi.headers["x-bot-secret"] : "istek yok"}`
  );
  bekle(
    "bot istegi dogru uca gidiyor",
    rankIstegi && rankIstegi.u === `https://bot.sahte/api/rank/${ID}`,
    `gelen=${rankIstegi ? rankIstegi.u : "istek yok"}`
  );
}

/* 7) Herkese açık uç: ID ile sorgu ID sızdırmamalı */
{
  const r = await cagir(rankHandler, { url: `/api/rank/${ID}`, headers: {} });
  bekle("ID sorgusu -> 200", r.durum === 200, `durum=${r.durum}`);
  const g = r.govde || {};
  bekle("ID sorgusu yalnizca rank+ad+avatar", !("profil" in g) && !("discord_id" in g), JSON.stringify(g).slice(0, 120));
}

console.log("-".repeat(70));
console.log(`  gecen: ${gecen}   kirik: ${hata}`);
console.log("=".repeat(70));
process.exit(hata === 0 ? 0 : 2);
