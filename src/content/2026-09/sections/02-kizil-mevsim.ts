/* ==========================================================================
   02 · KIZIL MEVSİM
   --------------------------------------------------------------------------
   8 sayfa: km-acilis, km-min, km-1, km-2, km-3, km-4, km-5, km-imza

   Blok kimlikleri (`sayfaId:index`) yorum ankrajıdır — bir bloğu silmek
   ya da taşımak ona bağlı yorumları etkiler. Sıra değiştirirken
   kimlikleri OLDUĞU GİBİ bırak; docs/YORUM-SISTEMI.md §2.1.
   ======================================================================= */

import type { Section } from '$lib/content/types';

export const kizilMevsim: Section = {
	slug: 'kizil-mevsim',
	type: 'article',
	title: 'Kızıl Mevsim',
	kicker: 'Dosya',
	author: 'Emre',
	minutes: 11,
	tags: ['gezi', 'mevsim'],
	pages: [
		{
			id: 'km-acilis',
			depth: ['all'],
			kind: 'opener',
			fit: 'contain',
			bleed: 'full',
			bg: 'img:assets/2026-09/sisli-vadi.webp',
			scene: 'parallax',
			blocks: [
				{ t: 'kicker', id: 'km-acilis:0', text: 'Dosya · Mevsim', invert: true },
				{ t: 'h1', id: 'km-acilis:1', text: 'Kızıl Mevsim', invert: true, big: true },
				{
					t: 'lead',
					id: 'km-acilis:2',
					invert: true,
					text: 'Sonbahar bir tarih değil, bir yükseklik meselesidir. Dağdan aşağı iner — günde yaklaşık yirmi metre.'
				},
				{
					t: 'byline',
					id: 'km-acilis:3',
					author: 'Emre',
					role: 'yazı ve fotoğraflar',
					minutes: 11,
					invert: true
				}
			]
		},
		{
			id: 'km-min',
			depth: ['min'],
			fit: 'contain',
			scene: 'stagger',
			blocks: [
				{ t: 'kicker', id: 'km-min:0', text: 'Kısaca' },
				{ t: 'h2', id: 'km-min:1', text: 'Üç cümlede sonbahar' },
				{
					t: 'list',
					id: 'km-min:2',
					style: 'num',
					items: [
						'Renk kuzeyden güneye, yüksekten alçağa iner. Günde 20 metre, haftada bir ilçe.',
						'En iyi hafta ayın ikinci haftasıdır; birinci hafta erken, üçüncü hafta kalabalıktır.',
						'Kırmızıyı bekleme. En güzel an, yeşille kızılın aynı dalda durduğu üç gündür.'
					]
				},
				{ t: 'rule', id: 'km-min:3' },
				{
					t: 'note',
					id: 'km-min:4',
					text: 'Bu, yazının en kısa hâli. Aynı yazıyı daha uzun okumak için üst çubuktan okuma derinliğini değiştir.'
				}
			]
		},
		{
			id: 'km-1',
			depth: ['mid', 'full'],
			fit: 'scroll',
			scene: 'fade-up',
			blocks: [
				{
					t: 'p',
					id: 'km-1:0',
					drop: true,
					text: 'Eylülün ilk günü hiçbir şey olmaz. İkinci haftasında, kuzeydeki bir dağın tepesinde, kimsenin görmediği bir yerde ilk yaprak döner. Oradan sonra iş matematiğe kalır: renk her gün yaklaşık yirmi metre iner, her hafta bir ilçe aşağı kayar.'
				},
				{
					t: 'p',
					id: 'km-1:1',
					text: 'Bunu ilk duyduğumda inanmadım. Bir mevsimin hız birimi olmasını saçma buldum. Sonra üç yıl üst üste aynı yamaca aynı tarihlerde çıktım ve gerçekten öyle olduğunu gördüm.'
				},
				{
					t: 'pull',
					id: 'km-1:2',
					text: 'Bir mevsimin hızı vardır ve o hız ölçülebilir. Bunu bilmek, beklemeyi değiştirir.'
				},
				{
					t: 'p',
					id: 'km-1:3',
					text: 'Şehirde bunu fark etmek zordur. Beton geceleri ısıyı tutar, ağaçlar kararsız kalır. Bu yüzden şehrin sonbaharı hep birkaç gün geç gelir ve daha kısa sürer — sanki aceleye gelmiş gibi.'
				}
			]
		},
		{
			id: 'km-2',
			depth: ['mid', 'full'],
			kind: 'figure',
			fit: 'contain',
			bleed: 'full',
			bg: 'img:assets/2026-09/tapinak.webp',
			scene: 'mask-wipe',
			blocks: [
				{
					t: 'caption',
					id: 'km-2:0',
					invert: true,
					text: 'Ayın ikinci haftası, sabah yedi. Kalabalık henüz otobüslerde.'
				}
			]
		},
		{
			id: 'km-3',
			depth: ['mid', 'full'],
			fit: 'scroll',
			scene: 'fade-up',
			blocks: [
				{ t: 'h2', id: 'km-3:0', text: 'Kalabalıkla yarışmak' },
				{
					t: 'p',
					id: 'km-3:1',
					text: 'Herkes aynı üç günü bilir. Sorun renk değil, aynı anda aynı yere bakan yedi bin kişidir. Çözüm basit ama kimse uygulamaz: bir hafta erken gel.'
				},
				{
					t: 'p',
					id: 'km-3:2',
					text: 'Erken gelmek, yarısı hâlâ yeşil bir yamacı görmek demektir. Fotoğrafta iyi durmaz. Ama gözle bakınca, tam olgunlaşmış kızıldan daha iyidir — çünkü hareket vardır. Bir şey olmaktadır.'
				},
				{
					t: 'quote',
					id: 'km-3:3',
					text: 'Tamamlanmış güzellik durur. Yarım güzellik ilerler.',
					by: 'bir bahçıvanın söylediği, kaynağını bilmediğim söz'
				}
			]
		},
		{
			id: 'km-4',
			depth: ['full'],
			fit: 'scroll',
			scene: 'fade-up',
			blocks: [
				{ t: 'kicker', id: 'km-4:0', text: 'Yalnızca klasik modda' },
				{ t: 'h2', id: 'km-4:1', text: 'Rengin kimyası, kısaca' },
				{
					t: 'p',
					id: 'km-4:2',
					text: 'Yaprağın yeşili klorofildendir ve klorofil pahalıdır — ağaç onu sürekli üretmek zorundadır. Gün kısalıp ışık azalınca üretim durur. Altta bekleyen karotenoidler ortaya çıkar: sarı, turuncu.'
				},
				{
					t: 'p',
					id: 'km-4:3',
					text: 'Kırmızı ise farklıdır. Antosiyanin denen o pigment, yaprak ölürken *yeni* üretilir. Yani ağaç, veda ederken masrafa girer. Neden yaptığı hâlâ tam bilinmiyor; en güçlü tahmin, güneş yanığına karşı bir gölgelik kurduğu.'
				},
				{
					t: 'stat',
					id: 'km-4:4',
					items: [
						{ k: 'Günlük iniş', v: '~20 m' },
						{ k: 'İdeal aralık', v: '3 gün' },
						{ k: 'Şehir gecikmesi', v: '4-6 gün' }
					]
				},
				{
					t: 'p',
					id: 'km-4:5',
					text: 'Bu bilgiyi öğrendikten sonra bir daha aynı gözle bakamadım. Kızıl, ağacın son işidir. Bitirmeden önce yaptığı en gösterişli şey.'
				}
			]
		},
		{
			id: 'km-5',
			depth: ['full'],
			fit: 'scroll',
			scene: 'fade-up',
			blocks: [
				{ t: 'h2', id: 'km-5:0', text: 'Üç yamaç, üç ders' },
				{
					t: 'list',
					id: 'km-5:1',
					style: 'dict',
					items: [
						{
							term: 'Kuzey yamacı',
							def: 'Önce döner, çabuk döker. Erken gitmek zorundasın; ödülü tenhalık.'
						},
						{
							term: 'Güney yamacı',
							def: 'Geç döner, uzun tutar. Kalabalığın kaçırdığı ikinci bir hafta verir.'
						},
						{
							term: 'Vadi tabanı',
							def: 'Sis. Renk zayıf ama sabahın ilk saatinde ışık her şeyi affeder.'
						}
					]
				},
				{
					t: 'p',
					id: 'km-5:2',
					text: 'Üç yıl sonra kendi kuralımı yazdım: kalabalığın gittiği yere iki gün önce git, kalabalığın gitmediği yere istediğin zaman.'
				}
			]
		},
		{
			id: 'km-imza',
			depth: ['all'],
			kind: 'signature',
			fit: 'contain',
			bleed: 'full',
			bg: 'img:assets/2026-09/yaprak.webp',
			scene: 'signature',
			blocks: [
				{ t: 'pull', id: 'km-imza:0', text: 'Renk gelmiyor. Yeşil gidiyor.', big: true },
				{ t: 'caption', id: 'km-imza:1', text: 'Kızıl Mevsim · son' }
			]
		}
	]
};
