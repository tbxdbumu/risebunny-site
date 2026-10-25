import { safeNext } from '../../../lib/_session.js';
import { CLIENT_ID, siteBase } from '../../../lib/_helpers.js';

export default function handler(req, res) {
  try {
    if (!CLIENT_ID) return res.status(500).send('DISCORD_CLIENT_ID tanımlı değil.');
    const base = siteBase(req);
    const cbPath = process.env.DISCORD_CALLBACK_PATH || '/api/auth/discord/callback';
    const redirect = `${base}${cbPath}`;

    const url = new URL(req.url, base);
    const next = safeNext(url.searchParams.get('next'));

    const u = new URL('https://discord.com/api/oauth2/authorize');
    u.searchParams.set('client_id', CLIENT_ID);
    u.searchParams.set('redirect_uri', redirect);
    u.searchParams.set('response_type', 'code');
    u.searchParams.set('scope', 'identify email');
    u.searchParams.set('state', Buffer.from(next).toString('base64url'));

    console.log('[start] → Discord redirect_uri:', redirect);
    res.redirect(302, u.toString());
  } catch (e) {
    console.error('[start] FATAL:', e.message);
    res.status(500).send('OAuth start error');
  }
}