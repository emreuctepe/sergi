/* Sayı 04 · "Gürültü" — 2026-10 · meta + tanıtım + bulmaca havuzu
   Bölümler: js/issues/2026-10/sections/*.js (her biri MAG.defineSection). */
(function (MAG) {
  "use strict";

  var issue = {
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

  var intro = [
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

  var puzzles = [
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

  MAG.defineIssue(issue, intro, puzzles);
})(window.MAG);
