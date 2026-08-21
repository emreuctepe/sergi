/* ============================================================================
   SAHNE PARİTESİ — taşınan geometri ↔ prototip
   ----------------------------------------------------------------------------
   `sumi` sahnesi sayıları bir tohumdan üretiyor: 14 sıçrama, 5 imge sütunu,
   mühürde 5 kesik. Elle taşınan böyle bir üretecin "çalıştığı" gözle
   anlaşılmaz — kompozisyon yanlış tohumda da makul GÖRÜNÜR, sadece prototipteki
   olmaz. Bu yüzden sayılar prototipin kendi çıktısıyla karşılaştırılıyor.

   Neden dizgi değil sayı karşılaştırıyoruz: prototip SVG'yi dizgi olarak
   kuruyor, Svelte ise DOM olarak. Öznitelik sırası ve boşluk kaçınılmaz olarak
   ayrışır; ayrışmaması gereken şey KOORDİNAT.

   `rng` çağrı sırası da burada kilitleniyor — bir satırı yukarı almak diziyi
   kaydırır ve kompozisyon sessizce başkalaşır.
   ========================================================================= */

import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { rng } from './rng';
import { SEAL_SEED, SUMI_SEED, sealCuts, sumiInk } from './sumi';
import { SCENE_NAMES } from './scenes';

const require = createRequire(import.meta.url);
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');

/**
 * Prototipin `art.js`'ini sahte bir `window` altında çalıştırır — taşıma
 * script'indeki (`tools/tasi-icerik.mjs`) numaranın aynısı. `util.js` önce
 * yüklenmeli, `art.js` `MAG.util`'i yükleme anında okuyor.
 */
function loadProto() {
	const g = globalThis as unknown as Record<string, unknown>;
	g.window = { MAG: {} };

	/* `util.js` yükleme anında `document.createElement("i")` çağırıyor — modüller
	   arası olay yayını için bir düğüm kuruyor. `art.js`'in DOM'a ihtiyacı yok
	   ama `util.js` onun ön koşulu. Node'un kendi `EventTarget`'ı yayının
	   ihtiyaç duyduğu üç metodu zaten veriyor; jsdom kurmak için sebep değil. */
	g.document = { createElement: () => new EventTarget() };
	for (const file of ['prototype/js/util.js', 'prototype/js/art.js']) {
		const p = resolve(root, file);
		delete require.cache[require.resolve(p)];
		require(p);
	}
	return (
		g.window as {
			MAG: {
				art: { scene: (n: string) => string; has: (n: string) => boolean };
				util: { rng: (seed: number) => () => number };
			};
		}
	).MAG;
}

const { art, util } = loadProto();
const sumiSvg = art.scene('sumi');

/** `<line x1=… y1=… x2=… y2=…/>` → sayı dörtlüsü, dizgideki sırayla. */
const lines = (svg: string) =>
	[...svg.matchAll(/<line x1="([-\d.]+)" y1="([-\d.]+)" x2="([-\d.]+)" y2="([-\d.]+)"\/>/g)].map(
		(m) => ({ x1: +m[1], y1: +m[2], x2: +m[3], y2: +m[4] })
	);

/** Sıçramalar: `fill="var(--ink)"` grubunun içindeki çemberler. */
const splatterOf = (svg: string) => {
	const open = '<g fill="var(--ink)">';
	const start = svg.indexOf(open) + open.length;
	const group = svg.slice(start, svg.indexOf('</g>', start));
	return [
		...group.matchAll(/<circle cx="([-\d.]+)" cy="([-\d.]+)" r="([\d.]+)" opacity="([\d.]+)"/g)
	].map((m) => ({ cx: +m[1], cy: +m[2], r: +m[3], opacity: +m[4] }));
};

describe('rng — prototiple aynı dizi', () => {
	it('aynı tohum aynı sayıları veriyor', () => {
		const mine = rng(SUMI_SEED);
		const theirs = util.rng(SUMI_SEED);
		for (let i = 0; i < 50; i++) expect(mine()).toBe(theirs());
	});

	it('tohum sabit olduğu için çıktı da sabit', () => {
		/* Sunucuda çizilen ile tarayıcıda hidratlanan aynı olmak zorunda —
		   `Math.random()` olsaydı Svelte hydration_mismatch derdi. */
		expect(sumiInk()).toEqual(sumiInk());
	});
});

describe('sumi ↔ prototip', () => {
	const { glyphs, splatter } = sumiInk();

	it('sıçramalar birebir aynı yere düşüyor', () => {
		const theirs = splatterOf(sumiSvg);
		expect(theirs).toHaveLength(14);
		expect(splatter).toEqual(theirs);
	});

	it('imge sütunu ve mühür kesikleri birebir aynı', () => {
		/* Prototipin çıktı sırası: sıçrama → sütun → mühür. `<line>` yalnız son
		   ikisinde geçiyor, o yüzden hepsini sırayla alıp ikiye bölmek yeterli. */
		const all = lines(sumiSvg);
		const cuts = sealCuts(240, 206, 28, SEAL_SEED);

		expect(all).toHaveLength(glyphs.length + cuts.length);
		expect(all.slice(0, glyphs.length)).toEqual(glyphs);
		expect(all.slice(glyphs.length)).toEqual(cuts);
	});
});

describe('sahne kaydı', () => {
	it('kayıtlı her sahne prototipte de var', () => {
		for (const name of SCENE_NAMES) expect(art.has(name), `${name} prototipte yok`).toBeTruthy();
	});

	it("yalnız 2026-09'un kullandığı sahneler taşındı", () => {
		/* Prototipte 22 sahne var; 19'u yalnız 2026-10'a ait ve 1.0'a girmiyor
		   (bkz. docs/BUILD-TODO.md karar 1.29). Sayı burada kilitli ki "bir
		   sahne daha lazım" kararı diff'te görünsün. */
		expect([...SCENE_NAMES].sort()).toEqual(['paper', 'portrait', 'sumi']);
	});
});
