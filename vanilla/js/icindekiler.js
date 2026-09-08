/* ============================================================================
   İÇİNDEKİLER — bölüm açılışlarına atlama listesi
   ----------------------------------------------------------------------------
   Alt bandın SOLUNDAKİ düğme bunu açıyor. Liste sayının dokuz bölümünü
   gösteriyor ve her satır o bölümün ilk sayfasına gidiyor.

   ⚠️ Liste SABİT DEĞİL, her açılışta yeniden kuruluyor. Sebebi okuma modu:
   `min`de 19, `mid`de 26, `full`de 30 sayfa görünüyor ve bölümlerin sayfa
   sayıları da başlangıç sayfaları da moda göre değişiyor. Bir kere kurulup
   saklansaydı mod değiştiren okura yanlış numaralar gösterirdi.

   Bölümler `data-section`ten türüyor, elle yazılmış bir liste yok: sıranın
   tek kaynağı `index.html`deki `#sira` bloğu (bkz. BENIOKU.md) ve buradaki
   liste onun ardından geliyor. Elle yazılsaydı ilk yeniden sıralamada yalan
   söylerdi.

   Bu dosya `okuyucu.js`i İÇE AKTARMIYOR; ihtiyacı olan iki şeyi (görünür
   sayfalar, gitme işi) `icindekilerBaslat` ile geri arama olarak alıyor.
   Karşılıklı import iki modülü de kırılgan yapardı — `manga.js` de aynı
   sebeple aynı yolu izliyor.
   ========================================================================= */

const pencere = document.getElementById('icindekiler');
const dugme = document.getElementById('btn-icindekiler');
const kabuk = document.getElementById('shell');

/** okuyucu.js'ten gelen geri aramalar. */
let sayfalariVer = () => [];
let okunanSirayiVer = () => 0;
let git = () => {};

/* ==========================================================================
   1 · BÖLÜMLERİ ÇIKARMA
   ======================================================================= */

/**
 * Görünür sayfaları `data-section`e göre kümeler.
 *
 * Ardışıklığa bakıyor, kimliğe göre gruplamıyor: bir bölüm sayının iki ayrı
 * yerinde geçseydi (bugün geçmiyor) bu iki ayrı satır üretir — ve doğrusu da
 * o, çünkü okur için orada gerçekten iki ayrı durak var.
 */
function bolumleriCikar(sayfalar) {
  const bolumler = [];

  sayfalar.forEach((el, sira) => {
    const kimlik = el.dataset.section ?? el.dataset.pageId;
    const son = bolumler.at(-1);

    if (son && son.kimlik === kimlik) {
      son.adet++;
      son.bitis = sira;
      return;
    }
    bolumler.push({
      kimlik,
      ad: el.dataset.sectionTitle ?? kimlik,
      sira,
      bitis: sira,
      adet: 1
    });
  });

  return bolumler;
}

/* ==========================================================================
   2 · KURULUM
   ======================================================================= */

function kur() {
  const sayfalar = sayfalariVer();
  const okunan = okunanSirayiVer();
  const bolumler = bolumleriCikar(sayfalar);

  const satirlar = bolumler
    .map((b) => {
      /* Okunan sayfa bu bölümün aralığındaysa satır işaretleniyor: okur
         listeyi açtığında "neredeyim" sorusunun cevabı önce gelmeli. */
      const buradayim = okunan >= b.sira && okunan <= b.bitis;
      return `
        <button
          class="icindekiler__satir"
          type="button"
          data-sira="${b.sira}"
          ${buradayim ? 'aria-current="true"' : ''}
        >
          <span class="icindekiler__no">${String(b.sira + 1).padStart(2, '0')}</span>
          <span class="icindekiler__ad">${b.ad}</span>
          <span class="icindekiler__adet">${b.adet}</span>
        </button>`;
    })
    .join('');

  /* Başlıktaki ✕ mod seçicideki `.modal__x`in aynısı. Escape ve perdeye
     tıklamak zaten kapatıyor ama ikisi de GÖRÜNMEZ yollar; dokunmatikte
     Escape yok ve perde "tıklanabilir" demiyor. */
  pencere.innerHTML = `
    <div class="icindekiler__bas">
      <h2 class="icindekiler__baslik">İçindekiler</h2>
      <button class="modal__x" type="button" aria-label="Kapat">✕</button>
    </div>
    <div class="icindekiler__liste">${satirlar}</div>`;

  pencere.querySelector('.modal__x').addEventListener('click', kapat);

  for (const satir of pencere.querySelectorAll('.icindekiler__satir')) {
    satir.addEventListener('click', () => {
      const sira = Number(satir.dataset.sira);
      kapat();
      git(sira);
    });
  }
}

/* ==========================================================================
   3 · AÇMA VE KAPAMA
   --------------------------------------------------------------------------
   Pencerenin YERİ burada hesaplanmıyor. Bir zamanlar hesaplanıyordu: liste
   düğmesinin üstüne oturan bir menüydü ve `--x` / `--y` her açılışta
   ölçülüyordu. Artık ekranın ortasında duruyor ve ortalamayı tarayıcının kendi
   `<dialog>` kuralı yapıyor — ölçülecek bir şey kalmadı (bkz. css/overlays.css
   §İÇİNDEKİLER).
   ======================================================================= */

function ac() {
  if (pencere.open) return;

  kur();
  kabuk.setAttribute('inert', '');
  dugme.setAttribute('aria-expanded', 'true');
  pencere.showModal();

  const simdiki = pencere.querySelector('[aria-current="true"]') ?? pencere.querySelector('.icindekiler__satir');
  simdiki?.focus({ preventScroll: true });
  simdiki?.scrollIntoView({ block: 'nearest' });
}

/**
 * Kapanışta yapılacaklar. `close` olayına bağlı, kapatma çağrısına değil:
 * Escape'i ve dışarı tıklamayı tarayıcı `<dialog>` üzerinden kendisi işliyor
 * ve o yollar da buradan geçmeli.
 */
function kapat() {
  if (pencere.open) pencere.close();
}

pencere.addEventListener('close', () => {
  kabuk.removeAttribute('inert');
  dugme.setAttribute('aria-expanded', 'false');
  dugme.focus({ preventScroll: true });
});

/* Perdeye tıklamak kapatıyor. `<dialog>`ta perde ayrı bir düğüm değil, bu
   yüzden hedef pencerenin KENDİSİ ise tıklama içeriğin dışına düşmüş demek. */
pencere.addEventListener('click', (olay) => {
  if (olay.target === pencere) kapat();
});

/* ==========================================================================
   4 · DIŞARIYA AÇILAN UÇ
   ======================================================================= */

export function icindekilerBaslat(baglar) {
  sayfalariVer = baglar.sayfalariVer;
  okunanSirayiVer = baglar.okunanSirayiVer;
  git = baglar.git;

  dugme.addEventListener('click', ac);
}
