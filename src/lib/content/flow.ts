/* ============================================================================
   AKIŞ — okuma derinliği bir sayıyı hangi sayfalara indirger?
   ----------------------------------------------------------------------------
   Prototipteki `js/data.js`'in `pageVisible` + `flow` + `estimateMinutes`
   üçlüsü. Saf fonksiyonlar: içerik ağacı girer, sıralı sayfa listesi ve bir
   dakika sayısı çıkar. Tuval, ilerleme kaydı, mod seçici ve doğrulayıcı hepsi
   bunu okur.
   ========================================================================= */

import type { Block, Depth, IssueContent, Page, PageKind, Section } from './types';

/** Bir sayfa, verilen derinlikte akışa girer mi? */
export function pageVisible(page: Page, depth: Depth): boolean {
	return page.depth.includes('all') || page.depth.includes(depth);
}

/** Bölüm bağlamını taşıyan akış öğesi — sayfa tek başına kendi başlığını bilmez. */
export interface FlowItem {
	section: Section;
	page: Page;
}

/** Verilen derinlikte akışa girecek tüm sayfalar, bölüm sırasıyla. */
export function flow(content: IssueContent, depth: Depth): FlowItem[] {
	const out: FlowItem[] = [];
	for (const section of content.sections) {
		for (const page of section.pages) {
			if (pageVisible(page, depth)) out.push({ section, page });
		}
	}
	return out;
}

/* ==========================================================================
   OKUMA SÜRESİ TAHMİNİ
   --------------------------------------------------------------------------
   Bu sayı mod seçim kartında "~14 dk" diye okura GÖSTERİLİYOR, yani bir vaat.
   Vaadin tutması için iki şeyi doğru saymak gerekiyor: okunan kelimeler ve
   okunmayan ama BAKILAN sayfalar.

   Prototip ördek tiplemesiyle sayıyordu (`if (b.text) … if (b.items) …`) ve
   bu sessizce eksik sayıyor: manga balonlarının metni bloğun kendisinde değil
   `panels[].text[]` içinde, `figure`ın altyazısı da `caption` alanında —
   ikisi de `b.text` testinden geçemediği için SIFIR kelime sayılıyordu.
   Buradaki `switch (block.t)` tam kapsam denetimine giriyor: 21. blok tipi
   eklenip burada unutulursa `pnpm check` kırılır (`bilinmeyenTip` kalıbı,
   bkz. `Block.svelte` ve karar 1.13). Bir tipin "sıfır kelime" olması da
   yazılmış bir karar oluyor, atlanmış bir dal değil.
   ======================================================================= */

/** Ortalama okuma hızı (kelime/dk). Prototipten aynen taşındı. */
const WORDS_PER_MINUTE = 190;

/**
 * Metnin ölçemediği süre: sayfanın kendisine BAKMAK ne kadar sürüyor?
 *
 * Kayıt `PageKind` üzerinde tam — yeni bir sayfa türü eklendiğinde "buna ne
 * kadar bakılır" sorusu cevaplanmadan derleme geçmiyor. Prototipte üç değer
 * vardı (`manga`, `photo`, `opener`); kalan beşi hiç sorulmamıştı ve
 * cevapları sessizce sıfırdı.
 */
const LOOKING_MINUTES: Record<PageKind, number> = {
	/* Tam sayfalık kompozisyonlar: okur durup bakıyor, sayacak kelime yok. */
	cover: 0.3,
	opener: 0.3,
	photo: 0.3,
	figure: 0.3,
	/* Yedi kare, balonlar dışında sayılacak metni olmayan bir anlatı. */
	manga: 0.75,
	/* İmza sayfası ve sayı sonu metinden ibaret — kelimeler zaten sayıldı. */
	signature: 0,
	outro: 0,
	/* Bulmaca OYNANIYOR, okunmuyor. Prototipin kararı ve gerekçesi aynen
	   duruyor: bir bulmacanın süresi kendi kartında (`estMinutes`) yazıyor ve
	   okuma vaadine karışmıyor — kimse bulmacayı çözmek zorunda değil. */
	puzzle: 0
};

/** Boşluklara bölünmüş kelime sayısı. Boş metin sıfır — `''.split()` bir verir. */
function words(text: string): number {
	const t = text.trim();
	return t ? t.split(/\s+/).length : 0;
}

/** Bir bloğun okura kaç kelime gösterdiği. */
function blockWords(block: Block): number {
	switch (block.t) {
		case 'kicker':
		case 'h1':
		case 'h2':
		case 'h3':
		case 'lead':
		case 'p':
		case 'pull':
		case 'note':
		case 'caption':
		case 'dialog':
			return words(block.text);

		case 'quote':
			return words(block.text) + words(block.by ?? '');

		/* `alt` sayılmıyor: okunan bir metin değil, göremeyene okunan bir metin.
		   İkisini toplamak sayfayı iki kez okumak sayardı. */
		case 'figure':
			return words(block.caption ?? '');

		case 'byline':
			return words(block.author) + words(block.role ?? '');

		case 'stat':
			return block.items.reduce((n, item) => n + words(item.v) + words(item.k), 0);

		case 'list':
			return block.style === 'dict'
				? block.items.reduce((n, item) => n + words(item.term) + words(item.def), 0)
				: block.items.reduce((n, item) => n + words(item), 0);

		/* Balonlar da metin — kare başına birkaç kelime ama sekiz karede toplanıyor.
		   Filigran (`mark`) sayfanın köşesindeki künye, okunan bir cümle değil. */
		case 'manga':
			return (
				words(block.title ?? '') +
				block.panels.reduce(
					(n, panel) => n + (panel.text ?? []).reduce((m, b) => m + words(b.text), 0),
					0
				)
			);

		/* Kendi metni olmayan bloklar. `cover` künyeden birkaç kelime basıyor
		   (başlık, alt başlık) ama o sayfanın süresi kelimelerde değil
		   `LOOKING_MINUTES.cover`ta: kapak okunmaz, bakılır. */
		case 'rule':
		case 'puzzleSlots':
		case 'cover':
		case 'outro':
			return 0;

		default:
			return bilinmeyenTip(block);
	}
}

/** Kayıtlı her blok tipinin bir dalı olmak zorunda — kanıtı `never`. */
function bilinmeyenTip(block: never): never {
	throw new Error(`Kelime sayısı yazılmamış blok tipi: ${JSON.stringify(block)}`);
}

/**
 * Verilen akışın tahmini okuma süresi (dk, tam sayı).
 *
 * Girdisi `Depth` değil AKIŞ: mod seçici zaten her derinlik için `flow()`
 * çağırıp sayfa sayısını da gösteriyor, aynı listeyi iki kez üretmenin sebebi
 * yok. Ayrıca fonksiyonun ölçtüğü şeyi dürüstçe adlandırıyor — "bu sayı ne
 * kadar sürer" değil, "BU SAYFALAR ne kadar sürer".
 *
 * En az 1: sıfır dakikalık bir okuma vaadi anlamsız.
 */
export function estimateMinutes(items: readonly FlowItem[]): number {
	let minutes = 0;
	for (const { page } of items) {
		const count = page.blocks.reduce((n, block) => n + blockWords(block), 0);
		minutes += count / WORDS_PER_MINUTE;
		if (page.kind) minutes += LOOKING_MINUTES[page.kind];
	}
	return Math.max(1, Math.round(minutes));
}
