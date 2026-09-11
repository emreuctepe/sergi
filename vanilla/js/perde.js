/* ============================================================================
   PERDE — yazının arkasındaki sahne: SVG'yi satır içine indirir
   ----------------------------------------------------------------------------
   Sunuş sayfası bir dönem düz renklerin üstünde duruyordu (`--paper`,
   `--accent`, `--paper-sunken`). Renkler demodan ölçülerek seçilmişti ve
   perdeyi BÖLÜMLERE ayırma işini hâlâ onlar görüyor — ama düz bir renk altı
   dilim boyunca bakılacak bir şey değil. Sayının elinde zaten on çizim var
   (`assets/2026-09/akilli-kiz/`); bu modül onları zeminin üstüne, yazının
   altına koyuyor.

   ────────────────────────────────────────────────────────────────────────────
   ⚠️ NEDEN `<img>` DEĞİL: KATMANLAR
   ────────────────────────────────────────────────────────────────────────────
   `background-image: url(04.svg)` tek satırlık olurdu ve İŞE YARAMAZDI:
   dışarıdan yüklenen bir SVG'nin içine CSS giremiyor. Bu sayfada istenen tam
   olarak o — dağın ayrı, ayın ayrı, sudaki halkaların ayrı süzülmesi. Bir
   sahneyi "canlı" yapan şey bütününün kayması değil, katmanlarının BİRBİRİNE
   GÖRE kayması.

   Satır içine indirmenin bedeli dosyanın iki kez yaşaması olurdu (biri
   `assets/`te, biri işaretlemede) — o yüzden kopyalanmıyor, FETCH EDİLİYOR.
   `tezgah-karistir.html`in sayfayı kopyalamak yerine fetch etmesiyle aynı
   gerekçe: iki kopya ilk düzenlemede ayrışır.

   ⚠️ ÇİZİMLER YER TUTUCU. Dosyaların içinde öyle yazıyor: Ece Özgür'ün asıl
   çizimleri gelince bu dosyalar DEĞİŞECEK ve sunuşun arkası kendiliğinden
   değişecek. Burada hiçbir şeye dokunmak gerekmiyor — bu modül çizimin ne
   olduğunu bilmiyor, yalnız kaç katmanı olduğunu sayıyor.

   ────────────────────────────────────────────────────────────────────────────
   İÇERİKTEN HABERSİZ — `hikaye.js` ile aynı sözleşme
   ────────────────────────────────────────────────────────────────────────────
   Hangi perdenin hangi dilimde açılacağını BİLMİYOR. O eşleme koreografinin
   işi (`js/sunus.js` §PERDELER) ve oradan `kap.dataset.perde` yazılarak
   söyleniyor; hangisinin görüneceğine CSS karar veriyor (`css/sunus.css`
   §PERDE). Burada yalnız "dosyaları getir, sahneye koy, katmanları numarala"
   var.
   ========================================================================= */

/* ⚠️ SAHNENİN KENDİ ORANI TUTULMUYOR. Çizimler 828×554 (yatay 3:2), tuval ise
   3:4 (dikey). `meet` kullanılsaydı sahne tuvalin ortasında bir bant olarak
   dururdu ve üstü altı boş kalırdı; `slice` kadrajı DOLDURUYOR, taşan yanlar
   kırpılıyor. Arka plan için doğru olan bu: kırpılan şey kompozisyon değil,
   zemin. */
const KADRAJ = 'xMidYMid slice';

/* Getirilen dosyalar burada duruyor: aynı çizim iki perdede kullanılabiliyor
   (`ay` hem açılışta hem kapanışta) ve ikinci kez ağa çıkmanın anlamı yok.
   Anahtarı YOL, ad değil — iki ad aynı dosyayı gösterirse tek istek yetiyor. */
const BELLEK = new Map();

/**
 * Bir SVG dosyasını getirir ve `<svg>` kök ögesini çözer.
 *
 * @param {string} yol
 * @returns {Promise<SVGSVGElement>}
 */
async function getir(yol) {
  if (!BELLEK.has(yol)) {
    /* Söz önbelleğe HEMEN giriyor, çözülmesi beklenmiyor: aynı dosyayı isteyen
       iki perde arka arkaya kurulunca ikisi de aynı sözü paylaşsın. Yanıt
       beklenip sonra saklansaydı iki istek birden çıkardı. */
    BELLEK.set(
      yol,
      (async () => {
        const cevap = await fetch(yol);
        if (!cevap.ok) throw new Error(`perde okunamadı (${cevap.status}): ${yol}`);
        const belge = new DOMParser().parseFromString(await cevap.text(), 'image/svg+xml');

        /* DOMParser bozuk girdide throw ETMİYOR, `<parsererror>` taşıyan bir
           belge döndürüyor. Bakılmasaydı ekrana hata metninin kendisi
           basılırdı. */
        if (belge.querySelector('parsererror')) throw new Error(`perde bozuk: ${yol}`);
        return belge.documentElement;
      })()
    );
  }

  /* ⚠️ HER ÇAĞRIYA KOPYA. Bellekteki düğüm ŞABLON; olduğu gibi verilseydi
     ikinci perde onu birinciden söküp alırdı (bir düğüm aynı anda iki yerde
     duramaz) ve ilk perde sessizce boşalırdı. */
  return (await BELLEK.get(yol)).cloneNode(true);
}

/**
 * Getirilen SVG'yi sahneye uygun hâle getirir ve katmanlarını numaralar.
 *
 * @param {SVGSVGElement} svg
 * @param {string} ad
 * @returns {SVGSVGElement}
 */
function hazirla(svg, ad) {
  svg.setAttribute('class', 'kr__sahne');
  svg.setAttribute('preserveAspectRatio', KADRAJ);
  svg.dataset.perde = ad;

  /* Dosyalarda `width="828" height="554"` yazıyor. Kalsaydı SVG kendi piksel
     ölçüsünde durur, CSS'in `inset: 0`ı boşa giderdi. `viewBox` duruyor —
     ölçeklemeyi o yapıyor. */
  svg.removeAttribute('width');
  svg.removeAttribute('height');

  /* Perde bir resim değil DOKU: ekran okuyucuya söyleyeceği bir şey yok ve
     içindeki onlarca şekil odak sırasına girmemeli. */
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');

  /* ⚠️ GETİRİLEN İŞARETLEME SAHNEYE ÇIPLAK GİRMİYOR. Bu dosyalar depomuzun
     içinde ve bugün zararsızlar; ama "fetch et, DOM'a koy" kalıbı bir gün
     dışarıdan indirilmiş bir SVG ile de kullanılır. `<script>` bir SVG'nin
     içinde tamamen geçerli ve satır içine alındığında ÇALIŞIR. İki satırlık
     temizlik, hatırlanması gereken bir kural olmasından ucuz. */
  for (const tehlike of svg.querySelectorAll('script, foreignObject')) tehlike.remove();

  /* Katman numaraları: CSS gecikmeyi, süzülme hızını ve derinliği bundan
     hesaplıyor (bkz. `css/sunus.css` §PERDE). `children` yorumları atlıyor,
     yani dosyaların başındaki "YER TUTUCU" notu sayıya girmiyor.

     ⚠️ `<g>` TEK KATMAN SAYILIYOR ve bu doğru olan. `09.svg`de otuz iki yağmur
     çizgisi bir `<g>`nin içinde duruyor; tek tek numaralansalardı otuz iki
     ayrı süzülme başlardı ve yağmur "yağmur" olmaktan çıkıp gürültü olurdu.
     Gruplanmış olan birlikte hareket etmeli — çizimi yapan da onları o yüzden
     gruplamış. */
  const katmanlar = [...svg.children];
  katmanlar.forEach((katman, i) => katman.style.setProperty('--i', String(i)));
  svg.style.setProperty('--n', String(katmanlar.length));

  return svg;
}

/**
 * Perdeleri kurar ve sahneye ekler.
 *
 * ⚠️ BİR PERDE GELMEZSE HİKÂYE DURMUYOR. Eksik dosya konsola yazılıyor ve o
 * dilim düz zeminiyle oynuyor — `.kr`ın kendi `background`ı yerinde duruyor ve
 * perde onun ÜSTÜNE biniyor, altına değil. Yani perde katmanı tamamen
 * silinse bile sayfa bir dönem neye benziyorsa ona benziyor.
 *
 * @param {Element} sahne                `.kr` kutusu
 * @param {Record<string, string>} liste ad → dosya yolu
 * @returns {Promise<{perdeler: Map<string, SVGSVGElement>, sec: (ad: string) => void}>}
 */
export async function perdeleriKur(sahne, liste) {
  /* Kap işaretlemede duruyor, burada üretilmiyor: JS inmezse de sayfanın
     yapısı dosyaya bakarak anlaşılabilmeli (aynı gerekçe `ed-sunus`taki 23
     kopyanın elle yazılmasında da yazılı). */
  const kap = sahne.querySelector(':scope > .kr__perdeler');
  if (!kap) {
    console.warn('perdeleriKur(): .kr__perdeler bulunamadı, perde kurulmuyor');
    return { perdeler: new Map(), sec: () => {} };
  }

  const girisler = Object.entries(liste);
  const sonuclar = await Promise.allSettled(
    girisler.map(([ad, yol]) => getir(yol).then((svg) => hazirla(svg, ad)))
  );

  const kurulan = new Map();
  sonuclar.forEach((sonuc, i) => {
    const [ad] = girisler[i];
    if (sonuc.status !== 'fulfilled') {
      console.warn(`perdeleriKur(): "${ad}" kurulamadı —`, sonuc.reason);
      return;
    }
    kap.append(sonuc.value);
    kurulan.set(ad, sonuc.value);
  });

  /* ⚠️ SEÇİM BİR FONKSİYON, CSS SEÇİCİSİ DEĞİL. Perdelerin adları içerik
     kararı; `css/sunus.css`e adların listesi yazılsaydı yeni bir sahne eklemek
     iki dosyayı birden düzenlemek olurdu. `.hik__dilim`in `data-on`u da aynı
     kalıpta (bkz. `js/hikaye.js` §git).

     Kapatmak da açmak kadar önemli: görünmeyen perdenin katman animasyonları
     `data-on` düşünce sönüyor (bkz. `css/sunus.css` §PERDE), yani bir kerede
     yalnız bir sahnenin on katmanı koşuyor — altı değil. */
  const sec = (ad) => {
    if (ad != null && !kurulan.has(ad)) {
      console.warn(`perde: "${ad}" diye bir perde yok — dilim düz zeminle oynayacak`);
    }
    for (const [perdeAdi, svg] of kurulan) {
      svg.dataset.on = String(perdeAdi === ad);
    }
  };

  return { perdeler: kurulan, sec };
}
