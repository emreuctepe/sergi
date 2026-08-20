/* ============================================================================
   OVERLAYS — tuvalin dışında yaşayan her şey
   tanıtım · mod seçimi · menü · thread paneli · yorum yazma · giriş ·
   arşiv · alıntı kartı · sayı sonu · moderasyon
   ========================================================================= */

(function (MAG) {
  "use strict";

  var U = MAG.util;
  var D = MAG.data;
  var State = MAG.state;
  var I = MAG.identity;
  var C = MAG.comments;
  var el = U.el;

  var O = {};
  var scrim, modalHost, menuPanel, threadPanel, toastHost, introHost;
  var openStack = [];

  O.init = function () {
    scrim = U.$("#scrim");
    modalHost = U.$("#modal-host");
    menuPanel = U.$("#menu-panel");
    threadPanel = U.$("#thread-panel");
    toastHost = U.$("#toast-host");
    introHost = U.$("#intro-host");

    scrim.addEventListener("click", O.closeTop);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && openStack.length) {
        e.preventDefault();
        O.closeTop();
      }
    });

    U.$("#btn-menu").addEventListener("click", O.toggleMenu);
    U.$("#btn-depth").addEventListener("click", function () {
      O.openDepthPicker({ switching: true });
    });
    U.$("#btn-lang").addEventListener("click", O.openLang);

    /* sabit menü: pencere yeterince genişse varsayılan olarak açık */
    U.listen("dock:fit", applyDockPreference);
    U.listen("flow:render", refreshDock);
    U.listen("identity:change", refreshDock);
    U.listen("identity:upgraded", refreshDock);
    U.listen("page:change", markCurrentSection);
    applyDockPreference();
  };

  /* ========================================================================
     TEMEL KATMAN YÖNETİMİ
     ===================================================================== */

  /* Kapanış animasyonu bitince taşıyıcıyı boşaltıyoruz. Ama panel bu 260 ms
     içinde yeniden açılabiliyor (tepki verince thread kendini tazeliyor) — o
     zaman gecikmeli temizlik yeni içeriği siliyordu. Her açılışa bir sıra numarası
     veriyoruz; temizlik yalnızca kendi açılışı hâlâ en güncelse çalışır. */
  var openSeq = 0;

  function reopened(node, seq) {
    return openStack.some(function (o) {
      return o.node === node && o.seq > seq;
    });
  }

  function push(kind, node) {
    openStack.push({ kind: kind, node: node, seq: ++openSeq });
    scrim.hidden = false;
    requestAnimationFrame(function () {
      scrim.dataset.on = "true";
    });
    document.body.dataset.modal = "open";
  }

  O.closeTop = function () {
    var top = openStack.pop();
    if (!top) return;
    if (top.kind === "modal") {
      modalHost.dataset.on = "false";
      setTimeout(function () {
        if (reopened(modalHost, top.seq)) return;
        U.clear(modalHost);
        modalHost.hidden = true;
      }, 240);
    } else if (top.node) {
      top.node.dataset.on = "false";
      setTimeout(function () {
        if (reopened(top.node, top.seq)) return;
        top.node.hidden = true;
        U.clear(top.node);
      }, 260);
    }
    if (!openStack.length) {
      scrim.dataset.on = "false";
      document.body.dataset.modal = "closed";
      setTimeout(function () {
        if (!openStack.length) scrim.hidden = true;
      }, 240);
    }
    C.clearGhost();
  };

  O.closeAll = function () {
    while (openStack.length) O.closeTop();
  };

  O.modal = function (node, opts) {
    opts = opts || {};
    U.clear(modalHost);
    var box = el("div.modal" + (opts.wide ? ".modal--wide" : ""), { role: "dialog", "aria-modal": "true" });
    if (opts.title) {
      box.appendChild(
        el("header.modal__head", null, [
          el("h2.modal__title", { text: opts.title }),
          opts.closable === false
            ? null
            : el("button.modal__x", { type: "button", "aria-label": "Kapat", text: "✕", onclick: O.closeTop }),
        ])
      );
    }
    box.appendChild(node);
    modalHost.appendChild(box);
    modalHost.hidden = false;
    requestAnimationFrame(function () {
      modalHost.dataset.on = "true";
    });
    push("modal", modalHost);
    var focusable = box.querySelector("input, textarea, button");
    if (focusable) setTimeout(function () { focusable.focus(); }, 260);
    return box;
  };

  O.panel = function (node, which) {
    var host = which === "menu" ? menuPanel : threadPanel;
    U.clear(host);
    host.appendChild(node);
    host.hidden = false;
    requestAnimationFrame(function () {
      host.dataset.on = "true";
    });
    push("panel", host);
    return host;
  };

  O.toast = function (msg, kind) {
    var t = el("div.toast" + (kind ? ".toast--" + kind : ""), { text: msg });
    toastHost.appendChild(t);
    requestAnimationFrame(function () {
      t.dataset.on = "true";
    });
    setTimeout(function () {
      t.dataset.on = "false";
      setTimeout(function () {
        t.remove();
      }, 320);
    }, 2800);
  };

  /* ========================================================================
     TANITIM (about) — ilk ziyaret
     ===================================================================== */

  O.openIntro = function (onDone) {
    var host = introHost;
    U.clear(host);
    host.hidden = false;

    var slides = el("div.intro__slides");
    D.intro.forEach(function (s, i) {
      slides.appendChild(
        el("section.intro__slide", { "data-i": i }, [
          el("div.intro__bg", { html: MAG.art.scene(s.scene) }),
          el("div.intro__text", null, [
            el("h2.intro__big", { text: s.big }),
            el("p.intro__small", { text: s.small }),
            s.last
              ? el("button.intro__start", { type: "button", text: "Sayıyı aç", onclick: finish })
              : el("span.intro__chev", { text: "⌄" }),
          ]),
        ])
      );
    });

    var dots = el(
      "div.intro__dots",
      null,
      D.intro.map(function (_, i) {
        return el("i", { "data-i": i });
      })
    );

    var skip = el("button.intro__skip", { type: "button", text: "Atla", onclick: finish });

    host.appendChild(slides);
    host.appendChild(dots);
    host.appendChild(skip);
    document.body.dataset.modal = "open";

    slides.addEventListener(
      "scroll",
      U.raf(function () {
        var i = Math.round(slides.scrollTop / slides.clientHeight);
        U.$$("i", dots).forEach(function (d, k) {
          d.dataset.on = k === i ? "true" : "false";
        });
      }),
      { passive: true }
    );
    U.$$("i", dots)[0].dataset.on = "true";

    var finished = false;
    function finish() {
      if (finished) return;
      finished = true;
      State.set("seenIntro", true);
      host.dataset.on = "false";
      setTimeout(function () {
        host.hidden = true;
        U.clear(host);
        document.body.dataset.modal = "closed";
        onDone();
      }, 420);
    }

    requestAnimationFrame(function () {
      host.dataset.on = "true";
    });
  };

  /* ========================================================================
     OKUMA MODU SEÇİMİ
     ===================================================================== */

  var DEPTHS = [
    {
      id: "min",
      name: "Doomscroller",
      icon: "🫠",
      line: "Sosyal medya kullanmaktan beyni sıvı olanlar için.",
      detail: "Uzun yazılar madde madde, foto-öykü kısaltılmış, manga ve bulmaca yerinde.",
    },
    {
      id: "mid",
      name: "Dengeli",
      icon: "⚖️",
      line: "Çoğu okur burada.",
      detail: "Yazıların tam gövdesi, galerinin çoğu, söyleşinin ana bölümü.",
    },
    {
      id: "full",
      name: "Doomreader",
      icon: "🧠",
      line: "Hâlâ uzun metin okuyabilen üst insanlar için.",
      detail: "Ek bölümler, derinlemesine kutular, tüm fotoğraflar, tüm söyleşi.",
    },
  ];

  O.openDepthPicker = function (opts) {
    opts = opts || {};
    var current = State.get("depth");
    var body = el("div.depth-pick");

    body.appendChild(
      el("p.depth-pick__intro", {
        text: opts.switching
          ? "İstediğin an değiştirebilirsin — okuduğun yeri kaybetmezsin."
          : "Bu sayıyı nasıl okumak istersin?",
      })
    );

    DEPTHS.forEach(function (d) {
      var mins = D.estimateMinutes(d.id);
      var pages = D.flow(d.id).length;
      body.appendChild(
        el(
          "button.depth-card",
          {
            type: "button",
            "data-active": current === d.id ? "true" : null,
            /* Tamamlanan mod altın zemine döner — okurun bunu haber alacağı
               tek yer burası. Bilerek metinsiz: rozet ya da "tamamlandı"
               yazısı yok, yalnızca renk. (kural: streak.js) */
            "data-done": MAG.streak.isDone(d.id) ? "true" : null,
            onclick: function () {
              choose(d.id);
            },
          },
          [
            el("span.depth-card__icon", { text: d.icon }),
            el("span.depth-card__main", null, [
              el("b", { text: d.name }),
              el("span.depth-card__line", { text: d.line }),
              el("span.depth-card__detail", { text: d.detail }),
            ]),
            el("span.depth-card__meta", null, [
              el("b", { text: "~" + mins + " dk" }),
              el("span", { text: pages + " sayfa" }),
            ]),
          ]
        )
      );
    });

    function choose(id) {
      var keep = MAG.canvas.currentPage();
      State.set("depth", id);
      U.$("#depth-label").textContent = DEPTHS.filter(function (d) {
        return d.id === id;
      })[0].name;
      O.closeTop();
      MAG.render.renderFlow({ keepPageId: keep ? keep.id : null });
      if (opts.switching) {
        O.toast("Okuma modu: " + DEPTHS.filter(function (d) { return d.id === id; })[0].name);
      }
      if (opts.onDone) opts.onDone(id);
    }

    O.modal(body, {
      title: opts.switching ? "Okuma modu" : "Nasıl okumak istersin?",
      closable: opts.switching !== false,
    });
  };

  /* ========================================================================
     MENÜ
     ------------------------------------------------------------------------
     İki kılıkta yaşar:
       · SABİT (masaüstü)  — tuvalin solundaki boşlukta durur, perdesi yok,
                             okuma engellenmez. Varsayılan budur.
       · ÇEKMECE (dar ekran) — perdeyle açılan klasik sol panel.
     İçerik tek yerde (buildMenu), fark yalnızca "tıklayınca kapanır mı".
     ===================================================================== */

  function dockFits() {
    return document.documentElement.dataset.dockFits === "true";
  }

  O.isDocked = function () {
    return document.documentElement.dataset.dock === "on";
  };

  /** Hamburger düğmesi: yer varsa sabit menüyü aç/kapa, yoksa çekmeceyi aç. */
  O.toggleMenu = function () {
    if (dockFits()) O.setDock(!O.isDocked(), true);
    else O.openMenu();
  };

  /**
   * @param {boolean} on
   * @param {boolean} remember  kullanıcının bilinçli seçimi mi (kaydedilsin mi)
   */
  O.setDock = function (on, remember) {
    if (on && !dockFits()) on = false;
    if (remember) State.set("dock", on ? "on" : "off");

    document.documentElement.dataset.dock = on ? "on" : "off";
    U.$("#btn-menu").setAttribute("aria-expanded", on ? "true" : "false");

    if (on) {
      fillDock();
      menuPanel.hidden = false;
      requestAnimationFrame(function () {
        menuPanel.dataset.on = "true";
      });
    } else {
      menuPanel.dataset.on = "false";
      setTimeout(function () {
        if (O.isDocked() || inStack(menuPanel)) return;
        menuPanel.hidden = true;
        U.clear(menuPanel);
      }, 280);
    }
  };

  function inStack(node) {
    return openStack.some(function (x) {
      return x.node === node;
    });
  }

  /** Tercih + yer durumuna göre sabit menüyü uygular. Boşuna yeniden kurmaz. */
  function applyDockPreference() {
    var want = State.get("dock") !== "off" && dockFits();
    if (want === O.isDocked()) return;
    O.setDock(want, false);
  }

  function fillDock() {
    U.clear(menuPanel);
    menuPanel.appendChild(
      el("div.panel__inner", null, [
        el("header.panel__head", null, [
          el("h2.panel__title", { text: "Menü" }),
          el("button.panel__plain", {
            type: "button",
            title: "Menüyü kapat, ekranda yalnızca dergi kalsın",
            html:
              '<svg viewBox="0 0 24 24" class="icon" aria-hidden="true">' +
              '<path d="M13 6 7 12l6 6M18 6l-6 6 6 6"/></svg>' +
              "<span>Sade görünüm</span>",
            onclick: function () {
              O.setDock(false, true);
            },
          }),
        ]),
        buildMenu(true),
      ])
    );
  }

  /** İçerik değişti (mod, kimlik, akış) → sabit menü tazelensin. */
  function refreshDock() {
    if (O.isDocked()) fillDock();
  }

  /** Okunan bölüm değişti → içindekilerde işaret kaysın (tam kurulum gerekmez). */
  function markCurrentSection() {
    if (!O.isDocked()) return;
    var cur = MAG.canvas.currentPage();
    U.$$(".toc__item", menuPanel).forEach(function (b) {
      if (cur && b.dataset.slug === cur.sectionSlug) b.dataset.current = "true";
      else b.removeAttribute("data-current");
    });
  }

  O.openMenu = function () {
    O.panel(el("div.panel__inner", null, [header("Menü"), buildMenu(false)]), "menu");
  };

  function buildMenu(docked) {
    /* Sabit menüde tıklama menüyü kapatmaz — panel arayüzün kalıcı parçası. */
    function dismiss() {
      if (!docked) O.closeTop();
    }

    var me = I.me();
    var body = el("div.menu");

    /* --- kimlik kartı --- */
    body.appendChild(
      el("div.menu__id", null, [
        el("button.menu__avatar", {
          type: "button",
          style: { "--c": me.color },
          text: me.emoji,
          "aria-label": "Görünüşünü değiştir",
          onclick: O.openIdentityEditor,
        }),
        el("div.menu__idtext", null, [
          el("b", { text: me.displayName }),
          el("span", {
            text: State.isVerified() ? me.email : "anonim okur · yorumların onaydan geçer",
          }),
        ]),
        State.isVerified()
          ? el("span.menu__verified", { text: "✓" })
          : el("button.menu__login", { type: "button", text: "Giriş", onclick: function () {
              dismiss();
              O.openAuth("menu");
            } }),
      ])
    );

    /* --- bu sayı --- */
    body.appendChild(el("h3.menu__h", { text: "Bu sayı" }));
    var toc = el("nav.menu__toc");
    var depth = State.depth();
    D.sections.forEach(function (s) {
      if (s.type === "cover") return;
      var pages = s.pages.filter(function (p) {
        return D.pageVisible(p, depth);
      });
      if (!pages.length) return;
      var cur = MAG.canvas.currentPage();
      toc.appendChild(
        el(
          "button.toc__item",
          {
            type: "button",
            "data-slug": s.slug,
            "data-current": cur && cur.sectionSlug === s.slug ? "true" : null,
            onclick: function () {
              dismiss();
              MAG.canvas.goToSection(s.slug);
            },
          },
          [
            el("span.toc__kicker", { text: s.kicker || "" }),
            el("span.toc__title", { text: s.title }),
            el("span.toc__meta", { text: pages.length + " sayfa" + (s.minutes ? " · " + s.minutes + " dk" : "") }),
          ]
        )
      );
    });
    body.appendChild(toc);

    /* --- ayarlar --- */
    body.appendChild(el("h3.menu__h", { text: "Ayarlar" }));
    body.appendChild(
      el("div.menu__rows", null, [
        row("Okuma modu", DEPTHS.filter(function (d) { return d.id === State.depth(); })[0].name, function () {
          dismiss();
          O.openDepthPicker({ switching: true });
        }),
        row("Dil", State.get("locale", "tr").toUpperCase(), function () {
          dismiss();
          O.openLang();
        }),
        toggleRow("Karanlık tema", document.documentElement.dataset.theme === "dark", function (on) {
          O.setTheme(on ? "dark" : "light");
        }),
        toggleRow("Animasyonlar", document.documentElement.dataset.motion !== "off", function (on) {
          document.documentElement.dataset.motion = on ? "on" : "off";
          State.set("motion", on ? "on" : "off");
        }),
      ])
    );

    /* --- diğer --- */
    body.appendChild(el("h3.menu__h", { text: "Dergi" }));
    body.appendChild(
      el("div.menu__rows", null, [
        row("Arşiv", D.archive.length + " sayı", function () {
          dismiss();
          O.openArchive();
        }),
        row("Tanıtımı tekrar izle", "", function () {
          O.closeAll();
          O.openIntro(function () {});
        }),
        row("Moderasyon paneli", "editör", function () {
          dismiss();
          O.openAdmin();
        }),
        row("Analitik", "editör", function () {
          dismiss();
          MAG.analytics.open();
        }),
        row("Prototipi sıfırla", "", function () {
          if (confirm("Tüm yerel veriler silinsin mi? (yorumlar, ilerleme, bulmaca sonuçları)")) State.reset();
        }),
      ])
    );

    body.appendChild(
      el("p.menu__foot", {
        text: D.issue.colophon + " · prototip sürümü, veriler cihazında saklanır",
      })
    );

    return body;
  }

  function header(title) {
    return el("header.panel__head", null, [
      el("h2.panel__title", { text: title }),
      el("button.panel__x", { type: "button", "aria-label": "Kapat", text: "✕", onclick: O.closeTop }),
    ]);
  }

  function row(label, value, onClick) {
    return el("button.mrow", { type: "button", onclick: onClick }, [
      el("span.mrow__label", { text: label }),
      el("span.mrow__value", { text: value }),
      el("span.mrow__chev", { text: "›" }),
    ]);
  }

  function toggleRow(label, on, onChange) {
    var sw = el("span.switch", { "data-on": on ? "true" : "false" });
    return el(
      "button.mrow",
      {
        type: "button",
        onclick: function () {
          on = !on;
          sw.dataset.on = on ? "true" : "false";
          onChange(on);
        },
      },
      [el("span.mrow__label", { text: label }), sw]
    );
  }

  O.setTheme = function (theme) {
    document.documentElement.dataset.theme = theme;
    State.set("theme", theme);
  };

  /* ------------------------------------------------------------------------
     KİMLİK DÜZENLEME
     --------------------------------------------------------------------- */

  O.openIdentityEditor = function () {
    var me = I.me();
    var pal = I.palette();
    var preview = el("div.idedit__preview", { style: { "--c": me.color }, text: me.emoji });
    var nameEl = el("b.idedit__name", { text: me.displayName });

    var body = el("div.idedit", null, [
      el("div.idedit__top", null, [preview, nameEl]),
      el("button.idedit__reroll", { type: "button", text: "↻ Başka bir ad ver", onclick: function () {
        nameEl.textContent = I.reroll().displayName;
      } }),
      el("h4", { text: "Simge" }),
      el(
        "div.idedit__grid",
        null,
        pal.emoji.map(function (e) {
          return el("button", { type: "button", text: e, onclick: function () {
            I.update({ emoji: e });
            preview.textContent = e;
          } });
        })
      ),
      el("h4", { text: "Renk" }),
      el(
        "div.idedit__grid.idedit__grid--colors",
        null,
        pal.colors.map(function (c) {
          return el("button", { type: "button", style: { background: c }, "aria-label": c, onclick: function () {
            I.update({ color: c });
            preview.style.setProperty("--c", c);
          } });
        })
      ),
      el("p.note", { text: "Bu ad ve simge yorumlarında görünür. İstediğin an değiştirebilirsin." }),
    ]);

    O.modal(body, { title: "Görünüşün" });
  };

  /* ========================================================================
     DİL
     ===================================================================== */

  var LANGS = [
    { id: "tr", name: "Türkçe", note: "tam sayı" },
    { id: "en", name: "English", note: "kısmi çeviri" },
    { id: "ja", name: "日本語", note: "kısmi çeviri" },
  ];

  O.openLang = function () {
    var cur = State.get("locale", "tr");
    var body = el(
      "div.langs",
      null,
      LANGS.map(function (l) {
        return el(
          "button.lang",
          {
            type: "button",
            "data-active": cur === l.id ? "true" : null,
            onclick: function () {
              State.set("locale", l.id);
              document.documentElement.lang = l.id;
              U.$("#btn-lang").textContent = l.id.toUpperCase();
              O.closeTop();
              if (l.id !== "tr") {
                O.toast("Bu sayının " + l.name + " çevirisi kısmi — eksik bölümler Türkçe kalır.");
              }
            },
          },
          [el("b", { text: l.name }), el("span", { text: l.note })]
        );
      })
    );
    body.appendChild(
      el("p.note", {
        text: "Kısmi çeviri birinci sınıf vatandaştır: eksik bölüm için nazik bir not gösterilir, sayı yine de açılır.",
      })
    );
    O.modal(body, { title: "Dil" });
  };

  /* ========================================================================
     THREAD PANELİ
     ===================================================================== */

  /**
   * opts: { rootId } | { ids } | { blockId } | { quote } | { pageId, pageLevel }
   * Hangi biçimde gelirse gelsin kök yorumları C.rootsFor çözer — panel bir
   * seçimi gösterir, ankraj tipini bilmez.
   */
  var lastThreadOpts = null;

  O.openThread = function (opts) {
    opts = opts || {};
    lastThreadOpts = opts;
    var roots = C.rootsFor(opts);
    var root = roots.length === 1 ? roots[0] : null;
    var pageId = opts.pageId || (roots[0] && roots[0].pageId);
    var page = MAG.canvas.pageById(pageId);
    var section = page ? D.sectionBySlug(page.sectionSlug) : null;

    /* yeni yorum bu seçimin ankrajını devralır */
    var anchor = opts.blockId
      ? { type: "block", blockId: opts.blockId }
      : root
        ? root.anchor
        : null;
    var quote = opts.quote || (root && C.quoteOf(root)) || null;

    var list = el("div.thread__list");

    if (!roots.length) {
      list.appendChild(
        el("div.thread__empty", null, [
          el("span.big", { text: "💬" }),
          el("p", { text: "Burada henüz yorum yok." }),
          el("p", { text: "Bir paragrafa dokun, bir cümle seç ya da görsele uzun bas." }),
        ])
      );
    } else {
      /* öne çıkan / en çok konuşulan üstte: temsilci ses hangisiyse o */
      roots
        .slice()
        .sort(function (a, b) {
          return C.score(b) - C.score(a) || b.createdAt - a.createdAt;
        })
        .forEach(function (c) {
          /* Başlıkta zaten yazan alıntıyı kartlarda tekrarlama. */
          list.appendChild(commentNode(c, 0, pageId, section, quote));
        });
    }

    var count = roots.reduce(function (n, c) {
      return n + C.threadSize(c.id);
    }, 0);

    var wrap = el("div.thread", null, [
      el("header.thread__head", null, [
        el("h2.thread__title", null, ["Yorumlar ", el("span", { text: count })]),
        el("button.panel__x", { type: "button", "aria-label": "Kapat", text: "✕", onclick: O.closeTop }),
      ]),
      threadContext(quote, opts.blockId || C.blockIdOf(root), roots.length),
      list,
      composerNode({
        pageId: pageId,
        sectionSlug: section ? section.slug : "",
        parentId: null,
        anchor: anchor,
        quote: quote,
        onSent: function () {
          O.closeTop();
          O.openThread(opts);
        },
      }),
    ]);

    O.panel(wrap, "thread");
  };

  /**
   * Panelin başındaki bağlam satırı. Alıntı varsa alıntı, yoksa bloğun adı.
   * Aynı cümleye birden fazla ses varsa bunu açıkça söyler — eskiden bu durum
   * hiç oluşamıyordu (ikinci yorum sessizce sayfa seviyesine düşüyordu).
   */
  function threadContext(quote, blockId, n) {
    if (quote) {
      return el("div.thread__context", null, [
        el("b", { text: n > 1 ? n + " okur bu cümleyi alıntıladı" : "alıntılanan cümle" }),
        "“" + quote + "”",
      ]);
    }
    if (blockId) {
      return el("div.thread__context", null, [
        el("b", { text: "yorum yapılan yer" }),
        C.blockLabel(blockId),
      ]);
    }
    return null;
  }

  function commentNode(c, level, pageId, section, shownQuote) {
    var replies = C.replies(c.id);
    var mine = C.myReactions(c.id);
    var isMine = c.author && c.author.mine;

    var actions = el("div.cmt__actions");

    Object.keys(c.reactions || {}).forEach(function (emo) {
      actions.appendChild(
        el("button.rx", {
          type: "button",
          "data-mine": mine.indexOf(emo) >= 0 ? "true" : null,
          html: emo + " <b>" + c.reactions[emo] + "</b>",
          onclick: function () {
            C.react(c.id, emo);
            refresh(pageId);
          },
        })
      );
    });
    actions.appendChild(
      el("button.rx.rx--add", {
        type: "button",
        text: "＋",
        "aria-label": "Tepki ekle",
        onclick: function (e) {
          reactionPicker(e.currentTarget, c.id, pageId);
        },
      })
    );
    actions.appendChild(
      el("button.cmt__act", {
        type: "button",
        text: "Cevapla",
        onclick: function () {
          O.openComposer({
            pageId: c.pageId,
            sectionSlug: section ? section.slug : "",
            parentId: c.id,
            replyTo: c.author.name,
            onSent: function () {
              refresh(pageId);
            },
          });
        },
      })
    );

    var node = el("article.cmt", { "data-level": level }, [
      el("div.cmt__avatar", { style: { "--c": c.author.color }, text: c.author.emoji }),
      el("div.cmt__main", null, [
        el("div.cmt__head", null, [
          el("span.cmt__name", { text: c.author.name }),
          el("span.cmt__time", { text: U.timeAgo(c.createdAt) }),
          isMine ? el("span.cmt__tag.cmt__tag--mine", { text: "sen" }) : null,
          c.featured ? el("span.cmt__tag.cmt__tag--featured", { text: "editör seçimi" }) : null,
          c.status === "pending" ? el("span.cmt__tag.cmt__tag--pending", { text: "onay bekliyor" }) : null,
        ]),
        /* Alıntı artık yorumun İÇİNDE — sayfada bir işaret değil. */
        C.quoteOf(c) && C.quoteOf(c) !== shownQuote
          ? el("p.cmt__quote", { text: "“" + C.quoteOf(c) + "”" })
          : null,
        el("p.cmt__body", { html: U.inline(c.body) }),
        c._degraded
          ? el("p.cmt__note", { text: "Yorumun bağlandığı blok artık yok; sayfa seviyesine taşındı." })
          : null,
        actions,
        replies.length
          ? el(
              "div.cmt__replies",
              null,
              replies.map(function (r) {
                return commentNode(r, level + 1, pageId, section);
              })
            )
          : null,
      ]),
    ]);
    return node;
  }

  function reactionPicker(anchor, commentId, pageId) {
    var list = ["❤️", "🔥", "😂", "🤯", "🍁", "🙏", "👀", "💯"];
    var pop = el(
      "div.rxpop",
      null,
      list.map(function (e) {
        return el("button", { type: "button", text: e, onclick: function () {
          C.react(commentId, e);
          pop.remove();
          refresh(pageId);
        } });
      })
    );
    anchor.parentElement.appendChild(pop);
    setTimeout(function () {
      document.addEventListener("click", function off() {
        pop.remove();
        document.removeEventListener("click", off);
      });
    }, 0);
  }

  /* Tepki/cevap sonrası paneli aynı SEÇİMLE tazele — yoksa blok yorumundan
     sayfanın tamamına düşüyorduk. */
  function refresh(pageId) {
    var top = openStack[openStack.length - 1];
    if (top && top.node === threadPanel) {
      var opts = lastThreadOpts || { pageId: pageId };
      O.closeTop();
      O.openThread(opts);
    }
    C.decorate();
    C.updateCount();
  }

  /* ========================================================================
     YORUM YAZMA
     ===================================================================== */

  function composerNode(opts) {
    var me = I.me();
    var ta = el("textarea", {
      rows: 1,
      placeholder: opts.replyTo ? opts.replyTo + " kişisine cevap yaz…" : "Bir şey söyle…",
      "aria-label": "Yorumun",
    });
    var send = el("button.composer__send", {
      type: "button",
      disabled: true,
      "aria-label": "Gönder",
      html: '<svg viewBox="0 0 24 24" class="icon" aria-hidden="true"><path d="M4 12l16-8-6 8 6 8z"/></svg>',
    });

    ta.addEventListener("input", function () {
      send.disabled = !ta.value.trim();
      ta.style.height = "auto";
      ta.style.height = Math.min(140, ta.scrollHeight) + "px";
    });
    ta.addEventListener("keydown", function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
    });
    send.addEventListener("click", submit);

    function submit() {
      var body = ta.value.trim();
      if (!body) return;
      C.add({
        pageId: opts.pageId,
        sectionSlug: opts.sectionSlug,
        parentId: opts.parentId || null,
        anchor: opts.parentId ? null : opts.anchor,
        quote: opts.parentId ? null : opts.quote,
        body: body,
      });
      ta.value = "";
      send.disabled = true;
      if (opts.onSent) opts.onSent();
    }

    var verified = State.isVerified();
    return el("div.composer", null, [
      el("div.composer__who", null, [
        el("span.composer__avatar", { style: { "--c": me.color }, text: me.emoji }),
        "Şu an ",
        el("b", { text: me.displayName }),
        verified ? " olarak yazıyorsun" : " olarak, anonim yazıyorsun",
      ]),
      el("div.composer__row", null, [ta, send]),
      verified
        ? el("p.composer__hint", { text: "Yorumun anında yayımlanır." })
        : el("p.composer__hint", null, [
            el("b", { text: "Yorumun onay sırasına düşer. " }),
            "10 saniyede giriş yaparsan anında yayımlanır.",
          ]),
    ]);
  }

  O.openComposer = function (opts) {
    var wrap = el("div.thread", null, [
      el("header.thread__head", null, [
        el("h2.thread__title", { text: opts.parentId ? "Cevap yaz" : "Yorum yaz" }),
        el("button.panel__x", { type: "button", "aria-label": "Kapat", text: "✕", onclick: O.closeTop }),
      ]),
      opts.quoted
        ? el("div.thread__context", null, [el("b", { text: "alıntıladığın cümle" }), "“" + opts.quoted + "”"])
        : null,
      opts.blockHint && !opts.quoted
        ? el("div.thread__context", null, [
            el("b", { text: "yorum yapılan yer" }),
            "Bu " + opts.blockHint + ". Yorumun buraya bağlanacak — metin sonradan düzenlense de yerinde kalır.",
          ])
        : null,
      opts.pointHint
        ? el("div.thread__context", null, [
            el("b", { text: "işaret bırakılıyor" }),
            "Yorumun tam dokunduğun noktaya iliştirilecek. 3:4 tuval sabit olduğu için herkeste aynı yerde görünür.",
          ])
        : null,
      el("div.thread__list"),
      composerNode(
        Object.assign({}, opts, {
          onSent: function () {
            O.closeTop();
            afterFirstComment();
            if (opts.onSent) opts.onSent();
          },
        })
      ),
    ]);
    O.panel(wrap, "thread");
  };

  /** İlk yorumdan sonra giriş teklifi (sayı başına en fazla 2 kez). */
  function afterFirstComment() {
    if (State.isVerified()) {
      O.toast("Yorumun yayımlandı.");
      return;
    }
    O.toast("Yorumun onay sırasına düştü.");
    if (I.canOffer(D.issue.slug)) {
      setTimeout(function () {
        O.openAuth("after-comment");
      }, 900);
    }
  }

  /* ========================================================================
     GİRİŞ — e-posta + 6 haneli kod, sayfadan hiç çıkmadan
     ===================================================================== */

  O.openAuth = function (reason) {
    I.noteOffer(D.issue.slug, false);

    var step = el("div.auth");
    var emailInput = el("input.auth__input", {
      type: "email",
      inputmode: "email",
      autocomplete: "email",
      placeholder: "eposta@ornek.com",
      "aria-label": "E-posta adresin",
    });
    var msg = el("p.auth__msg");

    var reasons = {
      "after-comment": "Yorumun şu an onay sırasında. Giriş yaparsan bundan sonrakiler anında yayımlanır.",
      outro: "Sayıyı bitirdin. Giriş yaparsan ilerlemen ve yorumların cihazlar arasında taşınır.",
      menu: "Tek alan, tek kod. Şifre yok.",
      archive: "Arşiv ücretsiz — sadece giriş yapman yeterli.",
    };

    step.appendChild(el("p.auth__lede", { text: reasons[reason] || reasons.menu }));
    step.appendChild(emailInput);
    step.appendChild(msg);

    var next = el("button.auth__cta", {
      type: "button",
      text: "Kodu gönder",
      onclick: function () {
        var v = emailInput.value.trim();
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) {
          msg.textContent = "Geçerli bir e-posta adresi gir.";
          msg.dataset.kind = "err";
          return;
        }
        var res = I.requestCode(v);
        codeStep(v, res.hint);
      },
    });
    step.appendChild(next);
    step.appendChild(
      el("p.auth__fine", {
        text: "E-postan yalnızca giriş ve “yeni sayı çıktı” bildirimi için kullanılır. Tek tıkla iptal.",
      })
    );
    step.appendChild(
      el("button.auth__later", {
        type: "button",
        text: "Şimdi değil",
        onclick: function () {
          I.noteOffer(D.issue.slug, true);
          O.closeTop();
        },
      })
    );

    var box = O.modal(step, { title: "10 saniyede giriş" });

    function codeStep(email, hint) {
      U.clear(step);
      step.appendChild(el("p.auth__lede", null, [el("b", { text: email }), " adresine 6 haneli bir kod gönderdik."]));

      var boxes = el("div.auth__code");
      var inputs = [];
      for (var i = 0; i < 6; i++) {
        var inp = el("input", {
          type: "text",
          inputmode: "numeric",
          maxlength: "1",
          autocomplete: i === 0 ? "one-time-code" : "off",
          "aria-label": i + 1 + ". hane",
        });
        inputs.push(inp);
        boxes.appendChild(inp);
      }
      inputs.forEach(function (inp, i) {
        inp.addEventListener("input", function () {
          inp.value = inp.value.replace(/\D/g, "");
          if (inp.value && inputs[i + 1]) inputs[i + 1].focus();
          if (inputs.every(function (x) { return x.value; })) verify();
        });
        inp.addEventListener("keydown", function (e) {
          if (e.key === "Backspace" && !inp.value && inputs[i - 1]) inputs[i - 1].focus();
        });
        inp.addEventListener("paste", function (e) {
          var t = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, 6);
          if (!t) return;
          e.preventDefault();
          t.split("").forEach(function (ch, k) {
            if (inputs[k]) inputs[k].value = ch;
          });
          verify();
        });
      });

      var msg2 = el("p.auth__msg");
      step.appendChild(boxes);
      step.appendChild(msg2);
      step.appendChild(
        el("p.auth__fine.auth__fine--dev", null, [
          el("b", { text: "Prototip notu: " }),
          "gerçek mail gitmiyor. Kodun ",
          el("code", { text: hint }),
          " (konsola da yazıldı).",
        ])
      );
      step.appendChild(
        el("button.auth__later", { type: "button", text: "Farklı e-posta", onclick: function () {
          O.closeTop();
          O.openAuth(reason);
        } })
      );
      setTimeout(function () {
        inputs[0].focus();
      }, 120);

      function verify() {
        var code = inputs
          .map(function (x) {
            return x.value;
          })
          .join("");
        if (code.length < 6) return;
        var res = I.verifyCode(code);
        if (!res.ok) {
          msg2.textContent = res.error;
          msg2.dataset.kind = "err";
          boxes.animate(
            [{ transform: "translateX(0)" }, { transform: "translateX(-6px)" }, { transform: "translateX(6px)" }, { transform: "translateX(0)" }],
            { duration: 260 }
          );
          return;
        }
        successStep(res);
      }
    }

    function successStep(res) {
      U.clear(step);
      var me = I.me();
      step.appendChild(el("div.auth__ok", { text: "✓" }));
      step.appendChild(el("h3.auth__okh", { text: "Girdin." }));
      step.appendChild(
        el("p.auth__lede", null, [
          "Kimliğin değişmedi — hâlâ ",
          el("b", { text: me.displayName }),
          "'sın. Okuma ilerlemen, bulmaca sonuçların ve yorumların olduğu gibi duruyor.",
        ])
      );
      if (res.stillPending) {
        step.appendChild(
          el("p.auth__fine", {
            text:
              "Daha önce yazdığın " +
              res.stillPending +
              " yorum onay sırasında kalmaya devam ediyor. Bundan sonrakiler anında yayımlanacak.",
          })
        );
      }
      step.appendChild(
        el("button.auth__cta", { type: "button", text: "Okumaya devam et", onclick: function () {
          O.closeTop();
          C.decorate();
          O.toast("Hoş geldin, " + me.displayName);
        } })
      );
      box.querySelector(".modal__title").textContent = "Tamam";
    }
  };

  /* ========================================================================
     ARŞİV
     ===================================================================== */

  O.openArchive = function (tab) {
    var body = el("div.archive");
    body.appendChild(
      el("p.archive__lede", {
        text: "Arşiv ücretsiz. Eski sayılar ve bulmacaları hep açık kalır.",
      })
    );

    D.archive.forEach(function (a) {
      /* "Açık" = okunuyor olan sayı. "Güncel" = derginin son sayısı.
         Arşivden eski bir sayı açıldığında bu ikisi ayrışır. */
      var acik = a.slug === D.issue.slug;
      var okunabilir = D.hasIssue(a.slug);

      body.appendChild(
        el(
          "button.arch",
          {
            type: "button",
            "data-current": acik ? "true" : null,
            onclick: function () {
              if (acik) {
                O.closeTop();
                MAG.canvas.goTo(0);
              } else if (!okunabilir) {
                O.toast("Bu sayı arşive henüz eklenmedi.");
              } else if (!State.isVerified()) {
                O.closeTop();
                O.openAuth("archive");
              } else {
                /* Sayı değişimi tam yeniden yükleme: aktif sayı URL'de taşınıyor,
                   böylece her modül tek bir MAG.data ile açılıyor. */
                window.location.href = D.issueHref(a.slug);
              }
            },
          },
          [
            el("span.arch__cover", { html: MAG.art.scene(a.scene) }),
            el("span.arch__meta", null, [
              el("b", { text: "№ " + U.pad2(a.number) + " · " + a.title }),
              el("span", { text: a.month + (a.current && !acik ? " · güncel sayı" : "") }),
              acik ? el("span.arch__now", { text: "şu an okuduğun" }) : null,
            ]),
          ]
        )
      );
    });

    if (tab === "puzzles") {
      body.appendChild(el("h4.archive__h", { text: "Bulmaca arşivi" }));
      D.puzzles.forEach(function (p) {
        var run = State.getRun(D.issue.slug, p.id);
        body.appendChild(
          el("div.archp", null, [
            el("span.archp__icon", { text: p.icon }),
            el("span.archp__meta", null, [el("b", { text: p.name }), el("span", { text: p.tags.join(" · ") })]),
            el("span.archp__state", { text: run && run.completedAt ? "✓ çözüldü" : "—" }),
          ])
        );
      });
    }

    O.modal(body, { title: "Arşiv", wide: true });
  };

  /* ========================================================================
     ALINTI PAYLAŞMA KARTI
     ===================================================================== */

  O.openQuoteCard = function (text) {
    if (!text) return;
    var card = el("div.qcard", null, [
      el("div.qcard__bg", { html: MAG.art.scene("leaves") }),
      el("div.qcard__inner", null, [
        el("span.qcard__mark", { html: MAG.art.leafMark() }),
        el("p.qcard__text", { text: "“" + text + "”" }),
        el("p.qcard__meta", { text: D.issue.title + " · Sayı " + U.pad2(D.issue.number) }),
      ]),
    ]);
    var body = el("div.qwrap", null, [
      card,
      el("div.qwrap__row", null, [
        el("button.auth__cta", { type: "button", text: "Görseli kopyala", onclick: function () {
          O.toast("Prototipte görsel üretimi kapalı — gerçekte PNG olarak iner.");
        } }),
      ]),
      el("p.note", { text: "Gerçek üründe bu kart canvas üzerinde PNG'ye çevrilip paylaşılır." }),
    ]);
    O.modal(body, { title: "Alıntıyı paylaş" });
  };

  /* ========================================================================
     MODERASYON PANELİ (sahte /admin)
     ===================================================================== */

  O.openAdmin = function () {
    var body = el("div.admin");
    /* Editör kuyruğu: yalnızca okurun kendi yorumları değil, BEKLEYEN HER ŞEY.
       (Okur bunları sayfada görmez — C.visible() başkasının pending'ini gizler.) */
    var queue = C.all()
      .filter(function (c) {
        return c.status === "pending";
      })
      .sort(function (a, b) {
        return a.createdAt - b.createdAt;
      });

    body.appendChild(
      el("p.archive__lede", {
        text:
          "Onay kuyruğu — " +
          queue.length +
          " bekleyen yorum. Gerçek üründe bu sayfa yalnızca editör hesabına açıktır.",
      })
    );

    if (!queue.length) {
      body.appendChild(
        el("div.thread__empty", null, [
          el("span.big", { text: "✓" }),
          el("p", { text: "Kuyruk boş." }),
          el("p", { text: "Anonim bir yorum yazarsan burada belirir." }),
        ])
      );
    }

    queue.forEach(function (c) {
      var page = MAG.canvas.pageById(c.pageId);
      var card = el("article.mod", null, [
        el("div.mod__ctx", null, [
          el("b", { text: (page ? page.sectionTitle : c.sectionSlug) + " · " + c.pageId }),
          C.quoteOf(c)
            ? "“" + C.quoteOf(c) + "”"
            : C.blockIdOf(c)
              ? C.blockLabel(C.blockIdOf(c))
              : "sayfa üzerine bırakılmış işaret",
        ]),
        el("div.mod__who", null, [
          el("span.cmt__avatar", { style: { "--c": c.author.color }, text: c.author.emoji }),
          el("b", { text: c.author.name }),
          el("span.cmt__time", { text: U.timeAgo(c.createdAt) }),
        ]),
        el("p.cmt__body", { text: c.body }),
        el("div.mod__actions", null, [
          el("button.mod__ok", { type: "button", text: "✓ Onayla", onclick: function () {
            setStatus(c.id, "published");
            card.dataset.gone = "ok";
            O.toast("Yayımlandı.");
          } }),
          el("button.mod__no", { type: "button", text: "✕ Reddet", onclick: function () {
            setStatus(c.id, "rejected");
            card.dataset.gone = "no";
            O.toast("Reddedildi.");
          } }),
        ]),
      ]);
      body.appendChild(card);
    });

    function setStatus(id, status) {
      var list = State.get("comments", []) || [];
      list.forEach(function (c) {
        if (c.id === id) c.status = status;
      });
      State.set("comments", list);
      /* Tohum yorumlar kalıcı listede değil; bellekteki nesneyi de güncelle,
         yoksa onaylanan yorum sayfada belirmez. */
      var seed = C.byId(id);
      if (seed) seed.status = status;
      C.invalidate();
      C.decorate();
      C.updateCount();
    }

    O.modal(body, { title: "Moderasyon", wide: true });
  };

  /* ========================================================================
     SAYI SONU
     ===================================================================== */

  O.renderOutro = function () {
    var host = U.$("#outro");
    if (!host) return;
    U.clear(host);

    var depth = State.depth();
    var pages = MAG.canvas.count();
    var read = Math.min(pages, State.get("stats.pagesRead", 0) || 0);
    var mins = D.estimateMinutes(depth);
    var solved = Object.keys(State.get("puzzleRuns", {}) || {}).filter(function (k) {
      return State.data.puzzleRuns[k].completedAt;
    }).length;
    var myComments = (State.get("comments", []) || []).length;

    host.appendChild(el("span.outro__mark", { html: MAG.art.leafMark() }));
    host.appendChild(el("h1.outro__h", { text: "Bu sayıyı bitirdin" }));
    host.appendChild(
      el("p.outro__lede", {
        text: "№ " + U.pad2(D.issue.number) + " · " + D.issue.title + " · " + D.issue.colophon,
      })
    );

    host.appendChild(
      el("div.outro__stats", null, [
        ostat(pages, "sayfa"),
        ostat("~" + mins + " dk", "okuma"),
        ostat(solved, "bulmaca"),
        ostat(myComments, "yorumun"),
      ])
    );

    if (!State.isVerified() && I.canOffer(D.issue.slug)) {
      host.appendChild(
        el("div.outro__offer", null, [
          el("p", { text: "Gelecek sayı çıktığında haberin olsun mu? Aynı zamanda yorumların anında yayımlanır." }),
          el("button.auth__cta", { type: "button", text: "10 saniyede giriş yap", onclick: function () {
            O.openAuth("outro");
          } }),
          el("button.auth__later", { type: "button", text: "Gerek yok", onclick: function () {
            I.noteOffer(D.issue.slug, true);
            this.parentElement.remove();
          } }),
        ])
      );
    }

    host.appendChild(
      el("div.outro__row", null, [
        el("button.outro__btn", { type: "button", text: "Arşive bak", onclick: function () {
          O.openArchive();
        } }),
        el("button.outro__btn", { type: "button", text: "Baştan oku", onclick: function () {
          MAG.canvas.goTo(0);
        } }),
      ])
    );

    if (D.issue.next) {
      host.appendChild(
        el("p.outro__next", { text: "Gelecek sayı: " + D.issue.next.date + " · “" + D.issue.next.title + "”" })
      );
    }
  };

  function ostat(v, k) {
    return el("div.outro__stat", null, [el("b", { text: v }), el("span", { text: k })]);
  }

  MAG.overlays = O;
})(window.MAG);
