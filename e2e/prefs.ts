/* ============================================================================
   UÇTAN UCA TESTLER İÇİN CİHAZ TERCİHLERİ
   ----------------------------------------------------------------------------
   Tanıtım kartları İLK ZİYARETTE açılıyor ve tuvali `inert` yapıyor — yani
   temiz bir tarayıcı bağlamında açılan her test önce tanıtımla karşılaşır.
   Tuvali sınayan testlerin konusu tanıtım değil; buradaki yardımcı onları
   "dergiyi daha önce açmış" bir okurun yerine koyuyor.

   ⚠️ Anahtar `src/lib/state/prefs.ts`'teki ile aynı olmak zorunda ve burada
   İKİNCİ KEZ yazılı: Playwright'ın yükleyicisi `$lib` takma adını çözmüyor.
   İkizleme kendi kendini yakalıyor — ad ayrışırsa tohumlama işe yaramaz ve
   tuval testleri tanıtımın altında kalıp kırmızı yanar. Ayrıca
   `tanitim.e2e.ts` uygulamanın gerçekten BU anahtara yazdığını ölçüyor.
   ========================================================================= */

import type { Page } from '@playwright/test';

export const PREFS_KEY = 'sergi:prefs:v1';

/**
 * Sayfayı, tanıtımı görmüş bir okur gibi açar. `addInitScript` sayfanın kendi
 * betiklerinden ÖNCE çalışıyor — sonrasında yazmak geç kalırdı, tanıtım o ana
 * kadar çoktan açılmış olurdu.
 */
export async function tanitimiAtla(page: Page, depth: 'min' | 'mid' | 'full' | null = null) {
	await page.addInitScript(([key, value]) => localStorage.setItem(key, value), [
		PREFS_KEY,
		JSON.stringify({ depth, seenIntro: true })
	] as const);
}
