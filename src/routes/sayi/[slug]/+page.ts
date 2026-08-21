/* ============================================================================
   SAYI ROTASI — /sayi/2026-09
   ----------------------------------------------------------------------------
   1.0'da tek sayı var ve o sayı derlenmiş TS içinde (bkz. types.ts başındaki
   not). Yani "yükleme" bir ağ isteği değil, bir modül seçimi: içerik istemciye
   uygulama paketiyle birlikte geliyor.

   `SAYILAR` haritası bilerek AÇIK. Dinamik `import(`../content/${slug}`)`
   yazmak, var olmayan bir slug için çalışma anında patlayan bir yola dönüşürdü;
   burada bilinmeyen slug tek satırda 404 oluyor ve `entries()` yayınlanacak
   sayıları statik olarak sayabiliyor.
   ========================================================================= */

import { error } from '@sveltejs/kit';
import type { IssueContent } from '$lib/content/types';
import { content as kizilMevsim } from '../../../content/2026-09';
import type { EntryGenerator, PageLoad } from './$types';

const SAYILAR: Record<string, IssueContent> = {
	'2026-09': kizilMevsim
};

/** Önceden çizilecek rotalar — sayı sayısı elle sayılmaz, buradan gelir. */
export const entries: EntryGenerator = () => Object.keys(SAYILAR).map((slug) => ({ slug }));

export const load: PageLoad = ({ params }) => {
	const content = SAYILAR[params.slug];
	if (!content) error(404, `"${params.slug}" diye bir sayı yok.`);
	return { content };
};
