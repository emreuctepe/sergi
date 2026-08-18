/* Sayı 04 · "Gürültü" — bölüm 03 · anatomi */
(function (MAG) {
  "use strict";
  var section =
    {
      slug: "anatomi",
      type: "report",
      title: "Bir Saldırının Anatomisi",
      kicker: "Vaka",
      author: "Emre",
      minutes: 6,
      tags: ["saldırı", "anlatım"],
      pages: [
        {
          id: "an-acilis",
          depth: ["all"],
          kind: "opener",
          fit: "contain",
          bleed: "full",
          bg: "scene:terminal",
          scene: "mask-wipe",
          blocks: [
            { t: "kicker", text: "Vaka · beş adım", invert: true },
            { t: "h1", text: "Bir saldırının anatomisi", invert: true },
            {
              t: "lead",
              invert: true,
              text: "Filmlerdeki gibi başlamıyor. Bir arama motoru sorgusuyla başlıyor ve genelde üç hafta sürüyor.",
            },
          ],
        },

        {
          id: "an-1",
          depth: ["all"],
          fit: "scroll",
          scene: "fade-up",
          bg: "scene:paper",
          blocks: [
            { t: "kicker", text: "Adım 1 · Keşif" },
            { t: "h2", text: "Kimse kapıyı zorlamıyor, önce plana bakıyor" },
            {
              t: "p",
              text: "İlk gün hiçbir sisteme dokunulmuyor. Şirketin kim olduğu, kimlerin çalıştığı, hangi yazılımları kullandığı zaten halka açık: iş ilanları, konferans konuşmaları, sunucu adları, eski veri sızıntıları.",
            },
            {
              t: "term",
              host: "kesif@dis-ag",
              lines: [
                "$ whois ornek-lojistik.com.tr | grep -i 'registrant\\|mail'",
                "registrant: Örnek Lojistik A.Ş.",
                "mail:       bt@ornek-lojistik.com.tr",
                "",
                "$ grep -ri 'ornek-lojistik' ./sizinti-2023/ | wc -l",
                "41",
                "",
                "# 41 kayıt: 41 çalışan e-postası, 12'sinde eski parola",
              ],
              caption: "Hiçbiri suç değil, hiçbiri fark edilmiyor. Bu aşamada saldırgan sadece bir okuyucu.",
            },
            {
              t: "note",
              text: "En pahalı adım bu değil, en uzun adım bu. Bir hafta okumak, bir gecelik bir şansı ikiye katlıyor.",
            },
          ],
        },

        {
          id: "an-2",
          depth: ["all"],
          fit: "scroll",
          scene: "fade-up",
          bg: "scene:paper",
          blocks: [
            { t: "kicker", text: "Adım 2 · İlk temas" },
            { t: "h2", text: "Açık bir kapı değil, açılmak isteyen bir kapı" },
            {
              t: "p",
              text: "Mesaj kötü yazılmıyor artık. Doğru isimle geliyor, doğru saatte geliyor ve doğru şeyi istiyor: acil ama sıradan bir şey. Kimse “hesabınız kapatılacak” demiyor; “şu faturayı bugün onaylar mısın” diyor.",
            },
            {
              t: "term",
              host: "gelen-kutusu@muhasebe",
              lines: [
                "Kimden: Selin Arda <selin.arda@ornek-lojistik.com.tr.fatura-onay.net>",
                "Konu:   Eylül nakliye faturası — bugün son gün",
                "",
                "Merhaba, ayın kapanışı için tek eksik bu.",
                "Portalden onaylayabilir misin?",
                "  → https://ornek-lojistik.com.tr.fatura-onay.net/giris",
                "",
                "# alan adı sağdan sola okunur:  fatura-onay.net",
              ],
              caption:
                "Adresin başındaki her şey süs. Gerçek alan adı, son iki parçadır — burada `fatura-onay.net`.",
            },
            {
              t: "p",
              text: "İşe yaraması için kimsenin aptal olması gerekmiyor. Sadece yardımsever ve meşgul olması yetiyor ki bu, iyi bir çalışanın tanımı.",
            },
          ],
        },

        {
          id: "an-3",
          depth: ["all"],
          fit: "scroll",
          scene: "fade-up",
          bg: "scene:paper",
          blocks: [
            { t: "kicker", text: "Adım 3 · Dayanak" },
            { t: "h2", text: "Parola değil, oturum çalınıyor" },
            {
              t: "p",
              text: "Klasik anlatıda parola çalınır. Gerçekte çalınan şey giderek daha çok **oturum çerezi** oluyor: giriş yaptıktan sonra tarayıcına verilen “bu kişi zaten doğrulandı” fişi.",
            },
            {
              t: "pull",
              text: "Parolanı değiştirmek çalınmış bir oturumu kapatmıyor. Oturumları kapatmak kapatıyor.",
            },
            {
              t: "term",
              host: "sunucu@fatura-onay.net",
              lines: [
                "$ tail -f oturum.log",
                "18:42:03  giris.basarili  kullanici=e.demir  2fa=sms  onay=ok",
                "18:42:03  cerez.kopyalandi  sid=9f2c…a71  ttl=30g",
                "18:44:19  yeniden.kullanim  sid=9f2c…a71  ip=185.x.x.x  ulke=??",
                "18:44:19  parola.sorulmadi  # oturum zaten acik",
              ],
              caption: "İkinci adım doğrulaması yapıldı ve aşıldı — çünkü doğrulama girişte, oturumda değil.",
            },
            {
              t: "note",
              text: "SMS ile gelen kodun bu senaryoda faydası yok. Passkey'in var: passkey sahte siteye çalışmıyor, çünkü hangi alan adına ait olduğunu biliyor.",
            },
          ],
        },

        {
          id: "an-4",
          depth: ["all"],
          fit: "scroll",
          scene: "fade-up",
          bg: "scene:paper",
          blocks: [
            { t: "kicker", text: "Adım 4 · Yayılma" },
            { t: "h2", text: "İçeride kimse kimliğini sormuyor" },
            {
              t: "p",
              text: "Şirketler dışarıya karşı kale, içeriye karşı açık ofis kuruyor. Bir kişinin hesabına giren, çoğunlukla o kişinin görebildiği her şeyi görebiliyor: ortak klasörler, sohbet geçmişi, kayıtlı parolalar, “geçici” diye açılmış erişimler.",
            },
            {
              t: "stat",
              items: [
                { k: "İlk hesaptan sonraki ortalama süre", v: "3 saat" },
                { k: "Ortalama erişilen ek hesap", v: "6" },
                { k: "Fark edilmesi", v: "hafta" },
              ],
            },
            {
              t: "term",
              host: "ic-ag@dosya-sunucu",
              lines: [
                "$ grep -ril 'parola\\|sifre\\|kullanici adi' /ortak/ | head",
                "/ortak/BT/yeni-baslayan-kurulum.docx",
                "/ortak/Muhasebe/banka-portal-notlar.xlsx",
                "/ortak/IK/wifi-misafir.txt",
                "",
                "# 3 dosya. hiçbiri şifreli değil. hepsi meşru bir sebeple orada.",
              ],
              caption: "Kötü niyetle yazılmış tek satır yok. Kolaylık, zamanla bir güvenlik açığına dönüşüyor.",
            },
          ],
        },

        {
          id: "an-5",
          depth: ["all"],
          fit: "scroll",
          scene: "fade-up",
          bg: "scene:circuit",
          blocks: [
            { t: "kicker", text: "Adım 5 · Sızdırma" },
            { t: "h2", text: "Yavaş, geceleyin, yedekleme gibi görünerek" },
            {
              t: "p",
              text: "Son adım gürültülü değil. Veriyi tek seferde çekmek alarm üretirdi; bunun yerine küçük parçalar hâlinde, mesai dışında ve normal görünen bir hedefe gönderiliyor. Amaç fark edilmemek değil — fark edilse bile *ilginç görünmemek*.",
            },
            {
              t: "term",
              host: "cikis@yedek-gorunumlu",
              lines: [
                "02:11  gonderim  14 MB  hedef=depolama-saglayici  etiket=\"gece yedegi\"",
                "02:41  gonderim  14 MB  hedef=depolama-saglayici  etiket=\"gece yedegi\"",
                "03:11  gonderim  14 MB  hedef=depolama-saglayici  etiket=\"gece yedegi\"",
                "…",
                "# 9 gece · 3.8 GB · tek bir uyarı üretilmedi",
              ],
              caption: "Anormallik yakalamak, normalin ne olduğunu bilmeyi gerektiriyor. Çoğu kurumun bilmediği şey bu.",
            },
            {
              t: "p",
              text: "Bu beş adımın hiçbirinde sıra dışı bir yetenek yok. Her biri sıradan araçlarla, sıradan bir sabırla yapılıyor. Kötü haber bu. İyi haber de bu: sıradan önlemler gerçekten işe yarıyor.",
            },
          ],
        },
      ],
    }
  ;
  section.order = 3;
  MAG.defineSection("2026-10", section);
})(window.MAG);
