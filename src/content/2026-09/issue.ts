/* ==========================================================================
   SAYI 03 · "Kızıl Mevsim" — 2026-09
   --------------------------------------------------------------------------
   Sayının künyesi, ilk ziyaretteki tanıtım kartları ve bulmaca havuzu.
   Bölümler ayrı dosyalarda: sections/NN-<slug>.ts

   Üretildi: tools/tasi-icerik.mjs — elle düzenlenebilir, script yeniden
   çalıştırılırsa üzerine yazar.
   ======================================================================= */

import type { IntroCard, Issue, Puzzle } from '$lib/content/types';

export const issue: Issue = {
	slug: '2026-09',
	number: 3,
	title: 'Kızıl Mevsim',
	subtitle: 'Sonbaharın ilk haftası, bir şehrin rengi değişirken',
	publishedAt: '2026-09-01',
	colophon: 'Aylık · Eylül 2026 · Tek kişilik editöryel',
	editorsPick: 'haiku-tamamla',
	puzzlePool: ['kelime-avi', 'renk-dizisi', 'haiku-tamamla', 'panel-sirala'],
	next: { date: '1 Ekim 2026', title: 'Gürültü' }
};

export const intro: IntroCard[] = [
	{ scene: 'paper', big: 'Bu bir dergi.', small: 'Akış değil. Başlıyor ve bitiyor.' },
	{
		scene: 'leaves',
		big: 'Ayda bir sayı.',
		small: 'Bir oturuşta okunur. Sonra kapanır ve gelecek ayı bekler.'
	},
	{
		scene: 'waves',
		big: 'Üç okuma derinliği.',
		small: 'Acelen varsa en az. Vaktin varsa klasik. Aynı sayı, üç farklı uzunluk.'
	},
	{
		scene: 'street',
		big: 'Nereye istersen yorum yaz.',
		small: 'Bir cümlenin altına, bir fotoğrafın köşesine. Hesap açmana gerek yok.'
	},
	{ scene: 'torii', big: 'Hazırsan başlayalım.', small: 'Sayı 03 · Kızıl Mevsim', last: true }
];

export const puzzles: Puzzle[] = [
	{
		id: 'kelime-avi',
		name: 'Kelime Avı',
		blurb: 'Kızıl Mevsim yazısından altı kelime, ızgarada saklı.',
		tags: ['kelime', 'içerik-bağlı'],
		difficulty: 2,
		estMinutes: 4,
		icon: '🔤',
		config: { size: 9, words: ['KIZIL', 'YAPRAK', 'SISLI', 'VADI', 'TREN', 'FENER'] }
	},
	{
		id: 'renk-dizisi',
		name: 'Renk Dizisi',
		blurb: 'Sayının paletini hatırla. Her turda bir renk daha ekleniyor.',
		tags: ['görsel', 'mantık'],
		difficulty: 3,
		estMinutes: 3,
		icon: '🎨',
		config: { rounds: 8 }
	},
	{
		id: 'haiku-tamamla',
		name: 'Haiku Tamamla',
		blurb: 'Üç haiku, üç eksik satır. Hece sayısı tutmalı.',
		tags: ['kelime', 'içerik-bağlı'],
		difficulty: 2,
		estMinutes: 5,
		icon: '🍁',
		editorsNote: 'Bu sayının yazısıyla aynı nefesi taşıdığı için seçtim.',
		config: {
			items: [
				{
					lines: ['Dağdan iniyor —', '___', 'yirmi metre her gün'],
					options: ['kızıl bir yavaşlık', 'otobüs kalabalığı', 'telefonun ışığı'],
					answer: 0
				},
				{
					lines: ['Son tren gitti', 'peronda iki kişi', '___'],
					options: ['ve dört saatlik şehir', 'bilet makinesi bozuk', 'yarın yine cuma'],
					answer: 0
				},
				{
					lines: ['___', 'kâğıdın ardında', 'ses alçalıyor'],
					options: ['Fenerin içinde', 'Cam sertleştirir', 'Atölye kapalı'],
					answer: 0
				}
			]
		}
	},
	{
		id: 'panel-sirala',
		name: 'Panel Sırala',
		blurb: "One-shot'ın kareleri karıştı. Okuma sırasına göre diz.",
		tags: ['görsel', 'içerik-bağlı'],
		difficulty: 1,
		estMinutes: 2,
		icon: '🀄',
		config: { panels: 7 }
	}
];
