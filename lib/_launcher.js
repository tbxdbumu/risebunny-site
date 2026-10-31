import crypto from "node:crypto";

import { botBase, botHeaders, getSession } from "./_session.js";

import { PROJECT, FB_KEY, avatarUrl } from "./_helpers.js";

/* ═══ LAUNCHER ÇEKİRDEĞİ ═══════════════════════════════════════════════════
   Bu dosya `api/launcher.js`in iş mantığını taşır. `api/launcher.js` yalnızca
   kendi HTTP yüzeyini (Vercel'in istediği yollar) bağlar.

   Neden ayrı dosya: panele giden uçlar (panel-link / panel-session /
   panel-disconnect) ve avatar proxy'si aynı imzalama, aynı hız sınırı ve aynı
   Firestore doküman yardımcılarını kullanıyor. Çekirdeği tek yerde tutmak,
   imza üreten ve doğrulayan tarafın ayrışmasını (GUNLUK 38 hatası) imkânsız
   hale getiriyor.

   DEĞİŞMEZLER:
     • Bilet imzası: `${id}.${expires}.${hmac}` — TICKET_SECRET yoksa
       SESSION_SECRET. Üreten ve doğrulayan AYNI fonksiyon.
     • Cihaz kodu uzayı 31^10; Firestore `launcher_logins/<kod>`.
     • Devreye alma kanıtı (proof): HMAC(TICKET_SECRET, `device:<kod>:<id>`).
     • Discord kimliği: YALNIZCA sunucuda çözülür, istemciye yalnızca
       doğrulanmış oturumda döner. */

export const DEVICE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function secret() {
  const s = process.env.TICKET_SECRET || "";
  if (s.length >= 16) return s;
  const f = process.env.SESSION_SECRET || "";
  return f.length >= 16 ? f : "";
}

export function randCode(len = 10) {
  let out = "";
  for (let i = 0; i < len; i++) out += DEVICE_ALPHABET[crypto.randomInt(0, DEVICE_ALPHABET.length)];
  return out;
}

export function launcherDocUrl(code) {
  return `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents/launcher_logins/${code}?key=${FB_KEY}`;
}

/* ── bilet ────────────────────────────────────────────────────────────────
   Payload: `<discordId>.<expEpochMs>`. İmza hex HMAC-SHA256.
   Dönen değer YALNIZCA Discord kimliğidir; yetki (premium/ban) biletten
   okunmaz, her istekte bottan yeniden sorulur. */
export function mintAccessToken(id, ttlMs = 30 * 24 * 60 * 60 * 1000) {
  const s = secret();
  if (!s) return "";
  const expires = Date.now() + ttlMs;
  const payload = `${id}.${expires}`;
  const sig = crypto.createHmac("sha256", s).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifyLauncherToken(raw) {
  const s = secret();
  if (!s) return "";
  const t = String(raw || "").trim();
  const parts = t.split(".");
  if (parts.length !== 3) return "";
  const [id, expStr, sig] = parts;
  if (!/^\d{15,20}$/.test(id)) return "";
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Date.now()) return "";
  const expected = crypto.createHmac("sha256", s).update(`${id}.${expStr}`).digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(String(sig).toLowerCase(), "utf8");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return "";
  return id;
}

export function deviceProof(code, discordId) {
  const s = secret();
  if (!s) return "";
  return crypto.createHmac("sha256", s).update(`device:${code}:${discordId}`).digest("hex");
}

export function proofValid(proof, code, discordId) {
  const expected = deviceProof(code, discordId);
  if (!expected) return false;
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(String(proof || "").toLowerCase(), "utf8");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/* ── cihaz kodu → panel oturumu ───────────────────────────────────────────
   Panel "Siteye giriş yap"a bastığında:
     1) POST /api/launcher/device         → kod
     2) kullanıcı sitede Discord'a girer  → callback belgeye proof yazar
     3) POST /api/launcher/panel/link     → bu fonksiyon
   Kanıt doğrulanmadan kimlik DÖNMEZ. Belge bir kez okunur; `consume` ile
   başarılı okumadan sonra silinir (tek kullanımlık kod). */
export async function readDeviceCredential(code, { consume = true } = {}) {
  const k = String(code || "").replace(/[^A-Za-z0-9]/g, "").slice(0, 12);
  if (!k) return { status: "invalid" };
  let r;
  try {
    r = await fetch(launcherDocUrl(k));
  } catch {
    return { status: "pending" };
  }
  if (!r.ok) return { status: "pending" };
  const d = await r.json().catch(() => null);
  if (!d || !d.fields) return { status: "pending" };
  const f = d.fields;
  const created = f.createdAt?.timestampValue ? new Date(f.createdAt.timestampValue).getTime() : 0;
  if (created && Date.now() - created > 10 * 60 * 1000) {
    if (consume) await fetch(launcherDocUrl(k), { method: "DELETE" }).catch(() => {});
    return { status: "expired" };
  }
  if (f.status?.stringValue !== "done") return { status: "pending" };
  const id = String(f.id?.stringValue || "");
  const proof = String(f.proof?.stringValue || "");
  if (!/^\d{15,20}$/.test(id) || !proofValid(proof, k, id)) {
    if (consume) await fetch(launcherDocUrl(k), { method: "DELETE" }).catch(() => {});
    return { status: "rejected" };
  }
  if (consume) await fetch(launcherDocUrl(k), { method: "DELETE" }).catch(() => {});
  const rawHash = String(f.avatarHash?.stringValue || "");
  let hash = /^[a-z0-9_]{1,64}$/i.test(rawHash) ? rawHash : "";
  if (!hash) {
    const m = /\/avatars\/\d+\/([a-z0-9_]+)\.(?:png|webp|gif|jpe?g)/i.exec(String(f.avatar?.stringValue || ""));
    if (m) hash = m[1];
  }
  return {
    status: "done",
    id,
    username: String(f.username?.stringValue || ""),
    avatarHash: hash,
    accessToken: mintAccessToken(id),
  };
}

/* ── avatar proxy'si ──────────────────────────────────────────────────────
   Panel `?h=<hash>` gönderir: hash Discord kimliğini İÇERMEZ. Sunucu hash'in
   sahibini botun `/api/public/avatar-owner/<hash>` ucundan çözer; bot
   kapalıysa kısa ömürlü bellek indeksi kullanılır. Kimlik hiçbir zaman
   istemciye dönmez — yalnızca resim baytları akar. */
const AVATAR_INDEX_MS = 5 * 60 * 1000;
let avatarIndex = null;
let avatarIndexAt = 0;

async function avatarIndexGet() {
  if (avatarIndex && Date.now() - avatarIndexAt < AVATAR_INDEX_MS) return avatarIndex;
  const map = new Map();
  if (PROJECT && FB_KEY) {
    try {
      const r = await fetch(
        `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents/launcher_logins?key=${FB_KEY}&pageSize=300`
      );
      if (r.ok) {
        const j = await r.json().catch(() => ({}));
        for (const doc of j.documents || []) {
          const hash = String(doc.fields?.avatarHash?.stringValue || "");
          const id = String(doc.fields?.id?.stringValue || "");
          if (/^[a-z0-9_]{1,64}$/i.test(hash) && /^\d{15,20}$/.test(id)) map.set(hash, id);
        }
      }
    } catch (e) {
      console.error("[launcher] avatar indeksi okunamadı:", e.message);
    }
  }
  // Bot yolu her zaman birincil; indeks yalnızca hız/çevrimdışı yedeği.
  const bBase = botBase();
  if (bBase && process.env.BOT_API_SECRET) {
    try {
      const r = await fetch(`${bBase}/api/public/avatars?limit=500`, { headers: botHeaders() });
      if (r.ok) {
        const j = await r.json().catch(() => ({}));
        for (const it of j.items || []) {
          const hash = String(it.avatarHash || "");
          const id = String(it.discordId || "");
          if (/^[a-z0-9_]{1,64}$/i.test(hash) && /^\d{15,20}$/.test(id)) map.set(hash, id);
        }
      }
    } catch { /* bot kapalı: indeks yine kullanılabilir */ }
  }
  avatarIndex = map;
  avatarIndexAt = Date.now();
  return map;
}

export async function avatarOwnerOfHash(hash) {
  const h = String(hash || "");
  if (!/^[a-z0-9_]{1,64}$/i.test(h)) return "";
  const index = await avatarIndexGet();
  return index.get(h) || "";
}

export async function fetchAvatarBytes(discordId, hash) {
  const id = String(discordId || "");
  const h = String(hash || "");
  const url = /^[a-z0-9_]{1,64}$/i.test(h)
    ? `https://cdn.discordapp.com/avatars/${id}/${h}.png?size=128`
    : avatarUrl(id, "");
  let host = "";
  try { host = new URL(url).hostname.toLowerCase(); } catch { host = ""; }
  if (host !== "cdn.discordapp.com") throw new Error("geçersiz avatar adresi");
  /* Discord CDN, User-Agent'sız isteklere 403 döner — ölçüldü (2026-10-25). */
  const img = await fetch(url, {
    headers: {
      "User-Agent": "RiseBunny-Launcher/2.0 (+https://risebunny.vercel.app)",
      Accept: "image/*",
    },
  });
  if (!img.ok) throw new Error("avatar indirilemedi: " + img.status);
  return {
    bytes: Buffer.from(await img.arrayBuffer()),
    type: img.headers.get("content-type") || "image/png",
  };
}

/* ── oturum ───────────────────────────────────────────────────────────────
   Panel bileti (Bearer) veya site oturum çerezinden Discord kimliği.
   Site oturum varken bileti de tazeler: panel WebView'i çerez paylaşmaz, o
   yüzden ilk yüklemede bilet kendiliğinden oluşur. */
export function identityFrom(req) {
  return verifyLauncherToken(
    String(req.headers.authorization || "").replace(/^Bearer\s+/i, "") || req.headers["x-launcher-token"]
  );
}

/* ── bot köprüsü ─────────────────────────────────────────────────────────
   Bot uçları (rb2-main/bot.js):
     GET  /api/user/:id            → id, username, globalName, wallet, bank,
                                     xp, level, premium, daysLeft, avatar, ...
     GET  /api/launcher/premium/:id → { ok, bitis, aktif, kalan }
     POST /api/panel/disconnect     → günlük seri / "bağlı" kaydını siler
   Bot çevrimdışıysa `null` döner; çağıran `partial: true` ile yanıt üretir. */
export async function botUser(id) {
  const bBase = botBase();
  if (!bBase || !process.env.BOT_API_SECRET) return null;
  try {
    const r = await fetch(`${bBase}/api/user/${encodeURIComponent(id)}`, { headers: botHeaders() });
    if (!r.ok) return null;
    return await r.json().catch(() => null);
  } catch {
    return null;
  }
}

export async function botPremium(id) {
  const bBase = botBase();
  if (!bBase || !process.env.BOT_API_SECRET) return null;
  try {
    const r = await fetch(`${bBase}/api/launcher/premium/${encodeURIComponent(id)}`, { headers: botHeaders() });
    if (!r.ok) return null;
    return await r.json().catch(() => null);
  } catch {
    return null;
  }
}

export async function botDisconnect(id) {
  const bBase = botBase();
  if (!bBase || !process.env.BOT_API_SECRET) return { status: 0, ok: false, error: "Bot API bağlı değil." };
  try {
    const r = await fetch(`${bBase}/api/panel/disconnect`, {
      method: "POST",
      headers: { ...botHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ userId: id }),
    });
    const j = await r.json().catch(() => ({}));
    return { status: r.status, ...j };
  } catch (e) {
    console.error("[launcher] panel/disconnect hatası:", e.message);
    return { status: 0, ok: false, error: "Bot çevrimdışı." };
  }
}

export function isStaff(id, role) {
  const ids = String(process.env.ADMIN_DISCORD_IDS || "").split(",").map(s => s.trim()).filter(Boolean);
  const roles = String(process.env.STAFF_ROLES || "owner,admin,staff,mod").split(",").map(s => s.trim().toLowerCase());
  return ids.includes(String(id)) || roles.includes(String(role || "").toLowerCase());
}

/* Panel hesap kartının TEK kaynağı. Alanlar panelde doğrudan basılır:
   kullanıcı adı, Discord ID, avatar, premium durumu + kalan gün. */
export async function panelSession(id) {
  const [u, p] = await Promise.all([botUser(id), botPremium(id)]);
  const role = String(u?.role || "member");
  const staff = isStaff(id, role);
  const daysLeft = Number.isFinite(Number(p?.kalan))
    ? Number(p.kalan)
    : Number.isFinite(Number(u?.daysLeft)) ? Number(u.daysLeft) : 0;
  const active = staff || !!p?.aktif || !!u?.premium || daysLeft > 0 || daysLeft === -1;
  const hash = String(u?.avatar || "").match(/\/avatars\/\d+\/([a-z0-9_]+)\./i)?.[1] || "";
  return {
    ok: true,
    partial: !u && !p,
    account: {
      id,
      username: u?.username || u?.globalName || "",
      globalName: u?.globalName || "",
      /* Panel bu adresi <img src> olarak basar. Kimlik URL'de YOK; sunucu
         önce bilete bakar, yoksa hash'in sahibini bot'tan çözer. */
      avatarUrl: `/api/launcher/avatar?id=${encodeURIComponent(id)}`,
      avatarHash: hash,
    },
    premium: {
      active,
      daysLeft: staff ? -1 : daysLeft,
      paidUntil: p?.bitis ? new Date(Number(p.bitis)).toISOString() : u?.premium_until || null,
      role,
      staff,
    },
    game: u ? {
      wallet: Number(u.wallet || 0),
      bank: Number(u.bank || 0),
      total: Number(u.total || 0),
      level: Number(u.level || 0),
      xp: Number(u.xp || 0),
      tag: u.tag || null,
      pets: Array.isArray(u.pets) ? u.pets.length : 0,
      capes: Array.isArray(u.capes) ? u.capes.length : 0,
    } : null,
    source: u || p ? "bot" : "offline",
    at: Date.now(),
  };
}

/* Panel bağımsız (rb-fixed + panel) çalışsın diye oturum çerezinden bilet
   üretir. Site `/risebunny` sayfası yüklendiğinde `window.RB_PANEL_TOKEN`
   olarak enjekte edilir; WebView ise köprüden `session:token` ister. */
export function panelTokenFor(req) {
  const sess = getSession(req);
  if (!sess || !/^\d{15,20}$/.test(String(sess.id || ""))) return "";
  return mintAccessToken(String(sess.id));
}

export function sessionIdOf(req) {
  const sess = getSession(req);
  return sess && /^\d{15,20}$/.test(String(sess.id || "")) ? String(sess.id) : "";
}

export function siteBaseOf(req) {
  const env = (process.env.SITE_URL || "").replace(/\/+$/, "");
  if (env) return env;
  const proto = String(req?.headers?.["x-forwarded-proto"] || "https").split(",")[0];
  const host = req?.headers?.["x-forwarded-host"] || req?.headers?.host || "localhost";
  return `${proto}://${host}`;
}
