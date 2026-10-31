import { botBase, botHeaders } from "../lib/_session.js";
import { originalPath } from "../lib/_helpers.js";

import { zorunluHttps } from "../lib/_https.js";

/* ═══ PANEL UÇLARI (api/public.js içine monte) ═════════════════════════════
 *
 *   NEDEN BURADA: Vercel Hobby planı bir deployment'a en fazla 12 Serverless
 *   Function kabul ediyor ve site o sınırı ZATEN doldurmuştu (12 dosya).
 *   `api/panel.js` eklenince build "No more than 12 Serverless Functions" ile
 *   düştü. Çözüm, yeni fonksiyon açmak yerine mevcut bir fonksiyona rota
 *   eklemek: `/api/panel/*` → `/api/public` (bkz. vercel.json rewrites).
 *
 *   KİMLİK: launcher bileti (Authorization: Bearer) veya `rb_session` çerezi.
 *   Geri kalan mantık eskiden api/panel.js'te duran kodun birebir aynısı.
 *
 *   UÇLAR (hepsi `/api/panel/` ile başlar):
 *     GET  /config        → panel açılış ayarları (kod uzunluğu, site, TTL)
 *     POST /link          → {create:true} kod üretir, {code} kod yoklar
 *     GET  /link?code=    → aynı yoklama
 *     GET  /avatar        → ?h=<hash> veya ?id=<id>, yalnızca resim baytları
 *     GET  /session       → hesap kartı (id, ad, avatar, premium)
 *     POST /disconnect    → bot tarafındaki "bağlı" kaydını siler
 *     POST /logout        → site oturum çerezini siler
 */

/* Panel rotasının tam eşleşen listesi. `endswith` tek başına yetmez:
   `/api/panel/link` ile `/api/panel/xlink` aynı sonuca gider, bu yüzden
   segment sınırı da kontrol edilir. */
const PANEL_ROUTES = ["config", "link", "avatar", "session", "disconnect", "logout"];

/** Yol panel ucuna aitse uç adını döner, değilse null. */
export function panelRouteOf(op) {
  const s = String(op || "");
  const i = s.indexOf("/api/panel/");
  if (i < 0) return null;
  const rest = s.slice(i + "/api/panel/".length).replace(/\/+$/, "");
  return PANEL_ROUTES.includes(rest) ? rest : null;
}

function panelCors(req, res) {
  const site = (process.env.SITE_URL || "").replace(/\/+$/, "");
  const origin = String(req.headers.origin || "");
  if (site && origin === site) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Cache-Control", "no-store");
}

async function panelReadJson(req) {
  if (req.body && typeof req.body === "object") return req.body;
  const chunks = [];
  for await (const c of req) chunks.push(c);
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return {};
  }
}

/**
 * Panel isteği. `deps` içinde `lib/_launcher.js`'ten gelen yardımcılar
 * geçirilir; böylece bu modül tek başına import edilebilir kalır ve
 * döngüsel bağımlılık oluşmaz.
 */
export async function handlePanel(req, res, route, url, op, deps) {
  const {
    readJson,
    DEVICE_ALPHABET,
    mintAccessToken,
    launcherDocUrl,
    readDeviceCredential,
    avatarOwnerOfHash,
    fetchAvatarBytes,
    identityFrom,
    sessionIdOf,
    botDisconnect,
    panelSession,
  } = deps;

  if (zorunluHttps(req, res)) return;
  panelCors(req, res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const bodyFn = async () => {
    if (typeof readJson === "function") {
      try { return await readJson(req); } catch { return await panelReadJson(req); }
    }
    return panelReadJson(req);
  };

  /* ── /config ─────────────────────────────────────────────────────────── */
  if (route === "config") {
    return res.json({
      ok: true,
      site: (process.env.SITE_URL || "").replace(/\/+$/, ""),
      codeLength: 10,
      alphabet: DEVICE_ALPHABET,
      /* Panelin "Cihaz kodu" ekranında kullanacağı biçim: ABC-DEF-GHIJ */
      codeFormat: "XXXX-XXX-XXX",
      pollMs: 2500,
      sessionTtlDays: 30,
    });
  }

  /* ── /link ─────────────────────────────────────────────────────────────
     Panel "Siteye giriş yap"a bastığında cihaz kodu ÜRETİR (launcher ile aynı
     belge), kullanıcıyı siteye yollar; bu uç kodu yoklar. Kanıt doğrulanmadan
     kimlik dönmez — bkz. lib/_launcher.js readDeviceCredential. */
  if (route === "link") {
    let body = {};
    if (req.method === "POST") body = await bodyFn();

    if (req.method === "POST" && body.create === true) {
      const abc = DEVICE_ALPHABET;
      let code = "";
      for (let i = 0; i < 10; i++) code += abc[(Math.random() * abc.length) | 0];
      const r = await fetch(launcherDocUrl(code), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fields: {
            status: { stringValue: "pending" },
            createdAt: { timestampValue: new Date().toISOString() },
            source: { stringValue: "panel" },
          },
        }),
      }).catch(() => null);
      if (!r || !r.ok) {
        return res.status(503).json({
          ok: false,
          status: "error",
          error: "device-store-unavailable",
        });
      }
      return res.json({ ok: true, status: "pending", code });
    }

    if (req.method === "POST" && body.finish === true) {
      const code = String(body.code || "").replace(/[^A-Za-z0-9]/g, "").slice(0, 12);
      if (code) await fetch(launcherDocUrl(code), { method: "DELETE" }).catch(() => {});
      return res.json({ ok: true });
    }

    const code = String(body.code || url.searchParams.get("code") || "")
      .replace(/[^A-Za-z0-9]/g, "")
      .slice(0, 12);
    if (!code) return res.status(400).json({ ok: false, status: "invalid", error: "kod yok" });

    const cred = await readDeviceCredential(code, { consume: true });
    if (cred.status !== "done") {
      return res.json({ ok: cred.status !== "rejected", status: cred.status });
    }
    return res.json({
      ok: true,
      status: "done",
      id: cred.id,
      username: cred.username,
      avatarUrl: cred.avatarHash
        ? `/api/panel/avatar?h=${encodeURIComponent(cred.avatarHash)}`
        : `/api/panel/avatar?id=${encodeURIComponent(cred.id)}`,
      token: cred.accessToken,
    });
  }

  /* ── /avatar ────────────────────────────────────────────────────────────
     İki biçim:
       ?h=<hash>   hash Discord kimliği içermez → sahip sunucuda çözülür
       ?id=<id>    kimlik panelin bildiği bir alan; yalnızca çağıran o kimliğe
                   sahipse resim döner (yan başkasının avatarını çekemez)
     Yanıt her iki durumda da yalnızca resim baytlarıdır. */
  if (route === "avatar") {
    const hash = String(url.searchParams.get("h") || "");
    const idParam = String(url.searchParams.get("id") || "");
    let owner = "";
    if (/^[a-z0-9_]{1,64}$/i.test(hash)) {
      owner = await avatarOwnerOfHash(hash);
    }
    if (!owner && /^\d{15,20}$/.test(idParam)) {
      const tok = identityFrom(req);
      if (tok || sessionIdOf(req) === idParam) owner = idParam;
    }
    if (!owner) {
      res.setHeader("Cache-Control", "no-store");
      return res.status(404).json({ ok: false, error: "avatar yok" });
    }
    try {
      const { bytes, type } = await fetchAvatarBytes(owner, hash);
      res.setHeader("Content-Type", type);
      res.setHeader("Cache-Control", "private, max-age=300");
      res.setHeader("Vary", "Authorization, Cookie");
      res.setHeader("X-Content-Type-Options", "nosniff");
      return res.status(200).end(bytes);
    } catch {
      return res.status(502).json({ ok: false, error: "avatar hatası" });
    }
  }

  /* ── /session ─────────────────────────────────────────────────────────── */
  if (route === "session") {
    let id = identityFrom(req);
    let fresh = "";
    if (!id) {
      id = sessionIdOf(req);
      if (id) fresh = mintAccessToken(id);
    }
    if (!id) return res.status(401).json({ ok: false, error: "oturum gerekli" });
    const data = await panelSession(id);
    if (fresh) data.token = fresh;
    return res.json(data);
  }

  /* ── /disconnect ──────────────────────────────────────────────────────── */
  if (route === "disconnect") {
    const id = identityFrom(req) || sessionIdOf(req);
    if (!id) return res.status(401).json({ ok: false, error: "oturum gerekli" });
    const r = await botDisconnect(id);
    return res.json({ ok: true, delivered: r.status === 200, detail: r });
  }

  /* ── /logout ──────────────────────────────────────────────────────────── */
  if (route === "logout") {
    /* Çerez silme `_session.js` ile yapılır; bilet durumsuz olduğu için panel
       tarafı localStorage'ı da temizler. */
    try {
      const { clearSession } = await import("../lib/_session.js");
      clearSession(res, req);
    } catch { /* modül yüklenemedi: panel yine de localStorage'ı siler */ }
    return res.json({ ok: true });
  }

  void op;
  return res.status(404).json({ ok: false, error: "bilinmeyen panel ucu" });
}
