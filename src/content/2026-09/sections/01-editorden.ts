/* ==========================================================================
   01 · EDİTÖRDEN
   --------------------------------------------------------------------------
   2 sayfa: ed-1, ed-2

   Blok kimlikleri (`sayfaId:index`) yorum ankrajıdır — bir bloğu silmek
   ya da taşımak ona bağlı yorumları etkiler. Sıra değiştirirken
   kimlikleri OLDUĞU GİBİ bırak; docs/YORUM-SISTEMI.md §2.1.
   ======================================================================= */

import type { Section } from '$lib/content/types';

export const editorden: Section = {
	slug: 'editorden',
	type: 'article',
	title: 'Editörden',
	kicker: 'Sunuş',
	author: 'Emre',
	minutes: 2,
	tags: ['editoryel'],
	pages: [
		{
			id: 'ed-1',
			depth: ['all'],
			fit: 'contain',
			bg: 'scene:paper',
			scene: 'fade-up',
			blocks: [
				{ t: 'kicker', id: 'ed-1:0', text: 'Sunuş' },
				{ t: 'h1', id: 'ed-1:1', text: 'Renk, aslında bir veda' },
				{ t: 'byline', id: 'ed-1:2', author: 'Emre', role: 'editör', minutes: 2 },
				{ t: 'rule', id: 'ed-1:3' },
				{
					t: 'p',
					id: 'ed-1:4',
					drop: true,
					text: 'Yaprağın kızıla dönmesi bir başlangıç gibi görünür ama değildir. Ağaç o rengi üretmez; sadece yeşili geri çeker. Geriye kalan, hep orada olan renktir.'
				},
				{
					t: 'p',
					id: 'ed-1:5',
					text: 'Bu sayıyı da öyle kurduk. Yeni bir şey eklemedik — sadece gürültüyü çektik. Geriye ne kaldığına bakıyoruz.'
				}
			]
		},
		{
			id: 'ed-2',
			depth: ['mid', 'full'],
			fit: 'contain',
			scene: 'fade-up',
			blocks: [
				{
					t: 'p',
					id: 'ed-2:0',
					text: 'Eylülde bir şehrin nasıl renk değiştirdiğini anlatan uzun bir yazı var. Gece yarısı son trenden inen insanları takip eden bir foto-öykü. Kırk yıldır kâğıt fener yapan bir ustayla söyleşi. Ve bu ay ilk kez, sayıya özel çizilmiş bir one-shot.'
				},
				{
					t: 'pull',
					id: 'ed-2:1',
					text: 'Bitişi olan bir şey okumayı özlediysen, doğru yerdesin.'
				},
				{
					t: 'p',
					id: 'ed-2:2',
					text: 'Aşağı kaydır. Beğendiğin cümlenin üstüne parmağını basılı tut — orada bir şey söyleyebilirsin.'
				}
			]
		}
	]
};
