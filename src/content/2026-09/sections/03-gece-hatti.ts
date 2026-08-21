/* ==========================================================================
   03 · GECE HATTI
   --------------------------------------------------------------------------
   6 sayfa: gh-acilis, gh-1, gh-2, gh-3, gh-4, gh-5

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
			id: 'gh-2',
			depth: ['all'],
			kind: 'photo',
			fit: 'contain',
			bleed: 'full',
			bg: 'photo:102',
			scene: 'fade-up',
			blocks: [
				{
					t: 'caption',
					id: 'gh-2:0',
					invert: true,
					text: '00:19 — Turnikeler. Tek ses, kartların çıkardığı ses.'
				}
			]
		},
		{
			id: 'gh-3',
			depth: ['mid', 'full'],
			kind: 'photo',
			fit: 'contain',
			bleed: 'full',
			bg: 'photo:103',
			scene: 'fade-up',
			blocks: [
				{
					t: 'caption',
					id: 'gh-3:0',
					invert: true,
					text: '00:26 — Merdivenin ortasında duran adam. Telefonuna değil, yukarı bakıyor.'
				}
			]
		},
		{
			id: 'gh-4',
			depth: ['full'],
			kind: 'photo',
			fit: 'contain',
			bleed: 'full',
			bg: 'photo:104',
			scene: 'fade-up',
			blocks: [
				{
					t: 'caption',
					id: 'gh-4:0',
					invert: true,
					text: '00:31 — Çıkışta açık kalan tek dükkân. Işığı sokağa taşıyor.'
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
