/**
 * /api/rank  —  Rank servisi (SUNUCU tarafi)
 *
 * NEDEN BURADA
 * ------------
 * Rank'in tek dogruluk kaynagi buradadir. Launcher, Vape istemcisi ve site
 * ayni yerden okur; hicbiri kendi rank'ini uyduramaz.
 *
 * GUVENLIK
 * --------
 *  1) Kullanici kimligi SADECE oturumdan alinir (imzali `rb_session`
 *     cookie). Istek govdesindeki/parametresindeki bir `discordId` ASLA
 *     "ben su kisiyim" diye kabul edilmez — aksi halde herkes baskasinin
 *     rankini sorabilir, hatta kendi rankini yazabilirdi.
 *     MASAUSTU ISTISNASI (2026-10-25): launcher cookie tasimaz; bu yuzden
 *     `Authorization: Bearer <launcher tokeni>` de kabul edilir. Token
 *     `api/launcher.js` icindeki HMAC semasiyla DOGRULANIR (`mintAccessToken`
 *     ile ayni bicim). Dogrulama basarisizsa kimlik YOK sayilir.
 *     DiKKAT: `discord_id` alani cevaptan KALDIRILDI — launcher'in buna
 *     ihtiyaci yok ve ID sizintisi istenmiyor.
 *  2) Yazma yolu (`POST`) bu dosyada YOK. Rank yalnizca bot tarafindan
 *     `BOT_API_SECRET` ile yazilir (rb2-main: r!rank ver).
 *  3) Disari yalnizca rank ADI, kullanici adi, avatar ve premium bitisi
 *     cikar. Discord ID listesi, mod listesi, premium listesi, lisans
 *     bilgisi Disari CIKMAZ.
 *  4) Rank bilinmeyen/bos ise `user` doner — hata degil, yetki de degil.
 *
 * UC LAR
 *   GET /api/rank          -> oturum sahibinin ranki (launcher bunu kullanir)
 *   GET /api/rank/<id>     -> bir kisinin HERKESE ACIK gorunen ranki
 *                             (config paylasani goruntulemede kullanilir)
 *                             Yalnizca rank + kullanici adi + avatar doner.
 */

import crypto from "node:crypto";

import { getSession, botBase, botHeaders } from "../../lib/_session.js";

import { zorunluHttps } from "../../lib/_https.js";
/* ── Launcher tokeni ─────────────────────────────────────────────────────
   Launcher `Authorization: Bearer <id>.<expires>.<hmac>` gönderir.
   Biçim ve imza `api/launcher.js` içindeki `mintAccessToken` ile AYNIDIR.
   Burada yalnızca DOĞRULAMA yapılır; token üretilmez (üretim tek yerde
   kalsın diye). İmza sırrı: `TICKET_SECRET` (tek kaynak).

   NEDEN GEREKLİ: launcher `Set-Cookie` taşıyan bir tarayıcı değil. Oturum
   cookie'si olmadan `/api/rank` 401 dönerdi ve rozet hiç çizilmezdi. */
function launcherSirri() {
  /* TEK SIR KAYNAGI: TICKET_SECRET (api/launcher.js ile AYNI).
     Eskiden `LAUNCHER_TOKEN_SECRET` okunuyordu; token ise
     `SESSION_SECRET` ile uretiliyordu -> imza tutmuyor -> 401. */
  const s = process.env.TICKET_SECRET || "";
  return s.length >= 16 ? s : "";
}

/** Token geçerliyse Discord ID döner, aksi halde null. */
function launcherTokeniDogrula(raw) {
  try {
    const s = launcherSirri();
    if (!s) return null;
    const tok = String(raw || "").trim();
    const p = tok.split(".");
    if (p.length !== 3) return null;
    const [tokId, expires, sig] = p;
    if (!/^\d{15,20}$/.test(tokId)) return null;
    if (!/^\d{10,16}$/.test(expires)) return null;
    const beklenen = crypto
      .createHmac("sha256", s)
      .update(`${tokId}.${expires}`)
      .digest("hex");
    const a = Buffer.from(beklenen);
    const b = Buffer.from(sig);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    if (Date.now() > Number(expires)) return null;
    return tokId;
  } catch {
    return null;
  }
}

/** Gecerli rank kumesi. `mod` -> `moderator` normalize edilir. */
const GECERLI = new Set(["owner", "admin", "moderator", "youtuber", "user"]);

function normalizeRank(v) {
  const s = String(v == null ? "" : v).trim().toLowerCase();
  if (s === "mod") return "moderator";
  if (s === "yt") return "youtuber";
  return GECERLI.has(s) ? s : "user";
}

/** Kontrol karakterlerini at, uzunluk sinirla. */
function tekSatir(v, max) {
  return String(v == null ? "" : v)
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

/**
 * Avatar URL dogrulama: YALNIZCA Discord CDN.
 * Serbest URL kabul etmek, rozetin yaninda keyfi bir gorselin
 * gosterilmesine (ve IP sizintisina) yol acardi.
 */
/* Avatar CDN adresinden YALNIZCA dosya adini (hash) cikarir.
   OLCULEN SORUN (2026-10-25): "kendi discord profilim gozukmuyor".
   Avatar alani kimlik icerdigi icin cevaplardan kaldirilmisti -> avatar
   da kayboldu. Cozum: kimligi gondermek yerine yalnizca hash'i gonder;
   launcher `<taban>/api/launcher/avatar?h=<hash>` ile resmi ceker.
   Hash ornegi: "a_1b2c3d4e..." — kimlik DEGIL, dosya adi. */
function avatarHash(u) {
  const tam = guvenliAvatar(u);
  if (!tam) return "";
  try {
    const p = new URL(tam);
    /* /avatars/<ID>/<hash>.png  ->  <hash> */
    const parcalar = p.pathname.split("/").filter(Boolean);
    const son = parcalar[parcalar.length - 1] || "";
    const hash = son.replace(/\.[a-z0-9]+$/i, "");
    return /^[a-z0-9_]{1,64}$/i.test(hash) ? hash : "";
  } catch {
    return "";
  }
}

function guvenliAvatar(u) {
  const raw = String(u || "").trim();
  if (!raw) return "";
  let p;
  try {
    p = new URL(raw);
  } catch {
    return "";
  }
  if (p.protocol !== "https:") return "";
  const h = p.host.toLowerCase();
  if (h !== "cdn.discordapp.com" && h !== "media.discordapp.net") return "";
  return p.toString();
}

/* ── Hiz siniri ─────────────────────────────────────────────────────────
   Kimliksiz cagrilar (GET /api/rank/<id>) icin IP basina dakikada 60.
   Oturumlu cagrilar oturum kimligine gore ayni siniri paylasir. */
const _limit = new Map();
const PENCERE = 60 * 1000;
const MAKS = 60;

function sinirAsildi(anahtar) {
  try {
    const simdi = Date.now();
    const kuyruk = (_limit.get(anahtar) || []).filter(t => simdi - t < PENCERE);
    if (kuyruk.length >= MAKS) {
      _limit.set(anahtar, kuyruk);
      return true;
    }
    kuyruk.push(simdi);
    _limit.set(anahtar, kuyruk);
    if (_limit.size > 5000) {
      for (const [k, v] of _limit) if (!v.some(t => simdi - t < PENCERE)) _limit.delete(k);
    }
    return false;
  } catch {
    return false;
  }
}

function istemciIp(req) {
  try {
    const h = req.headers || {};
    return String(h["x-forwarded-for"] || h["x-real-ip"] || "?").split(",")[0].trim();
  } catch {
    return "?";
  }
}

/* ── Bot'tan rank sorgusu ───────────────────────────────────────────────
   Rank'in gercek deposu bot tarafidir (rb2-main, croxydb).
   Site yalnizca yetkili bir aracidir; `x-bot-secret` olmadan bot bu
   uca cevap vermez. */
async function bottanRank(id) {
  const bBase = botBase();
  const bSec = process.env.BOT_API_SECRET || "";
  if (!bBase || !bSec) return null;

  const kontrol = String(id).replace(/\D/g, "");
  if (!/^\d{15,25}$/.test(kontrol)) return null;

  try {
    const r = await fetch(`${bBase}/api/rank/${encodeURIComponent(kontrol)}`, {
      method: "GET",
      headers: { ...botHeaders(), Accept: "application/json" }
    });
    if (!r.ok) return null;
    const j = await r.json().catch(() => null);
    if (!j || !j.ok) return null;
    return {
      rank: normalizeRank(j.rank),
      kullaniciAdi: tekSatir(j.kullaniciAdi, 64),
      avatar: guvenliAvatar(j.avatar)
    };
  } catch {
    return null;
  }
}

/* ── Premium bitisi (mevcut launcher.js ile ayni kaynak) ────────────────
   Rank servisi premium'u YENIDEN HESAPLAMAZ; mevcut dogrulanmis akisi
   kullanir. Bulunamazsa 0 (= yok) doner. */
async function premiumBitis(id) {
  const bBase = botBase();
  const bSec = process.env.BOT_API_SECRET || "";
  if (!bBase || !bSec) return 0;

  /* YOL 1: ozel premium ucu (en dogru kaynak: ham bitis zamani).
     OLCULEN SORUN (2026-10-25): bot bu rotayi DONDURMUYORDU (404) ve
     herkes "premium yok" goruyordu. Rota bot'a eklendi; yine de bot
     eski surumdeyse YOL 2 devreye girer. */
  try {
    const r = await fetch(`${bBase}/api/launcher/premium/${encodeURIComponent(id)}`, {
      headers: { ...botHeaders(), Accept: "application/json" }
    });
    if (r.ok) {
      const j = await r.json().catch(() => ({}));
      const n = Number(j && (j.bitis || j.premiumBitis || j.expiresAt) || 0);
      if (Number.isFinite(n) && n > 0) return n;
    }
  } catch {}

  /* YOL 2: genel kullanici ucu — `premium.daysLeft` gun cinsindendir.
     Bitis zamanina cevrilir. Bu, bot guncellenmeden ONCE de calisir. */
  try {
    const r2 = await fetch(`${bBase}/api/user/${encodeURIComponent(id)}`, {
      headers: { ...botHeaders(), Accept: "application/json" }
    });
    if (!r2.ok) return 0;
    const u = await r2.json().catch(() => ({}));
    if (!u || !u.premium || !u.premium.active) return 0;
    const gun = Number(u.premium.daysLeft || 0);
    if (!Number.isFinite(gun) || gun <= 0) return 0;
    return Date.now() + gun * 86400000;
  } catch {
    return 0;
  }
}

export default async function handler(req, res) {
  if (zorunluHttps(req, res)) return;
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Yalnizca GET" });
  }

  const url = new URL(req.url, `https://${req.headers.host}`);
  // /api/rank  veya  /api/rank/<id>
  const parcalar = url.pathname.split("/").filter(Boolean);
  const sonParca = parcalar[parcalar.length - 1] || "";
  const hedefId = /^\d{15,25}$/.test(sonParca) ? sonParca : "";

  const oturum = getSession(req);
  /* Kimlik önceliği: oturum cookie'si → launcher tokeni.
     Token yalnızca "kim bu" sorusunu cevaplar; rank yine bottan okunur. */
  const launcherId = oturum && oturum.id
    ? ""
    : launcherTokeniDogrula(String(req.headers.authorization || "").replace(/^Bearer\s+/i, ""));
  const sahip = oturum && oturum.id ? String(oturum.id) : launcherId || "";
  const anahtar = sahip ? `u:${sahip}` : `ip:${istemciIp(req)}`;
  if (sinirAsildi(anahtar)) {
    res.setHeader("Retry-After", "60");
    return res.status(429).json({ ok: false, error: "Cok fazla istek. Biraz bekle." });
  }

  /* ── Basamak 1: herkese acik, hafif rank sorgusu ──────────────────────
     Yalnizca rank + ad + avatar. Premium, ID, e-posta YOK. */
  if (hedefId) {
    const bot = await bottanRank(hedefId);
    if (!bot) {
      // Bot kapali ya da kayit yok: 503 degil, "user" donmek yaniltici olur.
      return res.status(200).json({ ok: true, rank: "user", kullaniciAdi: "", avatar: "" });
    }
    return res.status(200).json({
      ok: true,
      rank: bot.rank,
      kullaniciAdi: bot.kullaniciAdi,
      avatar: bot.avatar
    });
  }

  /* ── Basamak 2: sahibin profili (launcher) ───────────────────────────
     Kimlik oturumdan YA DA doğrulanmış launcher tokeninden gelir. */
  if (!sahip) {
    return res.status(401).json({ ok: false, error: "Once Discord ile giris yap." });
  }

  const id = String(sahip).replace(/\D/g, "");
  if (!/^\d{15,25}$/.test(id)) {
    return res.status(400).json({ ok: false, error: "Gecersiz oturum kimligi." });
  }

  const bot = await bottanRank(id);
  const [bitis, kullaniciAdi, avatar] = await Promise.all([
    premiumBitis(id),
    Promise.resolve(bot ? bot.kullaniciAdi : ""),
    Promise.resolve(bot ? bot.avatar : "")
  ]);

  return res.status(200).json({
    ok: true,
    profil: {
      kullanici_adi:
        kullaniciAdi ||
        tekSatir((oturum && (oturum.name || oturum.username)) || "", 64),
      rank: bot ? bot.rank : "user",
      avatar: avatar || "",
      /* Kimlik ICERMEZ: yalnizca avatar dosya adi. */
      avatar_hash: avatarHash(avatar),
      premium_bitis: bitis
    }
  });
}
