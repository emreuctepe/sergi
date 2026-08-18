/* Sayı 04 · "Gürültü" — bölüm 04 · beyaz-sapka */
(function (MAG) {
  "use strict";
  var section =
    {
      slug: "beyaz-sapka",
      type: "interview",
      title: "Beyaz Şapka",
      kicker: "Söyleşi",
      author: "Emre",
      minutes: 5,
      tags: ["söyleşi", "insan"],
      pages: [
        {
          id: "bs-acilis",
          depth: ["all"],
          kind: "opener",
          fit: "contain",
          bleed: "full",
          bg: "scene:circuit",
          scene: "mask-wipe",
          blocks: [
            { t: "kicker", text: "Söyleşi", invert: true },
            { t: "h1", text: "“Hiçbir zaman kilidi kırmadım”", invert: true },
            {
              t: "lead",
              invert: true,
              text: "Sekiz yıldır sızma testi yapıyor. Adını vermek istemedi; çağrı adı Kova.",
            },
          ],
        },

        {
          id: "bs-1",
          depth: ["mid", "full"],
          fit: "scroll",
          scene: "fade-up",
          bg: "scene:paper",
          blocks: [
            { t: "byline", author: "Kova", role: "sızma testi uzmanı", minutes: 5 },
            {
              t: "dialog",
              who: "q",
              text: "Bir şirkete girmen gerekiyor. Nereden başlıyorsun?",
            },
            {
              t: "dialog",
              who: "a",
              name: "Kova",
              text: "İnsandan. Her zaman insandan. Sekiz yılda bir kere bile bir şifreleme algoritmasını kırmadım — kimse kırmıyor. İnsanlar yardımcı olmayı seviyor, iş bu.",
            },
            {
              t: "dialog",
              who: "q",
              text: "Somut bir örnek verebilir misin?",
            },
            {
              t: "dialog",
              who: "a",
              name: "Kova",
              text: "Elinde iki bardak kahveyle turnikeye gelirsin. Kartını çıkaramıyorsundur, değil mi? Önündeki kişi kapıyı tutar. Bunu yapmayan insan neredeyse yok, çünkü yapmamak kabalık.",
            },
            {
              t: "pull",
              text: "İyi güvenlik, kimseyi kaba olmaya zorlamayan güvenliktir.",
            },
          ],
        },

        {
          id: "bs-2",
          depth: ["mid", "full"],
          fit: "scroll",
          scene: "fade-up",
          bg: "scene:paper",
          blocks: [
            {
              t: "dialog",
              who: "q",
              text: "Şirketler en çok neyi yanlış anlıyor?",
            },
            {
              t: "dialog",
              who: "a",
              name: "Kova",
              text: "Güvenliği satın alınabilir bir şey sanmak. Bir ürün alıyorlar, kutuyu açıyorlar, rahatlıyorlar. Oysa aldıkları şey bir alet. Aleti kimse kullanmıyorsa duvardaki tabloyla aynı işi görüyor.",
            },
            {
              t: "dialog",
              who: "q",
              text: "Rapor verdiğinde ilk tepki ne oluyor?",
            },
            {
              t: "dialog",
              who: "a",
              name: "Kova",
              text: "Utanç. Ve utanç en kötü tepki, çünkü utanan kurum bir dahaki sefere haber vermiyor. Ben rapora artık şunu yazıyorum: burada kimse hata yapmadı, sistem zaten böyle davranmanı bekliyordu.",
            },
            {
              t: "quote",
              text: "Bir çalışan oltaya geldiyse eğitim eksik değildir; tasarım eksiktir.",
              by: "Kova",
            },
          ],
        },

        {
          id: "bs-3",
          depth: ["full"],
          fit: "scroll",
          scene: "fade-up",
          bg: "scene:paper",
          blocks: [
            {
              t: "dialog",
              who: "q",
              text: "Kendi telefonunda ne var?",
            },
            {
              t: "dialog",
              who: "a",
              name: "Kova",
              text: "Beklediğinden çok daha sıkıcı bir şey. Bir parola yöneticisi, passkey, otomatik güncelleme açık. Hepsi bu. Meslektaşlarımın çoğu da böyle — asıl paranoyaklar en basit kurulumu kullanır.",
            },
            {
              t: "dialog",
              who: "q",
              text: "Seni gerçekten korkutan ne?",
            },
            {
              t: "dialog",
              who: "a",
              name: "Kova",
              text: "Hız. Eskiden bir oltalama kampanyası hazırlamak bir haftaydı; dil bilmen, şirketi tanıman gerekirdi. Şimdi bir öğleden sonra. Saldırının ucuzlaması, savunmanın pahalılaşmasından daha hızlı ilerliyor.",
            },
            {
              t: "dialog",
              who: "q",
              text: "Tek bir tavsiye?",
            },
            {
              t: "dialog",
              who: "a",
              name: "Kova",
              text: "E-posta hesabını her şeyden çok koru. Orası kasa değil, kasanın anahtarlarının durduğu yer. Bütün “parolamı unuttum” bağlantıları oraya gidiyor.",
            },
          ],
        },
      ],
    }
  ;
  section.order = 4;
  MAG.defineSection("2026-10", section);
})(window.MAG);
