/* ============================================================================
   GALERİ — "Akıllı Kız" sergisinin gezinmesi (ms-galeri)
   ----------------------------------------------------------------------------
   Tek iş: hangi durakta olduğumuzu tutmak ve değiştiğinde üç şeyi güncellemek
   — şeridin konumu, sayaç, düğmelerin etkinliği. Kaymanın KENDİSİ CSS'te
   (`css/galeri.css`); burası yalnız `--durak` sayısını sürüyor.

   İkinci iş: ORTADAKİ eseri açmak. Şeritteki çerçeve ve altındaki minik künye
   levhası birlikte tek nesne; tıklanınca aynı nesne okunacak boyda, levhasında
   gerçek metinle açılıyor (`.galeri__odak`). Açılan eser bir daha örtülmüyor —
   koridorda hangi tabloya bakıldığı böyle görünüyor.

   ⚠️ SERBEST KAYIŞ (2026-09-06, kullanıcı isteği: "tamamen serbest olsun").
   Sergi artık durak durak ilerlemiyor. İki şey birden kalktı:

     · SNAP — parmak kalkınca en yakın durağa oturma (§SERBEST KAYIŞ ④)
     · KENAR BÖLGELERİ — sağ/sol %30 görünmez düğmeler (sayfa.html'de yorumda)

   Geriye gezmenin iki yolu kaldı:

     · yatay KAYDIRMAK      (parmak şeridi taşıyor, bıraktığı yerde kalıyor)
     · ← → OK TUŞLARI       (yalnız sayfa ekrandayken; araya düşmüşse toparlar)

   Geri almak için bu dosyada §SERBEST KAYIŞ ①-④ diye işaretli dört yer ve
   sayfa.html + uret.py'deki yorum bloğu var; hepsinin eski hâli yanında yazılı.

   ⚠️ Kalkan snap'in bıraktığı iz: şeridin konumu artık tam sayı DEĞİL, yani
   "kaçıncı duraktayız" ile "şerit nerede" ayrı iki sayı (§SERBEST KAYIŞ ①).

   ⚠️ OK TUŞLARI ÇAKIŞMIYOR: `okuyucu.js` yalnız DİKEY okları bağlıyor, burası
   yalnız yatayları. Yatay dinleyici iki durumda sessiz kalıyor:

     · Sayfa GÖRÜNÜR DEĞİLKEN — başka sayfadayken sağ ok görünmeyen bir
       sergiyi ilerletmemeli.
     · Kabuk `inert` iken — manga okuyucusu, içindekiler ve açılış akışı
       arkadaki sayıyı böyle kapatıyor. `okuyucu.js` kendi dinleyicisinde
       zaten `inert`e bakıyor; bu dosya İKİNCİ bir document dinleyicisi
       eklediği için aynı kapıya kendisi de bakmak zorunda. Yoksa bir modal
       açıkken sağ ok perdenin arkasındaki sergiyi yürütürdü.
   ========================================================================= */

/** Sürüklemenin yatay mı dikey mi olduğuna karar vermek için gereken yol. */
const EKSEN_ESIGI = 8;

/* ⚠️ Aşağıdaki iki eşik ŞU AN KULLANILMIYOR: ikisi de kalkan snap'e aitti
   (§SERBEST KAYIŞ ④). Silinmediler çünkü snap geri gelirse ölçülmüş
   değerlerdir ve yeniden tahmin edilmeleri gerekirdi. */

/** Bir durağı devirmek için parmağın bir ADIM'ın yüzde kaçını taşıması gerek. */
const TASIMA_PAYI = 0.22;

/** Kısa ama hızlı bir fiske de saysın: px/ms. */
const FISKE_HIZI = 0.45;

/** Sürükleme bittikten sonra `click`i yutma penceresi. */
const TIKLAMA_PAYI = 300;

/**
 * Serginin başına/sonuna atlayan düğmeler ALT BANTTA duruyor, sayfanın içinde
 * değil (index.html §band__yan--sag). Modül düzeyinde aranıyorlar çünkü
 * `galeriDugmeleriniAyarla` sergi sayfasında OLMADIĞIMIZDA da çağrılıyor —
 * o an `galeriBaslat`ın kapsamı yok.
 *
 * ⚠️ `manga.js`teki `btn-buyut` ile aynı zamanlama sözleşmesi: modül
 * yüklendiğinde bu düğmeler DOM'da olmak zorunda. İkisi de kabuğun statik
 * markup'ında duruyor, üretilen sayfalarda değil.
 */
const sergiDugmeleri = ['btn-sergi-bas', 'btn-sergi-son']
  .map((id) => document.getElementById(id))
  .filter(Boolean);

/**
 * Bantta sergi oklarını okunan sayfaya göre gösterir/gizler. `okuyucu.js` her
 * sayfa değişiminde çağırıyor — `mangaDugmesiniAyarla` ile aynı yerde.
 *
 * Sergi dışındaki 33 sayfada gizli, büyütme düğmesiyle aynı gerekçe:
 * çalışmadığı sayfalarda duran bir düğme yalan söyler.
 */
/**
 * `galeriBaslat` dolduruyor; okur sergiye ilk vardığında öğreticiyi başlatan
 * kanca. Modül düzeyinde duruyor çünkü tetikleyen fonksiyon
 * (`galeriDugmeleriniAyarla`) galerinin kapsamının DIŞINDA — `sergiDugmeleri`
 * ile aynı gerekçe. Sayfa sıradan çıkarılmışsa hiç dolmuyor ve çağrı sessizce
 * boşa gidiyor.
 */
let sergiyeVarildi = () => {};

export function galeriDugmeleriniAyarla(sayfa) {
  const galeriMi = sayfa?.dataset?.kind === 'gallery';
  for (const dugme of sergiDugmeleri) dugme.hidden = !galeriMi;
  if (galeriMi) sergiyeVarildi();
}

function azHareket() {
  return (
    document.documentElement.dataset.motion === 'off' ||
    matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * Künye verisi: her durağın kadrajdaki kutusu ve levhasının metni. `uret.py`
 * sayfanın içine gömüyor (§kunye_verisi); ayrı bir .json dosyası olsaydı
 * kartın ilk açılışında görülebilir bir gecikme olurdu.
 *
 * Bozuk ya da eksik veri sayfayı ÇÖKERTMEMELİ: sergi o durumda gezilebilir
 * kalıyor, yalnız eserler açılmıyor.
 */
function kunyeleriOku(galeri) {
  try {
    const ham = galeri.querySelector('.galeri__veri')?.textContent;
    const veri = JSON.parse(ham ?? '[]');
    return Array.isArray(veri) ? veri : [];
  } catch {
    return [];
  }
}

export function galeriBaslat() {
  const galeri = document.querySelector('.galeri');
  if (!galeri) return; /* sayfa sıradan çıkarılmış olabilir */

  const kamera = galeri.querySelector('.galeri__kamera');
  const serit = galeri.querySelector('.galeri__serit');
  const sayac = galeri.querySelector('.galeri__sayac');
  const bolgeler = [...galeri.querySelectorAll('.galeri__bolge')];
  const balonKatmani = galeri.querySelector('.galeri__balonlar');

  const hedef = galeri.querySelector('.galeri__hedef');
  const odak = galeri.querySelector('.galeri__odak');
  const kart = odak.querySelector('.galeri__kart');
  const kartGorsel = odak.querySelector('.galeri__kart-gorsel');
  const kartYer = odak.querySelector('.galeri__kart-yer');
  const levha = {
    no: odak.querySelector('.galeri__kunye-no'),
    ad: odak.querySelector('.galeri__kunye-ad'),
    alt: odak.querySelector('.galeri__kunye-alt'),
    metin: odak.querySelector('.galeri__kunye-metin')
  };

  /* Kart açıkken arkadaki her şey `inert`: yoksa sekme tuşu perdenin arkasına
     geçer ve odak görünmeyen düğmelerde kaybolur. */
  /* ⚠️ Balon katmanı da listede: CSS onu kart açıkken görünmez yapıyor ama
     görünmezlik odağı durdurmuyor — `inert` olmasaydı klavyeyle kartın
     ARDINDAKİ ziyaretçileri konuşturmak mümkün kalırdı. */
  const arkaKatmanlar = [kamera, hedef, ...bolgeler,
                         galeri.querySelector('.galeri__levha'), balonKatmani];

  const eserler = kunyeleriOku(galeri);
  const adet = Number(galeri.style.getPropertyValue('--adet')) || 1;
  const son = adet - 1;

  /* ── §SERBEST KAYIŞ ① — İKİ SAYI, BİR ZAMANLAR TEKTİ ────────────────────
     Snap'liyken şeridin yeri ile odaktaki eser aynı şeydi: `simdiki` hem
     "kaçıncı duraktayız" hem "şerit nerede" demekti, çünkü şerit tam sayı
     olmayan bir yerde DURAMAZDI — parmak kalkar kalkmaz en yakın durağa
     oturuyordu. Serbest kayışta şerit iki eserin arasında kalabiliyor:

       konum    sürekli, kesirli olabilir      → şeridin gerçek yeri
       simdiki  tam sayı, konum'un yuvarlanmışı → odaktaki eser

     Geri alırken ikisi yeniden tek değişkende birleşiyor.
     ──────────────────────────────────────────────────────────────────────── */
  let konum = 0;
  let simdiki = 0;
  let kilit = false;
  let kilitSaati = 0;

  /** Açık eserin sırası, kart kapalıyken null. */
  let acik = null;

  /* Sürükleme durumu */
  let basim = null; /* {x, y, t, eksen} — parmak yerdeyken dolu */

  /* ⚠️ 0 DEĞİL. `performance.now()` sayfanın açılışından sayıyor; 0 olsaydı
     ilk TIKLAMA_PAYI (300ms) boyunca "az önce sürüklendi" sayılır ve o pencerede
     esere dokunmak sessizce hiçbir şey yapmazdı. */
  let sonSurukleme = -Infinity;

  /** CSS'teki --sure ile ASLA ayrışmasın diye oradan okunuyor. */
  function sure() {
    const ham = getComputedStyle(galeri).getPropertyValue('--sure').trim();
    const n = parseFloat(ham);
    if (!Number.isFinite(n)) return 900;
    return ham.endsWith('ms') ? n : n * 1000;
  }

  /**
   * Bir durak, KAMERA GENİŞLİĞİNİN yüzde kaçı.
   *
   * ⚠️ ÜÇÜNCÜ BİR SAYI OLARAK YAZILMIYOR, ikisinden türetiliyor:
   *
   *     adim/kamera = (ADIM/W) · (W/KAMERA) = --adim-oran · --serit-en/100
   *
   * Sayfaya `--adim-kamera` diye ayrı bir değer de yazılabilirdi ama o değer
   * ötekilerden bağımsız yanlış olabilirdi ve yanlışlığı GÖRÜNMEZDİ: sürükleme
   * çalışmaya devam eder, yalnız şerit parmağın altından kayardı. Türetilmiş
   * hâlinde böyle bir sapma mümkün değil.
   *
   * Yüzde hâli serbest kayışla birlikte gerekti: hedef düğmesinin kutusu
   * sayfada YÜZDE cinsinden yazılı ve şerit yarım durakta dururken o kutuyu
   * aynı birimde kaydırmak gerekiyor (bkz. hedefiYerlestir).
   */
  function adimYuzde() {
    const oran = Number(galeri.style.getPropertyValue('--adim-oran'));
    const en = parseFloat(galeri.style.getPropertyValue('--serit-en'));
    if (!Number.isFinite(oran) || !Number.isFinite(en)) return 100;
    return oran * en;
  }

  /**
   * Aynı adımın piksel hâli — sürüklemede parmağın yolunu durağa çevirmek
   * için. Pencere boyu değişince değişir, o yüzden her sürüklemede yeniden
   * hesaplanıyor.
   */
  function adimPiksel() {
    return (kamera.clientWidth * adimYuzde()) / 100;
  }

  /**
   * Sergi ekranda mı? IntersectionObserver bu iç içe kaydırma kaplarında
   * güvenilir değil; ölçüm tek satır ve tuşa basıldığı an hesaplanıyor.
   */
  function ekranda() {
    const kutu = galeri.getBoundingClientRect();
    const orta = innerHeight / 2;
    return kutu.top < orta && kutu.bottom > orta;
  }

  /** Sayının üstünde bir perde var mı (modal, içindekiler, açılış)? */
  function perdeArkasinda() {
    return galeri.closest('[inert]') !== null;
  }

  /**
   * Okunan sayfa BU MU? Kadraj pencerenin dikey ortasını kapsıyorsa evet.
   *
   * ⚠️ `data-inview` bu soruyu YANITLAMAZ; sayfalar o imle doğuyor ve yalnız
   * yukarıda kalınca "false" oluyor (okuyucu.js §434), yani aynı anda onlarca
   * sayfada birden "true" duruyor. Ölçüldü, 29 sayfa.
   */
  function sergideyiz() {
    const r = galeri.getBoundingClientRect();
    const orta = window.innerHeight / 2;
    return r.top <= orta && r.bottom >= orta;
  }

  /** "03 / 10" — sayaçta da künye levhasında da aynı biçim. */
  function sira(i) {
    return `${String(i + 1).padStart(2, '0')} / ${String(adet).padStart(2, '0')}`;
  }

  /** Odaktaki eser DEĞİŞTİĞİNDE çalışan pahalı yol. Her karede çağrılmıyor. */
  function pultuYaz() {
    sayac.textContent = sira(simdiki);

    /* Bölgeler şu an kapalı (sayfa.html'de yorumda), yani dizi boş ve bu
       döngü boşa dönüyor. Geri açılırlarsa tek satırı değişmeden çalışır. */
    for (const bolge of bolgeler) {
      const yon = Number(bolge.dataset.yon);
      bolge.disabled = yon < 0 ? simdiki === 0 : simdiki === son;
    }

    /* Banttaki atlama düğmeleri UCA bakıyor, komşuya değil: baştaki durakta
       "başa git" sönüyor, sondakinde "sona git". `simdiki` serbest kayışta
       yuvarlanmış durak — şerit 1.6'daysa 2 sayılıyor, iki düğme de açık. */
    for (const dugme of sergiDugmeleri) {
      dugme.disabled = dugme.id === 'btn-sergi-son' ? simdiki === son : simdiki === 0;
    }

    /* Perde işareti yalnız BURADA taşınıyor, hedefiYerlestir'de değil:
       serbest kayışta o fonksiyon her sürükleme karesinde çalışıyor ve on
       çerçevenin özniteliğini kare kare yeniden yazmak boşuna iş olurdu. */
    for (const grup of serit.querySelectorAll('.galeri__tablo')) {
      grup.dataset.durakta = String(Number(grup.dataset.eser) === simdiki);
    }

    hedefiYerlestir();
  }

  /**
   * Görünmez düğmeyi ortadaki eserin üstüne taşır ve o çerçeveyi "durakta"
   * diye işaretler (perdenin fareyle yarıya inmesi ona bakıyor).
   *
   * ⚠️ KUTU SAYFADAN GELİYOR, burada hesaplanmıyor. Çerçeve ölçüleri `uret.py`
   * §CERCEVELER'de ve bu sayıya özel (hepsi 828×554). Burada ikinci bir
   * hesap olsaydı oran değişince düğme yerinde kalırdı.
   */
  function hedefiYerlestir() {
    const eser = eserler[simdiki];
    if (!eser?.kutu) {
      hedef.hidden = true;
      return;
    }
    hedef.hidden = false;
    const [sol, ust, en, boy] = eser.kutu;

    /* ── §SERBEST KAYIŞ ③ — KUTU "TAM ORTADAYKEN" ÖLÇÜLMÜŞ BİR DEĞER ───────
       Snap'liyken şerit her zaman tam durakta dururdu, o yüzden kutu olduğu
       gibi yazılabiliyordu. Serbest kayışta şerit araya oturabiliyor ve
       düğmenin de aradaki fark kadar kayması gerek — yoksa yarım durakta
       görünmez düğme eserin YANINDAKİ DUVARDA kalır: tabloya dokunmak hiçbir
       şey yapmaz, boşluğa dokunmak eseri açar.

       Birimler tutuyor: bir durak `adimYuzde()` kadar kamera genişliği, kutu
       da kamera yüzdesi cinsinden. Eski hâli `${sol}%` idi.
       ──────────────────────────────────────────────────────────────────── */
    const kayma = (konum - simdiki) * adimYuzde();

    galeri.style.setProperty('--eser-sol', `${sol - kayma}%`);
    galeri.style.setProperty('--eser-ust', `${ust}%`);
    galeri.style.setProperty('--eser-en', `${en}%`);
    galeri.style.setProperty('--eser-boy', `${boy}%`);

    /* Aynı değerse dokunulmuyor: bu fonksiyon artık sürükleme boyunca her
       karede çalışıyor ve aria-label'ı durmadan yeniden yazmak ekran
       okuyucuya gereksiz iş çıkarır. */
    const etiket = `${eser.ad} — büyüt`;
    if (hedef.getAttribute('aria-label') !== etiket) {
      hedef.setAttribute('aria-label', etiket);
    }
  }

  /**
   * Şeridi kesirli bir konuma koyar. `konum` ile CSS değişkeni TEK YERDEN
   * yazılıyor: ayrı ayrı yazılsalardı biri ötekinden geride kalabilirdi ve
   * `ortadaki()` şeridin gerçekte olmadığı bir yeri okurdu.
   */
  function serideYaz(deger) {
    konum = deger;
    galeri.style.setProperty('--durak', String(deger));
  }

  /** Kadrajın ortasına en yakın eser — serbest kayışta konumdan TÜRETİLİYOR. */
  function ortadaki() {
    return Math.min(son, Math.max(0, Math.round(konum)));
  }

  /**
   * Şerit kaydıktan sonra odağı toparlar.
   *
   * Odaktaki eser değiştiyse pahalı yolu (sayaç, perde, künye) çalıştırır;
   * değişmediyse yalnız hedef düğmesini şeridin ANLIK yerine taşır. İkinci
   * yarısı serbest kayışın şartı: eser aynı kalsa bile şerit kaydıkça düğme
   * kaymalı.
   */
  function odagiTazele() {
    const orta = ortadaki();
    if (orta !== simdiki) {
      simdiki = orta;
      galeri.dataset.durak = String(simdiki);
      pultuYaz();
    } else {
      hedefiYerlestir();
    }
  }

  /**
   * Şeridi verilen konuma ANİMASYONLA götürür. Snap kalkınca geriye iki
   * çağıran kaldı: ok tuşları ve uçlardaki lastiğin geri dönüşü.
   *
   * ⚠️ §SERBEST KAYIŞ ② — ÖLÇÜT ARTIK `konum`, `simdiki` DEĞİL.
   * Eski hâl şuydu:
   *
   *     const yeni = Math.min(son, Math.max(0, hedef));
   *     if (yeni === simdiki) {
   *       serideYaz(simdiki);   // yarım kalmış sürüklemeyi yerine oturt
   *       return;
   *     }
   *
   * "Zaten oradayız" demenin yolu buydu ve doğruydu, çünkü konum ile eser
   * aynı sayıydı. Artık ayrıştılar: şerit 3.4'teyken simdiki 3 ve git(3)
   * "zaten oradayız" sayılsaydı sol ok şeridi 3'e OTURTAMAZDI.
   */
  function git(hedefKonum) {
    const yeni = Math.min(son, Math.max(0, hedefKonum));
    if (yeni === konum || kilit) return;

    serideYaz(yeni);
    simdiki = ortadaki();
    galeri.dataset.durak = String(simdiki);
    pultuYaz();

    if (azHareket()) return;

    /* Kilit şart: kayma 900ms sürüyor ve o sırada gelen her basış kamerayı
       yarı yolda başka bir yere savururdu. */
    kilit = true;
    clearTimeout(kilitSaati);
    kilitSaati = setTimeout(() => (kilit = false), sure());
  }

  /**
   * Bir ok tuşluk adım. Serbest kayışta şerit iki eserin arasında
   * durabildiği için "bir ileri" iki ayrı şey demek olabiliyor:
   *
   *   konum 3.0  →  sağ ok 4'e, sol ok 2'ye     (tam durakta: komşuya geç)
   *   konum 3.4  →  sağ ok 4'e, sol ok 3'e      (arada: önce toparla)
   *
   * İkinci satır olmasaydı 3.4'te sol ok 2'ye giderdi ve okur yarım bıraktığı
   * 3'ü bir daha ortalayamazdı.
   */
  function adimla(yon) {
    const komsu = yon < 0 ? Math.floor(konum) : Math.ceil(konum);
    git(komsu === konum ? konum + yon : komsu);
  }

  /* ── ESERİ AÇMAK ──────────────────────────────────────────────────────
     Açılınca ekranda iki şey kalıyor: eserin kendisi ve altındaki etiket.
     Koridordaki pervaz gelmiyor — o duvarın parçası, eserin değil (gerekçe
     css/galeri.css §6). Şeritteki levha 24 birim boyunda, oraya gerçek metin
     yazılamaz; sergi yazısının burada olmasının sebebi bu. */

  /** Boş alan levhada HİÇ görünmüyor: yarım künye, yanlış künyeden iyidir. */
  function alanYaz(dugum, metin) {
    dugum.textContent = metin ?? '';
    dugum.hidden = !metin;
  }

  /**
   * "Görüldü" damgası. Perde ve cam yansıması sönüyor, eser aydınlanıyor.
   *
   * ⚠️ OTURUMLUK, localStorage'a yazılmıyor. Sergiyi ikinci kez açan okur
   * koridoru baştan karanlık bulsun diye: "henüz keşfedilmedi" hâli sayfanın
   * bir özelliği değil, o ziyaretin hâli. Hatırlanan bir sergide ikinci
   * gezinti bütün ışıklar yanmış hâlde başlar ve keşfedecek bir şey kalmaz.
   */
  function isaretle(i) {
    const grup = serit.querySelector(`.galeri__tablo[data-eser="${i}"]`);
    if (grup) grup.dataset.gorulen = 'true';
  }

  function ac(i) {
    const eser = eserler[i];
    if (!eser) return;
    acik = i;

    /* Açık balon kartın ardında kalmasın: CSS zaten söndürüyor, ama sayaç
       dönmeye devam ederdi ve kart kapanınca balon yarım süreyle geri gelirdi. */
    hepsiniKapat();

    levha.no.textContent = sira(i);
    levha.ad.textContent = eser.ad;
    alanYaz(levha.alt, eser.alt);
    alanYaz(levha.metin, eser.metin);

    /* Görsel şeritte zaten inmişti; aynı adres önbellekten geldiği için kart
       boş bir kareyle açılmıyor. Yer tutucu yeşil de kartta aynı yeşil. */
    if (eser.dosya) {
      kartGorsel.src = eser.dosya;
      kartGorsel.alt = eser.ad;
      kartGorsel.hidden = false;
      kartYer.hidden = true;
    } else {
      kartGorsel.hidden = true;
      kartGorsel.removeAttribute('src');
      kartYer.hidden = false;
    }

    odak.hidden = false;
    for (const katman of arkaKatmanlar) if (katman) katman.inert = true;

    /* ⚠️ KAYAN KUTU KARTIN KENDİSİ (bkz. css/galeri.css §6), ve aynı düğüm
       bütün eserlere hizmet ediyor. Sıfırlanmasaydı uzun bir metnin dibinde
       ← → ile komşuya geçen okur, yeni eserin ORTASINDAN açılırdı. */
    kart.scrollTop = 0;
    kart.focus({ preventScroll: true });
    isaretle(i);
  }

  function kapat() {
    if (acik === null) return;
    acik = null;
    odak.hidden = true;
    for (const katman of arkaKatmanlar) if (katman) katman.inert = false;
    /* Odak geldiği yere dönüyor: kapatınca okur koridorda kaybolmasın. */
    hedef.focus({ preventScroll: true });
  }

  /** Kart açıkken ← → komşu esere geçiyor; koridor da arkada onunla kayıyor. */
  function komsuyaGec(yon) {
    const yeni = acik + yon;
    if (yeni < 0 || yeni > son || kilit) return;
    git(yeni);
    ac(yeni);
  }

  hedef.addEventListener('click', () => {
    if (performance.now() - sonSurukleme < TIKLAMA_PAYI) return;
    ac(simdiki);
  });

  /* ── KENARDAKİ ESERLER ────────────────────────────────────────────────
     `hedef` yalnız ORTADAKİ eserin üstünde duruyor (tek düğüm, `--eser-*`
     ile taşınıyor). Kadrajda ~2.5 eser göründüğü için kenarda kalan iki
     yarım esere dokunmak hiçbir şey yapmıyordu: okur tabloyu görüyor,
     basıyor, hiçbir şey olmuyordu.

     Çözüm ikinci bir görünmez düğme katmanı DEĞİL — eserin kendisi zaten
     orada duruyor ve kutusu şeridin içinde, `uret.py`nin çizdiği yerde.
     Tek eksik onu dinlemekti (ve perdenin tıklamayı yutması; bkz.
     `galeri.css` §5). Olay şeritte delege ediliyor: on eser için on
     dinleyici yerine bir tane, ve yeni eser eklenirse kendiliğinden
     çalışıyor.

     ⚠️ GEOMETRİ BURADA YOK ve olmamalı. Hangi esere dokunulduğunu tarayıcı
     söylüyor (`closest`), biz hesaplamıyoruz — `hedefiYerlestir`in
     başındaki uyarının aynısı: ikinci bir hesap, ADIM ya da çerçeve oranı
     değiştiği gün sessizce yanlışa düşer.

     `git` + `ac` ikilisi `komsuyaGec`teki sözleşmenin aynısı: eser önce
     kadrajın ortasına geliyor, kart onun üstünde açılıyor. Kapanınca okur
     ortada duran esere bakıyor, kenarda yarım kalana değil.

     KLAVYE BU YOLDAN GEÇMİYOR, bilerek: `<g>` odaklanabilir değil ve on
     eseri sekme sırasına sokmak koridoru on duraklık bir tuzağa çevirirdi.
     Klavyenin yolu zaten daha iyi — oklar şeridi gezdiriyor, `hedef` her
     zaman ortadakini açıyor. Buradaki kazanç yalnız İŞARETLEME cihazları
     için. */
  serit.addEventListener('click', (olay) => {
    if (performance.now() - sonSurukleme < TIKLAMA_PAYI) return;
    if (acik !== null || kilit) return;

    const grup = olay.target.closest?.('.galeri__tablo');
    if (!grup) return; /* duvara dokunuldu */

    const i = Number(grup.dataset.eser);
    if (!Number.isInteger(i) || !eserler[i]) return;

    git(i);
    ac(i);
  });

  odak.addEventListener('click', (olay) => {
    if (olay.target.closest('[data-kapat]')) kapat();
  });

  /* ── DOKUNMA BÖLGELERİ ─────────────────────────────────────────────────
     Sürüklemenin sonunda tarayıcı bir de `click` yolluyor. Yutulmazsa
     parmağını sola kaydıran okur bir durak geri, sonra dokunma bölgesi
     yüzünden bir durak daha ileri giderdi — yani hiç kımıldamazdı. */
  for (const bolge of bolgeler) {
    bolge.addEventListener('click', () => {
      if (performance.now() - sonSurukleme < TIKLAMA_PAYI) return;
      git(simdiki + Number(bolge.dataset.yon));
    });
  }

  /* ── ATLAMA ────────────────────────────────────────────────────────────
     Düğmeler bantta; sürükleme oradan başlayamıyor (bant `bizim()`in dışında)
     ama `TIKLAMA_PAYI` yine de duruyor: parmağını koridorda bırakıp hemen
     banda basan okur iki jesti üst üste bindirebiliyor.

     ⚠️ Kart açıkken atlamak YOK. Kart perdeyle odayı söndürüyor; arkada
     sessizce sergiyi başa sarmak, kapatınca okuru başka bir yerde bırakırdı. */
  for (const dugme of sergiDugmeleri) {
    dugme.addEventListener('click', () => {
      if (acik !== null) return;
      if (performance.now() - sonSurukleme < TIKLAMA_PAYI) return;
      git(dugme.id === 'btn-sergi-son' ? son : 0);
    });
  }

  /* ── BALONLAR ──────────────────────────────────────────────────────────
     Her figürün üç sözü var ve sırayla açılıyorlar: dokun → birinci, tekrar
     dokun → ikinci, üçüncüden sonra başa dönüyor.

     ⚠️ AYNI ANDA TEK BALON. Kadrajda en çok iki figür var, ikisi birden
     konuşabilirdi; açık bırakılmadı çünkü koridor sakin bir sahne ve iki
     kutu aynı anda okunacak bir şey değil, gürültü. Tek istisna konami.

     Kapanma süresi METNE GÖRE: sabit bir süre uzun sözde yetişilmez,
     kısa sözde bekletir kılardı. Kalan süreyi kutunun içindeki şerit
     gösteriyor (galeri.css §3c) — `--bekleme` oradan okunuyor. */
  const balonlar = [...galeri.querySelectorAll('.galeri__balon')];
  const sozler = JSON.parse(
    galeri.querySelector('.galeri__sozler')?.textContent || '[]',
  );

  /** Kaç ms duracak: okuma payı + harf başına pay, iki uçtan kırpılmış. */
  function beklemeSuresi(metin) {
    return Math.min(11000, Math.max(3200, 2000 + metin.length * 46));
  }

  /** Her figürün kaçıncı sözde olduğu. -1 = daha hiç konuşmadı. */
  const sozSirasi = balonlar.map(() => -1);
  let balonSaati = 0;
  let hizaSaati = 0;

  function balonuKapat(balon) {
    balon.dataset.acik = 'false';
    balon.querySelector('.galeri__balon-kutu').hidden = true;
    balon.querySelector('.galeri__balon-dugme').setAttribute('aria-expanded', 'false');
  }

  function hepsiniKapat() {
    clearTimeout(balonSaati);
    clearTimeout(hizaSaati);
    for (const b of balonlar) balonuKapat(b);
    balonKatmani.dataset.gizli = 'false';
  }

  /**
   * Balonu yazıp açar. Süre şeridini yeniden başlatmak için animasyonu
   * KOPARMAK gerekiyor: aynı düğüme ikinci kez basıldığında CSS animasyonu
   * kendiliğinden baştan almıyor, çünkü eleman zaten animasyonlu.
   */
  function balonuAc(balon, metin) {
    const kutu = balon.querySelector('.galeri__balon-kutu');
    /* ⚠️ `sure` DEĞİL: dıştaki `sure()` geçiş süresini veren fonksiyon ve
       aynı adı kullanmak onu bu kapsamda gölgeliyordu. */
    const surePer = balon.querySelector('.galeri__balon-sure');

    balon.querySelector('.galeri__balon-metin').textContent = metin;
    kutu.style.setProperty('--bekleme', `${beklemeSuresi(metin)}ms`);
    kutu.hidden = false;
    balon.dataset.acik = 'true';
    balon.querySelector('.galeri__balon-dugme').setAttribute('aria-expanded', 'true');

    surePer.style.animation = 'none';
    void surePer.offsetWidth; /* yeniden akıt */
    surePer.style.animation = '';
  }

  /**
   * EMNİYET PAYI. Balon figürün üstünde ortalanıyor; tıklanan figür kadrajın
   * ortasına getirildiği için normalde taşma olmuyor. Ama uçtaki iki figür
   * ortalanamıyor (koridorun başından öncesi yok) ve orada kutunun yarısı
   * dışarı düşebiliyor — sayfa kırpıyor, metnin sonu kayboluyor.
   *
   * ⚠️ ŞERİT DURDUKTAN SONRA ölçülmek zorunda: kayma sürerken
   * `getBoundingClientRect` ara kareyi verir ve pay yanlış yere düşer.
   */
  function kadrajaSigdir(kutu) {
    kutu.style.setProperty('--balon-kaydir', '0px');
    const kadraj = galeri.getBoundingClientRect();
    const k = kutu.getBoundingClientRect();
    const pay = kadraj.width * 0.03;
    let kaydir = 0;
    if (k.right > kadraj.right - pay) kaydir = kadraj.right - pay - k.right;
    if (k.left + kaydir < kadraj.left + pay) kaydir = kadraj.left + pay - k.left;
    if (kaydir) kutu.style.setProperty('--balon-kaydir', `${Math.round(kaydir)}px`);
  }

  /**
   * Figüre sıradaki sözünü söyletir ve söylenen metni döndürür.
   *
   * Hem dokunma hem öğretici BURADAN geçiyor. İki ayrı yol yazılsaydı ikisi de
   * `sozSirasi`yi kendi bildiği gibi ilerletir ve okur öğreticiden sonra
   * figüre dokunduğunda söz atlanır ya da tekrarlanırdı.
   */
  function konustur(i) {
    const balon = balonlar[i];
    const veri = sozler[i];
    if (!balon || !veri) return null;

    hepsiniKapat();

    /* "Sıradakini söyle" — açıkken de kapalıyken de sırayı ilerletiyor.
       Kapatma düğmesi YOK ve gerekmiyor: balon kendi süresi dolunca kapanıyor. */
    sozSirasi[i] = (sozSirasi[i] + 1) % veri.sozler.length;
    const metin = veri.sozler[sozSirasi[i]];

    /* ⚠️ ÖNCE KONUŞANI ORTAYA GETİR. Kenardaki bir figüre dokunan okur
       balonu yarım görürdü; şerit onu kadrajın ortasına kaydırıyor ve
       söz orada okunuyor. `merkez` sayfadan geliyor (uret.py, ADIM ve
       KAMERA orada yaşıyor), burada ikinci bir geometri hesabı yok. */
    git(veri.merkez);
    balonuAc(balon, metin);

    /* Emniyet payı şerit DURDUKTAN sonra ölçülüyor; kayarken ölçülse ara
       kareye göre hesaplanırdı. Uçtaki figürler ortalanamıyor, pay onlar
       için var. */
    clearTimeout(hizaSaati);
    hizaSaati = setTimeout(
      () => kadrajaSigdir(balon.querySelector('.galeri__balon-kutu')),
      sure() + 40,
    );

    balonSaati = setTimeout(hepsiniKapat, beklemeSuresi(metin));
    return metin;
  }

  balonlar.forEach((balon, i) => {
    balon.querySelector('.galeri__balon-dugme').addEventListener('click', () => {
      if (performance.now() - sonSurukleme < TIKLAMA_PAYI) return;
      if (acik !== null) return; /* kart açıkken koridorda konuşan yok */

      /* Okur kendi başlattı: öğretici sıraya karışmasın. */
      ogreticiyiDurdur();
      konustur(i);
    });
  });

  /* ── ÖĞRETİCİ ──────────────────────────────────────────────────────────
     Sergiye ilk varışta ilk ziyaretçi kendiliğinden konuşuyor ve İKİ söz
     söylüyor. Sözler zaten öğretici olarak yazılmış (`uret.py` §KONUŞMALAR):

       0 · "Galeri de gezinmek için sağa-sola kaydır."
       1 · "Eserlere detaylı bakmak için tabloya tıkla."

     İkisi de koridorun KEŞFEDİLMESİ GEREKEN iki jestini anlatıyor; hiçbir
     görünür düğme onları söylemiyor. Üçüncü söz öğreticiye ait değil (bir
     karakter repliği), o yüzden dizi ikide bitiyor — sayı `SOZ_ADEDI`de.

     ⚠️ TETİK `galeriBaslat` DEĞİL. Sayfa sıraya dizilirken galeri de
     kuruluyor ama okur o an kapakta: orada başlatılsaydı öğretici otuz sayfa
     uzakta, kimse bakmadan oynar ve bir daha oynamazdı. Tetik okuyucunun
     sayfa değişimi (`galeriDugmeleriniAyarla`) — sergiye GERÇEKTEN varınca.

     ⚠️ Bir kez oynuyor: `ogreticiOynadi` sayfa yeniden yüklenene kadar
     duruyor. Kalıcı bir kayıt (localStorage) BİLEREK yok — öğretici sergiden
     çıkıp dönen okuru rahatsız etmiyor ama yeni bir oturumda yine karşılıyor;
     iki jest de sayının başka hiçbir yerinde geçmiyor ve hatırlanacağı
     varsayılamaz. */
  const OGRETICI_SOZ_ADEDI = 2;
  const OGRETICI_GECIKME = 900; /* sayfa otursun, sonra konuşsun */
  const OGRETICI_ARA = 520; /* balon kapandıktan sonraki nefes */

  let ogreticiOynadi = false;
  let ogreticiSaati = 0;

  /** Öğreticiyi iptal eder. Okurun her müdahalesi burayı çağırıyor. */
  function ogreticiyiDurdur() {
    clearTimeout(ogreticiSaati);
    ogreticiSaati = 0;
    ogreticiOynadi = true; /* iptal de "oynadı" sayılıyor: geri gelmesin */
  }

  function ogreticiyiOynat(kalan = OGRETICI_SOZ_ADEDI) {
    /* Her adımda yeniden bakılıyor, yalnız başlarken değil: okur ilk balon
       dururken sayfayı çevirmiş, kart açmış ya da modal açmış olabilir. */
    if (kalan <= 0 || acik !== null || perdeArkasinda() || !sergideyiz()) return;

    const metin = konustur(0);
    if (metin === null) return;

    ogreticiSaati = setTimeout(
      () => ogreticiyiOynat(kalan - 1),
      beklemeSuresi(metin) + OGRETICI_ARA,
    );
  }

  sergiyeVarildi = () => {
    if (ogreticiOynadi) return;
    ogreticiOynadi = true;
    clearTimeout(ogreticiSaati);
    ogreticiSaati = setTimeout(() => ogreticiyiOynat(), OGRETICI_GECIKME);
  };

  /* ── GİZLİ DİZİ ────────────────────────────────────────────────────────
     Ödül: yedi figür AYNI ANDA gizli sözünü söylüyor — tek balon kuralının
     tek istisnası, çünkü şaka zaten "oda birden cevap verdi".

     ⚠️ GERÇEK KONAMİ DİZİSİ BU SAYIDA ÇALIŞMIYOR, denendi. `okuyucu.js`
     ArrowUp/ArrowDown'ı SAYFA ÇEVİRMEK için kullanıyor (§tuslar): ilk iki
     tuşta okur galeriden çıkıyor, `sergideyiz()` false oluyor ve dizi orada
     ölüyor. Yukarı/aşağıyı yutmak çözüm değil — iki kez yukarı basmak sayfa
     geri gitmenin olağan yolu ve onu bir easter egg için bozmak olmaz.

     O yüzden dizi ↑↓'siz: yalnız galeride kalan tuşlar. Sol/sağ okları
     koridoru gezdiriyor ve YUTULMUYOR — kayması zararsız, üstelik diziyi
     girene bir şeylerin olduğunu gösteren tek geri bildirim o. */
  const KONAMI = ['arrowleft', 'arrowleft', 'arrowright', 'arrowright',
                  'arrowleft', 'arrowright', 'b', 'a'];
  let konamiYeri = 0;

  document.addEventListener('keydown', (olay) => {
    if (!sergideyiz() || perdeArkasinda()) return;

    const tus = olay.key.toLowerCase();
    konamiYeri = tus === KONAMI[konamiYeri] ? konamiYeri + 1 : (tus === KONAMI[0] ? 1 : 0);
    if (konamiYeri < KONAMI.length) return;

    konamiYeri = 0;
    hepsiniKapat();
    balonKatmani.dataset.gizli = 'true';

    let enUzun = 0;
    balonlar.forEach((balon, i) => {
      const gizli = sozler[i]?.gizli;
      if (!gizli) return;
      balonuAc(balon, gizli);
      enUzun = Math.max(enUzun, beklemeSuresi(gizli));
    });
    balonSaati = setTimeout(hepsiniKapat, enUzun);
  });

  /* ── SÜRÜKLEME ────────────────────────────────────────────────────────
     Eksen kilidi: ilk EKSEN_ESIGI pikselde yönü tayin ediyoruz. Yatay
     çıkarsa jesti biz alıyoruz; dikey çıkarsa tamamen bırakıyoruz ve dergi
     her zamanki gibi dikey kayıyor. Karar bir kez veriliyor, çünkü parmak
     yol boyunca eğrilir ve her karede yeniden karar verilseydi sahne
     dikeyle yatay arasında gidip gelirdi.

     `touch-action: pan-y` (galeri.css §1) bunun yarısını zaten tarayıcıda
     hallediyor: dikey pan tarayıcının, yatay hareket bizim.

     ⚠️ DİNLEYİCİLER SECTION'DA DEĞİL, DOCUMENT'TE — ve bu İKİNCİ taşıma.
     Önce kameradaydılar; kamera, dokunma bölgeleri ve hedef düğmesi KARDEŞ
     olduğu için olay kameraya kabarmıyordu ve kaydırma yalnız ortadaki %40'ta
     çalışıyordu. Section'a alınınca tuvalin tamamı gezilir oldu, ama tuval
     kendisi 3:4 ve ekranda ORTALANMIŞ: yanlarda kalan şeritler section'ın
     dışında, doğrudan <body>. Ölçüldü — 737px'lik pencerede her yanda 89px,
     yani genişliğin %24'ü sürüklemeye kapalıydı (2026-09-07 kullanıcı isteği).

     Şimdi kapı `bizim()`de: olay ya galerinin İÇİNDEN geliyor, ya da doğrudan
     <body>/<html> üstünden — marj tam olarak o ikisi, arada başka eleman yok.
     Dikey bant da kontrol ediliyor, yoksa sayfanın üstündeki başlık ve
     altındaki gezinme çubuğu da sergiyi kaydırırdı. */

  /**
   * Marj: tuvalin dışındaki şerit. `elementFromPoint` orada <body> veriyor —
   * section ile <body> arasında başka eleman yok, ölçüldü.
   *
   * ⚠️ `data-inview` BURADA KULLANILAMAZ, görünürlük sanmayın. Sayfalar o
   * imle DOĞUYOR ve yalnız yukarıda kalınca "false" oluyor (okuyucu.js §434),
   * yani "bir kez görüldü" mandalı: ölçtüm, aynı anda 29 sayfada birden
   * "true" duruyor. Kapı ona dayansaydı galeri ekranda olmasa bile marjdaki
   * her yatay jesti bu sergi yutardı.
   *
   * Gerçek ölçüt kadrajın kendisi: galeri pencerenin dikey ORTASINI
   * kapsıyorsa okunan sayfa odur.
   */
  function marjda(olay) {
    if (olay.target !== document.body && olay.target !== document.documentElement)
      return false;
    if (!sergideyiz()) return false;
    const r = galeri.getBoundingClientRect();
    return olay.clientY >= r.top && olay.clientY <= r.bottom;
  }

  /** Jest bu sergiye mi ait? İçeriden geliyorsa evet, marjdan geliyorsa belki. */
  function bizim(olay) {
    return galeri.contains(olay.target) || marjda(olay);
  }

  document.addEventListener('pointerdown', (olay) => {
    if (olay.button !== 0 || kilit || acik !== null || perdeArkasinda()) return;
    if (!bizim(olay)) return;
    /* Okur koridora dokundu: öğreticiyi anlatmaya devam etmesine gerek yok,
       zaten öğrendi. Balon dizisi burada kesiliyor. */
    ogreticiyiDurdur();
    /* `konum` da saklanıyor: sürükleme artık son DURAKTAN değil, parmağın
       bastığı ANDAKİ yerden ölçülüyor — şerit yarım durakta duruyor olabilir. */
    basim = { x: olay.clientX, y: olay.clientY, t: performance.now(), eksen: null, konum };
  });

  document.addEventListener('pointermove', (olay) => {
    if (!basim) return;
    const dx = olay.clientX - basim.x;
    const dy = olay.clientY - basim.y;

    if (basim.eksen === null) {
      if (Math.abs(dx) < EKSEN_ESIGI && Math.abs(dy) < EKSEN_ESIGI) return;
      basim.eksen = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      if (basim.eksen === 'y') {
        basim = null; /* dikey: jest dergiye ait, biz karışmıyoruz */
        return;
      }
      galeri.setPointerCapture(olay.pointerId);
      galeri.dataset.suruklerken = 'true';

      /* Açık balon şeritle birlikte kayıyor ama kadraja sığdırma payı
         AÇILIRKEN ölçülmüştü; kayınca o pay yanlış yere düşüyor. Yeniden
         ölçmek yerine kapatılıyor: sürükleyen okur zaten balonu değil
         koridoru istiyor. Eksen kilitlendikten SONRA, yani dikey jestte
         balon açık kalıyor. */
      hepsiniKapat();
    }

    /* Uçlarda lastik: sergi bitmişken parmak hâlâ çekiyorsa şerit üçte bir
       kadar geliyor. Hiç gelmeseydi okur sürüklemenin çalışmadığını sanırdı;
       tam gelseydi olmayan bir durak varmış gibi dururdu. */
    let yeni = basim.konum - dx / adimPiksel();
    if (yeni < 0) yeni /= 3;
    else if (yeni > son) yeni = son + (yeni - son) / 3;
    serideYaz(yeni);

    /* Ortadaki eser artık sürükleme BİTİNCE değil, sürerken değişiyor:
       görünmez hedef düğmesi ve sayaç şeride yapışık kalmalı. */
    odagiTazele();
  });

  function birak(olay) {
    if (!basim) return;
    const eksen = basim.eksen;
    basim = null;

    if (eksen !== 'x') return;
    sonSurukleme = performance.now();

    /* ── §SERBEST KAYIŞ ④ — SNAP TAM BURADAYDI ────────────────────────────
       Eski hâl: parmak kalkınca şerit en yakın durağa oturur, taşıma payını
       ya da fiske hızını aşan her jest tam bir durak devirirdi:

           const dx = olay.clientX - basim.x;
           const gecen = Math.max(1, performance.now() - basim.t);
           const hiz = Math.abs(dx) / gecen;
           const yeter = Math.abs(dx) > adimPiksel() * TASIMA_PAYI || hiz > FISKE_HIZI;
           git(yeter ? simdiki - Math.sign(dx) : simdiki);

       ⚠️ Geri alırken `basim = null` satırı bu üç `const`tan SONRAYA
       taşınmalı — yoksa `basim.x` ve `basim.t` okunamaz. Yukarıdaki
       `olay` parametresi de yalnız onlar için duruyor.
       ──────────────────────────────────────────────────────────────────── */

    yerineOturt();
  }

  /**
   * Sürükleme bitti: şerit parmağın bıraktığı yerde KALIYOR. Geri verilen
   * tek şey uçlardaki lastik.
   *
   * ⚠️ `data-suruklerken`i KAPATMA SIRASI ÖNEMLİ — ikisi iki ayrı yerde
   * kapanıyor ve sebebi galeri.css §3'teki söz: hedef düğmesi şeritle AYNI
   * anda varmalı, yoksa okur çerçeveye dokunurken yandaki duvara dokunmuş
   * olur. Snap'liyken ikisi de 900ms boyunca birlikte kayardı; serbest
   * kayışta şerit parmak kalkınca ZATEN YERİNDE, düğme ise `--eser-sol`
   * yeniden yazıldığı için hâlâ geçişli. Sıra bozulursa düğme eserin
   * ardından 900ms süzülür ve o sürede tabloya dokunmak hiçbir şey yapmaz.
   */
  function yerineOturt() {
    const yerinde = Math.min(son, Math.max(0, konum));

    if (yerinde !== konum) {
      /* Lastikten dönüş: şerit animasyonla geliyor, düğme de onunla gelsin. */
      galeri.dataset.suruklerken = 'false';
      git(yerinde);
      return;
    }

    /* Şerit yerinde: düğmeyi geçiş HÂLÂ KAPALIYKEN yaz, sonra geçişi aç. */
    odagiTazele();
    void hedef.offsetWidth; /* yazılan konumu şimdi işlet — yoksa tarayıcı
                               ikisini tek hesapta birleştirir ve geçiş açık
                               sayılıp düğme yine süzülür. */
    galeri.dataset.suruklerken = 'false';
  }

  /* ⚠️ Bunlar da document'te ve `basim` dışında kapı YOK — bilerek. Jest bir
     kez bizim sayıldıktan sonra parmağın nerede kalktığı önemli değil: marjdan
     başlayıp tuvalin üstünde biten (ya da tersi) sürükleme normal. Kapı yalnız
     pointerdown'da; buraya da konsaydı parmak sınırı geçtiğinde şerit ortada
     donar, `data-suruklerken` açık kalırdı. */
  document.addEventListener('pointerup', birak);
  document.addEventListener('pointercancel', () => {
    /* Tarayıcı jesti geri aldı (dikey pan başladı, ya da sistem araya girdi).
       Eski hâl `serideYaz(simdiki)` ile en yakın durağa oturuyordu — o da bir
       snap'ti. Serbest kayışta şerit bulunduğu yerde kalıyor, yalnız lastik
       geri veriliyor. */
    if (basim?.eksen === 'x') yerineOturt(); /* bayrağı o kapatıyor — sıra önemli */
    basim = null;
  });

  /* ── OK TUŞLARI ───────────────────────────────────────────────────────── */

  document.addEventListener('keydown', (olay) => {
    if (olay.defaultPrevented || perdeArkasinda()) return;
    if (olay.metaKey || olay.ctrlKey || olay.altKey) return;

    /* Bir alana yazı yazılıyorsa oklar okurun değil metnin. */
    if (olay.target.closest?.('input, textarea, select') || olay.target.isContentEditable) return;

    /* Kart açıkken oklar koridorda değil eserler arasında geziyor: perdenin
       arkasında görünmeyen bir kamerayı yürütmek okura hiçbir şey söylemez.
       `ekranda()` de sorulmuyor — kart zaten ekranda olduğu için açık. */
    if (acik !== null) {
      if (olay.key === 'Escape') {
        olay.preventDefault();
        kapat();
      } else if (olay.key === 'ArrowRight') {
        olay.preventDefault();
        komsuyaGec(1);
      } else if (olay.key === 'ArrowLeft') {
        olay.preventDefault();
        komsuyaGec(-1);
      }
      return;
    }

    if (!ekranda()) return;

    /* Eski hâl `git(simdiki ± 1)` idi; serbest kayışta şerit arada
       durabildiği için adım `adimla()`ya taşındı (gerekçe orada). */
    if (olay.key === 'ArrowRight') {
      olay.preventDefault();
      ogreticiyiDurdur(); /* okur koridoru kendi yürütüyor */
      adimla(1);
    } else if (olay.key === 'ArrowLeft') {
      olay.preventDefault();
      ogreticiyiDurdur();
      adimla(-1);
    }
  });

  serideYaz(0);
  pultuYaz();
}
