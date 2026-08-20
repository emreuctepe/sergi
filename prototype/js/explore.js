/* ============================================================================
   EXPLORE — keşfet: başka dergiler
   ----------------------------------------------------------------------------
   ARŞİV İLE FARKI: arşiv yereldir, bu derginin kendi eski sayılarıdır. Keşfet
   başka dergileri gösterir; onların da kendi arşivleri var, biz dışarıdan
   bakıyoruz. Bu yüzden ikisi ayrı yüzey, ayrı menü satırı.

   IZGARA: Pinterest/Instagram kaydı — 3:4 kapaklar ve 1:1 kareler karışık.
   CSS `columns` kullanıyoruz, grid değil: kartlar kendi en-boy oranını
   koruyup sütunları doğal yükseklikleriyle dolduruyor. Grid'de aynı görünüm
   için satır birimi hesaplamak gerekirdi ve iki oran hiçbir satır biriminde
   birlikte tam oturmuyor.

   KİLİT: dergi bazında. Bir dergiyi açan, o an akışta ona bağlı KARELERİ de
   açmış olur — kilit kartta değil dergide duruyor. Jeton ekonomisi streak.js'te.
   ========================================================================= */

(function (MAG) {
  "use strict";

  var U = MAG.util;
  var E = MAG.exploreData;
  var S = MAG.streak;
  var O = MAG.overlays;
  var el = U.el;

  var X = {};
  var feed = null;
  var grid = null;
  var note = null;
  var query = "";
  var asking = null; /* onay bekleyen kartın anahtarı */

  X.open = function () {
    /* Akış oturum başına bir kez kuruluyor: her açılışta yeniden karılsaydı
       "az önce gördüğüm dergi" kaybolurdu. Sayfa yenilenince değişiyor. */
    if (!feed) feed = E.buildFeed();
    query = "";
    asking = null;

    var body = el("div.exp");

    var input = el("input.exp__search", {
      type: "search",
      placeholder: "Dergi, konu ya da etiket ara…",
      "aria-label": "Keşfette ara",
      oninput: function () {
        query = this.value.trim();
        asking = null;
        render();
      },
    });

    note = el("p.exp__note");
    grid = el("div.exp__grid");

    body.appendChild(el("div.exp__bar", null, [input, note]));
    body.appendChild(grid);

    render();
    O.modal(body, { title: "Keşfet", full: true });
  };

  /* ========================================================================
     ÇİZİM
     ===================================================================== */

  function render() {
    var kalan = S.left();
    note.textContent = kalan > 0 ? kalan + " dergi açabilirsin" : "";
    note.dataset.on = kalan > 0 ? "true" : "false";

    U.clear(grid);

    var list = feed.filter(function (it) {
      return E.matches(it, query);
    });

    if (!list.length) {
      grid.appendChild(el("p.exp__empty", { text: "“" + query + "” için bir şey yok." }));
      return;
    }

    list.forEach(function (item) {
      grid.appendChild(card(item));
    });
  }

  function keyOf(item) {
    return item.kind + ":" + item.mag.id + ":" + (item.page || item.no);
  }

  function card(item) {
    var m = item.mag;
    var acik = S.isUnlocked(m.id);
    var soruluyor = asking === keyOf(item);

    var node = el("button.exp-card", {
      type: "button",
      "data-kind": item.kind,
      "data-locked": acik ? null : "true",
      "data-ask": soruluyor ? "true" : null,
      "aria-label": acik ? m.name : m.name + " · kilitli",
      onclick: function (e) {
        onCardClick(e, item, acik);
      },
    });

    node.appendChild(
      el("span.exp-card__art", {
        html: item.kind === "cover" ? MAG.art.scene(m.scene) : MAG.art.photo(item.seed, "square"),
      })
    );

    if (item.kind === "cover") {
      node.appendChild(
        el("span.exp-card__meta", null, [
          el("b", { text: m.name }),
          el("span", { text: "№ " + U.pad2(item.no) + " · " + item.month }),
          el("span.exp-card__tag", { text: m.tagline }),
        ])
      );
    } else {
      node.appendChild(
        el("span.exp-card__meta", null, [
          el("span.exp-card__line", { text: m.line }),
          el("span", { text: m.name + " · s. " + item.page + " · " + item.pageKind }),
        ])
      );
    }

    if (!acik) node.appendChild(el("span.exp-card__lock", { text: "🔒", "aria-hidden": "true" }));

    if (acik) {
      /* Rozet kısa: mod adları tam yazılınca 4 sütunlu ızgarada kartın üst
         kenarını baştan başa kaplıyordu. Ayrıntı title'da. */
      var modes = (S.unlockInfo(m.id) || {}).modes || [];
      node.appendChild(
        el("span.exp-card__open", { text: modes.length + " mod", title: modes.join(" · ") + " açık" })
      );
    }

    if (soruluyor) node.appendChild(confirmLayer(m));

    return node;
  }

  /* Onay kartın İÇİNDE soruluyor, ayrı bir modal olarak değil: O.modal tek bir
     taşıyıcı kullanıyor, ikinci bir modal keşfeti kapatırdı. Jeton az ve geri
     alınamaz harcanıyor, o yüzden tek dokunuşla açmıyoruz. */
  function confirmLayer(m) {
    var grade = S.nextGrade();
    var modes = S.modesFor(grade);
    return el("span.exp-ask", null, [
      el("b", { text: m.name + " açılsın mı?" }),
      el("span", { text: "1 jeton · " + modes.join(", ") + " modları" }),
      el("span.exp-ask__row", null, [
        el("span.exp-ask__yes", {
          role: "button",
          text: "Aç",
          onclick: function (e) {
            e.stopPropagation();
            if (S.unlock(m.id)) {
              O.toast(m.name + " açıldı · " + modes.join(", "));
            }
            asking = null;
            render();
          },
        }),
        el("span.exp-ask__no", {
          role: "button",
          text: "Vazgeç",
          onclick: function (e) {
            e.stopPropagation();
            asking = null;
            render();
          },
        }),
      ]),
    ]);
  }

  function onCardClick(e, item, acik) {
    if (e.target.closest(".exp-ask")) return;

    if (acik) {
      O.toast(item.mag.name + " yakında okunabilir olacak.");
      return;
    }
    if (S.left() < 1) {
      /* Kuralı burada anlatıyoruz — okur zaten kilide dokunmuş, merak etmiş. */
      O.toast("Bir sayıyı bitirdiğinde bir dergi açılır.");
      return;
    }
    asking = keyOf(item);
    render();
  }

  /** Akışı yeniden karar (konsoldan denemek için). */
  X.reshuffle = function () {
    feed = E.buildFeed();
    if (grid) render();
    return feed.length + " kart";
  };

  MAG.explore = X;
})(window.MAG);
