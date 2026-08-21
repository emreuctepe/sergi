/* ==========================================================================
   07 · KAPALI KAPILAR
   --------------------------------------------------------------------------
   2 sayfa: mn-kapak, mn-1

   Blok kimlikleri (`sayfaId:index`) yorum ankrajıdır — bir bloğu silmek
   ya da taşımak ona bağlı yorumları etkiler. Sıra değiştirirken
   kimlikleri OLDUĞU GİBİ bırak; docs/YORUM-SISTEMI.md §2.1.
   ======================================================================= */

import type { Section } from '$lib/content/types';

export const kapaliKapilar: Section = {
	slug: 'kapali-kapilar',
	type: 'manga',
	title: 'Kapalı Kapılar',
	kicker: 'One-shot',
	author: 'KARGAMANGA',
	minutes: 2,
	tags: ['manga', 'kurgu'],
	direction: 'ltr',
	pages: [
		{
			id: 'mn-kapak',
			depth: ['all'],
			kind: 'opener',
			fit: 'contain',
			bleed: 'full',
			bg: 'img:assets/2026-09/kapali-kapilar/kapak.webp',
			scene: 'mask-wipe',
			blocks: [
				{ t: 'kicker', id: 'mn-kapak:0', text: 'Bu sayıya özel one-shot', invert: true },
				{ t: 'h1', id: 'mn-kapak:1', text: 'Kapalı Kapılar', invert: true, big: true },
				{ t: 'lead', id: 'mn-kapak:2', invert: true, text: 'KARGAMANGA · 7 kare · soldan sağa' }
			]
		},
		{
			id: 'mn-1',
			depth: ['all'],
			kind: 'manga',
			fit: 'contain',
			scene: 'panel-reveal',
			blocks: [
				{
					t: 'manga',
					id: 'mn-1:0',
					page: 1,
					layout: 'plan',
					dir: 'ltr',
					title: 'Kapalı Kapılar',
					mark: {
						label: 'PIGMENT',
						img: 'assets/2026-09/kapali-kapilar/logo.webp',
						href: 'https://www.youtube.com/shorts/XaK1Acfo8ZE',
						note: "YouTube'da bu sayıyı Shorts olarak izlemek için tıklayabilirsin."
					},
					panels: [
						{
							img: 'assets/2026-09/kapali-kapilar/01.webp',
							alt: 'Şehrin önünde duran genç; arkasında soluk bir siluet.',
							text: [{ text: 'kapılarım kapalı…', at: { bottom: '16%', left: '3%', width: '76%' } }]
						},
						{
							img: 'assets/2026-09/kapali-kapilar/02.webp',
							alt: 'Ardında gökkuşağı renginde bir halka olan genç kadın.',
							text: [
								{
									text: 'neden herkese kapılarını kapatıyorsun?',
									at: { bottom: '-6%', left: '8%', width: '84%' }
								}
							]
						},
						{
							img: 'assets/2026-09/kapali-kapilar/03.webp',
							alt: 'Alacakaranlıkta üst geçitte birbirinden uzaklaşan iki siluet.',
							text: [
								{
									text: 'Madem yalnız kalmaktan bu kadar korkuyorsun…',
									at: { bottom: '4%', left: '6%', width: '88%' }
								}
							]
						},
						{
							img: 'assets/2026-09/kapali-kapilar/04.webp',
							alt: 'Genç kadının yakın plan yüzü; arkasında halkanın bir parçası.',
							text: [
								{
									text: 'sadece gerçekten gelmek isteyenler gelebilir…',
									at: { top: '-13%', left: '10%', width: '104%' }
								},
								{ text: 'ya kimse gelmezse?', at: { bottom: '8%', left: '16%', width: '56%' } }
							]
						},
						{
							img: 'assets/2026-09/kapali-kapilar/05.webp',
							alt: 'Gencin profilden görünüşü; arkada raylar ve gün batımı.'
						},
						{
							img: 'assets/2026-09/kapali-kapilar/06.webp',
							alt: 'Bir gözün çok yakın planı.',
							text: [{ text: 'kilitli değiller…', at: { top: '6%', left: '8%', width: '62%' } }]
						},
						{
							img: 'assets/2026-09/kapali-kapilar/07.webp',
							alt: 'Gece göğünde hilal ve pembe bulutlar.',
							text: [
								{
									text: 'İşte o zaman istemeyeceğim kadar kafamı dinlerim.',
									at: { top: '42%', left: '14%', width: '34%' }
								}
							]
						}
					]
				}
			]
		}
	]
};
