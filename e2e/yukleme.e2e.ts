/* ============================================================================
   YÜKLEME EKRANI — uçtan uca
   ----------------------------------------------------------------------------
   Bu katmanın hiçbir parçası tarayıcısız sınanamıyor: yüzde gerçek `load`
   olaylarından geliyor, katman önceden çizilen HTML'in içinde doğuyor ve
   kalkması `document.fonts.ready`ye bağlı. Üçü de ancak indiren bir tarayıcıda
   anlam taşıyor.

   Görseller BİLEREK geciktiriliyor (`page.route`). Yerelde sayının tamamı
   milisaniyelerde iniyor ve ekran görülemeden kapanıyor — yani geciktirmeden
   yazılan bir test, ekranı hiç açılmamış olsa da yeşil yanardı.
   ========================================================================= */

import { expect, test, type Page } from '@playwright/test';
import { tanitimiAtla } from './prefs';

const SAYI = '/sayi/2026-09';

/** İçeriğin atıfta bulunduğu dosya sayısı (validate.test.ts ile aynı sayı). */
const GORSEL_SAYISI = 26;

/**
 * YALNIZ sayının görselleri.
 *
 * ⚠️ Desen bir ara `**‍/assets/**` idi ve uygulamanın KENDİ varlıklarını da
 * yakalıyordu: favicon ve derlenmiş CSS `/_app/immutable/assets/…` altında
 * duruyor. Sayaç 26 yerine 29 gördü ve bu, çift indirme sanılabilecek bir
 * yanlış alarmdı — ölçülünce sayfanın her görseli kendi türevine çözülüyordu.
 * Ders: "assets" bu depoda iki ayrı şeyin adı.
 */
const SAYI_VARLIKLARI = '**/assets/2026-09/**';

const loader = (page: Page) => page.locator('#loader');

/** Her görsel yanıtını `ms` kadar bekletir — ekran açık kalsın diye. */
async function gorselleriYavaslat(page: Page, ms: number) {
	await page.route(SAYI_VARLIKLARI, async (route) => {
		await new Promise((r) => setTimeout(r, ms));
		await route.continue();
	});
}

test('katman ÖNCEDEN ÇİZİLEN HTML’de: betik gelmeden önce ortada', async ({ browser }) => {
	/* JavaScript kapalı: hidrasyon hiç olmuyor, yani görülen şey yalnızca
	   sunucudan gelen işaretleme. Katman oradaysa okur betiği beklerken
	   kırık sayıya bakmıyor demektir — bu ekranın varlık sebebi. */
	const context = await browser.newContext({ javaScriptEnabled: false });
	const page = await context.newPage();
	await page.goto(SAYI);

	await expect(loader(page)).toHaveAttribute('data-cikiyor', 'false');
	await expect(page.locator('.loader__pct')).toHaveAttribute('aria-label', '%0 yüklendi');
	await expect(page.locator('.loader__line')).toHaveText('sayfalar basılıyor…');

	await context.close();
});

test('betik yoksa katman GİZLENİYOR — okur sonsuza kadar %0’da kalmıyor', async ({ browser }) => {
	const context = await browser.newContext({ javaScriptEnabled: false });
	const page = await context.newPage();
	await page.goto(SAYI);

	/* `<noscript>` kuralı devrede: işaretleme duruyor ama görünmüyor.
	   Onsuz JS'siz tarayıcıda dergi hiç açılmazdı — katmanı kaldıran kod JS. */
	await expect(loader(page)).toBeHidden();
	await expect(page.locator('.cover__title')).toBeVisible();

	await context.close();
});

test('yüzde GERÇEK: ilerliyor, 100’de bitiyor ve katman kalkıyor', async ({ page }) => {
	await tanitimiAtla(page);
	await gorselleriYavaslat(page, 40);
	await page.goto(SAYI);

	await expect(loader(page)).toBeVisible();

	/* Tuval yüklenirken ÇEKİLİ: arkada duran sayı henüz eksik boyanmış. */
	await expect(page.locator('#shell')).toHaveAttribute('inert', '');

	const yuzde = () =>
		page
			.locator('.loader__pct')
			.getAttribute('aria-label')
			.then((s) => Number(s?.match(/\d+/)?.[0] ?? -1));

	/* Sayı ARTIYOR — sabit kalan bir "%0" da teknik olarak "gerçek" olurdu. */
	await expect.poll(yuzde).toBeGreaterThan(0);
	await expect.poll(yuzde, { timeout: 15000 }).toBe(100);

	/* Ve biter bitmez kalkıyor: okur bekletilmiyor (karar: "hemen kaybolsun"). */
	await expect(loader(page)).toHaveCount(0);
	await expect(page.locator('#shell')).not.toHaveAttribute('inert', '');
});

test('yüzde sayının BÜTÜN görsellerini sayıyor', async ({ page }) => {
	await tanitimiAtla(page);

	/* İstenen varlıkları say: ön yükleyici hepsini çağırmazsa "%100" eksik bir
	   sayı için verilmiş söz olurdu. */
	const istenen = new Set<string>();
	await page.route(SAYI_VARLIKLARI, async (route) => {
		istenen.add(new URL(route.request().url()).pathname);
		await route.continue();
	});

	await page.goto(SAYI);
	await expect(loader(page)).toHaveCount(0);

	expect(istenen.size).toBe(GORSEL_SAYISI);
});

test('satır 2 saniyede bir değişiyor', async ({ page }) => {
	await tanitimiAtla(page);
	/* İstekler PARALEL gidiyor, yani gecikme TOPLANMIYOR: ekranın ömrü 26
	   görselin süresi değil, EN YAVAŞ görselin süresi. 260 ve 800 ms bu yüzden
	   yetmedi — ikisinde de tamamı ilk turda inip ekran 2 saniyeyi görmeden
	   kapandı. Tek isteğin kendisi satır süresini aşmalı. */
	await gorselleriYavaslat(page, 4000);

	/* `commit`: varsayılan `goto` `load` olayını bekliyor, o da geciktirdiğimiz
	   görselleri bekliyor — geri döndüğünde satır ÇOKTAN değişmiş oluyordu ve
	   test ilk satırı hiç göremiyordu. Ölçtüğümüz şey zamanlama olduğu için
	   sayfanın kontrolünü mümkün olan en erken anda almamız gerekiyor. */
	await page.goto(SAYI, { waitUntil: 'commit' });

	const satir = page.locator('.loader__line');
	await expect(satir).toHaveText('sayfalar basılıyor…');
	await expect(satir).toHaveText('mürekkep kuruyor…', { timeout: 4000 });
});
