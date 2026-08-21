/* ============================================================================
   AKIŞ — okuma derinliği bir sayıyı hangi sayfalara indirger?
   ----------------------------------------------------------------------------
   Prototipteki `js/data.js`'in `pageVisible` + `flow` ikilisi. Saf fonksiyonlar:
   içerik ağacı girer, sıralı sayfa listesi çıkar. Tuval, ilerleme kaydı ve
   doğrulayıcı üçü de bunu okur.

   `estimateMinutes` burada YOK — o Faz 1f'in işi (mod seçim kartlarındaki süre
   vaadi), ve doğru sayıyı vermesi için blok bileşenlerinin son hâlini bekliyor.
   ========================================================================= */

import type { Depth, IssueContent, Page, Section } from './types';

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
