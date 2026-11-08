/**
 * RiseBunny — changelog.js
 * `window.RB_LOG` dizisini `.timeline` içine çizer.
 * Dil app.js'in `rb-lang` olayından gelir; TR yoksa EN'e, o da yoksa
 * TR'ye düşer. Hiçbir metin uydurulmaz — kayıt yoksa bölüm çizilmez.
 */
(function () {
  "use strict";

  var VERI = window.RB_LOG;
  var kok = document.getElementById("versions");
  if (!VERI || !kok) return;

  var dil = "tr";

  var ETIKET = {
    tr: { added: "Eklendi", changed: "Değiştirildi", fixed: "Düzeltildi", removed: "Kaldırıldı" },
    en: { added: "Added", changed: "Changed", fixed: "Fixed", removed: "Removed" }
  };

  function kacis(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function tarih(iso) {
    try {
      return new Intl.DateTimeFormat(dil === "en" ? "en-GB" : "tr-TR", {
        day: "2-digit", month: "long", year: "numeric"
      }).format(new Date(iso + "T00:00:00"));
    } catch (e) {
      return iso;
    }
  }

  /* sürüm verisini seçilen dile indirger */
  function degisiklikler(v) {
    var taban = v.changes || {};
    var ceviri = dil === "en" ? v.en : null;
    var out = {};
    Object.keys(taban).forEach(function (tip) {
      var liste = ceviri && ceviri[tip] && ceviri[tip].length ? ceviri[tip] : taban[tip];
      if (liste && liste.length) out[tip] = liste;
    });
    return out;
  }

  function ciz() {
    kok.innerHTML = "";
    var etiket = ETIKET[dil] || ETIKET.tr;
    var ilk = true;

    VERI.forEach(function (v) {
      var li = document.createElement("li");
      li.className = "tl-item";
      ilk = false;

      var bas = document.createElement("div");
      bas.className = "tl-head";

      var rozet = document.createElement("span");
      rozet.className = "version-tag";
      rozet.textContent = v.version;
      bas.appendChild(rozet);

      var zaman = document.createElement("time");
      zaman.className = "tl-date";
      zaman.dateTime = v.date;
      zaman.textContent = tarih(v.date);
      bas.appendChild(zaman);

      if (v.tag) {
        var et = document.createElement("span");
        et.className = "tl-tag tl-tag-" + v.tag;
        et.textContent = v.tag;
        bas.appendChild(et);
      }
      li.appendChild(bas);

      var govde = document.createElement("div");
      govde.className = "changes";
      var deg = degisiklikler(v);

      Object.keys(deg).forEach(function (tip) {
        var blok = document.createElement("div");
        blok.className = "change " + tip;

        var h = document.createElement("label");
        h.className = "change-label";
        h.textContent = etiket[tip] || tip;
        blok.appendChild(h);
        /* tip ayrımı renkle de görünsün (eklendi/değişti/düzeltildi) */
        blok.classList.add("is-" + tip);

        var ul = document.createElement("ul");
        deg[tip].forEach(function (madde) {
          var mli = document.createElement("li");
          mli.textContent = madde;
          ul.appendChild(mli);
        });
        blok.appendChild(ul);
        govde.appendChild(blok);
      });

      li.appendChild(govde);
      kok.appendChild(li);
    });
  }

  window.addEventListener("rb-lang", function (e) {
    var yeni = e && e.detail && e.detail.lang;
    if (!yeni || yeni === dil) return;
    dil = yeni;
    ciz();
  });

  if (window.RB && window.RB.lang) dil = window.RB.lang;
  else {
    try {
      var k = localStorage.getItem("rb-lang");
      if (k === "en" || k === "tr") dil = k;
    } catch (e) {}
  }

  ciz();
})();
