/* ══════════════════════════════════════════════════════════════════════
   RiseBunny — rb-health.js
   Sitede botun gerçekten yaşadığını gösteren tek kaynak.

   Neden ayrı dosya: bu bilgi hem ana sayfada hem bot sayfasında lazım,
   ama iki sayfa farklı betikler yüklüyor (app.js / risebunny.js).
   Burada tek yerde toplanıyor, iki sayfa da aynı kodu çağırıyor.

   Kural: veri yoksa uydurma yok. "Durum alınamadı" yazar.
   ══════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var CACHE_MS = 120000; /* 2 dk — /api/stats zaten s-maxage=120 */
  var sonVeri = null;
  var sonZaman = 0;

  function dil() {
    try {
      var l = localStorage.getItem("rb-lang") || localStorage.getItem("rb-lang") || "tr";
      return l === "en" ? "en" : "tr";
    } catch (e) {
      return "tr";
    }
  }

  function sayi(n) {
    if (n == null) return "—";
    try {
      return Number(n).toLocaleString(dil() === "tr" ? "tr-TR" : "en-US");
    } catch (e) {
      return String(n);
    }
  }

  function getir() {
    var simdi = Date.now();
    if (sonVeri && simdi - sonZaman < CACHE_MS) {
      return Promise.resolve(sonVeri);
    }
    return fetch("/api/stats", { headers: { Accept: "application/json" } })
      .then(function (r) {
        if (!r.ok) throw new Error("http-" + r.status);
        return r.json();
      })
      .then(function (j) {
        sonVeri = j || {};
        sonZaman = simdi;
        return sonVeri;
      });
  }

  /* ── istatistik kutuları (ana sayfa + bot sayfası ortak) ──────────── */
  function statlariBas(d) {
    var canli = !!(d && d.live);
    var L = dil();
    var etiket = canli
      ? (L === "tr" ? "● canlı" : "● live")
      : (L === "tr" ? "○ veri yok" : "○ no data");

    function yaz(id, deger) {
      var el = document.getElementById(id);
      if (el) el.textContent = deger;
    }

    yaz("st-servers", canli ? sayi(d.servers) : "—");
    yaz("st-users", canli ? sayi(d.users) : "—");
    yaz("st-cmds", canli && d.commands ? sayi(d.commands) : "—");
    yaz("st-votes", canli ? sayi(d.votes) : "—");

    ["st-servers-src", "st-users-src", "st-votes-src"].forEach(function (id) {
      yaz(id, etiket);
    });

    var govde = document.body;
    if (govde) {
      if (canli) govde.setAttribute("data-live", "1");
      else govde.removeAttribute("data-live");
    }
    return canli;
  }

  /* ── canlı durum rozeti ──────────────────────────────────────────── */
  function rozetBas(d) {
    var kutu = document.getElementById("bot-live");
    if (!kutu) return;
    var alt = document.getElementById("bot-live-sub");
    var canli = !!(d && d.live);
    var L = dil();

    kutu.classList.toggle("off", !canli);
    if (!alt) return;

    if (canli) {
      var parcalar = [];
      if (d.servers != null) parcalar.push(sayi(d.servers) + (L === "tr" ? " sunucu" : " servers"));
      if (d.commands != null) parcalar.push(sayi(d.commands) + (L === "tr" ? " komut" : " commands"));
      alt.textContent = parcalar.length
        ? parcalar.join(" · ")
        : (L === "tr" ? "7/24 çevrimiçi" : "Online 24/7");
    } else {
      alt.textContent = L === "tr" ? "Bot API yanıt vermedi" : "Bot API did not answer";
    }
  }

  function uygula(d) {
    statlariBas(d);
    rozetBas(d);
    /* diğer betikler (risebunny.js) aynı veriyi dinleyebilsin */
    try {
      window.dispatchEvent(
        new CustomEvent("rb-stats", { detail: { data: d, live: !!(d && d.live) } })
      );
    } catch (e) {}
  }

  function yenile() {
    return getir()
      .then(uygula)
      .catch(function () {
        uygula(null);
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", yenile);
  } else {
    yenile();
  }

  /* Dil değişince metinler yeniden basılır (sayı formatı da değişir) */
  window.addEventListener("rb-lang", function () {
    uygula(sonVeri);
  });

  /* Sekmeye geri dönünce tazele */
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible" && Date.now() - sonZaman > CACHE_MS) {
      yenile();
    }
  });

  window.RBHealth = { refresh: yenile, data: function () { return sonVeri; } };
})();
