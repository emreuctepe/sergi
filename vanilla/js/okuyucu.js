/* ============================================================================
   OKUYUCU — sayıyı dizer ve okunur hâlde tutar
   ----------------------------------------------------------------------------
   Bu dosyanın yaptığı her şey TARAYICI işi: sayfa parçalarını okuyup sıraya
   dizmek, hangi sayfada olunduğunu saymak, ileri/geri gitmek. Sunucu tarafı,
   veritabanı, oturum yok.

   Kasıtlı olarak uzun yoldan yazıldı: her iş kendi adı olan kısa bir fonksiyon,
   akıllı kısayol yok. Altı ay sonra buraya bakan biri (muhtemelen biz)
   ne olduğunu okuyup anlayabilsin.

   Dosyanın kaba sırası:
     1 · Öğeler ve sabitler
     2 · Sayfaları dizme          (sira → fetch → DOM)
     3 · Okuma modu               (display:none ile süzme)
     4 * Ölçüm                     (hangi sayfa nerede)
     5 · Folio ve ilerleme
     6 · Gezinme                  (düğmeler, ok tuşları)
     7 · Giriş animasyonları
     8 · Letterbox
     9 · Başlatma
   ========================================================================= */

/* ==========================================================================
   1 · ÖĞELER VE SABİTLER
   ======================================================================= */

const kap = document.getElementById('pages');
const tuval = document.getElementById('canvas');
const kabuk = document.getElementById('shell');
const folio = document.getElementById('folio');
const folioBolum = document.getElementById('folio-section');
const folioSayfa = document.getElementById('folio-page');
const ilerlemeKutusu = document.querySelector('.progress');
const ilerlemeDolgusu = document.querySelector('.progress__fill');
const cip = document.querySelector('.depth-chip');
const cipEtiketi = document.querySelector('.depth-chip__label');
const geriDugmesi = document.querySelector('.band--bottom .band__btn:first-child');
const ileriDugmesi = document.querySelector('.band--bottom .band__btn:last-child');

/** Modların kimliği ve okura görünen adı. Sıra çipin döngü sırası. */
export const MODLAR = [
  { id: 'min', ad: 'Doomscroller' },
  { id: 'mid', ad: 'Dengeli' },
  { id: 'full', ad: 'Doomreader' }
];

/* Ölçüm noktası ekranın tepesi değil %40'ı: snap sırasında sonraki sayfa
   tepeden girer girmez folio'nun değişmesi erken olur, okur hâlâ öncekini
   okuyordur. */
const OKUMA_NOKTASI = 0.4;

/* Bir ekranın ne kadarı atlanır — kalan pay bir satırlık örtüşme bırakıyor,
   okuma kopmuyor. */
const ADIM = 0.86;

/* Sayfa sonuna bu kadar kalmışsa "bitti" sayılır. Kesirli piksel payı. */
const KENAR = 24;

/* Kaydırma durduktan sonra bantların geri açılma gecikmesi. */
const BANT_GECIKMESI = 900;

/* ==========================================================================
   2 · SAYFALARI DİZME
   --------------------------------------------------------------------------
   Sıra `index.html`deki `#sira` bloğunda ve TEK kaynak orası. Burada yalnız
   okunuyor.
   ======================================================================= */

/** `#sira` içindeki satırlar → yol dizisi. Boşlar ve # yorumları atlanıyor. */
export function siraOku() {
  const ham = document.getElementById('sira').textContent;
  return ham
    .split('\n')
    .map((satir) => satir.split('#')[0].trim())
    .filter((satir) => satir.length > 0);
}

/**
 * Sayfaları sırayla indirip `#pages` içine ekler.
 *
 * İstekler PARALEL başlatılıp SIRAYLA ekleniyor: sırayla indirmek 31 gidiş
 * dönüş demek olurdu, sırayla eklemek ise şart — dizilim sırası sayının
 * kendisi.
 */
export async function sayfalariDiz() {
  const yollar = siraOku();
  const belgeler = await Promise.all(
    yollar.map(async (yol) => {
      const cevap = await fetch(`${yol}/sayfa.html`);
      if (!cevap.ok) throw new Error(`Sayfa okunamadı: ${yol} (${cevap.status})`);
      return cevap.text();
    })
  );

  /* Tek bir `<template>`de birleştirip bir kere DOM'a koyuyoruz: 31 ayrı
     ekleme, 31 ayrı düzen hesabı demek olurdu. */
  const sablon = document.createElement('template');
  sablon.innerHTML = belgeler.join('\n');
  kap.append(sablon.content);

  etiketle();
}

/**
 * `data-index` ve `aria-label`ı YAZAR.
 *
 * İkisi de dosyalarda yazılı DEĞİL ve bu bilinçli: derlenmiş çıktıda
 * "sayfa 6 / 30" diye sabitlenmişlerdi, oysa klonda hem sıra hem mod
 * değişebiliyor. Dosyada dursalardı ilk yeniden sıralamada yalan söylerlerdi.
 */
function etiketle() {
  const gorunur = gorunurSayfalar();
  gorunur.forEach((sayfa, i) => {
    sayfa.dataset.index = String(i);
    const bolum = sayfa.dataset.sectionTitle;
    sayfa.setAttribute('aria-label', `${bolum} — sayfa ${i + 1} / ${gorunur.length}`);
  });
}

/* ==========================================================================
   3 · OKUMA MODU
   --------------------------------------------------------------------------
   Sayfalar DOM'dan çıkmıyor, yalnızca gizleniyor: süzme kuralları
   `css/bilesen.css` §7'de, `:root[data-depth]` + her sayfanın `data-mod`u.

   ⚠️ `min` modu `full`ün alt kümesi DEĞİL — `km-min` sayfası yalnız `min`de
   var. Bu yüzden "hepsini bas, fazlasını gizle" gibi bir kısayol yok.
   ======================================================================= */

/** Şu an ekranda olan sayfalar, belge sırasıyla. */
function gorunurSayfalar() {
  return [...kap.querySelectorAll('.page')].filter((sayfa) => sayfa.offsetHeight > 0);
}

/** Sayının TAMAMI — gizliler dahil. Mod değişiminde ankraj burada aranıyor. */
function tumSayfalar() {
  return [...kap.querySelectorAll('.page')];
}

/**
 * Modu değiştirir ve okuru bıraktığı yerde tutmaya çalışır.
 *
 * Okurun durduğu sayfa yeni modda gizlenmiş olabilir (`km-4` yalnız `full`de
 * var). O zaman EN YAKIN görünür sayfaya gidiliyor, sayı başa sarmıyor: mod
 * değiştirmenin bedeli "baştan başlamak" olmamalı.
 */
export function modAyarla(mod) {
  const ankraj = okunanSayfa();
  document.documentElement.dataset.depth = mod;

  const kayit = MODLAR.find((m) => m.id === mod);
  if (cipEtiketi) cipEtiketi.textContent = kayit.ad;
  if (cip) cip.setAttribute('aria-label', `Okuma modu: ${kayit.ad} — değiştir`);

  etiketle();
  olc();

  const hedef = ankraj && enYakinGorunur(ankraj);
  if (hedef) {
    /* Kaydırma BİR KARE SONRA: bu satırda sayfalar daha yeni gizlendi ve
       tarayıcı ne düzeni ne kaydırma sınırını hesapladı. Şimdi verilen
       `scrollTo` kısalan belgeye sıkıştırılıp yutuluyor. */
    requestAnimationFrame(() => {
      olc();
      kap.scrollTo({ top: hedef.offsetTop, behavior: 'instant' });
      guncelle();
    });
  } else {
    guncelle();
  }
}

/**
 * `sayfa` gizliyse ona en yakın görünür sayfa. Arama iki yönlü ama GERİYE
 * öncelikli: eşit uzaklıkta geride kalan kazanıyor, çünkü ileri atlamak
 * okunmamış içeriğin üstünden geçmek demek. Geri düşmek en fazla okunmuş bir
 * sayfayı tekrar gösterir.
 */
function enYakinGorunur(sayfa) {
  const hepsi = tumSayfalar();
  const yer = hepsi.indexOf(sayfa);
  if (yer < 0) return null;
  if (hepsi[yer].offsetHeight > 0) return hepsi[yer];

  for (let uzaklik = 1; uzaklik < hepsi.length; uzaklik++) {
    const geride = hepsi[yer - uzaklik];
    if (geride && geride.offsetHeight > 0) return geride;
    const ileride = hepsi[yer + uzaklik];
    if (ileride && ileride.offsetHeight > 0) return ileride;
  }
  return null;
}

/* ==========================================================================
   4 · ÖLÇÜM
   --------------------------------------------------------------------------
   Hangi sayfa nerede? Ölçüm DOM'dan bir kez alınıp saklanıyor; her kaydırma
   karesinde 31 öğenin `offsetTop`unu sormak tarayıcıyı her seferinde düzen
   hesabına zorlardı.
   ======================================================================= */

/** [{ el, top, height, fit }] — yalnız görünür sayfalar. */
let olcumler = [];

function olc() {
  olcumler = gorunurSayfalar().map((el) => ({
    el,
    top: el.offsetTop,
    height: el.offsetHeight,
    fit: el.dataset.fit === 'scroll' ? 'scroll' : 'contain'
  }));
}

/** Okunan sayfanın ölçüm dizisindeki sırası. */
function okunanSira() {
  const nokta = referansTop() + kap.clientHeight * OKUMA_NOKTASI;
  let sira = 0;
  for (let i = 0; i < olcumler.length; i++) {
    if (olcumler[i].top <= nokta) sira = i;
    else break;
  }
  return sira;
}

/** Okunan sayfanın DOM öğesi. */
function okunanSayfa() {
  return olcumler[okunanSira()]?.el ?? null;
}

/* --- Yumuşak kaydırma penceresi -------------------------------------------
   `scrollTo` hemen bitmiyor. İkinci tuş basışı yol yarıdayken gelirse
   `scrollTop` hâlâ eski sayfayı gösterir ve basış aynı sayfayı yeniden
   hedefler — yani hızlı basılan tuşların çoğu yutulur. Hedef yazıldığı anda
   "okunan sayfa" oradan sayılıyor, kaydırma otursun diye beklenmiyor. */
let hedefTop = null;
let hedefBitis = 0;

function referansTop() {
  return Date.now() < hedefBitis ? hedefTop : kap.scrollTop;
}

/* ==========================================================================
   5 · FOLIO VE İLERLEME
   ======================================================================= */

function guncelle() {
  if (olcumler.length === 0) return;

  const sira = okunanSira();
  const sayfa = olcumler[sira].el;

  folioBolum.textContent = sayfa.dataset.sectionTitle;
  folioSayfa.textContent = `${String(sira + 1).padStart(2, '0')} / ${String(olcumler.length).padStart(2, '0')}`;

  /* Kapak ve sayı sonu folio taşımıyor: ikisi de kendi başına bir kompozisyon,
     köşesine sayfa numarası koymak onları bozar. */
  const tur = sayfa.dataset.kind;
  folio.dataset.hidden = String(tur === 'cover' || tur === 'outro');

  /* Tam kanayan sayfada folio görselin üstünde duruyor; kâğıt perdesi kalkıp
     yazı açık renge dönüyor. Manga dışarıda: onun kendi sayfa numarası var. */
  folio.dataset.overlay = String(sayfa.dataset.bleed === 'full' && tur !== 'manga');

  const yuzde = ilerlemeYuzdesi();
  ilerlemeDolgusu.style.width = `${yuzde.toFixed(1)}%`;
  ilerlemeKutusu.setAttribute('aria-valuenow', String(Math.round(yuzde)));

  geriDugmesi.disabled = sira === 0;
  ileriDugmesi.disabled = sira === olcumler.length - 1;
}

function ilerlemeYuzdesi() {
  const enFazla = kap.scrollHeight - kap.clientHeight;
  if (enFazla <= 0) return 0;
  return Math.min(100, Math.max(0, (kap.scrollTop / enFazla) * 100));
}

/* ==========================================================================
   6 · GEZİNME
   --------------------------------------------------------------------------
   "Sonraki" her zaman "sonraki sayfa" demek değil: `fit="scroll"` bir sayfa
   tuvalden birkaç kat uzun olabilir ve okur oradayken bir tuş basışının
   yazının yarısını atlaması kayıp olur. Önce sayfanın içinde ilerleniyor,
   sayfa bitince sıradakine geçiliyor.
   ======================================================================= */

export function ileri() {
  const sira = okunanSira();
  const sayfa = olcumler[sira];
  if (sayfa && sayfa.fit === 'scroll') {
    const dip = sayfa.top + sayfa.height;
    const gorulen = kap.scrollTop + kap.clientHeight;
    if (dip - gorulen > KENAR) {
      const hedef = Math.min(kap.scrollTop + kap.clientHeight * ADIM, dip - kap.clientHeight);
      kaydir(hedef);
      return;
    }
  }
  sayfayaGit(Math.min(sira + 1, olcumler.length - 1));
}

export function geri() {
  const sira = okunanSira();
  const sayfa = olcumler[sira];
  if (sayfa && sayfa.fit === 'scroll' && kap.scrollTop - sayfa.top > KENAR) {
    kaydir(Math.max(kap.scrollTop - kap.clientHeight * ADIM, sayfa.top));
    return;
  }
  sayfayaGit(Math.max(sira - 1, 0));
}

function sayfayaGit(sira) {
  if (!olcumler[sira]) return;
  kaydir(olcumler[sira].top);
}

/**
 * Tek kaydırma noktası.
 *
 * ⚠️ `behavior: 'smooth'` AÇIKÇA yazılıyor, `'auto'` bırakılmıyor. `'auto'`
 * "anında" demek değil, "elementin CSS'teki `scroll-behavior`ına uy" demek —
 * ve `.pages` orada zaten `smooth`. Değeri burada yazmak, hareketi azaltma
 * tercihi olan okur için de doğru davranmayı mümkün kılıyor.
 */
function kaydir(top) {
  const azHareket =
    document.documentElement.dataset.motion === 'off' ||
    matchMedia('(prefers-reduced-motion: reduce)').matches;

  hedefTop = top;
  hedefBitis = Date.now() + (azHareket ? 50 : 500);

  kap.scrollTo({ top, behavior: azHareket ? 'instant' : 'smooth' });
  guncelle();
}

/* ==========================================================================
   7 · GİRİŞ ANİMASYONLARI
   --------------------------------------------------------------------------
   Sayfalar `data-inview="true"` DOĞUYOR, "false" değil. Giriş animasyonları
   `opacity: 0` ile başlıyor; "false" ile doğan bir sayfa, kendisini açacak JS
   herhangi bir sebeple çalışmazsa SONSUZA KADAR görünmez kalırdı. Sıra tersine
   çevrilmiş: sayfalar görünür doğuyor, aşağıdaki geçiş yalnız ekranın
   altındakileri gizleyip gözlemciye veriyor.
   ======================================================================= */

function gorunurlukIzle() {
  if (!('IntersectionObserver' in window)) return;

  const kat = kap.scrollTop + kap.clientHeight;
  const gozlemci = new IntersectionObserver(
    (girisler) => {
      for (const giris of girisler) {
        if (giris.isIntersecting) giris.target.dataset.inview = 'true';
      }
    },
    { root: kap, threshold: 0.02 }
  );

  for (const sayfa of tumSayfalar()) {
    if (sayfa.offsetTop >= kat) sayfa.dataset.inview = 'false';
    gozlemci.observe(sayfa);
  }
}

/* ==========================================================================
   8 · LETTERBOX
   --------------------------------------------------------------------------
   Bantlar tuvalin üstünde/altında kalan boşluğa sığıyor mu?
     roomy → boşlukta yaşarlar, tuval temiz kalır
     tight → tuvalin üstüne binerler, arkalarına bulanık perde gerekir

   2 piksellik pay bilinçli: `getBoundingClientRect` kesirli piksel döndürüyor
   ve tam sınırdaki bir pencere, kullanıcı hiçbir şey yapmadan iki mod arasında
   titriyordu.
   ======================================================================= */

function letterboxOlc() {
  const kutu = tuval.getBoundingClientRect();
  const kok = document.documentElement;
  const bantYuksekligi = parseFloat(getComputedStyle(kok).getPropertyValue('--ui-band-h')) || 52;
  const bosluk = Math.max(0, (window.innerHeight - kutu.height) / 2);

  kabuk.dataset.letterbox = bosluk >= bantYuksekligi - 2 ? 'roomy' : 'tight';
  kok.style.setProperty('--letterbox-free', `${bosluk.toFixed(1)}px`);
}

/* ==========================================================================
   9 · BAŞLATMA
   ======================================================================= */

let kare = 0;
let bantSayaci;
let sonYukseklik = 0;

function kaydirmaOldu() {
  /* Kareye bir kez: kaydırma olayı saniyede onlarca kez geliyor ve her biri
     düzen hesabı isteseydi kaydırma takılırdı. */
  if (kare) return;
  kare = requestAnimationFrame(() => {
    kare = 0;

    /* Sayfa boyu değiştiyse (görsel indi, mod değişti) yeniden ölç. */
    if (kap.scrollHeight !== sonYukseklik) {
      sonYukseklik = kap.scrollHeight;
      olc();
    }

    guncelle();

    /* Okurken bantlar soluyor, durunca geri geliyor. */
    kabuk.dataset.chrome = 'dim';
    clearTimeout(bantSayaci);
    bantSayaci = setTimeout(() => (kabuk.dataset.chrome = 'on'), BANT_GECIKMESI);
  });
}

function tuslar(olay) {
  if (kabuk.hasAttribute('inert')) return;
  if (olay.defaultPrevented || olay.metaKey || olay.ctrlKey || olay.altKey) return;

  /* Bir alana yazı yazılıyorsa oklar okurun değil metnin. */
  const hedef = olay.target;
  if (hedef.closest?.('input, textarea, select') || hedef.isContentEditable) return;

  switch (olay.key) {
    case 'ArrowDown':
    case 'PageDown':
    case ' ':
      olay.preventDefault();
      ileri();
      break;
    case 'ArrowUp':
    case 'PageUp':
      olay.preventDefault();
      geri();
      break;
    case 'Home':
      olay.preventDefault();
      sayfayaGit(0);
      break;
    case 'End':
      olay.preventDefault();
      sayfayaGit(olcumler.length - 1);
      break;
  }
}

/** Sayfalar dizildikten SONRA çağrılıyor: ölçüm için DOM'un dolu olması şart. */
export function baslat({ modDegistir }) {
  olc();
  sonYukseklik = kap.scrollHeight;
  letterboxOlc();
  guncelle();
  gorunurlukIzle();

  kap.addEventListener('scroll', kaydirmaOldu, { passive: true });
  document.addEventListener('keydown', tuslar);
  ileriDugmesi.addEventListener('click', ileri);
  geriDugmesi.addEventListener('click', geri);
  cip.addEventListener('click', modDegistir);

  const yenidenOlc = () => {
    letterboxOlc();
    olc();
    guncelle();
  };
  window.addEventListener('resize', yenidenOlc);
  window.visualViewport?.addEventListener('resize', yenidenOlc);
}
