/* ============================================================================
   AKIŞ VE SÜRE TAHMİNİ
   ----------------------------------------------------------------------------
   `estimateMinutes` mod seçim kartında okura GÖSTERİLEN sayıyı üretiyor, yani
   bir vaat. Vaadin iki yanı ayrı ayrı sınanıyor:

     · ARİTMETİK — bilinen kelime sayısı bilinen dakikayı veriyor mu?
     · KAPSAM    — her blok tipinin ve her sayfa türünün bir karşılığı var mı?

   İkincisi asıl mesele. Prototipin sayacı ördek tiplemesiyle çalışıyordu
   (`if (b.text)`) ve eksik saydığını hiç haber vermiyordu: manga balonları ve
   `figure` altyazıları sıfır kelime sayılıyordu. Eksik sayan bir sayaç
   "çalışıyor" görünür — makul bir sayı üretir, sadece yanlış olanı.
   ========================================================================= */

import { describe, expect, it } from 'vitest';
import { content } from '../../content/2026-09/index';
import { estimateMinutes, flow, nearestVisible, pageVisible, type FlowItem } from './flow';
import { BLOCK_TYPES, DEPTHS, type Block, type Page, type Section } from './types';

/* --- yardımcılar ---------------------------------------------------------- */

const sayfa = (blocks: Block[], kind?: Page['kind']): Page => ({
	id: 'x',
	depth: ['all'],
	kind,
	fit: 'contain',
	scene: 'none',
	blocks
});

const bolum: Section = { slug: 's', type: 'article', title: 'Test', pages: [] };

const akis = (...pages: Page[]): FlowItem[] => pages.map((page) => ({ section: bolum, page }));

/** `n` kelimelik bir paragraf. */
const kelimeler = (n: number): Block => ({
	t: 'p',
	id: 'x:0',
	text: Array.from({ length: n }, (_, i) => `k${i}`).join(' ')
});

describe('pageVisible', () => {
	const p = (depth: Page['depth']) => sayfa([]) && { ...sayfa([]), depth };

	it('`all` üç derinlikte de görünüyor', () => {
		for (const d of DEPTHS) expect(pageVisible(p(['all']), d)).toBe(true);
	});

	it('listelenmeyen derinlikte görünmüyor', () => {
		expect(pageVisible(p(['full']), 'min')).toBe(false);
		expect(pageVisible(p(['mid', 'full']), 'min')).toBe(false);
		expect(pageVisible(p(['mid', 'full']), 'mid')).toBe(true);
	});
});

describe('nearestVisible — mod değişince okurun yeri', () => {
	/** `depth` alanını kolayca kurabilmek için küçük bir sayı taklidi. */
	const sayi = (...depths: Page['depth'][]) =>
		({
			issue: {} as never,
			intro: [],
			puzzles: [],
			sections: [
				{
					...bolum,
					pages: depths.map((depth, i) => ({ ...sayfa([]), id: `p${i}`, depth }))
				}
			]
		}) as unknown as Parameters<typeof nearestVisible>[0];

	it('sayfa yeni derinlikte de varsa yerinde kalıyor', () => {
		const c = sayi(['all'], ['all'], ['all']);
		expect(nearestVisible(c, 'p1', 'min')).toBe('p1');
	});

	it('kaybolan sayfada GERİYE düşüyor — ileri atlamak okunmamışın üstünden geçmek', () => {
		const c = sayi(['all'], ['full'], ['all']);
		expect(nearestVisible(c, 'p1', 'min')).toBe('p0');
	});

	it('geride görünür sayfa yoksa ileri bakıyor', () => {
		const c = sayi(['full'], ['full'], ['all']);
		expect(nearestVisible(c, 'p0', 'min')).toBe('p2');
	});

	it('eşit uzaklıkta geri kazanıyor', () => {
		/* p0 ve p2 aynı uzaklıkta; kural "geriye öncelik". */
		const c = sayi(['all'], ['full'], ['all']);
		expect(nearestVisible(c, 'p1', 'mid')).toBe('p0');
	});

	it('bilinmeyen sayfa ve hiç görünür sayfa yoksa null', () => {
		expect(nearestVisible(sayi(['all']), 'yok', 'min')).toBeNull();
		expect(nearestVisible(sayi(['full'], ['full']), 'p0', 'min')).toBeNull();
	});

	it('gerçek sayıda: `km-4` yalnız `full`de', () => {
		/* Dosyanın sırası: km-acilis · km-min · km-1 · km-2 · km-3 · km-4 ·
		   km-5 · km-imza.

		   `mid`e geçen okur bir adım geriye, km-3'e düşüyor — istenen şey bu.

		   `min`de ise dosyanın gövdesi tümden yok (yerine tek sayfalık km-min
		   geçiyor) ve en yakın görünür sayfa İLERİDE: km-imza, yani yazının
		   imza sayfası. Okur dosyanın ortasından sonuna atlıyor. Kural bunu
		   bilerek yapıyor: km-min "aynı yazının kısası" olsa da veri modelinde
		   böyle bir eşleme YOK — sayfalar birbirinin karşılığı olduğunu
		   söylemiyor, yalnızca sırada duruyorlar. Uydurulmuş bir eşleme, tek
		   bir yazı için doğru görünüp ötekilerde sessizce yanlış olurdu. */
		expect(nearestVisible(content, 'km-4', 'min')).toBe('km-imza');
		expect(nearestVisible(content, 'km-4', 'mid')).toBe('km-3');
		expect(nearestVisible(content, 'km-4', 'full')).toBe('km-4');
	});

	it('gerçek sayıda: her sayfa her derinlikte bir karşılık buluyor', () => {
		/* Tek bir sayfanın karşılıksız kalması, o sayfadayken mod değiştiren
		   okurun sayının başına atılması demek olurdu. */
		for (const page of content.sections.flatMap((s) => s.pages)) {
			for (const d of DEPTHS) {
				expect(nearestVisible(content, page.id, d), `${page.id} → ${d}`).not.toBeNull();
			}
		}
	});
});

describe('estimateMinutes — aritmetik', () => {
	it('190 kelime bir dakika', () => {
		expect(estimateMinutes(akis(sayfa([kelimeler(190)])))).toBe(1);
		expect(estimateMinutes(akis(sayfa([kelimeler(1900)])))).toBe(10);
	});

	it('boş akış bile 1 dk — sıfır dakikalık okuma vaadi anlamsız', () => {
		expect(estimateMinutes([])).toBe(1);
		expect(estimateMinutes(akis(sayfa([])))).toBe(1);
	});

	it('sayfaya BAKMA süresi kelimelerin üstüne biniyor', () => {
		/* 190 kelime = 1 dk. Manga sayfası +0.75, yani 1.75 → 2. Aynı kelime
		   türsüz bir sayfada 1 kalıyor: fark yalnızca sayfa türünden geliyor. */
		expect(estimateMinutes(akis(sayfa([kelimeler(190)])))).toBe(1);
		expect(estimateMinutes(akis(sayfa([kelimeler(190)], 'manga')))).toBe(2);
	});

	it('bulmaca sayfası süreye hiç yazılmıyor', () => {
		/* Bulmaca oynanıyor, okunmuyor: süresi kendi kartında (`estMinutes`)
		   yazıyor ve kimse çözmek zorunda değil. */
		const bulmaca = sayfa([{ t: 'puzzleSlots', id: 'x:0' }], 'puzzle');
		expect(estimateMinutes(akis(bulmaca, bulmaca, bulmaca))).toBe(1);
	});
});

describe('estimateMinutes — kapsam', () => {
	it('20 blok tipinin hepsi sayaçtan geçiyor', () => {
		/* Sayacın `switch`i eksik kalırsa dal `bilinmeyenTip`e düşer ve ATAR.
		   Yani bu test tipleri saymıyor, sayacın hepsini TANIDIĞINI ölçüyor. */
		for (const block of content.sections.flatMap((s) => s.pages).flatMap((p) => p.blocks)) {
			expect(() => estimateMinutes(akis(sayfa([block])))).not.toThrow();
		}
		const kullanilan = new Set(
			content.sections.flatMap((s) => s.pages).flatMap((p) => p.blocks.map((b) => b.t))
		);
		expect(kullanilan.size).toBe(BLOCK_TYPES.length);
	});

	it('kayıtsız blok tipi sessizce sıfır sayılmıyor, ATIYOR', () => {
		const uydurma = { t: 'gelecekteki-tip', id: 'x:0', text: 'bir iki üç' } as unknown as Block;
		expect(() => estimateMinutes(akis(sayfa([uydurma])))).toThrow(/Kelime sayısı yazılmamış/);
	});

	it('manga balonları ve figure altyazısı SAYILIYOR', () => {
		/* Prototipin iki kör noktası. Metin bloğun kendisinde değil bir alt
		   yapının içinde olduğu için `if (b.text)` testinden geçemiyordu ve
		   sıfır sayılıyordu.

		   Ölçek bilerek büyük: tek sayfada 12 kelimelik fark yuvarlamanın
		   altında kalır ve test hem doğru hem yanlış sayaçta yeşil yanardı. */
		const manga = (sessiz: boolean): Block => ({
			t: 'manga',
			id: 'x:0',
			page: 1,
			layout: 'dikey',
			title: sessiz ? undefined : 'bir iki üç dört beş',
			panels: [{ art: 0, text: sessiz ? [] : [{ text: 'altı yedi sekiz dokuz on' }] }]
		});
		const figure = (sessiz: boolean): Block => ({
			t: 'figure',
			id: 'x:1',
			img: 'assets/yok.webp',
			/* `alt` iki durumda da dolu: okunan bir metin değil, göremeyene
			   okunan bir metin — sayılsaydı sessiz sürüm de dakika üretirdi. */
			alt: 'göremeyene okunan uzun bir alternatif metin',
			caption: sessiz ? undefined : 'bu sayılır'
		});

		/* Sayfa türü YOK: ölçülen tek şey kelimeler olsun. 100 × 12 = 1200
		   kelime → 6.3 dk. Metinler sustuğunda geriye sıfır kelime kalıyor. */
		const yuz = (sessiz: boolean) =>
			akis(...Array.from({ length: 100 }, () => sayfa([manga(sessiz), figure(sessiz)])));

		expect(estimateMinutes(yuz(false))).toBe(6);
		expect(estimateMinutes(yuz(true))).toBe(1);
	});
});

describe('2026-09 — derinliğin gerçek karşılığı', () => {
	const olcum = DEPTHS.map((depth) => {
		const items = flow(content, depth);
		return { depth, pages: items.length, minutes: estimateMinutes(items) };
	});

	it('min 19 · mid 26 · full 30 sayfa', () => {
		expect(olcum.map((o) => o.pages)).toEqual([19, 26, 30]);
	});

	it('~7 · ~9 · ~10 dk', () => {
		/* ⚠️ Bu üç sayı okura gösteriliyor ve aralarındaki fark ZAYIF: en az
		   ile klasik arasında 3 dakika var. Test onları sabitliyor ki editöryel
		   iş (min sürümlerin yazılması, BUILD-TODO "karar bekleyen sorular" §5)
		   yapıldığında fark diff'te görünsün. */
		expect(olcum.map((o) => o.minutes)).toEqual([7, 9, 10]);
	});

	it('derinlik arttıkça süre de sayfa da azalmıyor', () => {
		for (let i = 1; i < olcum.length; i++) {
			expect(olcum[i].pages).toBeGreaterThan(olcum[i - 1].pages);
			expect(olcum[i].minutes).toBeGreaterThanOrEqual(olcum[i - 1].minutes);
		}
	});
});
