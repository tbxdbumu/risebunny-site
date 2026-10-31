import {
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
} from "../lib/_launcher.js";

import { readJson, originalPath } from "../lib/_helpers.js";

import { zorunluHttps } from "../lib/_https.js";

/* ═══ PANEL UÇLARI ═════════════════════════════════════════════════════════
   `risebunny-panel.html` hesap sekmesi. Panel hem tarayıcıda (siteyle aynı
   kökende) hem de modun WebView'inde çalışır; iki durumda da konuştuğu tek
   sunucu burasıdır.

     Get  /api/panel/link?code=ABC   → bağlanma durumu (pending|done|expired|rejected)
     POST /api/panel/link            → aynısı, gövdeden; finish:true belgeyi siler
     GET  /api/panel/session         → hesap kartı (id, ad, avatar, premium)
     GET  /api/panel/avatar?id=...   → resim baytları (proxy, kimlik sızdırmaz)
     POST /api/panel/disconnect      → bot tarafındaki "bağlı" kaydını siler
     POST /api/panel/logout          → site oturum çerezini siler
     GET  /api/panel/config          → panelin açılış ayarları (kod alfabesi, site)

   Kimlik kaynakları, sırayla:
     1) Authorization: Bearer <launcher bileti>   (panel localStorage'ı)
     2) rb_session çerezi                          (site girişi)
   Bilet yoksa ve çerez varsa `/api/panel/session` cevabında TAZE bir bilet
   döner (`token`); panel onu saklar ve bundan sonra onu kullanır. */

function cors(req, res) {
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

function grid(res) {
  const abc = DEVICE_ALPHABET;
  let s = "";
  for (let i = 0; i < 10; i++) s += abc[(Math.random() * abc.length) | 0];
  return s;
}

export default async function handler(req, res) {
  if (zorunluHttps(req, res)) return;
  cors(req, res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const url = new URL(req.url, `https://${req.headers.host || "localhost"}`);
  const op = originalPath(req, url);

  /* ── /api/panel/config ──────────────────────────────────────────────── */
  if (op.endsWith("/config")) {
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

  /* ── /api/panel/link ──────────────────────────────────────────────────
     Panel "Siteye giriş yap"a bastığında cihaz kodu ÜRETİR (POST /device ile
     aynı belge), kullanıcıyı siteye yollar; bu uç kodu yoklar. Kanıt
     doğrulanmadan kimlik dönmez — bkz. lib/_launcher.js readDeviceCredential.
     Tarayıcıda çalışan panel (`?code=`) kodu sunucudan alır:
       POST /api/panel/link {create:true} → { status:"pending", code } */
  if (op.endsWith("/link")) {
    let body = {};
    if (req.method === "POST") body = await readJson(req);

    if (req.method === "POST" && body.create === true) {
      const code = grid(res);
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

  /* ── /api/panel/avatar ────────────────────────────────────────────────
     İki biçim:
       ?h=<hash>   hash Discord kimliği içermez → sahip sunucuda çözülür
       ?id=<id>    kimlik panelin bildiği bir alan; sayfa CSS'ine <img> ile
                   basılır, çerezle BİRLİKTE gelir veya hash tekrar çözülür
     Yanıt her iki durumda da yalnızca resim baytlarıdır. */
  if (op.endsWith("/avatar")) {
    const hash = String(url.searchParams.get("h") || "");
    const idParam = String(url.searchParams.get("id") || "");
    let owner = "";
    if (/^[a-z0-9_]{1,64}$/i.test(hash)) {
      owner = await avatarOwnerOfHash(hash);
    }
    if (!owner && /^\d{15,20}$/.test(idParam)) {
      const tok = verifyCaller(req);
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

  /* ── /api/panel/session ───────────────────────────────────────────────── */
  if (op.endsWith("/session")) {
    let id = verifyCaller(req);
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

  /* ── /api/panel/disconnect ────────────────────────────────────────────── */
  if (op.endsWith("/disconnect")) {
    const id = verifyCaller(req) || sessionIdOf(req);
    if (!id) return res.status(401).json({ ok: false, error: "oturum gerekli" });
    const r = await botDisconnect(id);
    return res.json({ ok: true, delivered: r.status === 200, detail: r });
  }

  /* ── /api/panel/logout ────────────────────────────────────────────────── */
  if (op.endsWith("/logout")) {
    /* Çerez silme `_session.js` ile yapılır; bilet durumsuz olduğu için
       panel tarafı localStorage'ı da temizler. */
    try {
      const { clearSession } = await import("../lib/_session.js");
      clearSession(res, req);
    } catch { /* modül yüklenemedi: panel yine de localStorage'ı siler */ }
    return res.json({ ok: true });
  }

  return res.status(404).json({ ok: false, error: "bilinmeyen panel ucu" });
}

function verifyCaller(req) {
  return identityFrom(req);
}
