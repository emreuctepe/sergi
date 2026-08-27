/* ============================================================================
   SEIGAİHA (青海波) — "mavi deniz dalgası" deseni
   ----------------------------------------------------------------------------
   İç içe yaylardan kurulu klasik Japon deseni. Rastgelelik YOK, tamamı ızgara
   aritmetiği — ama tam da bu yüzden ayrı bir dosyada: `c` neresi başlıyor,
   tek satırlar ne kadar kayıyor, saydamlık hangi çevrimle dönüyor… hepsi tek
   karakterlik hatalarla sessizce değişebilecek şeyler. Sayı olarak durunca
   prototiple karşılaştırılabiliyor (`art.test.ts`).
   ========================================================================= */

/** Bir halka öbeğinin merkezi ve saydamlığı. */
export interface Ring {
	cx: number;
	cy: number;
	opacity: number;
}

/** Her öbekte dört çember — dıştan içe. */
export const RING_RADII = [26, 19, 12, 5] as const;

/**
 * Onar sıra, sırada dokuz öbek.
 *
 * Sol sütun `-1`den başlıyor ve sağdaki sonuncusu tuvalin dışına taşıyor:
 * desen KESİLMİŞ görünmeli, sayfaya sığdırılmış değil. Tek sıralar yarım adım
 * (22) kayıyor, saydamlık üç sırada bir dönüyor — düz bir ızgaranın dokuya
 * dönüşmesi bu iki kaydırmadan.
 */
export function seigaiha(): Ring[] {
	const out: Ring[] = [];
	for (let r = 0; r < 10; r++) {
		for (let c = -1; c < 8; c++) {
			out.push({
				cx: c * 44 + (r % 2 ? 22 : 0),
				cy: r * 42,
				opacity: Number((0.14 + (r % 3) * 0.08).toFixed(2))
			});
		}
	}
	return out;
}
