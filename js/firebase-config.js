/*! RiseBunny core v6 — ban guard + MAINTENANCE GATE (all pages except admin.html) */
window.firebaseConfig = {
  apiKey: "AIzaSyAq5Nafl9aI2TabzGsj5J9ij6lNwyfTguM",
  authDomain: "gen-lang-client-0590499912.firebaseapp.com",
  projectId: "gen-lang-client-0590499912",
  storageBucket: "gen-lang-client-0590499912.firebasestorage.app",
  messagingSenderId: "203829901581",
  appId: "1:203829901581:web:66d532c52155db4aea9844"
};
window.ADMIN_UID = 'oblLBCNGXEYF8plKq8KUr3m6o4f1';
window.ADMIN_UIDS = ['oblLBCNGXEYF8plKq8KUr3m6o4f1', '1310366324731547798'];
window.ADMIN_DISCORD = ['985126554306773063', '1310366324731547798'];
window.RB_IS_ADMIN = function (u) {
  if (!u) return false;
  if (window.ADMIN_UIDS.indexOf(u.uid) > -1) return true;
  var em = String(u.email || '').toLowerCase();
  for (var i = 0; i < window.ADMIN_DISCORD.length; i++) {
    if (em === 'd' + window.ADMIN_DISCORD[i] + '@discord.risebunny.local') return true;
  }
  return false;
};

/* Admin allowlist: sahip + 1310366324731547798 (UID veya Discord köprü e-postası). */
window.ADMIN_UIDS = ['oblLBCNGXEYF8plKq8KUr3m6o4f1', '1310366324731547798'];
window.ADMIN_DISCORD = ['985126554306773063', '1310366324731547798'];
window.RB_IS_ADMIN = function (u) {
  if (!u) return false;
  if (window.ADMIN_UIDS.indexOf(u.uid) > -1) return true;
  var em = String(u.email || '').toLowerCase();
  for (var i = 0; i < window.ADMIN_DISCORD.length; i++) {
    if (em === 'd' + window.ADMIN_DISCORD[i] + '@discord.risebunny.local') return true;
  }
  return false;
};

(function () {
'use strict';
if (window.__rbCoreLoaded) return; window.__rbCoreLoaded = true;
/* admin.html'e sadece footer 5-tık jetonu (5 dk) VEYA Discord dönüşü (?login=ok) ile girebilirsin.
   Gerçek yetki denetimini admin.js yapar (allowlist dışı → 404). */
if (/admin\.html(\?|$)/.test(location.pathname)) {
  var _tok = null, _tim = 0;
  try { _tok = sessionStorage.getItem('rb_admin_token'); _tim = parseInt(sessionStorage.getItem('rb_admin_time') || '0', 10) || 0; } catch (e) {}
  var _fresh = _tok === '1' && (Date.now() - _tim) < 5 * 60 * 1000;
  var _discordBack = /[?&]login=ok/.test(location.search);
  if (!_fresh && !_discordBack) {
    try { sessionStorage.removeItem('rb_admin_token'); sessionStorage.removeItem('rb_admin_time'); } catch (e2) {}
    show404();
    return;
  }
}
var ADMIN_UID = window.ADMIN_UID;
var FORCE_PREVIEW = /[?&]mnt=1/.test(location.search);

function show404() {
  fetch('404.html').then(function (r) { if (!r.ok) throw 0; return r.text(); }).then(function (h) {
    document.open(); document.write(h); document.close();
  }).catch(function () {
    document.body.innerHTML = '<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#050507;color:#fff;font-family:sans-serif;text-align:center;padding:20px"><div><h1 style="font-size:4rem;font-weight:800;letter-spacing:-.03em;margin:0">404</h1><p style="color:#9ca3af;margin:10px 0 26px">Page Not Found</p><a href="index.html" style="color:#06b6d4;text-decoration:none;font-weight:600">← Back to Home</a></div></div>';
  });
}
window.__rb404 = show404;

/* ── maintenance overlay (TR/EN, blocks everything) ── */
function showMaintenance(msg) {
  if (document.getElementById('rb-maintenance')) return;
  var lang = 'en';
  try { lang = localStorage.getItem('rb-lang') || 'tr'; } catch (e) {}
  if (lang !== 'tr' && lang !== 'en') lang = 'tr';
  var text = (msg && (msg[lang] || msg.tr || msg.en)) || 'Site geçici olarak bakımda. / Site is under maintenance.';
  var ov = document.createElement('div');
  ov.id = 'rb-maintenance';
  ov.style.cssText = 'position:fixed;inset:0;z-index:2147483647;background:#07040f;color:#fff;display:flex;align-items:center;justify-content:center;flex-direction:column;text-align:center;padding:24px;font-family:system-ui,sans-serif';
  var em = document.createElement('div');
  em.style.cssText = 'font-size:64px;animation:rbPulse 1.6s infinite';
  em.textContent = '🐰';
  var h = document.createElement('h1');
  h.style.cssText = 'margin:12px 0 4px;font-size:26px';
  h.textContent = lang === 'tr' ? '🔧 Bakım Modu' : '🔧 Maintenance';
  var p = document.createElement('p');
  p.style.cssText = 'color:#9ca3af;max-width:420px;line-height:1.6';
  p.textContent = text;
  var c = document.createElement('p');
  c.style.cssText = 'color:#4b5563;font-size:12px;margin-top:24px';
  c.textContent = '© 2026 RiseBunny';
  var st = document.createElement('style');
  st.textContent = '@keyframes rbPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.12)}}';
  ov.appendChild(em); ov.appendChild(h); ov.appendChild(p); ov.appendChild(c); ov.appendChild(st);
  (document.body || document.documentElement).appendChild(ov);
  try { document.body.style.overflow = 'hidden'; } catch (e) {}
}
function hideMaintenance() {
  var ov = document.getElementById('rb-maintenance');
  if (ov) ov.remove();
  try { document.body.style.overflow = ''; } catch (e) {}
}

/* ── init Firebase + auth + ban/maintenance gates ── */
function init() {
  if (!window.firebase || !window.firebaseConfig || !window.firebaseConfig.projectId) {
    show404(); return;
  }
  if (!firebase.apps.length) firebase.initializeApp(window.firebaseConfig);
  var auth = firebase.auth();
  var db = firebase.firestore();

  /* 1) Ban kontrolü — her sayfada (admin.html hariç) */
  auth.onAuthStateChanged(function (u) {
    if (!u) return;
    try {
      db.collection('bans').doc(u.uid).get().then(function (snap) {
        if (snap.exists && snap.data().banned === true) {
          auth.signOut();
          show404();
        }
      }).catch(function () {});
    } catch (e) {}
  });

  /* 2) Maintenance kontrolü — admin hariç herkes için */
  function checkMaintenance(n) {
    n = n || 0;
    var req;
    try { req = db.collection('config').doc('maintenance').get(); }
    catch (e) { if (n < 3) setTimeout(function () { checkMaintenance(n + 1); }, 1500); return; }
    req.then(function (s) {
      var d = (s && s.exists) ? s.data() : null;
      if ((!d || !d.active) && !FORCE_PREVIEW) return;
      showMaintenance(d && d.message);
      if (!auth) return;
      try {
        auth.onAuthStateChanged(function (u) {
          if (u && u.uid === ADMIN_UID) hideMaintenance();
          else showMaintenance(d && d.message);
        });
      } catch (e) {}
    }).catch(function () { if (n < 3) setTimeout(function () { checkMaintenance(n + 1); }, 1500); });
  }
  checkMaintenance(0);
}

/* Firebase SDK yüklü mü? */
function tryInit() {
  if (window.firebase && window.firebase.firestore) {
    init();
  } else {
    setTimeout(tryInit, 100);
  }
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', tryInit);
} else {
  tryInit();
}
})();