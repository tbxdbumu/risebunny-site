import { botBase } from "../lib/_session.js";

import { FB_KEY, PROJECT, BOT_ID, originalPath } from "../lib/_helpers.js";

import { zorunluHttps } from "../lib/_https.js";

import { panelRouteOf, handlePanel } from "../lib/_panel.js";
import * as launcher from "../lib/_launcher.js";
import { readJson } from "../lib/_helpers.js";

export default async function handler(req, res) {
  if (zorunluHttps(req, res)) return;
  const url = new URL(req.url, `https://${req.headers.host}`);
  const op = originalPath(req, url);
  console.log("[public] path:", op);

  /* ── PANEL ─────────────────────────────────────────────────────────────
     `/api/panel/*` buraya rewrite edilir (vercel.json). Ayrı bir serverless
     fonksiyon AÇILAMAZ: Hobby planı deployment başına 12 fonksiyonla sınırlı
     ve site o sınırı doldurmuş durumda. Mantık lib/_panel.js'te. */
  const panel = panelRouteOf(op);
  if (panel) {
    return handlePanel(req, res, panel, url, op, {
      readJson,
      /* `lib/_launcher.js` bir bütün olarak geçirilir: her fonksiyonu tek tek
         kopyalamak yeni bir yardımcı eklendiğinde kolayca eksik kalır. */
      ...launcher,
    });
  }

  const bBase = botBase();
  if (op.endsWith("/firebase-config")) {
    const origin = (process.env.SITE_URL || "").replace(/\/+$/, "");
    res.setHeader("Access-Control-Allow-Origin", origin || "");
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "GET") return res.status(405).json({
      error: "Method not allowed"
    });
    /* Varsayılanlar `lib/_helpers.js` ile AYNI kaynaktan geliyor. Önceden
       burada yalnızca `process.env` okunuyordu; Preview deployment'ında
       FIREBASE_* değişkenleri tanımlı olmadığı için uç 500 dönüyor, ana
       sayfa da (o zaman) kendini 404 ile eziyordu. Üretimde env zaten
       tanımlı olduğu için değerler env'den gelmeye devam eder. */
    const config = {
      apiKey: process.env.FIREBASE_API_KEY || "AIzaSyAq5Nafl9aI2TabzGsj5J9ij6lNwyfTguM",
      authDomain: process.env.FIREBASE_AUTH_DOMAIN || "gen-lang-client-0590499912.firebaseapp.com",
      projectId: process.env.FIREBASE_PROJECT_ID || "gen-lang-client-0590499912",
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "gen-lang-client-0590499912.firebasestorage.app",
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "203829901581",
      appId: process.env.FIREBASE_APP_ID || "1:203829901581:web:66d532c52155db4aea9844"
    };
    if (!config.apiKey || !config.projectId) {
      return res.status(500).json({
        error: "Firebase config not configured"
      });
    }
    res.setHeader("Cache-Control", "public, max-age=3600");
    return res.status(200).json(config);
  }
  if (op.endsWith("/stats")) {
    res.setHeader("Cache-Control", "public, s-maxage=120, stale-while-revalidate=60");
    const out = {
      servers: null,
      users: null,
      votes: null,
      commands: null,
      categories: null,
      live: false
    };
    const tok = process.env.TOPGG_TOKEN || "";
    if (tok && BOT_ID) {
      try {
        const [st, bot] = await Promise.all([ fetch(`https://top.gg/api/bots/${BOT_ID}/stats`, {
          headers: {
            Authorization: tok
          }
        }), fetch(`https://top.gg/api/bots/${BOT_ID}`, {
          headers: {
            Authorization: tok
          }
        }) ]);
        if (st.ok) {
          const sj = await st.json().catch(() => ({}));
          if (sj.server_count != null) {
            out.servers = sj.server_count;
            out.live = true;
          }
        }
        if (bot.ok) {
          const bj = await bot.json().catch(() => ({}));
          if (bj.monthlyPoints != null) {
            out.votes = bj.monthlyPoints;
            out.live = true;
          }
        }
      } catch {}
    }
    if (bBase) {
      try {
        const r = await fetch(`${bBase}/api/stats`);
        if (r.ok) {
          const j = await r.json();
          if (j.servers != null && out.servers == null) out.servers = j.servers;
          if (j.users != null) { out.users = j.users; out.live = true; }
          if (j.commands != null) { out.commands = j.commands; out.live = true; }
          if (j.categories != null) { out.categories = j.categories; out.live = true; }
          if (out.servers != null) out.live = true;
        }
      } catch {}
    }
    return res.json({
      ...out,
      updated: (new Date).toISOString()
    });
  }
  if (op.endsWith("/status")) {
    res.setHeader("Cache-Control", "public, s-maxage=30, stale-while-revalidate=30");
    const out = {
      bakim: false,
      sebep: "",
      kaynak: "yok"
    };
    if (bBase) {
      try {
        const r = await fetch(`${bBase}/api/site-status`);
        if (r.ok) {
          const j = await r.json();
          if (j.bakim) {
            out.bakim = true;
            out.sebep = j.sebep || "";
            out.kaynak = "bot";
            return res.json(out);
          }
        }
      } catch {}
    }
    if (PROJECT && FB_KEY) {
      try {
        const r = await fetch(`https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents/config/maintenance?key=${FB_KEY}`, {
          headers: {
            Referer: (process.env.SITE_URL || "https://risebunny.vercel.app").replace(/\/+$/, "") + "/"
          }
        });
        if (r.ok) {
          const doc = await r.json();
          const f = doc.fields || {};
          const active = f.active && (f.active.booleanValue === true || f.active.booleanValue === "true");
          if (active) {
            const msg = f.message && f.message.mapValue && f.message.mapValue.fields;
            const tr = msg && msg.tr && msg.tr.stringValue;
            const en = msg && msg.en && msg.en.stringValue;
            out.bakim = true;
            out.sebep = tr || en || "";
            out.kaynak = "firestore";
          }
        }
      } catch {}
    }
    return res.json(out);
  }
  return res.status(404).json({
    error: "not found",
    path: op
  });
}
