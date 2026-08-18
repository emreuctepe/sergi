/* Sayı 04 · "Gürültü" — bölüm 01 · editorden */
(function (MAG) {
  "use strict";
  var section =
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
    }
  ;
  section.order = 1;
  MAG.defineSection("2026-10", section);
})(window.MAG);
