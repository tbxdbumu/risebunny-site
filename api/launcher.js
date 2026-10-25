import crypto from 'node:crypto';
import { botBase, botHeaders } from '../lib/_session.js';
import { FB_KEY, PROJECT, readJson, originalPath } from '../lib/_helpers.js';

const HARDCODED_PREMIUM_IDS = (process.env.LAUNCHER_PREMIUM_IDS || '')
  .split(',').map(s => s.trim()).filter(Boolean);

/* Launcher bileti: discordId.expEpochMs.HMAC-SHA256-hex. Bot aynı sırla
   (TICKET_SECRET veya SESSION_SECRET) doğrular; istemci Bearer olarak taşır. */
function issueTicket(id) {
  const sec = process.env.TICKET_SECRET || process.env.SESSION_SECRET || '';
  if (!sec) return '';
  const exp = Date.now() + 30 * 24 * 3600 * 1000;
  const data = `${id}.${exp}`;
  const sig = crypto.createHmac('sha256', sec).update(data).digest('hex');
  return `${data}.${sig}`;
}

function randCode() {
  const abc = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 6; i++) s += abc[Math.floor(Math.random() * abc.length)];
  return s;
}

const launcherDocUrl = (code) =>
  `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents/launcher_logins/${code}?key=${FB_KEY}`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const url = new URL(req.url, `https://${req.headers.host}`);
  const op = originalPath(req, url);
  const bBase = botBase();

  console.log('[launcher] path:', op, 'method:', req.method);

  // ═══════════════ VERIFY ═══════════════
  if (op.endsWith('/verify')) {
    let id = url.searchParams.get('id');
    if (!id && req.method === 'POST') {
      const body = await readJson(req);
      id = body.id || body.discordId;
    }
    id = String(id || '').replace(/\D/g, '').slice(0, 20);
    if (!id || id.length < 15) {
      return res.status(400).json({ ok: false, premium: false, error: 'Geçersiz veya eksik Discord ID.' });
    }

    let isPremium = HARDCODED_PREMIUM_IDS.includes(id);
    let username = `Kullanıcı_${id.slice(-4)}`;
    let role = isPremium ? 'vip' : 'member';
    let daysLeft = isPremium ? 365 : 0;

    // 1) Bot API'den kullanıcı bilgisi
    if (bBase && process.env.BOT_API_SECRET) {
      try {
        const r = await fetch(`${bBase}/api/user/${encodeURIComponent(id)}`, {
          headers: botHeaders()
        });
        if (r.ok) {
          const u = await r.json();
          if (u.username) username = u.username;
          if (u.premium && u.premium.active) {
            isPremium = true;
            daysLeft = u.premium.daysLeft || 30;
            role = 'vip';
          }
        }
      } catch (e) { console.error('[launcher] bot user fetch err:', e.message); }
    }

    // 2) Firestore'dan rol/premium kontrolü (site kullanıcıları)
    if (PROJECT && FB_KEY) {
      try {
        const fr = await fetch(
          `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents/users?key=${FB_KEY}`,
          { headers: { Referer: process.env.SITE_URL ? `${process.env.SITE_URL.replace(/\/+$/, '')}/` : 'https://risebunny.vercel.app/' } }
        );
        if (fr.ok) {
          const data = await fr.json();
          const docs = data.documents || [];
          for (const d of docs) {
            const f = d.fields || {};
            if (f.discordId?.stringValue === id) {
              if (f.username?.stringValue) username = f.username.stringValue;
              const roleVal = f.role?.stringValue;
              if (['kurucu', 'moderator', 'developer', 'vip'].includes(roleVal) || f.premium?.booleanValue) {
                isPremium = true;
                role = roleVal || 'vip';
              }
              break;
            }
          }
        }
      } catch (e) { console.error('[launcher] firestore err:', e.message); }
    }

    if (!isPremium) {
      return res.status(403).json({
        ok: false, premium: false, discordId: id,
        error: 'Bu Discord ID için aktif Premium bulunamadı.'
      });
    }

    // Launcher kullanıcı kaydı
    if (PROJECT && FB_KEY) {
      try {
        await fetch(
          `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents/launcher_users/${id}?key=${FB_KEY}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fields: {
              discordId: { stringValue: id },
              username: { stringValue: username },
              role: { stringValue: role },
              premium: { booleanValue: true },
              launcher: { stringValue: 'RiseBunny Client' },
              lastLaunch: { timestampValue: new Date().toISOString() }
            }})
          }
        );
      } catch (e) { console.error('[launcher] firestore write err:', e.message); }
    }

    return res.json({
      ok: true, premium: true, discordId: id,
      username, role, daysLeft,
      accessToken: issueTicket(id),
      verifiedAt: Date.now(),
      server: 'RiseBunny Auth Gateway'
    });
  }

  // ═══════════════ TOKEN EXCHANGE ═══════════════
  if (op.endsWith('/token') && req.method === 'POST') {
    const body = await readJson(req);
    const code = String(body.code || '');
    const redirect = String(body.redirect_uri || 'http://127.0.0.1:8741/callback');
    const verifier = String(body.code_verifier || '');
    const clientSecret = process.env.DISCORD_CLIENT_SECRET || '';
    const clientId = process.env.DISCORD_CLIENT_ID || '';

    if (!clientSecret || !clientId) {
      return res.status(500).json({ ok: false, error: 'sunucu yapılandırma hatası' });
    }
    if (!code) return res.status(400).json({ ok: false, error: 'no-code' });

    try {
      const params = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirect
      });
      if (verifier) params.set('code_verifier', verifier);

      const tok = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params
      });
      const tj = await tok.json().catch(() => ({}));
      if (!tok.ok || !tj.access_token) {
        return res.status(400).json({ ok: false, error: tj.error_description || tj.error || 'token-failed' });
      }

      const me = await fetch('https://discord.com/api/users/@me', {
        headers: { Authorization: `Bearer ${tj.access_token}` }
      });
      if (!me.ok) return res.status(400).json({ ok: false, error: 'user-failed' });
      const u = await me.json();
      const avatar = u.avatar
        ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.png?size=128`
        : '';
      return res.json({
        ok: true,
        id: String(u.id),
        username: u.username || '',
        avatar,
        accessToken: issueTicket(String(u.id))
      });
    } catch (e) {
      console.error('[launcher] token err:', e.message);
      return res.status(500).json({ ok: false, error: 'exception' });
    }
  }

  // ═══════════════ DEVICE FLOW ═══════════════
  if (op.endsWith('/device')) {
    try {
      // POST = yeni device code oluştur
      if (req.method === 'POST') {
        const body = await readJson(req);
        if (body.action !== 'create') return res.status(400).json({ ok: false });
        const code = randCode();
        await fetch(launcherDocUrl(code), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fields: {
            status: { stringValue: 'pending' },
            createdAt: { timestampValue: new Date().toISOString() }
          }})
        });
        return res.json({ ok: true, code });
      }

      // GET = device code kontrolü
      const code = String(url.searchParams.get('code') || '')
        .replace(/[^A-Za-z0-9]/g, '').slice(0, 8);
      if (!code) return res.status(400).json({ ok: false });

      const r = await fetch(launcherDocUrl(code));
      if (!r.ok) return res.json({ ok: true, status: 'pending' });

      const d = await r.json();
      const f = d.fields || {};
      const created = f.createdAt?.timestampValue
        ? new Date(f.createdAt.timestampValue).getTime()
        : 0;

      // 10 dk sonra expire
      if (created && Date.now() - created > 10 * 60 * 1000) {
        await fetch(launcherDocUrl(code), { method: 'DELETE' }).catch(() => {});
        return res.json({ ok: true, status: 'expired' });
      }

      // Onaylandı
      if (f.status?.stringValue === 'done') {
        const did = f.id?.stringValue || '';
        const out = {
          ok: true,
          status: 'done',
          id: did,
          username: f.username?.stringValue || '',
          avatar: f.avatar?.stringValue || '',
          accessToken: did ? issueTicket(did) : ''
        };
        await fetch(launcherDocUrl(code), { method: 'DELETE' }).catch(() => {});
        return res.json(out);
      }

      return res.json({ ok: true, status: 'pending' });
    } catch (e) {
      console.error('[launcher] device err:', e.message);
      return res.status(500).json({ ok: false });
    }
  }

  return res.status(404).json({ error: 'not found', path: op });
}