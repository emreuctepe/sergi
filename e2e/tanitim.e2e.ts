/* ============================================================================
   TANITIM KARTLARI — uçtan uca
   ----------------------------------------------------------------------------
   Bu katmanın hiçbir parçası tarayıcısız sınanamıyor: kartlar CSS snap ile
   sayılıyor (`scrollTop / clientHeight`), noktalar kaydırmaya bağlı, tuvalin
   çekilmesi `inert`e bağlı ve `inert` yalnız gerçek bir belge ağacında anlam
   taşıyor.

   Sınanan üç söz:
     1. İlk ziyarette AÇILIYOR, ikinci ziyarette AÇILMIYOR.
     2. Açıkken arkadaki sayı ne odakla ne klavyeyle ne de tıklamayla oynuyor.
     3. Üç çıkış (Sayıyı aç · Atla · Escape) aynı kapıya gidiyor.
   ========================================================================= */

import { expect, test, type Page } from '@playwright/test';
import { PREFS_KEY, tanitimiAtla } from './prefs';

const SAYI = '/sayi/2026-09';

/** İçerikteki kart sayısı (`src/content/2026-09/issue.ts`). */
const KART_SAYISI = 5;

const host = (page: Page) => page.locator('.intro-host');

test('ilk ziyarette açılıyor, beş kartın hepsi çiziliyor', async ({ page }) => {
	await page.goto(SAYI);
	await expect(host(page)).toBeVisible();
	await expect(page.locator('.intro__slide')).toHaveCount(KART_SAYISI);

	/* Her kartın arkasında ÇİZİLMİŞ bir sahne var ve hiçbiri 0×0 değil.
	   1e'de aynı denetim sayfa arka planları için yapılmıştı: bir sahnenin
	   "çalıştığı" ancak boyanınca anlaşılıyor. */
	const boyutlar = await page
		.locator('.intro__bg svg')
		.evaluateAll((els) =>
			els.map((el) => el.getBoundingClientRect()).map((r) => [r.width, r.height])
		);
	expect(boyutlar).toHaveLength(KART_SAYISI);
	for (const [w, h] of boyutlar) expect(Math.min(w, h)).toBeGreaterThan(0);
});

test('ikinci ziyarette hiç açılmıyor', async ({ page }) => {
	await tanitimiAtla(page);
	await page.goto(SAYI);
	await expect(page.locator('.cover__title')).toBeVisible();
	await expect(host(page)).toHaveCount(0);
});

test('açıkken arkadaki sayı ÇEKİLİ: odak, tıklama ve klavye geçmiyor', async ({ page }) => {
	await page.goto(SAYI);
	await expect(host(page)).toBeVisible();

	const shell = page.locator('#shell');
	await expect(shell).toHaveAttribute('inert', '');

	/* `inert` odağı ve işaretçiyi kesiyor ama KLAVYEYİ kesmiyor: tuvalin tuş
	   dinleyicisi belgede duruyor ve `inert` belge düzeyindeki dinleyiciyi
	   durdurmuyor. Onsuz okur tanıtımı okurken sayı arkada sessizce ilerlerdi. */
	const folio = page.locator('#folio-page');
	const once = await folio.textContent();
	await page.keyboard.press('ArrowDown');
	await page.keyboard.press('End');
	await page.waitForTimeout(600);
	expect(await folio.textContent()).toBe(once);

	/* Tuvaldeki düğme odak alamıyor. */
	const odaklandi = await page.evaluate(() => {
		const btn = document.querySelector<HTMLButtonElement>('.band__btn');
		btn?.focus();
		return document.activeElement === btn;
	});
	expect(odaklandi).toBe(false);
});

test('noktalar kaydırmayı izliyor', async ({ page }) => {
	await page.goto(SAYI);
	const slides = page.locator('.intro__slides');
	await expect(page.locator('.intro__dots i[data-on="true"]')).toHaveAttribute('data-i', '0');

	await slides.evaluate((el) => el.scrollTo({ top: el.clientHeight * 2, behavior: 'instant' }));
	await expect(page.locator('.intro__dots i[data-on="true"]')).toHaveAttribute('data-i', '2');
});

/* Üç çıkış da aynı kapıdan: katman kalkıyor, tuval geri geliyor, tercih
   yazılıyor. Ayrı ayrı sınanıyorlar çünkü üçü ayrı yerden `finish()` çağırıyor
   ve biri bağlanmadan kalırsa ötekiler bunu gizler. */
for (const [ad, cikis] of [
	['son karttaki düğme', (page: Page) => page.locator('.intro__start').click()],
	['Atla', (page: Page) => page.locator('.intro__skip').click()],
	['Escape', (page: Page) => page.keyboard.press('Escape')]
] as const) {
	test(`çıkış: ${ad}`, async ({ page }) => {
		await page.goto(SAYI);
		await expect(host(page)).toBeVisible();

		if (ad === 'son karttaki düğme') {
			/* Düğme yalnız son kartta; oraya kaydırmadan tıklanamaz. */
			await page
				.locator('.intro__slides')
				.evaluate((el) => el.scrollTo({ top: el.clientHeight * 4, behavior: 'instant' }));
		}
		await cikis(page);

		await expect(host(page)).toHaveCount(0);
		await expect(page.locator('#shell')).not.toHaveAttribute('inert', '');

		/* Tercih GERÇEKTEN uygulamanın anahtarına yazılıyor mu? Bu iddia aynı
		   zamanda e2e/prefs.ts'teki ikizlenmiş anahtarı da sabitliyor. */
		const kayit = await page.evaluate((key) => localStorage.getItem(key), PREFS_KEY);
		expect(kayit && JSON.parse(kayit).seenIntro).toBe(true);

		/* Tuval geri döndü: klavye yine sayfa çeviriyor. */
		await page.keyboard.press('ArrowDown');
		await expect(page.locator('#folio-page')).toHaveText(/^02 \//);
	});
}
