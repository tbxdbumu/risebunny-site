/* RiseBunny — komut referansı verisi.
   Kaynak: eski docs.html + MEE6 paritesi kategorileri.
   İki dilli: her komutun tr/en açıklaması ve kullanımı var. */
window.RB_DOCS = {
 "surum": 2,
 "toplam": 180,
 "kategoriler": [
  {
   "id": "user",
   "emoji": "👤",
   "tr": "Kullanıcı",
   "en": "User",
   "komutlar": [
    {
     "komut": [
      "r!afk"
     ],
     "tr": "AFK moduna girer.",
     "en": "Sets you as AFK.",
     "kullanimTr": "r!afk <sebep>",
     "kullanimEn": "r!afk <reason>"
    },
    {
     "komut": [
      "r!pp"
     ],
     "tr": "Avatarını gösterir.",
     "en": "Shows the avatar.",
     "kullanimTr": "r!pp [@kullanıcı]",
     "kullanimEn": "r!avatar [@user]"
    },
    {
     "komut": [
      "r!emojiler"
     ],
     "tr": "Sunucudaki emojileri listeler.",
     "en": "Lists the server emojis.",
     "kullanimTr": "",
     "kullanimEn": ""
    },
    {
     "komut": [
      "r!kullanıcibilgi"
     ],
     "tr": "Kullanıcı bilgisini gösterir.",
     "en": "Shows user info.",
     "kullanimTr": "r!kullanıcibilgi [@kullanıcı]",
     "kullanimEn": "r!userinfo [@user]"
    },
    {
     "komut": [
      "r!mc-skin"
     ],
     "tr": "Minecraft kostümünü gösterir.",
     "en": "Shows a Minecraft skin.",
     "kullanimTr": "r!mc-skin <oyuncu>",
     "kullanimEn": "r!mc-skin <player>"
    },
    {
     "komut": [
      "r!randompp"
     ],
     "tr": "Rastgele profil gösterir.",
     "en": "Shows a random avatar.",
     "kullanimTr": "",
     "kullanimEn": ""
    },
    {
     "komut": [
      "r!snipe"
     ],
     "tr": "Son silinen mesajı gösterir.",
     "en": "Shows the last deleted message.",
     "kullanimTr": "",
     "kullanimEn": ""
    },
    {
     "komut": [
      "r!sonmesaj"
     ],
     "tr": "Son mesajı gösterir.",
     "en": "Shows the last message.",
     "kullanimTr": "",
     "kullanimEn": ""
    },
    {
     "komut": [
      "r!not"
     ],
     "tr": "Kişisel not defteri.",
     "en": "Personal notes.",
     "kullanimTr": "r!not ekle <metin> | liste | sil <no> | temizle",
     "kullanimEn": "r!note add <text> | list | delete <no> | clear"
    }
   ]
  },
  {
   "id": "moderation",
   "emoji": "🛡️",
   "tr": "Moderasyon",
   "en": "Moderation",
   "komutlar": [
    {
     "komut": [
      "r!ban"
     ],
     "tr": "Belirtilen kullanıcıyı yasaklar.",
     "en": "Bans the mentioned user.",
     "kullanimTr": "r!ban @kullanıcı [sebep]",
     "kullanimEn": "r!ban @user [reason]"
    },
    {
     "komut": [
      "r!bansay"
     ],
     "tr": "Yasaklı üye sayısını gösterir.",
     "en": "Shows the banned member count.",
     "kullanimTr": "",
     "kullanimEn": ""
    },
    {
     "komut": [
      "r!kick"
     ],
     "tr": "Kullanıcıyı sunucudan atar (onaylı).",
     "en": "Kicks a user (with confirm).",
     "kullanimTr": "r!kick @kullanıcı",
     "kullanimEn": "r!kick @user"
    },
    {
     "komut": [
      "r!mod-log"
     ],
     "tr": "Mod-log kanalını ayarlar.",
     "en": "Sets the mod-log channel.",
     "kullanimTr": "r!mod-log #kanal",
     "kullanimEn": "r!mod-log #channel"
    },
    {
     "komut": [
      "r!mute"
     ],
     "tr": "Kullanıcıyı süreli susturur.",
     "en": "Mutes a user for a while.",
     "kullanimTr": "r!mute @kullanıcı 10m [sebep]",
     "kullanimEn": "r!mute @user 10m [reason]"
    },
    {
     "komut": [
      "r!sil"
     ],
     "tr": "Mesajları siler.",
     "en": "Deletes messages.",
     "kullanimTr": "r!sil <1-100>",
     "kullanimEn": "r!clear <1-100>"
    },
    {
     "komut": [
      "r!sunucukur"
     ],
     "tr": "Sunucuyu kurar.",
     "en": "Sets up the server.",
     "kullanimTr": "",
     "kullanimEn": ""
    },
    {
     "komut": [
      "r!engelle"
     ],
     "tr": "Komutları sunucuda veya kanalda engeller. (Premium + Yönetici)",
     "en": "Blocks commands server-wide or in a channel. (Premium + Administrator)",
     "kullanimTr": "r!engelle | engelle aç | engelle kapat | engelle durum",
     "kullanimEn": "r!block-commands | block-commands aç | block-commands kapat | block-commands durum"
    },
    {
     "komut": [
      "r!unbanall"
     ],
     "tr": "Tüm yasakları kaldırır.",
     "en": "Unbans everyone.",
     "kullanimTr": "",
     "kullanimEn": ""
    },
    {
     "komut": [
      "r!uyarı"
     ],
     "tr": "Kullanıcıyı uyarır.",
     "en": "Warns a user.",
     "kullanimTr": "r!uyarı @kullanıcı [sebep]",
     "kullanimEn": "r!warn @user [reason]"
    },
    {
     "komut": [
      "r!isim-log"
     ],
     "tr": "İsim değişikliklerini loglar.",
     "en": "Logs nickname changes.",
     "kullanimTr": "r!isim-log #kanal | kapat",
     "kullanimEn": "r!nickname-log #channel | off"
    }
   ]
  },
  {
   "id": "register",
   "emoji": "📝",
   "tr": "Kayıt",
   "en": "Registration",
   "komutlar": [
    {
     "komut": [
      "r!alınacak-rol"
     ],
     "tr": "Kayıtta alınacak rolü ayarlar.",
     "en": "Sets the role taken on register.",
     "kullanimTr": "r!alınacak-rol @rol",
     "kullanimEn": "r!unregistered-role @role"
    },
    {
     "komut": [
      "r!erkek-rol"
     ],
     "tr": "Erkek rolünü ayarlar.",
     "en": "Sets the male role.",
     "kullanimTr": "r!erkek-rol @rol",
     "kullanimEn": "r!male-role @role"
    },
    {
     "komut": [
      "r!erkek"
     ],
     "tr": "Erkek olarak kayıt eder.",
     "en": "Registers as male.",
     "kullanimTr": "r!erkek @kullanıcı isim yaş",
     "kullanimEn": "r!register-male @user name age"
    },
    {
     "komut": [
      "r!kayıt-hg"
     ],
     "tr": "Kayıt hoşgeldin kanalını ayarlar.",
     "en": "Sets the register welcome channel.",
     "kullanimTr": "r!kayıt-hg #kanal",
     "kullanimEn": "r!register-welcome #channel"
    },
    {
     "komut": [
      "r!kayıt-kanal"
     ],
     "tr": "Kayıt kanalını ayarlar.",
     "en": "Sets the registration channel.",
     "kullanimTr": "r!kayıt-kanal #kanal",
     "kullanimEn": "r!register-channel #channel"
    },
    {
     "komut": [
      "r!kayıtçı-rol"
     ],
     "tr": "Kayıtçı rolünü ayarlar.",
     "en": "Sets the registrar role.",
     "kullanimTr": "r!kayıtçı-rol @rol",
     "kullanimEn": "r!registrar-role @role"
    },
    {
     "komut": [
      "r!kız-rol"
     ],
     "tr": "Kız rolünü ayarlar.",
     "en": "Sets the female role.",
     "kullanimTr": "r!kız-rol @rol",
     "kullanimEn": "r!female-role @role"
    },
    {
     "komut": [
      "r!kız"
     ],
     "tr": "Kız olarak kayıt eder.",
     "en": "Registers as female.",
     "kullanimTr": "r!kız @kullanıcı isim yaş",
     "kullanimEn": "r!register-female @user name age"
    }
   ]
  },
  {
   "id": "ai",
   "emoji": "🤖",
   "tr": "Yapay Zeka",
   "en": "AI",
   "komutlar": [
    {
     "komut": [
      "r!otomasyon"
     ],
     "tr": "Sunucuya özel AI eğitimi açar ve yönetir. (Premium + Yönetici)",
     "en": "Server-specific AI training. (Premium + Administrator)",
     "kullanimTr": "r!otomasyon | aç | öğret soru | cevap | kanal #x | ayar | durum | kapat | veri sil",
     "kullanimEn": "r!automation | on | teach question | answer | channel #x | settings | status | off | veri sil"
    },
    {
     "komut": [
      "r!y-kayıt-erkek"
     ],
     "tr": "YZ ile erkek kaydı yapar.",
     "en": "AI male registration setup.",
     "kullanimTr": "r!y-kayıt-erkek @rol",
     "kullanimEn": "r!ai-register-male @role"
    },
    {
     "komut": [
      "r!y-kayıt-kadın"
     ],
     "tr": "YZ ile kadın kaydı yapar.",
     "en": "AI female registration setup.",
     "kullanimTr": "r!y-kayıt-kadın @rol",
     "kullanimEn": "r!ai-register-female @role"
    },
    {
     "komut": [
      "r!ykayıt-kanal"
     ],
     "tr": "YZ kayıt kanalını ayarlar.",
     "en": "Sets the AI register channel.",
     "kullanimTr": "r!ykayıt-kanal #kanal",
     "kullanimEn": "r!ai-register-channel #channel"
    },
    {
     "komut": [
      "r!ykayıt-kapat"
     ],
     "tr": "YZ kaydı kapatır.",
     "en": "Closes AI registration.",
     "kullanimTr": "",
     "kullanimEn": ""
    },
    {
     "komut": [
      "r!ykayıt-sistem"
     ],
     "tr": "YZ kayıt menüsünü gösterir.",
     "en": "Shows the AI register menu.",
     "kullanimTr": "",
     "kullanimEn": ""
    },
    {
     "komut": [
      "r!ykayıt-tag"
     ],
     "tr": "YZ kayıt tagını ayarlar.",
     "en": "Sets the AI register tag.",
     "kullanimTr": "r!ykayıt-tag <tag>",
     "kullanimEn": "r!ai-register-tag <tag>"
    },
    {
     "komut": [
      "r!ykayıt-kayıtsız"
     ],
     "tr": "YZ kayıtsız rolünü ayarlar.",
     "en": "Sets the AI unregistered role.",
     "kullanimTr": "r!ykayıt-kayıtsız @rol",
     "kullanimEn": "r!ai-register-unregistered @role"
    },
    {
     "komut": [
      "r!y-koruma"
     ],
     "tr": "YZ korumayı açar/kapatır.",
     "en": "Toggles AI protection.",
     "kullanimTr": "",
     "kullanimEn": ""
    },
    {
     "komut": [
      "r!y-otosistem"
     ],
     "tr": "YZ kayıt sistemini otomatik kurar.",
     "en": "Auto sets up AI registration.",
     "kullanimTr": "",
     "kullanimEn": ""
    },
    {
     "komut": [
      "r!çevir"
     ],
     "tr": "Metni başka dile çevirir.",
     "en": "Translates text to another language.",
     "kullanimTr": "r!çevir <hedef> <metin>",
     "kullanimEn": "r!translate <target> <text>"
    }
   ]
  },
  {
   "id": "protection",
   "emoji": "🔒",
   "tr": "Koruma",
   "en": "Protection",
   "komutlar": [
    {
     "komut": [
      "r!ban-koruma-sıfırla"
     ],
     "tr": "Ban korumayı sıfırlar.",
     "en": "Resets ban protection.",
     "kullanimTr": "",
     "kullanimEn": ""
    },
    {
     "komut": [
      "r!ban-koruma"
     ],
     "tr": "Ban korumayı açar.",
     "en": "Enables ban protection.",
     "kullanimTr": "r!ban-koruma #kanal",
     "kullanimEn": "r!ban-protection #channel"
    },
    {
     "komut": [
      "r!beyazliste"
     ],
     "tr": "Kullanıcıyı karalisteden çıkarır.",
     "en": "Removes a user from the blacklist.",
     "kullanimTr": "r!beyazliste <ID>",
     "kullanimEn": "r!whitelist <ID>"
    },
    {
     "komut": [
      "r!kanal-koruma-sıfırla"
     ],
     "tr": "Kanal korumayı sıfırlar.",
     "en": "Resets channel protection.",
     "kullanimTr": "",
     "kullanimEn": ""
    },
    {
     "komut": [
      "r!kanal-koruma"
     ],
     "tr": "Kanal korumayı açar.",
     "en": "Enables channel protection.",
     "kullanimTr": "r!kanal-koruma #kanal",
     "kullanimEn": "r!channel-protection #channel"
    },
    {
     "komut": [
      "r!karaliste-liste"
     ],
     "tr": "Karalisteyi gösterir.",
     "en": "Shows the blacklist.",
     "kullanimTr": "",
     "kullanimEn": ""
    },
    {
     "komut": [
      "r!karaliste"
     ],
     "tr": "Kullanıcıyı karalisteye alır.",
     "en": "Adds a user to the blacklist.",
     "kullanimTr": "r!karaliste <ID> [sebep]",
     "kullanimEn": "r!blacklist <ID> [reason]"
    },
    {
     "komut": [
      "r!koruma"
     ],
     "tr": "Premium korumayı açar/kapatır.",
     "en": "Toggles premium protection.",
     "kullanimTr": "r!koruma [kapat]",
     "kullanimEn": "r!protection [off]"
    },
    {
     "komut": [
      "r!küfürengel"
     ],
     "tr": "Küfür filtresini açar/kapatır.",
     "en": "Toggles the swear filter.",
     "kullanimTr": "",
     "kullanimEn": ""
    },
    {
     "komut": [
      "r!küfürlog"
     ],
     "tr": "Küfür log kanalını ayarlar.",
     "en": "Sets the swear log channel.",
     "kullanimTr": "r!küfürlog #kanal",
     "kullanimEn": "r!swear-log #channel"
    },
    {
     "komut": [
      "r!reklamengel"
     ],
     "tr": "Reklam filtresini açar/kapatır.",
     "en": "Toggles the ad filter.",
     "kullanimTr": "",
     "kullanimEn": ""
    },
    {
     "komut": [
      "r!reklamlog"
     ],
     "tr": "Reklam log kanalını ayarlar.",
     "en": "Sets the ad log channel.",
     "kullanimTr": "r!reklamlog #kanal",
     "kullanimEn": "r!ad-log #channel"
    },
    {
     "komut": [
      "r!rol-koruma-sıfırla"
     ],
     "tr": "Rol korumayı sıfırlar.",
     "en": "Resets role protection.",
     "kullanimTr": "",
     "kullanimEn": ""
    },
    {
     "komut": [
      "r!rol-koruma"
     ],
     "tr": "Rol korumayı açar.",
     "en": "Enables role protection.",
     "kullanimTr": "r!rol-koruma #kanal",
     "kullanimEn": "r!role-protection #channel"
    },
    {
     "komut": [
      "r!sa-as"
     ],
     "tr": "SA-AS sistemini açar/kapatır.",
     "en": "Toggles the greeting system.",
     "kullanimTr": "r!sa-as aç/kapat",
     "kullanimEn": "r!greeting on/off"
    },
    {
     "komut": [
      "r!spam-kapat"
     ],
     "tr": "Spam korumayı kapatır.",
     "en": "Disables spam protection.",
     "kullanimTr": "",
     "kullanimEn": ""
    },
    {
     "komut": [
      "r!spamkoruma"
     ],
     "tr": "Spam korumayı açar/kapatır.",
     "en": "Toggles spam protection.",
     "kullanimTr": "",
     "kullanimEn": ""
    },
    {
     "komut": [
      "r!raid-koruma"
     ],
     "tr": "Kısa sürede çok katılım olursa otomatik doğrulama ve koruma yapar.",
     "en": "Automatic verification and protection when many accounts join quickly.",
     "kullanimTr": "r!raid aç [eşik] [@rol] | raid kapat | raid",
     "kullanimEn": "r!raid on [threshold] [@role] | raid off | raid"
    },
    {
     "komut": [
      "r!raid"
     ],
     "tr": "Kısa sürede çok katılım olursa otomatik doğrulama ve koruma yapar.",
     "en": "Automatic verification and protection when many accounts join quickly.",
     "kullanimTr": "r!raid aç [eşik] [@rol] | raid kapat | raid",
     "kullanimEn": "r!raid on [threshold] [@role] | raid off | raid"
    }
   ]
  },
  {
   "id": "logo",
   "emoji": "🎨",
   "tr": "Logo",
   "en": "Logo",
   "komutlar": [
    {
     "komut": [
      "r!arrow"
     ],
     "tr": "Arrow logo yapar.",
     "en": "Makes an arrow logo.",
     "kullanimTr": "r!arrow <yazı>",
     "kullanimEn": "r!arrow-logo <text>"
    },
    {
     "komut": [
      "r!gold"
     ],
     "tr": "Gold logo yapar.",
     "en": "Makes a gold logo.",
     "kullanimTr": "r!gold <yazı>",
     "kullanimEn": "r!gold-logo <text>"
    },
    {
     "komut": [
      "r!graffiti"
     ],
     "tr": "Graffiti logo yapar.",
     "en": "Makes a graffiti logo.",
     "kullanimTr": "r!graffiti <yazı>",
     "kullanimEn": "r!graffiti-logo <text>"
    },
    {
     "komut": [
      "r!green"
     ],
     "tr": "Green logo yapar.",
     "en": "Makes a green logo.",
     "kullanimTr": "r!green <yazı>",
     "kullanimEn": "r!green-logo <text>"
    }
   ]
  },
  {
   "id": "giveaway",
   "emoji": "🎉",
   "tr": "Çekiliş",
   "en": "Giveaway",
   "komutlar": [
    {
     "komut": [
      "r!başlat"
     ],
     "tr": "Çekiliş başlatır.",
     "en": "Starts a giveaway.",
     "kullanimTr": "r!başlat #kanal <süre> <sayı> <ödül>",
     "kullanimEn": "r!giveaway-start #channel <time> <winners> <prize>"
    },
    {
     "komut": [
      "r!sonlandır"
     ],
     "tr": "Çekilişi bitirir.",
     "en": "Ends a giveaway.",
     "kullanimTr": "r!sonlandır <mesajID>",
     "kullanimEn": "r!giveaway-end <messageID>"
    },
    {
     "komut": [
      "r!reroll"
     ],
     "tr": "Çekilişi yeniden çeker.",
     "en": "Rerolls a giveaway.",
     "kullanimTr": "r!reroll <mesajID>",
     "kullanimEn": "r!giveaway-reroll <messageID>"
    },
    {
     "komut": [
      "r!çekiliş-şart"
     ],
     "tr": "Davet sayısı veya rol şartlı çekiliş.",
     "en": "Giveaway with invite/role requirement.",
     "kullanimTr": "r!çekiliş-şart #kanal <süre> <kazanan> <ödül> --davet <sayı> / --rol @rol",
     "kullanimEn": "r!giveaway-requirement #channel <time> <winners> <prize> --davet <count> / --rol @role"
    }
   ]
  },
  {
   "id": "ticket",
   "emoji": "🎫",
   "tr": "Ticket",
   "en": "Ticket",
   "komutlar": [
    {
     "komut": [
      "r!ticket"
     ],
     "tr": "Destek bileti açar.",
     "en": "Opens a support ticket.",
     "kullanimTr": "r!ticket <sebep> / ticket panel",
     "kullanimEn": "r!ticket <reason> / ticket panel"
    },
    {
     "komut": [
      "r!ticketayarla"
     ],
     "tr": "Ticket kanalını ayarlar.",
     "en": "Sets the ticket channel.",
     "kullanimTr": "r!ticketayarla #kanal",
     "kullanimEn": "r!ticket-setup #channel"
    }
   ]
  },
  {
   "id": "economy",
   "emoji": "💰",
   "tr": "Ekonomi",
   "en": "Economy",
   "komutlar": [
    {
     "komut": [
      "r!banka"
     ],
     "tr": "Banka bakiyeni gösterir.",
     "en": "Shows your bank balance.",
     "kullanimTr": "",
     "kullanimEn": ""
    },
    {
     "komut": [
      "r!çal"
     ],
     "tr": "Başka kullanıcıdan para çalar.",
     "en": "Steals money from a user.",
     "kullanimTr": "r!çal @kullanıcı",
     "kullanimEn": "r!steal @user"
    },
    {
     "komut": [
      "r!çalış"
     ],
     "tr": "Çalışıp para kazanırsın.",
     "en": "Work and earn money.",
     "kullanimTr": "",
     "kullanimEn": ""
    },
    {
     "komut": [
      "r!çek"
     ],
     "tr": "Bankadan para çeker.",
     "en": "Withdraws money from the bank.",
     "kullanimTr": "r!çek <miktar>",
     "kullanimEn": "r!withdraw <amount>"
    },
    {
     "komut": [
      "r!cf"
     ],
     "tr": "Yazı-tura oyunu.",
     "en": "Coin flip game.",
     "kullanimTr": "r!cf <miktar|all>",
     "kullanimEn": "r!coinflip <amount|all>"
    },
    {
     "komut": [
      "r!kasa-aç"
     ],
     "tr": "CS kasa açma simülasyonu.",
     "en": "CS case opening simulation.",
     "kullanimTr": "",
     "kullanimEn": ""
    },
    {
     "komut": [
      "r!günlük"
     ],
     "tr": "Günlük ödülünü alırsın.",
     "en": "Claims your daily reward.",
     "kullanimTr": "",
     "kullanimEn": ""
    },
    {
     "komut": [
      "r!gönder"
     ],
     "tr": "Kullanıcıya para gönderir.",
     "en": "Sends money to a user.",
     "kullanimTr": "r!gönder @kullanıcı <miktar>",
     "kullanimEn": "r!send-money @user <amount>"
    },
    {
     "komut": [
      "r!haftalık"
     ],
     "tr": "Haftalık ödülünü alırsın.",
     "en": "Claims your weekly reward.",
     "kullanimTr": "",
     "kullanimEn": ""
    },
    {
     "komut": [
      "r!iban"
     ],
     "tr": "IBAN oluşturur veya gösterir.",
     "en": "Creates or shows the IBAN.",
     "kullanimTr": "r!iban [@kullanıcı]",
     "kullanimEn": "r!iban [@user]"
    },
    {
     "komut": [
      "r!para"
     ],
     "tr": "Cüzdan ve banka bilgini gösterir.",
     "en": "Shows wallet and bank info.",
     "kullanimTr": "r!para [@kullanıcı]",
     "kullanimEn": "r!wallet [@user]"
    },
    {
     "komut": [
      "r!para-sıralama"
     ],
     "tr": "Para sıralamasını gösterir.",
     "en": "Shows the money leaderboard.",
     "kullanimTr": "",
     "kullanimEn": ""
    },
    {
     "komut": [
      "r!para-ekle"
     ],
     "tr": "Kullanıcıya para ekler. (Yetkili)",
     "en": "Adds money to a user. (Staff)",
     "kullanimTr": "r!para-ekle @kullanıcı <miktar>",
     "kullanimEn": "r!add-money @user <amount>"
    },
    {
     "komut": [
      "r!transfer"
     ],
     "tr": "IBAN'a para transfer eder.",
     "en": "Transfers money to an IBAN.",
     "kullanimTr": "r!transfer <iban> <miktar>",
     "kullanimEn": "r!transfer <iban> <amount>"
    },
    {
     "komut": [
      "r!param"
     ],
     "tr": "Para bakiyeni gösterir.",
     "en": "Shows your balance.",
     "kullanimTr": "",
     "kullanimEn": ""
    },
    {
     "komut": [
      "r!para-sil"
     ],
     "tr": "Kullanıcıdan para siler. (Yetkili)",
     "en": "Removes money from a user. (Staff)",
     "kullanimTr": "r!para-sil @kullanıcı <miktar>",
     "kullanimEn": "r!remove-money @user <amount>"
    },
    {
     "komut": [
      "r!pet"
     ],
     "tr": "Pet alır veya satar.",
     "en": "Buys or sells a pet.",
     "kullanimTr": "r!pet al <tür> / pet sat <no>",
     "kullanimEn": "r!pet buy <type> / pet sell <no>"
    },
    {
     "komut": [
      "r!petlerim"
     ],
     "tr": "Petlerini gösterir.",
     "en": "Shows your pets.",
     "kullanimTr": "r!petlerim [@kullanıcı]",
     "kullanimEn": "r!my-pets [@user]"
    },
    {
     "komut": [
      "r!soygun"
     ],
     "tr": "Soygun yapar.",
     "en": "Robs a user.",
     "kullanimTr": "r!soygun @kullanıcı",
     "kullanimEn": "r!heist @user"
    },
    {
     "komut": [
      "r!sürem"
     ],
     "tr": "VIP süreni gösterir.",
     "en": "Shows your VIP time left.",
     "kullanimTr": "",
     "kullanimEn": ""
    },
    {
     "komut": [
      "r!yatır"
     ],
     "tr": "Bankaya para yatırır.",
     "en": "Deposits money to the bank.",
     "kullanimTr": "r!yatır <miktar>",
     "kullanimEn": "r!deposit <amount>"
    },
    {
     "komut": [
      "r!günlük-ödül"
     ],
     "tr": "Art arda gün sayısına göre büyüyen günlük ödül.",
     "en": "Daily reward that grows with your streak.",
     "kullanimTr": "",
     "kullanimEn": ""
    },
    {
     "komut": [
      "r!market"
     ],
     "tr": "Kullanıcıların pet alıp sattığı pazar.",
     "en": "Marketplace to buy/sell pets.",
     "kullanimTr": "r!market liste | sat <petNo> <fiyat> | al <id> | iptal <id>",
     "kullanimEn": "r!market list | sell <petNo> <price> | buy <id> | cancel <id>"
    },
    {
     "komut": [
      "r!slot"
     ],
     "tr": "Slot makinesi oyunu.",
     "en": "Slot machine game.",
     "kullanimTr": "r!slot <miktar|all>",
     "kullanimEn": "r!slot <amount|all>"
    },
    {
     "komut": [
      "r!blackjack"
     ],
     "tr": "Blackjack (21) oyunu.",
     "en": "Blackjack (21) game.",
     "kullanimTr": "r!blackjack <miktar|all>",
     "kullanimEn": "r!blackjack <amount|all>"
    },
    {
     "komut": [
      "r!rulet"
     ],
     "tr": "Rulet oyunu.",
     "en": "Roulette game.",
     "kullanimTr": "r!rulet <miktar> <kırmızı/siyah/yeşil/sayı>",
     "kullanimEn": "r!roulette <amount> <red/black/green/number>"
    },
    {
     "komut": [
      "r!faiz"
     ],
     "tr": "Bankadaki parana günlük faiz.",
     "en": "Daily interest on your bank balance.",
     "kullanimTr": "",
     "kullanimEn": ""
    },
    {
     "komut": [
      "r!piyango"
     ],
     "tr": "Piyango bileti al ve havuzu kazan.",
     "en": "Buy a lottery ticket and win the pool.",
     "kullanimTr": "r!piyango [al | çek]",
     "kullanimEn": "r!lottery [buy | draw]"
    },
    {
     "komut": [
      "r!meslek"
     ],
     "tr": "Meslek seç ve çalışarak para kazan.",
     "en": "Choose a job and earn money.",
     "kullanimTr": "r!meslek [seç <meslek> | çalış]",
     "kullanimEn": "r!job [select <job> | work]"
    },
    {
     "komut": [
      "r!envanter"
     ],
     "tr": "Tüm eşyalarını ve istatistiklerini gösterir.",
     "en": "Shows all your items and stats.",
     "kullanimTr": "",
     "kullanimEn": ""
    },
    {
     "komut": [
      "r!kasa"
     ],
     "tr": "Çalınamayan kişisel kasa.",
     "en": "Personal vault that can't be stolen.",
     "kullanimTr": "r!kasa [yatır <miktar> | çek <miktar>]",
     "kullanimEn": "r!vault [deposit <amount> | withdraw <amount>]"
    }
   ]
  },
  {
   "id": "subscriber",
   "emoji": "⭐",
   "tr": "Abone",
   "en": "Subscriber",
   "komutlar": [
    {
     "komut": [
      "r!abone"
     ],
     "tr": "Abone rolü verir.",
     "en": "Gives the subscriber role.",
     "kullanimTr": "r!abone @kullanıcı",
     "kullanimEn": "r!subscribe @user"
    },
    {
     "komut": [
      "r!abonelog"
     ],
     "tr": "Abone log kanalını ayarlar.",
     "en": "Sets the subscriber log channel.",
     "kullanimTr": "r!abonelog #kanal",
     "kullanimEn": "r!subscribe-log #channel"
    },
    {
     "komut": [
      "r!abonerol"
     ],
     "tr": "Abone rolünü ayarlar.",
     "en": "Sets the subscriber role.",
     "kullanimTr": "r!abonerol @rol",
     "kullanimEn": "r!subscribe-role @role"
    },
    {
     "komut": [
      "r!abonerol-sistem"
     ],
     "tr": "Abone rol sistemi menüsünü gösterir.",
     "en": "Shows the subscriber system menu.",
     "kullanimTr": "",
     "kullanimEn": ""
    },
    {
     "komut": [
      "r!abone-yetkili"
     ],
     "tr": "Abone yetkilisi rolünü ayarlar.",
     "en": "Sets the subscriber staff role.",
     "kullanimTr": "r!abone-yetkili @rol",
     "kullanimEn": "r!subscribe-staff @role"
    }
   ]
  },
  {
   "id": "premium",
   "emoji": "💎",
   "tr": "Premium",
   "en": "Premium",
   "komutlar": [
    {
     "komut": [
      "r!premium-al"
     ],
     "tr": "Oyun parasıyla premium alır.",
     "en": "Buys premium with game coins.",
     "kullanimTr": "",
     "kullanimEn": ""
    },
    {
     "komut": [
      "r!premium"
     ],
     "tr": "Premium durumunu gösterir.",
     "en": "Shows premium status.",
     "kullanimTr": "",
     "kullanimEn": ""
    },
    {
     "komut": [
      "r!premium-sil"
     ],
     "tr": "Premiumu siler. (Sahip)",
     "en": "Removes premium. (Owner)",
     "kullanimTr": "r!premium-sil @kullanıcı",
     "kullanimEn": "r!remove-premium @user"
    },
    {
     "komut": [
      "r!premium-ver"
     ],
     "tr": "Premium verir. (Sahip)",
     "en": "Gives premium. (Owner)",
     "kullanimTr": "r!premium-ver @kullanıcı [gün]",
     "kullanimEn": "r!give-premium @user [days]"
    },
    {
     "komut": [
      "r!vip"
     ],
     "tr": "VIP süreni gösterir.",
     "en": "Shows your VIP time.",
     "kullanimTr": "",
     "kullanimEn": ""
    },
    {
     "komut": [
      "r!vipsistemler"
     ],
     "tr": "VIP sistemlerini listeler.",
     "en": "Lists VIP systems.",
     "kullanimTr": "",
     "kullanimEn": ""
    },
    {
     "komut": [
      "r!premium-panel"
     ],
     "tr": "Premium ayrıcalıklarını gösterir.",
     "en": "Shows premium perks.",
     "kullanimTr": "",
     "kullanimEn": ""
    },
    {
     "komut": [
      "r!günlük-bonus"
     ],
     "tr": "Premium üyelere özel günlük bonus.",
     "en": "Premium-only daily bonus.",
     "kullanimTr": "",
     "kullanimEn": ""
    }
   ]
  },
  {
   "id": "fun",
   "emoji": "🎮",
   "tr": "Eğlence",
   "en": "Fun",
   "komutlar": [
    {
     "komut": [
      "r!atatürk"
     ],
     "tr": "Atatürk resmi gönderir.",
     "en": "Sends an Atatürk picture.",
     "kullanimTr": "",
     "kullanimEn": ""
    },
    {
     "komut": [
      "r!espri"
     ],
     "tr": "Rastgele espri yapar.",
     "en": "Tells a random joke.",
     "kullanimTr": "",
     "kullanimEn": ""
    },
    {
     "komut": [
      "r!gif-animal"
     ],
     "tr": "Rastgele hayvan gifi gönderir.",
     "en": "Sends a random animal gif.",
     "kullanimTr": "",
     "kullanimEn": ""
    },
    {
     "komut": [
      "r!lafat"
     ],
     "tr": "Etiketlediğin kişiye kapak yapar.",
     "en": "Roasts the mentioned user.",
     "kullanimTr": "r!lafat @kullanıcı",
     "kullanimEn": "r!comeback @user"
    },
    {
     "komut": [
      "r!oylama"
     ],
     "tr": "Oylama başlatır.",
     "en": "Starts a poll.",
     "kullanimTr": "r!oylama <metin>",
     "kullanimEn": "r!poll <text>"
    },
    {
     "komut": [
      "r!tkm"
     ],
     "tr": "Taş-kağıt-makas oynar.",
     "en": "Plays rock-paper-scissors.",
     "kullanimTr": "r!tkm <taş/kağıt/makas>",
     "kullanimEn": "r!rps <rock/paper/scissors>"
    },
    {
     "komut": [
      "r!zarat"
     ],
     "tr": "Zar atar.",
     "en": "Rolls a dice.",
     "kullanimTr": "",
     "kullanimEn": ""
    },
    {
     "komut": [
      "r!anket-gelişmiş"
     ],
     "tr": "Butonlu/tepkili, süreli anket başlatır.",
     "en": "Starts a timed button/reaction poll.",
     "kullanimTr": "r!anket-gelişmiş <süre> <soru> | <seçenek1> | <seçenek2>",
     "kullanimEn": "r!advanced-poll <time> <question> | <option1> | <option2>"
    }
   ]
  },
  {
   "id": "invite",
   "emoji": "📨",
   "tr": "Davet",
   "en": "Invite",
   "komutlar": [
    {
     "komut": [
      "r!bonus-ekle"
     ],
     "tr": "Davet bonusu ekler.",
     "en": "Adds invite bonus.",
     "kullanimTr": "r!bonus-ekle @kullanıcı <sayı>",
     "kullanimEn": "r!add-bonus @user <count>"
    },
    {
     "komut": [
      "r!davet-kanal"
     ],
     "tr": "Davet kanalını ayarlar.",
     "en": "Sets the invite channel.",
     "kullanimTr": "r!davet-kanal #kanal",
     "kullanimEn": "r!invite-channel #channel"
    },
    {
     "komut": [
      "r!davet-kanal-sıfırla"
     ],
     "tr": "Davet kanalını sıfırlar.",
     "en": "Resets the invite channel.",
     "kullanimTr": "",
     "kullanimEn": ""
    },
    {
     "komut": [
      "r!davetleri-sıfırla"
     ],
     "tr": "Davetleri sıfırlar.",
     "en": "Resets invites.",
     "kullanimTr": "r!davetleri-sıfırla @kullanıcı",
     "kullanimEn": "r!reset-invites @user"
    },
    {
     "komut": [
      "r!davetlerim"
     ],
     "tr": "Davetlerini gösterir.",
     "en": "Shows your invites.",
     "kullanimTr": "",
     "kullanimEn": ""
    },
    {
     "komut": [
      "r!davet-rol"
     ],
     "tr": "Davet rol ödülü ekler.",
     "en": "Adds an invite role reward.",
     "kullanimTr": "r!davet-rol @rol <sayı>",
     "kullanimEn": "r!invite-role @role <count>"
    },
    {
     "komut": [
      "r!davet-sıfırla"
     ],
     "tr": "Davet rütbesini sıfırlar.",
     "en": "Resets the invite rank.",
     "kullanimTr": "",
     "kullanimEn": ""
    },
    {
     "komut": [
      "r!rütbeler"
     ],
     "tr": "Davet rütbelerini listeler.",
     "en": "Lists invite ranks.",
     "kullanimTr": "",
     "kullanimEn": ""
    },
    {
     "komut": [
      "r!davettop"
     ],
     "tr": "Davet sıralamasını gösterir.",
     "en": "Shows the invite leaderboard.",
     "kullanimTr": "",
     "kullanimEn": ""
    }
   ]
  },
  {
   "id": "general",
   "emoji": "🌐",
   "tr": "Genel",
   "en": "General",
   "komutlar": [
    {
     "komut": [
      "r!bug"
     ],
     "tr": "Bug bildirir; sahip kabul ederse 250.000 💸 kazanırsın.",
     "en": "Reports a bug; get 250,000 💸 if the owner accepts it.",
     "kullanimTr": "r!bug <açıklama>",
     "kullanimEn": "r!bug <description>"
    },
    {
     "komut": [
      "r!bilgisistemi"
     ],
     "tr": "Toplanan veriler, komutlar ve silme bilgisi.",
     "en": "Collected data, commands and deletion info.",
     "kullanimTr": "",
     "kullanimEn": ""
    },
    {
     "komut": [
      "r!davet"
     ],
     "tr": "Bot davet ve destek linkleri.",
     "en": "Bot invite and support links.",
     "kullanimTr": "",
     "kullanimEn": ""
    },
    {
     "komut": [
      "r!dil"
     ],
     "tr": "Bot dilini ayarlar.",
     "en": "Sets the bot language.",
     "kullanimTr": "r!dil <tr/en> | dil sunucu <tr/en>",
     "kullanimEn": "r!language <tr/en> | language server <tr/en>"
    },
    {
     "komut": [
      "r!hatırlat"
     ],
     "tr": "Premium hatırlatıcı: süre dolunca DM ile embed hatırlatır.",
     "en": "Premium reminder: DMs you an embed when time is up.",
     "kullanimTr": "r!hatırlat <süre> <metin> | liste | sil <no>",
     "kullanimEn": "r!remind <duration> <text> | list | delete <no>"
    },
    {
     "komut": [
      "r!giriş-çıkış-ayarla"
     ],
     "tr": "Giriş-çıkış kanalını ayarlar.",
     "en": "Sets the welcome channel.",
     "kullanimTr": "r!giriş-çıkış-ayarla #kanal",
     "kullanimEn": "r!welcome-set #channel"
    },
    {
     "komut": [
      "r!giriş-çıkış-kapat"
     ],
     "tr": "Giriş-çıkışı kapatır.",
     "en": "Disables welcome messages.",
     "kullanimTr": "",
     "kullanimEn": ""
    },
    {
     "komut": [
      "r!istatistik"
     ],
     "tr": "Bot istatistiklerini gösterir.",
     "en": "Shows bot statistics.",
     "kullanimTr": "",
     "kullanimEn": ""
    },
    {
     "komut": [
      "r!istek"
     ],
     "tr": "Kod isteği gönderir.",
     "en": "Sends a code request.",
     "kullanimTr": "r!istek <metin>",
     "kullanimEn": "r!request <text>"
    },
    {
     "komut": [
      "r!otorol-ayarla"
     ],
     "tr": "Otorolü ayarlar.",
     "en": "Sets the auto role.",
     "kullanimTr": "r!otorol-ayarla @rol #kanal",
     "kullanimEn": "r!autorole-set @role #channel"
    },
    {
     "komut": [
      "r!otorol-mesaj"
     ],
     "tr": "Otorol mesajını ayarlar.",
     "en": "Sets the auto role message.",
     "kullanimTr": "r!otorol-mesaj <metin>",
     "kullanimEn": "r!autorole-message <text>"
    },
    {
     "komut": [
      "r!otorol-mesaj-sıfırla"
     ],
     "tr": "Otorol mesajını sıfırlar.",
     "en": "Resets the auto role message.",
     "kullanimTr": "",
     "kullanimEn": ""
    },
    {
     "komut": [
      "r!otorol-kapat"
     ],
     "tr": "Otorolü kapatır.",
     "en": "Disables auto role.",
     "kullanimTr": "",
     "kullanimEn": ""
    },
    {
     "komut": [
      "r!ping"
     ],
     "tr": "Bot gecikmesini gösterir.",
     "en": "Shows the bot latency.",
     "kullanimTr": "",
     "kullanimEn": ""
    },
    {
     "komut": [
      "r!say"
     ],
     "tr": "Sunucu bilgilerini gösterir.",
     "en": "Shows server info.",
     "kullanimTr": "",
     "kullanimEn": ""
    },
    {
     "komut": [
      "r!shard"
     ],
     "tr": "Shard bilgisini gösterir.",
     "en": "Shows shard info.",
     "kullanimTr": "",
     "kullanimEn": ""
    },
    {
     "komut": [
      "r!sunuculara"
     ],
     "tr": "Bot davet linkini gösterir.",
     "en": "Shows the bot invite link.",
     "kullanimTr": "",
     "kullanimEn": ""
    },
    {
     "komut": [
      "r!sürelirol"
     ],
     "tr": "Süreli rol verir.",
     "en": "Gives a temporary role.",
     "kullanimTr": "r!sürelirol @kullanıcı @rol <süre>",
     "kullanimEn": "r!temp-role @user @role <time>"
    },
    {
     "komut": [
      "r!komutlar"
     ],
     "tr": "Toplam komut sayısını gösterir.",
     "en": "Shows the total command count.",
     "kullanimTr": "",
     "kullanimEn": ""
    },
    {
     "komut": [
      "r!yardım"
     ],
     "tr": "Yardım menüsünü gösterir.",
     "en": "Shows the help menu.",
     "kullanimTr": "r!yardım [kategori]",
     "kullanimEn": "r!help [category]"
    },
    {
     "komut": [
      "r!öneri"
     ],
     "tr": "Öneri gönderir.",
     "en": "Sends a suggestion.",
     "kullanimTr": "r!öneri <metin>",
     "kullanimEn": "r!suggest <text>"
    },
    {
     "komut": [
      "r!üyedurum"
     ],
     "tr": "Üye sayısını gösterir.",
     "en": "Shows the member count.",
     "kullanimTr": "",
     "kullanimEn": ""
    }
   ]
  },
  {
   "id": "chat",
   "emoji": "💬",
   "tr": "Sohbet",
   "en": "Chat",
   "komutlar": [
    {
     "komut": [
      "r!sohbet-aç"
     ],
     "tr": "Sohbeti açar.",
     "en": "Opens the chat.",
     "kullanimTr": "",
     "kullanimEn": ""
    },
    {
     "komut": [
      "r!sohbet-kapat"
     ],
     "tr": "Sohbeti kapatır.",
     "en": "Closes the chat.",
     "kullanimTr": "",
     "kullanimEn": ""
    }
   ]
  },
  {
   "id": "website",
   "emoji": "🔗",
   "tr": "Site",
   "en": "Website",
   "komutlar": [
    {
     "komut": [
      "r!kuponkullan"
     ],
     "tr": "Kupon kodunu kullanır.",
     "en": "Redeems a coupon code.",
     "kullanimTr": "r!kuponkullan <kod>",
     "kullanimEn": "r!redeem-coupon <code>"
    },
    {
     "komut": [
      "r!rolal"
     ],
     "tr": "Seviye 25+ ise hedef sunucuda VIP rolünü alır.",
     "en": "Claims the VIP role on the target server (level 25+).",
     "kullanimTr": "",
     "kullanimEn": ""
    },
    {
     "komut": [
      "r!seviye"
     ],
     "tr": "Seviyeni ve XP kartını gösterir.",
     "en": "Shows your level and XP card.",
     "kullanimTr": "r!seviye [@kullanıcı]",
     "kullanimEn": "r!level [@user]"
    },
    {
     "komut": [
      "r!seviye-ödül"
     ],
     "tr": "Seviye ödüllerini listeler ve rol ödülü tanımlar.",
     "en": "Lists level rewards and sets role rewards.",
     "kullanimTr": "r!seviye-ödül [liste|rol <seviye> @rol|sil <seviye>]",
     "kullanimEn": "r!level-reward [list|role <level> @role|delete <level>]"
    },
    {
     "komut": [
      "r!seviye-sıralama"
     ],
     "tr": "En yüksek levelli 10 kullanıcıyı resimli gösterir.",
     "en": "Shows the top 10 users by level (image).",
     "kullanimTr": "",
     "kullanimEn": ""
    }
   ]
  },
  {
   "id": "help",
   "emoji": "❓",
   "tr": "Yardım",
   "en": "Help",
   "komutlar": [
    {
     "komut": [
      "r!ekonomi"
     ],
     "tr": "Ekonomi yardım menüsü.",
     "en": "Economy help menu.",
     "kullanimTr": "",
     "kullanimEn": ""
    },
    {
     "komut": [
      "r!kayıtsistemi"
     ],
     "tr": "Kayıt yardım menüsü.",
     "en": "Registration help menu.",
     "kullanimTr": "",
     "kullanimEn": ""
    },
    {
     "komut": [
      "r!korumasistemi"
     ],
     "tr": "Koruma yardım menüsü.",
     "en": "Protection help menu.",
     "kullanimTr": "",
     "kullanimEn": ""
    },
    {
     "komut": [
      "r!kullanıcı"
     ],
     "tr": "Kullanıcı yardım menüsü.",
     "en": "User help menu.",
     "kullanimTr": "",
     "kullanimEn": ""
    },
    {
     "komut": [
      "r!logosistemi"
     ],
     "tr": "Logo yardım menüsü.",
     "en": "Logo help menu.",
     "kullanimTr": "",
     "kullanimEn": ""
    },
    {
     "komut": [
      "r!moderasyon"
     ],
     "tr": "Moderasyon yardım menüsü.",
     "en": "Moderation help menu.",
     "kullanimTr": "",
     "kullanimEn": ""
    },
    {
     "komut": [
      "r!çekilişsistemi"
     ],
     "tr": "Çekiliş yardım menüsü.",
     "en": "Giveaway help menu.",
     "kullanimTr": "",
     "kullanimEn": ""
    }
   ]
  },
  {
   "id": "mee6-roles",
   "emoji": "🎭",
   "tr": "Rol Sistemi",
   "en": "Roles",
   "yeni": true,
   "komutlar": [
    {
     "komut": [
      "r!tepkirol"
     ],
     "tr": "Buton veya emoji tepkili rol paneli kurar. Tek veya çok seçim destekler.",
     "en": "Sets up a button or emoji reaction role panel. Single or multi-select.",
     "kullanimTr": "r!tepkirol [#kanal]",
     "kullanimEn": "r!tepkirol [#channel]"
    },
    {
     "komut": [
      "r!toplurol"
     ],
     "tr": "Toplu rol verir veya kaldırır; onay butonlu, kalabalık sunucularda parça parça işler.",
     "en": "Bulk assigns or removes a role with a confirmation button, chunked for large servers.",
     "kullanimTr": "r!toplurol @rol ver|kaldır",
     "kullanimEn": "r!toplurol @role add|remove"
    },
    {
     "komut": [
      "r!otorol-ayarla"
     ],
     "tr": "Yeni gelen üyeye verilecek otomatik rolleri ayarlar; birden fazla rol destekler.",
     "en": "Sets auto-roles for new members; multiple roles supported.",
     "kullanimTr": "r!otorol-ayarla @rol1 @rol2",
     "kullanimEn": "r!otorol-ayarla @role1 @role2"
    },
    {
     "komut": [
      "r!starboard"
     ],
     "tr": "Yıldız kanalını, eşiği ve emojiyi ayarlar; oylar düşünce gönderi senkron güncellenir.",
     "en": "Configures the star channel, threshold and emoji; posts stay in sync when stars drop.",
     "kullanimTr": "r!starboard [#kanal] [eşik]",
     "kullanimEn": "r!starboard [#channel] [threshold]"
    }
   ]
  },
  {
   "id": "mee6-levels",
   "emoji": "📈",
   "tr": "Seviye & XP",
   "en": "Levels & XP",
   "yeni": true,
   "komutlar": [
    {
     "komut": [
      "r!seviye-ayar"
     ],
     "tr": "Mesaj XP'sini açar/kapatır, rol ödüllerini ve bekleme süresini ayarlar.",
     "en": "Toggles message XP, configures role rewards and cooldown.",
     "kullanimTr": "r!seviye-ayar",
     "kullanimEn": "r!seviye-ayar"
    },
    {
     "komut": [
      "r!level-top"
     ],
     "tr": "Sunucunun XP sıralamasını gösterir.",
     "en": "Shows the server XP leaderboard.",
     "kullanimTr": "r!level-top",
     "kullanimEn": "r!level-top"
    }
   ]
  },
  {
   "id": "mee6-ticket",
   "emoji": "🎟️",
   "tr": "Ticket & Transkript",
   "en": "Tickets & Transcripts",
   "yeni": true,
   "komutlar": [
    {
     "komut": [
      "r!ticketayarla"
     ],
     "tr": "Ticket kanalını ayarlar ve destek panelini gönderir.",
     "en": "Sets the ticket channel and posts the support panel.",
     "kullanimTr": "r!ticketayarla #kanal",
     "kullanimEn": "r!ticketayarla #channel"
    },
    {
     "komut": [
      "r!ticket-transcript"
     ],
     "tr": "Arşiv kanalını ve kapanışta otomatik HTML transkript almayı ayarlar.",
     "en": "Configures the archive channel and automatic HTML transcripts on close.",
     "kullanimTr": "r!ticket-transcript #kanal",
     "kullanimEn": "r!ticket-transcript #channel"
    }
   ]
  },
  {
   "id": "mee6-auto",
   "emoji": "⚙️",
   "tr": "Otomasyon",
   "en": "Automations",
   "yeni": true,
   "komutlar": [
    {
     "komut": [
      "r!otomasyon"
     ],
     "tr": "Kural motoru: tetikleyici (mesaj, katılım, ayrılma, rol) ve aksiyon; değişkenli metin destekler.",
     "en": "Rule engine: trigger (message, join, leave, role) plus action; supports variables.",
     "kullanimTr": "r!otomasyon",
     "kullanimEn": "r!otomasyon"
    }
   ]
  },
  {
   "id": "mee6-voice",
   "emoji": "🔊",
   "tr": "Ses",
   "en": "Voice",
   "yeni": true,
   "komutlar": [
    {
     "komut": [
      "r!ses-hub"
     ],
     "tr": "Geçici ses odaları: hub kanalına girenin odası açılır, oda boşalınca silinir.",
     "en": "Temp voice rooms: joining the hub creates a room, leaving deletes it.",
     "kullanimTr": "r!ses-hub [#kanal]",
     "kullanimEn": "r!ses-hub [#channel]"
    }
   ]
  },
  {
   "id": "mee6-social",
   "emoji": "📣",
   "tr": "Duyuru & Sosyal",
   "en": "Announcements & Social",
   "yeni": true,
   "komutlar": [
    {
     "komut": [
      "r!embed"
     ],
     "tr": "Embed gönderir veya düzenler; taslağı kaydedip sonra yayınlayabilirsin.",
     "en": "Posts or edits an embed; save a draft and publish later.",
     "kullanimTr": "r!embed",
     "kullanimEn": "r!embed"
    },
    {
     "komut": [
      "r!sosyal"
     ],
     "tr": "YouTube kanalı ve RSS akışı bildirimlerini ekler ve yönetir. Varsayılan RSS, kota harcamaz.",
     "en": "Adds and manages YouTube channel and RSS feed notifications. RSS by default, no quota used.",
     "kullanimTr": "r!sosyal",
     "kullanimEn": "r!sosyal"
    },
    {
     "komut": [
      "r!duyuru-kanal"
     ],
     "tr": "Sosyal ve duyuru bildirimleri için varsayılan kanalı ayarlar.",
     "en": "Sets the default channel for social and announcement posts.",
     "kullanimTr": "r!duyuru-kanal #kanal",
     "kullanimEn": "r!duyuru-kanal #channel"
    }
   ]
  },
  {
   "id": "mee6-bday",
   "emoji": "🎂",
   "tr": "Doğum Günü",
   "en": "Birthdays",
   "yeni": true,
   "komutlar": [
    {
     "komut": [
      "r!doğumgünü"
     ],
     "tr": "Doğum gününü kaydeder; gün gelince kanaldan kutlanır.",
     "en": "Registers your birthday; the bot celebrates on the day.",
     "kullanimTr": "r!doğumgünü [gün ay]",
     "kullanimEn": "r!doğumgünü [day month]"
    }
   ]
  },
  {
   "id": "mee6-counter",
   "emoji": "🔢",
   "tr": "Sayaç",
   "en": "Counter",
   "yeni": true,
   "komutlar": [
    {
     "komut": [
      "r!sayac"
     ],
     "tr": "Canlı kanal sayacı: üye, bot ve rol sayılarını kanal adında gösterir.",
     "en": "Live channel counter: shows member, bot and role counts in channel names.",
     "kullanimTr": "r!sayac",
     "kullanimEn": "r!sayac"
    }
   ]
  }
 ]
};
