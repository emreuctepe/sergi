/* ============================================================================
   AÇILIŞ — yükleme ekranı, tanıtım, mod seçimi
   ----------------------------------------------------------------------------
   Sayfanın TEK giriş noktası (`index.html`in sonundaki script). Okuyucunun
   kendisi `okuyucu.js`te; burada yalnız sayının nasıl AÇILDIĞI var.

   Akış:
     her ziyaret      → Yükleme (görseller + fontlar inene kadar)
     ilk ziyaret      → Yükleme → Tanıtım (5 kart) → Mod seçimi → sayı
     mod seçilmemiş   → Yükleme → Mod seçimi → sayı
     dönen okur       → Yükleme → sayı, kendi modunda

   Hiçbiri sunucu istemiyor: yükleme görsel sayıyor, tanıtım kaydırıyor, mod
   seçimi CSS sınıfı değiştiriyor. "Altyapı" diye bir şey yok.
   ========================================================================= */

import { MODLAR, baslat, modAyarla, sayfalariDiz } from './okuyucu.js';
import { SAHNELER } from './sahneler.js';

const kabuk = document.getElementById('shell');
const kap = document.getElementById('pages');

/* ==========================================================================
   1 · TERCİHLER
   --------------------------------------------------------------------------
   İki alan, ikisi de bu cihaza ait: hangi modda okuyor ve tanıtımı gördü mü.
   Okuru tanımıyoruz, hesap yok, sunucuya hiçbir şey gitmiyor.

   Okuma ve yazma HİÇ HATA ATMIYOR: localStorage gizli sekmede ya da sıkı
   gizlilik ayarında erişilemez oluyor ve orada patlayan bir tercih okuma,
   sayıyı hiç açılmaz hâle getirirdi.
   ======================================================================= */

const ANAHTAR = 'vanilla:sergi:v1';

function tercihOku() {
  try {
    const ham = JSON.parse(localStorage.getItem(ANAHTAR) ?? '{}');
    return {
      mod: MODLAR.some((m) => m.id === ham.mod) ? ham.mod : null,
      tanitimGoruldu: ham.tanitimGoruldu === true
    };
  } catch {
    return { mod: null, tanitimGoruldu: false };
  }
}

function tercihYaz(yama) {
  try {
    localStorage.setItem(ANAHTAR, JSON.stringify({ ...tercihOku(), ...yama }));
  } catch {
    /* Depolama kapalı — tercih bu oturumda yaşar, sonrakinde sorulur. */
  }
}

/* ==========================================================================
   2 · YÜKLEME EKRANI
   --------------------------------------------------------------------------
   ⚠️ YÜZDE GERÇEK. Zamana bağlı bir animasyon değil, inen dosya sayısı. Sahte
   bir sayaç burada özellikle kolay ve özellikle yalan olurdu — çünkü tam da
   "her şey hazır" diye söz veriyor.
   ======================================================================= */

/* Sıra rastgele değil: yükleme hızlı bağlantıda bir saniyede bitiyor, yani
   çoğu okur yalnız ilk bir iki satırı görecek. Baştakiler derginin gerçekten
   yaptığı şeyi söylüyor; saçmalık ancak yavaş bağlantıda görünecek yere
   konuldu. Bekleme uzadıkça metin de tuhaflaşıyor. */
const YUKLEME_SATIRLARI = [
  'sayfalar basılıyor…',
  'mürekkep kuruyor…',
  'dergi paketleniyor…',
  'dağıtıma verildi…',
  'postacı yola çıktı…',
  'postacı yolda sosyal medyaya daldı…',
  'postacıya video önerildi…',
  'postacı iki saattir aynı videoyu izliyor…',
  'postacıya "sadece bir tane daha" dedirtildi…',
  'postacının telefonu %1…',
  'postacı şarj aleti arıyor…',
  'postacı dergiyi hatırladı…',
  'postacı koşuyor…'
];

const SATIR_SURESI = 2000;

/** Hiçbir görsel yanıt vermezse okur burada kilitlenmesin diye üst sınır. */
const SABIR_SINIRI = 15000;

/**
 * Sayının bütün görsellerini indirir, biterken yüzdeyi sürer.
 *
 * ⚠️ SAYFANIN İSTEYECEĞİ TÜREVİN AYNISI iniyor: ön yükleme için yeni bir
 * `<picture>` KURULMUYOR, sayfalardaki `<picture>` düğümleri olduğu gibi
 * kopyalanıyor. Elle kurulsaydı `srcset`/`sizes` bir gün ayrışır, tarayıcı ön
 * yüklemede 600px'i sayfada 900px'i seçer ve okur aynı fotoğrafı iki kez
 * indirirdi — yükleme ekranı "hazır" derken sayfa hâlâ iniyor olurdu.
 *
 * ⚠️ HATA DA "BİTTİ" SAYILIYOR. 404 dönen bir dosya asla yüklenmeyecek; onu
 * beklemek okuru süresiz tutmak olur. Yüzde "indirildi" değil "artık
 * beklenmiyor" demek.
 */
function gorselleriYukle(bildir) {
  /* `loading="lazy"` BİLEREK KALDIRILIYOR: bu düğümler 0×0 ve ekran dışında,
     tembel kalsalardı hiç yüklenmez ve yüzde asla ilerlemezdi. */
  const kutu = document.createElement('div');
  kutu.setAttribute('aria-hidden', 'true');
  kutu.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';

  /* `picture` OLMAYAN görseller de sayılıyor: manga künyesindeki logo tek başına
     bir `<img>` (avif türevi yok). Yalnız `picture` aransaydı o dosya yüzdenin
     dışında kalır, yani "hazır" derken hâlâ inen bir şey olurdu. */
  const kaynaklar = [...kap.querySelectorAll('picture, img:not(picture img)')];

  const resimler = kaynaklar.map((dugum) => {
    const kopya = dugum.cloneNode(true);
    const img = kopya.tagName === 'IMG' ? kopya : kopya.querySelector('img');
    img.loading = 'eager';
    kutu.append(kopya);
    return img;
  });

  document.body.append(kutu);

  /* Fontlar tek birim sayılıyor: kaç dosya indiği tarayıcıya göre değişiyor
     ama okur için "yazı tipi hazır mı" tek bir soru. */
  const toplam = resimler.length + 1;
  let biten = 0;

  return new Promise((bitti) => {
    let kapandi = false;
    const adim = () => {
      biten++;
      bildir({ toplam, biten });
      if (biten >= toplam) son();
    };
    const son = () => {
      if (kapandi) return;
      kapandi = true;
      clearTimeout(sabir);
      kutu.remove();
      bitti();
    };

    const sabir = setTimeout(son, SABIR_SINIRI);

    for (const img of resimler) {
      if (img.complete) adim();
      else {
        img.addEventListener('load', adim, { once: true });
        img.addEventListener('error', adim, { once: true });
      }
    }
    document.fonts.ready.then(adim, adim);
  });
}

/** Yükleme ekranını sürer ve kapanınca söz verir. */
async function yuklemeEkrani() {
  const ekran = document.getElementById('loader');
  const yuzdeYazi = ekran.querySelector('.loader__pct');
  const satirYazi = ekran.querySelector('.loader__line');

  let satir = 0;
  const sayac = setInterval(() => {
    /* Son satırda duruyor, başa sarmıyor: dönüp duran bir metin "takıldı"
       hissi verir, oysa bekleme gerçek ve ilerliyor. */
    if (satir >= YUKLEME_SATIRLARI.length - 1) return clearInterval(sayac);
    satirYazi.textContent = YUKLEME_SATIRLARI[++satir];
  }, SATIR_SURESI);

  await gorselleriYukle(({ toplam, biten }) => {
    const yuzde = Math.round((biten / toplam) * 100);
    yuzdeYazi.querySelector('span').textContent = `%${yuzde}`;
    yuzdeYazi.setAttribute('aria-label', `%${yuzde} yüklendi`);
  });

  clearInterval(sayac);
  ekran.dataset.cikiyor = 'true';
  await bekle(azHareket() ? 0 : 200);
  ekran.remove();
}

/* ==========================================================================
   3 · TANITIM — beş kart
   --------------------------------------------------------------------------
   Kendi snap kaydırıcısı olan beş kart. Arka planları `sahneler.js`te
   üretiliyor.
   ======================================================================= */

const KARTLAR = [
  {
    sahne: 'paper',
    baslik: 'Bu bir dergi.',
    alt: 'Akış değil. Başlıyor ve bitiyor.'
  },
  {
    sahne: 'leaves',
    baslik: 'Ayda bir sayı.',
    alt: 'Bir oturuşta okunur. Sonra kapanır ve gelecek ayı bekler.'
  },
  {
    sahne: 'waves',
    baslik: 'Üç okuma derinliği.',
    alt: 'Acelen varsa en az. Vaktin varsa klasik. Aynı sayı, üç farklı uzunluk.'
  },
  {
    sahne: 'street',
    baslik: 'Nereye istersen yorum yaz.',
    alt: 'Bir cümlenin altına, bir fotoğrafın köşesine. Hesap açmana gerek yok.'
  },
  {
    sahne: 'torii',
    baslik: 'Hazırsan başlayalım.',
    alt: 'Sayı 03 · Kızıl Mevsim',
    son: true
  }
];

function tanitimGoster() {
  const host = document.createElement('div');
  host.className = 'intro-host';
  host.setAttribute('role', 'dialog');
  host.setAttribute('aria-modal', 'true');
  host.setAttribute('aria-label', `${KARTLAR.length} kartlık tanıtım`);
  host.dataset.on = 'false';

  const slaytlar = KARTLAR.map(
    (kart, i) => `
      <section class="intro__slide" data-i="${i}">
        <div class="intro__bg">${SAHNELER[kart.sahne]()}</div>
        <div class="intro__text">
          <h2 class="intro__big">${kart.baslik}</h2>
          <p class="intro__small">${kart.alt}</p>
          ${
            kart.son
              ? '<button class="intro__start" type="button">Sayıyı aç</button>'
              : '<span class="intro__chev" aria-hidden="true">⌄</span>'
          }
        </div>
      </section>`
  ).join('');

  const noktalar = KARTLAR.map(
    (_, i) => `<i data-i="${i}" data-on="${i === 0}"></i>`
  ).join('');

  host.innerHTML = `
    <div class="intro__slides" tabindex="-1">${slaytlar}</div>
    <div class="intro__dots" aria-hidden="true">${noktalar}</div>
    <button class="intro__skip" type="button">Atla</button>`;

  document.body.append(host);

  const kaydirici = host.querySelector('.intro__slides');
  const nokta = [...host.querySelectorAll('.intro__dots i')];

  /* Açılış BİR KARE SONRA: `data-on` DOM'a eklenirken zaten "true" olsaydı
     tarayıcının başlangıç değeri diye görecek bir hâli olmaz ve geçiş hiç
     başlamazdı. */
  requestAnimationFrame(() => (host.dataset.on = 'true'));
  kaydirici.focus({ preventScroll: true });

  return new Promise((bitti) => {
    let kapandi = false;

    const kapat = () => {
      /* Tek atışlık: "Atla", son karttaki düğme ve Escape aynı kapıya çıkıyor,
         ikisi birden tetiklenirse söz iki kez verilirdi. */
      if (kapandi) return;
      kapandi = true;
      host.dataset.on = 'false';
      document.removeEventListener('keydown', kacis);
      setTimeout(
        () => {
          host.remove();
          bitti();
        },
        azHareket() ? 0 : 420
      );
    };

    const kacis = (olay) => {
      if (olay.key === 'Escape') kapat();
    };

    let kare = 0;
    kaydirici.addEventListener(
      'scroll',
      () => {
        if (kare) return;
        kare = requestAnimationFrame(() => {
          kare = 0;
          const simdiki = Math.round(kaydirici.scrollTop / kaydirici.clientHeight);
          nokta.forEach((n, i) => (n.dataset.on = String(i === simdiki)));
        });
      },
      { passive: true }
    );

    host.querySelector('.intro__skip').addEventListener('click', kapat);
    host.querySelector('.intro__start').addEventListener('click', kapat);
    document.addEventListener('keydown', kacis);
  });
}

/* ==========================================================================
   4 · MOD SEÇİCİ
   --------------------------------------------------------------------------
   İki yüzü var: açılışta KAPANMAZ (mod seçilmeden sayı açılmıyor), banttaki
   çipten açılınca kapanabilir.
   ======================================================================= */

const MOD_KARTLARI = [
  {
    id: 'min',
    ad: 'Doomscroller',
    simge: '🫠',
    satir: 'Sosyal medya kullanmaktan beyni sıvı olanlar için.',
    detay:
      'Dosya tek sayfalık özete iner, söyleşiden dört soru kalır. Manga, foto-öykü ve bulmaca kısalmaz.',
    dakika: 7
  },
  {
    id: 'mid',
    ad: 'Dengeli',
    simge: '⚖️',
    satir: 'Emin değilsen buradan başla.',
    detay: 'Dosyanın gövdesi, söyleşinin yedi sayfası, sözlüğün tamamı.',
    dakika: 9
  },
  {
    id: 'full',
    ad: 'Doomreader',
    simge: '🧠',
    satir: 'Hâlâ uzun metin okuyabilen üst insanlar için.',
    detay: 'Dosyanın son iki bölümü ve söyleşinin tamamı — kesilen hiçbir şey yok.',
    dakika: 10
  }
];

/**
 * Bir modun kaç sayfa gösterdiği DOM'dan SAYILIYOR, karta yazılmıyor.
 * `index.html`deki sıradan bir satır silinirse kart da kendiliğinden doğru
 * kalsın diye — yazılı bir sayı ilk düzenlemede yalan olurdu.
 *
 * (Dakikalar sabit: onları saymak sayfadaki her kelimeyi saymak demek ve bu
 * klon sayıyı okumak için var, yeniden ölçmek için değil.)
 */
function sayfaSayisi(mod) {
  return [...kap.querySelectorAll('.page')].filter((sayfa) => {
    const modlar = sayfa.dataset.mod.split(' ');
    return modlar.includes('all') || modlar.includes(mod);
  }).length;
}

function modSecici({ kapanabilir, secili }) {
  const perde = document.createElement('div');
  perde.className = 'scrim';
  perde.setAttribute('role', 'presentation');
  perde.setAttribute('aria-hidden', 'true');
  perde.dataset.on = 'false';

  const host = document.createElement('div');
  host.className = 'modal-host';
  host.dataset.on = 'false';

  const kartlar = MOD_KARTLARI.map(
    (kart) => `
      <button class="depth-card" type="button" data-mod="${kart.id}"
              aria-pressed="${kart.id === secili}">
        <span class="depth-card__icon" aria-hidden="true">${kart.simge}</span>
        <span class="depth-card__main">
          <b>${kart.ad}</b>
          <span class="depth-card__line">${kart.satir}</span>
          <span class="depth-card__detail">${kart.detay}</span>
        </span>
        <span class="depth-card__meta">
          <b>~${kart.dakika} dk</b>
          <span>${sayfaSayisi(kart.id)} sayfa</span>
        </span>
      </button>`
  ).join('');

  host.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true" aria-label="Nasıl okumak istersin?">
      <header class="modal__head">
        <h2 class="modal__title">Nasıl okumak istersin?</h2>
        ${kapanabilir ? '<button class="modal__x" type="button" aria-label="Kapat">✕</button>' : ''}
      </header>
      <div class="depth-pick">
        <p class="depth-pick__intro">Bu sayıyı nasıl okumak istersin?</p>
        ${kartlar}
      </div>
    </div>`;

  document.body.append(perde, host);
  requestAnimationFrame(() => {
    perde.dataset.on = 'true';
    host.dataset.on = 'true';
  });
  host.querySelector('.depth-card').focus({ preventScroll: true });

  return new Promise((bitti) => {
    const kapat = (secim) => {
      perde.dataset.on = 'false';
      host.dataset.on = 'false';
      document.removeEventListener('keydown', kacis);
      setTimeout(
        () => {
          perde.remove();
          host.remove();
          bitti(secim);
        },
        azHareket() ? 0 : 240
      );
    };

    const kacis = (olay) => {
      if (olay.key === 'Escape' && kapanabilir) kapat(null);
    };

    for (const dugme of host.querySelectorAll('.depth-card')) {
      dugme.addEventListener('click', () => kapat(dugme.dataset.mod));
    }
    if (kapanabilir) {
      host.querySelector('.modal__x').addEventListener('click', () => kapat(null));
      perde.addEventListener('click', () => kapat(null));
    }
    document.addEventListener('keydown', kacis);
  });
}

/* ==========================================================================
   5 · ORTAK YARDIMCILAR
   ======================================================================= */

function azHareket() {
  return (
    document.documentElement.dataset.motion === 'off' ||
    matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

const bekle = (ms) => new Promise((c) => setTimeout(c, ms));

/* ==========================================================================
   6 · AKIŞ
   ======================================================================= */

async function ac() {
  /* Sayfalar ÖNCE diziliyor: yükleme ekranı görselleri sayfalardaki
     `<picture>` düğümlerinden okuyor, yani ortada bir sayı olmadan
     sayacak bir şey de yok. */
  await sayfalariDiz();

  const tercih = tercihOku();
  let mod = tercih.mod ?? 'full';
  modAyarla(mod);

  baslat({
    modDegistir: async () => {
      const secim = await modSecici({ kapanabilir: true, secili: mod });
      if (!secim) return;
      mod = secim;
      modAyarla(mod);
      tercihYaz({ mod });
    }
  });

  await yuklemeEkrani();

  if (!tercih.tanitimGoruldu) {
    await tanitimGoster();
    tercihYaz({ tanitimGoruldu: true });
  }

  if (!tercih.mod) {
    mod = await modSecici({ kapanabilir: false, secili: mod });
    modAyarla(mod);
    tercihYaz({ mod });
  }

  /* Sayı artık okunabilir: kabuk `inert` doğmuştu, şimdi kalkıyor. */
  kabuk.removeAttribute('inert');
  kap.focus({ preventScroll: true });
}

ac().catch((hata) => {
  /* Sayı açılamadıysa okuru "%0"da bırakmıyoruz: yükleme ekranı kalkıyor ve
     ne olduğu konsolda yazıyor. */
  console.error('Sayı açılamadı:', hata);
  document.getElementById('loader')?.remove();
  kabuk.removeAttribute('inert');
});
