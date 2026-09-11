/* ============================================================================
   SUNUŞ — `ed-sunus` sayfasının koreografisi
   ----------------------------------------------------------------------------
   İçerik `sayfalar/ed-sunus/sayfa.html`de, kabuk `js/hikaye.js`te, harfleri
   çözen motor `js/karistir.js`te, öbür üç yazı animasyonu `js/yazi.js`te,
   arkadaki sahne `js/perde.js`te. BURADA YALNIZ KOREOGRAFİ VAR: hangi metin,
   hangi sırayla, hangi zeminde, hangi perdenin önünde, ve her dilim kaç
   milisaniye sürüyor.

   ⚠️ BU DOSYA İKİ YÜZEYİ BESLİYOR ve tek kaynak olması bunun için önemli:
     sayı      `okuyucu.js` → `sunusuBaslat()` → sayfayı bulur, hikâyeyi kurar
     tezgâh    `tezgah-karistir.html` → `dilimleriKur()` + kendi ölçü aletleri

   Tezgâh yalnız ÖLÇÜYOR; oynattığı koreografi sayının oynattığının aynısı.
   Eskiden koreografi tezgâhın içinde yaşıyordu ve sayıya taşınması demek onu
   KOPYALAMAK demekti — iki kopyanın ayrışması an meselesiydi.

   ────────────────────────────────────────────────────────────────────────────
   ALTI DİLİM
   ────────────────────────────────────────────────────────────────────────────
       baslik  ① tek "sErgi" 3 katından inerek boşluktan çözülür
               ② 22 kopya merkezden dışa dalga hâlinde doğar (tarla dolar)
               ③ 22'si BİRDEN dağılır — dalga yok
               ④ zemin koyulaşır, hayatta kalan kopya "Kızıl Mevsim"e dönüşür
               ⑤ "Sonbahar, bir şehrin rengi değişirken"e dönüşür
               ⑥ rastgele dağılır
       sozler  dokuz cümle DIŞTAN İÇE açılır, okunur, İÇTEN DIŞA dağılır
       sehir   iki beyit soldan sağa SÜPÜRÜLEREK açılır, okunur, geri süpürülür
       icerik  dört satır DAKTİLOYLA yazılır
       cagri   alıntı ve çağrı bulanıktan NETLEŞİR, okunur, geri bulanıklaşır
       kunye   "Aylık · Eylül 2026" çözülür → "Sayı 03"a dönüşür →
               büyüyerek özel karakterlere dağılır, zemin açılış rengine döner

   ⚠️ İLK İKİSİ VE SONUNCUSU KARIŞTIRMA, ORTADAKİ ÜÇÜ DEĞİL — ve bu bir üslup
   kaprisi değil. İki sebebi var:

     · Aynı dil altı dilim sürmüyor. Üçüncü kullanımdan sonra karıştırma bir
       anlam taşımıyor, yalnız "efekt" oluyor; dördüncüde görünmez oluyor.
     · Daha önemlisi karıştırma UZUN CÜMLE İÇİN YANLIŞ ARAÇ. Okur metni ancak
       tamamen çözüldükten SONRA okumaya başlayabiliyor — beş harflik bir
       kelimede bedeli yok, on altı kelimelik bir cümlede dilimin yarısı
       okunamayan bir yazıya bakmakla geçiyor. Süpürme ve daktilo açılırken
       okunuyor. Ayrıntı: `js/yazi.js` dosya başlığı.

   ⚠️ SON ÜÇ DİLİMİN METNİ `ed-2`DEN GELDİ ve o sayfa `#sira`dan çıkarıldı —
   `ed-1`de yapılanın aynısı. Metin bölündü, yeniden yazılmadı: cümleler
   olduğu gibi duruyor, yalnız nerede durakladıkları seçildi.

   ⚠️ SIRA ÖNEMLİ VE BİR DÖNEM YANLIŞTI. Eskiden tarla dolarken merkez AYNI
   ANDA başlığa dönüşüyordu; demoda ise tarla merkezle aynı kelimeyi tutuyor ve
   başlık ancak tarla dağıldıktan SONRA geliyor. Fark koreografinin fikrinin
   kendisi: "kelime çoğalır, hepsi çekilir, kalan sayının adı olur". Eski sırada
   ekranda 23 kopyalı tek kelime anı hiç oluşmuyordu. Ayrıntı: `baslikOyna`.

   Demonun zaman çizelgesi (`codepen.io/juliangarnier/pen/vEyYdXN`) `tl.seek()`
   ile kare kare örneklenerek çıkarıldı — anime.js yerel bir kopyadan yüklendi,
   20ms adımla 12608ms tarandı. İlk iki dilimin süreleri ve yönleri göz kararı
   değil, o taramadan. Son üç dilim demoda YOK; onların süreleri metnin kendi
   uzunluğundan HESAPLANIYOR (bkz. §SÜRELER).
   ========================================================================= */

import { bekle, karistir, merkezdenDisa, uzaklikOlc } from './karistir.js';
import { ac, daktilo, daktiloSuresi, hayaletKur, kapat, sureHesapla } from './yazi.js';
import { perdeleriKur } from './perde.js';
import { hikaye } from './hikaye.js';

/* ==========================================================================
   METİN — hepsi sayının KENDİ kopyası, hiçbiri uydurulmadı
   --------------------------------------------------------------------------
   Demonun 1. perdesi üç durumlu: marka ("Introducing" ×23) → ürünün adı
   ("Anime.js Scramble Text") → ne olduğu ("Scramble text animations made
   easy."). Karşılıkları `sayfalar/kapak-1/sayfa.html`de hazır duruyordu:

     .cover__title  "Kızıl Mevsim"                         → sayının adı
     .cover__sub    "Sonbahar, bir şehrin rengi değişirken" → ne olduğu
     .cover__meta   "Aylık · Eylül 2026 · Japonoloji Kültür"

   ⚠️ KAPAKTAN ALINDI, YENİDEN YAZILMADI. Bu sayfa kapağın hemen ardında
   duruyor; orada kapakla farklı şeyler söyleyen iki açılış olması karışıklık
   olurdu. Meta satırı kısaltıldı (tür adı künyede zaten var).

   ⚠️ ÖBÜR BÜTÜN METİN BURADA DEĞİL, işaretlemede — `dilimleriKur` onları
   `<p>`lerden okuyor. Bir cümleyi değiştirmek JS'e dokunmayı gerektirmesin.
   ======================================================================= */

export const BASLIK = 'Kızıl Mevsim';
export const ALT_BASLIK = 'Sonbahar, bir şehrin rengi değişirken';
export const KUNYE_META = 'Aylık · Eylül 2026';
export const KUNYE_NO = 'Sayı 03';
export const TARLA_KELIMESI = 'sErgi';

/* ⚠️ ASIL OKUMA SÜRESİ BU. Sözler yerine oturduktan sonra ekranda kaldıkları
   süre — dokuz cümlenin okunabildiği tek an. Bir dönem 1400ms'ti ve
   YETMİYORDU: dokuz cümle, ~30 kelime, üstelik sonuncusu dalganın sonunda
   geldiği için daha da az duruyordu.

   ⚠️ DEMODAN BİLEREK AYRILAN TEK SÜRE BU. Demoda karşılığı olan bekleme 1480ms
   (ölçüldü) — ama oradaki 14 etiket bir ÖZELLİK LİSTESİ, okunmak için değil
   "çok şey var" duygusu için ekranda. Buradaki dokuz cümle okunmak zorunda.
   Fidelity burada okunabilirliğe yenik düşüyor. */
export const SOZ_OKUMA = 4200;

/* ⚠️ YENİ DİLİMLERİN OKUMA SÜRELERİ SÖZLERİNKİNDEN KISA ve bunun sebebi
   animasyonun kendisi. Karıştırma bittiğinde okuma DAHA YENİ başlıyor;
   süpürme ve daktiloda okuma animasyonla BİRLİKTE akıyor, yani metin ekranda
   durduğu andan çok daha uzun süredir okunuyor. Aynı sayıyı vermek bu üç
   dilimi gereksiz uzatırdı. */
export const SEHIR_OKUMA = 2600;
export const CAGRI_OKUMA = 2800;

/* ⚠️ ÖLÇEKLER ÖLÇÜLEREK SEÇİLDİ. Tarla dilimlerinde tek punto olduğu için
   (bkz. `css/sunus.css` §TARLA) hiyerarşiyi tamamen bunlar kuruyor. Demodaki
   ORANLAR hedef alındı: orada başlık kadrajın ~%49'unu, alt başlık ~%52'sini
   kaplıyor. Aynı oranı tutturmak için buradaki sayılar demodakinden farklı
   olmak ZORUNDA, çünkü "Kızıl Mevsim" (12 harf) "Anime.js Scramble Text"in
   (22 harf) yarısı kadar. Tezgâhtaki TAŞMA panosu üçünü de ölçüyor.

   ⚠️ SON ÜÇ DİLİM BU TABLOYA GİRMİYOR. Onların büyüklüğü `--fs-*`tan geliyor,
   ölçekten değil — saran bir paragrafı `scale` ile büyütmek satır uzunluğunu
   da büyütüyor ve 3:4 tuvalde ilk taşan şey o oluyor (gerekçe:
   `css/sunus.css` §TİPOGRAFİ). */
export const OLCEK = {
  inis: 3 /* demo A2: merkez 3 katından iniyor */,
  tarla: 1 /* kopyalardan biri — tarlayla aynı */,
  baslik: 2.6,
  alt: 1,
  kunye: 2,
  kunyeCikis: 2.6 /* demo A17: dağılırken büyüyor */
};

/* ⚠️ TEZGÂHIN ÖLÇTÜĞÜ ALTI GEÇİŞ TAM OLARAK BUNLAR — ve bu yüzden burada,
   koreografinin yanında duruyorlar. Eskiden tezgâhın içinde ayrı bir liste
   vardı ve koreografi yeniden yazılınca o liste AKIŞTA OLMAYAN bir geçişi
   ölçmeye devam etti ('sErgi' → 'Kızıl Mevsim' tek adımda yoktu artık). Aynı
   nesneyi hem oynatıp hem ölçmek o sessiz yalanı imkânsız kılıyor.

   Tarla kopyaları, sözler ve beklemeler burada DEĞİL: onların ayarı öge
   indeksine göre değişiyor (`tohum: i + 40`) ve panel onları ölçmüyor. Yeni
   üç dilim de burada değil — onlar karışmıyor, dolayısıyla ölçtüğü şey
   (karışma sırasında satırın genişlik zıplaması) orada YOK. */
export const KARISMA = {
  tarla: { sure: 500, kaynak: 'merkez', imlec: '░▒▓█', tohum: 7 },
  baslik: { sure: 1000, kaynak: 'merkez', titresim: 0.25, tohum: 11 },
  alt: { sure: 950, kaynak: 'sag', tohum: 13 },
  bosluk: { sure: 850, kaynak: 'rastgele', titresim: 0.5, tohum: 17 },
  kunyeMeta: { sure: 900, kaynak: 'merkez', titresim: 0.2, tohum: 3 },
  kunyeNo: { sure: 750, kaynak: 'sag', imlec: '░▒▓', tohum: 5 },
  kunyeCikis: { sure: 750, kaynak: 'sag', karakterler: '#!%░▒▓_01', imlec: '', tohum: 9 }
};

/* ⚠️ YENİ ÜÇ DİLİMİN AYARI DA TABLODA, gövdeye gömülü değil — aynı gerekçe.
   Tezgâh bu değerleri okuyup dilim sürelerini HESAPLIYOR; gövdeye yazılsalardı
   panel kendi kopyasını taşımak zorunda kalır ve ayrışırdı. */
export const AKIS = {
  sehirBas: { tur: 'supur', adim: 62, sure: 640 },
  sehirAlt: { tur: 'supur', adim: 44, sure: 560 },
  daktilo: { adim: 26 },
  alinti: { tur: 'netles', adim: 90, sure: 760 },
  dipnot: { tur: 'netles', adim: 45, sure: 560 }
};

/* ==========================================================================
   §PERDELER — hangi dilimin arkasında hangi çizim duruyor
   --------------------------------------------------------------------------
   Dosyalar `assets/2026-09/akilli-kiz/`te ve sayının sergi bölümüyle ORTAK.
   Yeniden çizilmediler, ödünç alındılar: sunuş sayının kendisini tanıtıyor ve
   arkasında sayının kendi görselleri duruyor.

   ⚠️ ÇİZİMLER YER TUTUCU — dosyaların içinde öyle yazıyor. Ece Özgür'ün asıl
   çizimleri gelince bu dosyalar değişecek ve sunuşun arkası kendiliğinden
   değişecek; burada tek satır düzenlemek gerekmiyor.

   ⚠️ AÇILIŞ VE KAPANIŞ AYNI PERDE (`ay`) ve bu §ZEMİN'deki dönüşün eşi:
   sayfa `dongu: true` ile çalışıyor, yani son dilimden ilkine SARIYOR. İkisi
   farklı sahneler olsaydı başa sarışta perde de değişir ve döngü görünür
   olurdu. Zemin rengi zaten 1'e dönüyor; sahnenin de dönmesi aynı dikişi
   kapatıyor.

   Kalan üçü dilimin konusuna göre: yanan şehir bir ışık lekesinin altındaki
   sıra (`fener`), sayının içindekiler bir kapıdan geçmek (`yagmur` —
   dosyadaki torii ve yağmur çizgileri), çağrı ise iç içe halkalar (`halka`).
   ======================================================================= */

const KOK = 'assets/2026-09/akilli-kiz/';

export const PERDELER = {
  ay: `${KOK}04.svg`,
  fener: `${KOK}02.svg`,
  yagmur: `${KOK}09.svg`,
  halka: `${KOK}06.svg`
};

/** Dilim → perde. Tezgâhtaki PERDE panosu da bu tabloyu okuyor. */
export const DILIM_PERDESI = {
  baslik: 'ay',
  sozler: 'ay',
  sehir: 'fener',
  icerik: 'yagmur',
  cagri: 'halka',
  kunye: 'ay'
};

/* ==========================================================================
   KURULUM
   ======================================================================= */

/**
 * Bir belirteci yazıp reflow okur, böylece SONRAKİ yazma bu değerden başlayan
 * bir geçiş olur. Onsuz "3'e ayarla, 1'e çevir" aynı karede birleşir ve
 * tarayıcı hiç geçiş yapmaz — kelime doğrudan 1'de doğar.
 */
function sifirla(el, ad, deger) {
  el.style.setProperty(ad, deger);
  void el.offsetWidth;
}

/**
 * İşaretlemeden okunan metni tek satıra indirir.
 *
 * ⚠️ GEREKLİ, ÇÜNKÜ METİN GİRİNTİLİ YAZILI. `sayfa.html`de cümleler okunabilir
 * olsun diye satırlara bölünmüş ve girintilenmiş; `textContent` o boşlukları
 * aynen veriyor. Temizlenmezse süpürme "kelime" diye satır başındaki boşluğu
 * da sayar ve kademe kayardı.
 */
const tekSatir = (el) => el.textContent.replace(/\s+/g, ' ').trim();

/**
 * Daktilo metnini okur ama SATIR SONLARINI KORUR — onlar kompozisyonun
 * parçası ve `DURAKLAR` tablosunda kendi duraklama değerleri var
 * (bkz. `js/yazi.js` §DURAKLAR). Yalnız girintiler siliniyor.
 */
const satirlariKoru = (el) =>
  el.textContent
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
    .join('\n');

/**
 * Sahnenin parçalarını bulur, dinlenme düzeninde ölçer ve `hikaye()`ye
 * verilecek dilim listesini kurar.
 *
 * @param {Element} sahne              `.kr` kutusu (sayfanın kendisi DEĞİL)
 * @param {object}  [ayar]
 * @param {number}  [ayar.yavas=1]     her şeyi bu kat yavaşlatır (tezgâh)
 * @param {number}  [ayar.oku]         sözlerin ekranda durma süresi (ms)
 * @returns {Promise<object>} `{ dilimler, merkez, cevre, sozler, kunye, perdeler }`
 */
export async function dilimleriKur(sahne, ayar = {}) {
  const { yavas = 1, oku = SOZ_OKUMA } = ayar;
  const s = (ms) => Math.round(ms * yavas);

  /* Bir vuruşun `karistir()` ayarını kurar: tablodaki değerler + yavaşlatılmış
     süre + iptal işareti. Süre tabloda HAM duruyor ki tezgâhın ölçtüğü sayı
     ile burada oynatılan aynı satırdan gelsin. */
  const vurus = (ad, isaret) => ({ ...KARISMA[ad], sure: s(KARISMA[ad].sure), isaret });

  /* `AKIS` tablosundaki bir adımın ayarı — aynı kalıp, süre ve adım birlikte
     yavaşlıyor (adım yavaşlamasaydı yavaşlatılmış bir oynatımda kademe
     büzülür ve dalga kaybolurdu). */
  const akis = (ad, isaret, ek = {}) => ({
    ...AKIS[ad],
    adim: s(AKIS[ad].adim),
    sure: AKIS[ad].sure === undefined ? undefined : s(AKIS[ad].sure),
    isaret,
    ...ek
  });

  /* ⚠️ DİLİM KUTULARI `:scope >` İLE SEÇİLİYOR — kısayol değil, ZORUNLU.
     `hikaye()` etkin dilimin adını KABIN kendisine de yazıyor
     (`kap.dataset.dilim = d.id`, bkz. `js/hikaye.js` §git). Yani motor
     çalışmaya başladıktan sonra `sahne` de `[data-dilim="baslik"]`e uyuyor ve
     `sahne.querySelectorAll('[data-dilim="baslik"] p')` sahnedeki BÜTÜN
     paragrafları döndürüyor — 22 yerine çok daha fazlası.

     Burada sıra bizi kurtarıyor (bu satırlar `hikaye()`den önce koşuyor, o an
     kapta öznitelik yok), yani hata görünmüyor ama bir satır aşağı kaysa
     sessizce ortaya çıkardı. Ölçüldü: motordan sonra aynı seçici gerçekten
     bütün sahneyi döndürüyor. */
  const dilimKutusu = (ad) => sahne.querySelector(`:scope > [data-dilim="${ad}"]`);

  const merkez = sahne.querySelector('.kr--merkez');
  const cevre = [...dilimKutusu('baslik').querySelectorAll('p:not(.kr--merkez)')];
  const sozler = [...dilimKutusu('sozler').querySelectorAll('p')];
  const kunye = sahne.querySelector('.kr__son');

  const sehirKutusu = dilimKutusu('sehir');
  const sehirBas = sehirKutusu.querySelector('.kr__metin:not(.kr__metin--kisik)');
  const sehirAlt = sehirKutusu.querySelector('.kr__metin--kisik');

  const daktiloKutusu = dilimKutusu('icerik').querySelector('.kr__daktilo');

  const cagriKutusu = dilimKutusu('cagri');
  const alinti = cagriKutusu.querySelector('.kr__alinti');
  const dipnot = cagriKutusu.querySelector('.kr__dipnot');

  /* ⚠️ UZAKLIKLAR BİR KEZ, DİNLENME DÜZENİNDE ÖLÇÜLÜYOR — dilimlerin içinde
     değil. Metni boşaltılmış bir `<p>` sıfır genişliğe iniyor ve satırın
     ortasına çöküyor; o anda ölçülen uzaklıkların hepsi birbirine eşit çıkıyor,
     yani dalga tamamen kayboluyor (bkz. `karistir.js` §uzaklikOlc). Bütün
     metinler de aynı sebeple ŞİMDİ alınıyor.

     Yazı tipleri beklendikten SONRA: `document.fonts.ready` dönmeden ölçülen
     kutular yedek yüzün kutuları olur ve dalga biraz yanlış merkezden açılır. */
  await document.fonts.ready;

  const SOZ_METNI = sozler.map((p) => p.textContent.trim());
  const SOZ_UZAKLIK = uzaklikOlc(sozler);
  const CEVRE_UZAKLIK = uzaklikOlc(cevre);

  const SEHIR_BAS = tekSatir(sehirBas);
  const SEHIR_ALT = tekSatir(sehirAlt);
  const ALINTI = tekSatir(alinti);
  const DIPNOT = tekSatir(dipnot);
  const DAKTILO_METNI = satirlariKoru(daktiloKutusu);

  /* Daktilonun yeri ŞİMDİ ayrılıyor: hayalet kopya metnin tam hâlini görünmez
     tutuyor ki yazarken blok yukarı kaymasın (bkz. `js/yazi.js` §hayaletKur). */
  const daktiloAkan = hayaletKur(daktiloKutusu, DAKTILO_METNI);

  /* Sahneler. ⚠️ BEKLENİYOR ama HATASI HİKÂYEYİ DÜŞÜRMÜYOR: `perdeleriKur`
     kendi içinde `allSettled` kullanıyor ve gelmeyen dosyayı konsola yazıp
     geçiyor. Perde zeminin ÜSTÜNE biniyor, altına değil — hiçbiri gelmezse
     sayfa düz renkli hâline düşüyor ve koreografi aynen işliyor. */
  const { perdeler, sec } = await perdeleriKur(sahne, PERDELER);

  /* ====================================================================
     KOREOGRAFİ — her dilim kendi başına yetiyor
     --------------------------------------------------------------------
     Demoda bu iş `createTimeline` + göreli etiketler (`'<<'`, `'<+=150'`) ile
     kuruluyor. Burada `await` aynı işi yapıyor: sıra zaten satırların sırası,
     ve bir adımın süresi değişince gerisi kendiliğinden kayıyor. Kazanç, bir
     zaman çizelgesi motoru taşımamak.

     ⚠️ HER DİLİM KENDİ ELEMANLARINI SIFIRLIYOR. Eskiden sıfırlama tek bir
     yerdeydi çünkü zincir hep baştan başlıyordu. Artık okur herhangi bir
     dilime, herhangi bir sırada, herhangi bir sayıda girebiliyor: `kunye`den
     `baslik`e dönen okur tarlayı dolu bulmak zorunda, bir önceki turun
     dağılmış hâlini değil.

     ⚠️ ZEMİN VE PERDE HER DİLİMİN BAŞINDA YAZILIYOR, değiştiği yerde değil.
     Aynı sebep: okur doğrudan 4. dilime atlayabiliyor ve o zaman sahneyi
     kuracak başka kimse yok. Aynı değere yazmak geçiş başlatmıyor, yani
     bedeli yok.

     ⚠️ `isaret` HER ÇAĞRIYA GEÇİYOR. Okur dilim atlayınca motor bu işareti
     ateşliyor ve zincir olduğu yerde kesiliyor; geçmezse iki `karistir`
     döngüsü aynı elemana yazar (bkz. `js/karistir.js` §İPTAL).

     ⚠️ ALTI KOREOGRAFİNİN HEPSİ `bilgi.duragan`DA DİNLENME DÜZENİNDE DURUYOR.
     Otomatik geçiş kapalıyken (hareket azaltma) dilim kendiliğinden bitmiyor,
     okur ona istediği kadar bakıyor — yani "dağıl" adımları çalıştırılmamalı.
     Çalıştırıldığında ne olduğu ölçüldü: `karistir()` hareket azaltmada hedefi
     anında yazıyor, dağılma da anında koşuyor ve ekranda BOŞ bir dilim
     kalıyordu. Erken dönüş okuma beklemesini de atlıyor: süreyi artık okur
     belirliyor, içeride sayılan bir saat anlamsız.
     ==================================================================== */

  /* --------------------------------------------------------------------
     1 · BAŞLIK — demonun 1. perdesi, ALTI VURUŞ
     --------------------------------------------------------------------
     Vuruşlar (demo `tl.seek()` ile ölçüldü, süreler oradan):
       ①    0–500  tek kelime, 3 katı büyüklükten inerek boşluktan çözülür
       ②  620–1660 22 kopya merkezden dışa dalga hâlinde doğar
       ③ 1950–2750 22'si BİRDEN dağılır (dalga yok — demoda da yok)
       ④ 2150–3150 zemin siyaha döner, merkez "Kızıl Mevsim"e dönüşür
       ⑤ 3620–5260 merkez alt başlığa dönüşür, ölçek düşer
       ⑥ 5280–6120 merkez rastgele dağılır
     -------------------------------------------------------------------- */
  async function baslikOyna(kanvas, isaret, bilgi) {
    /* ⚠️ TARLA BOŞ DOĞUYOR. Demodaki `override: ' '` bu: kelimeler var olmayan
       bir yerden geliyor. Eskiden burada tarla 'sErgi' ile DOLDURULUYORDU,
       yani dalga zaten görünen kelimelerin üstünden geçen bir parıltıydı —
       hiçbir şey "gelmiyordu", sadece titriyordu. */
    merkez.textContent = '';
    cevre.forEach((p) => {
      p.textContent = '';
      p.style.setProperty('--kr-p-olcek', '0.75');
    });
    sahne.dataset.zemin = '1';
    sec(DILIM_PERDESI.baslik);

    if (bilgi.duragan) {
      /* DURAĞAN POZ — akışın HİÇ UĞRAMADIĞI bir kare, bilerek. Otomatik geçiş
         kapalıyken perde tek kareye iniyor ve o karenin perdenin kimliğini
         taşıması gerek: dolu tarla + ortada sayının adı. Akışta bu ikisi asla
         aynı anda ekranda olmuyor (tarla dağılmadan başlık gelmiyor), ama akış
         zaten yok. Tek kare seçilecekse en çok şeyi söyleyen kare bu — boş bir
         tarlanın ortasındaki alt başlık değil. */
      merkez.textContent = BASLIK;
      cevre.forEach((p) => {
        p.textContent = TARLA_KELIMESI;
        p.style.removeProperty('--kr-p-olcek');
      });
      sahne.style.setProperty('--kr-olcek', String(OLCEK.baslik));
      sahne.dataset.zemin = '2';
      return;
    }

    /* ① Tek kelime, üç katı büyüklükten iniyor. Ölçek ve dilimin kendi açılışı
       CSS geçişi; karışma JS. İkisi aynı anda başlıyor. */
    sifirla(sahne, '--kr-olcek', String(OLCEK.inis));
    sifirla(kanvas, '--kr-slayt-olcek', '0.75');
    sahne.style.setProperty('--kr-olcek', String(OLCEK.tarla));
    kanvas.style.setProperty('--kr-slayt-olcek', '1');
    sahne.dataset.zemin = '2';

    await karistir(merkez, TARLA_KELIMESI, vurus('tarla', isaret));

    /* ② Tarla merkezden dışa doğuyor. Her kopya KENDİ sırası gelince büyüyor —
       ölçek `isle` geri çağrısının içinde, dalganın dışında değil (demodaki
       A4'ün `scale: {from: .75}`i de öyle staggerlı). */
    await bekle(s(120), isaret);
    await merkezdenDisa(
      cevre,
      (p, i) => {
        p.style.removeProperty('--kr-p-olcek');
        return karistir(p, TARLA_KELIMESI, {
          sure: s(500),
          kaynak: 'merkez',
          imlec: '░▒▓',
          titresim: 0.25,
          tohum: i + 2,
          isaret
        });
      },
      { adim: s(90), uzakliklar: CEVRE_UZAKLIK, isaret }
    );

    /* ③ 22'si BİRDEN dağılıyor — `merkezdenDisa` YOK, bilerek. Demoda ölçüldü:
       dolu kopya sayısı 22'den 0'a tek karede düşüyor. Girişin yavaş dalgası
       ile çıkışın sert kesmesi arasındaki bu karşıtlık perdenin ritmi;
       simetrik yapılırsa (eskiden öyleydi) düzleşiyor. */
    await bekle(s(150), isaret);
    const dagilma = Promise.all(
      cevre.map((p, i) =>
        karistir(p, '', {
          sure: s(800),
          kaynak: 'merkez',
          tersine: true,
          imlec: '░▒▓',
          tohum: i + 40,
          isaret
        })
      )
    );

    /* ④ Zemin ve başlık, tarla DAHA DAĞILIRKEN giriyor. Demoda da üst üste
       biniyor (dağılma 1950–2750, zemin+başlık 2150). Bu yüzden `dagilma`
       burada beklenmiyor. */
    await bekle(s(200), isaret);
    sahne.dataset.zemin = '3';
    sahne.style.setProperty('--kr-olcek', String(OLCEK.baslik));
    await karistir(merkez, BASLIK, vurus('baslik', isaret));
    /* Çoktan bitti; yine de bekleniyor ki iptal buradan da yayılsın. */
    await dagilma;

    await bekle(s(720), isaret);

    /* ⑤ Alt başlık. Ölçek düşüyor çünkü satır üç kat uzun — demoda da başlık
       1.5'ten alt başlıkta 1'e iniyor. */
    sahne.style.setProperty('--kr-olcek', String(OLCEK.alt));
    await karistir(merkez, ALT_BASLIK, vurus('alt', isaret));

    await bekle(s(680), isaret);

    /* ⑥ */
    await karistir(merkez, '', vurus('bosluk', isaret));
  }

  /* --------------------------------------------------------------------
     2 · SÖZLER — demonun 2. perdesi (özellik ızgarası)
     --------------------------------------------------------------------
     Yönler demodakiyle aynı ve TERS: içeri DIŞTAN İÇE (`reversed`), dışarı
     İÇTEN DIŞA. Ölçüldü, ikisi de doğrulandı.

     Zemin ve perde BURADA DEĞİŞMİYOR — demoda da siyah, 1. perdeden
     devralınıyor. Yine de yazılıyor: okur doğrudan bu perdeye atlayabiliyor.
     -------------------------------------------------------------------- */
  async function sozlerOyna(kanvas, isaret, bilgi) {
    sahne.dataset.zemin = '3';
    sec(DILIM_PERDESI.sozler);
    sahne.style.removeProperty('--kr-olcek');
    sozler.forEach((p) => {
      p.textContent = '';
      p.style.setProperty('--kr-p-olcek', '0.8');
    });
    await bekle(s(150), isaret);

    await merkezdenDisa(
      sozler,
      (p, i) => {
        /* Demodaki A12: her etiket kendi sırası gelince .8'den 1'e. */
        p.style.removeProperty('--kr-p-olcek');
        return karistir(p, SOZ_METNI[i], {
          sure: s(650),
          kaynak: 'merkez',
          imlec: '░▒▓',
          titresim: 0.5,
          tohum: i + 60,
          isaret
        });
      },
      { adim: s(110), tersine: true, uzakliklar: SOZ_UZAKLIK, isaret }
    );

    /* Dinlenme düzeni: dokuz cümle ekranda. */
    if (bilgi.duragan) return;

    /* Dokuz cümle burada duruyor ve okunuyor. Bekleme dalganın SONUNDAN
       sayılıyor, yani en geç gelen cümlenin bile bu kadar süresi var. */
    await bekle(s(oku), isaret);

    await merkezdenDisa(
      sozler,
      (p, i) => karistir(p, '', { sure: s(500), kaynak: 'merkez', tohum: i + 80, isaret }),
      { adim: s(70), uzakliklar: SOZ_UZAKLIK, isaret }
    );
  }

  /* --------------------------------------------------------------------
     3 · ŞEHİR — SÜPÜRME
     --------------------------------------------------------------------
     `ed-2`nin ilk cümlesi, iki beyite bölünmüş. Üstteki ne olduğunu, alttaki
     nedenini söylüyor ve ikincisi hem daha küçük hem daha sönük — dilim iki
     beyitli, ikisi eşit ağırlıkta olsaydı göz nereden başlayacağını bilemezdi.

     ⚠️ İKİNCİ BEYİT BİRİNCİSİ BİTMEDEN GİRİYOR (`bekle` kısa). Demodaki
     "üst üste binme" fikrinin aynısı: adımlar uç uca eklenirse dilim bir
     LİSTE gibi okunuyor, üst üste binince bir CÜMLE gibi.

     Çıkış TERS SIRADA (`ters: true`): giriş soldan sağa açıyorsa çıkış da
     soldan sağa kapatsaydı hareket "devam ediyor" gibi okunurdu; sondan
     başlamak onu geri sarıyor.
     -------------------------------------------------------------------- */
  async function sehirOyna(kanvas, isaret, bilgi) {
    sahne.dataset.zemin = '3';
    sec(DILIM_PERDESI.sehir);
    sahne.style.removeProperty('--kr-olcek');

    if (bilgi.duragan) {
      /* Durağan poz: iki beyit de yerinde. Süpürmenin dinlenme düzeni zaten
         işaretlemedeki hâli — `ac()` hareket kapalıyken tam bunu yapıyor. */
      await ac(sehirBas, SEHIR_BAS, akis('sehirBas', isaret));
      await ac(sehirAlt, SEHIR_ALT, akis('sehirAlt', isaret));
      return;
    }

    await bekle(s(150), isaret);

    const ustSoz = ac(sehirBas, SEHIR_BAS, akis('sehirBas', isaret));
    await bekle(s(560), isaret);
    await Promise.all([ustSoz, ac(sehirAlt, SEHIR_ALT, akis('sehirAlt', isaret))]);

    await bekle(s(SEHIR_OKUMA), isaret);

    await Promise.all([
      kapat(sehirAlt, akis('sehirAlt', isaret, { ters: true })),
      kapat(sehirBas, akis('sehirBas', isaret, { ters: true }))
    ]);
  }

  /* --------------------------------------------------------------------
     4 · İÇERİK — DAKTİLO
     --------------------------------------------------------------------
     `ed-2`nin ikinci cümlesi, dört satıra bölünmüş. Sayının içinde ne
     olduğunu sayan tek dilim bu ve daktilo tam da o iş için seçildi: bir
     liste yazılırken okunur, çözülürken değil.

     ⚠️ ÇIKIŞI YOK ve bu ölçülmüş bir karar. Metni geri silmek doğal bir
     kapanış olurdu ama 165 karakter en hızlı ayarla bile ~2 saniye tutuyor —
     zaten en uzun dilime eklenen iki saniye. Gerek de yok: `daktilo()` her
     çağrıldığında kutuyu ÖNCE boşaltıyor, yani başa saran okur dilimi boş
     buluyor. Kapanışı bir sonraki dilimin saydamlık geçişi yapıyor.
     -------------------------------------------------------------------- */
  async function icerikOyna(kanvas, isaret, bilgi) {
    sahne.dataset.zemin = '3';
    sec(DILIM_PERDESI.icerik);
    sahne.style.removeProperty('--kr-olcek');

    if (bilgi.duragan) {
      /* `daktilo()` hareket kapalıyken metni doğrudan yazıyor ve imleci
         söndürüyor — durağan poz tam olarak o. */
      await daktilo(daktiloAkan, DAKTILO_METNI, akis('daktilo', isaret));
      return;
    }

    await bekle(s(150), isaret);
    await daktilo(daktiloAkan, DAKTILO_METNI, akis('daktilo', isaret));
    await bekle(s(1400), isaret);
  }

  /* --------------------------------------------------------------------
     5 · ÇAĞRI — NETLEŞME
     --------------------------------------------------------------------
     `ed-2`nin alıntısı ve son cümlesi. Önce sebep ("bitişi olan bir şey"),
     sonra ne yapılacağı ("aşağı kaydır") — ters sırada çağrı havada kalırdı.

     ⚠️ SAYFANIN KENDİSİ BU ÇAĞRIYI KARŞILIYOR. Sunuş dikey snap akışının
     ikinci sayfası; "aşağı kaydır" burada bir slogan değil, okurun bir
     sonraki hareketi. Cümlenin `ed-2`de durduğu yerde de aynı işi görüyordu.
     -------------------------------------------------------------------- */
  async function cagriOyna(kanvas, isaret, bilgi) {
    sahne.dataset.zemin = '3';
    sec(DILIM_PERDESI.cagri);
    sahne.style.removeProperty('--kr-olcek');

    if (bilgi.duragan) {
      await ac(alinti, ALINTI, akis('alinti', isaret));
      await ac(dipnot, DIPNOT, akis('dipnot', isaret));
      return;
    }

    await bekle(s(150), isaret);

    await ac(alinti, ALINTI, akis('alinti', isaret));
    await bekle(s(340), isaret);
    await ac(dipnot, DIPNOT, akis('dipnot', isaret));

    await bekle(s(CAGRI_OKUMA), isaret);

    await Promise.all([
      kapat(dipnot, akis('dipnot', isaret, { ters: true })),
      kapat(alinti, akis('alinti', isaret, { ters: true }))
    ]);
  }

  /* --------------------------------------------------------------------
     6 · KÜNYE — demonun 3. perdesi
     --------------------------------------------------------------------
     ⚠️ BU PERDE DE İKİ DURUMLU OLMAK ZORUNDAYDI. Demoda tek satır önce "Learn
     more at animejs.com" diye çözülüyor, SONRA "Anime.js v4.4.0"a dönüşüyor,
     ancak ondan sonra dağılıyor. Bir dönemki hâlinde ilk durum yoktu: "Sayı
     03" doğrudan geliyor, bekliyor, dağılıyordu. Yani perde demodaki üç
     vuruşun ikisini kaybediyordu.

     Kapanışta zemin AÇILIŞ RENGİNE, perde de AÇILIŞ SAHNESİNE dönüyor
     (demo A18 + bkz. `css/sunus.css` §ZEMİN, §PERDELER). Sayfa `dongu: true`
     ile çalıştığı için bu dönüş başa sarışı görünmez kılan şeyin ta kendisi.
     -------------------------------------------------------------------- */
  async function kunyeOyna(kanvas, isaret, bilgi) {
    sahne.dataset.zemin = '3';
    sec(DILIM_PERDESI.kunye);
    sahne.style.removeProperty('--kr-olcek');
    kunye.textContent = '';
    await bekle(s(150), isaret);

    sahne.style.setProperty('--kr-olcek', String(OLCEK.kunye));
    await karistir(kunye, KUNYE_META, vurus('kunyeMeta', isaret));

    await bekle(s(740), isaret);

    await karistir(kunye, KUNYE_NO, vurus('kunyeNo', isaret));

    /* Dinlenme düzeni: sayının numarası ortada — hikâyenin son karesi. */
    if (bilgi.duragan) return;

    await bekle(s(1040), isaret);

    /* Demodaki kapanış: metin özel karakter setine dağılırken büyüyor ve zemin
       açılış rengine dönüyor. Üçü aynı anda başlıyor, üçü de ~750ms. */
    sahne.style.setProperty('--kr-olcek', String(OLCEK.kunyeCikis));
    sahne.dataset.zemin = '1';
    await karistir(kunye, ' ', vurus('kunyeCikis', isaret));
  }

  /* ====================================================================
     §SÜRELER — sıra ve süre burada, işaretlemede değil
     --------------------------------------------------------------------
     İlk iki dilimin ve künyenin süreleri zincirlerden TOPLANARAK çıkarıldı,
     göz kararıyla değil. `merkezdenDisa`nın en dıştaki ögesi
     `adim * n * 0.25` kadar gecikerek başlıyor; `karistir` ise `titresim`
     yüzünden beyan ettiği süreden biraz uzun bitebiliyor. Yani her dilimde bir
     PAY olmak zorunda.

       baslik  500 + 120 + 995 + 150 + 200 + 1000
                   + 720 + 950 + 680 + 850          ≈ 6165
       sozler  150 + 897 + 4200(oku) + 657          ≈ 5904
       kunye   150 + 900 + 740 + 750 + 1040 + 750   ≈ 4330

     ⚠️ YENİ ÜÇ DİLİMİN SÜRESİ ELLE YAZILMIYOR, HESAPLANIYOR. Sebebi doğrudan
     yukarıdaki listenin kendisi: o sayılar elle toplandı ve metin
     değiştiğinde hiçbiri kendiliğinden güncellenmiyor. Süpürme ve daktilonun
     süresi METNİN UZUNLUĞUNA bağlı — bir cümleye üç kelime eklemek dilimi
     sessizce yarıda kesecekti. `sureHesapla` ve `daktiloSuresi` aynı tabloyu
     (`AKIS`) okuyarak aynı sayıyı veriyor; yani cümleyi işaretlemede
     değiştirmek dilimi kendiliğinden uzatıyor.

     ⚠️ BU SAYILARA YİNE DE GÜVENİLMİYOR, ÖLÇÜLÜYOR. Tezgâhtaki DİLİM SÜRELERİ
     paneli her dilimin gerçek süresini yazıyor; pay negatifse kırmızı.
     ==================================================================== */

  /** Bir süpürme/netleşme adımının toplam süresi (ms). */
  const yaziSuresi = (metin, ad) =>
    sureHesapla(metin.split(/\s+/).filter(Boolean).length, {
      adim: s(AKIS[ad].adim),
      sure: s(AKIS[ad].sure)
    });

  const BAS = yaziSuresi(SEHIR_BAS, 'sehirBas');
  const ALT = yaziSuresi(SEHIR_ALT, 'sehirAlt');
  const KISA = yaziSuresi(ALINTI, 'alinti');
  const UZUN = yaziSuresi(DIPNOT, 'dipnot');

  /* Üst beyit 150'de, alt beyit 710'da başlıyor ve İKİSİ ÜST ÜSTE BİNİYOR;
     dilim ikisinin geç bitenini bekliyor. Çıkışta ikisi birlikte gidiyor. */
  const sehirSuresi =
    Math.max(s(150) + BAS, s(150) + s(560) + ALT) + s(SEHIR_OKUMA) + Math.max(BAS, ALT);

  const icerikSuresi =
    s(150) + daktiloSuresi(DAKTILO_METNI, { adim: s(AKIS.daktilo.adim) }) + s(1400);

  /* Alıntı ve dipnot ARDIŞIK (üstteki şehirin tersine): önce sebep, sonra
     çağrı — ikisi üst üste binseydi sıra okunmazdı. */
  const cagriSuresi =
    s(150) + KISA + s(340) + UZUN + s(CAGRI_OKUMA) + Math.max(KISA, UZUN);

  /* ⚠️ PAY ORANSAL DEĞİL SABİT, ve bu ölçülerek düzeltildi. Bir dönem `×1.06`
     yazıyordu; tezgâhtaki DİLİM SÜRELERİ panosu şunu gösterdi:

       dilim   hesaplanan   ölçülen   fark
       sehir        5746      5748      +2
       cagri        7126      7127      +1
       icerik       7270      7108    −162   (son noktanın nefesi sayılıyor)

     Yani hesap zaten birebir tutuyor; payın taşıdığı tek risk `setTimeout`
     jitteri ve o SÜREYLE BÜYÜMÜYOR. Oransal pay bu yüzden yanlış araçtı —
     en uzun dilime 430ms ölü zaman ekliyordu ve o ölü zaman görünüyordu:
     çıkış animasyonu bitmiş, dilim BOŞ, çubuk hâlâ doluyor.

     120ms ≈ altı zamanlayıcı sınırı. Ölçülen en büyük sapma bunun çok
     altında, ve boş kalan an artık göze çarpmıyor. */
  const PAY = 120;
  const payli = (ms) => Math.round(ms) + s(PAY);

  const dilimler = [
    { id: 'baslik', sure: s(6400), oyna: baslikOyna },
    { id: 'sozler', sure: s(1900 + oku), oyna: sozlerOyna },
    { id: 'sehir', sure: payli(sehirSuresi), oyna: sehirOyna },
    { id: 'icerik', sure: payli(icerikSuresi), oyna: icerikOyna },
    { id: 'cagri', sure: payli(cagriSuresi), oyna: cagriOyna },
    { id: 'kunye', sure: s(4500), oyna: kunyeOyna }
  ];

  return { dilimler, merkez, cevre, sozler, kunye, perdeler, sec };
}

/* ==========================================================================
   §SAYI — sayının içindeki kurulum
   --------------------------------------------------------------------------
   ⚠️ `dongu: true`. Hikâye son dilimde künyeyi DAĞITIYOR, yani bitişte ekranda
   boş bir kâğıt kalıyor. Bir dergi sayfası öyle bırakılamaz: okur sayfaya geç
   gelirse hiçbir şey görmemiş olurdu. Zeminin açılış rengine ve perdenin
   açılış sahnesine dönmesi zaten başa sarmak için tasarlandı (bkz.
   `css/sunus.css` §ZEMİN ve yukarıdaki §PERDELER).

   ⚠️ `klavye` VERİLMİYOR — varsayılanı `'yok'` ve öyle kalmalı. Ok tuşları
   sayıda sayfa geziyor (`okuyucu.js` §tuslar); hikâye onları belge düzeyinde
   dinleseydi iki dinleyici aynı tuşta kavga ederdi. Tezgâh `'belge'` açıyor
   çünkü orada okuyucu yok.

   `gorus` varsayılan açık: okur daha kapaktayken hikâye yanıp bitmesin diye
   kutu ekrandan çıkınca duruyor. Altı dilime çıkınca bu ayar daha da önemli
   oldu — bütün tur artık yarım dakikanın üstünde.
   ======================================================================= */

export const SAYI_AYARI = { dongu: true };

/**
 * Sayının içindeki sunuş sayfasını bulur ve hikâyeyi başlatır.
 *
 * Sayfa yoksa sessizce dönüyor: `#sira`dan çıkarılmış olabilir ve o durumda
 * konsola hata basmak yanlış olurdu — sayfanın sıradan çıkarılması meşru bir
 * düzenleme kararı (bkz. BENIOKU §Sayının sırasını değiştirmek).
 *
 * @param {Element} kap `#pages`
 * @returns {Promise<ReturnType<typeof hikaye>|null>}
 */
export async function sunusuBaslat(kap) {
  const sahne = kap.querySelector('.page[data-kind="sunus"] > .kr');
  if (!sahne) return null;

  const { dilimler } = await dilimleriKur(sahne);
  return hikaye(sahne, dilimler, SAYI_AYARI);
}
