/* ============================================================================
   IDENTITY — sessiz anonim kimlik ve e-posta + kod ile kalıcılaştırma
   ----------------------------------------------------------------------------
   Gerçek üründe:
     ilk ziyaret   → supabase.auth.signInAnonymously()
     kalıcılaştır  → auth.updateUser({ email })  +  verifyOtp({type:'email_change'})
   Kritik nokta: bu akış kullanıcı kimliğini (reader.id) DEĞİŞTİRMEZ. Prototip
   de aynı şekilde davranır — id sabit kalır, sadece email alanı dolar.
   ========================================================================= */

(function (MAG) {
  "use strict";

  var U = MAG.util;
  var State = MAG.state;

  var ADJ = ["Mor", "Kızıl", "Sessiz", "Gri", "Yeşil", "Mavi", "Sarı", "Beyaz", "Turuncu", "Derin", "Uzak", "Yavaş"];
  var NOUN = ["Balina", "Tilki", "Vinç", "Baykuş", "Ceylan", "Şahin", "Turna", "Kirpi", "Vaşak", "Kunduz", "Martı", "Geyik"];
  var EMOJI = ["🐳", "🦊", "🦩", "🦉", "🌿", "🕊️", "🐦", "🦔", "🍁", "🌙", "🫧", "🪷", "🐌", "🦌"];
  var COLORS = ["#8f7ac2", "#c2764a", "#7a9ec2", "#6f7d86", "#5f8f6b", "#4a7fc2", "#c2a44a", "#b5566a", "#4aa2a2", "#8a6fc2"];

  var I = {};

  /* ------------------------------------------------------------------------
     ANONİM KİMLİK
     --------------------------------------------------------------------- */

  I.ensure = function () {
    var reader = State.get("reader");
    if (reader && reader.id) return reader;

    var seed = Date.now() % 100000;
    var rand = U.rng(seed);
    reader = {
      id: U.uid("reader"),
      displayName:
        U.pick(ADJ, rand) + " " + U.pick(NOUN, rand) + " " + U.pad2(Math.floor(rand() * 99) + 1),
      emoji: U.pick(EMOJI, rand),
      color: U.pick(COLORS, rand),
      email: null,
      emailVerifiedAt: null,
      isAnonymous: true,
      createdAt: Date.now(),
    };
    State.set("reader", reader);
    return reader;
  };

  I.me = function () {
    return State.get("reader") || I.ensure();
  };

  I.update = function (patch) {
    var r = I.me();
    Object.keys(patch).forEach(function (k) {
      r[k] = patch[k];
    });
    State.set("reader", r);
    U.emit("identity:change", { reader: r });
    return r;
  };

  I.reroll = function () {
    var rand = U.rng(Date.now() % 999983);
    return I.update({
      displayName: U.pick(ADJ, rand) + " " + U.pick(NOUN, rand) + " " + U.pad2(Math.floor(rand() * 99) + 1),
    });
  };

  I.palette = function () {
    return { emoji: EMOJI, colors: COLORS };
  };

  /* ------------------------------------------------------------------------
     E-POSTA + 6 HANELİ KOD  (sahte OTP)
     --------------------------------------------------------------------- */

  var pending = null; // { email, code, sentAt }

  I.requestCode = function (email) {
    var code = String(Math.floor(100000 + Math.random() * 900000));
    pending = { email: email, code: code, sentAt: Date.now() };
    /* Prototipte "mail" konsola düşer ve arayüzde ipucu olarak gösterilir. */
    console.info("%c[sahte e-posta] " + email + " → giriş kodun: " + code, "color:#b8432c;font-weight:700");
    return { ok: true, hint: code };
  };

  I.pendingEmail = function () {
    return pending ? pending.email : null;
  };

  I.verifyCode = function (code) {
    if (!pending) return { ok: false, error: "Önce e-posta adresini gir." };
    if (Date.now() - pending.sentAt > 10 * 60 * 1000) {
      return { ok: false, error: "Kodun süresi doldu. Yeni kod iste." };
    }
    if (String(code).trim() !== pending.code) {
      return { ok: false, error: "Kod eşleşmedi. Tekrar dene." };
    }

    /* ---- KRİTİK: aynı reader.id korunur ---------------------------------- */
    var before = I.me().id;
    var reader = I.update({
      email: pending.email,
      emailVerifiedAt: Date.now(),
      isAnonymous: false,
    });
    pending = null;

    /* Bekleyen yorumlar bilinçli olarak kuyrukta kalır (plan kararı);
       bundan sonrakiler anında yayımlanır. */
    var stillPending = (State.get("comments", []) || []).filter(function (c) {
      return c.status === "pending";
    }).length;

    U.emit("identity:upgraded", { reader: reader, keptId: before === reader.id, stillPending: stillPending });
    return { ok: true, reader: reader, stillPending: stillPending };
  };

  I.signOut = function () {
    I.update({ email: null, emailVerifiedAt: null, isAnonymous: true });
  };

  /* ------------------------------------------------------------------------
     GİRİŞ TEKLİFİ SAYACI — sayı başına en fazla 2, kapatılırsa bir daha yok
     --------------------------------------------------------------------- */

  I.canOffer = function (issueSlug) {
    if (State.isVerified()) return false;
    var o = State.get("loginOffer." + issueSlug, null) || { shown: 0, dismissed: false };
    return !o.dismissed && o.shown < 2;
  };

  I.noteOffer = function (issueSlug, dismissed) {
    var o = State.get("loginOffer." + issueSlug, null) || { shown: 0, dismissed: false };
    o.shown += 1;
    if (dismissed) o.dismissed = true;
    State.set("loginOffer." + issueSlug, o);
  };

  MAG.identity = I;
})(window.MAG);
