/* ============================================================================
   COMMENTS — blok ankrajı, alıntı ısısı, temsilci ses
   ----------------------------------------------------------------------------
   Tasarım kararları ve gerekçeleri: docs/YORUM-SISTEMI.md

   Ankraj iki seviyede, zarifçe düşer:
     block → içerik ağacındaki bir blok  (`pageId:index[.alt]`)
     point → tuvale göre normalize {x,y} (0-1), yalnızca görseller için
     page  → blok bulunamazsa (ancak içerik gerçekten silinmişse). ASLA KAYBOLMAZ.

   `quote` ankraj DEĞİLDİR: okurun alıntıladığı cümle, yorumun kendi alanıdır.
   Sayfadaki <mark> artık "burada bir yorum var" demiyor — "bu cümleyi kaç kişi
   alıntıladı" diyor. Bu ayrım olmadan aynı cümleye ikinci yorum yazılamıyordu.
   ========================================================================= */

(function (MAG) {
  "use strict";

  var U = MAG.util;
  var D = MAG.data;
  var State = MAG.state;
  var el = U.el;

  var C = {};
  var layerOn = false;
  var flood = []; /* stres modu — yalnızca bellekte, bkz. js/debug.js */

  /* Bu kadar yakın iki pin tek kümede toplanır (tuval GENİŞLİĞİ biriminde —
     3:4 tasarım oranı sabit olduğu için her ekranda aynı görsel mesafe).
     Pin noktası 8.5cqi; 0.14 kabaca 1.5 pin genişliği, yani değmeden önceki
     son mesafe. */
  var CLUSTER_R = 0.14;

  /* Bir sayfa bundan fazla pin göstermez. Yoğunluk artınca pinler seyrelmez,
     KABALAŞIR: en yakın iki küme birleşir. Konum anlamı korunur, sayı sınırlı
     kalır. "Yorum arttıkça işaret çoğalmasın, koyulaşsın" kuralının pin hâli. */
  var MAX_PINS = 6;

  /* Editör öne çıkarınca temsilci ses kesin o olsun diye kaba bir ağırlık. */
  var FEATURED_WEIGHT = 100;

  /* ------------------------------------------------------------------------
     VERİ
     --------------------------------------------------------------------- */

  var visCache = null;

  function invalidate() {
    visCache = null;
  }
  C.invalidate = invalidate;

  /** Tohum yorumlar + stres modu + okurun kendi yazdıkları. */
  C.all = function () {
    return D.comments.concat(flood, State.get("comments", []) || []);
  };

  /** Okurun görebildikleri: yayımlanmışlar + kendi bekleyenleri. */
  C.visible = function () {
    if (visCache) return visCache;
    var me = MAG.identity.me();
    visCache = C.all().filter(function (c) {
      return c.status !== "rejected" && (c.status !== "pending" || (c.author && c.author.id === me.id));
    });
    return visCache;
  };

  C.setFlood = function (list) {
    flood = list || [];
    invalidate();
  };

  C.forPage = function (pageId) {
    return C.visible().filter(function (c) {
      return c.pageId === pageId;
    });
  };

  C.roots = function (pageId) {
    return C.forPage(pageId).filter(function (c) {
      return !c.parentId;
    });
  };

  C.replies = function (id) {
    return C.visible()
      .filter(function (c) {
        return c.parentId === id;
      })
      .sort(function (a, b) {
        return a.createdAt - b.createdAt;
      });
  };

  C.byId = function (id) {
    var all = C.all();
    for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i];
    return null;
  };

  C.total = function () {
    return C.visible().length;
  };

  /** Bir ankraj (kök yorum) altındaki tüm dal — sayaç için. */
  function threadSize(rootId) {
    var n = 1;
    C.replies(rootId).forEach(function (r) {
      n += threadSize(r.id);
    });
    return n;
  }
  C.threadSize = threadSize;

  /* ------------------------------------------------------------------------
     ANKRAJ OKUMA
     --------------------------------------------------------------------- */

  C.blockIdOf = function (c) {
    return c && c.anchor && c.anchor.type === "block" ? c.anchor.blockId : null;
  };

  C.quoteOf = function (c) {
    return (c && c.quote && c.quote.exact) || null;
  };

  var KIND_LABEL = {
    p: "paragraf",
    lead: "giriş",
    pull: "alıntı",
    quote: "alıntı",
    h1: "başlık",
    h2: "başlık",
    h3: "başlık",
    kicker: "üst başlık",
    caption: "alt yazı",
    note: "not",
    byline: "künye",
    dialog: "söyleşi satırı",
    stat: "sayılar",
    rule: "ayraç",
    "list-item": "madde",
    "manga-item": "panel",
    manga: "manga sayfası",
    cover: "kapak",
  };

  /** Blok kimliğinden okunur bir ad — thread başlığında kullanılır. */
  C.blockLabel = function (blockId) {
    var node = blockId && U.$('[data-block-id="' + blockId + '"]');
    var kind = node && node.getAttribute("data-block-kind");
    return KIND_LABEL[kind] || "bu bölüm";
  };

  /* ------------------------------------------------------------------------
     TEMSİLCİ SES — bir blokta kaç yorum olursa olsun sayfada tek ses görünür
     --------------------------------------------------------------------- */

  C.score = function (c) {
    var rx = 0;
    Object.keys(c.reactions || {}).forEach(function (k) {
      rx += c.reactions[k];
    });
    return 2 * rx + (threadSize(c.id) - 1) + (c.featured ? FEATURED_WEIGHT : 0);
  };

  /** En yüksek puanlı yorum; eşitlikte yeni olan kazanır. */
  C.representative = function (list) {
    var best = null;
    var bestScore = -Infinity;
    (list || []).forEach(function (c) {
      var s = C.score(c);
      if (s > bestScore || (s === bestScore && best && c.createdAt > best.createdAt)) {
        best = c;
        bestScore = s;
      }
    });
    return best;
  };

  /**
   * Bir seçim tanımına karşılık gelen kök yorumlar.
   * Thread paneli ve (ileride) sunum yolları hep buradan besleniyor.
   *   { rootId } | { ids: [] } | { blockId } | { quote, pageId } | { pageId }
   */
  C.rootsFor = function (sel) {
    sel = sel || {};
    if (sel.rootId) {
      var one = C.byId(sel.rootId);
      return one ? [one] : [];
    }
    if (sel.ids) {
      return sel.ids
        .map(function (id) {
          return C.byId(id);
        })
        .filter(Boolean);
    }
    if (sel.blockId) {
      return C.visible().filter(function (c) {
        return !c.parentId && C.blockIdOf(c) === sel.blockId && (!sel.quote || C.quoteOf(c) === sel.quote);
      });
    }
    if (sel.quote) {
      return C.visible().filter(function (c) {
        return !c.parentId && C.quoteOf(c) === sel.quote && (!sel.pageId || c.pageId === sel.pageId);
      });
    }
    if (sel.pageLevel) {
      return C.roots(sel.pageId).filter(function (c) {
        return c._degraded || c.anchorType === "page";
      });
    }
    return C.roots(sel.pageId);
  };

  /* ------------------------------------------------------------------------
     YAZMA
     --------------------------------------------------------------------- */

  C.add = function (opts) {
    var me = MAG.identity.me();
    var verified = State.isVerified();
    var comment = {
      id: U.uid("c"),
      pageId: opts.pageId,
      sectionSlug: opts.sectionSlug || "",
      parentId: opts.parentId || null,
      anchorType: opts.anchor ? opts.anchor.type : "page",
      anchor: opts.anchor || null,
      quote: opts.quote ? { exact: opts.quote } : null,
      featured: false,
      depthMode: State.depth(),
      locale: State.get("locale", "tr"),
      body: opts.body,
      author: { id: me.id, name: me.displayName, emoji: me.emoji, color: me.color, mine: true },
      status: verified ? "published" : "pending",
      createdAt: Date.now(),
      reactions: {},
    };
    var mine = State.get("comments", []) || [];
    mine.push(comment);
    State.set("comments", mine);
    invalidate();
    C.decorate();
    C.updateCount();
    U.emit("comment:added", { comment: comment, verified: verified });
    return comment;
  };

  C.react = function (commentId, emoji) {
    var c = C.byId(commentId);
    if (!c) return;
    var mine = State.get("reactions", {}) || {};
    var list = mine[commentId] || [];
    var idx = list.indexOf(emoji);
    c.reactions = c.reactions || {};
    if (idx >= 0) {
      list.splice(idx, 1);
      c.reactions[emoji] = Math.max(0, (c.reactions[emoji] || 1) - 1);
      if (!c.reactions[emoji]) delete c.reactions[emoji];
    } else {
      list.push(emoji);
      c.reactions[emoji] = (c.reactions[emoji] || 0) + 1;
    }
    mine[commentId] = list;
    State.set("reactions", mine);

    /* okurun kendi yorumuysa kalıcı listede de güncelle */
    var own = State.get("comments", []) || [];
    own.forEach(function (o) {
      if (o.id === commentId) o.reactions = c.reactions;
    });
    State.set("comments", own);
    invalidate();
    U.emit("comment:reaction", { id: commentId });
    return c.reactions;
  };

  C.myReactions = function (commentId) {
    return (State.get("reactions", {}) || {})[commentId] || [];
  };

  /* ------------------------------------------------------------------------
     ESKİ ANKRAJLARIN TAŞINMASI
     Okurun daha önce bıraktığı `text` ankrajlı yorumlar kaybolmasın diye:
     metni sayfada bir kez ara, bulduğun bloğa bağla, metni `quote` alanına taşı.
     --------------------------------------------------------------------- */

  function migrateLegacy(pageEl, c) {
    if (c.anchorType !== "text") return;
    var exact = (c.anchor && c.anchor.exact) || "";
    var blockId = exact ? findBlockContaining(pageEl, exact) : null;

    c.quote = c.quote || (exact ? { exact: exact } : null);
    if (blockId) {
      c.anchorType = "block";
      c.anchor = { type: "block", blockId: blockId };
    } else {
      c.anchorType = "page";
      c.anchor = null;
    }

    /* okurun kendi yorumuysa taşınmış hâlini kalıcılaştır */
    var own = State.get("comments", []) || [];
    var touched = false;
    own.forEach(function (o) {
      if (o.id === c.id) {
        o.anchorType = c.anchorType;
        o.anchor = c.anchor;
        o.quote = c.quote;
        touched = true;
      }
    });
    if (touched) State.set("comments", own);
  }

  function findBlockContaining(pageEl, exact) {
    var blocks = U.$$("[data-block-id]", pageEl);
    /* en derin (en küçük) eşleşme kazansın: alt bloklar önce denenir */
    for (var i = blocks.length - 1; i >= 0; i--) {
      if (blocks[i].textContent.indexOf(exact) >= 0) return blocks[i].getAttribute("data-block-id");
    }
    return null;
  }

  /* ------------------------------------------------------------------------
     ALINTI ISISI — bir cümleyi kaç kişi alıntıladıysa o kadar koyu
     --------------------------------------------------------------------- */

  function textNodesIn(root) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (!n.nodeValue || !n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        if (n.parentElement.closest(".anno, .pin, .comment-badge")) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    var out = [];
    var n;
    while ((n = walker.nextNode())) out.push(n);
    return out;
  }

  /**
   * Alıntıyı KENDİ BLOĞU içinde ara ve tek bir <mark> ile sar.
   * Arama bloğa kapalı olduğu için "sayfadaki ilk eşleşme yanlış yere düşüyor"
   * sorunu ortadan kalkıyor. Aynı cümleyi 40 kişi alıntılasa da işaret tektir.
   */
  function markQuote(scope, exact, count, blockId) {
    var nodes = textNodesIn(scope);
    for (var i = 0; i < nodes.length; i++) {
      var at = nodes[i].nodeValue.indexOf(exact);
      if (at < 0) continue;
      var range = document.createRange();
      range.setStart(nodes[i], at);
      range.setEnd(nodes[i], at + exact.length);
      var mark = el("mark.anno", {
        "data-quote": exact,
        "data-block-id": blockId || null,
        "data-heat": heatLevel(count),
        "data-count": count,
        tabindex: "0",
        role: "button",
        "aria-label": count + " okur bu cümleyi alıntıladı: " + exact.slice(0, 40),
      });
      try {
        range.surroundContents(mark);
        return true;
      } catch (e) {
        return false; /* öğe sınırını aşan alıntı — işaretlenmez, yorum yine yerinde */
      }
    }
    return false;
  }

  function heatLevel(n) {
    return n >= 15 ? 4 : n >= 5 ? 3 : n >= 2 ? 2 : 1;
  }
  C.heatLevel = heatLevel;

  /* ------------------------------------------------------------------------
     PİN KÜMELENMESİ — üst üste binen işaret yok
     --------------------------------------------------------------------- */

  /* y normalize yükseklik cinsinden; genişlik birimine çevirmek için 4/3.
     (3:4 TASARIM oranı — ekranın gerçek oranı değil, bilerek.) */
  function pinDist(a, b) {
    var dx = a.x - b.x;
    var dy = (a.y - b.y) * (4 / 3);
    return Math.sqrt(dx * dx + dy * dy);
  }

  function merge(a, b) {
    var n = a.items.length + b.items.length;
    a.x = (a.x * a.items.length + b.x * b.items.length) / n;
    a.y = (a.y * a.items.length + b.y * b.items.length) / n;
    a.items = a.items.concat(b.items);
    return a;
  }

  /**
   * `trace` verilirse her birleşme kaydedilir — hangi nokta hangi kümeye,
   * hangi mesafede, yarıçap kuralıyla mı yoksa pin sınırı yüzünden mi katıldı.
   * Yalnızca hata ayıklama görünümü kullanıyor (js/debug.js → MAG.pins).
   */
  function clusterPoints(list, trace) {
    var groups = [];
    list.forEach(function (c) {
      var p = { x: c.anchor.x, y: c.anchor.y, items: [c] };
      for (var i = 0; i < groups.length; i++) {
        var d0 = pinDist(groups[i], p);
        if (d0 <= CLUSTER_R) {
          if (trace) {
            trace.push({ kind: "radius", id: c.id, x: p.x, y: p.y, cx: groups[i].x, cy: groups[i].y, d: d0 });
          }
          return merge(groups[i], p);
        }
      }
      groups.push(p);
    });

    /* sınırı aşarsak en yakın iki kümeyi birleştirerek in */
    while (groups.length > MAX_PINS) {
      var bestI = 0;
      var bestJ = 1;
      var bestD = Infinity;
      for (var i = 0; i < groups.length; i++) {
        for (var j = i + 1; j < groups.length; j++) {
          var d = pinDist(groups[i], groups[j]);
          if (d < bestD) {
            bestD = d;
            bestI = i;
            bestJ = j;
          }
        }
      }
      if (trace) {
        trace.push({
          kind: "cap",
          x: groups[bestJ].x,
          y: groups[bestJ].y,
          cx: groups[bestI].x,
          cy: groups[bestI].y,
          d: bestD,
          ids: groups[bestJ].items.map(function (c) {
            return c.id;
          }),
        });
      }
      merge(groups[bestI], groups[bestJ]);
      groups.splice(bestJ, 1);
    }
    return groups;
  }

  C.clusterPoints = clusterPoints;
  C.pinDist = pinDist;
  C.CLUSTER_R = CLUSTER_R;
  C.MAX_PINS = MAX_PINS;

  /* ------------------------------------------------------------------------
     SAYFA SÜSLEME — her çizimden sonra çağrılır
     --------------------------------------------------------------------- */

  C.decorate = function () {
    invalidate();
    MAG.canvas.pages().forEach(decoratePage);
    /* Süsleme bittiğinde sunum katmanları (Fısıltı, Kenar) kendini tazeler.
       Tek kapı: yorum eklensin, tepki gelsin, stres modu bassın, moderasyon
       onaylasın — hepsi decorate'ten geçer, hepsi buradan haber alır. */
    U.emit("comments:decorated", {});
  };

  function decoratePage(p) {
    /* --- eski süslemeleri temizle --- */
    U.$$(".anno", p.el).forEach(function (m) {
      var parent = m.parentNode;
      while (m.firstChild) parent.insertBefore(m.firstChild, m);
      parent.removeChild(m);
      parent.normalize();
    });
    U.$$("[data-comments]", p.el).forEach(function (b) {
      b.removeAttribute("data-comments");
      b.removeAttribute("data-top-comment");
    });
    var oldPins = U.$(".page__pins", p.el);
    if (oldPins) oldPins.remove();

    var roots = C.roots(p.id);
    if (!roots.length) {
      p.el.removeAttribute("data-has-comments");
      return;
    }
    p.el.setAttribute("data-has-comments", roots.length);

    var byBlock = {};
    var points = [];
    var orphans = [];

    roots.forEach(function (c) {
      migrateLegacy(p.el, c);
      c._degraded = false;

      if (c.anchorType === "block") {
        var node = U.$('[data-block-id="' + C.blockIdOf(c) + '"]', p.el);
        if (node) {
          var key = C.blockIdOf(c);
          (byBlock[key] = byBlock[key] || { node: node, items: [] }).items.push(c);
          return;
        }
        c._degraded = true; /* blok gerçekten silinmiş */
      } else if (c.anchorType === "point" && c.anchor) {
        points.push(c);
        return;
      }
      orphans.push(c);
    });

    /* --- blok işaretleri + temsilci ses --- */
    Object.keys(byBlock).forEach(function (key) {
      var g = byBlock[key];
      var top = C.representative(g.items);
      g.node.setAttribute("data-comments", g.items.length);
      if (top) g.node.setAttribute("data-top-comment", top.id);
    });

    /* --- alıntı ısısı: (blok, cümle) çifti başına tek işaret --- */
    var quotes = {};
    roots.forEach(function (c) {
      var q = C.quoteOf(c);
      if (!q) return;
      var key = (C.blockIdOf(c) || "") + " " + q;
      quotes[key] = quotes[key] || { exact: q, blockId: C.blockIdOf(c), n: 0 };
      quotes[key].n++;
    });
    /* uzun alıntılar önce işaretlensin: iç içe geçenlerde uzun olan kazanır */
    Object.keys(quotes)
      .map(function (k) {
        return quotes[k];
      })
      .sort(function (a, b) {
        return b.exact.length - a.exact.length;
      })
      .forEach(function (q) {
        var scope = (q.blockId && U.$('[data-block-id="' + q.blockId + '"]', p.el)) || p.el;
        markQuote(scope, q.exact, q.n, q.blockId);
      });

    /* --- pinler ve kümeler --- */
    var pins = el("div.page__pins");
    var trace = MAG.debug && MAG.debug.pinsOn && MAG.debug.pinsOn() ? [] : null;
    var groups = clusterPoints(points, trace);
    groups.forEach(function (g) {
      pins.appendChild(pinNode(g));
    });
    if (orphans.length) pins.appendChild(orphanBadge(p, orphans));
    if (pins.firstChild) p.el.appendChild(pins);
    if (trace) MAG.debug.drawPins(p, groups, trace);
  }

  function pinNode(group) {
    var top = C.representative(group.items) || group.items[0];
    var total = group.items.reduce(function (n, c) {
      return n + threadSize(c.id);
    }, 0);
    return el(
      "button.pin",
      {
        style: { "--x": (group.x * 100).toFixed(2) + "%", "--y": (group.y * 100).toFixed(2) + "%" },
        "data-comment-ids": group.items
          .map(function (c) {
            return c.id;
          })
          .join(","),
        "data-cluster": group.items.length > 1 ? group.items.length : null,
        "data-mine": top.author && top.author.mine ? "true" : null,
        "data-pending": top.status === "pending" ? "true" : null,
        type: "button",
        "aria-label":
          group.items.length > 1
            ? group.items.length + " yorum, " + top.author.name + " ve diğerleri"
            : top.author.name + ": " + top.body.slice(0, 40),
      },
      [
        el("span.pin__dot", { style: { "--c": top.author.color }, text: top.author.emoji }),
        total > 1 ? el("span.pin__n", { text: total }) : null,
      ]
    );
  }

  function orphanBadge(page, list) {
    return el(
      "button.comment-badge",
      {
        "data-page-level": "true",
        "data-page-id": page.id,
        type: "button",
        "aria-label": list.length + " sayfa yorumu",
      },
      [
        el("span.comment-badge__icon", { text: "💬" }),
        el("span.comment-badge__n", { text: list.length }),
        el("span.comment-badge__label", { text: "bu sayfaya" }),
      ]
    );
  }

  /* ------------------------------------------------------------------------
     KATMAN AÇ / KAPA
     --------------------------------------------------------------------- */

  C.setLayer = function (on) {
    layerOn = on;
    document.documentElement.dataset.commentLayer = on ? "on" : "off";
    MAG.canvas.setCommentMode(on);
    var btn = U.$("#btn-comments");
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    U.emit("comments:layer", { on: on });
    if (on) MAG.overlays.toast("Eş okuma açık — bir paragrafa dokun");
  };

  C.toggleLayer = function () {
    C.setLayer(!layerOn);
  };

  C.layerOn = function () {
    return layerOn;
  };

  C.updateCount = function () {
    var page = MAG.canvas.currentPage();
    var n = page ? C.forPage(page.id).length : 0;
    var elc = U.$("#comment-count");
    elc.textContent = n;
    elc.parentElement.dataset.empty = n === 0 ? "true" : "false";
  };

  /* ------------------------------------------------------------------------
     ETKİLEŞİM
     --------------------------------------------------------------------- */

  var pressTimer = null;
  var pressStart = null;

  C.init = function () {
    var pagesEl = U.$("#pages");

    pagesEl.addEventListener("click", onPagesClick);

    pagesEl.addEventListener("keydown", function (e) {
      if (e.key !== "Enter" && e.key !== " ") return;
      var anno = e.target.closest(".anno");
      if (!anno) return;
      e.preventDefault();
      openForMark(anno);
    });

    /* --- metin seçimi → balon --- */
    document.addEventListener("selectionchange", U.debounce(onSelection, 180));
    U.$("#selection-bubble").addEventListener("click", function (e) {
      var btn = e.target.closest("button");
      if (!btn) return;
      var act = btn.dataset.act;
      hideBubble();
      if (act === "comment") startQuoteComment();
      else if (act === "quote") MAG.overlays.openQuoteCard(lastSelection && lastSelection.text);
    });

    /* --- uzun basma → koordinat pini (yalnızca görseller) --- */
    pagesEl.addEventListener("pointerdown", onPressStart, { passive: true });
    pagesEl.addEventListener("pointerup", clearPress, { passive: true });
    pagesEl.addEventListener("pointercancel", clearPress, { passive: true });
    pagesEl.addEventListener("pointermove", onPressMove, { passive: true });
    pagesEl.addEventListener("contextmenu", function (e) {
      if (e.target.closest(".page")) e.preventDefault();
    });

    U.$("#btn-comments").addEventListener("click", function () {
      C.toggleLayer();
    });

    U.listen("page:change", function () {
      C.updateCount();
      hideBubble();
    });
    U.listen("flow:render", function () {
      C.decorate();
      C.updateCount();
    });
  };

  function onPagesClick(e) {
    /* işaretler önce: bunlar bloğun içinde duruyor */
    var mark = e.target.closest(".anno");
    if (mark) {
      e.preventDefault();
      return openForMark(mark);
    }
    var pin = e.target.closest(".pin");
    if (pin) {
      e.preventDefault();
      return MAG.overlays.openThread({ ids: (pin.dataset.commentIds || "").split(",").filter(Boolean) });
    }
    var badge = e.target.closest(".comment-badge");
    if (badge) {
      e.preventDefault();
      return MAG.overlays.openThread({ pageId: badge.dataset.pageId, pageLevel: true });
    }

    /* --- YENİ: eş okuma açıkken bloğa dokunmak --- */
    if (!layerOn) return;
    if (e.target.closest("button, a, input, textarea, .puzzle")) return;
    var block = e.target.closest("[data-block-id]");
    if (!block) return;
    var pageEl = block.closest(".page");
    if (!pageEl) return;
    e.preventDefault();

    var blockId = block.getAttribute("data-block-id");
    if (block.hasAttribute("data-comments")) {
      /* Fısıltı açıksa ilk dokunuş sesi banda taşır, okumayı bölmez;
         aynı bloğa ikinci dokunuş konuşmayı açar. Sunum kapalıysa eski
         davranış: dokun → panel. */
      if (MAG.whisper && MAG.whisper.focusBlock(blockId, pageEl.dataset.pageId)) return;
      MAG.overlays.openThread({ blockId: blockId, pageId: pageEl.dataset.pageId });
    } else {
      MAG.overlays.openComposer({
        pageId: pageEl.dataset.pageId,
        sectionSlug: pageEl.dataset.section,
        anchor: { type: "block", blockId: blockId },
        blockHint: C.blockLabel(blockId),
      });
    }
  }

  function openForMark(mark) {
    var pageEl = mark.closest(".page");
    MAG.overlays.openThread({
      blockId: mark.dataset.blockId || null,
      quote: mark.dataset.quote,
      pageId: pageEl ? pageEl.dataset.pageId : null,
    });
  }

  /* --- metin seçimi ------------------------------------------------------- */

  var lastSelection = null;

  function onSelection() {
    var sel = document.getSelection();
    if (!sel || sel.isCollapsed || !sel.rangeCount) return hideBubble();
    var range = sel.getRangeAt(0);
    var node = range.commonAncestorContainer;
    if (node.nodeType === 3) node = node.parentElement;
    var pageEl = node && node.closest(".page");
    if (!pageEl) return hideBubble();

    var text = sel.toString().trim();
    if (text.length < 3) return hideBubble();

    var block = node.closest("[data-block-id]");
    lastSelection = {
      text: text,
      pageEl: pageEl,
      blockId: block ? block.getAttribute("data-block-id") : null,
    };

    var rect = range.getBoundingClientRect();
    var canvasRect = U.$("#canvas").getBoundingClientRect();
    var bubble = U.$("#selection-bubble");
    bubble.hidden = false;
    bubble.style.left = U.clamp(rect.left + rect.width / 2 - canvasRect.left, 70, canvasRect.width - 70) + "px";
    bubble.style.top = Math.max(44, rect.top - canvasRect.top) + "px";
  }

  function hideBubble() {
    var b = U.$("#selection-bubble");
    if (b) b.hidden = true;
  }
  C.hideBubble = hideBubble;

  /**
   * Seçilen cümle ANKRAJ değil ALINTI olur; yorum, cümlenin içinde durduğu
   * bloğa bağlanır. Jest aynı, depolama dayanıklı.
   */
  function startQuoteComment() {
    if (!lastSelection) return;
    var pageEl = lastSelection.pageEl;
    MAG.overlays.openComposer({
      pageId: pageEl.dataset.pageId,
      sectionSlug: pageEl.dataset.section,
      anchor: lastSelection.blockId ? { type: "block", blockId: lastSelection.blockId } : null,
      quote: lastSelection.text,
      quoted: lastSelection.text,
    });
    document.getSelection().removeAllRanges();
  }

  /* --- uzun basma --------------------------------------------------------- */

  /**
   * Koordinat pini artık yalnızca görsellerde: metinde konumun anlamı yok,
   * blok ankrajı hem daha kolay hem daha sağlam. Görselde ise "şu köşedeki şey"
   * demek gerçekten gerekiyor.
   */
  function pointAllowed(target) {
    if (target.closest(".pin, .anno, .comment-badge, button, a, input, textarea, .puzzle")) return false;
    var block = target.closest("[data-block-id]");
    if (!block) return true; /* sayfa zemini / tam kanama görsel */
    var kind = block.getAttribute("data-block-kind") || "";
    return kind === "manga" || kind === "manga-item";
  }

  function onPressStart(e) {
    if (!pointAllowed(e.target)) return;
    var pageEl = e.target.closest(".page");
    if (!pageEl) return;
    pressStart = { x: e.clientX, y: e.clientY, pageEl: pageEl };
    clearTimeout(pressTimer);
    pressTimer = setTimeout(function () {
      if (!pressStart) return;
      if (navigator.vibrate) navigator.vibrate(12);
      var norm = MAG.canvas.toNormalized(pressStart.x, pressStart.y, pressStart.pageEl);
      showGhostPin(pressStart.pageEl, norm);
      MAG.overlays.openComposer({
        pageId: pressStart.pageEl.dataset.pageId,
        sectionSlug: pressStart.pageEl.dataset.section,
        anchor: { type: "point", x: norm.x, y: norm.y },
        pointHint: true,
      });
      pressStart = null;
    }, 480);
  }

  function onPressMove(e) {
    if (!pressStart) return;
    if (Math.abs(e.clientX - pressStart.x) > 8 || Math.abs(e.clientY - pressStart.y) > 8) clearPress();
  }

  function clearPress() {
    clearTimeout(pressTimer);
    pressStart = null;
  }

  function showGhostPin(pageEl, norm) {
    var host = U.$(".page__pins", pageEl) || pageEl.appendChild(el("div.page__pins"));
    U.$$(".pin--ghost", host).forEach(function (g) {
      g.remove();
    });
    host.appendChild(
      el("div.pin.pin--ghost", {
        style: { "--x": (norm.x * 100).toFixed(2) + "%", "--y": (norm.y * 100).toFixed(2) + "%" },
      })
    );
    /* hata ayıklama açıksa: bu nokta hangi pine katılırdı? */
    if (MAG.debug && MAG.debug.pinsOn && MAG.debug.pinsOn()) MAG.debug.previewPoint(pageEl, norm);
  }

  C.clearGhost = function () {
    U.$$(".pin--ghost").forEach(function (g) {
      g.remove();
    });
  };

  MAG.comments = C;
})(window.MAG);
