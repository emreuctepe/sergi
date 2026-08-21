/* ============================================================================
   DOĞRULAMA TESTLERİ
   ----------------------------------------------------------------------------
   İki iş yapıyor:

     1. Yayınlanacak sayı (2026-09) doğrulamadan geçiyor mu?
     2. Doğrulayıcı gerçekten ısırıyor mu?

   İkincisi olmadan birincisi hiçbir şey söylemez: her zaman boş liste döndüren
   bir fonksiyon da "geçer". Bu yüzden her kural için bilerek bozulmuş bir örnek
   var — kural kaldırılırsa o test kırmızı yanar.

   Kimlik kilidi (blockids.lock.json) da burada denetleniyor: bir blok kimliği
   sessizce kaybolamaz.
   ========================================================================= */

import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import { flow } from './flow';
import { formatProblems, validateIssue } from './validate';
import type { Depth, IssueContent } from './types';
import { content } from '../../content/2026-09/index';
import lock from './blockids.lock.json';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../../..');

const pages = content.sections.flatMap((s) => s.pages);
const blocks = pages.flatMap((p) => p.blocks);

/* ==========================================================================
   YAYINLANACAK SAYI
   ======================================================================= */

describe('2026-09 doğrulaması', () => {
	it('hiçbir sorun bırakmıyor', () => {
		const problems = validateIssue(content);
		expect(problems, `\n${formatProblems(problems)}\n`).toEqual([]);
	});

	it('üç okuma modu da söz verdiği sayfa sayısını üretiyor', () => {
		/* min 17 / mid 22 / full 25 — mod seçim kartlarındaki vaadin sayısal
		   karşılığı. Bir sayfanın `depth`i değişirse burada görünür.

		   Sayılar 18/24/28'di: "Gece Hattı"nın çekilmemiş üç karesi düşünce
		   üçü de indi (gh-2 `all`, gh-3 `mid`+`full`, gh-4 yalnız `full`).
		   Gerekçe: tools/tasi-icerik.mjs → DUSEN_SAYFALAR. */
		expect(flow(content, 'min')).toHaveLength(17);
		expect(flow(content, 'mid')).toHaveLength(22);
		expect(flow(content, 'full')).toHaveLength(25);
	});
});

/* ==========================================================================
   KİMLİK KİLİDİ
   ======================================================================= */

describe('blok kimliği kilidi', () => {
	const locked = lock['2026-09'];

	it('kilitlenmiş hiçbir blok kimliği kaybolmadı', () => {
		const current = new Set(blocks.map((b) => b.id));
		const missing = locked.blocks.filter((id) => !current.has(id));

		expect(
			missing,
			`Bu blok kimlikleri kilitte var ama içerikte yok: ${missing.join(', ')}.\n` +
				'Onlara bağlı yorumlar sayfa seviyesine düşer. Silme bilerekse kimliği ' +
				'blockids.lock.json’dan da çıkar ve commit mesajına nedenini yaz.'
		).toEqual([]);
	});

	it('kilitlenmiş hiçbir sayfa kimliği kaybolmadı', () => {
		const current = new Set(pages.map((p) => p.id));
		const missing = locked.pages.filter((id) => !current.has(id));
		expect(missing, `kilitte olup içerikte olmayan sayfa: ${missing.join(', ')}`).toEqual([]);
	});

	it('kilit güncel — yeni eklenen kimlikler de yazılı', () => {
		const lockedBlocks = new Set<string>(locked.blocks);
		const added = blocks.map((b) => b.id).filter((id) => !lockedBlocks.has(id));

		expect(
			added,
			`İçerikte kilitte olmayan blok var: ${added.join(', ')}.\n` +
				'Zararsız ama kilit eskimiş: yeni kimlikleri blockids.lock.json’a ekle.'
		).toEqual([]);
	});
});

/* ==========================================================================
   VARLIKLAR
   ======================================================================= */

describe('görsel yolları', () => {
	/** İçerikte adı geçen bütün dosya yolları — sayfa arka planı, manga karesi, logo. */
	const referenced = new Set<string>();
	for (const page of pages) {
		if (page.bg?.startsWith('img:')) referenced.add(page.bg.slice(4));
		for (const block of page.blocks) {
			if (block.t !== 'manga') continue;
			if (block.mark?.img) referenced.add(block.mark.img);
			for (const panel of block.panels) if (panel.img) referenced.add(panel.img);
		}
	}

	it('içerik 17 görsel dosyasına atıfta bulunuyor', () => {
		expect(referenced.size).toBe(17);
	});

	it.each([...referenced].sort())('static/%s var', (rel) => {
		expect(existsSync(resolve(root, 'static', rel)), `${rel} bulunamadı`).toBe(true);
	});
});

/* ==========================================================================
   DOĞRULAYICI ISIRIYOR MU?
   --------------------------------------------------------------------------
   Küçük ama geçerli bir sayı kuruluyor, sonra tek bir yerinden bozuluyor.
   `satisfies` sayesinde örnek hem tipe uyuyor hem de değiştirilebilir kalıyor.
   ======================================================================= */

function ornek() {
	return {
		issue: {
			slug: '2026-09',
			number: 3,
			title: 'Kızıl Mevsim',
			subtitle: 'alt başlık',
			publishedAt: '2026-09-01',
			colophon: 'künye',
			editorsPick: 'renk-dizisi',
			puzzlePool: ['renk-dizisi']
		},
		intro: [],
		sections: [
			{
				slug: 'editorden',
				type: 'article',
				title: 'Editörden',
				pages: [
					{
						id: 'ed-1',
						/* Açık tip: testler bu diziyi başka derinliklerle bozuyor. */
						depth: ['all'] as (Depth | 'all')[],
						fit: 'contain',
						scene: 'fade-up',
						bg: 'scene:paper',
						blocks: [
							{ t: 'h1', id: 'ed-1:0', text: 'Başlık' },
							{ t: 'p', id: 'ed-1:1', text: 'Gövde.' }
						]
					}
				]
			}
		],
		puzzles: [
			{
				id: 'renk-dizisi',
				name: 'Renk Dizisi',
				blurb: 'blurb',
				tags: ['görsel'],
				difficulty: 3,
				estMinutes: 3,
				icon: '🎨',
				config: { rounds: 8 }
			}
		]
	} satisfies IssueContent;
}

/** Bozulmuş örneği doğrulayıp mesajları tek metin hâlinde döndürür. */
function bozukta(kir: (c: ReturnType<typeof ornek>) => void): string {
	const c = ornek();
	kir(c);
	const problems = validateIssue(c);
	expect(problems.length, 'doğrulayıcı bu bozukluğu görmedi').toBeGreaterThan(0);
	return formatProblems(problems);
}

describe('doğrulayıcı bozuk içeriği yakalıyor', () => {
	it('sağlam örnek temiz geçiyor (yoksa aşağıdaki testler yalan söyler)', () => {
		expect(validateIssue(ornek())).toEqual([]);
	});

	it('yinelenen sayfa kimliği', () => {
		expect(
			bozukta((c) => {
				c.sections[0].pages.push({ ...c.sections[0].pages[0] });
			})
		).toContain('yinelenen sayfa kimliği');
	});

	it('sırasıyla uyuşmayan blok kimliği', () => {
		expect(
			bozukta((c) => {
				c.sections[0].pages[0].blocks[1].id = 'ed-1:7';
			})
		).toContain('"ed-1:1" olmalı');
	});

	it('boş metin', () => {
		expect(
			bozukta((c) => {
				c.sections[0].pages[0].blocks[0].text = '   ';
			})
		).toContain('metni boş');
	});

	it('geçersiz fit', () => {
		expect(
			bozukta((c) => {
				(c.sections[0].pages[0] as { fit: string }).fit = 'cover';
			})
		).toContain('geçersiz fit');
	});

	it('`all` başka derinliklerle karışmış', () => {
		expect(
			bozukta((c) => {
				c.sections[0].pages[0].depth = ['all', 'min'];
			})
		).toContain('`all` zaten hepsi demek');
	});

	it('hiçbir modda görünmeyen sayfa', () => {
		expect(
			bozukta((c) => {
				c.sections[0].pages[0].depth = [];
			})
		).toContain('hiçbir okuma modunda görünmüyor');
	});

	it('bloksuz sayfa', () => {
		expect(
			bozukta((c) => {
				c.sections[0].pages[0].blocks = [];
			})
		).toContain('hiç bloğu yok');
	});

	it('tanımsız bulmacayı gösteren editorsPick', () => {
		expect(
			bozukta((c) => {
				c.puzzles = [];
			})
		).toContain('editorsPick tanımsız');
	});

	it('bozuk arka plan öneki', () => {
		expect(
			bozukta((c) => {
				(c.sections[0].pages[0] as { bg: string }).bg = 'assets/x.webp';
			})
		).toContain('"scene:", "photo:" ya da "img:"');
	});

	/* Blok bileşenleri bağları `target="_blank"` ile basıyor (bkz.
	   $lib/blocks/Inline.svelte). Sayı içine giden bir bağ orada sessizce
	   yanlış davranır: yeni sekmede yeni bir dergi açılır. */
	it('sayı içine giden bağ', () => {
		expect(
			bozukta((c) => {
				c.sections[0].pages[0].blocks[0].text = '[sonraki sayı](/sayi/2026-10)';
			})
		).toContain('"https://" ile başlamalı');
	});

	it('liste satırındaki bağ da denetleniyor', () => {
		expect(
			bozukta((c) => {
				c.sections[0].pages[0].blocks.push({
					t: 'list',
					id: 'ed-1:2',
					items: ['[kaynak](kaynaklar.html)']
				} as never);
			})
		).toContain('"https://" ile başlamalı');
	});

	it('alt metni olmayan manga karesi', () => {
		expect(
			bozukta((c) => {
				c.sections[0].pages[0].blocks.push({
					t: 'manga',
					id: 'ed-1:2',
					page: 1,
					layout: 'plan',
					panels: [{ img: 'assets/x.webp' }]
				} as never);
			})
		).toContain('alt metni yok');
	});
});
