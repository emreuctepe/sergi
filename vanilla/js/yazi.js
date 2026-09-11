/* ============================================================================
   YAZI — karıştırmayan üç yazı animasyonu
   ----------------------------------------------------------------------------
   `karistir.js`in kardeşi, kopyası değil. O dosya TEK BİR ŞEY yapıyor: metni
   rastgele karakterlerden çözüyor. Sunuşun ilk iki perdesi onunla kuruldu ve
   bütün sayının açılışı o dile bağlandı — ama aynı dil ÜÇÜNCÜ kez kullanılınca
   "efekt" olmaya başlıyor, sonra da görünmez oluyor.

   Buradaki üçü bilerek BAŞKA TÜRLÜ işliyor:

     süpürme   kelimeler soldan sağa bir maskeyle açılıyor. Harf değişmiyor;
               değişen şey ne kadarının GÖRÜNDÜĞÜ. Okur yazıyı daha ilk anda
               doğru okuyor — uzun cümleler için karıştırmanın yapamadığı şey.
     daktilo   metin harf harf UZUYOR. Ötekilerin hiçbirinde satırın boyu
               değişmiyor; burada değişiyor ve iş bu yüzden başka görünüyor.
               Noktalama duraklatıyor (bkz. §DURAKLAR).
     netleşme  kelimeler bulanık ve büyük doğup yerine oturuyor. Tek harfli bir
               olay değil, bütün kelimenin odağa girmesi.

   ────────────────────────────────────────────────────────────────────────────
   İŞ BÖLÜMÜ — ⚠️ İKİSİ CSS, BİRİ JS ve bu tesadüf değil
   ────────────────────────────────────────────────────────────────────────────
   `karistir.js`in başındaki ayrımın aynısı: CSS'in zaten bildiği bir şeyi JS'e
   yaptırmıyoruz.

     süpürme / netleşme   saydamlık, bulanıklık, ölçek, `clip-path` → hepsi CSS
                          geçişi. JS'in tek işi metni birimlere BÖLMEK ve her
                          birime sırasını (`--i`) yazmak; gecikmeyi CSS kuruyor.
     daktilo              gerçek JS işi: hangi harfin ne zaman DOĞACAĞI. CSS'te
                          karşılığı yok (`ch` genişliği orantılı yazıda yalan
                          söylüyor, `steps()` da satır kırılınca dağılıyor).

   ⚠️ SIRALAMA YİNE `setTimeout`. Hareketin kendisi CSS'te olsa bile koreografi
   "şu bitince şu" diye yazılıyor ve o saat `bekle()` — yani bu makinede
   ateşlemeyen `requestAnimationFrame`e ya da `animationend`e bağlı DEĞİL
   (gerekçe: `js/hikaye.js` §SAAT ve `js/karistir.js` §ÇEKİRDEK). Bedeli:
   beyan edilen süre ile CSS'in gerçekte harcadığı süre teorik olarak
   kayabilir. Bu yüzden süreler burada HESAPLANIYOR, elle yazılmıyor —
   `ac()`/`kapat()` kendi süresini döndürüyor ve tezgâh onu ölçüyor.

   ⚠️ `karistir.js`TEN ÜÇ ŞEY ALINIYOR ve bu bilinçli bir bağımlılık. `bekle`,
   `IPTAL` ve `azHareket` bir animasyon ayrıntısı değil, KOREOGRAFİ
   PROTOKOLÜ — iki modül aynı zinciri besliyor ve aynı işaretle kesiliyor.
   Kopyalansaydı asıl kırılan `IPTAL` olurdu: o bir `Symbol` ve iki ayrı kopya
   `===` olmaz, yani `catch (e) { if (e !== IPTAL) throw e }` yazan her
   koreografi sessizce yanlış dala girerdi.
   ========================================================================= */

import { IPTAL, azHareket, bekle } from './karistir.js';

/* ==========================================================================
   BÖLME — metni birimlere ayırır
   --------------------------------------------------------------------------
   ⚠️ `innerHTML` KULLANILMIYOR. Metin işaretlemeden `textContent` ile
   okunuyor; aynı dizeyi HTML olarak geri basmak varlıkları ikinci kez çözerdi
   (`&amp;` → `&`) ve bir gün metne açılı ayraç girse enjeksiyon kapısı olurdu.
   Düğümler tek tek kuruluyor, metin hep `textContent`.

   Boşluklar `<i>`nin DIŞINDA kalıyor: birimler `inline-block` ve satır ancak
   aralarındaki gerçek boşluklardan kırılabiliyor. Boşluk da kutuya girseydi
   uzun cümle taşar, hiç sarmazdı.
   ======================================================================= */

/**
 * `el`i boşaltıp `metin`i birimlere böler. Her birim kendi sırasını `--i`
 * olarak taşıyor; gecikmeyi CSS bundan hesaplıyor.
 *
 * @param {Element} el
 * @param {string}  metin
 * @param {'kelime'|'harf'} [birim='kelime']
 * @returns {Element[]} birim kutuları, soldan sağa
 */
export function bol(el, metin, birim = 'kelime') {
  el.textContent = '';

  /* Ayırıcıyı YAKALAYAN bölme: boşluklar dizide kalıyor ve aralarına aynen
     geri konuyor, yani iki kelime arası ne kadarsa o kadar kalıyor. */
  const parcalar =
    birim === 'harf' ? [...metin] : metin.split(/(\s+)/).filter((p) => p !== '');

  const kutular = [];
  for (const parca of parcalar) {
    if (/^\s+$/.test(parca)) {
      el.append(parca);
      continue;
    }
    const kutu = document.createElement('i');
    kutu.className = 'yz__b';
    kutu.textContent = parca;
    kutu.style.setProperty('--i', String(kutular.length));
    el.append(kutu);
    kutular.push(kutu);
  }

  /* Toplam sayı CSS'in elinde olmalı: "sondan başla" türü gecikmeler
     (`--yz-sira: ters`) ancak `--n` bilinirse yazılabiliyor. */
  el.style.setProperty('--n', String(kutular.length));
  return kutular;
}

/* ==========================================================================
   SÜPÜRME ve NETLEŞME — CSS oynuyor, burası yalnız süreyi biliyor
   --------------------------------------------------------------------------
   Hareketin tarifi `css/sunus.css` §YAZI'da. Buradan geçen üç şey var:
   hangi tür (`data-yz`), hangi yön (`data-yon`), ve iki süre belirteci.

   ⚠️ SÜRE HESAPLANIYOR, BEYAN EDİLMİYOR. Son birim `adim * (n-1)` gecikmeyle
   başlıyor ve `sure` kadar sürüyor; toplam ikisinin toplamı. Elle yazılsaydı
   bir cümleye kelime eklemek sessizce yarıda kesilen bir animasyon üretirdi —
   ve bu göze "hata" diye değil "biraz hızlı" diye görünürdü.
   ======================================================================= */

/** Bir birimin kendi hareketi ne kadar sürüyor (ms). */
const BIRIM_SURE = 620;

/** Komşu birimler arası gecikme (ms). */
const BIRIM_ADIM = 55;

/**
 * Birimlerin toplam süresi.
 *
 * @param {number} n      birim sayısı
 * @param {object} [ayar]
 * @returns {number} ms
 */
export function sureHesapla(n, ayar = {}) {
  const { adim = BIRIM_ADIM, sure = BIRIM_SURE } = ayar;
  return Math.max(0, n - 1) * adim + sure;
}

/**
 * Bir birim öbeğini oynatır ve bitince çözülür.
 *
 * @param {Element} el
 * @param {object}  ayar
 * @param {'supur'|'netles'} ayar.tur
 * @param {'gir'|'cik'}      [ayar.yon='gir']
 * @param {number}  [ayar.adim]     komşu birimler arası gecikme (ms)
 * @param {number}  [ayar.sure]     tek birimin süresi (ms)
 * @param {boolean} [ayar.ters]     son birimden başlar
 * @param {AbortSignal} [ayar.isaret]
 * @returns {Promise<void>}
 */
function oynat(el, n, ayar) {
  const { tur, yon = 'gir', adim = BIRIM_ADIM, sure = BIRIM_SURE, ters = false, isaret } = ayar;

  el.style.setProperty('--yz-adim', `${adim}ms`);
  el.style.setProperty('--yz-sure', `${sure}ms`);
  el.dataset.yzTers = ters ? '1' : '0';
  el.dataset.yz = tur;

  /* ⚠️ YÖN EN SON YAZILIYOR ve bu bir sıra meselesi. `data-yon` CSS
     animasyonunu BAŞLATAN öznitelik; belirteçler ondan önce yerinde olmazsa
     ilk kare varsayılan süreyle koşar ve gecikme kademesi görünmez. */
  el.dataset.yon = yon;

  return bekle(sureHesapla(n, { adim, sure }), isaret);
}

/**
 * Metni birimlere bölüp GİRİŞ hareketini oynatır.
 *
 * @param {Element} el
 * @param {string}  metin
 * @param {object}  ayar  bkz. `oynat`; ayrıca `birim`
 * @returns {Promise<void>}
 */
export function ac(el, metin, ayar = {}) {
  const { birim = 'kelime', isaret } = ayar;
  if (isaret?.aborted) return Promise.reject(IPTAL);

  const kutular = bol(el, metin, birim);

  /* ⚠️ HAREKET KAPALIYSA HİÇ BAŞLAMIYOR — `karistir()`teki kalıbın aynısı ve
     aynı gerekçeyle: yalnız süreyi sıfırlamak yetmezdi, CSS bir kare boyunca
     bulanık/maskeli hâli basar ve okur "bozuk" görürdü. Burada metin doğrudan
     yerinde doğuyor: sayfa eksik değil, sadece sabit. */
  if (azHareket()) {
    el.dataset.yz = ayar.tur ?? 'supur';
    el.dataset.yon = 'durgun';
    return Promise.resolve();
  }

  return oynat(el, kutular.length, { ...ayar, yon: 'gir' });
}

/**
 * Ekrandaki birimleri ÇIKIŞA sokar. `ac()`in bıraktığı kutuları kullanıyor,
 * yeniden bölmüyor: çıkışta metin zaten yerinde.
 *
 * ⚠️ HAREKET KAPALIYSA HİÇ ÇAĞRILMAMALI — dilimin durağan düzeni metnin
 * EKRANDA KALMASI. Yine de savunma var: çağrılırsa hiçbir şey yapmadan
 * dönüyor, boş bir dilim bırakmıyor (bkz. `js/hikaye.js` §git, `bilgi.duragan`).
 *
 * @param {Element} el
 * @param {object}  ayar bkz. `oynat`
 * @returns {Promise<void>}
 */
export function kapat(el, ayar = {}) {
  const { isaret } = ayar;
  if (isaret?.aborted) return Promise.reject(IPTAL);
  if (azHareket()) return Promise.resolve();

  const n = el.querySelectorAll('.yz__b').length;
  return oynat(el, n, { ...ayar, yon: 'cik' });
}

/** Elemanı dinlenme düzenine bırakır: metin yerinde, hiçbir hareket açık değil. */
export function duragan(el, metin, ayar = {}) {
  bol(el, metin, ayar.birim ?? 'kelime');
  el.dataset.yz = ayar.tur ?? 'supur';
  el.dataset.yon = 'durgun';
}

/* ==========================================================================
   DAKTİLO
   --------------------------------------------------------------------------
   §DURAKLAR — ⚠️ SABİT HIZLI DAKTİLO MAKİNE GİBİ OKUNUYOR, insan gibi değil.
   Her harf eşit sürede doğduğunda çıkan şey bir yazı değil bir sayaç: göz
   ritmi fark ediyor ve metni değil hızı izliyor. Gerçek bir yazıda duraklar
   NOKTALAMADA oluyor — cümle biterken el kalkıyor, virgülde kısa bekliyor.

   Aşağıdaki tablo "o karakterden SONRA kaç adım fazladan beklenecek" diyor.
   Sayılar `adim`ın katı, yani hızı değiştirmek ritmi bozmuyor.

   ⚠️ TABLO SÜREYE DE GİRİYOR. `sure` bu duraklarla birlikte hesaplanıyor;
   koreografi ve tezgâhtaki DİLİM SÜRELERİ panosu aynı sayıyı görüyor. Durak
   eklemek dilimi kendiliğinden uzatıyor, elle ayarlamak gerekmiyor.
   ======================================================================= */

const DURAKLAR = { '.': 7, '?': 7, '!': 7, '…': 7, ',': 3, ';': 3, ':': 3, '\n': 9 };

/** Bir harfin varsayılan doğma aralığı (ms). */
const HARF_ADIMI = 34;

/**
 * Daktilo kutusunu kurar: metnin TAM hâlini görünmez bir kopya olarak bırakıp
 * üstüne akan kopyayı koyuyor. Yazılacak elemanı döndürüyor.
 *
 * ⚠️ HAYALET OLMADAN BLOK KAYAR. Daktilonun tek yan etkisi metnin uzaması ve
 * uzayan metin dikeyde ortalanmış bir dilimde her yeni satırda BÜTÜN BLOĞU
 * yukarı iter — yani okunmakta olan satır okunurken yerinden oynar. Yeri
 * baştan ayırmanın alternatifi kutuya sabit bir yükseklik yazmaktı; o sayı
 * yazı tipine, tuval genişliğine ve metnin kendisine bağlı olurdu, yani ilk
 * düzenlemede yalan olurdu. Hayalet aynı işi hiçbir sayı uydurmadan yapıyor.
 *
 * Kurulum BİR KEZ yapılıyor, her oynatışta değil: hayalet metni değişmiyor.
 *
 * @param {Element} el    `.kr__daktilo` kutusu
 * @param {string}  metin
 * @returns {Element} akan kopya — `daktilo()` buna yazıyor
 */
export function hayaletKur(el, metin) {
  el.textContent = '';

  const hayalet = document.createElement('span');
  hayalet.className = 'yz__hayalet';
  hayalet.textContent = metin;
  /* Ekran okuyucu metni İKİ KEZ okumamalı; okunan kopya akan olan. */
  hayalet.setAttribute('aria-hidden', 'true');

  const akan = document.createElement('span');
  akan.className = 'yz__akan';

  el.append(hayalet, akan);
  return akan;
}

/**
 * Bir daktilo tarifi kurar. Hiçbir şeyi DOM'a yazmıyor.
 *
 * `karisim()` ile aynı sözleşme (`{ sure, kare(t), bittiMi(t) }`) ve aynı
 * gerekçeyle saf: `kare()` herhangi bir `t` ile, herhangi bir sırayla
 * çağrılabiliyor — ölçüm döngüsü tam da böyle yapıyor ve rAF'sız çalışıyor.
 *
 * @param {string} metin
 * @param {object} [ayar]
 * @param {number} [ayar.adim]  harfler arası aralık (ms)
 * @returns {{sure: number, kare: (gecen: number) => string,
 *            bittiMi: (gecen: number) => boolean}}
 */
export function daktiloKurgusu(metin, ayar = {}) {
  const { adim = HARF_ADIMI } = ayar;

  /* Her harfin DOĞDUĞU an. Kümülatif: harfin kendi adımı + ondan önce gelen
     karakterin duraklaması. */
  const anlar = new Array(metin.length);
  let t = 0;
  for (let i = 0; i < metin.length; i++) {
    t += adim;
    anlar[i] = t;
    t += (DURAKLAR[metin[i]] ?? 0) * adim;
  }

  /* Son harften sonraki durak da süreye giriyor: cümle noktayla bitiyorsa o
     son nefes de animasyonun parçası. */
  const sure = t;

  return {
    sure,
    kare(gecen) {
      /* Doğrusal arama yerine ikili arama olabilirdi; ölçüldü, metinler 200
         karakterin altında ve fark okunabilirliğe değmiyor. */
      let n = 0;
      while (n < anlar.length && anlar[n] <= gecen) n++;
      return metin.slice(0, n);
    },
    bittiMi(gecen) {
      return gecen >= (anlar[anlar.length - 1] ?? 0);
    }
  };
}

/* Sürücünün kare aralığı (ms). `karistir.js`teki `KARE_ARASI`nın eşi ve aynı
   sebeple `setTimeout`: rAF bu makinede ateşlemiyor. Burada rAF'a hiç
   BAŞVURULMUYOR bile — daktilonun doğal tiki `adim` (34ms) ve o zaten kare
   aralığının üstünde, yani rAF bir şey kazandırmıyor. */
const KARE_ARASI = 16;

/**
 * `el`e `metin`i harf harf yazar.
 *
 * @param {Element} el
 * @param {string}  metin
 * @param {object}  [ayar]
 * @param {number}  [ayar.adim]
 * @param {AbortSignal} [ayar.isaret]
 * @returns {Promise<void>}
 */
export function daktilo(el, metin, ayar = {}) {
  const { adim = HARF_ADIMI, isaret } = ayar;

  if (isaret?.aborted) return Promise.reject(IPTAL);

  el.dataset.yz = 'daktilo';

  if (azHareket()) {
    el.dataset.yon = 'durgun';
    el.textContent = metin;
    return Promise.resolve();
  }

  el.dataset.yon = 'gir';
  el.textContent = '';

  const k = daktiloKurgusu(metin, { adim });

  return new Promise((bitti, iptal) => {
    const t0 = performance.now();
    let saat = 0;

    const kes = () => {
      clearTimeout(saat);
      iptal(IPTAL);
    };
    isaret?.addEventListener('abort', kes, { once: true });

    function ilerle() {
      if (isaret?.aborted) return;

      const gecen = performance.now() - t0;
      el.textContent = k.kare(gecen);

      if (k.bittiMi(gecen)) {
        el.textContent = metin;
        /* İmleç yalnız yazarken yanıyor: durmuş bir daktiloda imleç
           "devam edecek" diye okunur ve okur boşuna bekler. */
        el.dataset.yon = 'durdu';
        isaret?.removeEventListener('abort', kes);
        return bitti();
      }
      saat = setTimeout(ilerle, Math.max(adim, KARE_ARASI));
    }

    ilerle();
  });
}

/**
 * Daktilonun toplam süresi — koreografi dilim süresini bununla topluyor.
 *
 * @param {string} metin
 * @param {object} [ayar]
 * @returns {number} ms
 */
export function daktiloSuresi(metin, ayar = {}) {
  return daktiloKurgusu(metin, ayar).sure;
}
