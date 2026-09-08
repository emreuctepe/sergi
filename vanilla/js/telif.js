/* ============================================================================
   TELİF — çizerin görsellerine dokunma engeli
   ----------------------------------------------------------------------------
   Sayıda iki ayrı telif rejimi var ve sınır tam olarak `assets/2026-09/`
   klasör yapısına oturuyor:

     assets/2026-09/*.webp          → Wikimedia Commons (CC0 / CC BY / CC BY-SA)
     assets/2026-09/kapali-kapilar/ → KARGAMANGA · telif sahibinde, izinle
     assets/2026-09/soylesi/        → KARGAMANGA · "Çizimler KargaManga'ya aittir"

   Bu dosya YALNIZ ikinci grubu kapsıyor: 7 manga karesi, manga kapağı, 8
   söyleşi çizimi ve söyleşi kapağı.

   ⚠️ GENELE UYGULANAMAZ, tercih meselesi değil. Wikimedia görsellerinin bir
   kısmı CC BY-SA ve o lisans (§2(a)(5)(B)) "etkin teknolojik önlem"
   uygulamayı açıkça yasaklıyor. Kapsamı genişletmek — örneğin `document`e
   koşulsuz bir `contextmenu` engeli koymak — sayının kendi künyesiyle
   çelişirdi. Kapsam bölüme göre yazılmasının sebebi bu.

   ⚠️ Bu bir KORUMA DEĞİL, caydırıcı (bkz. bilesen.css §5). Engellenen şey
   kazara ve kolay kaldırma: sağ tık → resmi kaydet, ve görseli masaüstüne
   sürükleme. Görselin adresi sayfa kaynağında düz duruyor, ağ sekmesi zaten
   her şeyi gösteriyor ve ekran görüntüsü hiçbir web tekniğinin altına
   inemeyeceği taban. Buradaki eşik "niyetli olmayanı durdurmak".
   ========================================================================= */

/**
 * Çizerin görselleri.
 *
 * Bölüme göre yazılıyor, dosya yoluna göre değil: CSS bir `src`e bakamıyor ve
 * kuralın iki yerde iki farklı biçimde yazılması, ilk taşımada birinin yalan
 * söylemesi demek olurdu. `.mangazoom` üçüncü satır olarak duruyor çünkü tam
 * ekranda manga sayfası `.page`in DIŞINA taşınıyor (bkz. manga.js) — ilk iki
 * satır orada eşleşmezdi ve görsellerin en büyük hâli tam da orada.
 */
const CIZER_GORSELLERI = [
  '.page[data-section="kapali-kapilar"] img',
  '.page[data-section="soylesi"] img',
  '.mangazoom img'
].join(', ');

function engelle(olay) {
  const gorsel = olay.target.closest?.(CIZER_GORSELLERI);
  if (!gorsel) return;

  /* Bağlantı içindeki görsel muaf — bugün tek örneği manga sayfasının
     sağ alt köşesindeki PIGMENT filigranı ve o filigran bir kapı: YouTube'daki
     Shorts'a gidiyor. Orada sağ tıkı kesmek "yeni sekmede aç"ı da keserdi.
     256px'lik bir marka işaretini korumanın bedeli olarak sayının tek dış
     bağlantısını sakatlamak pahalı. */
  if (gorsel.closest('a')) return;

  olay.preventDefault();
}

/**
 * Dinleyiciler `document` üzerinde ve tek: 18 görsele tek tek bağlamak,
 * sonradan eklenen bir görselin sessizce kapsam dışı kalması demekti. Filtre
 * yukarıdaki seçicide, dinleyicide değil.
 *
 * `dragstart` ayrıca gerekiyor: `-webkit-user-drag: none` (bilesen.css §5)
 * Blink ve WebKit'te sürüklemeyi kesiyor ama Firefox o özelliği tanımıyor,
 * orada görsel hâlâ masaüstüne sürüklenebiliyordu.
 */
export function telifBaslat() {
  document.addEventListener('contextmenu', engelle);
  document.addEventListener('dragstart', engelle);
}
