/* ============================================================================
   TOHUM YORUMLAR · Sayı 04 "Gürültü"
   ----------------------------------------------------------------------------
   Kurucular (on / pin / loose) ve otuz kişilik okur kadrosu js/data-comments.js'te;
   burası yalnızca bu sayının tohumunu döşüyor.

   KIZIL MEVSİM'DEN AZ  (~65 yorum, orada ~250)
   Bilerek: bu sayı yeni yayınlandı. Kalabalık bir sayı ile taze bir sayı aynı
   sayfa düzeninde nasıl görünüyor — asıl test bu. Yorum katmanının seyrekte de
   ölçülü durması gerekiyor, yalnızca yoğunlukta değil.

   ISI HARİTASI (bilerek kurulan uçlar)
     gu-1:1    "probe request" paragrafı                    11 alıntı → ısı 4
     an-2:3    sahte alan adı log'u                          7 alıntı → ısı 3
     gr-ed-1:5 "Sen bir isim değilsin, bir satırsın."        6 alıntı → ısı 3
     bs-2:4    "…eğitim eksik değildir; tasarım eksiktir."   5 alıntı → ısı 3
     …gerisi 1-3 arası.

   TARTIŞMA
   Konu teknik olduğu için burada Kızıl Mevsim'de olmayan bir şey var: itiraz.
   Birkaç yerde okurlar birbirini düzeltiyor, bir yerde de yazıyı düzeltiyorlar.
   ========================================================================= */

(function (MAG) {
  "use strict";

  (MAG.issueComments = MAG.issueComments || {})["2026-10"] = function (K) {
    var on = K.on;
    var pin = K.pin;
    var loose = K.loose;

    /* ======================================================================
       00 · KAPAK
       =================================================================== */

    loose("gr-kapak", [
      ["yarasa", "Kapaktaki yağmur detayı için ayrı bir teşekkür. Sayıyı açmadan tonu anladım.", { "❤️": 22 }, 40],
      ["orumcek", "Mono başlıklara geçmişsiniz, konuya çok yakışmış.", { "👍": 9 }, 36],
    ]);

    /* ======================================================================
       01 · EDİTÖRDEN
       =================================================================== */

    on("gr-ed-1:4", "Kimsenin banka hesabını merak etmediği, kimsenin fotoğraflarını istemediği sıradan bir hayat", [
      ["kedi", "Tam olarak benim cümlem bu. Yıllardır bunu diyerek hiçbir şey yapmadım.", { "❤️": 18, "😅": 7 }, 33],
      ["sazan", "Bunu her söyleyene “e-postanı ele geçiren biri neleri sıfırlayabilir” diye sorun, konuşma değişiyor.", { "🤯": 24 }, 30],
    ]);

    on("gr-ed-1:5", "Sen bir isim değilsin, bir satırsın.", [
      ["baykus", "Bu cümle sayının tamamını özetliyor. Geri kalanı okumasam da olurdu — ama okudum.", { "❤️": 41, "🔥": 12 }, 31],
      ["turna", "Rahatlatıcı mı korkutucu mu karar veremedim.", { "👀": 16 }, 29],
      ["kelebek", "İkisi birden. Rahatlatıcı çünkü seçilmedin, korkutucu çünkü seçilmene gerek yok.", {}, 28, 1],
      ["vinc", "Otomasyonun demokratikleştirdiği ilk şey saldırı olmuş.", { "😂": 19 }, 27],
      ["ari", "Bir satır olmak bu kadar iyi anlatılabilirdi demek.", { "❤️": 8 }, 24],
      ["kunduz", "Yıllardır güvenlik eğitimi veriyorum, açılış cümlem artık bu.", { "👍": 14 }, 20],
    ]);

    on("gr-ed-2:2", "Güvenlik bir ürün değil, bir alışkanlık. Satın alınmıyor, ediniliyor.", [
      ["geyik", "Diş fırçalamak gibi. Kimse heyecan duymuyor ama yapmayınca fatura büyük.", { "❤️": 26, "😂": 11 }, 26],
      ["nilufer", "Bu cümleyi iş yerimizin panosuna astım.", { "👍": 7 }, 22],
      ["flamingo", "Katılıyorum ama alışkanlık edinmek için de araç lazım. İkisi zıt değil.", {}, 21],
    ]);

    on("gr-ed-2:4", null, [
      ["balik", "Bulmacayı yazının ortasında aradım, sonda buldum. Belki başa bir bağlantı konabilir.", { "👀": 12 }, 18],
    ]);

    /* ======================================================================
       02 · GÜRÜLTÜ (ana yazı)
       =================================================================== */

    pin("gu-acilis", 0.5, 0.72, [
      ["yelkovan", "Bu kapak görselinde saatlerce dolaşabilirim.", { "❤️": 15 }, 25],
    ]);

    loose("gu-min", [
      ["kirpi", "En az modunda okudum, sonra klasiğe geçtim. Kısası özet değil gerçekten, ayrı bir yazı.", { "🤯": 17 }, 19],
      ["horoz", "Doomscroller modu bu sayıda çok iyi çalışıyor.", { "👍": 6 }, 15],
    ]);

    on("gu-1:1", "daha önce bağlandığın ağların adlarını tek tek sayıp her biri için “burada mısın?” diye soruyor", [
      ["sahin", "Bunu bilmiyordum ve şu an telefonuma farklı bakıyorum.", { "🤯": 38, "❤️": 9 }, 24],
      ["karga", "Ben ağ mühendisiyim, on yıldır anlatıyorum, ilk kez bu kadar sade yazılmış görüyorum.", { "❤️": 31 }, 23],
      ["kaplumbaga", "iOS ve Android son sürümlerde bunu kısıtlıyor bu arada, tamamen açık değil artık.", { "👍": 27 }, 22],
      ["karga", "Doğru ama kısmen: kayıtlı ağ listesi hâlâ sızabiliyor, özellikle eski cihazlarda.", { "👍": 19 }, 21, 2],
      ["sincap", "Ayarlardan “bu ağı unut” demek gerçekten işe yarıyor mu peki?", {}, 20],
      ["karga", "Evet, listeden düştüğü için artık sorulmuyor. Kullanmadığın ağları temizlemek en ucuz önlem.", { "❤️": 22 }, 19, 4],
      ["balina", "Havaalanı Wi-Fi'lerini unutmaya gittim, 41 tane kayıtlı ağ buldum. Kırk bir.", { "😂": 44, "🤯": 12 }, 18],
      ["kartal", "Bende 63. Bir kısmının nerede olduğunu hatırlamıyorum bile.", { "😂": 21 }, 17, 6],
      ["ceylan", "Bu paragraf yüzünden bütün akşamım gitti ama pişman değilim.", { "❤️": 13 }, 16],
      ["guvercin", "“Bir ağ ayarı değil, bir biyografi” — bu tanım aklımda kalacak.", { "🔥": 18 }, 14],
      ["yildiz", "Menzilde olmak yetiyor kısmı gerçekten ürkütücü. Bağlanmaya bile gerek yok.", { "👀": 25 }, 12],
    ]);

    on("gu-1:3", "Telefonun sana ait sırları saklıyor. Nerede olduğunu ise herkese soruyor.", [
      ["kurbaga", "Sayının en iyi cümlesi bence.", { "❤️": 29 }, 15],
      ["ayi", "Şifreleme her şeyi çözer sanıyordum. Meğer sorun içerik değil, üstyazıymış.", { "🤯": 20 }, 13],
    ]);

    on("gu-2:0", null, [
      ["kertenkele", "“Yüz liralık bir kart” kısmını abartı sandım, değilmiş. Bu işin bariyeri yok.", { "👀": 14 }, 14],
    ]);

    on("gu-2:1", null, [
      ["tilki", "Bu kaydı görünce anladım. Anlatmak yerine göstermek her zaman daha iyi.", { "❤️": 33, "🔥": 8 }, 13],
      ["orumcek", "Terminal bloğu derginin en güzel yeni parçası. Başka sayılarda da olsun.", { "👍": 21 }, 12],
      ["kunduz", "MAC adresi rastgeleleştirme bunun bir kısmını çözüyor, not düşeyim.", { "👍": 16 }, 11],
      ["kirpi", "Yazı zaten “adres sahte olabilir; ağ adları değil” diyor, altındaki nota bak.", {}, 10, 2],
    ]);

    on("gu-3:2", "Bir ölçüm bir çember. İki ölçüm iki nokta. Üç ölçüm bir yer.", [
      ["baykus", "Lisede öğrendiğimiz bir şeyin bu kadar mahrem bir şeye dönüşmesi tuhaf.", { "🤯": 23 }, 12],
      ["sazan", "Doomreader modundakiler bu sapağı kaçırmasın, sayının en iyi sayfası.", { "❤️": 11 }, 9],
    ]);

    on("gu-4:3", null, [
      ["nilufer", "Günde 1.200 sayı biraz yüksek değil mi? Kaynağını merak ettim.", { "👀": 17 }, 11],
      ["karga", "Cihaza ve ayara göre çok değişiyor, mertebe olarak doğru. Yazı da “sayılar tartışılır” diyor zaten.", { "👍": 20 }, 10, 0],
    ]);

    on("gu-4:4", "Görünmez olmanın maliyeti seninle birlikte artmıyor; görünür olmanın maliyeti onlarla birlikte düşüyor.", [
      ["yelkovan", "Ekonomi cümlesi gibi ama tam da öyle. Asimetri her şeyi açıklıyor.", { "❤️": 24 }, 10],
      ["ari", "Bunu bir kere daha okumak için geri geldim.", { "❤️": 7 }, 6],
    ]);

    on("gu-5:3", "Bugünün gürültüsü, yarının arşivi.", [
      ["kelebek", "Sayının adı burada kapanıyor. Çok iyi kurgulanmış.", { "🔥": 28, "❤️": 14 }, 9],
      ["guvercin", "Veri toplandığı andaki niyetini hatırlamıyor — bu cümleyi kaydettim.", { "❤️": 19 }, 8],
      ["kedi", "Bu paragraf yüzünden eski hesaplarımı kapatmaya başladım.", { "👍": 12 }, 7],
    ]);

    on("gu-5:1", null, [
      ["horoz", "Panik satmamanız için ayrı teşekkürler. Çoğu güvenlik yazısı bunu yapamıyor.", { "❤️": 26 }, 8],
    ]);

    loose("gu-imza", [
      ["turna", "Kapanış paragrafı tam ölçüsünde. Ne felaket ne kayıtsızlık.", { "❤️": 21 }, 7],
    ]);

    /* ======================================================================
       03 · ANATOMİ
       =================================================================== */

    on("an-1:2", null, [
      ["kaplumbaga", "İlk gün hiçbir sisteme dokunulmuyor kısmı en şaşırtıcısı. Film değil gerçekten.", { "🤯": 22 }, 9],
    ]);

    on("an-2:3", null, [
      ["balina", "Alan adını sağdan sola okuma kuralını bugüne kadar kimse bana böyle anlatmamıştı.", { "❤️": 35, "🔥": 11 }, 8],
      ["sincap", "Bunu anneme gösterdim, ilk kez anladı. Teşekkürler.", { "❤️": 29 }, 7],
      ["kertenkele", "Telefonda adresin tamamı görünmüyor, asıl sorun bu. Kural doğru ama uygulaması zor.", { "👍": 24 }, 7],
      ["kunduz", "Bağlantıya basılı tutunca tam adres çıkıyor, alışkanlık hâline getirmek lazım.", { "👍": 18 }, 6, 2],
      ["geyik", "Şirketimizde tam bu formatta bir mesaj geldi geçen ay. Tüyler ürpertici.", { "👀": 20 }, 6],
      ["yarasa", "Yazım hatası aramayı bırakın diyorum herkese, o devir bitti.", { "👍": 15 }, 5],
      ["ceylan", "Doğru saatte gelmesi en sinsi kısım. Ay sonu muhasebe zaten gergin.", {}, 5],
    ]);

    on("an-3:3", "Parolanı değiştirmek çalınmış bir oturumu kapatmıyor. Oturumları kapatmak kapatıyor.", [
      ["sahin", "Bunu bilmiyordum. Yıllardır yanlış şey yapıyormuşum.", { "🤯": 31 }, 6],
      ["tilki", "“Tüm cihazlardan çıkış yap” düğmesi bu yüzden varmış demek.", { "❤️": 23 }, 5],
      ["kartal", "Bir kurumda olay müdahalesi yaptım, tam olarak bu yüzden iki hafta kaybettik.", { "👀": 17 }, 5],
      ["balik", "Parola yöneticisi de bunu çözmüyor bu arada. Ayrı bir refleks gerekiyor.", { "👍": 9 }, 4],
    ]);

    on("an-3:5", null, [
      ["orumcek", "Passkey kısmına kadar ikna olmamıştım. Şimdi kuruyorum.", { "❤️": 19 }, 5],
      ["flamingo", "SMS'in bu kadar zayıf olduğunu bilmiyordum, hâlâ her yer onu dayatıyor.", { "😅": 14 }, 4],
    ]);

    on("an-4:2", "Şirketler dışarıya karşı kale, içeriye karşı açık ofis kuruyor.", [
      ["kedi", "Bu benzetme çok oturdu. Bizim şirket tam olarak böyle.", { "❤️": 27, "😂": 8 }, 5],
      ["ayi", "“Geçici diye açılmış erişimler” — hiçbiri geçici olmuyor, hiçbiri.", { "😂": 25 }, 4],
    ]);

    on("an-4:4", null, [
      ["ari", "Ortak klasörde parola dosyası aramak gerçekten ilk yapılan şey mi?", { "👀": 11 }, 4],
      ["kartal", "Evet. Ve neredeyse her zaman bulunuyor.", { "🤯": 26 }, 3, 0],
    ]);

    on("an-5:2", "Amaç fark edilmemek değil — fark edilse bile *ilginç görünmemek*.", [
      ["baykus", "Bu ayrımı hiç düşünmemiştim. Gizlenmek değil, sıradanlaşmak.", { "❤️": 24, "🔥": 9 }, 4],
      ["yildiz", "Dokuz gece boyunca kimsenin bakmaması en kötü kısım.", { "👀": 15 }, 3],
    ]);

    on("an-5:4", "sıradan önlemler gerçekten işe yarıyor", [
      ["kurbaga", "Beş adımın sonunda umutlu bitirmeniz iyi olmuş. Bölümü okurken içim daralmıştı.", { "❤️": 22 }, 3],
    ]);

    /* ======================================================================
       04 · BEYAZ ŞAPKA
       =================================================================== */

    pin("bs-acilis", 0.38, 0.55, [
      ["yelkovan", "Devre görselindeki magenta yolu takip ettim, tam ortadaki yongaya çıkıyor. Detaycılık.", { "❤️": 16 }, 6],
    ]);

    on("bs-1:2", "Sekiz yılda bir kere bile bir şifreleme algoritmasını kırmadım — kimse kırmıyor.", [
      ["sazan", "Filmlerin bize yaptığı kötülük. Herkes matematik kırılıyor sanıyor.", { "😂": 33, "❤️": 12 }, 5],
      ["turna", "Bu cümle bütün güvenlik bütçelerinin nereye gitmesi gerektiğini söylüyor aslında.", { "👍": 21 }, 4],
    ]);

    on("bs-1:5", "İyi güvenlik, kimseyi kaba olmaya zorlamayan güvenliktir.", [
      ["nilufer", "Tasarım felsefesi olarak da doğru bu. Kullanıcıyı suçlamayan sistem.", { "❤️": 28 }, 4],
      ["kirpi", "Turnike örneği çok gerçek. Ben de kapıyı tutardım, tutmaya da devam ederim herhâlde.", { "😅": 19 }, 3],
    ]);

    on("bs-2:4", "Bir çalışan oltaya geldiyse eğitim eksik değildir; tasarım eksiktir.", [
      ["kunduz", "Bunu yöneticime göstereceğim. Her olaydan sonra “eğitim verelim” diyoruz, hiçbir şey değişmiyor.", { "❤️": 37, "🔥": 14 }, 4],
      ["geyik", "Kısmen katılıyorum. Tasarım her şeyi çözmüyor, bir yerde insan kararı kalıyor.", { "👍": 18 }, 3],
      ["kunduz", "Tabii, ama insan kararının nerede kalacağını da tasarım seçiyor. Mesele orada.", { "❤️": 23 }, 3, 1],
      ["balina", "Utanç en kötü tepki kısmı da çok doğru. Kimse hata bildirmek istemiyor.", { "👀": 16 }, 2],
    ]);

    on("bs-3:5", "Orası kasa değil, kasanın anahtarlarının durduğu yer.", [
      ["kelebek", "Sekiz yıllık deneyimin tek cümleye inmesi. Kaydettim.", { "❤️": 31 }, 3],
      ["horoz", "E-postama ayrı bir passkey kurmaya gidiyorum, şu an.", { "🔥": 17 }, 2],
    ]);

    /* ======================================================================
       05 · BEŞ HAMLE
       =================================================================== */

    on("bh-2:0", null, [
      ["sincap", "Beş madde, hepsi bir akşam. Yıllardır aradığım liste buydu.", { "❤️": 34 }, 3],
      ["flamingo", "Sıranın önemli olması güzel bir detay. İlk ikisiyle başladım.", { "👍": 20 }, 2],
      ["kertenkele", "Yedek maddesini atlayan çok olur ama fidye yazılımında tek kurtaran o.", { "👍": 15 }, 2],
      ["tilki", "Parola yöneticisine geçmek ilk hafta zor, sonra geri dönemiyorsun.", { "❤️": 18 }, 2],
    ]);

    on("bh-3:1", "Parolayı üç ayda bir değiştirmek: gereksiz, hatta zararlı", [
      ["baykus", "Bunu iş yerimize kim söyleyecek? Hâlâ 90 günde bir zorluyorlar.", { "😂": 29, "👍": 11 }, 2],
      ["ayi", "Rehberler yıllar önce bunu geri aldı ama kurumsal politikalar hiç güncellenmiyor.", { "👍": 22 }, 2],
      ["kaplumbaga", "VPN maddesine de sevindim. Reklamlar onu görünmezlik pelerini gibi satıyor.", { "❤️": 24 }, 1],
    ]);

    /* ======================================================================
       06 · BULMACA
       =================================================================== */

    loose("gr-bl-1", [
      ["yildiz", "Öğretici tur harika kurulmuş. Tek halkayla “işte burada” dedim, sonra utandım.", { "😂": 31, "❤️": 12 }, 3],
      ["vinc", "Son turdaki gürültülü bantlar sayının tezini oynayarak anlatıyor. Bu bir bulmacadan fazlası.", { "🔥": 26 }, 2],
      ["kurbaga", "Dar açılı turda uzun süre uğraştım. Kötü geometri gerçekten zorlaştırıyormuş.", { "👍": 17 }, 2],
      ["balik", "Yazıyı okumadan oynadım, sonra yazıya döndüm. İkisi de daha iyi oldu.", { "❤️": 14 }, 1],
    ]);

    /* ======================================================================
       07 · SON
       =================================================================== */

    loose("gr-kunye", [
      ["guvercin", "“Yanlışlar bana ait” satırı için ayrı bir saygı.", { "❤️": 23 }, 2],
    ]);

    loose("gr-son", [
      ["kedi", "Bitirdim. Bir güvenlik yazısını sonuna kadar okuduğum ilk sefer.", { "❤️": 38, "🔥": 9 }, 2],
      ["ceylan", "Beş maddeden üçünü bu akşam yaptım. Kalan ikisi hafta sonu.", { "👍": 21 }, 2],
      ["orumcek", "Gelecek sayı “Islak Asfalt” mı? Kızıl Mevsim'den beri bekliyordum onu.", { "👀": 15 }, 1],
      ["kartal", "Arşivden Kızıl Mevsim'e geri dönebilmek çok iyi olmuş. Eski sayılar açık kalsın lütfen.", { "❤️": 27 }, 1],
    ]);

    /* ======================================================================
       ONAY KUYRUĞU — moderasyon paneli boş durmasın.
       Bu yorumlar hiçbir okura görünmez (status: pending).
       =================================================================== */

    on("gu-1:1", null, [
      ["horoz", "bu anlattıklarınız yasal mı ki yayınlıyorsunuz", {}, 5, null, { status: "pending" }],
    ]);
    on("an-2:3", null, [
      ["geyik", "aynı yöntemi denemek isteyen biri için araç önerir misiniz", {}, 4, null, { status: "pending" }],
    ]);
    on("bh-2:0", null, [
      ["kedi", "Hangi parola yöneticisini kullandığınızı yazabilir misiniz? Reklam gibi olmasın diye sormuyorum, gerçekten kararsızım.", {}, 3, null, { status: "pending" }],
    ]);
    loose("gr-bl-1", [
      ["karga", "bulmaca çok kolaydı bence uğraşmaya değmez", {}, 2, null, { status: "pending" }],
    ]);
  };
})(window.MAG);
