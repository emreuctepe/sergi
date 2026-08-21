/* ==========================================================================
   03 · GECE HATTI
   --------------------------------------------------------------------------
   3 sayfa: gh-acilis, gh-1, gh-5

   Blok kimlikleri (`sayfaId:index`) yorum ankrajıdır — bir bloğu silmek
   ya da taşımak ona bağlı yorumları etkiler. Sıra değiştirirken
   kimlikleri OLDUĞU GİBİ bırak; docs/YORUM-SISTEMI.md §2.1.
   ======================================================================= */

import type { Section } from '$lib/content/types';

export const geceHatti: Section = {
	slug: 'gece-hatti',
	type: 'gallery',
	title: 'Gece Hattı',
	kicker: 'Foto-öykü',
	author: 'Emre',
	minutes: 4,
	tags: ['gece', 'sehir'],
	pages: [
		{
			id: 'gh-acilis',
			depth: ['all'],
			kind: 'opener',
			fit: 'contain',
			bleed: 'full',
			bg: 'img:assets/2026-09/tren.webp',
			scene: 'mask-wipe',
			blocks: [
				{ t: 'kicker', id: 'gh-acilis:0', text: 'Foto-öykü', invert: true },
				{ t: 'h1', id: 'gh-acilis:1', text: 'Gece Hattı', invert: true },
				{
					t: 'lead',
					id: 'gh-acilis:2',
					invert: true,
					text: 'Son trenden inen yüz kırk kişi. Hepsi aynı yöne yürüyor ve kimse konuşmuyor.'
				}
			]
		},
		{
			id: 'gh-1',
			depth: ['all'],
			kind: 'photo',
			fit: 'contain',
			bleed: 'full',
			bg: 'img:assets/2026-09/fener.webp',
			scene: 'fade-up',
			blocks: [
				{
					t: 'caption',
					id: 'gh-1:0',
					invert: true,
					text: '00:12 — Peronda son anons. Kimse acele etmiyor.'
				}
			]
		},
		{
			id: 'gh-5',
			depth: ['all'],
			kind: 'photo',
			fit: 'contain',
			bleed: 'full',
			bg: 'img:assets/2026-09/yagmur.webp',
			scene: 'fade-up',
			blocks: [
				{
					t: 'caption',
					id: 'gh-5:0',
					invert: true,
					text: '00:44 — Yağmur başladı. Kalabalık kırk saniyede dağıldı.'
				}
			]
		}
	]
};
