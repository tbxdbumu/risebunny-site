/**
 * RiseBunny — theme.js
 * Tek işi var: iki yüzeyin (site + panel) aynı token dosyasından beslenmesini
 * sağlamak. Sayfa kendi `data-theme` değerini taşır; bu betik yalnızca
 * kullanıcının tercih ettiği modu `<html>` üzerine yazar.
 *
 * Kural: mod değişince sayfa YENİDEN YÜKLENMEZ. Sadece bir öznitelik
 * değişir, tokens.css'teki değişkenler kendiliğinden güncellenir.
 */
(function () {
  "use strict";

  var ANAHTAR = "rb-theme";
  var KOK = document.documentElement;

  function cozumle(deger) {
    if (deger === "dark" || deger === "light") return deger;
    try {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    } catch (e) {
      return "light";
    }
  }

  function uygula(mod) {
    KOK.setAttribute("data-theme", mod);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", mod === "dark" ? "#07070c" : "#ffffff");
    try {
      window.dispatchEvent(new CustomEvent("rb-theme", { detail: { theme: mod } }));
    } catch (e) {}
  }

  var kayitli = null;
  try {
    kayitli = localStorage.getItem(ANAHTAR);
  } catch (e) {}

  /* Sayfa kendi temasını dayatıyorsa (panel = dark) ona dokunma. */
  var sabit = KOK.getAttribute("data-theme-fixed") === "1";

  if (!sabit) {
    uygula(cozumle(kayitli));
    try {
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function (e) {
        if (!localStorage.getItem(ANAHTAR)) uygula(e.matches ? "dark" : "light");
      });
    } catch (e) {}
  }

  window.RBTheme = {
    get: function () {
      return KOK.getAttribute("data-theme") || "light";
    },
    set: function (mod) {
      var m = mod === "dark" ? "dark" : "light";
      try {
        localStorage.setItem(ANAHTAR, m);
      } catch (e) {}
      uygula(m);
    },
    toggle: function () {
      window.RBTheme.set(window.RBTheme.get() === "dark" ? "light" : "dark");
    }
  };
})();
