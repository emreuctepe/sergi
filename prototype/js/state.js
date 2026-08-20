/* ============================================================================
   STATE — tek merkezi durum deposu (localStorage destekli)
   ----------------------------------------------------------------------------
   Gerçek üründe bunun yarısı Supabase'te (`readers`, `reading_progress`,
   `puzzle_runs`), yarısı istemcide durur. Prototipte hepsi burada — ama
   alan adları gerçek şemayla birebir aynı tutuldu ki geçiş kolay olsun.
   ========================================================================= */

(function (MAG) {
  "use strict";

  var U = MAG.util;
  var KEY = "state:v1";

  var DEFAULTS = {
    /* --- okur (readers tablosu) ------------------------------------------- */
    reader: null, // identity.js doldurur

    /* --- tercihler --------------------------------------------------------- */
    depth: null, // 'min' | 'mid' | 'full'  (null = henüz sorulmadı)
    locale: "tr",
    theme: null, // null = sistem tercihi
    motion: null, // 'off' = animasyonlar kapalı
    dock: null, // 'off' = sade görünüm (masaüstünde menü kapalı); null = varsayılan (açık)

    /* --- ilerleme (reading_progress) --------------------------------------- */
    progress: {}, // { [issueSlug]: { pageId, index, updatedAt } }
    finished: {}, // { [issueSlug]: timestamp }  (issue_reads)
    seenIntro: false,

    /* --- mod tamamlama (streak.js doldurur) -------------------------------- */
    modeTime: {}, // { [issueSlug + ':' + depth]: okunan ms }
    modeDone: {}, // { [issueSlug + ':' + depth]: timestamp }
    keys: {}, // { [issueSlug]: timestamp }  üç modu da bitirenin anahtarı

    /* --- sosyal ------------------------------------------------------------ */
    comments: [], // kullanıcının yazdıkları (sahte veriye eklenir)
    reactions: {}, // { [commentId]: ['❤️','😂'] }
    loginOffer: {}, // { [issueSlug]: { shown: n, dismissed: bool } }

    /* --- bulmaca (puzzle_runs) --------------------------------------------- */
    puzzleRuns: {}, // { [issueSlug + ':' + puzzleId]: { state, completedAt, ... } }
    tagScores: {}, // { kelime: 4, mantık: -1, ... }
    coldStartAnswer: null,

    /* --- sayaçlar ---------------------------------------------------------- */
    stats: { pagesRead: 0, sessionStart: 0, msRead: 0 },
  };

  function deepMerge(base, patch) {
    var out = {};
    Object.keys(base).forEach(function (k) {
      out[k] = base[k];
    });
    Object.keys(patch || {}).forEach(function (k) {
      var v = patch[k];
      if (v && typeof v === "object" && !Array.isArray(v) && base[k] && typeof base[k] === "object" && !Array.isArray(base[k])) {
        out[k] = deepMerge(base[k], v);
      } else {
        out[k] = v;
      }
    });
    return out;
  }

  var data = deepMerge(DEFAULTS, U.store.get(KEY, {}));
  var saveSoon = U.debounce(function () {
    U.store.set(KEY, data);
  }, 250);

  var State = {
    /** Ham durum nesnesi. Doğrudan okumak serbest, yazmak için set() kullan. */
    data: data,

    get: function (path, fallback) {
      var parts = String(path).split(".");
      var cur = data;
      for (var i = 0; i < parts.length; i++) {
        if (cur === null || cur === undefined) return fallback;
        cur = cur[parts[i]];
      }
      return cur === undefined ? fallback : cur;
    },

    set: function (path, value) {
      var parts = String(path).split(".");
      var cur = data;
      for (var i = 0; i < parts.length - 1; i++) {
        if (typeof cur[parts[i]] !== "object" || cur[parts[i]] === null) cur[parts[i]] = {};
        cur = cur[parts[i]];
      }
      cur[parts[parts.length - 1]] = value;
      saveSoon();
      U.emit("state:change", { path: path, value: value });
      return value;
    },

    /** Birden çok alanı tek seferde günceller. */
    patch: function (obj) {
      Object.keys(obj).forEach(function (k) {
        State.set(k, obj[k]);
      });
    },

    save: function () {
      U.store.set(KEY, data);
    },

    reset: function () {
      U.store.clearAll();
      location.reload();
    },

    /* --- kısayollar --------------------------------------------------------- */

    depth: function () {
      return data.depth || "mid";
    },

    isVerified: function () {
      return !!(data.reader && data.reader.emailVerifiedAt);
    },

    /** Bir sayıdaki en son okunan sayfayı kaydeder. */
    saveProgress: function (issueSlug, pageId, index) {
      data.progress[issueSlug] = { pageId: pageId, index: index, updatedAt: Date.now() };
      saveSoon();
    },

    getProgress: function (issueSlug) {
      return data.progress[issueSlug] || null;
    },

    markFinished: function (issueSlug) {
      if (!data.finished[issueSlug]) {
        data.finished[issueSlug] = Date.now();
        saveSoon();
        U.emit("issue:finished", { issue: issueSlug });
      }
    },

    /* --- mod tamamlama -----------------------------------------------------
       Kural streak.js'te; burası yalnızca depo. Süre yazımı saniyede bir
       geliyor, o yüzden saveProgress gibi olay YAYMIYOR — yoksa her saniye
       tüm dinleyiciler tetiklenirdi. Tamamlanma ve anahtar seyrek, onlar yayar.
       ---------------------------------------------------------------------- */

    modeKey: function (issueSlug, depth) {
      return issueSlug + ":" + depth;
    },

    getModeTime: function (issueSlug, depth) {
      return data.modeTime[State.modeKey(issueSlug, depth)] || 0;
    },

    /** Okunan süreyi biriktirir ve yeni toplamı döndürür. */
    addModeTime: function (issueSlug, depth, ms) {
      var key = State.modeKey(issueSlug, depth);
      var total = (data.modeTime[key] || 0) + ms;
      data.modeTime[key] = total;
      saveSoon();
      return total;
    },

    isModeDone: function (issueSlug, depth) {
      return !!data.modeDone[State.modeKey(issueSlug, depth)];
    },

    markModeDone: function (issueSlug, depth) {
      var key = State.modeKey(issueSlug, depth);
      if (data.modeDone[key]) return false;
      data.modeDone[key] = Date.now();
      saveSoon();
      U.emit("mode:done", { issue: issueSlug, depth: depth });
      return true;
    },

    hasKey: function (issueSlug) {
      return !!data.keys[issueSlug];
    },

    grantKey: function (issueSlug) {
      if (data.keys[issueSlug]) return false;
      data.keys[issueSlug] = Date.now();
      saveSoon();
      U.emit("key:earned", { issue: issueSlug });
      return true;
    },

    /** Kazanılmış tüm anahtarlar — keşfet sayfası bunu okuyacak. */
    keyList: function () {
      return Object.keys(data.keys);
    },

    /* --- bulmaca etiket puanları (öneri algoritması) ------------------------ */

    bumpTags: function (tags, delta) {
      (tags || []).forEach(function (t) {
        data.tagScores[t] = (data.tagScores[t] || 0) + delta;
      });
      saveSoon();
    },

    tagScore: function (tags) {
      var sum = 0;
      (tags || []).forEach(function (t) {
        sum += data.tagScores[t] || 0;
      });
      return sum;
    },

    runKey: function (issueSlug, puzzleId) {
      return issueSlug + ":" + puzzleId;
    },

    getRun: function (issueSlug, puzzleId) {
      return data.puzzleRuns[State.runKey(issueSlug, puzzleId)] || null;
    },

    saveRun: function (issueSlug, puzzleId, patch) {
      var key = State.runKey(issueSlug, puzzleId);
      var cur = data.puzzleRuns[key] || {
        issueSlug: issueSlug,
        puzzleId: puzzleId,
        state: null,
        attempts: 0,
        hintsUsed: 0,
        durationMs: 0,
        completedAt: null,
        startedAt: Date.now(),
      };
      Object.keys(patch || {}).forEach(function (k) {
        cur[k] = patch[k];
      });
      data.puzzleRuns[key] = cur;
      saveSoon();
      return cur;
    },
  };

  /* Sekmeler arası eşitleme — prototipte "iki tarayıcıdan yorum" testi için */
  window.addEventListener("storage", function (e) {
    if (e.key === "mag:" + KEY && e.newValue) {
      try {
        var incoming = JSON.parse(e.newValue);
        Object.keys(incoming).forEach(function (k) {
          data[k] = incoming[k];
        });
        U.emit("state:external", {});
      } catch (err) {}
    }
  });

  MAG.state = State;
})(window.MAG);
