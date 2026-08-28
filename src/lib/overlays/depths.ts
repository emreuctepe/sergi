/* ============================================================================
   OKUMA MODLARININ SUNUMU — ad, simge, açıklama
   ----------------------------------------------------------------------------
   `DEPTHS` (types.ts) modların KİMLİKLERİNİ tutuyor; burada okura görünen
   yüzleri var. Ayrı duruyorlar çünkü kimlik veri, metin editöryel: birinin
   değişmesi ötekini bozmamalı.

   ⚠️ AÇIKLAMALAR PROTOTİPTEN OLDUĞU GİBİ GELMEDİ, çünkü prototiptekiler
   BU SAYI İÇİN YALANDI. Orada "foto-öykü kısaltılmış", "galerinin çoğu" ve
   "tüm fotoğraflar" yazıyordu; oysa 2026-09'da foto-öykü ve manga üç modda da
   birebir aynı (ölçüldü — bkz. flow.test.ts). Uydurma bulmaca istatistiklerini
   ve uydurma söyleşiyi eleyen kararın (1.4, 1.42) aynısı: okura gösterilen
   cümle, sayının gerçekten yaptığı şeyi anlatmak zorunda.

   "Çoğu okur burada" da düştü — sıfır okurumuz varken okur davranışı hakkında
   bir cümle kurmak ölçmediğimiz bir sayıyı ölçmüş gibi göstermek olurdu.
   Yerine editörün tavsiyesi geçti; o bir ölçüm değil, bir öneri.

   Süre ve sayfa sayısı buraya YAZILMIYOR: ikisi de `flow` ve `estimateMinutes`
   ile sayılıyor. İçerik değişince kartların rakamları kendiliğinden değişiyor.
   ========================================================================= */

import type { Depth } from '$lib/content/types';

export interface DepthCard {
	id: Depth;
	name: string;
	icon: string;
	/** Kartın tek cümlelik sesi — kime göre, ne için. */
	line: string;
	/** Bu modun sayıya SOMUT olarak ne yaptığı. */
	detail: string;
}

export const DEPTH_CARDS: readonly DepthCard[] = [
	{
		id: 'min',
		name: 'Doomscroller',
		icon: '🫠',
		line: 'Sosyal medya kullanmaktan beyni sıvı olanlar için.',
		detail:
			'Dosya tek sayfalık özete iner, söyleşiden dört soru kalır. Manga, foto-öykü ve bulmaca kısalmaz.'
	},
	{
		id: 'mid',
		name: 'Dengeli',
		icon: '⚖️',
		line: 'Emin değilsen buradan başla.',
		detail: 'Dosyanın gövdesi, söyleşinin yedi sayfası, sözlüğün tamamı.'
	},
	{
		id: 'full',
		name: 'Doomreader',
		icon: '🧠',
		line: 'Hâlâ uzun metin okuyabilen üst insanlar için.',
		detail: 'Dosyanın son iki bölümü ve söyleşinin tamamı — kesilen hiçbir şey yok.'
	}
];

/** Bant üstündeki çipte ve bildirimde geçen kısa ad. */
export function depthName(depth: Depth): string {
	return DEPTH_CARDS.find((card) => card.id === depth)?.name ?? depth;
}
