/* ============================================================================
   KANTŌ — alev hortumunun hareketi
   ----------------------------------------------------------------------------
   Sayıdaki TEK SMIL animasyonu `k-3` sayfasındaki alev hortumu: beş kabuk, bir
   çekirdek ve sekiz kor, hepsi saniyede dört kare (`calcMode="discrete"`).

   ⚠️ BU DOSYA NEDEN VAR: SMIL, CSS'in hareket kurallarını DİNLEMİYOR.
   `blocks.css` §hareket bloğu `prefers-reduced-motion` altında sayfadaki her
   geçişi kesiyor ve `:root[data-motion="off"]` de aynısını yapıyor — ama ikisi
   de `transition`/`animation` üzerinden çalışıyor. `<animate>` elemanı ne
   birincisi ne ikincisi; medya sorgusu ona hiç değmiyor. Kuralları CSS'te
   bırakıp burayı yazmamak, hareketi kapatmış bir okura sayfanın ortasında
   saniyede dört kare kıpırdayan bir sütun göstermek olurdu.

   ⚠️ ELEMAN SİLİNMİYOR, ZAMAN ÇİZGİSİ DURDURULUYOR. `<animate>`leri DOM'dan
   çıkarmak da işe yarardı ama geri koymak için işaretlemeyi bir yerde
   saklamak gerekirdi ve tercih sayfa açıkken değişebiliyor.
   `pauseAnimations()` SVG'nin kendi saatini durduruyor; `setCurrentTime(0)` de
   onu döngünün BAŞINA alıyor.

   Sıfırıncı kare, işaretlemedeki `d` özniteliğinin kendisi — yani durdurulmuş
   sahne eksik değil, `alev.ts`in ilk karesi. Sıfırlama olmasaydı tercihi sonradan
   açan okur sütunu rastgele bir karede donmuş görürdü.

   Ana projede bu iş `AlevHortumu.svelte` içinde `$state` + `$effect` ile
   yapılıyor ve `<animate>` elemanları hiç doğmuyor. Klonda derleme adımı yok,
   işaretleme sabit; o yüzden yaklaşım tersine döndü: elemanlar hep var, saat
   duruyor.
   ========================================================================= */

const SORGU = '(prefers-reduced-motion: reduce)';

/** Hareketli Kantō sahneleri. Bugün bir tane; seçici yine de çoğul. */
function sahneler() {
  return document.querySelectorAll('svg[data-kanto-hareket]');
}

/** İki kaynak da "hayır" diyebilir: okurun sistem tercihi ya da sayının ayarı. */
function azHareket() {
  return document.documentElement.dataset.motion === 'off' || matchMedia(SORGU).matches;
}

function uygula() {
  const dursun = azHareket();

  for (const svg of sahneler()) {
    /* `pauseAnimations` SVGSVGElement'in kendi yöntemi, CSS değil. Sayfa
       fetch ile sonradan geldiği için bu çağrı dizilimden SONRA olmak zorunda
       (bkz. okuyucu.js §9). */
    if (dursun) {
      svg.setCurrentTime(0);
      svg.pauseAnimations();
    } else {
      svg.unpauseAnimations();
    }
  }
}

export function kantoHareketiniBaslat() {
  uygula();

  /* Sistem tercihi sayfa açıkken değişebilir — okuru yenilemeye zorlamamak
     için dinleniyor. `kaydir()` de aynı sorguya aynı sebeple bakıyor. */
  matchMedia(SORGU).addEventListener('change', uygula);

  /* Sayının kendi ayarı (`data-motion`) bir öznitelik, medya sorgusu değil:
     değişimini ancak gözlemci duyuyor. */
  new MutationObserver(uygula).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-motion']
  });
}
