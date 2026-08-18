/* Sayı 04 · "Gürültü" — bölüm 05 · bes-hamle */
(function (MAG) {
  "use strict";
  var section =
    {
      slug: "bes-hamle",
      type: "list",
      title: "Beş Hamle",
      kicker: "Rehber",
      author: "Emre",
      minutes: 3,
      tags: ["rehber", "uygulama"],
      pages: [
        {
          id: "bh-1",
          depth: ["all"],
          fit: "contain",
          scene: "fade-up",
          bg: "scene:paper",
          blocks: [
            { t: "kicker", text: "Rehber" },
            { t: "h1", text: "Beş hamle" },
            {
              t: "lead",
              text: "Bir akşamda biter, sonra yıllarca uğraşmazsın. Sıra önemli: ilk ikisi geri kalanının yarısını halleder. Üçüncüsü sıkıcı görünüyor ama saldırıların çoğu aylardır yaması çıkmış açıkları kullanıyor.",
            },
            {
              t: "note",
              text: "Hiçbiri ücretli değil. Hiçbiri için bir şey indirmen ya da birine ödeme yapman gerekmiyor.",
            },
          ],
        },

        {
          id: "bh-2",
          depth: ["all"],
          fit: "contain",
          scene: "stagger",
          bg: "scene:paper",
          blocks: [
            {
              t: "list",
              style: "dict",
              items: [
                {
                  term: "1 · Parola yöneticisi",
                  def: "Tek uzun parola ezberle, gerisini o hatırlasın. Aynısını iki yerde kullanmamanın yolu yok.",
                },
                {
                  term: "2 · Passkey, olmazsa uygulama",
                  def: "SMS en zayıf ikinci adım. Passkey sahte siteye çalışmaz: alan adını bilir.",
                },
                {
                  term: "3 · Otomatik güncelleme",
                  def: "En sıkıcı madde, en etkilisi.",
                },
                {
                  term: "4 · E-postanı kale yap",
                  def: "Bütün sıfırlama bağlantıları oraya gidiyor. En güçlü koruma oraya, sonra bankaya.",
                },
                {
                  term: "5 · Bağlı olmayan bir yedek",
                  def: "Sürekli takılı disk, fidye yazılımının ikinci hedefi. Ayda bir tak, kopyala, çıkar.",
                },
              ],
            },
          ],
        },

        {
          id: "bh-3",
          depth: ["mid", "full"],
          fit: "contain",
          scene: "fade-up",
          bg: "scene:paper",
          blocks: [
            { t: "h2", text: "Listede olmayanlar" },
            {
              t: "p",
              text: "Parolayı üç ayda bir değiştirmek: gereksiz, hatta zararlı — insanı tahmin edilebilir kalıplara itiyor. VPN: kafede işe yarar, seni anonim yapmaz. Antivirüs: işletim sistemininki yetiyor.",
            },
            {
              t: "note",
              text: "Bir şey daha: kaybedeceğin şeylerin listesini bir kere çıkar. Neyin önemli olduğunu bilmeden neyi koruyacağını seçemezsin.",
            },
          ],
        },
      ],
    }
  ;
  section.order = 5;
  MAG.defineSection("2026-10", section);
})(window.MAG);
