/* ============================================================================
   DEBUG — stres modu
   ----------------------------------------------------------------------------
   Her yorum sunumu 14 yorumla güzel görünür. Ayrım 250'de ortaya çıkar.
   Bu dosya gerçek ürüne gitmez; prototipte kararı ekrana bakarak verebilmek için
   var. Ürettiği yorumlar YALNIZCA BELLEKTE durur — localStorage'a yazılmaz,
   sayfa yenilenince kaybolur.

       MAG.flood()      → 250 yorum
       MAG.flood(600)   → 600 yorum
       MAG.flood(0)     → temizle

   Dağılım bilerek eşit değil: gerçek hayatta yorumlar birkaç "sıcak" bloğa
   yığılır, geri kalan sayfalar sessizdir. Eşit dağıtsaydık test kolaylaşır ama
   yalan söylerdi.
   ========================================================================= */

(function (MAG) {
  "use strict";

  var U = MAG.util;

  var NAMES = [
    ["Sessiz Vinç", "🦩", "#7a9ec2"],
    ["Mor Balina", "🐳", "#8f7ac2"],
    ["Kırmızı Tilki", "🦊", "#c2764a"],
    ["Gri Baykuş", "🦉", "#6f7d86"],
    ["Yeşil Ceylan", "🌿", "#5f8f6b"],
    ["Mavi Şahin", "🕊️", "#4a7fc2"],
    ["Sarı Ceylan", "🪷", "#c2a44a"],
    ["Turuncu Kirpi", "🦔", "#c2854a"],
    ["Beyaz Turna", "🐦", "#8a8f96"],
    ["Bakır Geyik", "🦌", "#a86b4a"],
  ];

  var BODIES = [
    "Bunu hiç böyle düşünmemiştim.",
    "Burada bir şey eksik gibi geldi bana.",
    "Tam da geçen hafta aynısını yaşadım.",
    "Kaynak bırakabilir misiniz?",
    "Bu kısmı iki kere okudum, çok iyi.",
    "Katılmıyorum ama iyi yazılmış.",
    "Bunu bir arkadaşıma göndereceğim.",
    "Devamı gelecek mi acaba?",
    "Fotoğrafla metin burada çok iyi oturmuş.",
    "Bence asıl mesele bu değil.",
    "Yıllardır aradığım cümle buydu.",
    "Küçük bir itiraz: bu her yerde geçerli değil.",
    "Okurken durup bir süre baktım.",
    "Bunu daha önce başka bir yerde okumuştum, orada bu kadar iyi anlatılmamıştı.",
    "Kısa ve tam yerinde.",
  ];

  var EMOJI = ["❤️", "🔥", "🤯", "🍁", "🙏", "👀", "💯", "😄", "🤔", "👍"];

  /** Bloğun metninden alıntılanabilir bir cümle. */
  function sentenceIn(text, rand) {
    var parts = String(text)
      .split(/(?<=[.!?…])\s+/)
      .map(function (s) {
        return s.trim();
      })
      .filter(function (s) {
        return s.length >= 20 && s.length <= 120;
      });
    return parts.length ? parts[Math.floor(rand() * parts.length)] : null;
  }

  /**
   * Sıcak-soğuk dağılım: bloklar rastgele sıralanır, sonra sıraya göre
   * 1/(sıra+1)^1.15 ağırlık verilir. Baştaki birkaç blok yorumun çoğunu alır.
   */
  function weighted(list, rand) {
    var shuffled = list.slice();
    for (var i = shuffled.length - 1; i > 0; i--) {
      var j = Math.floor(rand() * (i + 1));
      var t = shuffled[i];
      shuffled[i] = shuffled[j];
      shuffled[j] = t;
    }
    var cum = [];
    var total = 0;
    shuffled.forEach(function (item, rank) {
      total += 1 / Math.pow(rank + 1, 1.15);
      cum.push(total);
    });
    return function pick() {
      var r = rand() * total;
      for (var k = 0; k < cum.length; k++) if (r <= cum[k]) return shuffled[k];
      return shuffled[shuffled.length - 1];
    };
  }

  MAG.flood = function (n) {
    n = n === undefined ? 250 : n;

    if (!n) {
      MAG.comments.setFlood([]);
      MAG.comments.decorate();
      MAG.comments.updateCount();
      console.info("[stres] temizlendi.");
      return 0;
    }

    var rand = U.rng(20260913);
    var now = Date.now();
    var HOUR = 3600000;

    /* Hedefler: çizili her blok + görsel sayfalarda serbest koordinat */
    var blocks = U.$$("#pages [data-block-id]").filter(function (b) {
      var kind = b.getAttribute("data-block-kind");
      return kind !== "rule" && kind !== "cover" && !b.closest(".puzzle");
    });
    var imagePages = U.$$("#pages .page").filter(function (p) {
      var k = p.dataset.kind;
      return k === "photo" || k === "opener" || k === "manga";
    });

    if (!blocks.length) {
      console.warn("[stres] önce sayfaların çizilmesi gerekiyor.");
      return 0;
    }

    var pickBlock = weighted(blocks, rand);
    var pickPage = imagePages.length ? weighted(imagePages, rand) : null;

    var out = [];
    var roots = [];

    for (var i = 0; i < n; i++) {
      var who = NAMES[Math.floor(rand() * NAMES.length)];
      var author = {
        name: who[0] + " " + (10 + Math.floor(rand() * 89)),
        emoji: who[1],
        color: who[2],
      };
      var reactions = {};
      var rxCount = Math.floor(Math.pow(rand(), 3) * 40);
      if (rxCount) reactions[EMOJI[Math.floor(rand() * EMOJI.length)]] = rxCount;

      /* %22'si cevap: gerçek bir konuşmada dallar da olur */
      var asReply = roots.length > 4 && rand() < 0.22;
      if (asReply) {
        var parent = roots[Math.floor(rand() * roots.length)];
        out.push({
          id: "flood-" + i,
          pageId: parent.pageId,
          sectionSlug: parent.sectionSlug,
          parentId: parent.id,
          anchorType: "page",
          anchor: null,
          quote: null,
          featured: false,
          depthMode: "mid",
          locale: "tr",
          body: BODIES[Math.floor(rand() * BODIES.length)],
          author: author,
          status: "published",
          createdAt: now - Math.floor(rand() * 72) * HOUR,
          reactions: reactions,
        });
        continue;
      }

      var comment;
      /* %18'i görsele koordinat pini — kümelenmeyi de test etmiş olalım */
      if (pickPage && rand() < 0.18) {
        var page = pickPage();
        comment = {
          pageId: page.dataset.pageId,
          sectionSlug: page.dataset.section,
          anchorType: "point",
          anchor: { type: "point", x: 0.15 + rand() * 0.7, y: 0.15 + rand() * 0.7 },
          quote: null,
        };
      } else {
        var block = pickBlock();
        var pageEl = block.closest(".page");
        var q = rand() < 0.45 ? sentenceIn(block.textContent, rand) : null;
        comment = {
          pageId: pageEl.dataset.pageId,
          sectionSlug: pageEl.dataset.section,
          anchorType: "block",
          anchor: { type: "block", blockId: block.getAttribute("data-block-id") },
          quote: q ? { exact: q } : null,
        };
      }

      comment.id = "flood-" + i;
      comment.parentId = null;
      comment.featured = false;
      comment.depthMode = "mid";
      comment.locale = "tr";
      comment.body = BODIES[Math.floor(rand() * BODIES.length)];
      comment.author = author;
      comment.status = "published";
      comment.createdAt = now - Math.floor(rand() * 72) * HOUR;
      comment.reactions = reactions;

      out.push(comment);
      roots.push(comment);
    }

    MAG.comments.setFlood(out);
    MAG.comments.decorate();
    MAG.comments.updateCount();

    report(out);
    return out.length;
  };

  /** Ölçüt: bir blokta kaç yorum olursa olsun sayfada TEK ses görünmeli. */
  function report(list) {
    var perBlock = {};
    var quotes = {};
    list.forEach(function (c) {
      if (c.anchorType !== "block") return;
      perBlock[c.anchor.blockId] = (perBlock[c.anchor.blockId] || 0) + 1;
      if (c.quote) {
        var k = c.anchor.blockId + " " + c.quote.exact;
        quotes[k] = (quotes[k] || 0) + 1;
      }
    });
    var counts = Object.keys(perBlock).map(function (k) {
      return perBlock[k];
    });
    counts.sort(function (a, b) {
      return b - a;
    });
    console.info(
      "[stres] " +
        list.length +
        " yorum · " +
        counts.length +
        " blok · en yoğun blok: " +
        (counts[0] || 0) +
        " yorum · " +
        Object.keys(quotes).length +
        " ayrı alıntı\n" +
        "Ekranda görünmesi gereken: blok başına 1 ses + sayaç. Fazlası hata."
    );
  }

  /* ==========================================================================
     PİN KÜMELENMESİ — hata ayıklama görünümü

         MAG.pins()        → aç/kapa
         MAG.pins(true)    → aç
         MAG.pins(false)   → kapa

     Kümelenme görünmez bir kural: iki pin "yeterince yakın"sa tek pine iner.
     Bu görünüm o "yeterince yakın"ı çizer.

     ÇEKİM ALANI NEDEN ELİPS?
     Mesafe tuval GENİŞLİĞİ biriminde ölçülüyor: dy, 3:4 tasarım oranıyla
     genişliğe çevriliyor (`dy × 4/3`). Yani yarıçap x ekseninde genişliğin
     %14'ü, y ekseninde YÜKSEKLİĞİN %10.5'i. Tam 3:4 bir tuvalde bu ekranda
     kusursuz bir dairedir; telefonda tuval uzadığı için ekranda dikey elipse
     dönüşür — kural değişmez, tuval değişir. Görünüm bunu olduğu gibi çizer,
     düzeltmez: yanlış görünüyorsa yanlıştır.

     ÇİZİLENLER
       kesikli elips   bu pinin çekim alanı — buraya düşen yeni yorum ona katılır
       noktalı daire   pinin kendi gövdesi (8.5cqi), alanla kıyaslamak için
       ince çizgi      hangi ham nokta hangi pine katıldı (yarıçap kuralı)
       pembe çizgi     PIN SINIRI yüzünden birleşme — mesafeye BAKILMADAN
       pembe kesik     en yakın iki pin: sınır aşılırsa sırada bunlar var
       × işareti       yorumun gerçek koordinatı (pin oraya değil, ortalamaya konur)
     ========================================================================== */

  var pinsOn = false;
  var SVG_NS = "http://www.w3.org/2000/svg";

  function styleOnce() {
    if (document.getElementById("pindbg-css")) return;
    var s = document.createElement("style");
    s.id = "pindbg-css";
    /* Bilerek tema dışı renkler: bu bir ölçüm aracı, tasarım değil. */
    s.textContent = [
      ".pindbg{position:absolute;inset:0;z-index:7;pointer-events:none;font-family:var(--font-ui);}",
      ":root[data-comment-layer='off'] .pindbg{display:none;}",
      ".pindbg__net{position:absolute;inset:0;width:100%;height:100%;overflow:visible;}",
      ".pindbg__zone,.pindbg__body,.pindbg__raw,.pindbg__tag{position:absolute;left:var(--x);top:var(--y);transform:translate(-50%,-50%);}",
      ".pindbg__zone{width:calc(var(--rx) * 2%);height:calc(var(--ry) * 2%);border-radius:50%;",
      "border:1.5px dashed #3ec8e0;background:rgb(62 200 224 / 0.07);}",
      /* çakışan alan = aynı noktaya iki aday; kazananı sıra belirler */
      ".pindbg__zone[data-overlap]{border-color:#f2b23e;background:rgb(242 178 62 / 0.1);}",
      /* uzun basılan nokta bu alana düştü: yeni yorum bu pine katılacak */
      ".pindbg__zone[data-hit]{border-style:solid;border-color:#7dff9e;background:rgb(125 255 158 / 0.16);}",
      ".pindbg__hit{position:absolute;left:var(--x);top:var(--y);transform:translate(-50%,-50%);",
      "white-space:nowrap;font-size:10px;padding:2px 6px;border-radius:4px;",
      "background:#0b2013;color:#b6ffc9;border:1px solid #7dff9e;}",
      ".pindbg__ord{position:absolute;left:var(--x);top:var(--y);transform:translate(-50%,-50%);",
      "min-width:18px;height:16px;padding:0 3px;border-radius:8px;display:grid;place-items:center;",
      "font-size:9px;font-weight:700;",
      "background:#0b1620;color:#8fe6f5;border:1px solid #3ec8e0;}",
      ".pindbg__ord[data-overlap]{color:#ffd88f;border-color:#f2b23e;}",
      ".pindbg__body{width:8.5cqi;height:8.5cqi;border-radius:50%;border:1px dotted rgb(255 255 255 / 0.55);}",
      ".pindbg__raw{width:9px;height:9px;}",
      ".pindbg__raw::before,.pindbg__raw::after{content:'';position:absolute;inset:50% 0 auto 0;height:1.5px;background:#fff;",
      "box-shadow:0 0 0 1px rgb(0 0 0 / 0.6);}",
      ".pindbg__raw::before{rotate:45deg;}.pindbg__raw::after{rotate:-45deg;}",
      ".pindbg__tag{white-space:nowrap;font-size:10px;",
      "padding:2px 6px;border-radius:4px;background:#0b1620;color:#8fe6f5;border:1px solid #3ec8e0;}",
      ".pindbg__tag[data-kind='cap']{color:#ffc2df;border-color:#ff4fa3;}",
      ".pindbg__hud{position:absolute;left:2.5cqi;top:2.5cqi;max-width:80%;font-size:10px;line-height:1.5;",
      "padding:5px 8px;border-radius:5px;background:#0b1620ee;color:#cfe9f2;border:1px solid #3ec8e0;}",
      ".pindbg__hud b{color:#8fe6f5;}.pindbg__hud i{color:#ff8fc4;font-style:normal;}",
    ].join("");
    document.head.appendChild(s);
  }

  function svgEl(name, attrs) {
    var n = document.createElementNS(SVG_NS, name);
    Object.keys(attrs).forEach(function (k) {
      n.setAttribute(k, attrs[k]);
    });
    return n;
  }

  /** Yüzde birimlerinde konum: x genişliğin, y YÜKSEKLİĞİN yüzdesi. */
  function at(x, y) {
    return { "--x": (x * 100).toFixed(2) + "%", "--y": (y * 100).toFixed(2) + "%" };
  }

  MAG.debug = MAG.debug || {};

  MAG.debug.pinsOn = function () {
    return pinsOn;
  };

  /**
   * Bir sayfanın pin kümelenmesini çizer. `groups` kümelenme sonucu,
   * `trace` ise birleşme günlüğü (comments.js `clusterPoints` üretir).
   */
  MAG.debug.drawPins = function (page, groups, trace) {
    var C = MAG.comments;
    var old = U.$(".pindbg", page.el);
    if (old) old.remove();
    if (!groups.length) return;

    styleOnce();
    var layer = U.el("div.pindbg");
    var net = svgEl("svg", { class: "pindbg__net", viewBox: "0 0 100 100", preserveAspectRatio: "none" });
    layer.appendChild(net);

    /* pin sınırı yüzünden yutulan yorumlar — bunlar mesafe kuralına uymuyordu */
    var capped = {};
    var capMerges = 0;
    trace.forEach(function (t) {
      if (t.kind !== "cap") return;
      capMerges++;
      (t.ids || []).forEach(function (id) {
        capped[id] = true;
      });
      net.appendChild(
        svgEl("line", {
          x1: (t.x * 100).toFixed(2), y1: (t.y * 100).toFixed(2),
          x2: (t.cx * 100).toFixed(2), y2: (t.cy * 100).toFixed(2),
          stroke: "#ff4fa3", "stroke-width": "2", "vector-effect": "non-scaling-stroke",
        })
      );
    });

    var rx = C.CLUSTER_R * 100;
    var ry = C.CLUSTER_R * 100 * (3 / 4);
    var points = 0;

    /* Çakışan alanlar: yeni bir yorum ikisinin de menzilindeyse SIRADA ÖNCE
       olan pin kazanır — kümelenme en yakını değil, ilk bulduğunu alır.
       Aralarındaki mesafe 2R'den küçükse alanlar kesişiyor demektir. */
    var overlap = {};
    for (var oi = 0; oi < groups.length; oi++) {
      for (var oj = oi + 1; oj < groups.length; oj++) {
        if (C.pinDist(groups[oi], groups[oj]) <= 2 * C.CLUSTER_R) {
          overlap[oi] = true;
          overlap[oj] = true;
        }
      }
    }

    groups.forEach(function (g, gi) {
      points += g.items.length;

      /* ham noktalardan küme ortasına giden bağlar */
      g.items.forEach(function (c) {
        if (Math.abs(c.anchor.x - g.x) < 0.001 && Math.abs(c.anchor.y - g.y) < 0.001) return;
        net.appendChild(
          svgEl("line", {
            x1: (c.anchor.x * 100).toFixed(2), y1: (c.anchor.y * 100).toFixed(2),
            x2: (g.x * 100).toFixed(2), y2: (g.y * 100).toFixed(2),
            stroke: capped[c.id] ? "#ff4fa3" : "#3ec8e0",
            "stroke-width": "1.5",
            "stroke-dasharray": capped[c.id] ? "4 3" : "",
            "vector-effect": "non-scaling-stroke",
          })
        );
        layer.appendChild(U.el("div.pindbg__raw", { style: at(c.anchor.x, c.anchor.y) }));
      });

      layer.appendChild(
        U.el("div.pindbg__zone", {
          style: Object.assign(at(g.x, g.y), { "--rx": String(rx), "--ry": String(ry) }),
          "data-overlap": overlap[gi] ? "true" : null,
        })
      );
      layer.appendChild(U.el("div.pindbg__body", { style: at(g.x, g.y) }));

      /* sıra numarası: çakışma varsa kazananı bu belirliyor */
      layer.appendChild(
        U.el("div.pindbg__ord", {
          style: at(g.x - C.CLUSTER_R * 0.72, g.y - C.CLUSTER_R * 0.72 * (3 / 4)),
          "data-overlap": overlap[gi] ? "true" : null,
          text: "#" + (gi + 1), /* pinin sayaç rozetiyle karışmasın */
        })
      );

      if (g.items.length > 1) {
        layer.appendChild(
          U.el("div.pindbg__tag", {
            style: at(g.x, g.y - C.CLUSTER_R * (3 / 4) - 0.015),
            "data-kind": g.items.some(function (c) { return capped[c.id]; }) ? "cap" : "radius",
            text: g.items.length + " yorum tek pinde",
          })
        );
      }
    });

    /* sınır aşılırsa sırada hangi ikili var? */
    var nearest = null;
    for (var i = 0; i < groups.length; i++) {
      for (var j = i + 1; j < groups.length; j++) {
        var d = C.pinDist(groups[i], groups[j]);
        if (!nearest || d < nearest.d) nearest = { d: d, a: groups[i], b: groups[j] };
      }
    }
    if (nearest) {
      net.appendChild(
        svgEl("line", {
          x1: (nearest.a.x * 100).toFixed(2), y1: (nearest.a.y * 100).toFixed(2),
          x2: (nearest.b.x * 100).toFixed(2), y2: (nearest.b.y * 100).toFixed(2),
          stroke: "#ff4fa3", "stroke-width": "1", "stroke-dasharray": "2 4",
          "vector-effect": "non-scaling-stroke", opacity: "0.75",
        })
      );
    }

    layer.appendChild(
      U.el("div.pindbg__hud", {
        html:
          "<b>" + points + "</b> nokta → <b>" + groups.length + "</b> pin" +
          " · yarıçap <b>" + C.CLUSTER_R + "</b> (tuval genişliği)" +
          " · sınır <b>" + C.MAX_PINS + "</b><br>" +
          "yarıçapla birleşen: <b>" + (trace.length - capMerges) + "</b>" +
          " · sınır yüzünden: <i>" + capMerges + "</i>" +
          (nearest ? "<br>en yakın iki pin: <i>" + nearest.d.toFixed(3) + "</i>" +
            (nearest.d <= C.CLUSTER_R ? " (yarıçap içinde — sınır birleşmesi)" : "") : "") +
          (Object.keys(overlap).length
            ? "<br><i>" + Object.keys(overlap).length + " alan çakışıyor</i> — çakışan yere düşen" +
              " yeni yorum, en yakına değil <b>sırada önce olana</b> katılır"
            : ""),
      })
    );

    /* previewPoint için: kümelerin son ortaları, sınama sırasıyla */
    layer.centroids = groups.map(function (g) {
      return { x: g.x, y: g.y, n: g.items.length };
    });
    page.el.appendChild(layer);
  };

  /**
   * Uzun basılan nokta hangi pine katılırdı? Kümelenme en yakını değil,
   * SIRADA İLK bulduğu alanı seçer — burada da aynı sırayla bakıyoruz.
   */
  MAG.debug.previewPoint = function (pageEl, norm) {
    var C = MAG.comments;
    var layer = U.$(".pindbg", pageEl);
    if (!layer || !layer.centroids) return;

    U.$$(".pindbg__hit", layer).forEach(function (n) {
      n.remove();
    });
    U.$$(".pindbg__zone[data-hit]", layer).forEach(function (n) {
      n.removeAttribute("data-hit");
    });

    var hit = -1;
    var d = 0;
    for (var i = 0; i < layer.centroids.length; i++) {
      d = C.pinDist(layer.centroids[i], norm);
      if (d <= C.CLUSTER_R) {
        hit = i;
        break;
      }
    }

    var zones = U.$$(".pindbg__zone", layer);
    if (hit >= 0 && zones[hit]) zones[hit].setAttribute("data-hit", "true");
    layer.appendChild(
      U.el("div.pindbg__hit", {
        style: at(norm.x, norm.y + 0.045),
        text:
          hit >= 0
            ? "#" + (hit + 1) + " pinine katılır (" + d.toFixed(3) + " ≤ " + C.CLUSTER_R + ")"
            : "yeni pin açılır — hiçbir alanın içinde değil",
      })
    );
  };

  MAG.pins = function (on) {
    pinsOn = on === undefined ? !pinsOn : !!on;
    if (pinsOn && !MAG.comments.layerOn()) MAG.comments.setLayer(true);
    if (!pinsOn) {
      U.$$(".pindbg").forEach(function (n) {
        n.remove();
      });
    }
    MAG.comments.decorate();
    console.info(
      pinsOn
        ? "[pin] hata ayıklama açık. Kesikli elips = çekim alanı; oraya düşen yeni yorum o pine katılır.\n" +
            "      Pembe = pin sınırı (" + MAG.comments.MAX_PINS + ") yüzünden, mesafeye bakılmadan birleşenler.\n" +
            "      Sınır birleşmelerini görmek için: MAG.flood(250)"
        : "[pin] hata ayıklama kapalı."
    );
    return pinsOn;
  };

  MAG.debug.flood = MAG.flood;
  MAG.debug.pins = MAG.pins;
})(window.MAG);
