/* ============================================================================
   İÇERİK PARİTE TESTİ — taşınan sayı ↔ prototip
   ----------------------------------------------------------------------------
   `src/content/2026-09/` prototipten `tools/tasi-icerik.mjs` ile üretildi.
   Bu test o üretimi bir sözleşmeye çeviriyor: dosyalar hâlâ script'in ürettiği
   şey mi? Taşıma sırasında ya da sonrasında istemeden değişen tek bir cümle bile
   kırmızı yanar.

   CSS tarafında aynı işi src/lib/styles/parity.test.ts yapıyor; gerekçe orada
   uzun uzun yazılı. Özeti: prototip uçtan uca çalışan bir referans, ondan sapmak
   serbest ama SESSİZCE sapmak değil.

   Neden burada, `src/content/` altında değil: o klasörün sahibi script ve script
   her çalıştığında klasörü sıfırdan yazıyor. Elle yazılmış bir dosya orada
   duramaz (bir kez denendi, taşıma onu sildi).

   ⚠️ Bu test 1.0'ın "tek sayı, bugünkü hâliyle" kararına dayanıyor
   (docs/BUILD-TODO.md). İçerik editöryel olarak yeniden açılırsa test de
   kapanır — o gün silinecek, esnetilmeyecek.
   ========================================================================= */

import { describe, expect, it } from 'vitest';
import { loadIssue, migratePuzzle, migrateSection } from '../../../tools/tasi-icerik.mjs';
import { BLOCK_TYPES } from './types';
import { content } from '../../content/2026-09/index';

const proto = loadIssue('2026-09');

const pages = content.sections.flatMap((s) => s.pages);
const blocks = pages.flatMap((p) => p.blocks);

describe('2026-09 ↔ prototip paritesi', () => {
	it('sayı künyesi birebir aynı', () => {
		expect(content.issue).toEqual(proto.issue);
	});

	it('tanıtım kartları birebir aynı', () => {
		expect(content.intro).toEqual(proto.intro);
	});

	it('bölümler, blok kimlikleri dışında birebir aynı', () => {
		expect(content.sections).toEqual(proto.sections.map(migrateSection));
	});

	it('bulmacalar, uydurma istatistikler dışında birebir aynı', () => {
		expect(content.puzzles).toEqual(proto.puzzles.map(migratePuzzle));
	});

	it('uydurma bulmaca istatistiği taşınmadı', () => {
		/* Prototipte plays/solves/firstTryRate/avgSeconds vardı ve hepsi uyduruktu.
		   Gerçek sayılar Faz 4'te sunucudan gelecek. */
		expect(proto.puzzles.every((p: { stats?: unknown }) => p.stats)).toBe(true);
		expect(content.puzzles.some((p) => 'stats' in p)).toBe(false);
	});
});

describe('2026-09 içerik bütünlüğü', () => {
	it('9 bölüm · 29 sayfa · 90 blok', () => {
		expect(content.sections).toHaveLength(9);
		expect(pages).toHaveLength(29);
		expect(blocks).toHaveLength(90);
	});

	it('19 blok tipinin hepsi kullanılıyor ve hepsi kayıtlı', () => {
		const used = new Set(blocks.map((b) => b.t));
		expect(used.size).toBe(19);
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
