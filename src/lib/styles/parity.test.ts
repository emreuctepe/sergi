/* ============================================================================
   CSS PARİTE TESTİ
   ----------------------------------------------------------------------------
   `src/lib/styles/*.css` prototipten taşındı. Taşıma bittiği anda dosyalar
   prototipteki halleriyle BAYT BAYT aynıydı — tek bir kasıtlı düzenleme dışında
   (font yolu, bkz. FORKED).

   Bu test o pariteyi bir sözleşmeye çeviriyor: taşıma sırasında istemeden
   değişen tek bir kural bile kırmızı yanar. Prototip 17 bin satırlık, uçtan uca
   çalışan bir referans; ondan sapmak serbest ama SESSİZCE sapmak değil.

   Bir dosyayı bilerek değiştirdiğinde: adını FORKED'e taşı ve nedenini yaz.
   Liste boşaldığında bu testin işi biter ve silinir.
   ========================================================================= */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../../..');

/** Prototiple birebir aynı kalması gereken dosyalar. */
const MIRRORED = ['base', 'canvas', 'blocks', 'comments', 'overlays', 'puzzles'] as const;

/**
 * Bilerek ayrılmış dosyalar: ad → ayrılma nedeni.
 * Buraya bir satır eklemek bir karardır, kaçamak değil.
 */
const FORKED: Record<string, string> = {
	tokens:
		'@font-face yolu static/fonts/ altına taşındı (prototipte ../assets/) ' +
		've lisans blocker notu eklendi.'
};

function read(p: string) {
	return readFileSync(resolve(root, p), 'utf-8');
}

describe('küresel CSS ↔ prototip paritesi', () => {
	it.each(MIRRORED)('%s.css prototiple birebir aynı', (name) => {
		const proto = read(`prototype/css/${name}.css`);
		const mine = read(`src/lib/styles/${name}.css`);

		expect(
			mine,
			`src/lib/styles/${name}.css prototipten ayrılmış. Kasıtlıysa FORKED listesine ` +
				`nedeniyle birlikte taşı; değilse taşıma sırasında bir şey kaydı.`
		).toBe(proto);
	});

	it('ayrılmış dosyaların her birinin yazılı bir nedeni var', () => {
		for (const [name, reason] of Object.entries(FORKED)) {
			expect(reason.length, `${name}.css için neden yazılmamış`).toBeGreaterThan(20);
		}
		expect(Object.keys(FORKED)).toContain('tokens');
	});

	it('tokens.css yalnızca beklenen iki noktada ayrılıyor', () => {
		const proto = read('prototype/css/tokens.css');
		const mine = read('src/lib/styles/tokens.css');

		/* Fark yalnızca @font-face bloğunda olmalı: yol değişti, uyarı notu eklendi.
		   Geri kalan her şey — bütün palet, ölçek ve sayı temaları — aynı. */
		expect(mine).toContain('url("/fonts/animeace2_reg.ttf")');
		expect(mine).not.toContain('../assets/animeace2_reg.ttf');

		const strip = (s: string) => s.slice(s.indexOf(':root'));
		expect(strip(mine), 'tokens.css’in :root sonrası gövdesi değişmemeli').toBe(strip(proto));
	});
});
