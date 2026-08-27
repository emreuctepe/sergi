/* ============================================================================
   İÇERİK BÜTÜNLÜĞÜ
   ----------------------------------------------------------------------------
   Burada bir zamanlar bir PARİTE testi vardı: `src/content/2026-09/` prototipten
   `tools/tasi-icerik.mjs` ile üretilmişti ve test o üretimi bir sözleşmeye
   çeviriyordu — taşıma sırasında istemeden değişen tek bir cümle bile kırmızı
   yanardı. Kendi uyarısı şöyleydi: "Bu test 1.0'ın 'tek sayı, bugünkü hâliyle'
   kararına dayanıyor. İçerik editöryel olarak yeniden açılırsa test de kapanır
   — o gün silinecek, esnetilmeyecek."

   O gün geldi: "Fener Ustası" uydurma söyleşisinin yerine KargaManga ile
   yapılmış gerçek röportaj girdi (karar 1.42). Parite describe'ı esnetilmedi,
   silindi. `tools/tasi-icerik.mjs` dosya olarak duruyor — taşımanın tarih
   kaydı — ama artık bir sözleşme değil; `src/content/` elle bakımlı.

   Kalan şey pariteden bağımsızdı ve kalmaya devam ediyor: sayının kendi
   içinde tutarlı olup olmadığı. CSS tarafındaki parite (src/lib/styles/
   parity.test.ts) bundan etkilenmiyor, orada prototip hâlâ referans.
   ========================================================================= */

import { describe, expect, it } from 'vitest';
import { BLOCK_TYPES } from './types';
import { content } from '../../content/2026-09/index';

const pages = content.sections.flatMap((s) => s.pages);
const blocks = pages.flatMap((p) => p.blocks);

describe('2026-09 içerik bütünlüğü', () => {
	it('9 bölüm · 31 sayfa · 99 blok', () => {
		/* Sayılar 26/87'ydi: söyleşi 4 sayfa / 18 bloktan 9 sayfa / 30 bloğa
		   çıktı — her soru-cevap kendi snap'ine ayrıldı (karar 1.42). */
		expect(content.sections).toHaveLength(9);
		expect(pages).toHaveLength(31);
		expect(blocks).toHaveLength(99);
	});

	it('20 blok tipinin hepsi kullanılıyor ve hepsi kayıtlı', () => {
		const used = new Set(blocks.map((b) => b.t));
		expect(used.size).toBe(20);
		for (const t of used) expect(BLOCK_TYPES).toContain(t);
	});

	it('sayfa kimlikleri sayı içinde benzersiz', () => {
		const ids = pages.map((p) => p.id);
		expect(new Set(ids).size, `yinelenen sayfa kimliği: ${ids.join(', ')}`).toBe(ids.length);
	});

	it('blok kimlikleri benzersiz ve `sayfaId:index` biçiminde', () => {
		const ids = blocks.map((b) => b.id);
		expect(new Set(ids).size).toBe(ids.length);

		/* Biçim tesadüf değil: prototipte çizim anında türetilen kimlik buydu,
		   o kimliklere bağlı ankrajlar geçerli kalsın diye korundu. */
		for (const page of pages) {
			page.blocks.forEach((block, i) => {
				expect(block.id).toBe(`${page.id}:${i}`);
			});
		}
	});

	it('her sayfa en az bir derinlikte görünüyor', () => {
		for (const page of pages) {
			expect(page.depth.length, `${page.id} hiçbir modda görünmüyor`).toBeGreaterThan(0);
		}
	});

	it('bulmaca havuzundaki her kimliğin bir bulmacası var', () => {
		const known = new Set(content.puzzles.map((p) => p.id));
		for (const id of content.issue.puzzlePool ?? []) expect(known).toContain(id);
		if (content.issue.editorsPick) expect(known).toContain(content.issue.editorsPick);
	});
});
