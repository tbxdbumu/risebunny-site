/**
 * HTTPS zorunluluğu — tek yerden.
 *
 * NEDEN
 * -----
 * Ölçüldü: `lib/_session.js` `isSecureReq()` yalnızca şu durumlarda
 * `false` dönüyordu ve bu bilgi yalnızca `Secure` bayrağını etkiliyordu.
 * Yani:
 *
 *   1) http üzerinden giriş YAPILABİLİYORDU (sadece cookie `Secure`
 *      bayrağı düşüyordu). Aradaki bir dinleyici `rb_session` cookie'sini
 *      düz metin olarak okuyabilirdi. Bu **gerçek bir oturum sızıntısı**
 *      yoludur: cookie = kimlik.
 *   2) OAuth `state` ve cihaz kodu (`device`) akışı da http üzerinden
 *      çalışıyordu.
 *
 * ÇÖZÜM
 * -----
 * Bu dosya, uçları (endpoint) değil YÖNLENDİRMEYİ zorunlu kılar:
 * `vercel.json` içinde tek bir `redirects` kuralı ile `http://` istekleri
 * `https://`'ye 301 ile taşınır. Uç tarafında ikinci bir kontrol daha var
 * (`zorunluHttps`), çünkü yapılandırma unutulursa sessizce http kabul
 * etmek istemiyoruz — "iki bağımsız kilit" ilkesi.
 *
 * YEREL GELİŞTİRME
 * ----------------
 * `localhost`, `127.0.0.1`, özel LAN adresleri (10.x, 192.168.x, 172.16-31.x)
 * MUAFTIR. Aksi halde `next dev` çalışmazdı. Bu muafiyet saldırganın
 * işine yaramaz: kurbanın tarayıcısı zaten `localhost`'a o sitenin
 * cookie'sini göndermez (SameSite=Lax + host ayrımı).
 *
 * NOT: `HSTS` başlığı (vercel.json → headers) ilk ziyaretten sonra
 * tarayıcıyı http'ye hiç göndermez; bu dosya ise İLK ziyareti korur.
 * İkisi birlikte tam koruma verir.
 */

/** Yerel/LAN adresi mi (geliştirme muafiyeti)? */
function yerelMi(host) {
  const h = String(host || "").toLowerCase().replace(/:\d+$/, "");
  // Host YOKSA: muafiyet VERME. Muafiyet yalnızca tanınan yerel adresler
  // içindir; "bilinmiyor" durumu güvenli tarafa düşmeli (bkz. kapı testi
  // "host yok -> istek GECMEZ", ilk yazımda bu yanlıştı ve kapı yakaladı).
  if (!h) return false;
  if (h === "localhost" || h === "127.0.0.1" || h === "[::1]" || h === "::1") return true;
  if (h.endsWith(".local") || h.endsWith(".localhost")) return true;
  // Özel LAN aralıkları
  if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(h)) return true;
  if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(h)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/.test(h)) return true;
  return false;
}

/** İsteğin geldiği protokol (proxy başlıkları dahil). */
export function protokol(req) {
  const xf = String((req.headers && req.headers["x-forwarded-proto"]) || "")
    .split(",")[0]
    .trim()
    .toLowerCase();
  if (xf) return xf;
  try {
    if (req.socket && req.socket.encrypted) return "https";
  } catch {
    /* yoksay */
  }
  return "http";
}

/** İsteğin host'u (proxy başlıkları dahil). */
export function host(req) {
  const h = req.headers || {};
  return String(h["x-forwarded-host"] || h.host || "").split(",")[0].trim();
}

/**
 * HTTPS zorunluluğunu uygula.
 *
 * @returns `true` → istek YÖNLENDİRİLDİ, çağıran `return` etmeli.
 *          `false` → devam edebilir (https ya da yerel geliştirme).
 *
 * @example
 *   if (zorunluHttps(req, res)) return;
 */
export function zorunluHttps(req, res) {
  try {
    const h = host(req);
    // Host başlığı ZORUNLU: yoksa yönlendirme hedefi kurulamaz. Bu bir
    // saldırı biçimi (HTTP/1.0 host'suz istek) ya da bozuk proxy'dir;
    // ikisinde de istek GEÇMEZ.
    if (!h) {
      res.statusCode = 400;
      res.end("Bad Request");
      return true;
    }
    if (yerelMi(h)) return false;
    if (protokol(req) === "https") return false;

    // Yönlendirme hedefi: AYNI host, https, aynı yol + sorgu.
    // Host başlığına güveniyoruz ama yalnızca "https://" öneki ekliyoruz;
    // saldırganın host'u değiştirmesi yeni bir sızıntı üretmez (tarayıcı
    // zaten o host'a gidiyordu).
    const hedefYol = String(req.url || "/");
    res.statusCode = 301;
    res.setHeader("Location", `https://${h}${hedefYol}`);
    res.setHeader("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
    res.end("");
    return true;
  } catch {
    // Ölçüm başarısız olduysa İSTEĞİ GEÇİRME: kapalı taraf güvenli taraftır.
    try {
      res.statusCode = 400;
      res.end("Bad Request");
    } catch {
      /* yoksay */
    }
    return true;
  }
}
