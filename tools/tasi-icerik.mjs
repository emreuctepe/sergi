/* ============================================================================
   TAŞIMA — prototip sayısı → tipli TS içerik dosyaları
   ----------------------------------------------------------------------------
   Kullanım:  node tools/tasi-icerik.mjs 2026-09

   `prototype/js/issues/<slug>.js` dosyasını sahte bir `window` altında çalıştırıp
   ürettiği nesneyi `src/content/<slug>/` altına TypeScript olarak yazar.

   NEDEN SCRIPT, NEDEN ELLE DEĞİL
   90 blok elle kopyalanırsa tek bir kayan tırnak bile sessizce içerik bozar ve
   diff'te kaybolur. Script çalıştırılabilir bir kanıt: çıktı yeniden üretilebilir
   olduğu sürece "taşıma sırasında bir şey değişti mi?" sorusunun cevabı
   `git diff` kadar yakın.

   TAŞIMA SIRASINDA DEĞİŞEN ÜÇ ŞEY (gerisi birebir)
   1. Her blok AÇIK bir `id` alır: `sayfaId:index`. Prototipte bu kimlik çizim
      anında türetiliyordu — blok yer değiştirince ona bağlı yorumlar sessizce
      komşu paragrafa kayardı. Artık kimlik veridir ve elle korunur.
      Biçim korundu ki prototipte yazılmış ankrajlar geçerli kalsın
      (bkz. docs/YORUM-SISTEMI.md §2.1).
   2. Bulmacaların `stats` alanı DÜŞÜRÜLÜR. O sayılar uydurmaydı; gerçek
      istatistik Faz 4'te sunucudan gelecek (bkz. src/lib/content/types.ts).
   3. Sayfaların varsayılanları açık yazılır: `fit` ve `scene` her sayfada
      bulunur, `bleed` yalnızca `full` iken.

   ⚠️ ÇIKTI KLASÖRÜNÜN SAHİBİ BU SCRIPT. `src/content/<slug>/` her çalıştırmada
   SİLİNİP yeniden yazılır — oraya elle bir dosya koymak onu kaybetmektir (bir kez
   denendi: parite testi oraya konmuştu, ikinci çalıştırma sildi. Test artık
   src/lib/content/parity.test.ts'te). İçeriğin kendisi elle düzenlenebilir, ama
   o gün bu script'in ömrü biter; düzenlemeler `git status` temizken yapılır.

   ÇIKTI TEK YÖNLÜ: prototipe geri yazılmaz.
   ========================================================================= */

import { createRequire } from 'node:module';
import { readdirSync } from 'node:fs';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import prettier from 'prettier';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(import.meta.dirname, '..');

/* ==========================================================================
   1. PROTOTİPİ YÜKLE
   --------------------------------------------------------------------------
   Prototip ES modülü değil: her dosya `(function (MAG) { … })(window.MAG)`
   kalıbıyla kendini global `window.MAG` altına asıyor. Node'da `window` yok,
   biz kuruyoruz — dosyalara dokunmadan çalıştırmanın tek yolu bu.
   ======================================================================= */

/**
 * Prototipten gelen ham nesne. Şekli TypeScript'e değil prototipe ait — o yüzden
 * burada tip yok, `src/lib/content/types.ts` ise çıktıyı tipliyor. Aradaki
 * dönüşüm bu dosya; tam da bu yüzden tipsiz tarafta duruyor.
 *
 * @typedef {Record<string, any>} Raw
 */

/**
 * Prototip dosyalarını taze yükler — aynı süreçte iki kez çağrılabilsin diye.
 * @param {string} file
 */
function fresh(file) {
	delete require.cache[require.resolve(file)];
	require(file);
}

/**
 * Bir sayıyı prototipten okur (tek dosya ya da bölünmüş biçim, fark etmez).
 * @param {string} slug
 * @returns {Raw}
 */
export function loadIssue(slug) {
	const g = /** @type {Raw} */ (/** @type {unknown} */ (globalThis));
	g.window = { MAG: {} };
	fresh(path.join(ROOT, 'prototype/js/content.js'));

	const single = path.join(ROOT, `prototype/js/issues/${slug}.js`);
	const splitDir = path.join(ROOT, `prototype/js/issues/${slug}`);
	try {
		fresh(single);
	} catch (err) {
		if (/** @type {NodeJS.ErrnoException} */ (err).code !== 'MODULE_NOT_FOUND') throw err;
		/* Bölünmüş biçim: issue.js + sections/NN-*.js (bkz. prototype/js/content.js) */
		fresh(path.join(splitDir, 'issue.js'));
		for (const file of readdirSync(path.join(splitDir, 'sections')).sort()) {
			fresh(path.join(splitDir, 'sections', file));
		}
	}

	const issue = g.window.MAG.issues?.[slug];
	if (!issue) throw new Error(`"${slug}" sayısı prototipte bulunamadı.`);
	return issue;
}

/* ==========================================================================
   2. DÖNÜŞTÜR
   ======================================================================= */

/**
 * Tanımsız alanları atar — çıktıda `kind: undefined` gibi gürültü kalmasın.
 * @param {Raw} obj
 * @returns {Raw}
 */
function compact(obj) {
	return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
}

/**
 * Bloğa kimliğini takar. İndeks KAYNAK dizisinden gelir; prototipin çizim
 * döngüsü de öyle sayıyordu (bilinmeyen tipler atlansa bile indeks kaymaz).
 * @param {Raw} block
 * @param {string} pageId
 * @param {number} index
 */
function migrateBlock(block, pageId, index) {
	const { t, ...rest } = block;
	return compact({ t, id: `${pageId}:${index}`, ...rest });
}

/** @param {Raw} page */
function migratePage(page) {
	const { id, depth, kind, fit, bleed, bg, scene, blocks } = page;
	return compact({
		id,
		depth,
		kind: kind || undefined,
		fit: fit || 'contain',
		bleed: bleed === 'full' ? 'full' : undefined,
		bg,
		scene: scene || 'none',
		blocks: /** @type {Raw[]} */ (blocks || []).map((b, i) => migrateBlock(b, id, i))
	});
}

/** @param {Raw} section */
export function migrateSection(section) {
	const { slug, type, title, kicker, author, minutes, tags, direction, pages } = section;
	return compact({
		slug,
		type,
		title,
		kicker,
		author,
		minutes,
		tags,
		direction,
		pages: /** @type {Raw[]} */ (pages).map(migratePage)
	});
}

/**
 * `stats` düşer; gerisi olduğu gibi kalır.
 * @param {Raw} puzzle
 */
export function migratePuzzle(puzzle) {
	const { stats, ...rest } = puzzle;
	void stats;
	return rest;
}

/* ==========================================================================
   3. TS OLARAK YAZ
   --------------------------------------------------------------------------
   Kendi serileştiricimiz var çünkü JSON.stringify çift tırnak ve tırnaklı
   anahtar üretiyor — çıktı hem projenin biçimine uymaz hem de `as const`
   almadan tip denetiminden geçmez. Biçimlendirmeyi sonda Prettier yapıyor,
   yani burada okunabilirlik değil DOĞRULUK aranıyor.
   ======================================================================= */

const IDENT = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

/**
 * @param {unknown} value
 * @returns {string}
 */
function lit(value) {
	if (value === null) return 'null';
	if (typeof value === 'string') return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
	if (typeof value === 'number' || typeof value === 'boolean') return String(value);
	if (Array.isArray(value)) return `[${value.map(lit).join(',')}]`;
	const body = Object.entries(/** @type {Raw} */ (value))
		.filter(([, v]) => v !== undefined)
		.map(([k, v]) => `${IDENT.test(k) ? k : `'${k}'`}: ${lit(v)}`)
		.join(',');
	return `{${body}}`;
}

/**
 * Dosya başına düşen "elle düzenlenir" başlığı.
 * @param {string[]} lines
 */
function header(lines) {
	return [
		'/* ' + '='.repeat(74),
		...lines.map((l) => (l ? '   ' + l : '')),
		'   ' + '='.repeat(71) + ' */'
	].join('\n');
}

/**
 * Bölüm slug'ından TS değişken adı: `kizil-mevsim` → `kizilMevsim`.
 * @param {string} slug
 */
function camel(slug) {
	return slug.replace(/-([a-z0-9])/g, (/** @type {string} */ _, /** @type {string} */ c) =>
		c.toUpperCase()
	);
}

async function main() {
	const slug = process.argv[2];
	if (!slug) {
		console.error('Kullanım: node tools/tasi-icerik.mjs <sayı-slug>   (örn. 2026-09)');
		process.exit(1);
	}

	const src = loadIssue(slug);
	const outDir = path.join(ROOT, 'src/content', slug);
	await rm(outDir, { recursive: true, force: true });
	await mkdir(path.join(outDir, 'sections'), { recursive: true });

	const prettierConfig = await prettier.resolveConfig(path.join(outDir, 'x.ts'));
	/**
	 * @param {string} file
	 * @param {string} code
	 */
	const write = async (file, code) => {
		const formatted = await prettier.format(code, { ...prettierConfig, parser: 'typescript' });
		await writeFile(path.join(outDir, file), formatted);
	};

	/* --- sayı meta + tanıtım + bulmacalar --------------------------------- */
	await write(
		'issue.ts',
		[
			header([
				`SAYI ${String(src.issue.number).padStart(2, '0')} · "${src.issue.title}" — ${slug}`,
				'-'.repeat(74),
				'Sayının künyesi, ilk ziyaretteki tanıtım kartları ve bulmaca havuzu.',
				'Bölümler ayrı dosyalarda: sections/NN-<slug>.ts',
				'',
				'Üretildi: tools/tasi-icerik.mjs — elle düzenlenebilir, script yeniden',
				'çalıştırılırsa üzerine yazar.'
			]),
			"import type { IntroCard, Issue, Puzzle } from '$lib/content/types';",
			'',
			`export const issue: Issue = ${lit(src.issue)};`,
			'',
			`export const intro: IntroCard[] = ${lit(src.intro)};`,
			'',
			`export const puzzles: Puzzle[] = ${lit(/** @type {Raw[]} */ (src.puzzles).map(migratePuzzle))};`
		].join('\n\n')
	);

	/* --- bölümler ---------------------------------------------------------- */
	const sections = /** @type {Raw[]} */ (src.sections).map(migrateSection);
	/** @type {{ file: string; name: string; section: Raw }[]} */
	const files = [];

	for (const [i, section] of sections.entries()) {
		const file = `${String(i).padStart(2, '0')}-${section.slug}`;
		const name = camel(section.slug);
		files.push({ file, name, section });

		const pageIds = /** @type {Raw[]} */ (section.pages).map((p) => p.id).join(', ');
		await write(
			`sections/${file}.ts`,
			[
				header([
					`${String(i).padStart(2, '0')} · ${section.title.toLocaleUpperCase('tr')}`,
					'-'.repeat(74),
					`${section.pages.length} sayfa: ${pageIds}`,
					'',
					'Blok kimlikleri (`sayfaId:index`) yorum ankrajıdır — bir bloğu silmek',
					'ya da taşımak ona bağlı yorumları etkiler. Sıra değiştirirken',
					'kimlikleri OLDUĞU GİBİ bırak; docs/YORUM-SISTEMI.md §2.1.'
				]),
				"import type { Section } from '$lib/content/types';",
				'',
				`export const ${name}: Section = ${lit(section)};`
			].join('\n\n')
		);
	}

	/* --- birleştirici ------------------------------------------------------ */
	await write(
		'index.ts',
		[
			header([
				`"${src.issue.title}" — sayının tamamı`,
				'-'.repeat(74),
				'Bölüm sırası BURADAKİ dizi sırasıdır. Prototipte sıra dosya yükleme',
				'sırasına bağlıydı (bir <script> satırı kayarsa sayı karışırdı); burada',
				'sıra tek bir yerde, açıkça duruyor.'
			]),
			'',
			"import type { IssueContent } from '$lib/content/types';",
			"import { intro, issue, puzzles } from './issue';",
			...files.map((f) => `import { ${f.name} } from './sections/${f.file}';`),
			'',
			'export const content: IssueContent = {',
			'\tissue,',
			'\tintro,',
			`\tsections: [${files.map((f) => f.name).join(', ')}],`,
			'\tpuzzles',
			'};',
			'',
			'export default content;'
		].join('\n')
	);

	/* --- özet -------------------------------------------------------------- */
	const pages = sections.flatMap((s) => /** @type {Raw[]} */ (s.pages));
	const blocks = pages.flatMap((p) => /** @type {Raw[]} */ (p.blocks));
	const kinds = new Set(blocks.map((b) => b.t));
	console.log(`${slug} → src/content/${slug}/`);
	console.log(`  ${sections.length} bölüm · ${pages.length} sayfa · ${blocks.length} blok`);
	console.log(`  ${kinds.size} blok tipi: ${[...kinds].sort().join(', ')}`);

	const ids = blocks.map((b) => b.id);
	const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
	if (dupes.length) throw new Error(`Yinelenen blok kimliği: ${dupes.join(', ')}`);
	console.log(`  ${ids.length} blok kimliği, hepsi benzersiz`);
}

/* Doğrudan çalıştırıldıysa taşı. `import` edildiğinde (parite testi
   dönüştürücüleri buradan alıyor) hiçbir şey yazılmaz. */
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	await main();
}
