/* ============================================================================
   DOĞRULAMA — içerik ağacı tutarlı mı?
   ----------------------------------------------------------------------------
   TypeScript bir sayının ŞEKLİNİ garanti ediyor: `t: 'p'` yazan bloğun `text`i
   vardır. Garanti ETMEDİĞİ şeyler bu dosyanın konusu:

     · iki sayfanın aynı kimliği taşıması
     · bir blok kimliğinin sayfasıyla uyuşmaması (`km-1:3` bloğu `km-2`'de)
     · `text: ''` — tip geçer, sayfada boşluk kalır
     · `bg: 'img:…'` diyen bir sayfanın gösterdiği dosyanın olmaması
     · `puzzlePool`'da olmayan bir bulmacanın adı
     · bir derinliğin hiç sayfa üretmemesi

   Neden throw değil de liste: bir sayı hazırlanırken on tane hatası olabilir ve
   hepsini tek seferde görmek gerekir. İlkinde patlayan bir doğrulayıcı, on kez
   çalıştırılan bir doğrulayıcıdır.

   Dosya sistemine BAKMAZ (saf kalsın, tarayıcıda da çalışsın). `img:` yollarının
   gerçekten var olup olmadığını `validate.test.ts` ayrıca denetler.
   ========================================================================= */

import { flow } from './flow';
import { BLOCK_TYPES, DEPTHS } from './types';
import type { Block, IssueContent, Page, Section } from './types';

/** Tek bir sorun. `where` içerik ağacındaki yol, `message` insanca açıklama. */
export interface Problem {
	where: string;
	message: string;
}

const FITS = ['contain', 'scroll'];
const BLEEDS = ['none', 'full'];
const TRANSITIONS = [
	'none',
	'fade-up',
	'mask-wipe',
	'parallax',
	'stagger',
	'signature',
	'panel-reveal'
];
const PAGE_KINDS = ['cover', 'opener', 'figure', 'photo', 'signature', 'puzzle', 'manga', 'outro'];
const SECTION_TYPES = [
	'cover',
	'article',
	'gallery',
	'interview',
	'list',
	'puzzle',
	'manga',
	'outro'
];

/** Kimlikler seçici ve URL parçası olarak kullanılıyor — güvenli alfabe. */
const ID = /^[a-z0-9-]+$/;
const BG = /^(scene|photo|img):.+$/;

/* ==========================================================================
   BLOK
   ======================================================================= */

/**
 * Bloğun İÇİ dolu mu? Tip denetimi alanın VAR olduğunu söyler, dolu olduğunu
 * değil — `text: ''` bir tip hatası değil, bir dizgi hatasıdır.
 */
function validateBlock(block: Block, page: Page, index: number, where: string): Problem[] {
	const problems: Problem[] = [];
	const add = (message: string) => problems.push({ where, message });

	if (!BLOCK_TYPES.includes(block.t)) {
		add(`kayıtsız blok tipi: "${block.t}". Yeni tipse types.ts'e ekle.`);
	}

	/* Kimlik sayfasıyla ve sırasıyla uyuşmalı: yorum ankrajı buna dayanıyor. */
	const expected = `${page.id}:${index}`;
	if (block.id !== expected) {
		add(`blok kimliği "${block.id}" ama sırasına göre "${expected}" olmalı.`);
	}

	if ('text' in block && !block.text.trim()) add('metni boş.');
	if (block.t === 'quote' && block.by !== undefined && !block.by.trim()) add('`by` boş.');
	if (block.t === 'byline' && !block.author.trim()) add('yazar adı boş.');

	if (block.t === 'stat') {
		if (!block.items.length) add('hiç satırı yok.');
		block.items.forEach((it, i) => {
			if (!it.v.trim() || !it.k.trim()) add(`${i}. rakamın değeri ya da etiketi boş.`);
		});
	}

	if (block.t === 'list') {
		if (!block.items.length) add('hiç satırı yok.');
		block.items.forEach((it, i) => {
			const empty = typeof it === 'string' ? !it.trim() : !it.term.trim() || !it.def.trim();
			if (empty) add(`${i}. satırı boş.`);
		});
	}

	if (block.t === 'manga') {
		if (!block.panels.length) add('hiç karesi yok.');
		block.panels.forEach((panel, i) => {
			/* Kare ya gerçek dosya ya çizilmiş sahne — ikisi de yoksa boş kutu. */
			if (!panel.img && panel.art === undefined) add(`${i}. karenin ne görseli ne çizimi var.`);
			/* Görselin alt metni erişilebilirlik borcudur, sonra kapatılmaz. */
			if (panel.img && !panel.alt?.trim()) add(`${i}. karenin alt metni yok.`);
			panel.text?.forEach((bubble, b) => {
				if (!bubble.text.trim()) add(`${i}. karenin ${b}. balonu boş.`);
			});
		});
	}

	return problems;
}

/* ==========================================================================
   SAYFA
   ======================================================================= */

function validatePage(page: Page, where: string): Problem[] {
	const problems: Problem[] = [];
	const add = (message: string) => problems.push({ where, message });

	if (!ID.test(page.id)) add(`sayfa kimliği "${page.id}" küçük harf, rakam ve tire olmalı.`);
	if (!FITS.includes(page.fit)) add(`geçersiz fit: "${page.fit}".`);
	if (!TRANSITIONS.includes(page.scene)) add(`geçersiz geçiş: "${page.scene}".`);
	if (page.bleed && !BLEEDS.includes(page.bleed)) add(`geçersiz bleed: "${page.bleed}".`);
	if (page.kind && !PAGE_KINDS.includes(page.kind)) add(`geçersiz sayfa türü: "${page.kind}".`);
	if (page.bg && !BG.test(page.bg)) add(`arka plan "scene:", "photo:" ya da "img:" ile başlamalı.`);

	if (!page.depth.length) add('hiçbir okuma modunda görünmüyor.');
	for (const d of page.depth) {
		if (d !== 'all' && !DEPTHS.includes(d)) add(`geçersiz derinlik: "${d}".`);
	}
	if (page.depth.includes('all') && page.depth.length > 1) {
		add('`all` başka derinliklerle birlikte yazılmış — `all` zaten hepsi demek.');
	}

	if (!page.blocks.length) add('hiç bloğu yok.');
	page.blocks.forEach((block, i) => {
		problems.push(...validateBlock(block, page, i, `${where} › ${block.id} (${block.t})`));
	});

	return problems;
}

/* ==========================================================================
   BÖLÜM
   ======================================================================= */

function validateSection(section: Section, where: string): Problem[] {
	const problems: Problem[] = [];
	const add = (message: string) => problems.push({ where, message });

	if (!ID.test(section.slug))
		add(`bölüm slug'ı "${section.slug}" küçük harf, rakam ve tire olmalı.`);
	if (!SECTION_TYPES.includes(section.type)) add(`geçersiz bölüm türü: "${section.type}".`);
	if (!section.title.trim()) add('başlığı boş.');
	if (!section.pages.length) add('hiç sayfası yok.');

	for (const page of section.pages) {
		problems.push(...validatePage(page, `${where}/${page.id}`));
	}

	return problems;
}

/* ==========================================================================
   SAYI
   ======================================================================= */

/** Bir sayının tamamını denetler. Boş dizi = sorun yok. */
export function validateIssue(content: IssueContent): Problem[] {
	const problems: Problem[] = [];
	const { issue, sections, puzzles } = content;
	const add = (where: string, message: string) => problems.push({ where, message });

	/* --- künye ------------------------------------------------------------- */
	if (!/^\d{4}-\d{2}$/.test(issue.slug)) add(issue.slug, 'sayı slug\'ı "YYYY-AA" olmalı.');
	if (!/^\d{4}-\d{2}-\d{2}$/.test(issue.publishedAt)) {
		add(issue.slug, `yayın tarihi "YYYY-AA-GG" olmalı, "${issue.publishedAt}" geldi.`);
	}
	if (!issue.title.trim()) add(issue.slug, 'sayı başlığı boş.');
	if (issue.number < 1) add(issue.slug, `sayı numarası ${issue.number} olamaz.`);

	/* --- bölümler ---------------------------------------------------------- */
	if (!sections.length) add(issue.slug, 'sayının hiç bölümü yok.');
	for (const section of sections) {
		problems.push(...validateSection(section, section.slug));
	}

	/* --- benzersizlik (bölümler arası, o yüzden burada) --------------------- */
	problems.push(
		...duplicates(
			sections.map((s) => s.slug),
			"bölüm slug'ı",
			issue.slug
		)
	);

	const pages = sections.flatMap((s) => s.pages);
	problems.push(
		...duplicates(
			pages.map((p) => p.id),
			'sayfa kimliği',
			issue.slug
		)
	);

	const blocks = pages.flatMap((p) => p.blocks);
	problems.push(
		...duplicates(
			blocks.map((b) => b.id),
			'blok kimliği',
			issue.slug
		)
	);

	/* --- her mod okunabilir mi? -------------------------------------------- */
	for (const depth of DEPTHS) {
		const count = flow(content, depth).length;
		if (!count) add(issue.slug, `"${depth}" modunda hiç sayfa yok — o mod boş bir sayı açar.`);
	}

	/* --- bulmacalar --------------------------------------------------------- */
	const known = new Set(puzzles.map((p) => p.id));
	problems.push(
		...duplicates(
			puzzles.map((p) => p.id),
			'bulmaca kimliği',
			issue.slug
		)
	);

	for (const id of issue.puzzlePool ?? []) {
		if (!known.has(id)) add(issue.slug, `puzzlePool'da tanımsız bulmaca: "${id}".`);
	}
	if (issue.editorsPick && !known.has(issue.editorsPick)) {
		add(issue.slug, `editorsPick tanımsız bir bulmacayı gösteriyor: "${issue.editorsPick}".`);
	}

	/* Sayfada bulmaca yuvası varsa havuz dolu olmalı: yuva boş açılırsa okur
	   "Bulmacalar yükleniyor…" yazısıyla baş başa kalır. */
	const hasSlots = blocks.some((b) => b.t === 'puzzleSlots');
	if (hasSlots && !puzzles.length) {
		add(issue.slug, 'sayfada bulmaca yuvası var ama sayının hiç bulmacası yok.');
	}

	return problems;
}

/** Yinelenen değerleri sorun listesine çevirir. */
function duplicates(values: string[], label: string, where: string): Problem[] {
	const seen = new Set<string>();
	const dupes = new Set<string>();
	for (const v of values) {
		if (seen.has(v)) dupes.add(v);
		seen.add(v);
	}
	return [...dupes].map((v) => ({ where, message: `yinelenen ${label}: "${v}".` }));
}

/** Sorun listesini okunur tek bir metne çevirir (test çıktısı, konsol). */
export function formatProblems(problems: Problem[]): string {
	return problems.map((p) => `  ${p.where}: ${p.message}`).join('\n');
}
