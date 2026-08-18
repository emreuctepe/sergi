/* Sayı 04 · "Gürültü" — bölüm 02 · gurultu */
(function (MAG) {
  "use strict";
  var section =
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
    }
  ;
  section.order = 2;
  MAG.defineSection("2026-10", section);
})(window.MAG);
