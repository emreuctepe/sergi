/* Sayı 04 · "Gürültü" — bölüm 00 · kapak */
(function (MAG) {
  "use strict";
  var section =
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
    }
  ;
  section.order = 0;
  MAG.defineSection("2026-10", section);
})(window.MAG);
