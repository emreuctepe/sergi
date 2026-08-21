/* ==========================================================================
   00 · KAPAK
   --------------------------------------------------------------------------
   1 sayfa: kapak-1

   Blok kimlikleri (`sayfaId:index`) yorum ankrajıdır — bir bloğu silmek
   ya da taşımak ona bağlı yorumları etkiler. Sıra değiştirirken
   kimlikleri OLDUĞU GİBİ bırak; docs/YORUM-SISTEMI.md §2.1.
   ======================================================================= */

import type { Section } from '$lib/content/types';

export const kapak: Section = {
	slug: 'kapak',
	type: 'cover',
	title: 'Kapak',
	pages: [
		{
			id: 'kapak-1',
			depth: ['all'],
			kind: 'cover',
			fit: 'contain',
			bleed: 'full',
			bg: 'img:assets/2026-09/kapak.webp',
			scene: 'mask-wipe',
			blocks: [{ t: 'cover', id: 'kapak-1:0' }]
		}
	]
};
