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

import { bulmacaBaslat } from './bulmaca.js';
import { galeriBaslat, galeriDugmeleriniAyarla } from './galeri.js';
import { icindekilerBaslat } from './icindekiler.js';
import { kantoHareketiniBaslat } from './kanto.js';
import { mangaBaslat, mangaDugmesiniAyarla } from './manga.js';
import { sunusuBaslat } from './sunus.js';
import { telifBaslat } from './telif.js';
import { wikiKapisiniBaslat } from './wiki.js';

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

/* ⚠️ `id` ile, konumla DEĞİL. Burada önce `.band__btn:first-child` /
   `:last-child` yazıyordu; banda üçüncü bir düğme (tam ekran) eklenince
   "sonraki sayfa" sessizce o düğmeye bağlandı. Konum bir kimlik değil. */
const geriDugmesi = document.getElementById('btn-geri');
const ileriDugmesi = document.getElementById('btn-ileri');

/**
 * Okura SUNULAN modlar — kimlik ve görünen ad.
 *
 * ⚠️ `mid` (Dengeli) buradan çıkarıldı, ama sayının içinden SİLİNMEDİ:
 * sayfalardaki `data-mod="mid full"` etiketleri ve `bilesen.css` §7'deki süzgeç
 * kuralı duruyor. Geri açmak buraya bir satır eklemek; hiçbir sayfa bu arada
 * sahipsiz kalmıyor, çünkü `mid`e ait her sayfa `full`de de var (yalnız `mid`
 * etiketli tek bir sayfa yok — sayıldı).
 *
 * Liste aynı zamanda "hangi tercih geçerli"nin tek kaynağı: `acilis.js`
 * kayıtlı modu buradan doğruluyor, yani "Dengeli"de kalmış bir okurun tercihi
 * geçersiz sayılıp seçim ekranı bir kez daha açılıyor. Artık sorulmayan bir
 * modda okumaya devam eden okur olmuyor.
 */
export const MODLAR = [
  { id: 'min', ad: 'Doomscroller' },
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

   ⚠️ `min` modu `full`ün alt kümesi DEĞİL — `k-min` sayfası yalnız `min`de
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
 * Okurun durduğu sayfa yeni modda gizlenmiş olabilir (`k-4` yalnız `full`de
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

  /* ⚠️ "Tam kanama" KOYU demek değil. Yukarıdaki satır folio'yu açık renge
     çeviriyor ama `k-son` GÜNDÜZ bir sahne (`data-scrim="light"`) ve alt kenarı
     neredeyse beyaz perde — açık folio orada görünmüyordu.

     Sayfanın kendi `data-scrim`i folio'ya yansıtılıyor, çünkü folio `#pages`in
     DIŞINDA duruyor (index.html'de `#canvas`ın doğrudan çocuğu) ve hiçbir CSS
     seçicisi oradan "şu an okunan sayfanın perdesi" bilgisine ulaşamıyor.
     Rengin kendisi canvas.css §folio'da. */
  folio.dataset.scrim = sayfa.dataset.scrim ?? '';

  const yuzde = ilerlemeYuzdesi();
  ilerlemeDolgusu.style.width = `${yuzde.toFixed(1)}%`;
  ilerlemeKutusu.setAttribute('aria-valuenow', String(Math.round(yuzde)));

  geriDugmesi.disabled = sira === 0;
  ileriDugmesi.disabled = sira === olcumler.length - 1;

  /* Tam ekran düğmesi yalnız manga sayfasında var — 3:4 tuvalde 9:16 duran
     tek sayfa o (bkz. js/manga.js). */
  mangaDugmesiniAyarla(sayfa);

  /* Sergi okları da yalnız kendi sayfasında: ▲▼ sayıyı gezdiriyor, ◀◀▶▶
     koridoru. İkisi aynı yuvayı paylaşıyor ve hiç çakışmıyorlar (biri manga,
     öbürü galeri sayfasında). */
  galeriDugmeleriniAyarla(sayfa);
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

/**
 * Bir sayfaya götüren TEK yol — içindekiler, ileri/geri, Home/End hepsi burada.
 *
 * ⚠️ ÖNBELLEKTEKİ `top`A KAYDIRMIYOR, hedefi yeniden ölçüyor. `olcumler`
 * bayat olabiliyor ve bayat bir `top` okuru hedefin BİR ÖNCESİNE düşürüyordu:
 * sayfalar `min-height: 100%` ile en az bir kadraj, ama `fit="scroll"` olan
 * 15 sayfanın boyu içeriğe bağlı. Söyleşi sayfalarının çizimleri ızgara
 * gözünde, yani AKIŞTA, ve `width`/`height` taşımıyorlar — yüklenmeden önce
 * yükseklikleri sıfır. Ölçüm sırası bunu kaçınılmaz yapıyordu:
 *
 *     acilis.js §AKIŞ, sırayla:
 *       baslat() → olc()          görseller HENÜZ inmemiş
 *       await yuklemeEkrani()     görselleri BURADA bekliyor
 *
 * Yani ilk ölçüm, yükleme ekranının beklediği şeyin öncesinde alınıyordu.
 * Kaydırma olduğunda tazeleniyordu (§419) ama HİÇ kaydırmamış okur —
 * sayı açıldı, içindekiler açıldı, tıklandı — o tazelemeye hiç uğramıyordu.
 *
 * Hedef sıra numarası DEĞİL eleman olarak sabitleniyor: `olc()` görünür sayfa
 * kümesini yeniden kuruyor ve arada mod değiştiyse aynı numara başka sayfaya
 * denk gelirdi.
 */
function sayfayaGit(sira) {
  const hedef = olcumler[sira]?.el;
  if (!hedef) return;

  olc();
  const taze = olcumler.find((o) => o.el === hedef);
  kaydir(taze ? taze.top : hedef.offsetTop);
}

/**
 * Tek kaydırma noktası.
 *
 * ⚠️ `behavior: 'smooth'` AÇIKÇA yazılıyor, `'auto'` bırakılmıyor. `'auto'`
 * "anında" demek değil, "elementin CSS'teki `scroll-behavior`ına uy" demek —
 * ve `.pages` orada zaten `smooth`. Değeri burada yazmak, hareketi azaltma
 * tercihi olan okur için de doğru davranmayı mümkün kılıyor.
 */
/* Programatik kaydırma sürerken snap'i tutan zamanlayıcı. Modül düzeyinde:
   sıçrama bitmeden ikinci bir sıçrama gelirse ilkinin geri açma işi
   iptal edilmeli, yoksa snap yolun ortasında geri gelir. */
let snapSaati = 0;

/** Snap'i geri açar. İki yoldan da çağrılabilir olmalı: `scrollend` ya da süre. */
function snapiGeriAc() {
  clearTimeout(snapSaati);
  snapSaati = 0;
  kap.removeEventListener('scrollend', snapiGeriAc);
  kap.style.removeProperty('scroll-snap-type');
}

function kaydir(top) {
  const azHareket =
    document.documentElement.dataset.motion === 'off' ||
    matchMedia('(prefers-reduced-motion: reduce)').matches;

  hedefTop = top;
  hedefBitis = Date.now() + (azHareket ? 50 : 500);

  if (azHareket) {
    /* Anlık kaydırmada snap'in kavga edeceği bir animasyon yok. */
    snapiGeriAc();
    kap.scrollTo({ top, behavior: 'instant' });
    guncelle();
    return;
  }

  /* ⚠️ SNAP SIÇRAMA BOYUNCA KAPALI, varışta geri açılıyor.
     `.page` `scroll-snap-stop: always` taşıyor (canvas.css §123) ve bu
     "kap bir snap noktasının ÜZERİNDEN GEÇEMEZ, karşılaştığı ilk noktaya
     oturur" demek. Kullanıcı gesture'ı için doğru davranış — sayfa sayfa
     gezilsin diye zaten öyle konmuş — ama içindekilerden yapılan sıçrama
     22.000px ve onlarca snap noktası aşıyor. Snap açıkken kaydırma yolda
     bir yerde kesiliyordu.

     NEDEN RASTGELE GÖRÜNÜYORDU: `fit="scroll"` olan 15 sayfa `normal`
     taşıyor (§143), gerisi `always`. Sıçrama karışık bir diziden geçtiği
     için nerede takıldığı NEREDEN başladığına bağlıydı; en uzun sıçramalar
     da sayının başındayken oluyor, yani ilk yüklemede.

     `scrollend` her yerde yok (Safari 18.2 öncesi); süre yedeği şart.
     1800ms, Chrome'un uzun smooth kaydırma süresinin (~800ms) iki katından
     fazla — erken açılırsa snap yolun ortasında geri döner. */
  clearTimeout(snapSaati);
  kap.removeEventListener('scrollend', snapiGeriAc);
  kap.style.scrollSnapType = 'none';
  kap.addEventListener('scrollend', snapiGeriAc, { once: true });
  snapSaati = setTimeout(snapiGeriAc, 1800);

  kap.scrollTo({ top, behavior: 'smooth' });
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

  /* ⚠️ Boşluk tuşu odaktaki bir DÜĞMENİN üzerindeyken sayfayı değil o düğmeyi
     çalıştırmalı. Aşağıdaki `preventDefault` düğmenin kendi etkinleşmesini de
     iptal ediyordu: bulmacadaki şıklar klavyeyle seçilemiyor, boşluk onların
     yerine sayfayı atlıyordu. Aynı kaza banttaki içindekiler düğmesinde de
     vardı — odaktayken boşluk listeyi açmıyordu.

     Koşul TUŞA bakıyor, hedefe değil: oklar bir düğmenin üzerindeyken de
     sayfayı gezdirmeye devam etmeli, yoksa fareyle "ileri"ye basan okur
     ok tuşlarını kaybederdi. */
  if (olay.key === ' ' && hedef.closest?.('button, [role="button"], a[href]')) return;

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
  mangaBaslat(kap);
  telifBaslat();
  wikiKapisiniBaslat();
  kantoHareketiniBaslat();
  galeriBaslat();
  bulmacaBaslat();

  /* ⚠️ TEK BEKLEMEYEN BAŞLATICI BU. `sunusuBaslat` içeride
     `document.fonts.ready`i bekliyor (uzaklıklar yedek yüzün kutularıyla
     ölçülmesin diye), yani bir söz döndürüyor. Beklenmiyor çünkü `baslat()`
     senkron olmak zorunda: `acilis.js` bunun hemen ardından yükleme ekranını
     açıyor ve sayfanın gezinmesi o söze bağlı değil.

     Hikâye kendi gözcüsüyle ekrandan çıkınca duruyor, yani yükleme ekranının
     arkasında yanıp bitmiyor (bkz. `js/hikaye.js` §EKRANDAN ÇIKTI). */
  sunusuBaslat(kap).catch((hata) => console.error('Sunuş başlatılamadı:', hata));

  /* İçindekiler okuyucuyu içe aktarmıyor, ihtiyacı olan üç şeyi buradan
     alıyor — karşılıklı import iki modülü de kırılgan yapardı.

     ⚠️ Sayfa listesi `gorunurSayfalar()` ile DEĞİL, `olcumler` üzerinden
     veriliyor. Listedeki satır bir SIRA NUMARASI taşıyor ve o numara birazdan
     `sayfayaGit`e gidiyor; `sayfayaGit` de `olcumler`e bakıyor. İki ayrı
     kaynaktan sayılsaydı ölçümün bayat olduğu bir anda (görsel indi, mod
     değişti) satır komşu bölüme atlardı. */
  icindekilerBaslat({
    /* Liste kurulmadan ÖNCE yeniden ölçülüyor. Ölçüm normalde kaydırmada
       tazeleniyor ama açılış akışından yeni çıkmış, henüz hiç kaydırmamış bir
       okurda bayat olabiliyor: yükleme ekranı kalkarken sayfaların bir kısmı
       daha yüksekliksizdi ve `olcumler` kısa kalmıştı (folio da o anda
       "01 / 05" diyordu). O hâlde liste sayının yarısını yutardı. */
    sayfalariVer: () => {
      olc();
      return olcumler.map((o) => o.el);
    },
    okunanSirayiVer: okunanSira,
    git: sayfayaGit
  });

  window.addEventListener('resize', yenidenOlc);
  window.visualViewport?.addEventListener('resize', yenidenOlc);
}

/**
 * Ölçümü tazeler. `resize`in kendi işi ama DIŞARIYA da açık, çünkü düzenin
 * oturduğu ikinci bir an var: yükleme ekranı kapanırken (`acilis.js` §470).
 *
 * O ekran `document.fonts.ready`i ve bütün görselleri bekliyor — yani
 * beklediği her şey, `baslat()`in ilk ölçümünü geçersiz kılan şeyin ta
 * kendisi. Buradan bir kez daha ölçülmezse `olcumler` ilk kaydırmaya kadar
 * bayat kalıyor ve o aralıkta yapılan her gezinme hedefi ıskalıyor.
 *
 * `sonYukseklik` de tazeleniyor: `kaydirmaOldu` (§419) yüksekliği bununla
 * karşılaştırıp yeniden ölçüp ölçmeyeceğine karar veriyor, bayat kalırsa ilk
 * kaydırmada gereksiz bir ölçüm daha yapardı.
 */
export function yenidenOlc() {
  letterboxOlc();
  olc();
  sonYukseklik = kap.scrollHeight;
  guncelle();
}
