/* ════════════════════════════════════════════════════════════════════════
   rb-link.js — web tarafı cihaz kodu akışı

   Mobil uygulama `POST /api/launcher/device {action:"create"}` ile bir kod
   alır, kullanıcıya gösterir ve 2.5 sn'de bir `GET /api/launcher/device?code=`
   ile durumu sorar. Kodun "done" olabilmesi için sitenin bu kodu Discord
   oturumuyla damgalaması gerekir; bunu `/api/auth/discord/callback` yapar
   (`id`, `username`, `proof` yazar).

   Bu dosya iki iş yapıyor:

     1. adres çubuğunda `?device=XXXX` varsa Discord girişine yönlendirir
     2. kullanıcı kodu elle yapıştırmak isterse küçük bir panel açar

   Hiçbir sır burada tutulmaz; proof yalnızca sunucuda üretilir.
   ════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var CODE_RE = /^[A-Za-z0-9]{4,12}$/;

  function codeFromUrl() {
    try {
      var m = location.search.match(/[?&]device=([A-Za-z0-9]{4,12})/);
      if (m) return m[1].toUpperCase();
      var h = location.hash.match(/[?&?#]device=([A-Za-z0-9]{4,12})/);
      if (h) return h[1].toUpperCase();
    } catch (e) {}
    return "";
  }

  /* Giriş zaten yapıldıysa callback bizi `?login=ok` ile geri gönderir;
     o durumda kodu tekrar onaylatmıyoruz, sadece bildiğimizi söylüyoruz. */
  function loginFlag() {
    try {
      return (location.search.match(/[?&]login=([a-z]+)/) || [])[1] || "";
    } catch (e) {
      return "";
    }
  }

  /* ── otomatik yönlendirme ─────────────────────────────────────────────
     Kullanıcı `?device=ABC123` ile geldiyse tek tıkla Discord'a gider.
     Sonsuz döngü koruması: callback'ten sonra login=ok geldiğinde
     yeniden yönlendirmeyiz. */
  var code = codeFromUrl();
  if (code && !loginFlag()) {
    location.replace(
      "/api/auth/discord/start?device=" + encodeURIComponent(code) +
      "&next=" + encodeURIComponent("/risebunny-panel?device=" + code)
    );
  }

  /* ── elle kod girişi ──────────────────────────────────────────────────
     Ana sayfaya sağ altta küçük bir düğme ekliyoruz; tıklayınca kod
     sorulur. Mevcut CSS sınıfları kullanılıyor ki tema bozulmasın. */
  function buildButton() {
    if (document.getElementById("rb-dev-link")) return;
    var wrap = document.createElement("div");
    wrap.id = "rb-dev-link";
    /* İki yerde duruyor: sağ alt köşe (masaüstü) ve alt orta (dar ekran).
       Modal ve şerit (rb-issue) ile üst üste binmesin diye z-index düşük,
       alt kenardan 18px pay bırakılıyor. */
    wrap.setAttribute("style", [
      "position:fixed", "right:18px", "bottom:18px", "z-index:9990",
      "font:600 13px/1 system-ui,sans-serif"
    ].join(";"));
    var btn = document.createElement("button");
    btn.type = "button";
    btn.title = "Uygulama giriş kodu";
    btn.innerHTML = '<i class="fa-brands fa-discord"></i> Cihaz Bağla';
    btn.setAttribute("style", [
      "display:flex", "align-items:center", "gap:7px",
      "padding:10px 14px", "border-radius:12px", "cursor:pointer",
      "border:1px solid rgba(120,120,255,.45)",
      "background:rgba(24,24,40,.92)", "color:#e8e8ff",
      "backdrop-filter:blur(8px)", "box-shadow:0 8px 24px rgba(0,0,0,.35)"
    ].join(";"));
    btn.addEventListener("click", openDialog);
    wrap.appendChild(btn);
    document.body.appendChild(wrap);
  }

  function openDialog() {
    if (document.getElementById("rb-dev-modal")) return;
    var modal = document.createElement("div");
    modal.id = "rb-dev-modal";
    modal.setAttribute("style", [
      "position:fixed", "inset:0", "z-index:9999",
      "display:flex", "align-items:center", "justify-content:center",
      "background:rgba(6,6,14,.72)", "backdrop-filter:blur(6px)"
    ].join(";"));
    modal.innerHTML =
      '<div style="width:min(420px,92vw);background:#15151f;border:1px solid rgba(120,120,255,.35);' +
      'border-radius:16px;padding:22px;color:#e8e8ff;font:14px/1.5 system-ui,sans-serif">' +
        '<div style="font:700 17px/1.3 system-ui,sans-serif;margin-bottom:6px">Uygulamayı hesabına bağla</div>' +
        '<p style="margin:0 0 14px;color:#9a9ab0">' +
          'Brawl Stars içindeki RiseBunny panelinde <b>Hesap</b> sekmesindeki kodu buraya yaz. ' +
          'Discord hesabınla onayladıktan sonra oyun premium durumunu görür.' +
        '</p>' +
        '<input id="rb-dev-code" maxlength="12" autocomplete="off" spellcheck="false" ' +
          'placeholder="ABC123" style="width:100%;box-sizing:border-box;padding:12px;border-radius:10px;' +
          'border:1px solid rgba(120,120,255,.35);background:#0f0f18;color:#fff;' +
          'font:700 18px/1 ui-monospace,monospace;letter-spacing:3px;text-transform:uppercase">' +
        '<div id="rb-dev-err" style="min-height:18px;color:#ff6b81;font-size:12px;margin-top:8px"></div>' +
        '<div style="display:flex;gap:10px;margin-top:6px">' +
          '<button id="rb-dev-go" type="button" style="flex:1;padding:11px;border-radius:10px;border:0;' +
            'cursor:pointer;background:linear-gradient(135deg,#5865F2,#8b5cf6);color:#fff;font-weight:700">' +
            'Discord ile onayla</button>' +
          '<button id="rb-dev-cancel" type="button" style="padding:11px 16px;border-radius:10px;' +
            'cursor:pointer;background:transparent;border:1px solid rgba(255,255,255,.18);color:#c3c3d6">' +
            'Kapat</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(modal);

    var input = modal.querySelector("#rb-dev-code");
    var err = modal.querySelector("#rb-dev-err");
    var go = modal.querySelector("#rb-dev-go");

    function close() {
      if (modal.parentNode) modal.parentNode.removeChild(modal);
    }
    modal.addEventListener("click", function (e) {
      if (e.target === modal) close();
    });
    modal.querySelector("#rb-dev-cancel").addEventListener("click", close);

    function submit() {
      var v = String(input.value || "").trim().toUpperCase();
      if (!CODE_RE.test(v)) {
        err.textContent = "Kod 4-12 karakter olmalı (harf ve rakam).";
        input.focus();
        return;
      }
      err.textContent = "";
      go.disabled = true;
      go.textContent = "Yönlendiriliyor…";
      location.href = "/api/auth/discord/start?device=" + encodeURIComponent(v) +
        "&next=" + encodeURIComponent("/risebunny?device=" + v);
    }

    go.addEventListener("click", submit);
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") submit();
      if (e.key === "Escape") close();
    });
    input.focus();
  }

  /* Kodla geldiysek ve giriş tamamlandıysa kullanıcıya haber veriyoruz.
     Oyun zaten 2.5 sn içinde poll'dan "done" alacak; buradaki yazı sadece
     "kapatma, oyuna dön" demek için. */
  if (code && loginFlag() === "ok") {
    window.addEventListener("DOMContentLoaded", function () {
      var box = document.createElement("div");
      box.setAttribute("style", [
        "position:fixed", "left:50%", "top:18px", "transform:translateX(-50%)",
        "z-index:9999", "padding:12px 18px", "border-radius:12px",
        "background:rgba(28,28,44,.96)", "border:1px solid rgba(120,255,180,.35)",
        "color:#d8ffe8", "font:600 14px/1.4 system-ui,sans-serif",
        "box-shadow:0 10px 30px rgba(0,0,0,.4)"
      ].join(";"));
      box.textContent = "Cihaz onaylandı — RiseBunny panelinde yeniden dene.";
      document.body.appendChild(box);
      setTimeout(function () { if (box.parentNode) box.parentNode.removeChild(box); }, 9000);
    });
  }

  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", buildButton);
  } else {
    buildButton();
  }

  window.RiseBunnyDeviceLink = { open: openDialog, code: codeFromUrl };
})();
