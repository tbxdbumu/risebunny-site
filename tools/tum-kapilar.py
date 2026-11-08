#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Site (rb-fixed) saglik kontrolu — TUM kapilari sirayla calistir.

KAPILAR
-------
  1) sozdizimi   node --check  (tum api/*.js + lib/*.js + tools/*.js)
  2) yapilandirma vercel.json JSON gecerli mi + /api/rank rotasi var mi
  3) https       tools/test-https.js        (7 olcum)
  4) cerez       tools/test-cerez.js        (5 olcum)
  5) rank akisi  tools/test-rank-akis.js   (15 olcum)
  6) gizlilik    api/rank cevabinda discord_id YOK

CIKIS: 0 = hepsi yesil, 2 = en az bir kapi kirik.

KULLANIM
--------
    python tools\\tum-kapilar.py
"""

import json
import subprocess
import sys
from pathlib import Path

KOK = Path(__file__).resolve().parent.parent


def calistir(ad: str, komut: list) -> tuple:
    """Komutu calistir, (basarili, cikti) dondur."""
    try:
        r = subprocess.run(
            komut,
            cwd=str(KOK),
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            shell=("node" in komut[0] or komut[0] in ("node.exe", "npx")),
            timeout=180,
        )
        return r.returncode == 0, (r.stdout or "") + (r.stderr or "")
    except Exception as e:  # noqa: BLE001
        return False, f"calistirilamadi: {e}"


def kapi_sozdizimi() -> bool:
    print("\n" + "=" * 70)
    print(" KAPI 1/6  sozdizimi (node --check)")
    print("=" * 70)
    dosyalar = []
    for klasor in ("api", "lib", "tools"):
        p = KOK / klasor
        if p.exists():
            dosyalar.extend(sorted(p.rglob("*.js")))
    # test-*.js ve vercel.json arac degil; _*.js yardimci. Hepsi gecerli olmali.
    bozuk = 0
    for d in dosyalar:
        ok, cikti = calistir(d.name, ["node", "--check", str(d)])
        ad = str(d.relative_to(KOK))
        if ok:
            print(f"  OK     {ad}")
        else:
            bozuk += 1
            print(f"  BOZUK  {ad}")
            for satir in cikti.strip().splitlines()[:4]:
                print(f"         {satir}")
    print(f"  -> {len(dosyalar) - bozuk}/{len(dosyalar)} gecerli")
    return bozuk == 0


def kapi_yapilandirma() -> bool:
    print("\n" + "=" * 70)
    print(" KAPI 2/6  vercel.json")
    print("=" * 70)
    yol = KOK / "vercel.json"
    if not yol.exists():
        print("  KIRIK  vercel.json yok")
        return False
    try:
        j = json.loads(yol.read_text(encoding="utf-8"))
    except Exception as e:  # noqa: BLE001
        print(f"  KIRIK  JSON gecersiz: {e}")
        return False
    print("  OK     JSON gecerli")

    hepsi_ok = True

    kaynaklar = [r.get("source") for r in j.get("rewrites", [])]
    for gerekli in ("/api/rank", "/api/launcher/token", "/api/launcher/device"):
        if gerekli in kaynaklar:
            print(f"  OK     rewrite var: {gerekli}")
        else:
            print(f"  KIRIK  rewrite YOK: {gerekli}  -> 404 doner")
            hepsi_ok = False

    yonlendirme = j.get("redirects", [])
    https_var = any(
        "x-forwarded-proto" in json.dumps(r) and str(r.get("destination", "")).startswith("https://")
        for r in yonlendirme
    )
    if https_var:
        print("  OK     http -> https yonlendirmesi var")
    else:
        print("  KIRIK  http -> https yonlendirmesi YOK")
        hepsi_ok = False

    basliklar = json.dumps(j.get("headers", []))
    if "Strict-Transport-Security" in basliklar:
        print("  OK     HSTS basligi var")
    else:
        print("  KIRIK  HSTS basligi YOK")
        hepsi_ok = False

    return hepsi_ok


def kapi_betik(ad: str, dosya: str) -> bool:
    print("\n" + "=" * 70)
    print(f" {ad}")
    print("=" * 70)
    ok, cikti = calistir(dosya, ["node", str(KOK / "tools" / dosya)])
    for satir in cikti.rstrip().splitlines():
        # Baslik cercevelerini tekrar basmayalim
        if set(satir.strip()) <= {"="} or set(satir.strip()) <= {"-"}:
            continue
        if satir.startswith(("KAPI:", "KAPI ")):
            continue
        print(f"  {satir}")
    return ok


def kapi_gizlilik() -> bool:
    print("\n" + "=" * 70)
    print(" KAPI 6/6  gizlilik: cevapta discord_id yok")
    print("=" * 70)
    yol = KOK / "api" / "rank" / "index.js"
    if not yol.exists():
        print("  KIRIK  api/rank/index.js yok")
        return False
    s = yol.read_text(encoding="utf-8")
    # Yalnizca YORUM degil, gercek alan uretimi ariyoruz.
    import re

    alan = re.search(r"^\s*discord_id\s*:", s, re.M)
    if alan:
        print("  KIRIK  cevap nesnesinde discord_id URETILIYOR")
        return False
    print("  OK     discord_id alani uretilmiyor")

    # Bearer dogrulamasi var mi?
    if "launcherTokeniDogrula" in s and "timingSafeEqual" in s:
        print("  OK     launcher tokeni timing-safe dogrulaniyor")
    else:
        print("  KIRIK  launcher tokeni dogrulamasi eksik")
        return False
    return True


def main() -> int:
    print("=" * 70)
    print(" RB-FIXED (site) SAGLIK KONTROLU")
    print("=" * 70)
    print(f"  kok: {KOK}")

    sonuclar = {}
    sonuclar["sozdizimi"] = kapi_sozdizimi()
    sonuclar["yapilandirma"] = kapi_yapilandirma()
    sonuclar["https"] = kapi_betik("KAPI 3/6  HTTPS zorunlulugu", "test-https.js")
    sonuclar["cerez"] = kapi_betik("KAPI 4/6  oturum cookie'si", "test-cerez.js")
    sonuclar["rank akisi"] = kapi_betik("KAPI 5/6  rank akisi (bot -> site -> launcher)", "test-rank-akis.js")
    sonuclar["gizlilik"] = kapi_gizlilik()

    print("\n" + "=" * 70)
    print(" OZET")
    print("=" * 70)
    for ad, ok in sonuclar.items():
        print(f"  {ad:16s} {'YESIL' if ok else 'KIRMIZI'}")

    hepsi = all(sonuclar.values())
    print()
    if hepsi:
        print("  Hepsi YESIL.")
        return 0
    kirik = [a for a, v in sonuclar.items() if not v]
    print(f"  KIRMIZI: {', '.join(kirik)}")
    return 2


if __name__ == "__main__":
    sys.exit(main())
