/* ============================================================================
   TUVAL — uçtan uca
   ----------------------------------------------------------------------------
   Faz 1d'nin aritmetiği `geometry.test.ts`'te tarayıcısız sınanıyor. Burada
   sınanan şey aritmetik değil BAĞLANTI: kaydırma olayı gerçekten folio'yu
   değiştiriyor mu, klavye gerçekten sayfa çeviriyor mu, sayfa görününce
   animasyon gerçekten açılıyor mu.

   Bu üçü ancak boyayan bir tarayıcıda görülebilir — IntersectionObserver ve
   requestAnimationFrame, sekme boyanmıyorsa hiç çalışmaz. (Geliştirme
   sırasında kullanılan gömülü önizleme paneli tam olarak öyleydi; sahne
   tetiklemesinin "çalışmıyor" görünmesinin sebebi buydu.)

   Testler ÜRETİM DERLEMESİNE bakıyor (playwright.config.ts `build` +
   `preview` çalıştırıyor): geliştirme sunucusunda çalışıp derlemede kırılan
   bir şeyi yayın gününde öğrenmek istemiyoruz.
   ========================================================================= */

import { expect, test, type Page } from '@playwright/test';
import { sayiyaGir, tanitimiAtla } from './prefs';

const SAYI = '/sayi/2026-09';

/** `full` modun vaadi (bkz. validate.test.ts: min 19 / mid 26 / full 30). */
const SAYFA_SAYISI = 30;

/** Folio biçimi: `01 / 30`. Sayı tek yerde dursun diye dizgi burada kuruluyor —
    öncesinde her iddiada elle yazılıydı ve bir sayfa eklenince yedi yer kayıyordu. */
const folioText = (n: number) => `${String(n).padStart(2, '0')} / ${SAYFA_SAYISI}`;

/** Okuma ilerlemesi (%). */
const percent = (page: Page) =>
	page.locator('[role="progressbar"]').getAttribute('aria-valuenow').then(Number);

test.beforeEach(async ({ page }) => {
	/* Bu dosyanın konusu tuval; tanıtım kartları (tanitim.e2e.ts) ve arkasından
	   gelen mod seçici (mod.e2e.ts) ilk ziyarette tuvali `inert` yapıp önüne
	   geçiyor. Okur ikisini de geçmiş olarak giriyor: tanıtımı görmüş, modu
	   `full` — bu dosyadaki her sayım (`SAYFA_SAYISI`) o moda ait. */
	await tanitimiAtla(page);
	await sayiyaGir(page, SAYI);
	await expect(page.locator('.page')).toHaveCount(SAYFA_SAYISI);
});

/* ==========================================================================
   AÇILIŞ
   ======================================================================= */

test('sayı kapakla açılıyor ve kapak GÖRÜNÜR', async ({ page }) => {
	const cover = page.locator('.cover__title');
	await expect(cover).toHaveText('Kızıl Mevsim');

	/* Asıl mesele: giriş animasyonları `opacity: 0` ile başlıyor. İlk sayfa
	   görünür doğmasaydı okur bomboş bir tuval görürdü. */
	await expect(cover).toBeVisible();
	await expect(page.locator('.page').first()).toHaveAttribute('data-inview', 'true');

	/* Kapakta folio susuyor — o sayfa kendi başına bir kompozisyon. */
	await expect(page.locator('#folio')).toHaveAttribute('data-hidden', 'true');
});

test('yatay taşma yok', async ({ page }) => {
	const overflow = await page.evaluate(
		() => document.documentElement.scrollWidth > document.documentElement.clientWidth
	);
	expect(overflow).toBe(false);
});

/* ==========================================================================
   GEZİNME
   ======================================================================= */

test('klavye sayfa çeviriyor, folio ve ilerleme onunla geliyor', async ({ page }) => {
	const folio = page.locator('#folio-page');
	await expect(folio).toHaveText(folioText(1));

	await page.keyboard.press('ArrowDown');
	await expect(folio).toHaveText(folioText(2));
	await expect(page.locator('#folio')).toHaveAttribute('data-hidden', 'false');

	/* Folio hedefi anında gösteriyor (gezinme niyeti belli), ilerleme çubuğu ise
	   gerçek konumu ÖLÇÜYOR — yani yumuşak kaydırma bitene kadar geride kalır.
	   Bu yüzden okunana kadar bekleniyor: ikisinin farkı bilinçli. */
	await expect.poll(() => percent(page), { timeout: 3000 }).toBeGreaterThan(0);

	await page.keyboard.press('ArrowUp');
	await expect(folio).toHaveText(folioText(1));
});

test('End sayının sonuna, Home başına götürüyor', async ({ page }) => {
	await page.keyboard.press('End');
	await expect(page.locator('#folio-page')).toHaveText(folioText(SAYFA_SAYISI));
	await expect.poll(() => percent(page), { timeout: 5000 }).toBeGreaterThan(95);

	await page.keyboard.press('Home');
	await expect(page.locator('#folio-page')).toHaveText(folioText(1));
	await expect.poll(() => percent(page), { timeout: 5000 }).toBe(0);
});

test('gezinme düğmeleri uçlarda kapanıyor', async ({ page }) => {
	const prev = page.getByRole('button', { name: 'Önceki sayfa' });
	const next = page.getByRole('button', { name: 'Sonraki sayfa' });

	await expect(prev).toBeDisabled();
	await expect(next).toBeEnabled();

	await next.click();
	await expect(prev).toBeEnabled();

	await page.keyboard.press('End');
	await expect(next).toBeDisabled();
});

/* ==========================================================================
   ÇİZİLMİŞ SAHNELER (1e)
   --------------------------------------------------------------------------
   Sahne geometrisinin prototiple paritesi `src/lib/art/art.test.ts`'te
   tarayıcısız ölçülüyor. Burada sorulan başka bir soru: SVG gerçekten SAYFAYA
   BASILIYOR mu, ve boyanınca bir alan kaplıyor mu? `url(#…)` başvurusu tutmayan
   bir degrade ya da 0×0 çizilen bir `<svg>` birim testinden geçer, ekranda
   hiçbir şey göstermez.
   ======================================================================= */

/**
 * `bg: "scene:…"` diyen üç sayfa — ed-1, bl-1 (paper), son-kunye (sumi).
 *
 * Dörttü: `sy-acilis` `scene:portrait` kullanıyordu, söyleşinin açılışı çizerin
 * kendi karga portresine geçince (karar 1.45) bıraktı. `portrait` sahnesi kayıtlı
 * ama artık HİÇBİR sayfa çağırmıyor — silinmedi, çünkü kodu duruyor ve 1f'de
 * tanıtım kartları sahne kadrosunu zaten yeniden açacak. O gün ya bir kullanıcı
 * bulur ya kayıttan düşer.
 */
const SAHNELI_SAYFA = 3;

test('çizilmiş sahneler sayfaya basılıyor', async ({ page }) => {
	const scenes = page.locator('.page__bg > svg.art');
	await expect(scenes).toHaveCount(SAHNELI_SAYFA);

	/* İlk sahne (ed-1) açılıştan hemen sonra akışın başında — ölçülebilir bir
	   alan kaplamalı. `toBeVisible` yetmez: 0 yükseklikli bir svg de "görünür". */
	const box = await scenes.first().boundingBox();
	expect(box?.width ?? 0).toBeGreaterThan(100);
	expect(box?.height ?? 0).toBeGreaterThan(100);
});

test('sahnelerin id başvuruları tutuyor', async ({ page }) => {
	/* Sumi ve portre degradelerini `url(#…)` ile çağırıyor. Aynı sahne bir
	   belgede iki kez çizilirse sabit bir id ikinci örneği birincininkine
	   bağlardı; bileşenler bu yüzden `$props.id()` kullanıyor. Test kimliklerin
	   BENZERSİZ olduğunu ve her başvurunun bir tanımı bulduğunu ölçüyor. */
	const { ids, refs } = await page.evaluate(() => {
		const roots = [...document.querySelectorAll('.page__bg > svg.art')];
		return {
			ids: roots.flatMap((s) => [...s.querySelectorAll('[id]')].map((n) => n.id)),
			refs: roots.flatMap((s) =>
				[...s.querySelectorAll('[fill^="url(#"]')].map((n) =>
					(n.getAttribute('fill') ?? '').slice(5, -1)
				)
			)
		};
	});

	expect(new Set(ids).size, `yinelenen sahne id'si: ${ids.join(', ')}`).toBe(ids.length);
	expect(refs.length).toBeGreaterThan(0);
	for (const ref of refs) expect(ids, `url(#${ref}) karşılıksız`).toContain(ref);
});

/* ==========================================================================
   SAHNE TETİKLEME
   ======================================================================= */

test('aşağıdaki sayfa görününce açılıyor', async ({ page }) => {
	/* Üçüncü sayfa açılışta ekranın altında: gizlenmiş olmalı. */
	const third = page.locator('.page').nth(2);
	await expect(third).toHaveAttribute('data-inview', 'false');

	await page.keyboard.press('ArrowDown');
	await page.keyboard.press('ArrowDown');

	await expect(third).toHaveAttribute('data-inview', 'true');
	/* Ve gerçekten okunur hâle geldi — öznitelik değil, piksel. */
	await expect(third.locator('.blk').first()).toBeVisible();
});

test('sayı baştan sona okununca hiçbir sayfa gizli kalmıyor', async ({ page }) => {
	test.slow();

	/* Sona ATLAMAK yetmez, atlanan sayfalar hiç kesişmez — okur gibi tek tek
	   gezmek gerek. Bu testin asıl sorusu da o zaten: sayıyı baştan sona okuyan
	   biri her sayfayı GÖRÜYOR mu?

	   Basış sayısı sayfa sayısından fazla: uzun (`fit: scroll`) sayfalar bir
	   basışta bitmiyor, önce kendi içlerinde ilerliyorlar — ki doğrusu bu, aksi
	   hâlde bir tuş yazının yarısını atlardı. */
	const folio = page.locator('#folio-page');
	for (let i = 0; i < 60 && (await folio.textContent())?.trim() !== folioText(SAYFA_SAYISI); i++) {
		await page.keyboard.press('ArrowDown');
		await page.waitForTimeout(120);
	}

	await expect(folio).toHaveText(folioText(SAYFA_SAYISI));
	await expect(page.locator('.page[data-inview="false"]')).toHaveCount(0);
});

/* ==========================================================================
   TUVAL ÖLÇÜSÜ
   ======================================================================= */

test('tuval 3:4 kalıyor ve bantlara yer varsa letterbox roomy', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 1000 });

	const box = await page.locator('#canvas').boundingBox();
	expect(box).not.toBeNull();
	expect(box!.height / box!.width).toBeCloseTo(4 / 3, 1);

	await expect(page.locator('#shell')).toHaveAttribute('data-letterbox', 'roomy');
});

/**
 * Telefonda tuval 3:4'ten UZAR — `canvas.css`'teki `max-aspect-ratio: 3/4`
 * kuralı tuvali "letterbox tam bir bant yüksekliğine inene kadar" büyütüyor,
 * böylece 19.5:9 bir ekranda altta üstte ölü alan kalmıyor.
 *
 * Yani telefonda beklenen `tight` değil `roomy`: boşluk bandın tam boyunda.
 * (Bu test önce "tight" bekleyerek yazıldı ve düştü — CSS'in kendi notu
 * okununca yanlış olanın test olduğu görüldü.)
 */
test('telefonda bantlar boşluğa tam oturuyor', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await expect(page.locator('#shell')).toHaveAttribute('data-letterbox', 'roomy');
});

test('kısa pencerede bantlar tuvalin üstüne biniyor', async ({ page }) => {
	/* Basık masaüstü penceresi: tuval yüksekliğe sıkışıyor, üstte altta bant
	   boyu kadar yer kalmıyor — bantlar tuvalin üzerine binip perde açıyor. */
	await page.setViewportSize({ width: 1280, height: 640 });
	await expect(page.locator('#shell')).toHaveAttribute('data-letterbox', 'tight');
});

/* ==========================================================================
   TAŞMA — docs/BUILD-TODO.md "karar bekleyen sorular" #4'ün cevabı
   --------------------------------------------------------------------------
   `fit: contain` bir sayfa tuvale SIĞMAK ZORUNDA: `.page` `overflow: hidden`,
   yani sığmayan metnin altı KIRPILIYOR. Sayfa hatasız görünür, yalnızca
   eksiktir — kimsenin fark etmediği türden bir kayıp. Derleme anında
   denetlenemez; ancak gerçek yazı tipiyle, gerçek ekran ölçüsünde belli olur.

   ÜÇ SAYFA ŞU AN TAŞIYOR ve bu Faz 1d'de gelmiş bir gerileme DEĞİL: aynı
   prototip aynı ölçüde birebir aynı üç sayfada taşıyor (2026-09'u prototipte
   1280×1000'de ölçtük: km-acilis 817>747, km-imza 811>747, son-kunye
   1343>747; bu build'de 813 / 800 / 1343). Yani devraldığımız bir içerik
   borcu — düzeltmesi editöryel bir karar (`fit: 'scroll'` mü, metin mi kısa).

   Test o yüzden "taşma yok" demiyor, BİLİNEN LİSTEYİ sabitliyor: liste
   büyürse kırmızı yanar, küçülürse (borç ödenirse) de kırmızı yanar ve
   buradan silinir.
   ======================================================================= */

const TASAN_SAYFALAR = ['km-acilis', 'km-imza', 'son-kunye'];

for (const ekran of [
	{ ad: 'telefon', width: 390, height: 844 },
	{ ad: 'masaüstü', width: 1280, height: 1000 }
]) {
	test(`${ekran.ad}: yalnızca bilinen üç sayfa taşıyor`, async ({ page }) => {
		await page.setViewportSize({ width: ekran.width, height: ekran.height });

		/* Görseller yüklenmeden ölçmek yalan söyler: yüklenince sayfa uzar. */
		await page.waitForLoadState('networkidle');

		const tasan = await page.evaluate(() =>
			[...document.querySelectorAll<HTMLElement>('.page[data-fit="contain"]')]
				.filter((el) => el.scrollHeight > el.clientHeight + 1)
				.map((el) => el.dataset.pageId!)
		);

		expect(tasan.sort()).toEqual([...TASAN_SAYFALAR].sort());
	});
}
