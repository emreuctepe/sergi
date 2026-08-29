/* ============================================================================
   VARLIK YOLU ↔ BASE SÖZLEŞMESİ
   ----------------------------------------------------------------------------
   `assetUrl` bu yolları SvelteKit'in varlık boru hattından GEÇİRMEDEN üretiyor
   (karar 1.15): içerik dosyaları `assets/…` yazıyor, tarayıcıya giden URL
   burada kuruluyor. Bedeli, SvelteKit'in `base` bilgisini bu fonksiyona ELLE
   taşımak zorunda olmamız — unutulursa alt yolda yayınlanan her görsel 404
   verir ve bunun kök yayında hiçbir belirtisi olmaz.

   Testler bu yüzden base'i BOŞ OLMAYAN bir değerle taklit ediyor: base ''
   iken base'i taşıyan kod ile taşımayan kod AYNI çıktıyı verir, yani boş base
   ile yazılmış bir test hiçbir şey ölçmez.

   `<source srcset>` ayrıca ölçülüyor çünkü onun kırılması `<img>`inkinden
   sessiz: `<source>` bir kez eşleştiğinde tarayıcı `<img>`e DÜŞMEZ (karar
   1.39), yani base'i yalnız türevlerde unutmak okura kırık görsel gösterirdi
   ve kök yayında hiçbir belirtisi olmazdı.

   ⚠️ Dürüstlük notu: bu dosya yazılırken `avifSrcset` içindeki `base` adlı
   yerel değişkenin import'u gölgelediği ve türevleri bozduğu SANILDI. Isırık
   testi bunu çürüttü — gölgeleme o fonksiyonun kapsamında kalıyor, `assetUrl`
   base'i kendi modül kapsamından okuyor ve türevler her zaman doğruydu.
   Değişken yine de yeniden adlandırıldı (okunurluk), ama burada yakalanmış
   bir hata YOK; bu testler ileriye dönük bir sözleşme.
   ========================================================================= */

import { describe, expect, it, vi } from 'vitest';

const BASE = '/onek/0.1';

/* Hoisted: assets.ts `$app/paths`'i modül gövdesinde import ediyor. */
vi.mock('$app/paths', () => ({ base: BASE }));

const { assetUrl, avifSrcset } = await import('./assets');

describe('assetUrl — base her yola giriyor', () => {
	it('içerik yolunun başına base ve tek eğik çizgi koyuyor', () => {
		expect(assetUrl('assets/2026-09/tren.webp')).toBe(`${BASE}/assets/2026-09/tren.webp`);
	});

	it('zaten eğik çizgiyle başlayan yolda çizgiyi İKİLEMİYOR', () => {
		expect(assetUrl('/assets/2026-09/tren.webp')).toBe(`${BASE}/assets/2026-09/tren.webp`);
	});
});

describe('avifSrcset — türevler de base alıyor', () => {
	it('srcset’teki HER URL base ile başlıyor', () => {
		const srcset = avifSrcset('assets/2026-09/kapak.webp');
		expect(srcset, 'kapak.webp manifestte var, null dönmemeli').toBeTruthy();

		const urller = srcset!.split(',').map((p) => p.trim().split(/\s+/)[0]);
		expect(urller.length, 'kapak.webp üç türev taşıyor').toBe(3);

		for (const url of urller) {
			expect(
				url.startsWith(`${BASE}/`),
				`"${url}" base taşımıyor — alt yolda yayınlanan sayıda bu türev 404 verir ` +
					've <source> eşleştiği için tarayıcı <img>e düşmez.'
			).toBe(true);
		}
	});

	it('genişlik tanımlayıcısı bozulmadan duruyor', () => {
		expect(avifSrcset('assets/2026-09/kapak.webp')).toContain(
			`${BASE}/assets/2026-09/kapak-600.avif 600w`
		);
	});

	it('manifestte olmayan dosya için null — çağıran <source> basmıyor', () => {
		expect(avifSrcset('assets/2026-09/olmayan.webp')).toBeNull();
	});
});
