/* ============================================================================
   OKUMA MODU — uçtan uca
   ----------------------------------------------------------------------------
   `nearestVisible()` hangi sayfaya gidileceğini `flow.test.ts`'te tarayıcısız
   sınanıyor. Burada sınanan o KARAR değil, kararın UYGULANMASI: mod değişince
   belge kısalıyor, düzen yeniden akıyor ve okurun gerçekten o sayfada durup
   durmadığı ancak boyayan bir tarayıcıda görülebiliyor.

   Bu dosya bir hatanın üstüne yazıldı. Ankraj bir ara `update()` içinde
   tazeleniyordu; mod değişince akış effect'i de `update()` çağırıyor ve
   tarayıcı o an kaydırmayı KISALAN belgeye çoktan sıkıştırmış oluyordu.
   Sonuç: ankraj "okurun olduğu yer"den "belgenin sonu"na dönüşüyor ve konum
   koruma kendi kaydettiği yanlış yere sadakatle gidiyordu. Hiçbir birim testi
   bunu göremezdi — kırılan şey aritmetik değil, tarayıcının kaydırmayı ne
   zaman sıkıştırdığıydı.

   Sayfa kimlikleri (`km-4`, `km-imza`) `src/content/2026-09/`'dan geliyor ve
   `blockids.lock.json` onları kilitliyor; içerik değişirse burası da kırılır
   ve bu doğru davranış.
   ========================================================================= */

import { expect, test, type Page } from '@playwright/test';
import { sayiyaGir, tanitimiAtla } from './prefs';

const SAYI = '/sayi/2026-09';

/** Modların vaadi (bkz. validate.test.ts). Kartlardaki sayılar bunlar olmalı. */
const SAYFA = { min: 19, mid: 26, full: 30 } as const;

const modal = (page: Page) => page.locator('.modal');

/**
 * Tuvalin KENDİ okuduğu sayfa — `ustteki`nin aksine ölçüm değil, tuvale sorma.
 *
 * Folio `current`ı yayımlıyor (`01 / 30`) ve ankraj da ondan türüyor
 * (`Canvas.svelte`: `anchorId = items[current].page.id`). Yani folio'nun
 * gösterdiği sıra, konum korumanın mod değişince bakacağı yerdir.
 */
async function ankraj(page: Page) {
	const folio = await page.locator('#folio-page').textContent();
	const sira = Number(folio?.trim().split('/')[0]);
	if (!sira) return null;
	return page
		.locator('.page')
		.nth(sira - 1)
		.getAttribute('data-page-id');
}

/** Ekranın üstünde duran sayfanın kimliği — okurun "olduğu yer". */
function ustteki(page: Page) {
	return page.evaluate(() => {
		const scroller = document.querySelector('#pages');
		if (!scroller) return null;
		const pages = [...document.querySelectorAll<HTMLElement>('.page')];
		/* Bantların altındaki ilk sayfa: üst kenarı ekranın içinde kalan ve
		   altı henüz çıkmamış olan. Snap'li tuvalde bu tek bir sayfa. */
		const on = pages.find((p) => {
			const r = p.getBoundingClientRect();
			return r.bottom > 100 && r.top < scroller.clientHeight / 2;
		});
		return on?.dataset.pageId ?? null;
	});
}

/** Çipten seçiciyi açıp verilen modu seçer. */
async function moduSec(page: Page, ad: string) {
	await page.locator('.depth-chip').click();
	await expect(modal(page)).toBeVisible();
	await page.locator('.depth-card', { hasText: ad }).click();
	await expect(modal(page)).toHaveCount(0);
}

/**
 * Okuru verilen sayfaya koyar: oraya kaydırır ve TUVALİN ANKRAJI orası olana
 * kadar bekler.
 *
 * İki ayrıntı bu yardımcıyı bir zamanlar güvenilmez yapıyordu, ikisi de
 * "kaydırma bitti" sanmakla ilgili:
 *
 * 1. `scrollTop = …` ATAMASI ANİ DEĞİL. `.pages` CSS'te
 *    `scroll-behavior: smooth` (`canvas.css:108`) ve bu, düz atamayı da ~1 sn
 *    süren bir animasyona çeviriyor. Yardımcı hedefi ekranda görür görmez
 *    dönüyordu — yol daha yarıdayken — ve mod değişimi kaydırmanın ortasında
 *    oluyordu. `behavior: 'instant'` bunu kapatıyor.
 *
 * 2. Sayfanın EKRANDA görünmesi, ankrajın o sayfa olduğu anlamına gelmiyor.
 *    Ankrajı tuval `indexAt()` ile kendisi belirliyor; konum koruma da ona
 *    bakıyor. O yüzden burada beklenen şey tuvalin kendi cevabı (`ankraj`),
 *    testin ekrandan yaptığı tahmin değil.
 */
async function sayfayaGit(page: Page, id: string) {
	await page.evaluate((pageId) => {
		const scroller = document.querySelector('#pages');
		const target = [...document.querySelectorAll<HTMLElement>('.page')].find(
			(p) => p.dataset.pageId === pageId
		);
		if (scroller && target) scroller.scrollTo({ top: target.offsetTop, behavior: 'instant' });
	}, id);
	await expect.poll(() => ankraj(page)).toBe(id);
}

test.beforeEach(async ({ page }) => {
	await tanitimiAtla(page, 'full');
	await sayiyaGir(page, SAYI);
	await expect(page.locator('.page')).toHaveCount(SAYFA.full);
});

/* ==========================================================================
   ÇİP
   ======================================================================= */

test('bant çipi seçili modu söylüyor ve seçiciyi açıyor', async ({ page }) => {
	const chip = page.locator('.depth-chip');
	await expect(chip).toHaveText('Doomreader');

	await chip.click();
	await expect(modal(page)).toBeVisible();

	/* Çipten açılan seçici KAPATILABİLİR — ortada zaten bir seçim var.
	   (İlk açılıştaki kapatılamaz hâli tanitim.e2e.ts'te.) */
	await page.locator('.modal__x').click();
	await expect(modal(page)).toHaveCount(0);
	await expect(page.locator('.page')).toHaveCount(SAYFA.full);
});

test('kartlardaki sayfa sayısı akışın kendisiyle aynı', async ({ page }) => {
	await page.locator('.depth-chip').click();

	/* Kartın vaat ettiği sayı ile tuvalin çizdiği sayı ayrı yerlerden geliyor
	   (`flow()` iki kez sayıyor). Ayrışırlarsa okura yalan söylenmiş olur. */
	for (const [mod, adet] of Object.entries(SAYFA)) {
		await expect(page.locator(`.depth-card[data-mod="${mod}"] .depth-card__meta`)).toContainText(
			`${adet} sayfa`
		);
	}
});

/* ==========================================================================
   KONUM KORUMA
   ======================================================================= */

/* Konum koruma BİR KARE SONRA çalışıyor ve bu bilinçli: effect tetiklendiğinde
   tarayıcı kısalan belgenin düzenini daha hesaplamamış oluyor, o anda verilen
   `scrollTo` yutuluyordu (gerekçe `Canvas.svelte`te yazılı). Yani sayfa sayısı
   yeni moda döndüğünde düzeltme HENÜZ OLMAMIŞ olabilir: aradaki o karede
   `scrollTop` hâlâ eski akışın konumu, yeni akışta başka bir sayfaya denk
   geliyor. Bu yüzden konum iddiaları BEKLEYEN iddialar — tek atışlık bir
   `expect(await …)` o kareyi yakalayıp haksız yere kırmızı yanıyordu. */

test('sayfa yeni modda DURUYORSA okur oradan kalkmıyor', async ({ page }) => {
	/* `gh-acilis` üç modda da var: bölüm açılışları hiçbir yerde düşmüyor. */
	await sayfayaGit(page, 'gh-acilis');

	await moduSec(page, 'Doomscroller');
	await expect(page.locator('.page')).toHaveCount(SAYFA.min);
	await expect.poll(() => ustteki(page)).toBe('gh-acilis');

	/* Geri dönüş de aynı: mod değiştirmenin bedeli yerini kaybetmek değil. */
	await moduSec(page, 'Dengeli');
	await expect(page.locator('.page')).toHaveCount(SAYFA.mid);
	await expect.poll(() => ustteki(page)).toBe('gh-acilis');
});

test('sayfa yeni modda YOKSA en yakın görünür sayfaya iniliyor', async ({ page }) => {
	/* `km-4` yalnız `full`de var. `min`de karşılığı yok; `nearestVisible` iki
	   yönlü arayıp `km-imza`yı veriyor (flow.test.ts aynı iddiayı taşıyor). */
	await sayfayaGit(page, 'km-4');
	await expect(page.locator('.page[data-page-id="km-4"]')).toHaveCount(1);

	await moduSec(page, 'Doomscroller');
	await expect(page.locator('.page[data-page-id="km-4"]')).toHaveCount(0);
	await expect.poll(() => ustteki(page)).toBe('km-imza');
});

test('seçim kalıcı: yeniden açılınca aynı modda ve seçici gelmiyor', async ({ page }) => {
	await moduSec(page, 'Doomscroller');

	await page.reload();
	await expect(page.locator('.page')).toHaveCount(SAYFA.min);
	await expect(modal(page)).toHaveCount(0);
	await expect(page.locator('.depth-chip')).toHaveText('Doomscroller');
});
