#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
HTTPS zorunlulugunu TUM API uclarinda zorunlu kil.

NE YAPAR
--------
Her `api/**/*.js` dosyasindaki

    export default async function handler(req, res) {

govdesinin ILK satirina su kontrolu ekler:

    if (zorunluHttps(req, res)) return;

ve dosyanin basina import'u ekler.

NEDEN "ILK SATIR"
-----------------
Kontrol istegin GOVDESINI OKUMADAN once calismali; aksi halde http
uzerinden gonderilen bir sifre/token sunucuya ulasir (ve log'a dusebilir).

IDEMPOTENT
----------
Ikinci kez calistirilirsa hicbir sey degistirmez (zaten varsa atlar).

KURAL
-----
Hicbir satir SILINMEZ; yalnizca iki sey EKLENIR (import + guard).
Kullanicinin elle yazdigi kod korunur.
"""

import re
import sys
from pathlib import Path

KOK = Path(__file__).resolve().parent.parent
API = KOK / "api"

# Dosyanin kokune gore lib/_https.js'e giden goreli yol
IMPORT_SATIRI = 'import {{ zorunluHttps }} from "{yol}";\n'
KORUMA = "  if (zorunluHttps(req, res)) return;\n"

HANDLER_RE = re.compile(
    r"(export default (?:async )?function handler\s*\(([^)]*)\)\s*\{\n)"
)


def goreli_import(dosya: Path) -> str:
    """api/rank/index.js -> ../../lib/_https.js"""
    derinlik = len(dosya.relative_to(API).parts)  # index.js dahil
    return "../" * derinlik + "lib/_https.js"


def isle(dosya: Path) -> str:
    s = dosya.read_text(encoding="utf-8")
    onceki = s

    if "zorunluHttps" in s and "if (zorunluHttps(req, res)) return;" in s:
        return "atlandi (zaten korumali)"

    m = HANDLER_RE.search(s)
    if not m:
        return "ATLANDI: handler bulunamadi"

    # 1) Handler govdesinin basina koruma
    #    Islevin ilk satiri bos olabilir; koruma bos satirin ardina gitsin.
    ekleme_noktasi = m.end(1)
    s = s[:ekleme_noktasi] + KORUMA + s[ekleme_noktasi:]

    # 2) Import (varsa mevcut import blogunun en sonuna)
    if 'from "' + goreli_import(dosya) + '"' not in s:
        yeni_import = IMPORT_SATIRI.format(yol=goreli_import(dosya))
        # Son import satirini bul, onun ardina ekle; yoksa dosya basina ekle.
        importlar = list(re.finditer(r"^import .*?;\s*$", s, re.M))
        if importlar:
            son = importlar[-1].end()
            s = s[:son] + "\n" + yeni_import.rstrip("\n") + s[son:]
        else:
            s = yeni_import + "\n" + s

    if s == onceki:
        return "degisiklik yok"

    dosya.write_text(s, encoding="utf-8")
    return "eklendi"


def main() -> int:
    if not API.exists():
        print(f"[HATA] api klasoru yok: {API}")
        return 2

    dosyalar = sorted(API.rglob("*.js"))
    if not dosyalar:
        print("[HATA] api altinda .js yok")
        return 2

    print("=" * 70)
    print("HTTPS zorunlulugu — tum API uclari")
    print("=" * 70)

    sayac = {"eklendi": 0, "atlandi": 0, "hata": 0}
    for d in dosyalar:
        sonuc = isle(d)
        isim = str(d.relative_to(KOK))
        if sonuc == "eklendi":
            sayac["eklendi"] += 1
            print(f"  [OK ] {isim}")
        elif sonuc.startswith("ATLANDI"):
            sayac["hata"] += 1
            print(f"  [!! ] {isim}  -> {sonuc}")
        else:
            sayac["atlandi"] += 1
            print(f"  [-- ] {isim}  ({sonuc})")

    print("-" * 70)
    print(f"  eklendi: {sayac['eklendi']}   atlandi: {sayac['atlandi']}   hata: {sayac['hata']}")
    print("=" * 70)
    return 0 if sayac["hata"] == 0 else 2


if __name__ == "__main__":
    sys.exit(main())
