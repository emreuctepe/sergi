/* ============================================================================
   MARKA TESTİ
   ----------------------------------------------------------------------------
   `brand.ts` tek doğruluk kaynağı olmakla görevli. Bu testin işi o sözü
   korumak: ad koda dağılmasın, yayın öncesi doldurulacak alanlar unutulmasın.
   ========================================================================= */

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { brand, origin, pageTitle } from './brand';

const here = dirname(fileURLToPath(import.meta.url));
const srcDir = resolve(here, '..');

function walk(dir: string, out: string[] = []): string[] {
	for (const entry of readdirSync(dir)) {
		const p = join(dir, entry);
		if (statSync(p).isDirectory()) walk(p, out);
		else if (/\.(ts|svelte|html)$/.test(entry)) out.push(p);
	}
	return out;
}

describe('marka tek kaynaktan gelir', () => {
	it('pageTitle sayfa adını markayla birleştirir', () => {
		expect(pageTitle('Kızıl Mevsim')).toBe(`Kızıl Mevsim · ${brand.name}`);
		expect(pageTitle()).toBe(brand.name);
	});

	it('origin protokollü ve tek eğik çizgisiz', () => {
		expect(origin).toBe(`https://${brand.domain}`);
		expect(origin.endsWith('/')).toBe(false);
	});

	it('marka adı brand.ts dışında hiçbir kaynak dosyaya gömülmemiş', () => {
		const offenders = walk(srcDir)
			.filter((p) => !p.endsWith('brand.ts') && !p.endsWith('brand.test.ts'))
			.filter((p) => readFileSync(p, 'utf-8').includes(brand.name))
			.map((p) => p.replace(srcDir + '/', ''));

		expect(
			offenders,
			`Marka adı ("${brand.name}") şu dosyalara gömülmüş. brand.ts'ten import et — ` +
				`ad değişince tek satır değişsin diye bu kaynak var.`
		).toEqual([]);
	});

	it('yayın öncesi doldurulacak alanlar hâlâ yer tutucu (kasıtlı hatırlatma)', () => {
		/* Bu test YEŞİLKEN yayına çıkılmaz: alan adı gerçek değil demektir.
		   Gerçek alan adı girildiğinde bu testi sil — o an blocker kapanmış olur.
		   Bkz. docs/BUILD-TODO.md "Yayın blocker'ları". */
		expect(brand.domain).toBe('ornek.com');
		expect(brand.senderEmail).toContain('ornek.com');
	});
});
