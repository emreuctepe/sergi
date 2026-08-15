/* ============================================================================
   PUZZLES — bulmaca motoru
   ----------------------------------------------------------------------------
   Buradaki bulmacalar GERÇEK custom element'lerdir (`customElements.define`).
   Yani plandaki sözleşme prototipte de birebir uygulanıyor:

     <magazine-puzzle-kelime-avi config='…' locale="tr" state='…'>

   Bulmaca ağa çıkmaz, veritabanı bilmez, dergiyi tanımaz. Sadece olay yayar:
     puzzle:ready · puzzle:progress · puzzle:solved · puzzle:failed · puzzle:hint
   Kaydetme, istatistik ve sonuç ekranı host'un (bu dosyanın alt yarısı) işi.

   Yeni bulmaca eklemek = aşağıdaki gibi bir sınıf + data.js'te bir kayıt.
   Çekirdek koda dokunulmaz.
   ========================================================================= */

(function (MAG) {
  "use strict";

  var U = MAG.util;
  var D = MAG.data;
  var State = MAG.state;
  var el = U.el;

  /* ========================================================================
     SDK — packages/puzzle-sdk karşılığı
     ===================================================================== */

  var SHARED_CSS = `
    :host {
      display: block;
      font-family: var(--font-ui, system-ui);
      color: var(--ink, #222);
      container-type: inline-size;
    }
    * { box-sizing: border-box; }
    .wrap { display: grid; gap: 3cqi; }
    .prompt {
      font-family: var(--font-text, Georgia, serif);
      font-size: clamp(13px, 4cqi, 17px);
      line-height: 1.5;
      color: var(--ink-soft, #555);
    }
    .row { display: flex; flex-wrap: wrap; gap: 2cqi; align-items: center; }
    .btn {
      font: inherit;
      font-size: clamp(12px, 3.4cqi, 15px);
      padding: 2.2cqi 4cqi;
      border-radius: 999px;
      border: 1px solid var(--line, #ddd);
      background: var(--paper-raised, #fff);
      color: inherit;
      cursor: pointer;
      transition: transform 120ms, background 120ms, border-color 120ms;
    }
    .btn:hover { transform: translateY(-1px); }
    .btn--primary { background: var(--accent, #b8432c); color: var(--accent-ink, #fff); border-color: transparent; }
    .btn--ghost { background: transparent; border-style: dashed; color: var(--ink-faint, #888); }
    .done {
      display: flex; align-items: center; gap: 2cqi;
      padding: 3cqi; border-radius: 12px;
      background: color-mix(in oklab, var(--ok, #3f7d52) 14%, transparent);
      color: var(--ok, #3f7d52);
      font-size: clamp(12px, 3.4cqi, 15px); font-weight: 700;
    }
    .meter { display: flex; gap: 1cqi; }
    .meter i {
      flex: 1; height: 4px; border-radius: 2px;
      background: var(--line, #ddd); transition: background 200ms;
    }
    .meter i[data-on] { background: var(--accent, #b8432c); }
  `;

  /** Tüm bulmacaların ortak temeli. */
  function base(render) {
    return class extends HTMLElement {
      constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this._startedAt = Date.now();
        this._attempts = 0;
        this._hints = 0;
      }
      static get observedAttributes() {
        return ["config", "state", "locale"];
      }
      get config() {
        try {
          return JSON.parse(this.getAttribute("config") || "{}");
        } catch (e) {
          return {};
        }
      }
      get savedState() {
        try {
          return JSON.parse(this.getAttribute("state") || "null");
        } catch (e) {
          return null;
        }
      }
      emit(name, detail) {
        this.dispatchEvent(new CustomEvent(name, { detail: detail || {}, bubbles: true, composed: true }));
      }
      progress(state) {
        this.emit("puzzle:progress", { state: state });
      }
      solved(extra) {
        this.emit(
          "puzzle:solved",
          Object.assign(
            { durationMs: Date.now() - this._startedAt, attempts: this._attempts, hints: this._hints },
            extra || {}
          )
        );
      }
      failed() {
        this.emit("puzzle:failed", { attempts: this._attempts });
      }
      hint(level) {
        this._hints++;
        this.emit("puzzle:hint", { level: level || this._hints });
      }
      connectedCallback() {
        this.shadowRoot.innerHTML = "<style>" + SHARED_CSS + (this.css || "") + "</style>";
        this._root = document.createElement("div");
        this._root.className = "wrap";
        this.shadowRoot.appendChild(this._root);
        render.call(this, this._root);
        this.emit("puzzle:ready", { id: this.getAttribute("data-puzzle-id") });
      }
    };
  }

  /* ========================================================================
     BULMACA 1 · KELİME AVI
     ===================================================================== */

  var KelimeAvi = base(function (root) {
    var cfg = this.config;
    var size = cfg.size || 9;
    var words = (cfg.words || []).map(function (w) {
      return w.toLocaleUpperCase("tr");
    });
    var self = this;

    var grid = buildGrid(size, words, 424242);
    var found = (this.savedState && this.savedState.found) || [];
    var first = null;

    var status = el("p.prompt");
    var chips = el("div.row.chips");
    var board = el("div.board");

    words.forEach(function (w) {
      chips.appendChild(el("span.chip", { "data-w": w, text: w }));
    });

    grid.letters.forEach(function (rowArr, r) {
      rowArr.forEach(function (ch, c) {
        board.appendChild(
          el("button.cell", {
            type: "button",
            "data-r": r,
            "data-c": c,
            text: ch,
            onclick: function () {
              tap(r, c, this);
            },
          })
        );
      });
    });
    board.style.setProperty("--n", size);

    function tap(r, c, node) {
      if (!first) {
        first = { r: r, c: c, node: node };
        node.dataset.sel = "1";
        status.textContent = "Şimdi kelimenin son harfine dokun.";
        return;
      }
      var hit = grid.match(first, { r: r, c: c });
      first.node.removeAttribute("data-sel");
      var start = first;
      first = null;

      if (hit && found.indexOf(hit.word) < 0) {
        found.push(hit.word);
        hit.cells.forEach(function (k) {
          var cell = root.querySelector('.cell[data-r="' + k.r + '"][data-c="' + k.c + '"]');
          if (cell) cell.dataset.found = "1";
        });
        var chip = root.querySelector('.chip[data-w="' + hit.word + '"]');
        if (chip) chip.dataset.done = "1";
        self.progress({ found: found });
        paint();
        if (found.length === words.length) {
          status.textContent = "";
          root.appendChild(el("div.done", { text: "✓ Altısı da bulundu" }));
          self.solved({ score: words.length });
        }
      } else {
        self._attempts++;
        status.textContent = hit ? "Bunu zaten buldun." : "Orada bir kelime yok. Tekrar dene.";
        start.node.animate(
          [{ transform: "translateX(0)" }, { transform: "translateX(-4px)" }, { transform: "translateX(4px)" }, { transform: "translateX(0)" }],
          { duration: 220 }
        );
      }
    }

    function paint() {
      status.textContent = found.length + " / " + words.length + " kelime bulundu.";
    }

    /* kayıtlı durumu geri yükle */
    found.forEach(function (w) {
      var placed = grid.placed[w];
      if (!placed) return;
      placed.forEach(function (k) {
        var cell = root.querySelector('.cell[data-r="' + k.r + '"][data-c="' + k.c + '"]');
        if (cell) cell.dataset.found = "1";
      });
      var chip = root.querySelector('.chip[data-w="' + w + '"]');
      if (chip) chip.dataset.done = "1";
    });

    root.appendChild(el("p.prompt", { text: "Yazıdan altı kelime ızgarada saklı. İlk ve son harfe dokun." }));
    root.appendChild(board);
    root.appendChild(chips);
    root.appendChild(status);
    root.appendChild(
      el("div.row", null, [
        el("button.btn.btn--ghost", {
          type: "button",
          text: "İpucu ver",
          onclick: function () {
            var left = words.filter(function (w) {
              return found.indexOf(w) < 0;
            });
            if (!left.length) return;
            var w = left[0];
            var k = grid.placed[w][0];
            var cell = root.querySelector('.cell[data-r="' + k.r + '"][data-c="' + k.c + '"]');
            if (cell) {
              cell.dataset.hint = "1";
              setTimeout(function () {
                cell.removeAttribute("data-hint");
              }, 2400);
            }
            self.hint();
            status.textContent = "“" + w + "” buradan başlıyor.";
          },
        }),
      ])
    );
    paint();
  });

  KelimeAvi.prototype.css = `
    .board {
      display: grid;
      grid-template-columns: repeat(var(--n), 1fr);
      gap: 1cqi;
      background: var(--paper-sunken, #eee);
      padding: 1.6cqi;
      border-radius: 10px;
    }
    .cell {
      aspect-ratio: 1;
      display: grid; place-items: center;
      font: inherit; font-weight: 700;
      font-size: clamp(10px, 3.4cqi, 16px);
      border: 0; border-radius: 5px;
      background: var(--paper-raised, #fff);
      color: var(--ink, #222);
      cursor: pointer;
      transition: background 140ms, transform 140ms, color 140ms;
    }
    .cell:hover { transform: scale(1.08); }
    .cell[data-sel] { background: var(--ink, #222); color: var(--paper, #fff); }
    .cell[data-found] { background: var(--accent, #b8432c); color: var(--accent-ink, #fff); }
    .cell[data-hint] { outline: 2px dashed var(--accent, #b8432c); outline-offset: 1px; }
    .chip {
      padding: 1.4cqi 3cqi; border-radius: 999px;
      border: 1px solid var(--line, #ddd);
      font-size: clamp(10px, 3cqi, 13px); letter-spacing: .08em;
    }
    .chip[data-done] {
      background: var(--accent, #b8432c); color: var(--accent-ink, #fff);
      border-color: transparent; text-decoration: line-through;
    }
  `;

  /** Izgarayı kur: kelimeleri yerleştir, kalanı doldur. Tohumlu → hep aynı. */
  function buildGrid(size, words, seed) {
    var rand = U.rng(seed);
    var alphabet = "ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ";
    var letters = [];
    for (var r = 0; r < size; r++) {
      letters.push(new Array(size).fill(null));
    }
    var placed = {};
    var dirs = [
      [0, 1],
      [1, 0],
      [1, 1],
      [-1, 1],
    ];

    words.forEach(function (w) {
      for (var tries = 0; tries < 400; tries++) {
        var d = dirs[Math.floor(rand() * dirs.length)];
        var r0 = Math.floor(rand() * size);
        var c0 = Math.floor(rand() * size);
        var rEnd = r0 + d[0] * (w.length - 1);
        var cEnd = c0 + d[1] * (w.length - 1);
        if (rEnd < 0 || rEnd >= size || cEnd < 0 || cEnd >= size) continue;
        var ok = true;
        var cells = [];
        for (var i = 0; i < w.length; i++) {
          var rr = r0 + d[0] * i;
          var cc = c0 + d[1] * i;
          if (letters[rr][cc] && letters[rr][cc] !== w[i]) {
            ok = false;
            break;
          }
          cells.push({ r: rr, c: cc });
        }
        if (!ok) continue;
        cells.forEach(function (k, i) {
          letters[k.r][k.c] = w[i];
        });
        placed[w] = cells;
        return;
      }
    });

    for (var r2 = 0; r2 < size; r2++) {
      for (var c2 = 0; c2 < size; c2++) {
        if (!letters[r2][c2]) letters[r2][c2] = alphabet[Math.floor(rand() * alphabet.length)];
      }
    }

    return {
      letters: letters,
      placed: placed,
      /** İki hücre bir kelimenin uçları mı? */
      match: function (a, b) {
        var keys = Object.keys(placed);
        for (var i = 0; i < keys.length; i++) {
          var cells = placed[keys[i]];
          var s = cells[0];
          var e = cells[cells.length - 1];
          var fwd = s.r === a.r && s.c === a.c && e.r === b.r && e.c === b.c;
          var bwd = e.r === a.r && e.c === a.c && s.r === b.r && s.c === b.c;
          if (fwd || bwd) return { word: keys[i], cells: cells };
        }
        return null;
      },
    };
  }

  /* ========================================================================
     BULMACA 2 · HAİKU TAMAMLA  (editör seçimi)
     ===================================================================== */

  var HaikuTamamla = base(function (root) {
    var self = this;
    var items = this.config.items || [];
    var saved = (this.savedState && this.savedState.answers) || [];
    var answers = saved.slice();

    var meter = el("div.meter", null, items.map(function () { return el("i"); }));
    root.appendChild(el("p.prompt", { text: "Üç haiku, üç eksik satır. Doğru olanı seç." }));
    root.appendChild(meter);

    items.forEach(function (item, idx) {
      var card = el("div.haiku", { "data-i": idx });
      var lines = el("div.lines");
      item.lines.forEach(function (ln) {
        lines.appendChild(el("p.line" + (ln === "___" ? ".line--gap" : ""), { text: ln === "___" ? "· · ·" : ln }));
      });
      card.appendChild(lines);

      var opts = el("div.opts");
      item.options.forEach(function (o, oi) {
        opts.appendChild(
          el("button.opt", {
            type: "button",
            text: o,
            onclick: function () {
              choose(idx, oi, card, this);
            },
          })
        );
      });
      card.appendChild(opts);
      root.appendChild(card);
    });

    function choose(idx, oi, card, node) {
      if (answers[idx] !== undefined && answers[idx] !== null) return;
      var right = items[idx].answer === oi;
      answers[idx] = oi;
      node.dataset.state = right ? "right" : "wrong";
      if (right) {
        var gap = card.querySelector(".line--gap");
        if (gap) {
          gap.textContent = items[idx].options[oi];
          gap.dataset.filled = "1";
        }
        card.dataset.done = "1";
        meter.children[idx].dataset.on = "1";
      } else {
        self._attempts++;
        answers[idx] = null;
        setTimeout(function () {
          node.removeAttribute("data-state");
        }, 900);
      }
      self.progress({ answers: answers });

      var complete = items.every(function (_, i) {
        return answers[i] !== undefined && answers[i] !== null;
      });
      if (complete) {
        root.appendChild(el("div.done", { text: "✓ Üçü de tamam" }));
        self.solved({ score: items.length });
      }
    }
  });

  HaikuTamamla.prototype.css = `
    .haiku {
      padding: 4cqi; border-radius: 12px;
      background: var(--paper-sunken, #f0ece3);
      display: grid; gap: 3cqi;
      transition: background 300ms;
    }
    .haiku[data-done] { background: color-mix(in oklab, var(--accent, #b8432c) 10%, transparent); }
    .lines { display: grid; gap: .6cqi; }
    .line {
      margin: 0;
      font-family: var(--font-display, Georgia, serif);
      font-size: clamp(14px, 4.6cqi, 20px);
      line-height: 1.42;
    }
    .line--gap { color: var(--ink-faint, #999); letter-spacing: .3em; }
    .line--gap[data-filled] { color: var(--accent, #b8432c); letter-spacing: 0; font-style: italic; }
    .opts { display: grid; gap: 1.6cqi; }
    .opt {
      font: inherit; text-align: right;
      font-size: clamp(11px, 3.4cqi, 15px);
      padding: 2.4cqi 3.4cqi; border-radius: 10px;
      border: 1px solid var(--line, #ddd);
      background: var(--paper-raised, #fff); color: inherit; cursor: pointer;
      transition: border-color 160ms, background 160ms, transform 160ms;
    }
    .opt:hover { border-color: var(--accent, #b8432c); }
    .opt[data-state="right"] { background: var(--accent, #b8432c); color: var(--accent-ink, #fff); border-color: transparent; }
    .opt[data-state="wrong"] { border-color: var(--danger, #a6392c); transform: translateX(4px); }
    .haiku[data-done] .opts { display: none; }
  `;

  /* ========================================================================
     BULMACA 3 · RENK DİZİSİ
     ===================================================================== */

  var RenkDizisi = base(function (root) {
    var self = this;
    var rounds = this.config.rounds || 8;
    var swatches = ["var(--accent)", "var(--accent-2)", "var(--accent-3)", "var(--ink)"];
    var seq = [];
    var input = [];
    var playing = false;

    var status = el("p.prompt", { text: "Diziyi izle, sonra aynı sırayla tekrarla." });
    var meter = el("div.meter", null, new Array(rounds).fill(0).map(function () { return el("i"); }));
    var pad = el("div.pad");

    swatches.forEach(function (c, i) {
      pad.appendChild(
        el("button.sw", {
          type: "button",
          style: { "--c": c },
          "data-i": i,
          onclick: function () {
            press(i, this);
          },
        })
      );
    });

    function flash(node, ms) {
      node.dataset.lit = "1";
      setTimeout(function () {
        node.removeAttribute("data-lit");
      }, ms || 260);
    }

    function play() {
      playing = true;
      input = [];
      status.textContent = "İzle…";
      seq.forEach(function (s, i) {
        setTimeout(function () {
          flash(pad.children[s]);
          if (i === seq.length - 1) {
            setTimeout(function () {
              playing = false;
              status.textContent = "Sıra sende (" + seq.length + " adım)";
            }, 320);
          }
        }, 420 * i + 260);
      });
    }

    function nextRound() {
      seq.push(Math.floor(Math.random() * swatches.length));
      meter.children[seq.length - 1].dataset.on = "1";
      play();
    }

    function press(i, node) {
      if (playing || !seq.length) return;
      flash(node, 160);
      input.push(i);
      var k = input.length - 1;
      if (input[k] !== seq[k]) {
        self._attempts++;
        status.textContent = "Yanlış sıra. Baştan.";
        node.dataset.bad = "1";
        setTimeout(function () {
          node.removeAttribute("data-bad");
        }, 400);
        seq = [];
        U.$$("i", meter).forEach(function (m) {
          m.removeAttribute("data-on");
        });
        self.failed();
        setTimeout(nextRound, 900);
        return;
      }
      if (input.length === seq.length) {
        self.progress({ round: seq.length });
        if (seq.length >= rounds) {
          status.textContent = "";
          root.appendChild(el("div.done", { text: "✓ " + rounds + " adımın hepsi" }));
          self.solved({ score: rounds });
          return;
        }
        status.textContent = "Doğru.";
        setTimeout(nextRound, 700);
      }
    }

    root.appendChild(status);
    root.appendChild(meter);
    root.appendChild(pad);
    root.appendChild(
      el("div.row", null, [
        el("button.btn.btn--primary", { type: "button", text: "Başlat", onclick: function () {
          if (!seq.length) nextRound();
          else play();
        } }),
      ])
    );
  });

  RenkDizisi.prototype.css = `
    .pad { display: grid; grid-template-columns: 1fr 1fr; gap: 2cqi; }
    .sw {
      aspect-ratio: 1.4; border: 0; border-radius: 12px;
      background: var(--c); opacity: .4; cursor: pointer;
      transition: opacity 140ms, transform 140ms, box-shadow 140ms;
    }
    .sw:hover { opacity: .62; }
    .sw[data-lit] { opacity: 1; transform: scale(1.03); box-shadow: 0 0 0 3px color-mix(in oklab, var(--c) 40%, transparent); }
    .sw[data-bad] { outline: 3px solid var(--danger, #a6392c); }
  `;

  /* ========================================================================
     BULMACA 4 · PANEL SIRALA   ← "lego" testi
     Bu bulmaca en son yazıldı ve çekirdek kodun TEK SATIRINA dokunulmadı.
     Sadece: bir sınıf + customElements.define + data.js'te bir kayıt.
     ===================================================================== */

  var PanelSirala = base(function (root) {
    var self = this;
    var n = this.config.panels || 5;
    var order = [];
    var shuffled = shuffle(
      new Array(n).fill(0).map(function (_, i) {
        return i;
      }),
      U.rng(9182)
    );

    var status = el("p.prompt", { text: "Paneller karıştı. Sağdan sola okuma sırasına göre dokun." });
    var strip = el("div.strip", { dir: "rtl" });

    shuffled.forEach(function (idx) {
      strip.appendChild(
        el("button.pan", {
          type: "button",
          "data-idx": idx,
          html: MAG.art.mangaPanel(idx, "", ""),
          onclick: function () {
            tap(idx, this);
          },
        })
      );
    });

    function tap(idx, node) {
      if (node.dataset.taken) return;
      var expected = order.length;
      if (idx !== expected) {
        self._attempts++;
        status.textContent = "Bu sıradaki değil.";
        node.animate([{ transform: "translateY(0)" }, { transform: "translateY(-6px)" }, { transform: "translateY(0)" }], { duration: 240 });
        return;
      }
      order.push(idx);
      node.dataset.taken = "1";
      node.appendChild(el("span.num", { text: order.length }));
      self.progress({ order: order });
      status.textContent = order.length + " / " + n;
      if (order.length === n) {
        status.textContent = "";
        root.appendChild(el("div.done", { text: "✓ Sıra doğru" }));
        self.solved({ score: n });
      }
    }

    root.appendChild(status);
    root.appendChild(strip);
  });

  PanelSirala.prototype.css = `
    .strip { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2cqi; }
    .pan {
      position: relative; aspect-ratio: 3/4; padding: 0;
      border: 2px solid var(--ink, #222); border-radius: 3px;
      overflow: hidden; cursor: pointer; background: none;
      transition: opacity 160ms, filter 160ms;
    }
    .pan svg { width: 100%; height: 100%; display: block; }
    .pan[data-taken] { filter: grayscale(1); opacity: .5; cursor: default; }
    .num {
      position: absolute; inset-inline-end: 4%; top: 4%;
      display: grid; place-items: center;
      width: 26%; aspect-ratio: 1; border-radius: 999px;
      background: var(--accent, #b8432c); color: var(--accent-ink, #fff);
      font-weight: 800; font-size: clamp(10px, 3cqi, 14px);
    }
  `;

  function shuffle(arr, rand) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rand() * (i + 1));
      var t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  /* ------------------------------------------------------------------------
     KAYIT — her bulmaca kendi etiketini tanımlar
     --------------------------------------------------------------------- */

  var REGISTRY = {
    "kelime-avi": KelimeAvi,
    "haiku-tamamla": HaikuTamamla,
    "renk-dizisi": RenkDizisi,
    "panel-sirala": PanelSirala,
  };

  Object.keys(REGISTRY).forEach(function (id) {
    var tag = "magazine-puzzle-" + id;
    if (!customElements.get(tag)) customElements.define(tag, REGISTRY[id]);
  });

  /* ========================================================================
     HOST — dergi tarafı: öneri, montaj, kayıt, sonuç, istatistik
     ===================================================================== */

  var P = {};

  /**
   * Öneri algoritması (plandaki tablo birebir):
   *   tamamladı +2 · tekrar oynadı +3 · başlayıp bıraktı −1
   *   hiç açmadı −0.5 · ❤️ dedi +5   → etiket puanına yazılır
   * Kişisel yuva = havuzdaki (editör seçimi hariç) en yüksek puanlı bulmaca
   *                + son 3 sayıda görülmemiş etikete yenilik bonusu
   */
  P.recommend = function () {
    var pick = D.issue.editorsPick;
    var pool = D.issue.puzzlePool.filter(function (id) {
      return id !== pick;
    });

    var cold = !Object.keys(State.get("tagScores", {}) || {}).length;
    var scored = pool.map(function (id) {
      var p = D.puzzleById(id);
      var score = State.tagScore(p.tags);
      var novelty = seenRecently(p.tags) ? 0 : 1.2;
      return { id: id, score: score + novelty, base: score, novelty: novelty, puzzle: p };
    });
    scored.sort(function (a, b) {
      return b.score - a.score;
    });

    var personal = scored[0];
    return {
      editor: { id: pick, puzzle: D.puzzleById(pick), reason: "editor" },
      personal: {
        id: personal.id,
        puzzle: personal.puzzle,
        reason: cold ? "cold" : personal.novelty > 0 ? "novelty" : "taste",
        score: personal.base,
      },
      cold: cold,
      alternatives: scored.slice(1),
    };
  };

  function seenRecently(tags) {
    var runs = State.get("puzzleRuns", {}) || {};
    var seen = {};
    Object.keys(runs).forEach(function (k) {
      var p = D.puzzleById(runs[k].puzzleId);
      if (p) p.tags.forEach(function (t) { seen[t] = true; });
    });
    return tags.some(function (t) {
      return seen[t];
    });
  }

  /** Soğuk başlangıç mikro-sorusu: "hangisi kulağa hoş geliyor?" */
  P.coldStart = function (host, onDone) {
    var choices = [
      { tag: "kelime", icon: "🔤", label: "Kelimeler" },
      { tag: "görsel", icon: "🎨", label: "Görseller" },
      { tag: "mantık", icon: "🧩", label: "Mantık" },
    ];
    var card = el("div.cold", null, [
      el("p.cold__q", { text: "Hangisi kulağa hoş geliyor?" }),
      el(
        "div.cold__row",
        null,
        choices.map(function (c) {
          return el("button.cold__btn", { type: "button", onclick: function () {
            State.bumpTags([c.tag], 4);
            State.set("coldStartAnswer", c.tag);
            onDone();
          } }, [el("span.cold__icon", { text: c.icon }), el("span", { text: c.label })]);
        })
      ),
      el("button.cold__skip", { type: "button", text: "Geç", onclick: function () {
        State.set("coldStartAnswer", "skip");
        onDone();
      } }),
    ]);
    host.appendChild(card);
  };

  /** Bulmaca yuvalarını basar. */
  P.mount = function () {
    var host = U.$("#puzzle-slots");
    if (!host) return;
    U.clear(host);

    if (!State.get("coldStartAnswer")) {
      P.coldStart(host, function () {
        P.mount();
      });
      return;
    }

    var rec = P.recommend();
    host.appendChild(slot(rec.editor.puzzle, "editor", rec));
    host.appendChild(slot(rec.personal.puzzle, rec.personal.reason, rec));
    host.appendChild(archiveLink());
  };

  var REASON = {
    editor: { label: "Editör seçimi", why: null },
    taste: { label: "Senin için", why: "Daha önce oynadığın bulmacaların etiketlerine en yakın olan bu." },
    novelty: { label: "Senin için", why: "Bu türü henüz denemedin — bu yüzden öne çıkardım." },
    cold: { label: "Senin için", why: "Az önceki seçimine göre." },
  };

  function slot(puzzle, reason, rec) {
    var run = State.getRun(D.issue.slug, puzzle.id);
    var done = run && run.completedAt;
    var meta = REASON[reason] || REASON.taste;
    var why = reason === "editor" ? puzzle.editorsNote : meta.why;

    var body = el("div.pslot__body", { hidden: true });

    var card = el("article.pslot", { "data-done": done ? "true" : null }, [
      el("header.pslot__head", null, [
        el("span.pslot__icon", { text: puzzle.icon }),
        el("div.pslot__meta", null, [
          el("span.pslot__badge" + (reason === "editor" ? ".pslot__badge--editor" : ""), { text: meta.label }),
          el("h3.pslot__title", { text: puzzle.name }),
          el("p.pslot__blurb", { text: puzzle.blurb }),
        ]),
      ]),
      el("div.pslot__facts", null, [
        el("span", { text: "≈ " + puzzle.estMinutes + " dk" }),
        el("span", { text: "zorluk " + "●".repeat(puzzle.difficulty) + "○".repeat(3 - puzzle.difficulty) }),
        el("span", { text: puzzle.tags.join(" · ") }),
      ]),
      why ? el("p.pslot__why", null, [el("b", { text: "Bunu neden gördün? " }), why]) : null,
      done ? el("div.pslot__done", { text: "✓ Çözdün — " + Math.round(run.durationMs / 1000) + " sn" }) : null,
      el("button.pslot__cta", {
        type: "button",
        text: done ? "Tekrar oyna" : "Oyna",
        onclick: function () {
          if (!body.hidden) {
            body.hidden = true;
            this.textContent = done ? "Tekrar oyna" : "Oyna";
            return;
          }
          openPuzzle(puzzle, body, card);
          this.textContent = "Kapat";
        },
      }),
      body,
    ]);
    return card;
  }

  function openPuzzle(puzzle, body, card) {
    U.clear(body);
    body.hidden = false;

    var run = State.getRun(D.issue.slug, puzzle.id);
    var replay = !!(run && run.completedAt);
    var node = document.createElement("magazine-puzzle-" + puzzle.id);
    node.setAttribute("config", JSON.stringify(puzzle.config));
    node.setAttribute("locale", State.get("locale", "tr"));
    node.setAttribute("data-puzzle-id", puzzle.id);
    if (run && run.state && !replay) node.setAttribute("state", JSON.stringify(run.state));
    node.className = "puzzle";

    /* --- SÖZLEŞME: host sadece olayları dinler ---------------------------- */
    node.addEventListener("puzzle:ready", function () {
      State.saveRun(D.issue.slug, puzzle.id, { startedAt: Date.now() });
      State.bumpTags(puzzle.tags, replay ? 3 : 0);
    });
    node.addEventListener("puzzle:progress", function (e) {
      State.saveRun(D.issue.slug, puzzle.id, { state: e.detail.state });
    });
    node.addEventListener("puzzle:hint", function (e) {
      var r = State.getRun(D.issue.slug, puzzle.id) || {};
      State.saveRun(D.issue.slug, puzzle.id, { hintsUsed: (r.hintsUsed || 0) + 1 });
    });
    node.addEventListener("puzzle:failed", function (e) {
      var r = State.getRun(D.issue.slug, puzzle.id) || {};
      State.saveRun(D.issue.slug, puzzle.id, { attempts: (r.attempts || 0) + (e.detail.attempts || 1) });
    });
    node.addEventListener("puzzle:solved", function (e) {
      State.saveRun(D.issue.slug, puzzle.id, {
        completedAt: Date.now(),
        durationMs: e.detail.durationMs,
        attempts: e.detail.attempts,
      });
      State.bumpTags(puzzle.tags, 2);
      card.dataset.done = "true";
      body.appendChild(resultCard(puzzle, e.detail));
      MAG.overlays.toast("Bulmaca çözüldü 🎉");
      U.emit("puzzle:solved", { puzzle: puzzle, detail: e.detail });
    });

    body.appendChild(node);
  }

  /** Kişisel sonuç + anonim okur istatistikleri (sıralama YOK — bilinçli). */
  function resultCard(puzzle, detail) {
    var s = puzzle.stats;
    var sec = Math.round(detail.durationMs / 1000);
    var faster = Math.max(4, Math.min(96, Math.round(100 - (sec / s.avgSeconds) * 50)));
    return el("div.presult", null, [
      el("h4", { text: "Sonuç" }),
      el("div.presult__grid", null, [
        stat(sec + " sn", "senin süren"),
        stat(Math.round(s.avgSeconds) + " sn", "okur ortalaması"),
        stat(detail.attempts || 0, "hatalı deneme"),
        stat(detail.hints || 0, "ipucu"),
      ]),
      el("div.presult__bar", null, [
        el("div.presult__fill", { style: { width: faster + "%" } }),
        el("span", { text: "Okurların %" + faster + "'inden hızlısın" }),
      ]),
      el("p.presult__note", {
        text:
          "Okurların %" +
          Math.round(s.firstTryRate * 100) +
          "'i ilk denemede bildi. " +
          s.solves.toLocaleString("tr") +
          " kişi çözdü.",
      }),
      el("div.presult__row", null, [
        el("button.btn.btn--ghost", {
          type: "button",
          text: "❤️ Bu bulmacayı sevdim",
          onclick: function () {
            State.bumpTags(puzzle.tags, 5);
            this.textContent = "❤️ Not aldım";
            this.disabled = true;
          },
        }),
      ]),
    ]);
  }

  function stat(v, k) {
    return el("div.presult__stat", null, [el("b", { text: v }), el("span", { text: k })]);
  }

  function archiveLink() {
    return el("div.pslot.pslot--archive", null, [
      el("p", { text: "Eski sayıların bulmacaları hep açık." }),
      el("button.btn.btn--ghost", {
        type: "button",
        text: "Bulmaca arşivi",
        onclick: function () {
          MAG.overlays.openArchive("puzzles");
        },
      }),
    ]);
  }

  P.init = function () {
    U.listen("flow:render", function () {
      P.mount();
    });
  };

  P.registry = REGISTRY;
  MAG.puzzles = P;
})(window.MAG);
