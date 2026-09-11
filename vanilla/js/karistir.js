/* ============================================================================
   KARIŞTIR — metni karakter karakter çözülen bir yazıya çevirir
   ----------------------------------------------------------------------------
   `codepen.io/juliangarnier/pen/vEyYdXN`teki anime.js `scrambleText` demosunun
   bağımsız karşılığı. Oradaki kütüphane 118 KB; burada gereken 5 KB, çünkü
   demonun yaptığı işin ÇOĞU JS istemiyor:

     scale / opacity / color / background  → CSS geçişi (data- özniteliği çevir)
     karakterlerin karışması               → BURASI, tek gerçek JS işi

   Bu ayrımı korumak önemli. Buraya bir gün "kutuyu da büyüt" eklenirse modül
   sessizce bir animasyon motoruna dönüşmeye başlar; oysa kutuyu büyütmeyi CSS
   zaten biliyor ve tercihi (`prefers-reduced-motion`) de o biliyor.

   ⚠️ TEK DIŞ BAĞIMLILIĞI YOK — `sahneler.js` gibi kendi başına yeten bir
   modül. `acilis.js`teki `azHareket()`in bir kopyası aşağıda duruyor; ortak
   bir yardımcıya çıkarılmadı çünkü o dosya kabuğun parçası, bu sayfaların.
   ========================================================================= */

/* Demodaki `#!%░▒▓_01`in aynısı. Blok karakterleri bilerek: çoğu yazı tipinde
   tam genişlikte duruyorlar, yani karışma sırasında satırın eni harflere göre
   daha az oynuyor (bkz. §GENİŞLİK). */
export const KARAKTERLER = '#!%░▒▓_01';

/* Karışan metnin ucundaki im. Demoda `░▒▓█`; açılmış kısımla karışan kısım
   arasında görünür bir sınır çiziyor, yoksa yazı "çözülüyor" değil "titriyor"
   gibi okunuyor. */
export const IMLEC = '░▒▓';

/* ==========================================================================
   İPTAL
   --------------------------------------------------------------------------
   Aşağıdaki üç yürütücü (`karistir`, `bekle`, `merkezdenDisa`) isteğe bağlı
   bir `isaret` (`AbortSignal`) alıyor. İptal edildiklerinde söz ÇÖZÜLMÜYOR,
   bu değerle REDDEDİLİYOR.

   ⚠️ AYRIM ÖNEMLİ, süs değil. Koreografiler `await` zinciri olarak yazılıyor:

       await karistir(merkez, 'Kızıl Mevsim', …);
       sahne.dataset.zemin = '2';
       await merkezdenDisa(cevre, …);

   İptal "çözülme" diye davransaydı zincir kaldığı yerden KOŞARDI — terk edilmiş
   bir sahnenin zeminini çevirir, metnini yazar, üstelik yerine yeni gelen
   sahneyle aynı elemanları paylaşıyorsa onun karesini ezerdi. Reddetme zinciri
   olduğu yerde kesiyor; çağıran da `IPTAL`i tanıyıp yutuyor:

       try { await oyna(); } catch (e) { if (e !== IPTAL) throw e; }

   İptal anında elemana SON BİR KARE YAZILMIYOR. Gerekçe aynı: o eleman artık
   başkasının.
   ======================================================================= */

export const IPTAL = Symbol('karistir:iptal');

/* ==========================================================================
   TOHUMLU RASTGELELİK
   --------------------------------------------------------------------------
   ⚠️ HER ŞEY TOHUMLU — gecikmeler de parlayan harfler de. `sahneler.js`in
   başındaki kuralın aynısı: dergi sayfası bir kompozisyondur, her ziyarette
   yeniden zar atılan bir şey değil.

   Bir dönem parlayan harfler `Math.random()`la üretiliyordu ("bu hareket,
   kompozisyon değil" diye). İki sebeple vazgeçildi: aynı sayfa her açılışta
   başka türlü çözülüyordu, ve daha önemlisi ÇIKTI SINANAMIYORDU — aşağıdaki
   `karisim()` ancak deterministik olduğu için ölçülebiliyor. xorshift32'nin
   karesi üç kaydırma; "bedava değil" gerekçesi ölçülünce tutmadı.
   ======================================================================= */

function rng(tohum) {
  let x = tohum || 1;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return ((x >>> 0) % 10000) / 10000;
  };
}

/* ==========================================================================
   AÇILMA SIRASI
   --------------------------------------------------------------------------
   Her karakterin 0–1 arası bir "sırası" var; 0 en önce, 1 en sonra açılıyor.
   Demodaki `from` seçeneğinin karşılığı.
   ======================================================================= */

function siraCikar(uzunluk, kaynak, rastgele, tersine) {
  const dizi = Array.from({ length: uzunluk }, (_, i) => i);
  const son = Math.max(uzunluk - 1, 1);

  let sira;
  if (kaynak === 'sol') sira = dizi.map((i) => i / son);
  else if (kaynak === 'sag') sira = dizi.map((i) => (son - i) / son);
  else if (kaynak === 'rastgele') sira = dizi.map(() => rastgele());
  else {
    /* 'merkez' — ortadan dışa. Mesafe merkeze uzaklık, yarım uzunlukla
       normalleniyor ki iki uç 1'e ulaşsın. */
    const orta = (uzunluk - 1) / 2;
    sira = dizi.map((i) => Math.abs(i - orta) / Math.max(orta, 1));
  }

  /* Demodaki `reversed`ın karşılığı — ve `kaynak`ı değiştirmekle AYNI ŞEY
     DEĞİL. `'merkez'` + `tersine` "dıştan içe" demek; bunu `kaynak`la ifade
     etmenin yolu yok, çünkü 'merkez'in tersi bir yön değil bir sıralama.
     ('sol' için `tersine` gerçekten 'sag'a eşit — orada fazlalık, burada şart.) */
  return tersine ? sira.map((o) => 1 - o) : sira;
}

/* ==========================================================================
   ÇEKİRDEK — saf, zamandan bağımsız
   --------------------------------------------------------------------------
   ⚠️ ZAMANLAMA BİLEREK DIŞARIDA. `karisim()` yalnız şunu biliyor: "t
   milisaniyede metin ne olmalı". Kareyi kim ister, ne sıklıkta ister, hiç
   umurunda değil.

   Bu ayrım süs değil, ZORUNLULUKTU: bu makinede `requestAnimationFrame`
   HİÇBİR YÜZEYDE ateşlemiyor — tarayıcı panelinde de (sekme kalıcı olarak
   `visibilityState: "hidden"`), başsız Chromium'da da (eski ve yeni headless,
   `--virtual-time-budget` ile birlikte; ölçüldü, 400 kare istendi 0 geldi).
   Yani rAF'a gömülü bir karıştırıcı burada SINANAMAZDI. Böyle ayrılınca
   mantığın tamamı saati elle çevirerek doğrulanabiliyor:

       const k = karisim('sErgi', 'Kızıl Mevsim', { sure: 900 });
       k.kare(450);        // yarı yolda metin ne?
       k.kare(k.sure);     // sonunda hedefe eşit mi?

   Genişlik zıplaması ölçümü de bunu kullanıyor (bkz. `tezgah-karistir.html`):
   kareler sırayla basılıp `getBoundingClientRect()` okunuyor — rAF'sız,
   eşzamanlı, gerçek düzen motorunda.
   ======================================================================= */

/**
 * Bir karıştırma tarifi kurar. Hiçbir şeyi DOM'a yazmıyor.
 *
 * @param {string} basla            eldeki metin
 * @param {string} hedef            varılacak metin ('' ise metin dağılıp gider)
 * @param {object} ayar
 * @param {number} ayar.sure        toplam süre (ms)
 * @param {string} ayar.kaynak      'merkez' | 'sol' | 'sag' | 'rastgele'
 * @param {boolean} ayar.tersine   açılma sırasını ters çevirir ('merkez' ile
 *                                 birlikte "dıştan içe" demek)
 * @param {string} ayar.karakterler karışma sırasında parlayacak havuz
 * @param {string} ayar.imlec       açılma sınırındaki im ('' ise havuzdan parlar)
 * @param {number} ayar.titresim    gecikmelere binen düzensizlik (0–1)
 * @param {number} ayar.aralik      parlayan harflerin tazelenme aralığı (ms)
 * @param {number} ayar.tohum       rastgelelik tohumu
 */
export function karisim(basla, hedef, ayar = {}) {
  const {
    sure = 800,
    kaynak = 'merkez',
    tersine = false,
    karakterler = KARAKTERLER,
    imlec = IMLEC,
    titresim = 0,
    aralik = 40,
    tohum = 1
  } = ayar;

  /* Karışma uzunluğu İKİSİNİN UZUNU: kısalan bir yazıda (hedef '' ise) da her
     karakterin dağılacak bir yeri olmalı, yoksa metin karışmadan kayboluyor. */
  const uzunluk = Math.max(basla.length, hedef.length);

  const rastgele = rng(tohum);
  const sira = siraCikar(uzunluk, kaynak, rastgele, tersine);

  /* Gecikme yayılması: karakterlerin AÇILMAYA başlama anları bu payı
     paylaşıyor, kalan pay tek bir karakterin karışma süresi. İkisi toplamda
     `sure` ediyor, yani ayar ne olursa olsun iş söz verilen anda bitiyor. */
  const YAYILMA = 0.65;
  const yayilma = sure * YAYILMA;
  const karisma = sure * (1 - YAYILMA);

  const gecikmeler = sira.map((oran) => {
    const sapma = titresim ? (rastgele() - 0.5) * titresim * yayilma : 0;
    return Math.max(0, oran * yayilma + sapma);
  });

  /* Parlayan harfler `aralik` ms'de bir tazeleniyor, her karede değil: 60fps'te
     her kare yeni harf "çözülen yazı" değil "kar gürültüsü" veriyor. Demodaki
     "Refresh Rate" ayarının karşılığı.

     ⚠️ DİLİME GÖRE ÜRETİLİYOR, akan bir sayaçla değil: `kare()` herhangi bir t
     ile ve herhangi bir sırayla çağrılabilmeli (ölçüm döngüsü tam da böyle
     yapıyor). Sayaç tutulsaydı aynı t iki farklı çıktı verirdi. */
  const parlakDilim = (dilim, i) => {
    const r = rng(tohum + dilim * 7919 + i * 31);
    return karakterler[Math.floor(r() * karakterler.length)];
  };

  return {
    sure,
    uzunluk,

    /** @returns {string} `gecen` ms'de görünmesi gereken metin. */
    kare(gecen) {
      const dilim = Math.floor(gecen / aralik);
      let yazi = '';

      for (let i = 0; i < uzunluk; i++) {
        if (gecen >= gecikmeler[i] + karisma) {
          yazi += hedef[i] ?? '';
        } else if (gecen >= gecikmeler[i]) {
          /* Açılma sınırındaki karakter imleci taşıyor: ilerleme oranına göre
             imlecin kendi karakterleri arasında geziniyor, yani sınır koyudan
             açığa doğru soluyor. */
          if (imlec) {
            const oran = (gecen - gecikmeler[i]) / karisma;
            const j = Math.min(imlec.length - 1, Math.floor(oran * imlec.length));
            yazi += imlec[j];
          } else {
            yazi += parlakDilim(dilim, i);
          }
        } else {
          /* Henüz sırası gelmemiş: eldeki metin duruyorsa o, yoksa parlıyor. */
          yazi += basla[i] ?? parlakDilim(dilim, i);
        }
      }
      return yazi;
    },

    bittiMi(gecen) {
      return gecen >= Math.max(...gecikmeler) + karisma;
    }
  };
}

/* ==========================================================================
   SÜRÜCÜ — çekirdeği rAF'a bağlar, rAF yoksa zamanlayıcıya
   --------------------------------------------------------------------------
   ⚠️ YEDEK SAAT VAR ve sebebi ölçülmüş: bu makinede `requestAnimationFrame`
   hiçbir yüzeyde ateşlemiyor (500ms'de 0 kare; tarayıcı paneli kalıcı olarak
   `visibilityState: "hidden"`, başsız Chromium'da da aynı — bkz. §ÇEKİRDEK).

   Yedek olmadan bunun bedeli yalnız "animasyon görünmüyor" değildi:
   `karistir()` bir SÖZ döndürüyor ve o söz HİÇ ÇÖZÜLMÜYORDU. Yani onu
   `await` eden her koreografi ilk karışmada sessizce asılı kalıyordu —
   sonraki adımlar hiç işlemiyor, hata da yok. Hiç settle olmayan bir söz
   yüzeyin kusuru değil, sürücünün kusurudur.

   Nasıl: rAF ile başlıyor, yanına `RAF_SABRI` kadar bir bekleme koyuyor. İlk
   rAF karesi gelirse bekleme iptal ediliyor ve yedek HİÇ DEVREYE GİRMİYOR —
   sağlıklı bir tarayıcıda ilk kare ~16ms'de geldiği için bu yol hiç
   çalışmıyor. Kare gelmezse zamanlayıcı devralıyor ve geriye dönüş yok:
   geciken bir rAF karesi sonradan gelirse yutuluyor, yoksa iki zincir aynı
   elemana yazardı.

   Kare aralığının kabalığı görünmüyor: `karisim()` parlayan harfleri zaten
   `aralik` (40ms) ile tazeliyor, yani 16ms'lik adım onun altında kalıyor.
   ======================================================================= */

/* Yedek saatin kare aralığı (ms) — ~60fps. */
const KARE_ARASI = 16;

/* İlk rAF karesi bu kadar beklendikten sonra yedek devralıyor (ms). Sağlıklı
   bir tarayıcıda ilk kare ~16ms'de geliyor; 100 o yüzden rahat bir pay. */
const RAF_SABRI = 100;

/**
 * `el`in metnini `hedef`e karıştırarak çevirir. Söz, yazı tam yerine
 * oturduğunda veriliyor. Ayarlar `karisim()`inkiyle aynı, bir fazlası var:
 *
 * @param {AbortSignal} [ayar.isaret] iptal edilirse söz `IPTAL` ile reddedilir
 * @returns {Promise<void>}
 */
export function karistir(el, hedef, ayar = {}) {
  const { isaret } = ayar;
  const basla = el.textContent ?? '';

  if (isaret?.aborted) return Promise.reject(IPTAL);

  /* ⚠️ HAREKET KAPALIYSA HİÇ BAŞLAMIYOR. Yalnız süreyi sıfırlamak yetmezdi:
     döngü yine bir kare boyunca rastgele harf basar ve okur "çöp" görürdü.
     Burada hedef doğrudan yazılıyor — sayfa eksik değil, sadece sabit (aynı
     gerekçe `sayfalar/k-3` başlığında da yazılı). */
  if (azHareket()) {
    el.textContent = hedef;
    return Promise.resolve();
  }

  const k = karisim(basla, hedef, ayar);

  return new Promise((bitti, iptal) => {
    const t0 = performance.now();
    let yedekDevraldi = false;
    let sabir = 0;

    /* İptal dinleyicisi: bir sonraki kareyi beklemiyor, sözü HEMEN reddediyor.
       Döngünün kendisi de `aborted`a bakıyor — ikisi birlikte gerekiyor, çünkü
       yavaş bir kare aralığında iptal ile sonraki adım arasında 16ms var. */
    const kes = () => {
      clearTimeout(sabir);
      iptal(IPTAL);
    };
    isaret?.addEventListener('abort', kes, { once: true });

    /* Geçen süre rAF'ın zaman damgasından değil `performance.now()`tan: iki
       kare kaynağı aynı saate bakmak zorunda, yoksa yedek devraldığında
       animasyon zamanda zıplardı. */
    function ilerle() {
      if (isaret?.aborted) return;

      const gecen = performance.now() - t0;
      if (k.bittiMi(gecen)) {
        el.textContent = hedef;
        clearTimeout(sabir);
        isaret?.removeEventListener('abort', kes);
        return bitti();
      }
      el.textContent = k.kare(gecen);

      if (yedekDevraldi) {
        setTimeout(ilerle, KARE_ARASI);
      } else {
        /* İlk kare geldi: yedeğin beklemesi artık gereksiz. */
        clearTimeout(sabir);
        sabir = 0;
        requestAnimationFrame(rafKaresi);
      }
    }

    /* Yedek devraldıktan sonra gelen gecikmiş rAF karesi YUTULUYOR — yoksa iki
       zincir aynı elemana yazar ve metin titrer. */
    const rafKaresi = () => {
      if (yedekDevraldi) return;
      ilerle();
    };

    requestAnimationFrame(rafKaresi);

    sabir = setTimeout(() => {
      yedekDevraldi = true;
      ilerle();
    }, RAF_SABRI);
  });
}

/* ==========================================================================
   ORTAK YARDIMCILAR
   ======================================================================= */

/** `acilis.js`teki eşinin aynısı — bkz. dosya başlığı. */
export function azHareket() {
  return (
    document.documentElement.dataset.motion === 'off' ||
    matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * `ms` milisaniye bekler. `isaret` verilirse iptalde `IPTAL` ile reddeder ve
 * zamanlayıcıyı söker.
 *
 * @param {number} ms
 * @param {AbortSignal} [isaret]
 * @returns {Promise<void>}
 */
export const bekle = (ms, isaret) =>
  new Promise((bitti, iptal) => {
    if (isaret?.aborted) return iptal(IPTAL);

    const saat = setTimeout(() => {
      isaret?.removeEventListener('abort', kes);
      bitti();
    }, ms);

    function kes() {
      clearTimeout(saat);
      iptal(IPTAL);
    }
    isaret?.addEventListener('abort', kes, { once: true });
  });

/**
 * Bir öbeğin merkeze uzaklıklarını 0–1 arasında ölçer.
 *
 * Izgara ölçüsü elle verilmiyor: her elemanın ekrandaki GERÇEK yeri okunup
 * merkeze uzaklığı hesaplanıyor. Sebebi bu düzene özgü — baklava diliminde
 * satırlar eşit uzunlukta değil, yani "kaçıncı sütun" diye bir sayı yok.
 *
 * ⚠️ DİNLENME DÜZENİNDE ÖLÇÜLMELİ, animasyon başladıktan sonra değil. Metni
 * boşaltılmış bir `<p>` sıfır genişliğe iniyor ve satırın ortasına çöküyor;
 * o anda ölçülen uzaklıkların hepsi birbirine eşit çıkıyor, yani dalga
 * tamamen kayboluyor. Bu tam olarak başa geldi: 2. perdede metin önce
 * boşaltılıp sonra ölçülüyordu ve on söz aynı anda açılıyordu.
 */
export function uzaklikOlc(ogeler) {
  const kutular = ogeler.map((el) => el.getBoundingClientRect());
  const mx = kutular.reduce((t, k) => t + k.left + k.width / 2, 0) / kutular.length;
  const my = kutular.reduce((t, k) => t + k.top + k.height / 2, 0) / kutular.length;

  const ham = kutular.map((k) =>
    Math.hypot(k.left + k.width / 2 - mx, k.top + k.height / 2 - my)
  );
  const enUzak = Math.max(...ham, 1);
  return ham.map((u) => u / enUzak);
}

/**
 * Bir öbeği MERKEZDEN DIŞA gecikmeli sürer. Demodaki
 * `stagger(..., { grid: true, from: 'center' })`in karşılığı.
 *
 * @param {Element[]} ogeler
 * @param {(el: Element, i: number) => Promise<void>} isle
 * @param {object}   ayar
 * @param {number}   ayar.adim        komşu halkalar arası gecikme (ms)
 * @param {boolean}  ayar.tersine     dıştan içe
 * @param {number[]} ayar.uzakliklar  `uzaklikOlc()` çıktısı; verilmezse ŞİMDİ
 *                                    ölçülüyor (bkz. oradaki uyarı)
 * @param {AbortSignal} ayar.isaret   iptalde `IPTAL` ile reddeder
 * @returns {Promise<void[]>} hepsi bitince
 */
export function merkezdenDisa(ogeler, isle, ayar = {}) {
  const { adim = 90, tersine = false, uzakliklar = uzaklikOlc(ogeler), isaret } = ayar;

  /* ⚠️ İŞARET BEKLEMEYE DE GEÇİYOR, yalnız `isle`ye değil: dalganın en dışındaki
     öge bir saniye sonra başlıyor ve iptal tam o aralığa düşerse gecikme
     beklemesi de kesilmek zorunda. Yoksa terk edilmiş dalga dilim değiştikten
     sonra açılmaya devam ederdi. */
  return Promise.all(
    ogeler.map((el, i) => {
      const oran = tersine ? 1 - uzakliklar[i] : uzakliklar[i];
      return bekle(oran * adim * ogeler.length * 0.25, isaret).then(() => isle(el, i));
    })
  );
}
