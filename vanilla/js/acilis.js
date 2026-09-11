/* ============================================================================
   AÇILIŞ — yükleme ekranı, mod seçimi
   ----------------------------------------------------------------------------
   Sayfanın TEK giriş noktası (`index.html`in sonundaki script). Okuyucunun
   kendisi `okuyucu.js`te; burada yalnız sayının nasıl AÇILDIĞI var.

   Akış:
     her ziyaret      → Yükleme (görseller + fontlar inene kadar)
     mod seçilmemiş   → Yükleme → Mod seçimi → sayı
     dönen okur       → Yükleme → sayı, kendi modunda

   Hiçbiri sunucu istemiyor: yükleme görsel sayıyor, mod seçimi CSS sınıfı
   değiştiriyor. "Altyapı" diye bir şey yok.
   ========================================================================= */

import { MODLAR, baslat, modAyarla, sayfalariDiz, yenidenOlc } from './okuyucu.js';

const kabuk = document.getElementById('shell');
const kap = document.getElementById('pages');

/* ==========================================================================
   1 · TERCİHLER
   --------------------------------------------------------------------------
   Kayıtta iki alan var, ikisi de bu cihaza ait: hangi modda okuyor ve hangi
   temada. Buradan yalnız `mod` okunuyor; `tema`yı `index.html`in <head>'indeki
   betik okuyor, çünkü ona bu dosya çalışmadan ÖNCE gerek var.
   Okuru tanımıyoruz, hesap yok, sunucuya hiçbir şey gitmiyor.

   Okuma ve yazma HİÇ HATA ATMIYOR: localStorage gizli sekmede ya da sıkı
   gizlilik ayarında erişilemez oluyor ve orada patlayan bir tercih okuma,
   sayıyı hiç açılmaz hâle getirirdi.
   ======================================================================= */

/* ⚠️ `index.html`in <head>'indeki tema betiği de bu anahtarı okuyor. İkisi
   ayrışırsa tema sessizce hatırlanmaz olur. */
const ANAHTAR = 'vanilla:sergi:v1';

function tercihOku() {
  try {
    const ham = JSON.parse(localStorage.getItem(ANAHTAR) ?? '{}');
    return {
      mod: MODLAR.some((m) => m.id === ham.mod) ? ham.mod : null
    };
  } catch {
    return { mod: null };
  }
}

/**
 * ⚠️ HAM KAYDIN ÜSTÜNE yazıyor, `tercihOku()`nun üstüne DEĞİL.
 *
 * `tercihOku` bir SÜZGEÇ: tanıdığı alanları doğrulayıp döndürüyor, geri
 * kalanını atıyor. Birleştirme onun çıktısı üzerinden yapılınca, süzgecin
 * bilmediği her alan ilk yazmada siliniyordu — tema tam olarak böyle
 * kayboldu: okur temayı seçiyor (`{tema}` yazılıyor), sonra modu seçiyor
 * (`{mod}` yazılıyor) ve ikinci yazma birincinin üstünü örtüyordu.
 *
 * Ham kaydın üstüne yazmak bunu yapısal olarak imkânsız kılıyor: yarın
 * eklenecek bir alan da kendiliğinden korunuyor.
 */
function tercihYaz(yama) {
  try {
    const ham = JSON.parse(localStorage.getItem(ANAHTAR) ?? '{}');
    localStorage.setItem(ANAHTAR, JSON.stringify({ ...ham, ...yama }));
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
   3 · MOD SEÇİCİ
   --------------------------------------------------------------------------
   İki ayrı soru soruyor ve ikisi AYNI biçimde soruluyor: bir önizleme karesi,
   altında tek kelime. Kutuların ÇERÇEVESİ ortak (ölçü, köşe, seçili halkası),
   İÇLERİ değil — okuma modunda ortada modun simgesi, görünümde kâğıdın rengini
   taşıyan bir sayfa taklidi.

   Okuma modunun bir de açıklaması var ama YALNIZ SEÇİLİ OLANINKİ, kutuların
   altında tek satır. Burada bir dönem her kartın kendi tanıtım cümlesi,
   açıklama satırı ve "~9 dk / 30 sayfa" künyesi vardı; o biçim seçenekleri
   karşılaştırılacak metin blokları hâline getiriyordu, oysa iki kutu yan yana
   duruyorsa fark BAKARAK görülüyor. Tek satır başka bir iş yapıyor: karşılaştır
   demiyor, "şu an buradasın"ı anlatıyor — bu yüzden seçimle birlikte
   değişiyor ve bu yüzden tek.

   ⚠️ HİÇBİR SEÇİM MODALI KAPATMIYOR. Kapatma kararı okurun: ✕, Escape, perde
   ya da açılıştaki "Sayıyı aç" düğmesi. Mod seçimi bir dönem TIKLANINCA
   KAPATIYORDU ("tek bir karar, verilince iş biter" diye yazılmıştı) ama o
   gerekçe temayı da kapsamalıydı ve kapsamıyordu: aynı ekranda iki soru
   varken biri tıklayınca kaçıyor, öbürü duruyordu. Kaçan taraf iki şeyi birden
   imkânsız kılıyor — modu seçtikten sonra temaya dokunmayı, ve "seçtim ama
   öbürüne de bir bakayım"ı.

   Bunun bedeli: seçim ARTIK GERİ ALINAMIYOR. Tıklanan mod da tema da anında
   uygulanıp anında kaydediliyor, yani Escape "vazgeç" değil yalnızca "kapat"
   demek. Doğrusu bu: okur sonucu arkadaki sayıda zaten görüyor, bir de
   onaylaması istenseydi görmediği bir şeyi onaylıyor olurdu.

   Açılıştaki tek fark, kapatma yolunun hangisi olduğu:
     ilk açılış → ✕ / Escape / perde YOK, altta "Sayıyı aç" düğmesi var.
                  Kapatmak hâlâ okurun elinde ama kazara olmuyor; sayıyı
                  açmak bilinçli bir hareket kalıyor.
     çipten     → ✕, Escape ve perde çalışıyor. Burada okur zaten sayının
                  içinde, kapanış onun bildiği yollardan olmalı.
   ======================================================================= */

/* Aydınlık/karanlık dışında üçüncü bir "sistem" seçeneği bilerek YOK. Sistem
   tercihini izlemek, okurun buradan verdiği kararı ne zaman ezeceği belirsiz
   bir üçüncü ses eklemek olurdu. Varsayılan (karanlık) `index.html`in
   <head>'inde, bir kez. */
const TEMALAR = [
  { id: 'dark', ad: 'Karanlık' },
  { id: 'light', ad: 'Aydınlık' }
];

/** Şu anki tema — kaynağı DOM, çünkü onu <head>'deki betik yazıyor. */
function temaOku() {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

function temaAyarla(tema) {
  document.documentElement.dataset.theme = tema;
  tercihYaz({ tema });
}

/** Tema gibi mod da ANINDA uygulanıp anında kaydediliyor (bkz. §3 başlığı). */
function modSec(mod) {
  modAyarla(mod);
  tercihYaz({ mod });
}

/**
 * Her modun simgesi ve açıklaması.
 *
 * Simge kutunun ASIL içeriği, süsü değil: kutuda bir dönem sahte metin
 * satırları vardı ve simge köşede duruyordu, orada süs gibi okunuyordu. Sayfa
 * taklidi yalnız TEMA kutularında kaldı — orada sorulan şey gerçekten sayfanın
 * görünüşü.
 *
 * Açıklama kutunun İÇİNDE değil, ALTINDA ve tek tane: yalnız SEÇİLİ modunki
 * yazılıyor (bkz. §3 başlığı). Ses kaldırılan kartlardan devralındı.
 *
 * ⚠️ METİNLER SAYIDAN BAĞIMSIZ OLMALI. Bu dosya kabuğun parçası, içeriğin
 * değil: sayı her ay değişiyor, bu satırlar değişmiyor. Devraldıkları hâlde
 * "manga, foto-öykü ve bulmaca kısalmaz", "söyleşinin yedi sayfası" gibi
 * 2026-09'un bölümlerini sayıyorlardı — mangası olmayan ilk sayıda sessizce
 * yalan olurlardı. Yerlerine modun KURALI yazılı: neyin kısaldığı, neyin
 * kalmadığı. Buraya yeni bir cümle eklerken ölçü şu — cümle önümüzdeki sayı
 * için de doğru mu?
 *
 * Modun ADI buraya yazılmıyor, `MODLAR`dan geliyor: çipteki ad ile seçicideki
 * ad ayrışırsa okur aynı şeyi iki isimde görürdü. Buraya yalnız `MODLAR`da
 * olan bir mod eklenir; karşılığı unutulursa o modun kutusu boş çıkar, yani
 * hata ilk bakışta görünür.
 */
const MOD_KUTUSU = {
  min: {
    simge: '🫠',
    aciklama:
      'Sosyal medya kullanmaktan beyni sıvı olanlar için. Uzun yazılar kısa özetlerine iniyor, görsel bölümler olduğu gibi kalıyor.'
  },
  full: {
    simge: '🧠',
    aciklama:
      'Hâlâ uzun metin okuyabilen üst insanlar için. Her yazı tam uzunluğunda, kısaltılmış hiçbir bölüm yok.'
  }
};

/**
 * Bir önizleme karesi. İki soruya iki farklı iç veriyor, dış çerçeve aynı:
 *
 *   SİMGE (okuma modu) → kutunun ortasında tek bir emoji, başka hiçbir şey.
 *   SAYFA (tema)       → `satir` tane sahte metin satırı, sağ altta vurgu
 *                        renginden bir nokta.
 *
 * Ortak kalan şey kutunun kendisi: ölçüsü, köşesi, seçili halkası. İki soru
 * böylece aynı dilde konuşuyor ama aynı şeyi göstermiyor.
 *
 * `sinif` yalnız tema kutularında dolu (`pv--light` / `pv--dark`); okuma modu
 * kutuları o anki temanın renklerinde kalıyor, çünkü orada sorulan şey renk
 * değil modun kimliği.
 */
function onizleme({ sinif = '', satir = 0, simge = '' }) {
  const ic = simge
    ? `<i class="pv__simge">${simge}</i>`
    : `${Array.from({ length: satir }, () => '<i class="pv__satir"></i>').join('')}
       <i class="pv__nokta"></i>`;
  return `
    <span class="${sinif ? `pv ${sinif}` : 'pv'}" aria-hidden="true">
      <span class="pv__kagit${simge ? ' pv__kagit--simge' : ''}">${ic}</span>
    </span>`;
}

/** Bir gruptaki basılı hâli tek düğmeye taşır. İki soru da aynı işi yapıyor. */
function basiliHal(dugmeler, secilen) {
  for (const d of dugmeler) {
    const secili = String(d === secilen);
    d.dataset.active = secili;
    d.setAttribute('aria-pressed', secili);
  }
}

/**
 * İki sorunun da düğmesi aynı iskelet.
 *
 * `data-active` VE `aria-pressed` birlikte: ilki `overlays.css`in seçili
 * kutuyu boyadığı kanca (§SEÇİCİLER), ikincisi ekran okuyucununki. Burada önce
 * yalnız `aria-pressed` yazılıyordu ve seçili seçenek hiç vurgulanmıyordu —
 * CSS'in beklediği öznitelik hiç doğmuyordu.
 */
function secenekDugmesi({ oznitelik, id, ad, secili, kutu }) {
  return `
    <button class="pick__opt" type="button" ${oznitelik}="${id}"
            data-active="${secili}" aria-pressed="${secili}">
      ${kutu}
      <span class="pick__ad">${ad}</span>
    </button>`;
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

  const modDugmeleri = MODLAR.map((m) =>
    secenekDugmesi({
      oznitelik: 'data-mod',
      id: m.id,
      ad: m.ad,
      secili: m.id === secili,
      kutu: onizleme({ simge: MOD_KUTUSU[m.id].simge })
    })
  ).join('');

  const simdikiTema = temaOku();
  const temaDugmeleri = TEMALAR.map((t) =>
    secenekDugmesi({
      oznitelik: 'data-tema',
      id: t.id,
      ad: t.ad,
      secili: t.id === simdikiTema,
      kutu: onizleme({ sinif: `pv--${t.id}`, satir: 3 })
    })
  ).join('');

  /* Grupların adı `aria-labelledby` ile GÖRÜNEN etiketten geliyor, ayrı bir
     `aria-label` yazılmıyor: iki yerde duran aynı metin bir gün ayrışır ve ekran
     okuyucu ekranda yazmayan bir başlık okur. Aynı anda tek modal yaşadığı için
     (`ac()` de çip de bu sözü bekliyor) sabit `id`ler çakışmıyor. */
  host.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true" aria-label="Nasıl okumak istersin?">
      <header class="modal__head">
        <h2 class="modal__title">Nasıl okumak istersin?</h2>
        ${kapanabilir ? '<button class="modal__x" type="button" aria-label="Kapat">✕</button>' : ''}
      </header>
      <div class="pick" role="group" aria-labelledby="pick-mod">
        <span class="pick__etiket" id="pick-mod">Okuma</span>
        <div class="pick__sira">${modDugmeleri}</div>
        <p class="pick__aciklama" aria-live="polite">${MOD_KUTUSU[secili].aciklama}</p>
      </div>
      <div class="pick" role="group" aria-labelledby="pick-tema">
        <span class="pick__etiket" id="pick-tema">Görünüm</span>
        <div class="pick__sira">${temaDugmeleri}</div>
      </div>
      ${
        kapanabilir
          ? ''
          : '<div class="modal__alt"><button class="modal__ac" type="button">Sayıyı aç</button></div>'
      }
    </div>`;

  document.body.append(perde, host);
  requestAnimationFrame(() => {
    perde.dataset.on = 'true';
    host.dataset.on = 'true';
  });
  host.querySelector('.pick__opt').focus({ preventScroll: true });

  return new Promise((bitti) => {
    /* Kapanışta dönen değer, o an SEÇİLİ olan mod. "Hangi düğmeye basıldı"
       değil: seçim zaten uygulanmış oluyor ve okur hiç dokunmadan da
       kapatabiliyor, o durumda geçerli cevap içeri girdiği moddur. */
    let simdikiMod = secili;

    const kapat = () => {
      perde.dataset.on = 'false';
      host.dataset.on = 'false';
      document.removeEventListener('keydown', kacis);
      setTimeout(
        () => {
          perde.remove();
          host.remove();
          bitti(simdikiMod);
        },
        azHareket() ? 0 : 240
      );
    };

    const kacis = (olay) => {
      if (olay.key === 'Escape' && kapanabilir) kapat();
    };

    /* İki grup da aynı şeyi yapıyor: seçimi anında uygula, basılı hâli taşı,
       modalı AÇIK BIRAK (§3 başlığı). */
    const aciklama = host.querySelector('.pick__aciklama');
    const modDugmeleri = [...host.querySelectorAll('.pick__opt[data-mod]')];
    for (const dugme of modDugmeleri) {
      dugme.addEventListener('click', () => {
        simdikiMod = dugme.dataset.mod;
        modSec(simdikiMod);
        basiliHal(modDugmeleri, dugme);
        aciklama.textContent = MOD_KUTUSU[simdikiMod].aciklama;
      });
    }

    const temaDugmeleri = [...host.querySelectorAll('.pick__opt[data-tema]')];
    for (const dugme of temaDugmeleri) {
      dugme.addEventListener('click', () => {
        temaAyarla(dugme.dataset.tema);
        basiliHal(temaDugmeleri, dugme);
      });
    }

    if (kapanabilir) {
      host.querySelector('.modal__x').addEventListener('click', kapat);
      perde.addEventListener('click', kapat);
    } else {
      host.querySelector('.modal__ac').addEventListener('click', kapat);
    }
    document.addEventListener('keydown', kacis);
  });
}

/* ==========================================================================
   4 · ORTAK YARDIMCILAR
   ======================================================================= */

function azHareket() {
  return (
    document.documentElement.dataset.motion === 'off' ||
    matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

const bekle = (ms) => new Promise((c) => setTimeout(c, ms));

/* ==========================================================================
   5 · AKIŞ
   ======================================================================= */

async function ac() {
  /* Sayfalar ÖNCE diziliyor: yükleme ekranı görselleri sayfalardaki
     `<picture>` düğümlerinden okuyor, yani ortada bir sayı olmadan
     sayacak bir şey de yok. */
  await sayfalariDiz();

  const tercih = tercihOku();
  let mod = tercih.mod ?? 'full';
  modAyarla(mod);

  /* Modal seçimi kendi içinde uygulayıp kaydediyor (`modSec`), burada yalnız
     "hangi moddayız" hatırlanıyor — bir sonraki açılışta seçili kutu doğru
     olsun diye. */
  baslat({
    modDegistir: async () => {
      mod = await modSecici({ kapanabilir: true, secili: mod });
    }
  });

  await yuklemeEkrani();

  if (!tercih.mod) {
    mod = await modSecici({ kapanabilir: false, secili: mod });
    /* ⚠️ Kayıt BURADA da yazılıyor, `modSec()` yazıyor olsa bile: hiçbir kutuya
       dokunmadan "Sayıyı aç"a basan okur için `modSec()` hiç çalışmıyor ve
       varsayılan mod kaydedilmemiş kalırdı — sayı her açılışta bu ekranı bir
       daha sorardı. */
    tercihYaz({ mod });
  }

  /* ⚠️ ÖLÇÜM BURADA TAZELENİYOR — `baslat()`teki ilk ölçüm artık bayat.
     Yeri bilinçli: okur gezinme yetkisini bir sonraki satırda kazanıyor, yani
     düzeni değiştirebilecek her şey (yükleme ekranı, mod seçici) ARKADA kaldı.
     Daha erken ölçmek yetmezdi, çünkü aradaki iki perde de kapanırken düzeni
     oynatabiliyor.

     Bayatlığın kaynağı sıranın kendisi: yukarıdaki `baslat()` çağrısı ölçüyor,
     ondan hemen sonraki `yuklemeEkrani()` `document.fonts.ready`i ve BÜTÜN
     görselleri bekliyor. Beklediği şey, ölçümü geçersiz kılan şeyin ta kendisi —
     söyleşi çizimleri ızgara gözünde (akışta) ve `width`/`height` taşımıyor,
     inmeden önce yükseklikleri sıfır.

     Kaydırma ölçümü zaten tazeliyordu (`okuyucu.js` §419) ama HİÇ kaydırmamış
     okur oraya uğramıyor: sayı açıldı, içindekiler açıldı, bir bölüme basıldı.
     O yolda hedef ıskalanıyor ve okur bir önceki sayfada kalıyordu. */
  yenidenOlc();

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
