/* ============================================================================
   DAR SOKAK — tabelaların geometrisi
   ----------------------------------------------------------------------------
   Dokuz tabela, sırayla aşağı iniyor ve bir soldan bir sağdan sarkıyor. Yerleri
   tohumdan; gerekçe `sumi.ts` ve `leaves.ts` ile aynı.

   ⚠️ RASTGELE ÇAĞRI SIRASI SÖZLEŞMENİN PARÇASI: genişlik → yükseklik → ton →
   saydamlık.
   ========================================================================= */

import { rng, round } from './rng';

/** Sağdan sarkan tabelanın kendi genişliği kadar içeri çekilmesi gerekiyor. */
export interface StreetSign {
	x: number;
	y: number;
	width: number;
	height: number;
	tone: 'var(--accent)' | 'var(--accent-2)';
	opacity: number;
}

/** Prototipten aynen: 2211. */
export const STREET_SEED = 2211;

/**
 * Dokuz tabela. Çift indeksliler solda, tekler sağda; her biri bir öncekinden
 * biraz daha içeride, yani sokak dibe doğru daralıyor — perspektif duvarlarla
 * (`Street.svelte`) aynı kaçış noktasına bakıyorlar.
 */
export function streetSigns(seed = STREET_SEED): StreetSign[] {
	const rand = rng(seed);
	const out: StreetSign[] = [];

	for (let i = 0; i < 9; i++) {
		const w = 14 + rand() * 16;
		const h = 40 + rand() * 40;
		const tone = rand() > 0.5 ? 'var(--accent)' : 'var(--accent-2)';
		const opacity = round(0.45 + rand() * 0.5, 2);
		const left = i % 2 === 0;

		out.push({
			/* Sağdaki tabelanın sol kenarı YUVARLANMAMIŞ genişlikten hesaplanıyor
			   (prototipte de öyleydi) ama çizilen genişlik yuvarlak — aradaki yarım
			   birimlik fark 300 birimlik bir tuvalde görünmez. Buradaki tek fark,
			   sonucun bir basamağa yuvarlanması: prototip `x`i hiç yuvarlamıyordu
			   ve DOM'a `243.53674962744117` yazıyordu. */
			x: round(left ? 22 + i * 3 : 268 - i * 3 - w, 1),
			y: 100 + i * 26,
			width: round(w, 0),
			height: round(h, 0),
			tone,
			opacity
		});
	}

	return out;
}
