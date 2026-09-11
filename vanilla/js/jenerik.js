/* ============================================================================
   JENERİK — kapanış akışını kendiliğinden yürüten motor (`son-jenerik`)
   ----------------------------------------------------------------------------
   Bu dosya JENERİĞİ ÇİZMİYOR. Akışın kendisi sayfanın uzunluğu ve perdesi,
   ikisi de CSS (`css/jenerik.css`); okur kaydırdıkça jenerik zaten akıyor.
   Buradaki tek iş o kaydırmayı MOTORLU hâle getirmek: `#pages` sabit bir hızla
   kendi kendine ilerliyor — sayfaya gelindiğinde kendiliğinden, sonrasında
   banttaki düğmeyle.

   Ayrım önemli, çünkü sonucunu belirliyor:

     · JS hiç çalışmasa jenerik yine okunuyor — yalnız düğme gelmiyor.
     · Oynatma bir GÖSTERİ değil, okurun elindeki hareketin sürdürülmesi.
       Durdurulduğu an okur tam kaldığı yerde kalıyor; başa sarma, kilitlenme
       ya da "animasyon bitene kadar bekle" yok.
     · Lisans atıfları (CC BY / CC BY-SA) sayfanın kendi işaretlemesinde
       duruyor — yasal yükümlülük bir düğmeye bağlanamaz.

   ⚠️ `jenerikDugmesiniAyarla` HER KAYDIRMADA ÇAĞRILIYOR, sayfa değişiminde
   değil: `okuyucu.js` §5'i besleyen `guncelle()` her `scroll` olayında
   işliyor. Yani oynatma sürerken motorun kendi kaydırması bu fonksiyonu
   saniyede onlarca kez çağırıyor. Buraya eklenen her şey ya bedava ya da
   `ipucuVerildi` / `otomatikDenendi` gibi tek-seferlik bir bayrağın arkasında
   olmak zorunda.

   ⚠️ SNAP'E DOKUNULMUYOR, bilerek. `okuyucu.js` §6 programatik sıçramalarda
   `scroll-snap-type`ı kapatıyor; burada gerek yok ve kapatmak ZARARLI olurdu.
   Gerekmiyor: jenerik sayfası tuvalden kat kat uzun, yani snap alanı
   snapport'tan büyük — CSS Scroll Snap bu durumda kabın alanın İÇİNDE herhangi
   bir yerde durmasına izin veriyor (sayının bütün uzun sayfaları zaten bu
   sayede ortasında durabiliyor). Zararlı olurdu: kapatılan snap durdurma
   anında geri açılsaydı tarayıcı okuru en yakın snap noktasına, yani sayfanın
   BAŞINA çekebilirdi — durdurmanın bedeli jeneriğin başına dönmek olurdu.

   ⚠️ SAAT `setTimeout`, `requestAnimationFrame` DEĞİL. Sebebi `js/hikaye.js`
   §SAAT ile aynı: bu projenin geliştirme ortamında rAF hiçbir yüzeyde
   ateşlemiyor ve rAF'a gömülü bir adım sınanamaz hâle geliyor. Aşağıdaki
   ayrım da bu yüzden: `ilerlet()` saf bir fonksiyon (girdi: konum, hız, geçen
   süre — çıktı: yeni konum), `surucu` ise onun üstünde ince bir saat. Motor
   Node'da elle çevrilerek sınanabiliyor.

   ⚠️ HIZ TUVALE GÖRE, PİKSELE GÖRE DEĞİL. Sabit bir px/sn telefonda hızlı,
   masaüstünde yavaş olurdu; ölçü "bir kadrajın geçme süresi" (`KADRAJ_SURESI`)
   ve hız ondan türüyor. Jenerik her ekranda aynı tempoda akıyor.
   ========================================================================= */

/* Bir tuval boyu metnin geçme süresi (ms). Ölçü bu: kadro satırları arasındaki
   aralık tuvalin ~%9'u. Düşürmek akışı hızlandırır, okunurluğu düşürür.

   ⚠️ 11000'DEN İNDİ — kullanıcı kararı, tam 1.5 kat (11000 / 1.5). Eski değerde
   saniyede bir isim geçiyordu; şimdi ~1.5. Sayı bilerek `11000 / 1.5` olarak
   duruyor: nereden geldiği okunabilsin, bir dahaki ayarda 7333'ün ne olduğu
   aranmasın. Tempoyu değiştirecek TEK yer burası. */
const KADRAJ_SURESI = 11000 / 1.5;

/* Sayfaya gelindikten ne kadar sonra kendiliğinden başlıyor (ms).
   Sıfır değil, çünkü okur daha yeni indi: ① SON karesi henüz belirdi ve
   gelişin kaydırması sönmedi. Bu aralık o kareyi bir beat olarak tutuyor —
   "sayfa açılır açılmaz kayıyor" değil, "okur baktı, sonra akmaya başladı". */
const OTOMATIK_GECIKME = 1100;

/* Saatin tik aralığı (ms). ~60 Hz. Gerçek ilerleme yine de ÖLÇÜLEN süreden
   hesaplanıyor (`gecen`), bu değerden değil: tarayıcı zamanlayıcıyı kıstığında
   (arka plan sekmesi) jenerik yavaşlamıyor, adımı büyüyor. */
const TIK = 16;

/* Dibe bu kadar kalmışsa "bitti" sayılıyor. Kesirli piksel payı —
   `okuyucu.js` §6'daki `KENAR` ile aynı gerekçe. */
const DIP_PAYI = 2;

/* ==========================================================================
   ÇEKİRDEK — saatsiz, DOM'suz
   --------------------------------------------------------------------------
   Bütün jenerik mantığı bu tek fonksiyonda ve hiçbir tarayıcı nesnesine
   dokunmuyor: aynı girdilerle her zaman aynı çıktıyı veriyor, yani saati elle
   çevirerek sınanabiliyor.
   ======================================================================= */

/**
 * Akışın bir sonraki konumu.
 *
 * @param {object} durum
 * @param {number} durum.konum     şu anki kaydırma konumu (px)
 * @param {number} durum.hiz       px / ms
 * @param {number} durum.gecen     son tikten beri geçen süre (ms)
 * @param {number} durum.enFazla   kabın gidebileceği en son konum (px)
 * @returns {{konum: number, bitti: boolean}}
 */
export function ilerlet({ konum, hiz, gecen, enFazla }) {
  const yeni = Math.min(konum + hiz * Math.max(0, gecen), enFazla);
  return { konum: yeni, bitti: yeni >= enFazla - DIP_PAYI };
}

/** `hikaye.js`, `karistir.js` ve `acilis.js`teki eşlerinin aynısı. Ortak bir
    yardımcıya çıkarılmadı: o dosyalar da birbirinden bağımsız duruyor. */
function azHareket() {
  return (
    document.documentElement.dataset.motion === 'off' ||
    matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/* ==========================================================================
   SÜRÜCÜ
   ======================================================================= */

const dugme = document.getElementById('btn-jenerik');

let kap = null;
let saat = 0; /* setTimeout kimliği; 0 = saat işlemiyor (okuyucu.js kalıbı) */
let sonAn = 0;
let konum = 0;
let ipucuVerildi = false;
let otomatikSaat = 0; /* bekleyen kendiliğinden başlatma; 0 = yok */
let otomatikDenendi = false; /* bir kez kuruldu mu — bkz. §KENDİLİĞİNDEN */

function oynuyorMu() {
  return saat !== 0;
}

function dugmeyiYaz() {
  if (!dugme) return;
  const acik = oynuyorMu();
  dugme.setAttribute('aria-pressed', String(acik));
  dugme.setAttribute('aria-label', acik ? 'Jeneriği durdur' : 'Jeneriği oynat');
  dugme.title = acik ? 'Jeneriği durdur' : 'Jeneriği oynat';
}

function tik() {
  const simdi = performance.now();
  const sonuc = ilerlet({
    konum,
    hiz: kap.clientHeight / KADRAJ_SURESI,
    gecen: simdi - sonAn,
    enFazla: kap.scrollHeight - kap.clientHeight
  });
  sonAn = simdi;
  konum = sonuc.konum;

  /* ⚠️ `behavior: 'instant'` AÇIKÇA yazılıyor. `.pages` CSS'te
     `scroll-behavior: smooth` (canvas.css §sayfa akışı) ve varsayılan `'auto'`
     "anında" değil "elementin kendi kuralına uy" demek — her tik yumuşak bir
     animasyon başlatır, animasyonlar üst üste binerdi. */
  kap.scrollTo({ top: konum, behavior: 'instant' });

  if (sonuc.bitti) {
    dur();
    return;
  }
  saat = setTimeout(tik, TIK);
}

/** Oynatmayı başlatır. Sondaysa önce jeneriğin başına sarar. */
function oyna() {
  if (!kap || oynuyorMu()) return;

  const enFazla = kap.scrollHeight - kap.clientHeight;
  const sayfa = jenerikSayfasi();

  /* Dipteyken basılan düğme "baştan oynat" demek: başka türlü hiçbir şey
     olmazdı ve düğme bozuk görünürdü. Başa sarmak = jenerik sayfasının
     tepesine gitmek, sayının başına değil. */
  if (kap.scrollTop >= enFazla - DIP_PAYI && sayfa) {
    kap.scrollTo({ top: sayfa.offsetTop, behavior: 'instant' });
  }

  konum = kap.scrollTop;
  sonAn = performance.now();
  saat = setTimeout(tik, TIK);
  dugmeyiYaz();
}

/** Saati susturur. Çağrılması her zaman güvenli — saat işlemiyorsa hiçbir şey
    yapmıyor, yani "durdur"u iki kez çağırmak bir hata değil.

    ⚠️ BEKLEYEN OTOMATİK BAŞLATMA DA SUSUYOR ve bu satır `if (!saat)`
    KORUMASININ ÜSTÜNDE olmak zorunda: "durdur" motor daha oynamıyorken de
    çağrılıyor (sayfadan çıkış, sekmenin arkaya düşmesi). O çağrılar arkada
    kurulmuş sayacı iptal edemeseydi jenerik, okur çoktan başka bir sayfaya
    geçmişken kendi kendine akmaya başlardı. */
function dur() {
  otomatigiIptal();
  if (!saat) return;
  clearTimeout(saat);
  saat = 0;
  dugmeyiYaz();
}

function jenerikSayfasi() {
  return document.querySelector('.page[data-page-id="son-jenerik"]');
}

/* ==========================================================================
   KENDİLİĞİNDEN BAŞLAMA
   --------------------------------------------------------------------------
   Okur jenerik sayfasına İLK indiğinde motor kendiliğinden çalışıyor: sayı
   bitiyor ve jenerik, sinemada olduğu gibi, kimse bir düğmeye basmadan akmaya
   başlıyor. Düğme kalkmıyor, anlamı değişiyor — artık başlatan değil durduran.

   ⚠️ BİR KEZ, GERİ DÖNÜŞTE DEĞİL (`otomatikDenendi`). Okur jeneriği durdurup
   önceki sayfaya bakıp geri gelirse motor yeniden çalışmıyor: durdurmak bir
   karardı ve sayfadan çıkmak o kararı geçersiz kılmaz.

   ⚠️ HAREKET KAPALIYSA HİÇ KURULMUYOR — kendiliğinden kayan bir sayfa tam
   olarak `prefers-reduced-motion`ın istemediği şey. Düğmenin gizlenmesiyle
   aynı gerekçe, aynı koşul (`gorunsun`).

   ⚠️ SAYAÇ DOKUNMAYLA İPTAL EDİLMİYOR, bilerek. Edilseydi tekerleğiyle gelen
   okurun sönmekte olan ivmesi sayacı daha ateşlenmeden öldürürdü ve özellik
   en sık kullanılan giriş yolunda hiç çalışmazdı. Yerine ateşleme ânında
   KONUMA bakılıyor: okur hâlâ açılış karesinin yakınındaysa motor gerekli,
   yarım tuvalden fazla ilerlemişse jeneriği zaten kendi eliyle yürütüyor.
   ======================================================================= */

function otomatigiIptal() {
  if (!otomatikSaat) return;
  clearTimeout(otomatikSaat);
  otomatikSaat = 0;
}

function otomatigiKur() {
  otomatikDenendi = true;
  otomatikSaat = setTimeout(otomatikBasla, OTOMATIK_GECIKME);
}

function otomatikBasla() {
  otomatikSaat = 0;

  /* ⚠️ `kap` ATEŞLENİRKEN SORULUYOR, kurulurken değil. Doğrudan jeneriğe
     düşen bir bağlantıda `okuyucu.js` §5 (`guncelle`) §9'dan (`jenerikBaslat`)
     ÖNCE işliyor — yani sayaç kurulurken kap daha atanmamış oluyor. Gecikme
     dolduğunda atanmış durumda. */
  if (!kap || oynuyorMu() || azHareket()) return;

  const sayfa = jenerikSayfasi();
  if (!sayfa) return;
  if (kap.scrollTop - sayfa.offsetTop > kap.clientHeight / 2) return;

  oyna();
}

/* ==========================================================================
   OKURUN ELİ HER ZAMAN ÖNCE GELİR
   --------------------------------------------------------------------------
   Okur tekerleğe, ekrana, bir tuşa ya da herhangi bir düğmeye dokunduğu anda
   motor susuyor. Dinleme YAKALAMA evresinde (`capture`) ve `document`
   üzerinde: bandın düğmeleri tuvalin dışında, içindekiler listesi kabuğun
   dışında — tek tek bağlanmak yerine hepsini kapsayan tek nokta.

   ⚠️ DÜĞMENİN KENDİSİ MUAF. Olmasaydı `pointerdown` oynayan jeneriği
   durdurur, hemen ardından gelen `click` onu yeniden başlatırdı: duraklatma
   düğmesi hiçbir zaman duraklatmazdı.
   ======================================================================= */

function okurDokundu(olay) {
  if (!oynuyorMu()) return;
  if (olay.target instanceof Element && olay.target.closest('#btn-jenerik')) return;
  dur();
}

/* ==========================================================================
   BANT DÜĞMESİ
   ======================================================================= */

/**
 * Düğme yalnız jenerik sayfasında var — `okuyucu.js` §5 her sayfa değişiminde
 * çağırıyor (manga ve sergi düğmeleriyle aynı sözleşme).
 *
 * ⚠️ HAREKET KAPALIYSA DÜĞME HİÇ GELMİYOR. Kendiliğinden kayan bir sayfa tam
 * olarak `prefers-reduced-motion`ın istemediği şey; jenerik de düğmesiz
 * eksilmiyor, çünkü akışı zaten okurun kaydırması yapıyor.
 */
export function jenerikDugmesiniAyarla(sayfa) {
  if (!dugme) return;

  const jenerikMi = sayfa?.dataset?.pageId === 'son-jenerik';
  const gorunsun = jenerikMi && !azHareket();
  dugme.hidden = !gorunsun;

  /* Sayfadan çıkıldıysa motor da susuyor: arkada kayan bir sayfa bırakmak
     okuru başka bir yerde şaşırtırdı. */
  if (!jenerikMi) dur();

  if (gorunsun && !ipucuVerildi) {
    ipucuVerildi = true;
    dugme.dataset.ipucu = 'true';
    setTimeout(() => delete dugme.dataset.ipucu, 2600);
  }

  /* İpucuyla aynı kalıp, aynı tek-seferlik bayrak mantığı — bkz.
     §KENDİLİĞİNDEN ve dosya başlığındaki "her kaydırmada çağrılıyor" uyarısı. */
  if (gorunsun && !otomatikDenendi) otomatigiKur();
}

/** Sayfalar dizildikten SONRA çağrılıyor (`okuyucu.js` §9). */
export function jenerikBaslat(kaydirmaKabi) {
  kap = kaydirmaKabi;
  if (!dugme) return;

  dugme.addEventListener('click', () => (oynuyorMu() ? dur() : oyna()));
  dugmeyiYaz();

  for (const tur of ['wheel', 'touchstart', 'pointerdown', 'keydown']) {
    document.addEventListener(tur, okurDokundu, { capture: true, passive: true });
  }

  /* Sekme arkaya düşerse motor susuyor: dönüldüğünde jenerik bitmiş olmasın.
     ⚠️ `document.hidden` BAŞLANGIÇTA SORULMUYOR, yalnız değişim dinleniyor —
     bu projenin geliştirme ortamında sekme kalıcı olarak `hidden` görünüyor
     (bkz. dosya başlığı) ve sorulsaydı jenerik orada hiç oynamazdı. */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) dur();
  });
}
