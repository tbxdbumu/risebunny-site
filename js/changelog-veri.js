/* RiseBunny — sürüm geçmişi.
   Kaynak: eski changelog.html'in `versions` dizisi (metinler birebir korundu)
   + MEE6 paritesi (v2.2.0) + tasarım/temizlik (v2.3.0) sürümleri.
   TR ve EN ayrı alanlarda; site dili neyse o okunur. */
window.RB_LOG = [
  {
    version: "v2.3.0",
    date: "2026-11-03",
    tag: "site",
    changes: {
      added: [
        "Docs yeniden yazıldı: 180 komut / 25 kategori, anlık arama, kategori filtresi, `/` kısayolu",
        "Arama Türkçe karakter duyarsız: \"cekilis\" yazınca çekiliş komutlarını bulur",
        "Bot durumu ana sayfada ve bot sayfasında gerçek /api/stats verisinden okunuyor",
        "Sürüm notları sayfası zaman çizelgesi olarak yeniden yazıldı",
        "Koyu tema: js/theme.js ile kalıcı tema seçimi, ilk boyamada titreme yok",
        "Panel artık site ile aynı token katmanından besleniyor"
      ],
      changed: [
        "Tasarım referans çizgisine çekildi: kapsül etiketler, bölüm numaraları ve glow efektleri kaldırıldı",
        "Kartlar bitişik ızgaraya döndü; hover'da zıplama/gölge yerine yalnızca zemin değişiyor",
        "Başlık, açıklama ve arama çubuğu aynı hizada; tipografi ölçeği sıkılaştırıldı",
        "Site ve panel tek marka kaynağına bağlandı (css/tokens.css + css/components.css)",
        "Alt bilgi sütunları netleşti: Ürün / Kaynak / Topluluk"
      ],
      fixed: [
        "TR/EN düğmesine basınca Discord giriş düğmesinde \"TR EN\" yazısı çıkması",
        "Bot sayfasındaki özellik kartlarının ve komut simülatörünün hiç çizilmemesi",
        "Her sayfanın başlığının ana sayfanınkiyle ezilmesi",
        "Docs sayfasının sol menüsünde iç kaydırma çubuğu çıkması",
        "Komut satırlarının aşırı seyrek olması: satırlar 65px'ten 39px'e indi",
        "Kategori emoji'lerinin boş kutu görünmesi (emoji yazı tipi eksikti)",
        "Alt bilgide \"Rubidium\" ve \"Rubidium Client\" satırlarının tekrarlanması",
        "Görseller: og.png 8,4 MB → 48 KB, toplam ~10,5 MB → ~173 KB"
      ]
    },
    en: {
      added: [
        "Docs rewritten: 180 commands across 25 categories with instant search, category filter and a `/` shortcut",
        "Accent-insensitive search: typing \"cekilis\" finds giveaway commands",
        "Bot status on the home and bot pages reads from real /api/stats data",
        "Changelog page rebuilt as a timeline",
        "Dark theme: persistent choice via js/theme.js, no flash on first paint",
        "The panel now draws from the same token layer as the site"
      ],
      changed: [
        "Design moved to a reference-led layout: capsule labels, section numbers and glow effects removed",
        "Cards sit in one joined grid; hover changes the surface instead of lifting and shadowing",
        "Title, lead and search bar share one alignment; type scale tightened",
        "Site and panel share a single brand source (css/tokens.css + css/components.css)",
        "Footer columns clarified: Product / Resources / Community"
      ],
      fixed: [
        "Clicking TR/EN printed \"TR EN\" inside the Discord login button",
        "Feature cards and the command simulator never rendered on the bot page",
        "Every page title was overwritten with the home page title",
        "Inner scrollbar inside the docs sidebar",
        "Command rows were far too sparse: 65px down to 39px",
        "Category emoji rendered as empty boxes (missing emoji font)",
        "Duplicate \"Rubidium\" and \"Rubidium Client\" footer rows",
        "Images: og.png 8.4 MB → 48 KB, ~10.5 MB → ~173 KB in total"
      ]
    }
  },
  {
    version: "v2.2.0",
    date: "2026-11-03",
    tag: "bot",
    changes: {
      added: [
        "Tepki rol: butonlu ve emojili paneller, tek/çok seçim",
        "Starboard: eşik, emoji ve senkron güncelleme",
        "Mesaj başına XP, rol ödülleri ve bekleme süresi",
        "Ticket transkripti: kapanışta otomatik HTML arşivi",
        "Embed gönder/düzenle paneli",
        "Otomasyon motoru: mesaj, katılım, ayrılma ve rol tetikleyicileri",
        "Geçici ses hub'ı: oda açılır, boşalınca silinir",
        "Sosyal bildirim: YouTube kanalı ve RSS akışı (varsayılan RSS, kotasız)",
        "Doğum günü kaydı ve canlı kanal sayacı",
        "8 yeni kategori: Rol Sistemi, Seviye & XP, Ticket & Transkript, Otomasyon, Ses, Duyuru & Sosyal, Doğum Günü, Sayaç"
      ],
      changed: [
        "Komut sayısı 165 → 180; kategori sayısı 17 → 25",
        "YouTube tarama kotası koruması: API yerine RSS varsayılan",
        "Yeni özellikler ses kanalı olmadan da kurulabiliyor",
        "Varsayılan bot dili İngilizce, sunucu bazında TR'ye çevrilebiliyor"
      ],
      fixed: [
        "YouTube tarama kotası: API anahtarı olmadan da çalışıyor",
        "Sosyal bildirimlerin sunucu yeniden başlatılınca kaybolması"
      ]
    },
    en: {
      added: [
        "Reaction roles: button and emoji panels, single/multi select",
        "Starboard: threshold, emoji and synced updates",
        "Per-message XP with role rewards and cooldown",
        "Ticket transcripts: automatic HTML archive on close",
        "Embed post/edit panel",
        "Automation engine: message, join, leave and role triggers",
        "Temporary voice hub: room created on join, deleted when empty",
        "Social notifications: YouTube channels and RSS feeds (RSS by default, no quota)",
        "Birthday registration and a live channel counter",
        "8 new categories: Roles, Levels & XP, Tickets & Transcripts, Automations, Voice, Announcements & Social, Birthdays, Counter"
      ],
      changed: [
        "Command count 165 → 180; categories 17 → 25",
        "YouTube polling quota guard: RSS is now the default over the API",
        "New features can be set up without a voice channel",
        "Default bot language is English; each server can switch to Turkish"
      ],
      fixed: [
        "YouTube polling quota: works without an API key",
        "Social subscriptions being lost on restart"
      ]
    }
  },
  {
    version: "v2.1.1",
    date: "2026-09-15",
    changes: {
      added: [
        "Kupon silme select menüsü düzeltildi (yerel collector ile)",
        "İlk kullanım dil seçimi + veri işleme onayı akışı eklendi",
        "Onay veren kullanıcıya docs linkli karşılama DM'i",
        "r!dil komutu artık onay panelini gösteriyor",
        "Docs sayfası: 169 komut 18 kategoride, TR/EN detaylı tablolar",
        "Changelog sayfası eklendi (changelog.html)",
        "Veri silme talebi sistemi (site+bot, modlog, onay/ret, DM)"
      ],
      changed: [
        "Kupon sistemi: bitis onarımı + migrateKuponFlags() eklendi",
        "Seviye sistemi: sadece komutla XP, kolay level-up formülü",
        "Forum: tasarım iyileştirmeleri, staff panel gelişmeleri"
      ],
      fixed: [
        "Eski kuponların bitis alanı bozukluğu (süre-miktarı yazıyordu)",
        "Global usedCoupons bayrağı kişiye özel sisteme çevrildi",
        "Select menü çakışmaları collector guard ile engellendi"
      ]
    },
    en: {
      added: [
        "Fixed the coupon deletion select menu (local collector)",
        "First-run language picker and data processing consent flow",
        "Welcome DM with docs link after consent",
        "r!dil now opens the consent panel",
        "Docs page: 169 commands in 18 categories, detailed TR/EN tables",
        "Added the changelog page (changelog.html)",
        "Data deletion request system (site + bot, modlog, approve/reject, DM)"
      ],
      changed: [
        "Coupon system: expiry repair plus migrateKuponFlags()",
        "Level system: XP only from commands, simpler level-up formula",
        "Forum: design polish and staff panel improvements"
      ],
      fixed: [
        "Broken expiry field on legacy coupons (duration was written as amount)",
        "Global usedCoupons flag replaced with per-user state",
        "Select menu collisions guarded with a collector"
      ]
    }
  },
  {
    version: "v2.1.0",
    date: "2026-09-10",
    changes: {
      added: [
        "Pet sistemi 2.0: butonlu al/sat paneli, ±%10 kar/zarar",
        "r!petlerim embed listesi",
        "r!yedek / r!yedek-yükle tam yedek sistemi",
        "r!bakım butonlu panel (bot + site bakımı)",
        "r!mağaza-yönet: fiyat değiştir / göster-gizle",
        "r!kupon butonlu panel (para/pet/premium, süreli/süresiz, bot/site/ikisi)",
        "r!kodoluştur v2: RISE-V2 kalıcı kupon (250K, tek seferlik)",
        "r!hatırlat: premium hatırlatıcı, restart-safe",
        "r!siterol: yetkili çoklu rol verme + DM + log",
        "r!dil: doküman + gizlilik + şartlar + onay butonları",
        "r!yardım V2.0 duyurusu + kupon/davet/destek butonları",
        "Sahip kategorisi (sadece sahibine görünür)",
        "Forum güncellemeleri: loglar, moderasyon butonları, yedekleme"
      ],
      changed: [
        "Seviye ödülleri büyütüldü",
        "XP kazanımı sadece komutla"
      ]
    },
    en: {
      added: [
        "Pets 2.0: button buy/sell panel with ±10% gain/loss",
        "r!petlerim embed list",
        "r!yedek / r!yedek-yükle full backup system",
        "r!bakım button panel (bot + site maintenance)",
        "r!mağaza-yönet: change price / show-hide",
        "r!kupon button panel (money/pets/premium, timed/untimed, bot/site/both)",
        "r!kodoluştur v2: RISE-V2 permanent coupon (250K, single use)",
        "r!hatırlat: premium reminders, restart-safe",
        "r!siterol: multi-role grant + DM + log",
        "r!dil: docs + privacy + terms with consent buttons",
        "r!yardım V2.0 announcement with coupon/invite/support buttons",
        "Owner category (visible to the owner only)",
        "Forum updates: logs, moderation buttons, backups"
      ],
      changed: [
        "Level rewards increased",
        "XP is earned from commands only"
      ]
    }
  },
  {
    version: "v2.0.0",
    date: "2026-09-01",
    changes: {
      added: [
        "RiseBunny V2.0 tamamen yeniden yazıldı",
        "Discord.js v14 + croxydb modern yapı",
        "Site: Firebase Auth + Firestore entegrasyonu",
        "Forum: Discord ile giriş, rol hiyerarşisi, moderasyon",
        "Admin paneli: 12 sekme, tam yönetim",
        "Ekonomi: banka, IBAN, meslek, piyango, faiz, envanter",
        "Pet sistemi: 6 pet türü, pazar, satış simülasyonu",
        "Premium: 5 sistem, günlük bonus, koruma, petler",
        "Koruma: raid, spam, reklam, küfür, kanal/rol/ban koruma",
        "Kayıt: AI destekli + manuel, hoşgeldin, isim log",
        "Davet: rütbeler, bonus, rol ödülleri, sıralama",
        "Ticket, çekiliş, anket, logo, sohbet, Minecraft skin",
        "Çok dilli: TR/EN, sunucu dili, dil paneli"
      ]
    },
    en: {
      added: [
        "RiseBunny V2.0 fully rewritten",
        "Modern Discord.js v14 + croxydb structure",
        "Site: Firebase Auth + Firestore integration",
        "Forum: Discord login, role hierarchy, moderation",
        "Admin panel: 12 tabs, full management",
        "Economy: bank, IBAN, jobs, lottery, interest, inventory",
        "Pets: 6 species, market, sale simulation",
        "Premium: 5 systems, daily bonus, protection, pets",
        "Protection: raid, spam, ads, swearing, channel/role/ban guards",
        "Registration: AI-assisted and manual, welcome, name log",
        "Invites: ranks, bonus, role rewards, leaderboard",
        "Tickets, giveaways, polls, logo, chat, Minecraft skin",
        "Multi-language: TR/EN, server language, language panel"
      ]
    }
  }
];
