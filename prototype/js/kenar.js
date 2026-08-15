/* ============================================================================
   KENAR — kenar rayı / dokuma  (yorum sunumu, Yol A)
   ----------------------------------------------------------------------------
   Gerekçe ve karşılaştırma: docs/YORUM-SISTEMI.md §4 "Yol A".

   Kullanıcının tarif ettiği şeyin birebir karşılığı: cümleyi ve ona iliştirilen
   sesi AYNI ANDA okumak. İki biçimi var, ekrana göre kendisi seçer:

     ray    (geniş ekran) — kartlar TUVALİN DIŞINA, sağdaki boşluğa (letterbox
             gutter) çıkar. Dergi objesine hiç dokunulmaz, metin tam genişlikte
             kalır; her kart ait olduğu bloğun tam yanında, kenar boşluğunda
             durur. Çakışanlar aşağı itilir, sığmayanlar "+N daha" hapına toplanır.
     dokuma (telefon) — kenar yok, çünkü ekranın kenarı yok. Aynı veri bloğun
             HEMEN ARDINA tek satırlık ince bir şerit olarak iner. Dokun → yerinde
             3 satıra açılır. Tekrar dokun → thread. Yorumlu sayfa uzar.

   Ray'ın gutter'a taşınması (v2): önce kartlar tuvalin İÇİNDE metni %60'a
   daraltarak duruyordu — okuma sütunu daralıyor, kartlar metnin üstüne biniyordu.
   Artık kartlar tuvalin dışında, sağ boşlukta; dergi tam 3:4 ve temiz kalıyor,
   yorumlar gerçek bir dergi kenar notu gibi yanında duruyor.

   Gutter rayı tuvalin DIŞINDA (ölçekten etkilenmez) olduğu için hizalama artık
   görsel koordinatla (getBoundingClientRect): blok ölçekli tuvalin içinde,
   ekranda nerede görünüyorsa kart da orada. İkisi de ekran koordinatında, tutar.
   Kartlar tuvalle birlikte kaymadığı için kaydırmada JS ile yeniden konumlanır.

   Kapsam: ray/dokuma yalnızca METİN sayfalarında. Tam kanama görsel, kapak,
   manga, bulmaca, sayı sonu kendi düzeniyle kalır; blok yorumu eski rozet+thread'e
   düşer, nokta pinleri her yerde çalışır.

   Fısıltı gibi bu da tek dosya + tek CSS bölümü: B5'te kaybederse silmesi ucuz.
   ========================================================================= */

(function (MAG) {
  "use strict";

  var U = MAG.util;
  var C = MAG.comments;
  var State = MAG.state;
  var el = U.el;

  var K = {};

  var RAIL_GAP = 10; /* kartlar arası en az boşluk (px) */
  var RAIL_MIN_CANVAS = 520; /* tuval bundan darsa ray yerine dokuma */
  var RAIL_FIT_MIN = 150; /* sağ boşluk bundan darsa ray sığmaz → dokuma */
  var RAIL_MAX_W = 300; /* ray en fazla bu kadar genişler */
  var RAIL_OUT_GAP = 14; /* tuval ile ray arası */
  var RAIL_EDGE = 12; /* ray ile ekran kenarı arası */

  var host = null; /* .rail-gutter — tek, #shell içinde, tuvalin sağında */
  var items = []; /* [{ card, node, ids, contain }] — o anki sayfanın kartları */

  /* ------------------------------------------------------------------------
     AÇIK MI, HANGİ BİÇİM?
     --------------------------------------------------------------------- */

  K.active = function () {
    return State.get("commentUI", "whisper") === "rail" && C.layerOn();
  };

  /** Ray/dokuma yalnızca metin sayfalarında; görsel/manga/kapak dışarıda. */
  function textPage(p) {
    return p.bleed !== "full" && ["cover", "manga", "outro", "puzzle"].indexOf(p.kind) < 0;
  }

  /**
   * Ekranı ölç: ray mı dokuma mı, ray boşluğu ne kadar, tuval nerede.
   * Ray için tuval yeterince geniş (metin okunur kalsın) VE sağda ray sığacak
   * kadar boşluk olmalı. İkisi de yoksa dokumaya düşülür.
   */
  function measure() {
    var canvas = U.$("#canvas");
    var cr = canvas.getBoundingClientRect();
    var gutter = window.innerWidth - cr.right - RAIL_OUT_GAP - RAIL_EDGE;
    var fits = canvas.clientWidth >= RAIL_MIN_CANVAS && gutter >= RAIL_FIT_MIN;
    return {
      form: fits ? "rail" : "weave",
      gutterW: Math.min(gutter, RAIL_MAX_W),
      top: canvas.offsetTop,
      h: canvas.offsetHeight,
    };
  }

  /* ------------------------------------------------------------------------
     ORTAK — bir bloğun temsilci sesi + toplamı
     --------------------------------------------------------------------- */

  function voiceOf(blockId, pageId) {
    var roots = C.rootsFor({ blockId: blockId, pageId: pageId });
    if (!roots.length) return null;
    var rep = C.representative(roots);
    var total = roots.reduce(function (n, c) {
      return n + C.threadSize(c.id);
    }, 0);
    return { roots: roots, rep: rep, total: total, ids: roots.map(function (c) { return c.id; }) };
  }

  function whereLabel(rep, blockId) {
    var q = C.quoteOf(rep);
    if (q) return { quote: q, label: null };
    if (rep.anchorType === "point") return { quote: null, label: "görselde" };
    return { quote: null, label: C.blockLabel(blockId) };
  }

  /* ------------------------------------------------------------------------
     RAY (geniş ekran, tuvalin dışında)
     --------------------------------------------------------------------- */

  function railCard(v, blockId, pageId) {
    var w = whereLabel(v.rep, blockId);
    return el(
      "button.rail-card",
      {
        type: "button",
        "data-comment-ids": v.ids.join(","),
        "data-pending": v.rep.status === "pending" ? "true" : null,
        onclick: function () {
          MAG.overlays.openThread({ blockId: blockId, pageId: pageId });
        },
        "aria-label": v.rep.author.name + ": " + v.rep.body + (v.total > 1 ? " — ve " + (v.total - 1) + " ses daha" : ""),
      },
      [
        el("span.rail-card__head", null, [
          el("span.rail-card__dot", { style: { "--c": v.rep.author.color }, text: v.rep.author.emoji }),
          el("b.rail-card__name", { text: v.rep.author.name }),
          v.rep.status === "pending" ? el("i.rail-card__pending", { text: "onayda" }) : null,
        ]),
        w.quote ? el("span.rail-card__quote", { text: "“" + w.quote + "”" }) : null,
        el("span.rail-card__body", { text: v.rep.body }),
        v.total > 1 ? el("span.rail-card__more", { text: "+" + (v.total - 1) + " ses" }) : null,
      ]
    );
  }

  function ensureHost() {
    if (host && host.parentNode) return host;
    host = el("div.rail-gutter");
    U.$("#shell").appendChild(host);
    return host;
  }

  function hideHost() {
    items = [];
    if (host) {
      U.clear(host);
      host.dataset.on = "false";
    }
  }

  /** O anki sayfanın kartlarını (yeniden) kur ve tuvalin sağ boşluğuna yerleştir. */
  function renderRail(m) {
    ensureHost();
    U.clear(host);
    items = [];

    var p = MAG.canvas.currentPage();
    if (!p || !textPage(p)) {
      host.dataset.on = "false";
      return;
    }
    var blocks = U.$$("[data-block-id][data-comments]", p.el);
    if (!blocks.length) {
      host.dataset.on = "false";
      return;
    }

    host.dataset.on = "true";
    host.style.setProperty("--rail-top", m.top + "px");
    host.style.setProperty("--rail-h", m.h + "px");
    host.style.setProperty("--rail-w", Math.round(m.gutterW) + "px");

    var contain = p.fit !== "scroll";
    blocks.forEach(function (node) {
      var blockId = node.getAttribute("data-block-id");
      var v = voiceOf(blockId, p.id);
      if (!v) return;
      var card = railCard(v, blockId, p.id);
      host.appendChild(card);
      items.push({ card: card, node: node, ids: v.ids, contain: contain });
    });
    positionRail();
  }

  /**
   * Kartları bloklarının GÖRSEL hizasına koy. Kaydırmada her karede çağrılır:
   * tuval kaydıkça bloklar hareket eder, kartlar takip eder. Görünmez alandaki
   * (yukarı/aşağı kaymış) kartlar gizlenir; çakışanlar aşağı itilir; contain
   * sayfada sığmayanlar "+N daha" hapına düşer (scroll sayfada kaydırınca çıkar).
   */
  function positionRail() {
    if (!host || !items.length) return;
    var oldPill = U.$(".rail__more", host);
    if (oldPill) oldPill.remove();

    var hostRect = host.getBoundingClientRect();
    var H = host.clientHeight;
    items.forEach(function (it) {
      var r = it.node.getBoundingClientRect();
      it.desired = r.top - hostRect.top;
      it.h = it.card.offsetHeight;
    });

    var last = -Infinity;
    var overflow = [];
    items.forEach(function (it) {
      /* blok görünür şeridin tamamen ÜSTÜNDE (yalnız scroll sayfada olur, yukarı
         kaydırılmış) → sessizce gizle, geri kaydırınca gelir */
      if (it.desired + it.h < 0) {
        it.card.style.display = "none";
        return;
      }
      var top = Math.max(it.desired, last + RAIL_GAP, 0);
      if (top + it.h > H && last > -Infinity) {
        /* sığmadı. contain sayfada kaydırma yok → hapa topla; scroll sayfada
           aşağı kaydırınca zaten görünecek → sessizce gizle. */
        if (it.contain) overflow.push(it);
        it.card.style.display = "none";
        return;
      }
      it.card.style.display = "";
      it.card.style.top = Math.round(top) + "px";
      last = top + it.h;
    });

    if (overflow.length) {
      var ids = [];
      overflow.forEach(function (it) {
        ids = ids.concat(it.ids);
      });
      host.appendChild(
        el("button.rail__more", {
          type: "button",
          text: "+" + overflow.length + " daha",
          onclick: function () {
            MAG.overlays.openThread({ ids: ids });
          },
        })
      );
    }
  }

  /* ------------------------------------------------------------------------
     DOKUMA (telefon)
     --------------------------------------------------------------------- */

  function weaveStrip(v, blockId, pageId) {
    var w = whereLabel(v.rep, blockId);
    var strip = el(
      "button.weave",
      {
        type: "button",
        "data-comment-ids": v.ids.join(","),
        "data-pending": v.rep.status === "pending" ? "true" : null,
        "aria-label": v.rep.author.name + ": " + v.rep.body,
      },
      [
        el("span.weave__dot", { style: { "--c": v.rep.author.color }, text: v.rep.author.emoji }),
        el("span.weave__text", null, [
          w.quote ? el("span.weave__quote", { text: "“" + w.quote + "”" }) : null,
          el("span.weave__body", { text: v.rep.body }),
        ]),
        v.total > 1 ? el("span.weave__more", { text: "+" + (v.total - 1) }) : null,
        el("span.weave__chev", { text: "›", "aria-hidden": "true" }),
      ]
    );
    /* kapalı → dokun → yerinde açıl (3 satır); açık → dokun → thread */
    strip.addEventListener("click", function () {
      if (strip.dataset.open) {
        MAG.overlays.openThread({ blockId: blockId, pageId: pageId });
      } else {
        strip.dataset.open = "1";
      }
    });
    return strip;
  }

  /** Şerit bloğun hemen ardına. Üst blok → kardeş; alt blok (li/panel) → içine. */
  function placeStrip(node, strip) {
    if (node.classList.contains("blk")) {
      if (node.nextSibling) node.parentNode.insertBefore(strip, node.nextSibling);
      else node.parentNode.appendChild(strip);
    } else {
      node.appendChild(strip);
    }
  }

  function buildWeave(p) {
    var blocks = U.$$("[data-block-id][data-comments]", p.el);
    if (!blocks.length) return;
    var any = false;
    blocks.forEach(function (node) {
      var blockId = node.getAttribute("data-block-id");
      var v = voiceOf(blockId, p.id);
      if (!v) return;
      placeStrip(node, weaveStrip(v, blockId, p.id));
      any = true;
    });
    if (any) p.el.setAttribute("data-kenar-grow", ""); /* sayfa uzasın (CSS) */
  }

  /* ------------------------------------------------------------------------
     KURULUM / TEMİZLİK
     --------------------------------------------------------------------- */

  function clearWeaves() {
    U.$$(".weave").forEach(function (n) {
      n.remove();
    });
    U.$$("[data-kenar-grow]").forEach(function (n) {
      n.removeAttribute("data-kenar-grow");
    });
  }

  K.layout = function () {
    clearWeaves();
    var root = document.documentElement;
    if (!K.active()) {
      root.dataset.kenar = "off";
      hideHost();
      return;
    }
    var m = measure();
    root.dataset.kenar = m.form;
    if (m.form === "rail") {
      renderRail(m);
    } else {
      hideHost();
      MAG.canvas.pages().forEach(function (p) {
        if (textPage(p)) buildWeave(p);
      });
    }
  };

  /** Sadece konumları tazele (kart kurmadan) — kaydırmanın ucuz yolu. */
  K.reposition = function () {
    if (K.active() && document.documentElement.dataset.kenar === "rail") positionRail();
  };

  K.init = function () {
    /* Tek kapı: her decorate sonrası (ekleme, stres, moderasyon) tazele. */
    U.listen("comments:decorated", K.layout);
    U.listen("comment:reaction", K.layout); /* tepki decorate etmez ama temsilci değişebilir */
    U.listen("comments:layer", K.layout);
    U.listen("state:change", function (e) {
      if (e.detail.path === "commentUI") K.layout();
    });
    /* sayfa değişince o sayfanın kartlarını yeniden kur */
    U.listen("page:change", function () {
      if (!K.active()) return;
      var m = measure();
      if (m.form === "rail") renderRail(m);
    });
    /* kaydırdıkça kartlar bloklarını takip eder (gutter tuvalle kaymaz) */
    MAG.canvas.scroller().addEventListener("scroll", U.raf(K.reposition), { passive: true });
    /* Eş okuma açılınca tuval scale(0.965)'e geçiyor (260ms). İlk konumlama bu
       geçiş biterken eski konumu yakalayıp ~13px kayabiliyor; geçiş bitince
       kartları yeniden hizala. */
    U.$("#canvas").addEventListener("transitionend", function (e) {
      if (e.propertyName === "transform") K.reposition();
    });
    /* ekran değişince biçim (ray↔dokuma) ve boşluk yeniden ölçülür */
    window.addEventListener("resize", U.debounce(K.layout, 160));

    K.layout();
  };

  MAG.kenar = K;
})(window.MAG);
