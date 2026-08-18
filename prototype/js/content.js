/* ============================================================================
   CONTENT — bölüm bölüm yazılan sayıları toplayan hafif birleştirici
   ----------------------------------------------------------------------------
   Bir sayıyı tek dev dosya yerine küçük parçalardan kurmak için:

     js/issues/<slug>/issue.js            → MAG.defineIssue(issue, intro, puzzles)
     js/issues/<slug>/sections/NN-*.js    → MAG.defineSection(slug, { order, … })

   Her parça kendini kaydeder; burada sıraya dizilip tek bir MAG.issues[slug]
   nesnesine (eski tek-dosya biçimiyle birebir aynı şekil) toplanır. data.js
   hiçbir şeyin bölündüğünü bilmez.

   Sıra dosya adı önekinden değil, açıkça verilen `order` alanından gelir
   (0,1,2…). Kayıt sırasından bağımsız çalışır: issue.js ssection'lardan önce de
   sonra da yüklense sonuç aynıdır (her kayıtta yeniden toplanır).

   Eski tek-dosya sayıları (kendini doğrudan MAG.issues'a yazanlar) aynen çalışır;
   bu birleştirici yalnızca defineSection/defineIssue kullanan sayılara dokunur.
   ========================================================================= */
window.MAG = window.MAG || {};

(function (MAG) {
  "use strict";

  var pending = {};

  function bucket(slug) {
    return pending[slug] || (pending[slug] = { sections: [] });
  }

  function assemble(slug) {
    var b = pending[slug];
    if (!b || !b.issue) return; /* issue henüz tanımlı değil — sonra toplanır */
    var sections = b.sections.slice().sort(function (a, c) {
      var ao = a.order == null ? 1e9 : a.order;
      var co = c.order == null ? 1e9 : c.order;
      return ao - co;
    });
    (MAG.issues = MAG.issues || {})[slug] = {
      issue: b.issue,
      intro: b.intro || [],
      sections: sections,
      puzzles: b.puzzles || [],
    };
  }

  /** Bir bölümü kaydeder. `section.order` (0,1,2…) sırayı belirler. */
  MAG.defineSection = function (slug, section) {
    bucket(slug).sections.push(section);
    assemble(slug); /* issue zaten geldiyse anında tazele */
    return section;
  };

  /** Sayının meta'sını (issue), tanıtımını (intro) ve bulmaca havuzunu kaydeder. */
  MAG.defineIssue = function (issue, intro, puzzles) {
    var b = bucket(issue.slug);
    b.issue = issue;
    b.intro = intro || [];
    b.puzzles = puzzles || [];
    assemble(issue.slug);
    return issue;
  };

  MAG.content = { pending: pending, assemble: assemble };
})(window.MAG);
