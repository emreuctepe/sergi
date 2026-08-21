/* ==========================================================================
   05 · BEŞ KELİME
   --------------------------------------------------------------------------
   3 sayfa: sz-1, sz-2, sz-3

   Blok kimlikleri (`sayfaId:index`) yorum ankrajıdır — bir bloğu silmek
   ya da taşımak ona bağlı yorumları etkiler. Sıra değiştirirken
   kimlikleri OLDUĞU GİBİ bırak; docs/YORUM-SISTEMI.md §2.1.
   ======================================================================= */

import type { Section } from '$lib/content/types';

export const sozluk: Section = {
	slug: 'sozluk',
	type: 'list',
	title: 'Beş Kelime',
	kicker: 'Sözlük',
	author: 'Emre',
	minutes: 3,
	tags: ['dil'],
	pages: [
		{
			id: 'sz-1',
			depth: ['all'],
			fit: 'contain',
			bg: 'img:assets/2026-09/dalga.webp',
			scene: 'stagger',
			blocks: [
				{ t: 'kicker', id: 'sz-1:0', text: 'Sözlük' },
				{ t: 'h1', id: 'sz-1:1', text: 'Bu ayın beş kelimesi' },
				{ t: 'rule', id: 'sz-1:2' },
				{ t: 'lead', id: 'sz-1:3', text: 'Tek kelimeyle söylenip cümlelerle çevrilen beşli.' }
			]
		},
		{
			id: 'sz-2',
			depth: ['all'],
			fit: 'contain',
			scene: 'fade-up',
			blocks: [
				{
					t: 'list',
					id: 'sz-2:0',
					style: 'dict',
					items: [
						{
							term: 'Mono no aware',
							def: 'Şeylerin geçiciliğinden doğan tatlı hüzün. Yaprağın döküleceğini bilerek ona bakmak.'
						},
						{
							term: 'Komorebi',
							def: 'Yaprakların arasından süzülen ışık. Işığın kendisi değil, yaprakla arasındaki iş.'
						},
						{ term: 'Shinrin-yoku', def: 'Orman banyosu. Yürümek değil, sadece ormanda bulunmak.' },
						{
							term: 'Yūgen',
							def: 'Anlatılamayacak kadar derin olanın verdiği his. Sisin ardındaki dağ.'
						},
						{ term: 'Wabi-sabi', def: 'Kusurun, eskimenin ve eksikliğin içindeki güzellik.' }
					]
				}
			]
		},
		{
			id: 'sz-3',
			depth: ['mid', 'full'],
			fit: 'contain',
			scene: 'fade-up',
			blocks: [
				{ t: 'h2', id: 'sz-3:0', text: 'Bir not' },
				{
					t: 'p',
					id: 'sz-3:1',
					text: 'Bu kelimelerin çevrilemez olduğu söylenir. Doğru değil — çevrilebilirler, sadece uzun sürer. Tek kelimeyle söylenen bir şeyi üç cümleyle söylemek, çevirememek değildir; pahalıya çevirmektir.'
				},
				{ t: 'pull', id: 'sz-3:2', text: 'Çevrilemez diye bir şey yok. Sadece pahalı çeviri var.' }
			]
		}
	]
};
