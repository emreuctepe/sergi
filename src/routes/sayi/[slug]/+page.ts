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

/**
 * Sayfa DERLEME anında çiziliyor, her istekte değil.
 *
 * İçerik zaten uygulama paketinin içinde (yukarıdaki nota bak): sunucunun her
 * istekte yaptığı iş, hiç değişmeyen bir girdiden hep aynı HTML'i üretmekti.
 * Ölçüldü — canlıda TTFB 563 ms, yanıtta `x-sveltekit-page: true`. Önceden
 * çizilince sayfa Cloudflare'in kenarından statik dosya olarak çıkıyor.
 *
 * Faz 3'te yorumlar gelince bu bozulmuyor: yorumlar okurun tarayıcısında
 * yükleniyor, kabuk statik kalıyor. Kabuğun sunucuda üretilmesini gerektiren
 * ilk şey (okura göre değişen bir HTML) çıktığı gün bu satır kalkar.
 */
export const prerender = true;

export const load: PageLoad = ({ params }) => {
	const content = SAYILAR[params.slug];
	if (!content) error(404, `"${params.slug}" diye bir sayı yok.`);
	return { content };
};
