/* ============================================================================
   MANGA — tam ekran okuma katmanı
   ----------------------------------------------------------------------------
   NEDEN VAR: `mn-1` sayının içindeki tek 9:16 nesne. 3:4 tuvale ortalanınca
   374px'e düşüyor, en küçük karesi 105px oluyor ve balon yazısı 7.6px'te
   kalıyor. Kaynak çizimler 1080×1920 — yani sayfa, çizimi 1/7 ölçekte
   gösteriyor. Tarayıcı zoom'u da çare değil: %135'ten sonra tuvalin genişliği
   `100svh*3/4` terimine takılıp fiziksel 750 pikselde düzleşiyor.

   NASIL: sayfa, tuvalin BÜYÜTÜLMÜŞ bir kopyasının içine taşınıyor. Ölçek bir
   `transform` değil, gerçek bir düzen ölçeği (bkz. overlays.css "TAM EKRAN
   MANGA"): dönüşüm kullansaydık `srcset` düzen boyutuna baktığı için tarayıcı
   600w görselde kalır ve büyüdükçe çizim bulanıklaşırdı.

   NE DEĞİL: kare kare okuma. Panelleri tek tek gezdiren bir mod, `plan`
   ızgarasının (blocks.css §plan, 24 sütun, elle kurgulanmış) taşıdığı sayfa
   kompozisyonunu parçalardı. Geleneksel manga sayfası bir bütün olarak
   okunur; burada da öyle kalıyor, yalnızca büyüyor ve gezilebiliyor.

   Dosyanın sırası:
     1 · Öğeler ve sabitler
     2 · Kurulum          (dialog içeriği bir kez)
     3 · Ölçek            (sığdırma, yakınlaştırma, çapa)
     4 · Görsel kaynakları (srcset'in doğru boyu seçmesi)
     5 · Gezinme          (sürükleme, tekerlek, tuşlar)
     6 · Açma ve kapama
     7 · Dışarıya açılan uç
     8 · Shorts kapısı    (filigran → kart, YouTube'a doğrudan değil)
   ========================================================================= */

/* ==========================================================================
   1 · ÖĞELER VE SABİTLER
   ======================================================================= */

const pencere = document.getElementById('manga-zoom');
const dugme = document.getElementById('btn-buyut');
const kabuk = document.getElementById('shell');

/* Ölçek "sığdırmanın kaç katı" olarak sayılıyor, piksel olarak değil: pencere
   boyu değişince sığdırma yeniden hesaplanıyor ama okurun seçtiği yakınlık
   korunuyor. */
const EN_AZ = 0.6;
const EN_COK = 8;

/* Bir tuş basışının / tekerlek çentiğinin adımı. */
const ADIM = 1.25;

/* Çift tıklamanın gittiği yakınlık. Balonları rahat okutan yer burası:
   sığdırmada ~11px olan yazı burada ~26px'e çıkıyor. */
const RAHAT = 2.4;

/* ⚠️ PENCERE SIĞDIRMADA AÇILMIYOR, 1.5 KATINDA — ve bu sayı ölçülerek seçildi.
   Sığdırma, tam ekranın SEBEBİNİ karşılamıyordu: 1920×1000'de sayfa 531px'e
   çıkıyor ve balon yazısı 10.7px'te kalıyor, yani akıştaki 7.6px'ten yalnız üç
   punto ileride. 1280×720'lik bir pencerede ise sığdırma sayfayı 374px'te
   bırakıyor ve yazı 7.6px — akıştakinin BİREBİR AYNISI. O ekranda düğmeye
   basmak hiçbir şey kazandırmıyordu.

   Kat, balon yazısının 16px'i geçtiği yer olarak seçildi (1920×1000'de ölçüldü):

     sığdırma 1.0×   531px sayfa   10.7px balon
     1.4×            743px         15.0px      ← 16'nın altında kalıyor
     1.5×            797px         16.1px      ← ilk geçen adım
     çift tık 2.4×  1274px         25.8px

   Bedeli yatay değil DİKEY: 1.5 katında sayfa 1.42 ekran boyunda, yani okur
   aşağı kaydırıyor. Yatay taşma masaüstünde hiç doğmuyor (1280×720'de bile
   sayfa ancak 3.4 katında pencereyi aşıyor); dar/dikey pencerelerde doğuyor ve
   orada da sığdırmanın kendisi zaten okunamayacak kadar küçük.

   Sığdırmaya dönüş kaybolmadı: bant düğmesi, `0` tuşu ve çift tıklama oraya
   götürüyor. Değişen yalnız NEREDE AÇILDIĞI. */
const ACILIS = 1.5;

/* Sahne ile görüş alanının kenarı arasında bırakılan hava. Sıfır olsaydı
   4. karenin sayfayı taşan balonu (`left: 70%; width: 104%`) ekran kenarına
   yapışırdı. */
const PAY = 28;

/* Oran ölçümünde kullanılan referans sahne genişliği. Değeri önemsiz —
   yalnızca bir kere ölçüp oran çıkarmak için kuruluyor. */
const REFERANS = 1000;

let gorusalan = null;
let cerceve = null;
let sahne = null;
let yuzdeEtiketi = null;

/** Taşınan `.manga-page` ve DOM'da bıraktığı yer işareti. */
let sayfaEl = null;
let yuva = null;

/** Sığdırma anındaki sahne genişliği (px) ve okurun seçtiği kat. */
let sigdirma = 0;
let olcek = 1;

/** İpucu nabzı oturumda bir kez. */
let ipucuVerildi = false;

/* ==========================================================================
   2 · KURULUM
   --------------------------------------------------------------------------
   Pencerenin içi ilk açılışta bir kez kuruluyor. `index.html`de boş
   duruyor çünkü içindeki tek gerçek içerik zaten sayının kendi sayfası.
   ======================================================================= */

function kur() {
  if (gorusalan) return;

  pencere.innerHTML = `
    <div class="mangazoom__viewport" tabindex="-1">
      <div class="mangazoom__cerceve"><div class="mangazoom__stage"></div></div>
    </div>
    <div class="mangazoom__bar" role="toolbar" aria-label="Görünüm">
      <button class="mangazoom__btn" type="button" data-is="uzaklas" aria-label="Uzaklaştır">
        <svg viewBox="0 0 24 24" class="icon" aria-hidden="true"><path d="M5 12h14"/></svg>
      </button>
      <span class="mangazoom__yuzde" aria-live="polite">%100</span>
      <button class="mangazoom__btn" type="button" data-is="yaklas" aria-label="Yakınlaştır">
        <svg viewBox="0 0 24 24" class="icon" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
      </button>
      <button class="mangazoom__btn" type="button" data-is="sigdir" aria-label="Ekrana sığdır">
        <svg viewBox="0 0 24 24" class="icon" aria-hidden="true">
          <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3"/>
        </svg>
      </button>
      <span class="mangazoom__ayrac" aria-hidden="true"></span>
      <button class="mangazoom__btn" type="button" data-is="kapat" aria-label="Kapat">
        <svg viewBox="0 0 24 24" class="icon" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
      </button>
    </div>`;

  gorusalan = pencere.querySelector('.mangazoom__viewport');
  cerceve = pencere.querySelector('.mangazoom__cerceve');
  sahne = pencere.querySelector('.mangazoom__stage');
  yuzdeEtiketi = pencere.querySelector('.mangazoom__yuzde');

  for (const dgm of pencere.querySelectorAll('.mangazoom__btn')) {
    dgm.addEventListener('click', () => {
      const is = dgm.dataset.is;
      if (is === 'yaklas') olcekle(olcek * ADIM);
      else if (is === 'uzaklas') olcekle(olcek / ADIM);
      else if (is === 'sigdir') olcekle(1);
      else mangaKapat();
    });
  }

  gezinmeyiBagla();
}

/* ==========================================================================
   3 · ÖLÇEK
   ======================================================================= */

/**
 * Sayfanın EKRANDA GERÇEKTEN kapladığı kutu — sahnenin kutusu değil.
 *
 * İkisi aynı değil: `plan` formülü sayfayı sahnenin ortasına koyuyor ve
 * yanlarda sahnenin ~%16'sı kadar boşluk bırakıyor.
 *
 * Balonlar kare sınırlarını taşıyabildiği için (4. karede `left: 70%;
 * width: 104%`) kutu, sayfa ile balonların BİRLEŞİMİ olarak ölçülüyor. Bugünkü
 * yedi balonun hiçbiri sayfa kutusunu aşmıyor (ölçüldü: dört yönde de 0px) —
 * yani birleşim şu an sayfanın kendisi. Yine de birleşim alınıyor: bir balon
 * birkaç yüzde kaydırıldığında burası sessizce yanlış hesaplamasın.
 */
function kaplananKutu() {
  const r = sayfaEl.getBoundingClientRect();
  let sol = r.left;
  let sag = r.right;
  let ust = r.top;
  let alt = r.bottom;

  for (const balon of sayfaEl.querySelectorAll('.manga-bubble')) {
    const k = balon.getBoundingClientRect();
    sol = Math.min(sol, k.left);
    sag = Math.max(sag, k.right);
    ust = Math.min(ust, k.top);
    alt = Math.max(alt, k.bottom);
  }
  return { sol, sag, ust, alt, en: sag - sol, boy: alt - ust };
}

/**
 * Sığdırma genişliğini ÖLÇEREK bulur ve sahnenin boş kenarlarını kırpar.
 *
 * Oranları sabit yazmak (sayfa sahnenin 2/3'ü, boyu 1.185 katı) kısa yol
 * olurdu ama blocks.css'teki formül değişince burası sessizce yanlış olurdu.
 * Bir referans genişlikte bir kez ölçmek o formülü tek kaynak bırakıyor.
 *
 * ⚠️ Sığdırma SAHNEYE göre yapılamıyor. Sahne sayfadan geniş olduğu için dar
 * ekranda o boşluk sığdırmayı yiyordu: 420px'lik bir telefonda sayfa akıştaki
 * boyunun aynısında (243px) kalıyordu, yani tam ekran hiçbir şey kazandırmıyordu.
 * Kutuya göre ölçüp aradaki boşluğu çerceveyle kırpınca hem sayfa ekranı
 * dolduruyor hem de sığdırmada yana kaydırılacak boş alan kalmıyor.
 */
function sigdirmayiOlc() {
  cerceve.style.setProperty('--sahne-w', `${REFERANS}px`);
  cerceve.style.setProperty('--kirp-sol', '0');
  cerceve.style.setProperty('--kutu-oran', '1');

  const sahneKutu = sahne.getBoundingClientRect();
  const kutu = kaplananKutu();
  if (!kutu.en || !kutu.boy) return REFERANS;

  /* Sol kırpma ve kutu genişliği AYRI yazılıyor: bir balon yalnız bir yana
     taşarsa simetrik bir kırpma kompozisyonu kaydırırdı. */
  cerceve.style.setProperty('--kirp-sol', ((kutu.sol - sahneKutu.left) / REFERANS).toFixed(5));
  cerceve.style.setProperty('--kutu-oran', (kutu.en / REFERANS).toFixed(5));

  const oranEn = kutu.en / REFERANS;
  const oranBoy = kutu.boy / REFERANS;

  const en = Math.max(160, gorusalan.clientWidth - PAY * 2);
  const boy = Math.max(160, gorusalan.clientHeight - PAY * 2);

  return Math.min(en / oranEn, boy / oranBoy);
}

/** `--sahne-w`yi ve ona bağlı her şeyi yazar. Çapa hesabı YOK. */
function genisligiYaz() {
  cerceve.style.setProperty('--sahne-w', `${(sigdirma * olcek).toFixed(1)}px`);
  yuzdeEtiketi.textContent = `%${Math.round(olcek * 100)}`;
  gorusalan.dataset.gezinir = String(gezinirMi());
  gorselleriAyarla();
}

function gezinirMi() {
  return (
    gorusalan.scrollWidth > gorusalan.clientWidth + 1 ||
    gorusalan.scrollHeight > gorusalan.clientHeight + 1
  );
}

/**
 * Ölçeği değiştirir ve `capa` noktasını EKRANDA YERİNDE tutar.
 *
 * Çapa, sahnenin içindeki ORANSAL yeri olarak saklanıyor (0–1 arası). Piksel
 * olarak saklansaydı ölçek değişir değişmez anlamını yitirirdi; oran ölçekten
 * bağımsız. Çapa verilmezse ekranın ortası kullanılıyor — düğmeler ve tuşlar
 * için doğru davranış bu.
 */
function olcekle(istenen, capa) {
  const hedef = Math.min(EN_COK, Math.max(EN_AZ, istenen));

  const gk = gorusalan.getBoundingClientRect();
  const nx = capa ? capa.x : gk.left + gorusalan.clientWidth / 2;
  const ny = capa ? capa.y : gk.top + gorusalan.clientHeight / 2;

  const once = cerceve.getBoundingClientRect();
  const fx = once.width ? (nx - once.left) / once.width : 0.5;
  const fy = once.height ? (ny - once.top) / once.height : 0.5;

  olcek = hedef;
  genisligiYaz();

  /* Yeni kutu AYNI karede okunuyor: bir sonraki kareye bırakılsaydı çapa bir
     kare geriden gelir ve yakınlaştırma imlecin altından kayardı. */
  const sonra = cerceve.getBoundingClientRect();
  gorusalan.scrollLeft += sonra.left + fx * sonra.width - nx;
  gorusalan.scrollTop += sonra.top + fy * sonra.height - ny;
}

/* ==========================================================================
   4 · GÖRSEL KAYNAKLARI
   --------------------------------------------------------------------------
   ⚠️ Bu adım olmadan tam ekranın yarısı boşa gider. Sayfadaki `sizes`
   `(max-width: 640px) 100vw, 600px` diyor — yani masaüstünde SABİT 600px.
   Tarayıcı `srcset` seçimini düzen boyutuna değil bu beyana göre yaptığı
   için, sahne ne kadar büyürse büyüsün 600w dosyada kalır ve çizim
   bulanıklaşırdı. Burada `sizes` karenin gerçek genişliğine yazılıyor;
   1080w'ye kadar olan türevler ancak böyle devreye giriyor.

   Kapanışta da çağrılıyor: sayfa akışa döndüğünde beyan yeniden küçülsün.
   ======================================================================= */

function gorselleriAyarla() {
  if (!sayfaEl) return;
  for (const sanat of sayfaEl.querySelectorAll('.manga-panel__art')) {
    const en = Math.ceil(sanat.getBoundingClientRect().width);
    if (en <= 0) continue;
    for (const dugum of sanat.querySelectorAll('img, source')) {
      dugum.sizes = `${en}px`;
    }
  }
}

/* ==========================================================================
   5 · GEZİNME
   --------------------------------------------------------------------------
   Gezinme, görüş alanının KENDİ kaydırması. Dokunmatik sürükleme, trackpad,
   klavye okları ve kaydırma çubuğu böylece tarayıcıdan bedava geliyor;
   aşağıda yalnızca farenin sürüklemesi ile tekerleğin yakınlaştırması var.
   ======================================================================= */

let surukleme = null;

function gezinmeyiBagla() {
  /* Tekerlek: ctrl/⌘ ile yakınlaştırma, düz tekerlek kaydırma. Web'in yerleşik
     ayrımı bu ve trackpad'de "pinch" hareketi zaten ctrl+wheel olarak
     geliyor — yani kıstırma bedava çalışıyor. */
  gorusalan.addEventListener(
    'wheel',
    (olay) => {
      if (!olay.ctrlKey && !olay.metaKey) return;
      olay.preventDefault();
      olcekle(olcek * Math.exp(-olay.deltaY * 0.0015), { x: olay.clientX, y: olay.clientY });
    },
    { passive: false }
  );

  /* Sürükleme YALNIZ fareyle: dokunmatikte parmak zaten sayfayı kaydırıyor,
     bir de biz kaydırsak hareket ikiye katlanırdı. */
  gorusalan.addEventListener('pointerdown', (olay) => {
    if (olay.pointerType !== 'mouse' || olay.button !== 0) return;
    if (olay.target.closest('a, button')) return;

    /* Sığdırma seviyesinde gezilecek bir şey yok; orada sürüklemeyi hiç
       başlatmıyoruz ki balon metni normal şekilde seçilebilsin (balonların
       seçilebilir kalması bilinçli — bkz. bilesen.css §5). */
    if (!gezinirMi()) return;

    surukleme = {
      x: olay.clientX,
      y: olay.clientY,
      sol: gorusalan.scrollLeft,
      ust: gorusalan.scrollTop
    };
    gorusalan.setPointerCapture(olay.pointerId);
    gorusalan.dataset.surukleniyor = 'true';
    olay.preventDefault();
  });

  gorusalan.addEventListener('pointermove', (olay) => {
    if (!surukleme) return;
    gorusalan.scrollLeft = surukleme.sol - (olay.clientX - surukleme.x);
    gorusalan.scrollTop = surukleme.ust - (olay.clientY - surukleme.y);
  });

  const suruklemeBitti = (olay) => {
    if (!surukleme) return;
    surukleme = null;
    delete gorusalan.dataset.surukleniyor;
    gorusalan.releasePointerCapture?.(olay.pointerId);
  };
  gorusalan.addEventListener('pointerup', suruklemeBitti);
  gorusalan.addEventListener('pointercancel', suruklemeBitti);

  /* Çift tıklama sığdırma ile rahat okuma arasında gidip geliyor. Tıklanan
     nokta çapa: okur neyi büyütmek istediğini zaten imleciyle söylüyor. */
  gorusalan.addEventListener('dblclick', (olay) => {
    if (olay.target.closest('a, button')) return;
    olcekle(olcek > 1.2 ? 1 : RAHAT, { x: olay.clientX, y: olay.clientY });
  });

  /* Escape'i tarayıcı `<dialog>` üzerinden kendisi hallediyor; burada yalnız
     ölçek tuşları var. Oklar görüş alanının kendi kaydırmasına gidiyor. */
  pencere.addEventListener('keydown', (olay) => {
    if (olay.metaKey || olay.altKey) return;
    switch (olay.key) {
      case '+':
      case '=':
        olay.preventDefault();
        olcekle(olcek * ADIM);
        break;
      case '-':
      case '_':
        olay.preventDefault();
        olcekle(olcek / ADIM);
        break;
      case '0':
        olay.preventDefault();
        olcekle(1);
        break;
    }
  });

  window.addEventListener('resize', () => {
    if (!pencere.open) return;
    sigdirma = sigdirmayiOlc();
    genisligiYaz();
  });
}

/* ==========================================================================
   6 · AÇMA VE KAPAMA
   ======================================================================= */

/** `sayfa` bir manga sayfasıysa tam ekranda açar. */
export function mangaAc(sayfa) {
  const el = sayfa?.querySelector?.('.manga-page');
  if (!el || pencere.open) return;

  kur();

  /* Sayfa KOPYALANMIYOR, taşınıyor: kopya olsaydı aynı yedi görsel iki kez
     iner ve iki DOM ağacı zamanla birbirinden ayrı düşerdi. Yerine bir yorum
     düğümü bırakılıyor, kapanışta tam olarak oraya dönüyor. */
  yuva = document.createComment('manga-page');
  el.replaceWith(yuva);
  sayfaEl = el;
  sahne.append(el);

  /* Kabuk `inert`: arkadaki sayının ok tuşlarıyla kaydırılmasını kesiyor.
     okuyucu.js'in tuş dinleyicisi zaten `inert`e bakıyor, yani orada
     değiştirilecek bir şey yok — sayının açılış akışında kullanılan aynı
     kapama yöntemi. */
  kabuk.setAttribute('inert', '');
  pencere.showModal();

  sigdirma = sigdirmayiOlc();
  olcek = ACILIS;
  genisligiYaz();

  /* Sahne sığdırmada ekrandan dar olabilir; ortalamayı flexbox yapıyor ama
     yatayda taşma varsa başlangıç noktası ortası olmalı.

     `top: 0` açılış katı 1'i aştıktan sonra daha da önemli: sayfa artık
     pencereden uzun ve okur onu BAŞINDAN görmeli. Ortalanmış bir başlangıç
     mangayı ikinci sırasından açardı. */
  gorusalan.scrollTo({
    left: (gorusalan.scrollWidth - gorusalan.clientWidth) / 2,
    top: 0
  });
  gorusalan.focus({ preventScroll: true });
}

/**
 * Sayfayı akıştaki yerine geri koyar.
 *
 * ⚠️ Bu iş `close` olayına BIRAKILMIYOR, yalnız oradan da çağrılıyor. `close`
 * eşzamansız bir görev olarak kuyruğa giriyor ve kuyruk her zaman işlemiyor —
 * sekme arka plandayken tarayıcı görevleri donduruyor (ölçüldü). Geri koyma
 * o kuyruğa bağlı kalsaydı sayfa pencerenin içinde kalır, sayıda bir delik
 * açılırdı. Fonksiyon yeniden çağrılabilir: iki yoldan da gelinse zararsız.
 */
function geriKoy() {
  if (!sayfaEl) return;

  if (yuva?.parentNode) yuva.replaceWith(sayfaEl);
  gorselleriAyarla(); /* akıştaki küçük boya göre `sizes`ı geri küçült */

  sayfaEl = null;
  yuva = null;
  kabuk.removeAttribute('inert');
  if (!dugme.hidden) dugme.focus({ preventScroll: true });
}

/** Kapatma düğmesinin yolu. Escape ise aşağıdaki `close` üzerinden geliyor. */
function mangaKapat() {
  pencere.close();
  geriKoy();
}

/* Escape'i tarayıcı `<dialog>` üzerinden kendisi işliyor; o yol buradan
   geçiyor. Düğmeyle kapatılmışsa `geriKoy` zaten çalışmış olur ve bu çağrı
   sessizce geri döner. */
pencere.addEventListener('close', geriKoy);

/* ==========================================================================
   7 · DIŞARIYA AÇILAN UÇ
   ======================================================================= */

/**
 * Banttaki düğmeyi okunan sayfaya göre ayarlar. `okuyucu.js` her sayfa
 * değişiminde çağırıyor.
 *
 * Düğme manga dışındaki 30 sayfada gizli: her zaman durup yalnız bir sayfada
 * çalışan bir düğme, çalışmadığı 30 sayfada yalan söylerdi.
 */
export function mangaDugmesiniAyarla(sayfa) {
  const mangaMi = sayfa?.dataset?.kind === 'manga';
  dugme.hidden = !mangaMi;

  if (mangaMi && !ipucuVerildi) {
    ipucuVerildi = true;
    dugme.dataset.ipucu = 'true';
    setTimeout(() => delete dugme.dataset.ipucu, 2600);
  }
}

/* ==========================================================================
   8 · SHORTS KAPISI
   --------------------------------------------------------------------------
   Filigran artık YouTube'a DOĞRUDAN gitmiyor: önce sağ altta küçük bir kart
   açılıp soruyor. `<a href>` yerinde duruyor (bkz. sayfa.html) — sağ tık,
   orta tık ve ctrl/⌘+tık hâlâ direkt yeni sekmede açıyor; telif.js bu yüzden
   filigranı context menüden muaf tutuyordu, o gerekçe hâlâ geçerli. Yalnız
   düz sol tık burada yakalanıyor.

   Kart `document.body`ye değil, tam ekran açıkken `pencere`nin (native
   `<dialog>`) içine ekleniyor: `showModal` DOM'u tarayıcının üst katmanına
   taşıyor ve dialogun dışındaki hiçbir `position: fixed` öğe onun üstüne
   çıkamıyor.

   Konum viewport köşesine değil, FİLİGRANIN KENDİSİNE göre hesaplanıyor:
   `right/bottom: 0` sabit köşede dursaydı, tuval ortalandığında (masaüstünde
   yanlarda menüye bırakılan boşluk yüzünden) kart filigrandan uzak bir yerde,
   ekranın köşesinde belirir ve düğmeyle çakışırdı. Sağ kenarı filigranın sağ
   kenarına hizalanıp üstüne, aralarında boşluk bırakarak açılıyor.
   ======================================================================= */

const SHORTS_BOSLUK = 12;

let shortsKart = null;
let shortsTetikleyici = null;

function shortsKartiniKur(baglanti) {
  if (shortsKart) return;

  shortsKart = document.createElement('div');
  shortsKart.className = 'shorts-kart';
  shortsKart.hidden = true;
  shortsKart.innerHTML = `
    <div class="shorts-kart__head">
      <b>PIGMENT</b>
      <button class="shorts-kart__x" type="button" aria-label="Kapat">
        <svg viewBox="0 0 24 24" class="icon" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
      </button>
    </div>
    <p class="shorts-kart__metin">
      Bu one-shot mangayı YouTube'da video olarak izlemek isterseniz butona basabilirsiniz.
    </p>
    <a class="shorts-kart__cta" href="${baglanti}" target="_blank" rel="noopener">
      <svg viewBox="0 0 24 24" class="icon" aria-hidden="true"><path d="M10 8.65l5 3.35-5 3.35z"/><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>
      YouTube Shorts'ta izle
    </a>`;
  document.body.append(shortsKart);

  shortsKart.querySelector('.shorts-kart__x').addEventListener('click', shortsKartiniKapat);
  shortsKart.querySelector('.shorts-kart__cta').addEventListener('click', shortsKartiniKapat);

  document.addEventListener('keydown', (olay) => {
    if (olay.key === 'Escape' && !shortsKart.hidden) shortsKartiniKapat();
  });

  /* Dışarı tıklama: tetikleyicinin kendisi ve kartın içi muaf, gerisi kapatır. */
  document.addEventListener('pointerdown', (olay) => {
    if (shortsKart.hidden) return;
    if (olay.target.closest('.shorts-kart, [data-shorts-kapi]')) return;
    shortsKartiniKapat();
  });

  /* Konum tetikleyiciye göre hesaplandığı için kaydırma/yeniden boyutlanma
     onu bayatlatır — yeniden hesaplamak yerine kapatmak yeterli, kart zaten
     bir soru penceresi, sabit bir arayüz parçası değil. */
  const kapatVeBirak = () => shortsKartiniKapat();
  document.addEventListener('scroll', kapatVeBirak, true);
  window.addEventListener('resize', kapatVeBirak);
}

function shortsKartiniKapat() {
  if (!shortsKart || shortsKart.hidden) return;
  shortsKart.hidden = true;
  shortsTetikleyici?.focus({ preventScroll: true });
  shortsTetikleyici = null;
}

/** Kartı, tetikleyicinin ÜSTÜNE ve sağ kenarına hizalı açar. */
function shortsKartiniConumla(tetikleyici) {
  const kutu = tetikleyici.getBoundingClientRect();

  shortsKart.style.left = '0px';
  shortsKart.style.right = 'auto';
  shortsKart.style.bottom = `${window.innerHeight - kutu.top + SHORTS_BOSLUK}px`;

  const kartGenislik = shortsKart.offsetWidth;
  const sol = Math.min(
    Math.max(SHORTS_BOSLUK, kutu.right - kartGenislik),
    window.innerWidth - kartGenislik - SHORTS_BOSLUK
  );
  shortsKart.style.left = `${sol}px`;
}

function shortsKartiniAc(tetikleyici) {
  shortsKartiniKur(tetikleyici.href);

  const konak = pencere.open ? pencere : document.body;
  if (shortsKart.parentNode !== konak) konak.append(shortsKart);

  shortsTetikleyici = tetikleyici;
  shortsKart.hidden = false;
  shortsKartiniConumla(tetikleyici);
}

/**
 * Filigrana tıklamayı yakalar. `document` üzerinde tek dinleyici: filigran
 * akışta da tam ekranda da aynı düğüm — taşınıyor, kopyalanmıyor (bkz.
 * `mangaAc`) — yani ikisini ayrı ayrı bağlamaya gerek yok.
 */
function shortsKapisiniBagla() {
  document.addEventListener('click', (olay) => {
    if (olay.button !== 0 || olay.metaKey || olay.ctrlKey || olay.shiftKey || olay.altKey) return;

    const tetikleyici = olay.target.closest('[data-shorts-kapi]');
    if (!tetikleyici) return;

    olay.preventDefault();
    shortsKartiniAc(tetikleyici);
  });
}

/** Kapıları bağlar: banttaki düğme, sayfanın kendisi ve Shorts filigranı. */
export function mangaBaslat(kap) {
  dugme.addEventListener('click', () => {
    delete dugme.dataset.ipucu;
    mangaAc(kap.querySelector('.page[data-kind="manga"]:has(.manga-page)'));
  });

  /* İkinci kapı: sayfaya tıklamak. `cursor: zoom-in` bunu söyleyen tek işaret
     olduğu için tıklamanın gerçekten açması şart. */
  kap.addEventListener('click', (olay) => {
    if (olay.target.closest('a, button')) return;

    /* Okur metin seçtiyse niyeti açmak değil — seçimi yutmuyoruz. */
    if (!getSelection()?.isCollapsed) return;

    const sayfa = olay.target.closest('.page[data-kind="manga"]');
    if (sayfa) mangaAc(sayfa);
  });

  shortsKapisiniBagla();
}
