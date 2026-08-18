/* Sayı 04 · "Gürültü" — bölüm 07 · son */
(function (MAG) {
  "use strict";
  var section =
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
    }
  ;
  section.order = 7;
  MAG.defineSection("2026-10", section);
})(window.MAG);
