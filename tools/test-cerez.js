/**
 * KAPI: oturum cookie'si uretimde HER ZAMAN `Secure` mi?
 *
 * NEDEN
 * -----
 * Eski kod `Secure` bayragini `isSecureReq()` sonucuna baglıyordu.
 * `SITE_URL` yanlislikla `http://` ile tanimliysa (ya da proxy basligi
 * dusuyorsa) oturum cookie'si duz metin tasinirdi — aradaki bir
 * dinleyici `rb_session`'i okuyup hesabi ele gecirirdi.
 *
 * Bu betik ortami SAHTELEMEK yerine gercek `setSession`'i cagirir ve
 * `Set-Cookie` basligini olcer. 4 durum:
 *   1) uretim + http  -> Secure VAR
 *   2) uretim + https -> Secure VAR
 *   3) gelistirme + localhost -> Secure YOK (tarayici kabul etsin diye)
 *   4) uretim + SITE_URL=http:// -> Secure VAR (eski hatanin ta kendisi)
 */

process.env.SESSION_SECRET = "test-" + "x".repeat(40);

const { setSession } = await import("../lib/_session.js");

let hata = 0;
let gecen = 0;

function olc(ad, ortam, req, bekle) {
  for (const [k, v] of Object.entries(ortam)) process.env[k] = v;
  const basliklar = {};
  const res = {
    setHeader(k, v) {
      basliklar[k] = v;
    }
  };
  setSession(res, { id: "985126554306773063", username: "test" }, req);
  const cerez = String(basliklar["Set-Cookie"] || "");
  const secure = /;\s*Secure/i.test(cerez);
  if (secure === bekle) {
    gecen++;
    console.log(`  [OK] ${ad} -> Secure ${secure ? "VAR" : "YOK"}`);
  } else {
    hata++;
    console.log(`  [KIRIK] ${ad} -> Secure ${secure ? "VAR" : "YOK"} (beklenen ${bekle ? "VAR" : "YOK"})`);
  }
}

console.log("=".repeat(70));
console.log("KAPI: oturum cookie'si Secure bayragi");
console.log("=".repeat(70));

const httpReq = { headers: { "x-forwarded-proto": "http", host: "risebunny.vercel.app" } };
const httpsReq = { headers: { "x-forwarded-proto": "https", host: "risebunny.vercel.app" } };
const localReq = { headers: { "x-forwarded-proto": "http", host: "localhost:3000" } };

olc("1) uretim + http", { NODE_ENV: "production", SITE_URL: "" }, httpReq, true);
olc("2) uretim + https", { NODE_ENV: "production", SITE_URL: "" }, httpsReq, true);
olc("3) gelistirme + localhost", { NODE_ENV: "development", SITE_URL: "" }, localReq, false);
olc("4) uretim + SITE_URL=http://", { NODE_ENV: "production", SITE_URL: "http://risebunny.vercel.app" }, httpReq, true);

// HttpOnly ve SameSite da olmali (XSS / CSRF).
{
  const basliklar = {};
  process.env.NODE_ENV = "production";
  setSession({ setHeader: (k, v) => (basliklar[k] = v) }, { id: "1" }, httpsReq);
  const c = String(basliklar["Set-Cookie"] || "");
  const ok = /HttpOnly/i.test(c) && /SameSite=Lax/i.test(c) && /Path=\//.test(c);
  if (ok) {
    gecen++;
    console.log("  [OK] HttpOnly + SameSite=Lax + Path=/ var");
  } else {
    hata++;
    console.log(`  [KIRIK] eksik bayrak: ${c}`);
  }
}

console.log("-".repeat(70));
console.log(`  gecen: ${gecen}   kirik: ${hata}`);
console.log("=".repeat(70));
process.exit(hata === 0 ? 0 : 2);
