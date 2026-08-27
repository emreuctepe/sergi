/* ============================================================================
   BLOK BİLEŞENLERİ
   ----------------------------------------------------------------------------
   Bu testlerin kovaladığı hata prototipte GERÇEKTEN vardı: `render.js`
   bilinmeyen bir blok tipinde konsola uyarı basıp bloğu ATLIYORDU. Sonuç,
   sayfada eksik bir paragraf ve hiçbir yerde bir hata. Buradaki iki soru bunun
   üstüne kurulu:

     1. 20 tipin hepsinin bir bileşeni var mı? (`Block.svelte` dağıtıcısı)
     2. Sayının 98 bloğunun 98'i de çiziliyor ve ANKRAJINI taşıyor mu?

   Bileşenler `svelte/server` ile sunucuda çiziliyor — tarayıcı kurmadan gerçek
   çıktıya bakmanın yolu bu. Aranan şey görünüm değil SÖZLEŞME: sınıf, ankraj
   kimliği, alt birim kimliği.
   ========================================================================= */

import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import { content } from '../../content/2026-09';
import { issueContextMap } from '$lib/content/context';
import { BLOCK_TYPES, type Block, type BlockType } from '$lib/content/types';
import Block_ from './Block.svelte';

const context = issueContextMap(content.issue);

/** Bir bloğu tek başına çizer; SSR imleçleri temizlenir. */
function draw(block: Block, index = 0): string {
	return render(Block_, { props: { block, index }, context }).body.replace(/<!--.*?-->/gs, '');
}

/* ==========================================================================
   ÖRNEK BLOKLAR
   --------------------------------------------------------------------------
   `satisfies Record<BlockType, Block>`: `types.ts`'e yeni bir tip eklenip
   buraya örneği yazılmazsa DERLEME kırılır. Yani "yeni tipin testi yok"
   sessizce geçilebilir bir durum değil.
   ======================================================================= */

const SAMPLES = {
	kicker: { t: 'kicker', id: 'x:0', text: 'Sunuş' },
	h1: { t: 'h1', id: 'x:0', text: 'Başlık', big: true },
	h2: { t: 'h2', id: 'x:0', text: 'Ara başlık' },
	h3: { t: 'h3', id: 'x:0', text: 'Küçük başlık' },
	lead: { t: 'lead', id: 'x:0', text: 'Giriş paragrafı.' },
	p: { t: 'p', id: 'x:0', text: 'Gövde **paragrafı**.', drop: true },
	pull: { t: 'pull', id: 'x:0', text: 'Çekilmiş cümle.', big: true },
	quote: { t: 'quote', id: 'x:0', text: 'Alıntı.', by: 'Biri' },
	note: { t: 'note', id: 'x:0', text: 'Editör notu.' },
	caption: { t: 'caption', id: 'x:0', text: 'Görsel altı.' },
	figure: { t: 'figure', id: 'x:0', img: 'assets/x/01.webp', alt: 'çizim', caption: 'Altyazı.' },
	rule: { t: 'rule', id: 'x:0' },
	byline: { t: 'byline', id: 'x:0', author: 'Yazar', role: 'Rol', minutes: 4 },
	stat: { t: 'stat', id: 'x:0', items: [{ v: '12', k: 'gün' }] },
	list: { t: 'list', id: 'x:0', items: ['bir', 'iki'] },
	dialog: { t: 'dialog', id: 'x:0', who: 'a', text: 'Cevap.', name: 'Nur' },
	manga: {
		t: 'manga',
		id: 'x:0',
		page: 1,
		layout: 'dikey',
		panels: [{ img: 'assets/x/01.webp', alt: 'kare', text: [{ text: 'söz' }] }]
	},
	puzzleSlots: { t: 'puzzleSlots', id: 'x:0' },
	cover: { t: 'cover', id: 'x:0' },
	outro: { t: 'outro', id: 'x:0' }
} as const satisfies Record<BlockType, Block>;

/* ==========================================================================
   HER TİPİN SÖZLEŞMESİ
   ======================================================================= */

describe('her blok tipi', () => {
	it.each(BLOCK_TYPES)('%s — çiziliyor ve ankrajını taşıyor', (type) => {
		const html = draw(SAMPLES[type], 3);

		expect(html.trim()).not.toBe('');
		expect(html).toContain('data-block-id="x:0"');
		expect(html).toContain(`data-block-kind="${type}"`);
		/* `--i` blokların sırayla belirmesini sağlıyor (canvas.css `[data-scene]`). */
		expect(html).toContain('--i: 3');
		/* `.blk` bloğun KENDİ kök öğesinde olmalı: CSS `.page__inner > .blk + .blk`
		   diyor, araya sarmalayıcı bir <div> girerse aralıklar çöker. */
		expect(html.slice(0, html.indexOf('>'))).toMatch(/class="[^"]*\bblk\b/);
	});

	it('`invert` ters çevirme sınıfını ekliyor', () => {
		expect(draw({ ...SAMPLES.p, invert: true })).toMatch(/class="[^"]*blk--invert/);
		expect(draw(SAMPLES.p)).not.toContain('blk--invert');
	});
});

/* ==========================================================================
   ALT BİRİM ANKRAJLARI
   --------------------------------------------------------------------------
   Liste satırı ve manga karesi tek tek yorumlanabilir. Prototipte kimlik
   çizimden sonra `[data-sub]` gezilerek takılıyordu; burada blok kendi
   kimliğini bildiği için doğrudan basılıyor.
   ======================================================================= */

describe('alt birimler', () => {
	it('liste satırları kendi kimliklerini taşıyor', () => {
		const html = draw(SAMPLES.list);
		expect(html).toContain('data-block-id="x:0.0"');
		expect(html).toContain('data-block-id="x:0.1"');
		expect(html).toContain('data-block-kind="list-item"');
	});

	it('sözlük satırları da', () => {
		const html = draw({
			t: 'list',
			id: 'x:0',
			style: 'dict',
			items: [{ term: 'yaprak', def: 'düşen şey' }]
		});
		expect(html).toContain('<dl class="dict blk"');
		expect(html).toContain('data-block-id="x:0.0"');
		expect(html).toContain('<dt>yaprak</dt>');
	});

	it('numaralı liste <ol> oluyor', () => {
		expect(draw({ t: 'list', id: 'x:0', style: 'num', items: ['bir'] })).toContain('<ol');
		expect(draw(SAMPLES.list)).toContain('<ul');
	});

	it('manga kareleri kendi kimliklerini taşıyor', () => {
		const html = draw(SAMPLES.manga);
		expect(html).toContain('data-block-id="x:0.0"');
		expect(html).toContain('data-block-kind="manga-item"');
	});
});

/* ==========================================================================
   TEK TEK BLOKLAR
   ======================================================================= */

describe('manga', () => {
	it('okuma yönü bloktan geliyor, varsayılan rtl', () => {
		expect(draw(SAMPLES.manga)).toContain('dir="rtl"');
		expect(draw({ ...SAMPLES.manga, dir: 'ltr' })).toContain('dir="ltr"');
	});

	it('düzen `data-layout` ile seçiliyor', () => {
		expect(draw(SAMPLES.manga)).toContain('data-layout="dikey"');
	});

	/* Prototipte yol kökten açılan bir index.html'e göreliydi. Sayı artık
	   `/sayi/2026-09` gibi bir rotada açılıyor — baştaki eğik çizgi olmazsa
	   tarayıcı `/sayi/assets/…` arar ve görsel sessizce kırılır. */
	it('kare görselinin yolu kökten başlıyor', () => {
		expect(draw(SAMPLES.manga)).toContain('src="/assets/x/01.webp"');
	});

	it('filigran yalnızca `href` varken bağ oluyor', () => {
		const withHref = draw({
			...SAMPLES.manga,
			mark: { label: 'PIGMENT', href: 'https://ornek.com', note: 'izle' }
		});
		expect(withHref).toContain('<a class="manga-mark" href="https://ornek.com"');
		expect(withHref).toContain('rel="noopener"');

		const withoutHref = draw({ ...SAMPLES.manga, mark: { label: 'PIGMENT' } });
		expect(withoutHref).toContain('<span class="manga-mark"');
	});
});

describe('kapak', () => {
	it('künyeyi sayı bağlamından okuyor', () => {
		const html = draw(SAMPLES.cover);
		expect(html).toContain(content.issue.title);
		expect(html).toContain(content.issue.subtitle);
		expect(html).toContain(content.issue.colophon);
		expect(html).toContain(`№ ${String(content.issue.number).padStart(2, '0')}`);
	});

	/* Prototipte künye küresel bir `MAG.data.issue`ydı. Bu test onun geri
	   gelmediğini gösteriyor: BAŞKA bir sayı bağlamında çizilen kapak, o başka
	   sayıyı basıyor. Küresel bir değişkene bakıyor olsaydı ikisi de aynı çıkardı. */
	it('küresel künyeye değil, verilen bağlama bakıyor', () => {
		const other = { ...content.issue, number: 7, title: 'Başka Sayı', subtitle: 'başka' };
		const html = render(Block_, {
			props: { block: SAMPLES.cover, index: 0 },
			context: issueContextMap(other)
		}).body;

		expect(html).toContain('Başka Sayı');
		expect(html).toContain('№ 07');
		expect(html).not.toContain(content.issue.title);
	});
});

describe('künye satırı', () => {
	it('boş alanlar için öksüz ayıraç bırakmıyor', () => {
		const full = draw(SAMPLES.byline);
		expect(full).toContain('byline__role');
		expect(full).toContain('4 dk');

		const bare = draw({ t: 'byline', id: 'x:0', author: 'Yazar' });
		expect(bare).not.toContain('byline__role');
		expect(bare).not.toContain('byline__time');
	});
});

describe('söyleşi', () => {
	/* Rozet ("S" / adın baş harfi) "Balon" düzeniyle birlikte kalktı: soruyu
	   balonun kendisi işaretliyor, cevabı da anlatı kutusunun künyesindeki TAM
	   ad. Bu test o kararı tutuyor — rozet sessizce geri gelirse kırmızı yanar. */
	it('soruda işaret yok, cevapta adın tamamı yazıyor', () => {
		const soru = draw({ t: 'dialog', id: 'x:0', who: 'q', text: '?' });
		expect(soru).toContain('dialog--q');
		expect(soru).not.toContain('dialog__who');
		expect(soru).not.toContain('dialog__name');

		/* Sınıf listesine göre eşleşiyor, tam dizgiye göre değil: Dialog artık
		   kendi kapsamlı stilini taşıdığı için Svelte her öğeye bir kapsam
		   sınıfı (`svelte-xxxxxx`) ekliyor ve o karma stil her değiştiğinde
		   değişir. Test tasarımı tutmalı, derleyicinin karmasını değil. */
		const cevap = draw(SAMPLES.dialog);
		expect(cevap).not.toContain('dialog__who');
		expect(cevap).toMatch(/<span class="dialog__name[^"]*">Nur<\/span>/);
	});

	/* Ad isteğe bağlı (`DialogBlock.name?`) — adsız bir cevap boş künye
	   basmamalı, yoksa kutunun tepesinde sebepsiz bir boşluk kalır. */
	it('adsız cevapta künye hiç basılmıyor', () => {
		const adsiz = draw({ t: 'dialog', id: 'x:0', who: 'a', text: 'Cevap.' });
		expect(adsiz).not.toContain('dialog__name');
	});
});

/* ==========================================================================
   SAYININ TAMAMI
   --------------------------------------------------------------------------
   Asıl test bu: 98 bloğun 98'i de çiziliyor mu, ankrajları eksiksiz mi?
   ======================================================================= */

describe('2026-09 sayısının tamamı', () => {
	const blocks = content.sections.flatMap((s) => s.pages.flatMap((p) => p.blocks));
	const drawn = blocks.map((block, i) => draw(block, i));

	/* 98 → 99: sy-7'ye muhabirin karşılığı olan ikinci balon eklendi. */
	it('99 blok', () => {
		expect(blocks).toHaveLength(99);
	});

	it('hiçbiri boş çizilmiyor', () => {
		const empty = blocks.filter((b, i) => !drawn[i].trim()).map((b) => `${b.id} (${b.t})`);
		expect(empty).toEqual([]);
	});

	it('her bloğun ankrajı çıktıda bir kez geçiyor', () => {
		const ids = drawn
			.flatMap((html) => [...html.matchAll(/data-block-id="([^".]+)"/g)])
			.map((m) => m[1]);
		expect(ids).toEqual(blocks.map((b) => b.id));
	});

	it('sayının bütün tipleri kullanımda (örnekler uydurma değil)', () => {
		const used = new Set(blocks.map((b) => b.t));
		expect([...used].sort()).toEqual([...used].sort().filter((t) => BLOCK_TYPES.includes(t)));
		expect(used.size).toBe(20);
	});
});
