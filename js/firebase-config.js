(function() {
  "use strict";
  if (window.__rbCoreLoaded) return;
  window.__rbCoreLoaded = true;
  var FORCE_PREVIEW = /[?&]mnt=1/.test(location.search);
  function show404() {
    fetch("404.html").then(function(r) {
      if (!r.ok) throw 0;
      return r.text();
    }).then(function(h) {
      document.open();
      document.write(h);
      document.close();
    }).catch(function() {
      document.body.innerHTML = '<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#050507;color:#fff;font-family:sans-serif;text-align:center;padding:20px"><div><h1 style="font-size:4rem;font-weight:800;letter-spacing:-.03em;margin:0">404</h1><p style="color:#9ca3af;margin:10px 0 26px">Page Not Found</p><a href="index.html" style="color:#06b6d4;text-decoration:none;font-weight:600">← Back to Home</a></div></div>';
    });
  }
  window.__rb404 = show404;

  /* ── ölçülen şikayet (2026-11-01) ───────────────────────────────────────
     KULLANICI: "anasayfa hala önce açılıyor sonra bizim 404 sayfamıza düşüyor".
     SEBEP: config çekilemediğinde `show404()` çağrılıyor ve TÜM sayfa
     `404.html` ile değiştiriliyordu. Oysa "Firebase ayarı gelmedi" ile
     "böyle bir sayfa yok" aynı şey değil; ana sayfa bu yüzden kendi 404
     sayfasına düşüyordu.
     ARTIK: altyapı hatası sayfayı EZMEZ. Sağ üstte kapanabilir bir şerit
     gösterilir, hata konsola yazılır, sayfa olduğu gibi kullanılabilir
     kalır. Gerçek 404 yalnızca `window.__rb404()` açıkça çağrıldığında
     (bkz. maintenance/bans akışları) gösterilir. */
  function showIssue(reason) {
    try {
      console.warn("[rb] altyapı hatası, sayfa korunuyor:", reason);
    } catch (e) {}
    try {
      if (document.getElementById("rb-issue")) return;
      if (!document.body) {
        document.addEventListener("DOMContentLoaded", function () {
          showIssue(reason);
        }, { once: true });
        return;
      }
      var b = document.createElement("div");
      b.id = "rb-issue";
      b.setAttribute("role", "status");
      b.style.cssText = "position:fixed;left:50%;top:12px;transform:translateX(-50%);z-index:2147483646;max-width:min(560px,92vw);display:flex;gap:10px;align-items:center;padding:10px 12px 10px 14px;border-radius:12px;background:rgba(28,28,44,.96);border:1px solid rgba(255,180,80,.45);color:#ffe8c8;font:500 13px/1.4 system-ui,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.45)";
      var t = document.createElement("span");
      t.textContent = "Bağlantı kurulamadı — bazı alanlar geç yüklenebilir. (" + reason + ")";
      var x = document.createElement("button");
      x.type = "button";
      x.textContent = "×";
      x.setAttribute("aria-label", "Kapat");
      x.style.cssText = "background:transparent;border:0;color:#ffe8c8;font-size:18px;line-height:1;cursor:pointer;padding:0 2px";
      x.addEventListener("click", function () {
        if (b.parentNode) b.parentNode.removeChild(b);
      });
      b.appendChild(t);
      b.appendChild(x);
      document.body.appendChild(b);
      setTimeout(function () {
        if (b.parentNode) b.parentNode.removeChild(b);
      }, 12000);
    } catch (e) {}
  }
  window.__rbIssue = showIssue;
  function showMaintenance(msg) {
    if (document.getElementById("rb-maintenance")) return;
    var lang = "en";
    try {
      lang = localStorage.getItem("rb-lang") || "tr";
    } catch (e) {}
    if (lang !== "tr" && lang !== "en") lang = "tr";
    var text = msg && (msg[lang] || msg.tr || msg.en) || "Site geçici olarak bakımda. / Site is under maintenance.";
    var ov = document.createElement("div");
    ov.id = "rb-maintenance";
    ov.style.cssText = "position:fixed;inset:0;z-index:2147483647;background:#07040f;color:#fff;display:flex;align-items:center;justify-content:center;flex-direction:column;text-align:center;padding:24px;font-family:system-ui,sans-serif";
    var em = document.createElement("div");
    em.style.cssText = "font-size:64px;animation:rbPulse 1.6s infinite";
    em.textContent = "🐰";
    var h = document.createElement("h1");
    h.style.cssText = "margin:12px 0 4px;font-size:26px";
    h.textContent = lang === "tr" ? "🔧 Bakım Modu" : "🔧 Maintenance";
    var p = document.createElement("p");
    p.style.cssText = "color:#9ca3af;max-width:420px;line-height:1.6";
    p.textContent = text;
    var c = document.createElement("p");
    c.style.cssText = "color:#4b5563;font-size:12px;margin-top:24px";
    c.textContent = "© 2026 RiseBunny";
    var st = document.createElement("style");
    st.textContent = "@keyframes rbPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.12)}}";
    ov.appendChild(em);
    ov.appendChild(h);
    ov.appendChild(p);
    ov.appendChild(c);
    ov.appendChild(st);
    (document.body || document.documentElement).appendChild(ov);
    try {
      document.body.style.overflow = "hidden";
    } catch (e) {}
  }
  function hideMaintenance() {
    var ov = document.getElementById("rb-maintenance");
    if (ov) ov.remove();
    try {
      document.body.style.overflow = "";
    } catch (e) {}
  }
  async function loadFirebaseConfig() {
    try {
      var resp = await fetch("/api/firebase-config", { cache: "no-store" });
      if (!resp.ok) throw new Error("HTTP " + resp.status);
      var cfg = await resp.json();
      if (!cfg || !cfg.projectId) throw new Error("config eksik");
      window.firebaseConfig = cfg;
      return cfg;
    } catch (e) {
      showIssue("firebase-config: " + (e && e.message ? e.message : e));
      throw e;
    }
  }
  function init(cfg) {
    if (!window.firebase || !cfg || !cfg.projectId) {
      showIssue(!window.firebase ? "firebase SDK yüklenmedi" : "projectId yok");
      return;
    }
    if (!firebase.apps.length) firebase.initializeApp(cfg);
    var auth = firebase.auth();
    var db = firebase.firestore();
    auth.onAuthStateChanged(function(u) {
      if (!u) return;
      try {
        db.collection("bans").doc(u.uid).get().then(function(snap) {
          if (snap.exists && snap.data().banned === true) {
            auth.signOut();
            /* Banlı hesap için 404 hâlâ doğru: içeriğe erişim kapatılır. */
            show404();
          }
        }).catch(function() {});
      } catch (e) {}
    });
    function checkMaintenance(n) {
      n = n || 0;
      var req;
      try {
        req = db.collection("config").doc("maintenance").get();
      } catch (e) {
        if (n < 3) setTimeout(function() {
          checkMaintenance(n + 1);
        }, 1500);
        return;
      }
      req.then(function(s) {
        var d = s && s.exists ? s.data() : null;
        if ((!d || !d.active) && !FORCE_PREVIEW) return;
        showMaintenance(d && d.message);
      }).catch(function() {
        if (n < 3) setTimeout(function() {
          checkMaintenance(n + 1);
        }, 1500);
      });
    }
    checkMaintenance(0);
  }
  async function tryInit() {
    if (window.firebase && window.firebase.firestore) {
      var cfg = await loadFirebaseConfig();
      init(cfg);
    } else {
      setTimeout(tryInit, 100);
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", tryInit);
  } else {
    tryInit();
  }
})();
