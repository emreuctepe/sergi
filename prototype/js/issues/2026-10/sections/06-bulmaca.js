/* Sayı 04 · "Gürültü" — bölüm 06 · bulmaca */
(function (MAG) {
  "use strict";
  var section =
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
    }
  ;
  section.order = 6;
  MAG.defineSection("2026-10", section);
})(window.MAG);
