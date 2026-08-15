/* ============================================================================
   UTIL — küçük DOM ve veri yardımcıları
   Global ad alanı: MAG (ES modül yok, prototip file:// üzerinden açılabilsin).
   ========================================================================= */
window.MAG = window.MAG || {};

(function (MAG) {
  "use strict";

  var U = {};

  /* --- DOM ---------------------------------------------------------------- */

  U.$ = function (sel, root) {
    return (root || document).querySelector(sel);
  };

  U.$$ = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };

  /**
   * el("div.card", { "data-x": 1 }, [child, "metin"])
   * Etiket dizgisi CSS benzeri kısayol kabul eder: "button.btn.btn--x#id"
   */
  U.el = function (spec, attrs, children) {
    var m = /^([a-z0-9-]+)?(.*)$/i.exec(spec || "div");
    var tag = m[1] || "div";
    var node = document.createElement(tag);
    var rest = m[2] || "";
    var token;
    var re = /([.#])([^.#]+)/g;
    while ((token = re.exec(rest))) {
      if (token[1] === ".") node.classList.add(token[2]);
      else node.id = token[2];
    }
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v === null || v === undefined || v === false) return;
        if (k === "style" && typeof v === "object") {
          Object.keys(v).forEach(function (p) {
            node.style.setProperty(p, v[p]);
          });
        } else if (k === "html") {
          node.innerHTML = v;
        } else if (k === "text") {
          node.textContent = v;
        } else if (k.slice(0, 2) === "on" && typeof v === "function") {
          node.addEventListener(k.slice(2).toLowerCase(), v);
        } else if (v === true) {
          node.setAttribute(k, "");
        } else {
          node.setAttribute(k, v);
        }
      });
    }
    U.append(node, children);
    return node;
  };

  U.append = function (parent, children) {
    if (children === null || children === undefined) return parent;
    var list = Array.isArray(children) ? children : [children];
    list.forEach(function (c) {
      if (c === null || c === undefined || c === false) return;
      parent.appendChild(typeof c === "object" ? c : document.createTextNode(String(c)));
    });
    return parent;
  };

  U.clear = function (node) {
    while (node && node.firstChild) node.removeChild(node.firstChild);
    return node;
  };

  U.on = function (target, type, handler, opts) {
    target.addEventListener(type, handler, opts);
    return function off() {
      target.removeEventListener(type, handler, opts);
    };
  };

  /** Basit olay yayını — modüller birbirine doğrudan bağlanmasın diye. */
  var bus = document.createElement("i");
  U.emit = function (type, detail) {
    bus.dispatchEvent(new CustomEvent(type, { detail: detail }));
  };
  U.listen = function (type, handler) {
    bus.addEventListener(type, handler);
    return function off() {
      bus.removeEventListener(type, handler);
    };
  };

  /* --- metin -------------------------------------------------------------- */

  U.escape = function (s) {
    return String(s === null || s === undefined ? "" : s).replace(
      /[&<>"']/g,
      function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
      }
    );
  };

  /** Çok basit satır içi biçimleme: *italik*, **kalın**, `kod`, [bağ](url) */
  U.inline = function (s) {
    return U.escape(s)
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>")
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  };

  U.slug = function (s) {
    var map = { ı: "i", İ: "i", ş: "s", Ş: "s", ğ: "g", Ğ: "g", ü: "u", Ü: "u", ö: "o", Ö: "o", ç: "c", Ç: "c" };
    return String(s)
      .replace(/[ıİşŞğĞüÜöÖçÇ]/g, function (c) { return map[c]; })
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  /* --- sayı / zaman -------------------------------------------------------- */

  U.clamp = function (v, lo, hi) {
    return v < lo ? lo : v > hi ? hi : v;
  };

  U.pad2 = function (n) {
    return (n < 10 ? "0" : "") + n;
  };

  /** "3 dk", "2 sa", "dün", "4 Eyl" */
  U.timeAgo = function (ts) {
    var d = Math.floor((Date.now() - ts) / 1000);
    if (d < 45) return "az önce";
    if (d < 3600) return Math.floor(d / 60) + " dk";
    if (d < 86400) return Math.floor(d / 3600) + " sa";
    if (d < 172800) return "dün";
    if (d < 604800) return Math.floor(d / 86400) + " gün";
    var dt = new Date(ts);
    var ay = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
    return dt.getDate() + " " + ay[dt.getMonth()];
  };

  U.minutes = function (words) {
    return Math.max(1, Math.round(words / 200));
  };

  /* --- rastgelelik (tohumlu — sahte veri her açılışta aynı görünsün) ------- */

  U.rng = function (seed) {
    var s = seed >>> 0 || 1;
    return function () {
      s ^= s << 13;
      s ^= s >>> 17;
      s ^= s << 5;
      s >>>= 0;
      return s / 4294967296;
    };
  };

  U.pick = function (arr, rand) {
    return arr[Math.floor((rand ? rand() : Math.random()) * arr.length)];
  };

  U.uid = function (prefix) {
    return (prefix || "id") + "-" + Math.random().toString(36).slice(2, 9);
  };

  /* --- zamanlama ----------------------------------------------------------- */

  U.debounce = function (fn, ms) {
    var t;
    return function () {
      var args = arguments;
      var self = this;
      clearTimeout(t);
      t = setTimeout(function () {
        fn.apply(self, args);
      }, ms || 120);
    };
  };

  U.raf = function (fn) {
    var queued = false;
    var lastArgs;
    return function () {
      lastArgs = arguments;
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () {
        queued = false;
        fn.apply(null, lastArgs);
      });
    };
  };

  U.reducedMotion = function () {
    return (
      document.documentElement.dataset.motion === "off" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  };

  /* --- depolama ------------------------------------------------------------ */

  var NS = "mag:";

  U.store = {
    get: function (key, fallback) {
      try {
        var raw = localStorage.getItem(NS + key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch (e) {
        return fallback;
      }
    },
    set: function (key, value) {
      try {
        localStorage.setItem(NS + key, JSON.stringify(value));
      } catch (e) {
        /* özel sekme / kota — prototipte sessizce geç */
      }
      return value;
    },
    remove: function (key) {
      try {
        localStorage.removeItem(NS + key);
      } catch (e) {}
    },
    clearAll: function () {
      try {
        Object.keys(localStorage)
          .filter(function (k) {
            return k.indexOf(NS) === 0;
          })
          .forEach(function (k) {
            localStorage.removeItem(k);
          });
      } catch (e) {}
    },
  };

  MAG.util = U;
})(window.MAG);
