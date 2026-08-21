/* ==========================================================================
   06 · BULMACA
   --------------------------------------------------------------------------
   1 sayfa: bl-1

   Blok kimlikleri (`sayfaId:index`) yorum ankrajıdır — bir bloğu silmek
   ya da taşımak ona bağlı yorumları etkiler. Sıra değiştirirken
   kimlikleri OLDUĞU GİBİ bırak; docs/YORUM-SISTEMI.md §2.1.
   ======================================================================= */

import type { Section } from '$lib/content/types';

export const bulmaca: Section = {
	slug: 'bulmaca',
	type: 'puzzle',
	title: 'Bulmaca',
	kicker: 'Oyun',
	minutes: 8,
	tags: ['oyun'],
	pages: [
		{
			id: 'bl-1',
			depth: ['all'],
			kind: 'puzzle',
			fit: 'scroll',
			bg: 'scene:paper',
			scene: 'fade-up',
			blocks: [
				{ t: 'kicker', id: 'bl-1:0', text: 'Oyun' },
				{ t: 'h1', id: 'bl-1:1', text: 'Bu ayın bulmacası' },
				{
					t: 'lead',
					id: 'bl-1:2',
					text: 'Bu ayın bulmacası. Çöz, sonucunu okurlarla karşılaştır.'
				},
				{ t: 'puzzleSlots', id: 'bl-1:3' }
			]
		}
	]
};
