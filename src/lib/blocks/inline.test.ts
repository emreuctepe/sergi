/* ============================================================================
   SATIR İÇİ BİÇİMLEME — PROTOTİPLE PARİTE
   ----------------------------------------------------------------------------
   `inline.ts` prototipin dört regex'ini jeton listesine çevirdi. Bu testin
   sorduğu tek soru: SAYFADA GÖRÜNEN ŞEY DEĞİŞTİ Mİ?

   Cevabı yorumla değil ölçerek veriyor: prototipin `U.inline()`'ı çalıştırılıp
   ürettiği HTML ile `Inline.svelte`'in sunucuda ürettiği HTML karşılaştırılıyor,
   hem taşınan sayının bütün metinleri hem de elle seçilmiş kenar durumlar için.

   CSS parite testiyle (`styles/parity.test.ts`) aynı sözleşme: bir gün bilerek
   ayrılırsa bu test silinmez, AYRILIK LİSTESİ'ne nedeniyle yazılır.
   ========================================================================= */

import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import { content } from '../../content/2026-09';
import type { Block } from '$lib/content/types';
import Inline from './Inline.svelte';
import { inline } from './inline';

/* ==========================================================================
   PROTOTİPİ YÜKLE
   --------------------------------------------------------------------------
   `util.js` ES modülü değil ve modül gövdesinde `document.createElement` var
   (modüller arası olay yolu). Bize yalnızca saf bir dizgi fonksiyonu lazım,
   o yüzden `document` yerine tek metotluk bir kukla kuruyoruz — jsdom kurmak
   bir regex'i sınamak için fazla ağır olurdu.
   ======================================================================= */

const require = createRequire(import.meta.url);
const g = globalThis as unknown as Record<string, unknown>;
g.window = {};
g.document = { createElement: () => ({ addEventListener() {}, dispatchEvent() {} }) };
require('../../../prototype/js/util.js');
const prototypeInline = (g.window as { MAG: { util: { inline(s: string): string } } }).MAG.util
	.inline;

/**
 * Karşılaştırmayı ANLAMA indirger.
 *
 * Prototip beş karakteri birden kaçırıyor (`& < > " '`); Svelte metin
 * düğümünde yalnızca `&` ve `<` kaçırıyor — çünkü metin içinde `>`, `"` ve `'`
 * özel değildir, tarayıcı ikisini de aynı karaktere çözer. Yani bu fark
 * DİZGİDE var, SAYFADA yok. Ham dizgileri karşılaştırmak testi "aynı görünüyor
 * mu"dan "aynı yazılmış mı"ya düşürürdü.
 */
function normalize(html: string): string {
	return html
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'");
}

/** Svelte'in SSR imleçlerini (`<!--[-->`, `<!--]-->`) atar. */
function html(text: string): string {
	return normalize(render(Inline, { props: { text } }).body.replace(/<!--.*?-->/gs, ''));
}

/** Prototipin çıktısı, aynı ölçüye indirilmiş hâliyle. */
function prototypeHtml(text: string): string {
	return normalize(prototypeInline(text));
}

/* ==========================================================================
   SAYININ BÜTÜN METİNLERİ
   ======================================================================= */

/** Blok bileşenlerinin gerçekten `<Inline>`'a verdiği alanlar — başkası değil. */
function inlineTexts(block: Block): string[] {
	switch (block.t) {
		case 'h1':
		case 'h2':
		case 'h3':
		case 'lead':
		case 'p':
		case 'pull':
		case 'quote':
		case 'note':
		case 'caption':
		case 'dialog':
			return [block.text];
		case 'list':
			return block.style === 'dict' ? block.items.map((it) => it.def) : block.items.map((it) => it);
		default:
			/* kicker, byline, stat, manga, rule ve veri taşımayan bloklar düz metin
			   basıyor: bir etikette ya da rakamda italik olması gereken bir şey yok. */
			return [];
	}
}

const texts = [
	...new Set(content.sections.flatMap((s) => s.pages.flatMap((p) => p.blocks.flatMap(inlineTexts))))
].sort();

describe('taşınan sayının metinleri', () => {
	/* Sayı kilitli ("1.0'da tek sayı, bugünkü hâliyle"), o yüzden sayı da kilitli:
	   84'ün 3'e düşmesi testin kapsamının çöktüğü anlamına gelir ve o an
	   kırmızı yanmalı. İçerik editöryel olarak açılırsa bu satır güncellenir.

	   87'ydi: "Gece Hattı"nın düşen üç sayfası birer altyazı taşıyordu
	   (bkz. tools/tasi-icerik.mjs → DUSEN_SAYFALAR). */
	it('84 benzersiz metin tarıyor', () => {
		expect(texts.length).toBe(84);
	});

	it('en az bir tanesinde gerçekten biçim işareti var', () => {
		expect(texts.filter((t) => inline(t).some((tk) => tk.k !== 'text')).length).toBeGreaterThan(0);
	});

	it.each(texts)('%s', (text) => {
		expect(html(text)).toBe(prototypeHtml(text));
	});
});

/* ==========================================================================
   KENAR DURUMLAR
   --------------------------------------------------------------------------
   Gerçek içerik `*` ve `` ` `` işaretlerini uslu kullanıyor. Prototiple aynı
   kalmamız gereken yer asıl burası: dilbilgisinin bozulduğu noktalar.
   ======================================================================= */

const EDGE = [
	'düz metin',
	'',
	'**kalın**',
	'*italik*',
	'`kod`',
	'[bağ](https://ornek.com)',
	'**kalın** ve *italik* ve `kod`',
	'yıldız * tek başına',
	'2*3*4 çarpımı',
	'**iki** **kalın** yan yana',
	'kapanmamış **kalın',
	'kapanmamış *italik',
	'kapanmamış `kod',
	'iç içe **kalın *italik* daha**',
	'*a* *b* *c*',
	'&<>"\' kaçırılmalı',
	'<script>alert(1)</script>',
	'[<b>etiketli</b> bağ](https://ornek.com)',
	'`<div>kod içinde etiket</div>`',
	'** boşluklu **',
	'satır\nsonu'
];

describe('kenar durumlar', () => {
	it.each(EDGE)('%j', (text) => {
		expect(html(text)).toBe(prototypeHtml(text));
	});
});

/* ==========================================================================
   AYRILIK LİSTESİ
   --------------------------------------------------------------------------
   Prototiple bilerek AYRIŞTIĞIMIZ yerler. Boş bırakmak yerine iki tarafın da
   çıktısı yazılıyor: ayrılık böylece "bir gün fark ederiz" olmaktan çıkıp
   ölçülen bir şey oluyor — ikisinden biri değişirse test kırılır.
   ======================================================================= */

describe('bilinen ayrılıklar', () => {
	/**
	 * İÇ İÇE BİÇİM. Prototipte bu bir özellik değil, yan etkiydi: `U.inline`
	 * dizgi üzerinde arka arkaya `replace` yapıyor, ikinci regex birincinin
	 * ürettiği HTML'in ÜSTÜNDEN geçiyordu. Jeton listesi düz — iç içe geçmez.
	 *
	 * Neden peşine düşülmedi: taşınan sayının 87 metninin hiçbirinde yok,
	 * dilbilgisi hiçbir yerde "iç içe" diye tarif edilmedi ve düz liste
	 * Faz 3'te okur metnini biçimlendirirken de aynı kalacak.
	 */
	it('üç yıldız iç içe biçim üretmiyor', () => {
		expect(prototypeHtml('***üç yıldız***')).toBe('<em><strong>üç yıldız</strong></em>');
		expect(html('***üç yıldız***')).toBe('*<strong>üç yıldız</strong>*');
	});
});
