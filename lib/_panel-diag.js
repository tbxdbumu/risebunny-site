/* Panel — bot zinciri icin BOGRU (teshis) ucu.

   Sorun: panel tarafi bot'a ulasabiliyor mu, ulasamiyorsa hangi adimda
   duruyor? Bunu tahmin etmek yerine tek cagrida cevaplansin.

   GET /api/panel/diag   (Authorization: Bearer <panel bileti>)
   -> {
        ok, env: { botApi: bool, botSecret: bool, ticketSecret: bool, site },
        steps: [ { step, ok, status, detail } ],
        verdict: "..."   // tek satirlik teshis
      }

   GUVENLIK: sir degerleri ASLA donmez; yalnizca "tanimli mi" bilgisi.
   Bot'un dondurdugu govde de ham donmez; yalnizca alan adlari ve durum
   kodu. Uc, gecerli bir panel bileti olmadan calismaz. */

import { botBase, botHeaders } from "../lib/_session.js";
import {
  botPanelCard,
  panelSession,
  identityFrom,
  sessionIdOf,
} from "../lib/_launcher.js";

export async function panelDiag(req, res, deps) {
  /* Kimlik: yalnizca gercek bir panel oturumu. Anonim teshis yok —
     aksi hâlde bot adresini/sir varligini disariya sizdirirdi. */
  const id = (deps && deps.identityFrom ? deps.identityFrom(req) : identityFrom(req))
    || (deps && deps.sessionIdOf ? deps.sessionIdOf(req) : sessionIdOf(req));
  if (!id) {
    return res.status(401).json({ ok: false, error: "oturum gerekli" });
  }

  const bBase = botBase();
  const steps = [];
  const push = (step, ok, status, detail) => steps.push({ step, ok, status, detail: String(detail || "").slice(0, 200) });

  push("env.bot_api_url", !!bBase, null, bBase ? bBase.replace(/\/\/[^@/]+@/, "//***@") : "BOT_API_URL tanimli degil");
  const hasSecret = !!process.env.BOT_API_SECRET;
  push("env.bot_api_secret", hasSecret, null, hasSecret ? "tanimli" : "BOT_API_SECRET tanimli degil");
  const hasTicket = !!process.env.TICKET_SECRET;
  push("env.ticket_secret", hasTicket, null, hasTicket ? "tanimli" : "TICKET_SECRET tanimli degil");

  if (bBase) {
    /* 1) bot ayakta mi — kimlik dogrulamasi gereken hafif bir uc */
    try {
      const r = await fetch(`${bBase}/api/panel/session/${encodeURIComponent(id)}`, {
        headers: botHeaders(),
        signal: AbortSignal.timeout ? AbortSignal.timeout(8000) : undefined,
      });
      let names = "";
      let body = null;
      try { body = await r.json(); } catch { body = null; }
      if (body && typeof body === "object") names = Object.keys(body).slice(0, 12).join(",");
      push(
        "bot.GET /api/panel/session/:id",
        r.ok,
        r.status,
        r.ok
          ? "alanlar: " + names
          : r.status === 401
            ? "401 — bot icine giden sir UYUSMUYOR (BOT_API_SECRET != PANEL_BOT_SECRET)"
            : r.status === 404
              ? "404 — bot eski surumde; panel-kopru.js rotalari yok"
              : "govde: " + (body ? JSON.stringify(body).slice(0, 120) : "(bos)")
      );
    } catch (e) {
      push("bot.GET /api/panel/session/:id", false, 0, "ag hatasi: " + (e && e.message ? e.message : e));
    }

    /* 2) avatar indeksi (site bu ucu sirayla deniyor) */
    try {
      let r = await fetch(`${bBase}/api/panel/avatars?limit=1`, { headers: botHeaders() });
      let via = "/api/panel/avatars";
      if (!r.ok) {
        r = await fetch(`${bBase}/api/public/avatars?limit=1`, { headers: botHeaders() });
        via = "/api/public/avatars";
      }
      push("bot.GET " + via, r.ok, r.status, r.ok ? "indeks alinabildi" : "avatar indeksi alinamadi");
    } catch (e) {
      push("bot.GET avatars", false, 0, "ag hatasi: " + e.message);
    }
  }

  /* 3) kartin kendisi (hangi kaynaktan doldu) */
  try {
    const card = await panelSession(id);
    push("site.panelSession", card.source !== "offline", null, "source=" + card.source + " partial=" + card.partial);
  } catch (e) {
    push("site.panelSession", false, 0, e.message);
  }

  const hard = steps.find((s) => !s.ok);
  const verdict = !hard
    ? "zincir saglam: panel -> bot -> kart"
    : !hasSecret
      ? "BOT_API_SECRET yok: panel bota hic gidemez (Vercel ortam degiskenlerini ekle)"
      : !bBase
        ? "BOT_API_URL yok: bot adresi tanimli degil"
        : hard.status === 401
          ? "sir uyusmuyor: Vercel BOT_API_SECRET != bot PANEL_BOT_SECRET"
          : hard.status === 404
            ? "bot eski surumde: panel-kopru.js rotalari yok, botu yeniden deploy et"
            : hard.status === 0
              ? "bota ulasilamiyor: bot kapali ya da BOT_API_URL yanlis"
              : "beklenmeyen durum: " + hard.detail;

  return res.status(200).json({
    ok: !hard,
    verdict,
    env: {
      botApiUrl: bBase ? "tanimli" : "yok",
      botApiSecret: hasSecret,
      ticketSecret: hasTicket,
      site: (process.env.SITE_URL || "").replace(/\/+$/, "") || "yok",
    },
    steps,
  });
}

/* Canlida hangi surum kosuyor? Bilet gerektirmez; tek bilgisi build damgasi.
   Diag ucunun varligini da bildirir: `diag:false` ise eski build canlida. */
export function panelVersion(res) {
  return res.json({
    ok: true,
    diag: true,
    build: (process.env.VERCEL_GIT_COMMIT_SHA || "").slice(0, 7) || "unknown",
    ref: process.env.VERCEL_GIT_COMMIT_REF || "unknown",
  });
}
