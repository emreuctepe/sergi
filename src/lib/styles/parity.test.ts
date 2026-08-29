/* ============================================================================
   CSS PARİTE TESTİ
   ----------------------------------------------------------------------------
   `src/lib/styles/*.css` prototipten taşındı. Taşıma bittiği anda dosyalar
   prototipteki halleriyle BAYT BAYT aynıydı — tek bir kasıtlı düzenleme dışında
   (font yolu, bkz. FORKED).

   Bu test o pariteyi bir sözleşmeye çeviriyor: taşıma sırasında istemeden
   değişen tek bir kural bile kırmızı yanar. Prototip 17 bin satırlık, uçtan uca
   çalışan bir referans; ondan sapmak serbest ama SESSİZCE sapmak değil.

   Bir dosyayı bilerek değiştirdiğinde: adını FORKED'e taşı ve nedenini yaz.
   Liste boşaldığında bu testin işi biter ve silinir.
   ========================================================================= */

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../../..');

/** Prototiple birebir aynı kalması gereken dosyalar. */
const MIRRORED = ['base', 'canvas', 'blocks', 'comments', 'overlays', 'puzzles'] as const;

/**
 * Bilerek ayrılmış dosyalar: ad → ayrılma nedeni.
 * Buraya bir satır eklemek bir karardır, kaçamak değil.
 */
const FORKED: Record<string, string> = {
	tokens:
		'@font-face yolu static/fonts/ altına taşındı (prototipte ../assets/) ' +
		've lisans blocker notu eklendi.'
};

/**
 * Prototipte KARŞILIĞI OLMAYAN dosyalar: ad → var oluş nedeni.
 * MIRRORED ve FORKED ile birlikte bu klasörün tamamını kapsar — aşağıdaki
 * bütünlük testi, parite durumu yazılmamış bir dosyanın sessizce eklenmesini
 * engelliyor. Bir dosyanın "herhalde aynıdır" diye varsayılması, bu testin
 * baştan önlemek için var olduğu şeyin ta kendisi.
 */
const LOCAL: Record<string, string> = {
	fonts:
		'Manga fontunun seçimi. tokens.css `--font-manga`yı :root içinde tanımlıyor ' +
		've orası paritede donmuş; seçim katmansız ayrı bir dosyaya alındı.'
};

function read(p: string) {
	return readFileSync(resolve(root, p), 'utf-8');
}

describe('küresel CSS ↔ prototip paritesi', () => {
	it.each(MIRRORED)('%s.css prototiple birebir aynı', (name) => {
		const proto = read(`prototype/css/${name}.css`);
		const mine = read(`src/lib/styles/${name}.css`);

		expect(
			mine,
			`src/lib/styles/${name}.css prototipten ayrılmış. Kasıtlıysa FORKED listesine ` +
				`nedeniyle birlikte taşı; değilse taşıma sırasında bir şey kaydı.`
		).toBe(proto);
	});

	it('ayrılmış dosyaların her birinin yazılı bir nedeni var', () => {
		for (const [name, reason] of Object.entries(FORKED)) {
			expect(reason.length, `${name}.css için neden yazılmamış`).toBeGreaterThan(20);
		}
		expect(Object.keys(FORKED)).toContain('tokens');
	});

	it('tokens.css yalnızca beklenen iki noktada ayrılıyor', () => {
		const proto = read('prototype/css/tokens.css');
		const mine = read('src/lib/styles/tokens.css');

		/* Fark yalnızca @font-face bloğunda olmalı: yol değişti, uyarı notu eklendi.
		   Geri kalan her şey — bütün palet, ölçek ve sayı temaları — aynı. */
		expect(mine).toContain('url("/fonts/animeace2_reg.ttf")');
		expect(mine).not.toContain('../assets/animeace2_reg.ttf');

		const strip = (s: string) => s.slice(s.indexOf(':root'));
		expect(strip(mine), 'tokens.css’in :root sonrası gövdesi değişmemeli').toBe(strip(proto));
	});

	it('klasörde parite durumu TANIMSIZ bir CSS dosyası yok', () => {
		const actual = readdirSync(resolve(root, 'src/lib/styles'))
			.filter((f) => f.endsWith('.css'))
			.map((f) => f.replace(/\.css$/, ''))
			.sort();

		const bilinen = [...MIRRORED, ...Object.keys(FORKED), ...Object.keys(LOCAL)].sort();

		expect(
			actual,
			'Parite durumu yazılmamış bir CSS dosyası var. Üç listeden birine nedeniyle ' +
				'ekle: MIRRORED (prototiple birebir), FORKED (bilerek ayrıldı), ' +
				'LOCAL (prototipte karşılığı yok).'
		).toEqual(bilinen);
	});
});

/* ============================================================================
   MANGA FONTU ANAHTARI
   ----------------------------------------------------------------------------
   Anahtarın tek satır olması bir VAAT (fonts.css başlığı). Bu testler o vaadin
   üç sessiz kırılma yolunu kapatıyor: import katmana alınırsa override ölür,
   seçilen aile tanımsızsa balon yedeğe düşer, dosya diskte yoksa font hiç
   inmez. Üçünün de ekranda tek belirtisi "balon biraz farklı duruyor" olurdu.
   ========================================================================= */
describe('manga fontu anahtarı', () => {
	/** `--manga-family`de seçili aile adı. */
	function seciliAile(): string {
		const m = read('src/lib/styles/fonts.css').match(/--manga-family:\s*"([^"]+)"/);
		expect(m?.[1], 'fonts.css’te --manga-family okunamadı').toBeTruthy();
		return m![1];
	}

	it('fonts.css app.css’e KATMANSIZ import ediliyor', () => {
		const app = read('src/app.css');

		expect(app, 'fonts.css app.css’e hiç import edilmemiş').toContain(
			"@import './lib/styles/fonts.css';"
		);
		expect(
			app,
			'fonts.css bir layer() içine alınmış. O an tokens.css’i ezmeyi bırakır ve ' +
				'font seçimi sessizce çalışmaz hale gelir — bkz. app.css:23.'
		).not.toMatch(/fonts\.css'\s+layer\(/);
	});

	it('anahtar gerçekten tek satır: --font-manga aileyi değişkenden okuyor', () => {
		const fonts = read('src/lib/styles/fonts.css');
		expect(
			fonts,
			'--font-manga aileyi doğrudan yazıyor. O zaman font değiştirmek iki yer ' +
				'düzenlemek demek ve anahtarın vaadi bozulur.'
		).toContain('--font-manga: var(--manga-family)');
	});

	it('seçili aileyi tanımlayan bir @font-face var', () => {
		const aile = seciliAile();
		const kaynak = read('src/lib/styles/fonts.css') + read('src/lib/styles/tokens.css');

		expect(
			kaynak,
			`"${aile}" seçili ama hiçbir @font-face onu tanımlamıyor — balon sessizce ` +
				'yedek yığına düşer ve bunun ekranda tek belirtisi olmaz.'
		).toContain(`font-family: "${aile}"`);
	});

	it('seçili ailenin font dosyası static/ altında DURUYOR', () => {
		const aile = seciliAile();
		const kaynak = read('src/lib/styles/fonts.css') + read('src/lib/styles/tokens.css');

		/* Aileyi tanımlayan @font-face bloğunu bul, src yolunu oradan çıkar. */
		const blok = [...kaynak.matchAll(/@font-face\s*\{[^}]*\}/g)]
			.map((m) => m[0])
			.find((b) => b.includes(`font-family: "${aile}"`));
		expect(blok, `"${aile}" için @font-face bloğu bulunamadı`).toBeTruthy();

		const yol = blok!.match(/url\("([^"]+)"\)/)?.[1];
		expect(yol, `"${aile}" @font-face’inde url() okunamadı`).toBeTruthy();

		/* 1.39'un deseni: yol tahmin edilmiyor, diskte ARANIYOR. */
		expect(
			existsSync(resolve(root, 'static', yol!.replace(/^\//, ''))),
			`${yol} CSS’te yazılı ama static/ altında yok. Font 404 verir ve yedeğe ` +
				'düşer — yayında fark edilmesi zor, çünkü sayfa çalışmaya devam eder.'
		).toBe(true);
	});
});
