/* ============================================================================
   SAYI 04 · "Gürültü" — 2026-10
   ----------------------------------------------------------------------------
   Konu: siber güvenlik. Ton: cyberpunk, ama süs olsun diye değil — sayının tezi
   zaten "cihazların sürekli konuştuğu bir şehirde yaşıyoruz".

   KIZIL MEVSİM'DEN FARKLARI (bilerek)
     · Başlıklar mono: --issue-display sayı temasından geliyor (tokens.css).
     · Yeni blok tipi `term` — ekranda akan kayıt. Foto galeri ve manga yok.
     · Sözlük yerine uygulanabilir bir rehber: "Beş Hamle".
     · Bulmaca içeriğin devamı: yazıda anlatılan üçgenleme, oynanabilir hâli.

   Şema aynı: Issue → Section → Page[] → Block[].
   Sayfa kimlikleri yorum çıpasıdır (pageId:blockIndex) — blok sırası değişirse
   issues/2026-10.comments.js'teki yorumlar yanlış cümleye yapışır.
   ========================================================================= */

(function (MAG) {
  "use strict";

  var D = {};

  /* ========================================================================
     SAYI
     ===================================================================== */

  D.issue = {
    slug: "2026-10",
    number: 4,
    title: "Gürültü",
    subtitle: "Her cihaz konuşuyor. Mesele kimin dinlediği",
    publishedAt: "2026-10-01",
    colophon: "Aylık · Ekim 2026 · Tek kişilik editöryel",
    editorsPick: "uc-halka",
    puzzlePool: ["uc-halka"],
    next: { date: "1 Kasım 2026", title: "Islak Asfalt" },
  };

  /* ========================================================================
     TANITIM (about) — ilk ziyarette, kaydırmalı, ~12 saniye
     ===================================================================== */

  D.intro = [
    {
      scene: "paper",
      big: "Bu bir dergi.",
      small: "Akış değil. Başlıyor ve bitiyor.",
    },
    {
      scene: "circuit",
      big: "Ayda bir sayı.",
      small: "Bir oturuşta okunur. Sonra kapanır ve gelecek ayı bekler.",
    },
    {
      scene: "terminal",
      big: "Üç okuma derinliği.",
      small: "Acelen varsa en az. Vaktin varsa klasik. Aynı sayı, üç farklı uzunluk.",
    },
    {
      scene: "signal-grid",
      big: "Nereye istersen yorum yaz.",
      small: "Bir cümlenin altına, bir görselin köşesine. Hesap açmana gerek yok.",
    },
    {
      scene: "neon-city",
      big: "Hazırsan başlayalım.",
      small: "Sayı 04 · Gürültü",
      last: true,
    },
  ];

  /* ========================================================================
     BÖLÜMLER
     ===================================================================== */

  D.sections = [
    /* --------------------------------------------------------------------
       00 · KAPAK
       ----------------------------------------------------------------- */
    {
      slug: "kapak",
      type: "cover",
      title: "Kapak",
      pages: [
        {
          id: "gr-kapak",
          depth: ["all"],
          kind: "cover",
          fit: "contain",
          bleed: "full",
          bg: "scene:neon-city",
          scene: "mask-wipe",
          blocks: [{ t: "cover" }],
        },
      ],
    },

    /* --------------------------------------------------------------------
       01 · EDİTÖRDEN
       ----------------------------------------------------------------- */
    {
      slug: "editorden",
      type: "article",
      title: "Editörden",
      kicker: "Sunuş",
      author: "Emre",
      minutes: 2,
      tags: ["editoryel"],
      pages: [
        {
          id: "gr-ed-1",
          depth: ["all"],
          fit: "scroll",
          scene: "fade-up",
          bg: "scene:paper",
          blocks: [
            { t: "kicker", text: "Sunuş" },
            { t: "h1", text: "Sen hedef değilsin, kapısın" },
            { t: "byline", author: "Emre", role: "editör", minutes: 2 },
            {
              t: "lead",
              text: "Siber güvenlik konuşmalarının çoğu şu cümlede ölüyor: “Benim bilgilerimde ne var ki?”",
            },
            {
              t: "p",
              drop: true,
              text: "Haklı bir soru gibi duruyor. Kimsenin banka hesabını merak etmediği, kimsenin fotoğraflarını istemediği sıradan bir hayat sürüyorsun. Peki neden uğraşsınlar?",
            },
            {
              t: "p",
              text: "Çünkü kimse seninle uğraşmıyor. Uğraşmak, birini seçmek demek — ve kimse seni seçmiyor. Bir yazılım, bir gecede yüz binlerce adrese aynı mesajı gönderiyor. O mesajın sana özel hiçbir yanı yok. Sen bir isim değilsin, bir satırsın.",
            },
          ],
        },
        {
          id: "gr-ed-2",
          depth: ["mid", "full"],
          fit: "scroll",
          scene: "fade-up",
          bg: "scene:paper",
          blocks: [
            {
              t: "p",
              text: "Bu, kötü bir haber gibi görünüyor ama aslında iyi haber. Seni seçen biri olsaydı yapabileceğin çok az şey olurdu; hedefli bir saldırıyı durdurmak bambaşka bir iş. Oysa seçilmediğin bir dünyada kurallar basit: **sürüden biraz daha yavaş olmamak yetiyor.**",
            },
            {
              t: "p",
              text: "Bu sayıda yavaş olmamanın ne demek olduğunu anlatmaya çalıştım. Kimse sana “şifreni güçlendir” demesin diye değil — bunu zaten herkes söylüyor ve kimse dinlemiyor. Nedenini anlatabilirsem, belki bir kere yapılacak beş iş kalır geriye.",
            },
            {
              t: "pull",
              text: "Güvenlik bir ürün değil, bir alışkanlık. Satın alınmıyor, ediniliyor.",
            },
            {
              t: "p",
              text: "Bir de şu var: bu sayıyı hazırlarken en çok korktuğum şey, korku satmaktı. Güvenlik yazıları genelde bunu yapıyor — önce dehşete düşürüyor, sonra bir ürün satıyor. Burada satacak bir şeyim yok. En sonda beş madde var, hepsi ücretsiz, hepsi bir akşamda biter.",
            },
            {
              t: "note",
              text: "Bu sayının bulmacası da yazının devamı: telefonunun konumunun GPS olmadan nasıl bulunduğunu oynayarak öğreniyorsun. Sonlara doğru.",
            },
          ],
        },
      ],
    },

    /* --------------------------------------------------------------------
       02 · GÜRÜLTÜ  (ana yazı — derinlik dallanmasının vitrini)
       ----------------------------------------------------------------- */
    {
      slug: "gurultu",
      type: "article",
      title: "Gürültü",
      kicker: "Dosya",
      author: "Emre",
      minutes: 9,
      tags: ["mahremiyet", "ağ", "dosya"],
      pages: [
        {
          id: "gu-acilis",
          depth: ["all"],
          kind: "opener",
          fit: "contain",
          bleed: "full",
          bg: "scene:neon-city",
          scene: "parallax",
          blocks: [
            { t: "kicker", text: "Dosya · Ekim", invert: true },
            { t: "h1", big: true, text: "Gürültü", invert: true },
            {
              t: "lead",
              invert: true,
              text: "Cebindeki telefon, ekranı kapalıyken bile bağırıyor. Sorun duyulması değil — sorun ne söylediği.",
            },
          ],
        },

        /* min moda özel: aynı yazının kısa hâli, özet değil ayrı bir metin */
        {
          id: "gu-min",
          depth: ["min"],
          fit: "scroll",
          scene: "fade-up",
          bg: "scene:paper",
          blocks: [
            { t: "kicker", text: "Kısa hâli" },
            { t: "h2", text: "Üç antenle bulunuyorsun" },
            {
              t: "p",
              drop: true,
              text: "Telefonun, daha önce bağlandığı her ağın adını düzenli olarak havaya soruyor: “Ev_WiFi burada mı? Ofis_5G burada mı?” Bu liste bir ağ ayarı değil, bir biyografi.",
            },
            {
              t: "p",
              text: "Aynı anda üç baz istasyonu sinyalinin gücünden uzaklığını hesaplıyor. Bir anten seni bir çemberin üstüne koyar. İki anten iki noktaya indirir. Üçüncüsü tek noktayı söyler. GPS'in kapalı olması hiçbir şeyi değiştirmiyor.",
            },
            {
              t: "pull",
              text: "Kalabalıkta kaybolmak insan sezgisi. Makine yorulmuyor.",
            },
            {
              t: "p",
              text: "“Milyonlarca insan var, beni kim ayırt edecek” diye düşünüyoruz. Gürültünün bizi sakladığını sanıyoruz. Oysa gürültüyü ayıklamak, makinelerin yapmak için tasarlandığı tek iş.",
            },
            {
              t: "note",
              text: "Uzun hâlinde: probe kayıtları, üçgenlemenin matematiği ve bunun ne kadarının gerçekten önemli olduğu. Okuma modunu menüden değiştirebilirsin.",
            },
          ],
        },

        {
          id: "gu-1",
          depth: ["mid", "full"],
          fit: "scroll",
          scene: "fade-up",
          bg: "scene:paper",
          blocks: [
            {
              t: "p",
              drop: true,
              text: "Kadıköy'de bir akşam. İskeleden çıkıp yukarı yürüyorsun, telefon cebinde, ekranı kapalı. Hiçbir uygulamayı açmadın, kimseye mesaj atmadın. Teknik olarak telefonun hiçbir şey yapmıyor.",
            },
            {
              t: "p",
              text: "Aslında konuşuyor. Birkaç saniyede bir havaya bir soru bırakıyor ve bu soru şu biçimde: daha önce bağlandığın ağların adlarını tek tek sayıp her biri için “burada mısın?” diye soruyor. Buna probe request deniyor ve amacı iyi niyetli — eve girer girmez Wi-Fi'ye bağlanman bu yüzden bu kadar hızlı.",
            },
            {
              t: "p",
              text: "Yan etkisi şu: o liste bir ağ ayarı değil. Nerede yaşadığını, nerede çalıştığını, hangi otelde kaldığını, hangi hastanede beklediğini, geçen yaz hangi kafede oturduğunu içeriyor. Ve şifresiz yayılıyor. Onu duymak için o ağlara bağlanmış olmak gerekmiyor; menzilde olmak yetiyor.",
            },
            {
              t: "pull",
              text: "Telefonun sana ait sırları saklıyor. Nerede olduğunu ise herkese soruyor.",
            },
          ],
        },

        {
          id: "gu-2",
          depth: ["mid", "full"],
          fit: "scroll",
          scene: "stagger",
          bg: "scene:terminal",
          blocks: [
            {
              t: "p",
              text: "Bu, duyulması için özel bir donanım gerektiren bir şey değil. Yüz liralık bir kart ve ücretsiz bir program yetiyor. Bir kafede on dakika dinlemek şuna benziyor:",
            },
            {
              t: "term",
              host: "dinleyici@kadikoy — 21:04",
              lines: [
                "$ sudo tcpdump -i wlan0 -e -s 256 type mgt subtype probe-req",
                "21:04:07  aa:bb:cc:11:22:33  →  \"Ev_WiFi\"",
                "21:04:07  aa:bb:cc:11:22:33  →  \"MODA_KAHVE_MISAFIR\"",
                "21:04:08  aa:bb:cc:11:22:33  →  \"Bilkent_Ogrenci\"",
                "21:04:09  aa:bb:cc:11:22:33  →  \"Otel_Kas_402\"",
                "21:04:11  aa:bb:cc:11:22:33  →  \"AcibademHastane_Ziyaretci\"",
                "21:04:12  4d:2e:9f:70:81:0a  →  \"Ev_WiFi\"",
                "21:04:14  aa:bb:cc:11:22:33  →  \"TP-LINK_A4F2\"",
                "",
                "# 1 cihaz · 6 ağ adı · 7 saniye",
              ],
              caption:
                "Tek bir cihazın yedi saniyesi. Adres sahte olabilir; ağ adları değil — çünkü işe yaraması için gerçek olmaları gerekiyor.",
            },
            {
              t: "p",
              text: "Buradan çıkan portre bir isim vermiyor, doğru. Ama bir üniversite, bir hastane, bir tatil ve bir ev veriyor. Dört maddeyle kaç kişi kalır geriye?",
            },
          ],
        },

        /* full moda özel: matematiğe inen sapak */
        {
          id: "gu-3",
          depth: ["full"],
          fit: "scroll",
          scene: "fade-up",
          bg: "scene:paper",
          blocks: [
            { t: "h2", text: "Üç halkanın matematiği" },
            {
              t: "p",
              text: "Konum bulmanın en yaygın yolu, sandığımız gibi uydu değil. Sinyalin ne kadar zayıfladığına ya da gitmesinin ne kadar sürdüğüne bakarak bir uzaklık tahmini üretiyorsun. Uzaklık tek başına yön bilgisi vermiyor: “bu antenden 340 metre uzaktasın” cümlesi seni bir çemberin üstünde herhangi bir yere koyuyor.",
            },
            {
              t: "quote",
              text: "Bir ölçüm bir çember. İki ölçüm iki nokta. Üç ölçüm bir yer.",
              by: "trilaterasyonun tamamı",
            },
            {
              t: "p",
              text: "İkinci anten ikinci bir çember veriyor ve iki çember en fazla iki noktada kesişiyor. Üçüncü anten bu iki adaydan hangisinin doğru olduğunu söylüyor. İşin tamamı bu — lise geometrisi, uzay teknolojisi değil.",
            },
            {
              t: "p",
              text: "Sinsi tarafı şu: bu üç ölçüm için kimsenin senden izin istemesi gerekmiyor, çünkü ölçümü sen üretiyorsun. Telefonun zaten baz istasyonlarıyla konuşmak zorunda; yoksa telefon olmazdı. Konum, ağa bağlı olmanın yan ürünü.",
            },
            {
              t: "note",
              text: "Bu sayının bulmacası tam olarak bunu oynatıyor: halkalar tek tek açılıyor ve cihazın yerini sen işaretliyorsun. Son turda ölçümlere gürültü biniyor.",
            },
          ],
        },

        {
          id: "gu-4",
          depth: ["mid", "full"],
          fit: "scroll",
          scene: "fade-up",
          bg: "scene:circuit",
          blocks: [
            { t: "h2", text: "Kalabalık artık saklamıyor" },
            {
              t: "p",
              text: "Bir meydanda yürürken kendini görünmez hissetmenin bir mantığı var: etrafında binlerce insan varsa, seni ayırt etmek için birinin oturup bakması gerekir. İnsan gözü yorulur, dikkat dağılır, kalabalık işe yarar.",
            },
            {
              t: "p",
              text: "Bu sezgi, gözlemci insan olduğu sürece doğruydu. Bir yazılım için kalabalık bir zorluk değil, sadece daha uzun bir liste. Gürültüyü ayıklamak zaten yapmak üzere tasarlandığı iş.",
            },
            {
              t: "stat",
              items: [
                { k: "Telefonun günde sorduğu ağ adı", v: "~1.200" },
                { k: "Bir kişiyi ayırt etmeye yeten ağ sayısı", v: "4" },
                { k: "Gereken donanımın maliyeti", v: "₺100" },
              ],
            },
            {
              t: "p",
              text: "Sayılar tartışılır, oran tartışılmaz. Görünmez olmanın maliyeti seninle birlikte artmıyor; görünür olmanın maliyeti onlarla birlikte düşüyor.",
            },
          ],
        },

        /* full moda özel: itiraz ve ölçü */
        {
          id: "gu-5",
          depth: ["full"],
          fit: "scroll",
          scene: "fade-up",
          bg: "scene:paper",
          blocks: [
            { t: "h2", text: "Peki bu ne kadar önemli?" },
            {
              t: "p",
              text: "Dürüst olalım: yukarıdaki hiçbir şey, senin başına gelecek olan şey değil. Kafede seni dinleyen biri yok. Baz istasyonu kayıtlarını isteyen bir savcı da yok. Bu sayfaları okuyup telefonu suya atmanı istemiyorum.",
            },
            {
              t: "p",
              text: "Ama bir teknolojinin ne yapabildiğini bilmek, onu ne zaman kullanacaklarını bilmekten daha kullanışlı. Çünkü ikincisi değişiyor. Bir ülkede yasal olan bir sorgu başka bir ülkede rutin; bu yıl kimsenin ilgilenmediği bir kayıt seneye bir kanıt. Veri, toplandığı andaki niyetini hatırlamıyor.",
            },
            {
              t: "pull",
              big: true,
              text: "Bugünün gürültüsü, yarının arşivi.",
            },
            {
              t: "p",
              text: "Bu yüzden bu yazının sonunda panik yok, envanter var: neyin sızdığını bilmek, sızmasını engellemekten daha gerçekçi bir hedef. Engelleyemeyeceklerini seçmek de bir güvenlik kararı.",
            },
          ],
        },

        {
          id: "gu-imza",
          depth: ["mid", "full"],
          kind: "signature",
          fit: "contain",
          scene: "signature",
          bg: "scene:paper",
          blocks: [
            { t: "rule" },
            {
              t: "p",
              text: "Telefonu cebine geri koy. Yürümeye devam et. Değişen tek şey, artık ne söylediğini biliyor olman — ve bu, hiçbir ayarı değiştirmesen bile bir şeyi değiştiriyor.",
            },
            { t: "caption", text: "Emre · Kadıköy, Eylül 2026" },
          ],
        },
      ],
    },

    /* --------------------------------------------------------------------
       03 · BİR SALDIRININ ANATOMİSİ
       Her sayfa bir adım, her adımda bir kayıt. Sayının en "taranabilir"
       bölümü — bu yüzden tamamı her derinlikte görünüyor.
       ----------------------------------------------------------------- */
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
    },

    /* --------------------------------------------------------------------
       04 · BEYAZ ŞAPKA (söyleşi)
       ----------------------------------------------------------------- */
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
    },

    /* --------------------------------------------------------------------
       05 · BEŞ HAMLE
       Sözlüğün ≤1 ekran parçalama desenini izliyor: giriş / liste / not.
       ----------------------------------------------------------------- */
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
    },

    /* --------------------------------------------------------------------
       06 · BULMACA
       ----------------------------------------------------------------- */
    {
      slug: "bulmaca",
      type: "puzzle",
      title: "Üç Halka",
      kicker: "Bulmaca",
      minutes: 4,
      tags: ["bulmaca"],
      pages: [
        {
          id: "gr-bl-1",
          depth: ["all"],
          kind: "puzzle",
          fit: "scroll",
          scene: "fade-up",
          bg: "scene:signal-grid",
          blocks: [
            { t: "kicker", text: "Bulmaca" },
            { t: "h1", text: "Üç Halka" },
            {
              t: "lead",
              text: "Yazıda anlatılan üçgenleme, oynanabilir hâli. Antenler uzaklığı biliyor, yönü bilmiyor — cihazın yerini sen bulacaksın.",
            },
            { t: "puzzleSlots" },
          ],
        },
      ],
    },

    /* --------------------------------------------------------------------
       07 · SON
       ----------------------------------------------------------------- */
    {
      slug: "son",
      type: "outro",
      title: "Sayı sonu",
      pages: [
        {
          id: "gr-kunye",
          depth: ["all"],
          fit: "contain",
          scene: "fade-up",
          bg: "scene:paper",
          blocks: [
            { t: "kicker", text: "Künye" },
            { t: "h2", text: "Emeği geçenler" },
            { t: "rule" },
            {
              t: "list",
              style: "dict",
              items: [
                { term: "Emre Üçtepe", def: "Editör · dosya · söyleşi — [@emreuctepe](https://example.com)" },
                { term: "“Kova”", def: "Söyleşi konuğu — adını vermek istemedi" },
                { term: "Görseller", def: "Tarayıcıda çizildi: neon şehir, terminal, devre" },
                { term: "Üç Halka", def: "Bulmaca tasarımı ve kodu — dört tur" },
                { term: "Yanlışlar", def: "Bana ait. Yorum bırakırsan düzeltirim." },
              ],
            },
          ],
        },
        {
          id: "gr-son",
          depth: ["all"],
          kind: "outro",
          fit: "contain",
          scene: "fade-up",
          bg: "scene:signal-grid",
          blocks: [{ t: "outro" }],
        },
      ],
    },
  ];

  /* ========================================================================
     BULMACA HAVUZU
     Bu sayıda tek bulmaca var ve bilerek: yazının devamı olduğu için
     rastgele seçilecek bir havuz anlamsız olurdu.
     ===================================================================== */

  D.puzzles = [
    {
      id: "uc-halka",
      name: "Üç Halka",
      blurb: "Üç anten uzaklığını biliyor, yönünü bilmiyor. Cihaz nerede?",
      tags: ["konum", "mahremiyet", "içerik-bağlı"],
      difficulty: 2,
      estMinutes: 4,
      icon: "📡",
      editorsNote: "Dosyadaki üçgenlemeyi anlatmanın en kısa yolu oynatmakmış.",
      config: {
        rounds: [
          {
            /* Öğretici: halkalar tek tek açılıyor, her açılışta soru soruluyor. */
            teach: true,
            towers: [
              { x: 22, y: 26, ad: "Kule A" },
              { x: 78, y: 30, ad: "Kule B" },
              { x: 50, y: 82, ad: "Kule C" },
            ],
            target: { x: 46, y: 48 },
          },
          {
            towers: [
              { x: 16, y: 20, ad: "Kule A" },
              { x: 84, y: 24, ad: "Kule B" },
              { x: 54, y: 86, ad: "Kule C" },
            ],
            target: { x: 63, y: 55 },
          },
          {
            /* Kuleler neredeyse aynı hatta: kötü geometri, zayıf kesişim. */
            dar: true,
            towers: [
              { x: 14, y: 72, ad: "Kule A" },
              { x: 44, y: 66, ad: "Kule B" },
              { x: 76, y: 59, ad: "Kule C" },
            ],
            target: { x: 48, y: 25 },
          },
          {
            /* Gürültü: ölçümler ±, halkalar bantlaşıyor. Sayının adı burada. */
            noise: 7,
            towers: [
              { x: 24, y: 22, ad: "Kule A" },
              { x: 80, y: 36, ad: "Kule B" },
              { x: 46, y: 84, ad: "Kule C" },
            ],
            target: { x: 52, y: 50 },
          },
        ],
      },
      stats: { plays: 1512, solves: 1104, firstTryRate: 0.28, avgSeconds: 232 },
    },
  ];

  /* ------------------------------------------------------------------------
     TESLİM — içerik kaydı. Aktif sayı seçimi js/data.js'te.
     --------------------------------------------------------------------- */

  (MAG.issues = MAG.issues || {})[D.issue.slug] = D;
})(window.MAG);
