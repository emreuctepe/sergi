/* ==========================================================================
   04 · FENER USTASI
   --------------------------------------------------------------------------
   4 sayfa: sy-acilis, sy-1, sy-2, sy-3

   Blok kimlikleri (`sayfaId:index`) yorum ankrajıdır — bir bloğu silmek
   ya da taşımak ona bağlı yorumları etkiler. Sıra değiştirirken
   kimlikleri OLDUĞU GİBİ bırak; docs/YORUM-SISTEMI.md §2.1.
   ======================================================================= */

import type { Section } from '$lib/content/types';

export const soylesi: Section = {
	slug: 'soylesi',
	type: 'interview',
	title: 'Fener Ustası',
	kicker: 'Söyleşi',
	author: 'Emre',
	minutes: 6,
	tags: ['zanaat', 'portre'],
	pages: [
		{
			id: 'sy-acilis',
			depth: ['all'],
			kind: 'opener',
			fit: 'contain',
			bleed: 'full',
			bg: 'scene:portrait',
			scene: 'mask-wipe',
			blocks: [
				{ t: 'kicker', id: 'sy-acilis:0', text: 'Söyleşi', invert: true },
				{
					t: 'h1',
					id: 'sy-acilis:1',
					text: '“Kâğıt ışığı yumuşatır, cam sertleştirir”',
					invert: true
				},
				{
					t: 'lead',
					id: 'sy-acilis:2',
					invert: true,
					text: 'Kırk bir yıldır kâğıt fener yapan bir ustayla, atölyesinde.'
				}
			]
		},
		{
			id: 'sy-1',
			depth: ['all'],
			fit: 'scroll',
			scene: 'fade-up',
			blocks: [
				{ t: 'dialog', id: 'sy-1:0', who: 'q', text: 'Kaç fener yaptınız?' },
				{
					t: 'dialog',
					id: 'sy-1:1',
					who: 'a',
					name: 'Usta',
					text: 'Bilmiyorum. Saymayı otuz yıl önce bıraktım. Ama her yıl aynı sayıda yapıyorum, yani sayabilirsin.'
				},
				{ t: 'dialog', id: 'sy-1:2', who: 'q', text: 'Neden aynı sayıda?' },
				{
					t: 'dialog',
					id: 'sy-1:3',
					who: 'a',
					name: 'Usta',
					text: 'Çünkü elim o kadarına yetiyor. Daha fazlasını yapsam, fazlası kötü olur. Kötü fener yapmak, fener yapmamaktan daha kötüdür.'
				}
			]
		},
		{
			id: 'sy-2',
			depth: ['mid', 'full'],
			fit: 'scroll',
			scene: 'fade-up',
			blocks: [
				{ t: 'pull', id: 'sy-2:0', text: '“Kötü fener yapmak, fener yapmamaktan daha kötüdür.”' },
				{
					t: 'dialog',
					id: 'sy-2:1',
					who: 'q',
					text: 'Makineyle üretilenler için ne düşünüyorsunuz?'
				},
				{
					t: 'dialog',
					id: 'sy-2:2',
					who: 'a',
					name: 'Usta',
					text: 'Güzeller. Cidden. Ucuzlar ve dayanıyorlar. Sorun onlarda değil, bizde: artık farkı görmüyoruz. Fark görülmeyince, fark yok demektir.'
				},
				{ t: 'dialog', id: 'sy-2:3', who: 'q', text: 'Fark ne peki?' },
				{
					t: 'dialog',
					id: 'sy-2:4',
					who: 'a',
					name: 'Usta',
					text: 'Kâğıt ışığı yumuşatır, cam sertleştirir. Bir odaya kâğıt fener koyduğunda insanlar daha alçak sesle konuşur. Bunu ölçemezsin ama olur.'
				}
			]
		},
		{
			id: 'sy-3',
			depth: ['full'],
			fit: 'scroll',
			scene: 'fade-up',
			blocks: [
				{ t: 'dialog', id: 'sy-3:0', who: 'q', text: 'Devam edecek biri var mı?' },
				{
					t: 'dialog',
					id: 'sy-3:1',
					who: 'a',
					name: 'Usta',
					text: 'Yeğenim üç yıl geldi, sonra gitti. Kızmadım. Bu iş sabır değil, tekrar istiyor. Sabır romantiktir; tekrar sıkıcıdır. İnsanlar sıkıcı olanı sevmiyor.'
				},
				{ t: 'dialog', id: 'sy-3:2', who: 'q', text: 'Siz nasıl dayandınız?' },
				{
					t: 'dialog',
					id: 'sy-3:3',
					who: 'a',
					name: 'Usta',
					text: 'Ben de sevmedim. Sadece bırakmadım. İkisi farklı şeyler.'
				},
				{ t: 'rule', id: 'sy-3:4' },
				{
					t: 'note',
					id: 'sy-3:5',
					text: 'Söyleşi eylülün ilk haftasında, atölyesinde yapıldı. Kısaltıldı.'
				}
			]
		}
	]
};
