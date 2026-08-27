/* ============================================================================
   DÜŞEN YAPRAKLAR — serpiştirmenin geometrisi
   ----------------------------------------------------------------------------
   `Leaves.svelte` yalnızca çiziyor; on yedi yaprağın nereye, ne kadar dönmüş ve
   hangi tonda düşeceği burada. Ayrımın gerekçesi `sumi.ts` ile aynı: girdi
   sayı, çıktı sayı olunca prototiple karşılaştırılabiliyor (`art.test.ts`).

   ⚠️ RASTGELE ÇAĞRI SIRASI SÖZLEŞMENİN PARÇASI: konum → ölçek → dönüş →
   saydamlık → ton. Bir satırı yukarı almak diziyi kaydırır ve bütün
   kompozisyon başkalaşır — üstelik yine "makul" görünerek.
   ========================================================================= */

import { rng, round } from './rng';

/** Yaprağın üç sonbahar tonu — sayının kendi paletinden geliyor. */
export const LEAF_TONES = ['var(--accent)', 'var(--accent-2)', 'var(--accent-3)'] as const;

/** Tek bir yaprağın yerleşimi. Değerler viewBox birimi (300×400). */
export interface FallenLeaf {
	x: number;
	y: number;
	/** Derece. */
	rotate: number;
	scale: number;
	opacity: number;
	tone: (typeof LEAF_TONES)[number];
}

/** Prototipten aynen: 31337. */
export const LEAVES_SEED = 31337;

/**
 * On yedi yaprak. Sayı bilerek tek ve tek başına küçük: bu sahne bir yaprak
 * yağmuru değil, sayfanın kenarına düşmüş birkaç yaprak. Kalabalıklaşırsa
 * üstündeki metni yer.
 */
export function fallenLeaves(seed = LEAVES_SEED): FallenLeaf[] {
	const rand = rng(seed);
	const out: FallenLeaf[] = [];

	for (let i = 0; i < 17; i++) {
		/* Prototipin yuvarlamaları aynen: konum ve dönüş tam sayı, ölçek ve
		   saydamlık iki basamak. */
		const x = round(rand() * 300, 0);
		const y = round(rand() * 400, 0);
		const scale = round(0.55 + rand() * 1.25, 2);
		const rotate = round(rand() * 360, 0);
		const opacity = round(0.16 + rand() * 0.42, 2);
		out.push({ x, y, rotate, scale, opacity, tone: LEAF_TONES[Math.floor(rand() * 3)] });
	}

	return out;
}
