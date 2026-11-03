/**
 * RiseBunny — docs.js
 * Komut referansını `window.RB_DOCS` üzerinden çizer.
 *
 * - Dil: app.js'in `rb-lang` olayını dinler; TR/EN metinleri veride ikisi de var.
 * - Arama: komut adı + açıklama üzerinde, aksan duyarsız (ı/i, ş/s ...).
 * - Menü: kategori tıklaması o bölüme kaydırır; kaydırma menüyü günceller.
 * - Durum başka yerden değişirse yeniden çizim yok, sadece filtre.
 */
(function () {
  "use strict";

  var VERI = window.RB_DOCS;
  var ana = document.getElementById("doc-main");
  var nav = document.getElementById("doc-nav");
  var arama = document.getElementById("cmd-search");
  var sayac = document.getElementById("cmd-count");
  var bos = document.getElementById("cmd-empty");
  if (!VERI || !ana || !nav) return;

  var dil = "tr";
  var aktifKategori = "hepsi";
  var sorgu = "";

  /* --- küçük yardımcılar --- */
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function kacis(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  /* arama için: Türkçe karakterleri sadeleştir */
  function sade(s) {
    return String(s)
      .toLowerCase()
      .replace(/ı/g, "i").replace(/İ/g, "i")
      .replace(/ş/g, "s").replace(/ğ/g, "g")
      .replace(/ü/g, "u").replace(/ö/g, "o").replace(/ç/g, "c")
      .replace(/â/g, "a").replace(/î/g, "i");
  }
  function metin(c, alan) {
    return (dil === "en" ? c["en" + alan] || c[alan.toLowerCase()] || c.en : c["tr" + alan] || c.tr) || "";
  }

  /* --- bir komutu çiz --- */
  function komutSatiri(c) {
    var ad = c.komut[0];
    var kullanim = dil === "en" ? c.kullanimEn : c.kullanimTr;
    var aciklama = dil === "en" ? c.en : c.tr;

    var satir = el("div", "cmd-row");
    satir.dataset.ad = sade(ad + " " + c.komut.join(" ") + " " + aciklama);

    var sol = el("div", "cmd-left");
    sol.appendChild(el("code", "cmd-name", kacis(ad)));
    if (kullanim && kullanim !== ad) sol.appendChild(el("span", "cmd-use", kacis(kullanim)));
    satir.appendChild(sol);
    satir.appendChild(el("p", "cmd-desc", kacis(aciklama)));
    return satir;
  }

  /* --- tüm listeyi çiz --- */
  function ciz() {
    ana.innerHTML = "";
    nav.innerHTML = "";

    /* menüde "Tümü" + kategoriler */
    var tumu = el("button", "doc-nav-link on", "<span>·</span>" + (dil === "en" ? "All commands" : "Tümü"));
    tumu.type = "button";
    tumu.dataset.kat = "hepsi";
    nav.appendChild(tumu);

    VERI.kategoriler.forEach(function (k) {
      var b = el("button", "doc-nav-link", "<span>" + k.emoji + "</span>" + kacis(dil === "en" ? k.en : k.tr) + '<i class="n">' + k.komutlar.length + "</i>");
      b.type = "button";
      b.dataset.kat = k.id;
      nav.appendChild(b);
    });

    /* bölümler */
    VERI.kategoriler.forEach(function (k) {
      var bolum = el("section", "doc-cat");
      bolum.id = "kat-" + k.id;
      bolum.dataset.kat = k.id;

      var bas = el("div", "doc-cat-head");
      var h2 = el("h2", "doc-cat-title", "<span aria-hidden=\"true\">" + k.emoji + "</span>" + kacis(dil === "en" ? k.en : k.tr));
      if (k.yeni) h2.appendChild(el("span", "pill new", dil === "en" ? "New" : "Yeni"));
      bas.appendChild(h2);
      bas.appendChild(el("span", "doc-cat-n", String(k.komutlar.length)));
      bolum.appendChild(bas);

      var liste = el("div", "cmd-list");
      k.komutlar.forEach(function (c) { liste.appendChild(komutSatiri(c)); });
      bolum.appendChild(liste);
      ana.appendChild(bolum);
    });

    filtre();
  }

  /* --- arama + kategori filtresi --- */
  function filtre() {
    var q = sade(sorgu.trim());
    var gorunen = 0;
    var bolumler = ana.querySelectorAll(".doc-cat");

    Array.prototype.forEach.call(bolumler, function (b) {
      var katOk = aktifKategori === "hepsi" || b.dataset.kat === aktifKategori;
      var bGorunen = 0;
      Array.prototype.forEach.call(b.querySelectorAll(".cmd-row"), function (r) {
        var ok = katOk && (!q || r.dataset.ad.indexOf(q) >= 0);
        r.hidden = !ok;
        if (ok) bGorunen++;
      });
      b.hidden = bGorunen === 0;
      gorunen += bGorunen;
    });

    /* menü sayılarını güncel tut: kategori seçili değilken arama sonucu sayısı */
    Array.prototype.forEach.call(nav.querySelectorAll(".doc-nav-link"), function (b) {
      var kat = b.dataset.kat;
      var on = kat === aktifKategori;
      b.classList.toggle("on", on);
      if (kat !== "hepsi") {
        var sec = ana.querySelector('.doc-cat[data-kat="' + kat + '"]');
        var n = sec ? sec.querySelectorAll(".cmd-row:not([hidden])").length : 0;
        var sayi = b.querySelector(".n");
        if (sayi) sayi.textContent = String(n);
      }
    });

    if (sayac) {
      sayac.textContent =
        gorunen + " " + (dil === "en" ? "commands" : "komut") +
        (q ? " · " + (dil === "en" ? "filtered" : "filtreli") : "");
    }
    if (bos) bos.hidden = gorunen !== 0;
  }

  /* --- arama kutusu --- */
  if (arama) {
    arama.addEventListener("input", function () {
      sorgu = arama.value;
      filtre();
    });
    /* "/" ile aramaya odaklan; yazarken değil, boştayken */
    document.addEventListener("keydown", function (e) {
      var t = e.target;
      var yaziyor = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      if (e.key === "/" && !yaziyor) {
        e.preventDefault();
        arama.focus();
      }
    });
  }

  /* --- kategori menüsü --- */
  nav.addEventListener("click", function (e) {
    var b = e.target.closest(".doc-nav-link");
    if (!b) return;
    aktifKategori = b.dataset.kat;
    filtre();
    var hedef = aktifKategori === "hepsi" ? ana : document.getElementById("kat-" + aktifKategori);
    if (hedef) {
      var y = hedef.getBoundingClientRect().top + window.pageYOffset - 84;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  });

  /* --- kaydırınca menüyü işaretle (kategori seçili değilken) --- */
  var isaretZaman = null;
  window.addEventListener("scroll", function () {
    if (aktifKategori !== "hepsi" || isaretZaman) return;
    isaretZaman = setTimeout(function () {
      isaretZaman = null;
      var bolumler = Array.prototype.slice.call(ana.querySelectorAll(".doc-cat:not([hidden])"));
      var gecti = null;
      for (var i = 0; i < bolumler.length; i++) {
        if (bolumler[i].getBoundingClientRect().top - 110 <= 0) gecti = bolumler[i];
      }
      if (!gecti) return;
      Array.prototype.forEach.call(nav.querySelectorAll(".doc-nav-link"), function (b) {
        b.classList.toggle("on", b.dataset.kat === gecti.dataset.kat);
      });
    }, 90);
  }, { passive: true });

  /* --- dil değişimi --- */
  window.addEventListener("rb-lang", function (e) {
    var yeni = e && e.detail && e.detail.lang;
    if (!yeni || yeni === dil) return;
    dil = yeni;
    ciz();
  });

  /* app.js yüklendiyse mevcut dili al */
  if (window.RB && window.RB.lang) dil = window.RB.lang;
  else {
    try {
      var k = localStorage.getItem("rb-lang");
      if (k === "en" || k === "tr") dil = k;
    } catch (e) {}
  }

  ciz();
})();
