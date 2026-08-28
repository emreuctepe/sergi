/* ============================================================================
   UÇTAN UCA TESTLER İÇİN CİHAZ TERCİHLERİ
   ----------------------------------------------------------------------------
   Tanıtım kartları İLK ZİYARETTE açılıyor ve tuvali `inert` yapıyor — yani
   temiz bir tarayıcı bağlamında açılan her test önce tanıtımla karşılaşır.
   Tuvali sınayan testlerin konusu tanıtım değil; buradaki yardımcı onları
   "dergiyi daha önce açmış" bir okurun yerine koyuyor.

   ⚠️ MOD DA TOHUMLANIYOR, tanıtım kadar önemli. Tanıtımdan sonra mod seçici
   geliyor ve o da tuvali `inert` yapıyor: yalnız `seenIntro` yazmak okuru
   tanıtımın altından çıkarıp seçicinin altına sokardı, tuval yine çekili
   kalırdı. "Dergiyi daha önce açmış okur" modunu da seçmiş olandır.

   ⚠️ Anahtar `src/lib/state/prefs.ts`'teki ile aynı olmak zorunda ve burada
   İKİNCİ KEZ yazılı: Playwright'ın yükleyicisi `$lib` takma adını çözmüyor.
   İkizleme kendi kendini yakalıyor — ad ayrışırsa tohumlama işe yaramaz ve
   tuval testleri tanıtımın altında kalıp kırmızı yanar. Ayrıca
   `tanitim.e2e.ts` uygulamanın gerçekten BU anahtara yazdığını ölçüyor.
   ========================================================================= */

import { expect, type Page } from '@playwright/test';

export const PREFS_KEY = 'sergi:prefs:v1';

/**
 * Sayıyı açar ve OKUNABİLİR hâle gelmesini bekler.
 *
 * Yükleme ekranı (`#loader`) kalkana kadar tuval `inert` — ve `inert` yalnız
 * işaretçiyi değil KLAVYEYİ de kesiyor (`Canvas.svelte`: `if (inert) return`).
 * Bunu beklemeyen test tuşa katman açıkken basıyor, tuş yutuluyor ve "sayfa
 * çevrilmedi" diye kırmızı yanıyordu; hata testin kendi aceleciliğindeydi.
 *
 * Tercih tohumlaması bu kapıyı AÇAMIYOR: yükleme okura göre değişmiyor, sayının
 * görselleri gerçekten inene kadar sürüyor. Yani tuvale dokunan her testin
 * bekleyeceği tek gerçek kapı bu.
 */
export async function sayiyaGir(page: Page, url: string) {
	await page.goto(url);
	await expect(page.locator('#loader')).toHaveCount(0);
}

/**
 * Sayfayı, tanıtımı görmüş ve modunu seçmiş bir okur gibi açar.
 * `addInitScript` sayfanın kendi betiklerinden ÖNCE çalışıyor — sonrasında
 * yazmak geç kalırdı, tanıtım o ana kadar çoktan açılmış olurdu.
 *
 * Varsayılan `full`, çünkü tuval testlerinin beklediği sayı TAM sayı: sayfa
 * sayımı, folio ve gezinme uçları `min`de bambaşka rakamlar verir. `null`
 * geçmek "modunu HENÜZ seçmemiş okur" demek ve seçiciyi açar — bunu yalnız
 * seçicinin kendi testleri istiyor.
 */
export async function tanitimiAtla(page: Page, depth: 'min' | 'mid' | 'full' | null = 'full') {
	await page.addInitScript(
		([key, value]) => {
			/* ⚠️ YALNIZ KAYIT YOKKEN. `addInitScript` HER gezinmede yeniden
			   çalışıyor — `reload()` dahil. Koşulsuz yazmak, uygulamanın o arada
			   kaydettiği seçimi her yenilemede eziyordu: "seçim kalıcı" testi modu
			   `min` seçiyor, sayfayı yeniliyor ve düzeneğin geri yazdığı `full` ile
			   karşılaşıyordu. Kırmızı yanan şey ürün değil, testin kurulumuydu.

			   Tohum bir BAŞLANGIÇ durumu: okurun dergiye nasıl geldiğini söylüyor,
			   geldikten sonra ne yaptığını değil. Sonrasında geçerli olan, okurun
			   kendi yazdığıdır. */
			if (!localStorage.getItem(key)) localStorage.setItem(key, value);
		},
		[PREFS_KEY, JSON.stringify({ depth, seenIntro: true })] as const
	);
}
