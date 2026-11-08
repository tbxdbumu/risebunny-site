/**
 * KAPI: HTTPS zorunlulugu gercekten calisiyor mu?
 *
 * NEDEN
 * -----
 * "Kod ekledim" kanit degil. Bu betik `zorunluHttps`'i SAHTE req/res ile
 * calistirir ve su 6 durumu olcer:
 *
 *   1) http + gercek host      -> 301 + https Location          (YONLENDIR)
 *   2) https + gercek host     -> dokunmaz                       (GEC)
 *   3) http + localhost:3000   -> dokunmaz (gelistirme)          (GEC)
 *   4) http + 192.168.1.5      -> dokunmaz (LAN gelistirme)      (GEC)
 *   5) x-forwarded-proto=http  -> 301                            (YONLENDIR)
 *   6) host yok                -> istek GECMEZ (400)             (ENGELLE)
 *
 * Cikis kodu 0 = hepsi gecti, 2 = en az biri kirik.
 */

import { zorunluHttps } from "../lib/_https.js";

let hata = 0;
let gecen = 0;

function sahte(host, proto) {
  const durum = { kod: 0, basliklar: {}, govde: "" };
  const res = {
    set statusCode(v) {
      durum.kod = v;
    },
    get statusCode() {
      return durum.kod;
    },
    setHeader(k, v) {
      durum.basliklar[k.toLowerCase()] = v;
    },
    end(g) {
      durum.govde = g || "";
      durum.bitti = true;
    }
  };
  const req = {
    url: "/api/rank?x=1",
    headers: { host, ...(proto ? { "x-forwarded-proto": proto } : {}) },
    socket: {}
  };
  return { req, res, durum };
}

function bekle(ad, kosul, ayrinti) {
  if (kosul) {
    gecen++;
    console.log(`  [OK] ${ad}`);
  } else {
    hata++;
    console.log(`  [KIRIK] ${ad}  ${ayrinti || ""}`);
  }
}

console.log("=".repeat(70));
console.log("KAPI: HTTPS zorunlulugu");
console.log("=".repeat(70));

/* 1) http + gercek host */
{
  const { req, res, durum } = sahte("risebunny.vercel.app", "http");
  const engellendi = zorunluHttps(req, res);
  bekle(
    "http + risebunny.vercel.app -> 301 https",
    engellendi === true &&
      durum.kod === 301 &&
      String(durum.basliklar.location || "").startsWith("https://risebunny.vercel.app/api/rank"),
    `kod=${durum.kod} location=${durum.basliklar.location}`
  );
  bekle(
    "yonlendirmede HSTS basligi var",
    String(durum.basliklar["strict-transport-security"] || "").includes("max-age="),
    `hsts=${durum.basliklar["strict-transport-security"]}`
  );
}

/* 2) https + gercek host */
{
  const { req, res, durum } = sahte("risebunny.vercel.app", "https");
  const engellendi = zorunluHttps(req, res);
  bekle("https + gercek host -> gecer", engellendi === false && durum.kod === 0, `kod=${durum.kod}`);
}

/* 3) localhost */
{
  const { req, res } = sahte("localhost:3000", "http");
  bekle("http + localhost:3000 -> gecer (gelistirme)", zorunluHttps(req, res) === false);
}

/* 4) LAN */
{
  const { req, res } = sahte("192.168.1.5:3000", "http");
  bekle("http + 192.168.1.5 -> gecer (LAN)", zorunluHttps(req, res) === false);
}

/* 5) proxy basligi */
{
  const { req, res, durum } = sahte("risebunny.vercel.app", "http");
  const engellendi = zorunluHttps(req, res);
  bekle("x-forwarded-proto=http -> 301", engellendi === true && durum.kod === 301, `kod=${durum.kod}`);
}

/* 6) host yok -> istegi GECIRME */
{
  const { req, res, durum } = sahte("", "http");
  const engellendi = zorunluHttps(req, res);
  bekle("host yok -> istek GECMEZ (400)", engellendi === true && durum.kod === 400, `kod=${durum.kod}`);
}

console.log("-".repeat(70));
console.log(`  gecen: ${gecen}   kirik: ${hata}`);
console.log("=".repeat(70));
process.exit(hata === 0 ? 0 : 2);
