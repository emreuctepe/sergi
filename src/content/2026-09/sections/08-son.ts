/* ==========================================================================
   08 · SAYI SONU
   --------------------------------------------------------------------------
   2 sayfa: son-kunye, son-1

   Blok kimlikleri (`sayfaId:index`) yorum ankrajıdır — bir bloğu silmek
   ya da taşımak ona bağlı yorumları etkiler. Sıra değiştirirken
   kimlikleri OLDUĞU GİBİ bırak; docs/YORUM-SISTEMI.md §2.1.
   ======================================================================= */

import type { Section } from '$lib/content/types';

export const son: Section = {
	slug: 'son',
	type: 'outro',
	title: 'Sayı sonu',
	pages: [
		{
			id: 'son-kunye',
			depth: ['all'],
			fit: 'contain',
			bg: 'scene:sumi',
			scene: 'fade-up',
			blocks: [
				{ t: 'kicker', id: 'son-kunye:0', text: 'Künye' },
				{ t: 'h2', id: 'son-kunye:1', text: 'Bu sayıda emeği geçenler' },
				{ t: 'rule', id: 'son-kunye:2' },
				{
					t: 'list',
					id: 'son-kunye:3',
					style: 'dict',
					items: [
						{ term: 'Emre Üçtepe', def: 'Editör · söyleşi — [@emreuctepe](https://example.com)' },
						{
							term: 'Deniz Kaya',
							def: 'Foto-öykü: Gece Hattı — [@denizkaya](https://example.com)'
						},
						{
							term: 'Selin Aydın',
							def: 'Kızıl Mevsim yazısı — [@selinaydin](https://example.com)'
						},
						{
							term: 'KARGAMANGA',
							def: 'One-shot: Kapalı Kapılar — izinle yayımlandı · [PIGMENT](https://www.youtube.com/shorts/XaK1Acfo8ZE)'
						},
						{ term: 'Aslı Ün', def: 'Sözlük · illüstrasyon — [@asliun](https://example.com)' }
					]
				},
				{ t: 'rule', id: 'son-kunye:4' },
				{ t: 'h3', id: 'son-kunye:5', text: 'Görseller' },
				{
					t: 'p',
					id: 'son-kunye:6',
					text: "Sayfa görselleri Wikimedia Commons'tan alınmıştır. CC BY / CC BY-SA lisanslı olanlar için atıf zorunludur; CC BY-SA görseller aynı lisansla paylaşılır."
				},
				{
					t: 'list',
					id: 'son-kunye:7',
					style: 'dict',
					items: [
						{
							term: 'One-shot',
							def: 'Kapalı Kapılar, 7 kare — KARGAMANGA / PIGMENT · telif sahibinde, izinle'
						},
						{
							term: 'Kapak',
							def: 'Fushimi Inari torii — Balon Greyjoy · [CC0](https://creativecommons.org/publicdomain/zero/1.0/)'
						},
						{
							term: 'Kızıl yaprak',
							def: 'Enko-ji, Kyoto — lumoplank · [CC0](https://creativecommons.org/publicdomain/zero/1.0/)'
						},
						{
							term: 'Taş fener',
							def: 'Kenroku-en, Kanazawa — DimiTalen · [CC0](https://creativecommons.org/publicdomain/zero/1.0/)'
						},
						{
							term: 'Sisli vadi',
							def: 'An Autumn Morning — Jaroslav Vosáhlo · [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/)'
						},
						{
							term: 'Yağmur',
							def: 'Sensō-ji, Asakusa — Maarten Heerlien · [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/)'
						},
						{
							term: 'Tapınak',
							def: 'Momiji, Daigo-ji — Suicasmo · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)'
						},
						{
							term: 'Tren',
							def: 'Matsumoto İstasyonu — Tohnass · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)'
						},
						{
							term: 'Dalga',
							def: 'Breaking wave by rock — Nuwan Devinda · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)'
						}
					]
				}
			]
		},
		{
			id: 'son-1',
			depth: ['all'],
			kind: 'outro',
			fit: 'scroll',
			bg: 'img:assets/2026-09/yaprak.webp',
			scene: 'fade-up',
			blocks: [{ t: 'outro', id: 'son-1:0' }]
		}
	]
};
