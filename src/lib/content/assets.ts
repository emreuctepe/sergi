/* ============================================================================
   VARLIK YOLU — içerikteki `assets/…` → tarayıcı URL'i
   ----------------------------------------------------------------------------
   İçerik dosyaları yolları `static/`e GÖRE yazıyor (`assets/2026-09/tren.webp`);
   `validate.test.ts` de dosyayı orada arıyor. Prototipte bu yol `index.html`
   kökten açıldığı için olduğu gibi `src`e konabiliyordu. Burada olmaz: sayı
   `/sayi/2026-09` gibi bir rotada açılıyor ve göreli yol `/sayi/assets/…`
   olurdu — sessizce kırık bir görsel.

   `base` bilerek eklenmiyor: uygulama alan adının kökünde yayınlanıyor
   (adapter-cloudflare, `wrangler.jsonc`). Bir gün alt yolda yayınlanırsa
   `$app/paths`'in `base`'i BURAYA girer, 90 blok içine değil.
   ========================================================================= */

import turevler from './gorsel-turevleri.json';

/** `assets/2026-09/tren.webp` → `/assets/2026-09/tren.webp` */
export function assetUrl(path: string): string {
	return path.startsWith('/') ? path : `/${path}`;
}

/* ==========================================================================
   AVIF TÜREVLERİ
   --------------------------------------------------------------------------
   Kaynak `.webp` doğruluk kaynağı olarak duruyor; yanına `tools/gorsel-
   turevleri.mjs` birkaç boyda AVIF yazıyor. Gerekçe ve ölçümler o dosyada.

   Hangi dosyanın hangi boyları olduğu TAHMİN EDİLMİYOR, manifestten okunuyor:
   `logo.webp` 256px, `kapak.webp` 1200px — "hep üç boy vardır" varsayımı
   olmayan bir türevi `srcset`e yazardı ve `<source>` eşleştiği için tarayıcı
   `<img>`e DÜŞMEZ, okur kırık görsel görürdü.
   ======================================================================= */

/**
 * `assets/2026-09/tren.webp` →
 * `/assets/2026-09/tren-600.avif 600w, /assets/2026-09/tren-900.avif 900w, …`
 *
 * Türevi olmayan dosya için `null` — çağıran `<source>`u hiç basmıyor.
 */
export function avifSrcset(path: string): string | null {
	const widths = (turevler as Record<string, number[]>)[path];
	if (!widths?.length) return null;

	const base = path.slice(0, path.lastIndexOf('.'));
	return widths.map((w) => `${assetUrl(`${base}-${w}.avif`)} ${w}w`).join(', ');
}
