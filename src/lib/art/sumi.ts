/* ============================================================================
   SUMI SAHNESİNİN GEOMETRİSİ — tohumdan çıkan sayılar
   ----------------------------------------------------------------------------
   `Sumi.svelte` yalnızca çiziyor; kaç sıçrama nereye düşecek, mühürde hangi
   kesikler olacak burada hesaplanıyor. Ayrımın gerekçesi `canvas/geometry.ts`
   ile aynı: girdi sayı, çıktı sayı olunca sınanabiliyor. Prototiple pariteyi
   `art.test.ts` bu üç fonksiyon üzerinden ölçüyor — SVG dizgisi karşılaştırmak
   öznitelik sırası gibi anlamsız farklara takılırdı.

   ⚠️ RASTGELE ÇAĞRI SIRASI SÖZLEŞMENİN PARÇASI. `rand()` her çağrıda diziyi
   ilerletiyor; bir satırı yukarı almak tüm kompozisyonu değiştirir. Prototipteki
   sıra korundu: önce imge sütunu, sonra sıçrama. Mühür kendi tohumundan besleniyor.
   ========================================================================= */

import { rng, round } from './rng';

/** Tek çizgi — sumi'de hem imgeler hem mühür kesikleri bundan. */
export interface Stroke {
	x1: number;
	y1: number;
	x2: number;
	y2: number;
}

/** Mürekkep sıçraması. */
export interface Dot {
	cx: number;
	cy: number;
	r: number;
	opacity: number;
}

/**
 * Soyut bir karakter — okunmuyor ama "yazı" gibi duruyor. Metnin altında
 * kalacağı için bilerek okunaksız: göz onu doku sanıp üstündeki başlığa geçsin.
 */
function glyph(cx: number, cy: number, box: number, rand: () => number): Stroke[] {
	const out: Stroke[] = [];
	const n = 2 + Math.floor(rand() * 3);
	for (let i = 0; i < n; i++) {
		const len = box * (0.34 + rand() * 0.46);
		const ox = cx + (rand() - 0.5) * box * 0.44;
		const oy = cy + (rand() - 0.5) * box * 0.52;
		out.push(
			rand() > 0.42
				? {
						x1: round(ox - len / 2, 1),
						y1: round(oy, 1),
						x2: round(ox + len / 2, 1),
						y2: round(oy, 1)
					}
				: {
						x1: round(ox, 1),
						y1: round(oy - len / 2, 1),
						x2: round(ox, 1),
						y2: round(oy + len / 2, 1)
					}
		);
	}
	return out;
}

/** Sumi'nin tohumu: 4-6-4-9 · "yoroshiku". Prototipten aynen geldi. */
export const SUMI_SEED = 4649;

/** Mührün tohumu — kendi dizisi, sahnenin geri kalanından bağımsız. */
export const SEAL_SEED = 46;

/** Sağ kenardaki beş imge (sütun) + on dört sıçrama. Tek dizi, tek geçiş. */
export function sumiInk(seed = SUMI_SEED): { glyphs: Stroke[]; splatter: Dot[] } {
	const rand = rng(seed);

	const glyphs: Stroke[] = [];
	for (let g = 0; g < 5; g++) glyphs.push(...glyph(254, 66 + g * 30, 24, rand));

	const splatter: Dot[] = [];
	for (let s = 0; s < 14; s++) {
		const a = rand() * Math.PI * 2;
		const d = 96 + rand() * 46;
		splatter.push({
			cx: round(150 + Math.cos(a) * d, 1),
			cy: round(176 + Math.sin(a) * d * 0.9, 1),
			r: round(0.7 + rand() * 2.4, 1),
			opacity: round(0.15 + rand() * 0.4, 2)
		});
	}

	return { glyphs, splatter };
}

/** Vermilyon mühür (hanko) — kare taşın içine oyulmuş beş soyut kesik. */
export function sealCuts(x: number, y: number, size: number, seed = SEAL_SEED): Stroke[] {
	const rand = rng(seed);
	const pad = size * 0.22;
	const out: Stroke[] = [];
	for (let i = 0; i < 5; i++) {
		const ox = x + pad + rand() * (size - pad * 2);
		const oy = y + pad + rand() * (size - pad * 2);
		const len = size * (0.24 + rand() * 0.3);
		out.push(
			rand() > 0.45
				? {
						x1: round(ox, 1),
						y1: round(oy - len / 2, 1),
						x2: round(ox, 1),
						y2: round(oy + len / 2, 1)
					}
				: {
						x1: round(ox - len / 2, 1),
						y1: round(oy, 1),
						x2: round(ox + len / 2, 1),
						y2: round(oy, 1)
					}
		);
	}
	return out;
}
