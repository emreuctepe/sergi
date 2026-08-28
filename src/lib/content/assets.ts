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
import type { IssueContent } from './types';

/** `assets/2026-09/tren.webp` → `/assets/2026-09/tren.webp` */
export function assetUrl(path: string): string {
	return path.startsWith('/') ? path : `/${path}`;
}

/**
 * Tuvalin bir fotoğrafa ayırdığı genişlik — `srcset`in hangi türevi seçeceğini
 * belirleyen sözleşme.
 *
 * Üç bileşen (arka plan, `figure`, manga karesi) bunu AYRI AYRI yazıyordu ve
 * dördüncüsü ön yükleyici olacaktı. Ayrışsalardı ön yükleyici 600px'i, sayfa
 * 900px'i ister; okur aynı görseli İKİ KEZ indirir ve yükleme ekranı "hazır"
 * derken sayfa hâlâ indiriyor olurdu. Tek yerde durması bunu yapısal olarak
 * imkânsız kılıyor.
 *
 * Ölçüm (PageBackground.svelte'ten): tuval telefonda 390 CSS px, masaüstünde
 * 560'ta sabitleniyor; 600 biraz cömert, çünkü eksiği bulanık fotoğraf demek.
 */
export const GORSEL_SIZES = '(max-width: 640px) 100vw, 600px';

/**
 * Sayının adı geçen BÜTÜN görsel dosyaları — sayfa arka planı, `figure` bloğu,
 * manga karesi ve karenin işaretlemesi.
 *
 * ⚠️ Yeni bir blok tipi görsel taşımaya başlarsa BURASI güncellenmeli. Liste
 * bir zamanlar `validate.test.ts`'in içinde elle duruyordu ve başında tam da
 * bu uyarı vardı; ön yükleyici ikinci kopyayı gerektirince uyarı yapıya
 * çevrildi. Şimdi eksik kalırsa iki yerde birden yanlış oluyor: test görseli
 * denetlemiyor VE yükleme ekranı onu saymıyor — yani "%100" derken indirilmemiş
 * bir dosya kalıyor. Tek kopya, tek hata yeri.
 */
export function gorselYollari(content: IssueContent): string[] {
	const bulunan = new Set<string>();

	for (const section of content.sections) {
		for (const page of section.pages) {
			if (page.bg?.startsWith('img:')) bulunan.add(page.bg.slice(4));

			for (const block of page.blocks) {
				if (block.t === 'figure') bulunan.add(block.img);
				if (block.t !== 'manga') continue;
				if (block.mark?.img) bulunan.add(block.mark.img);
				for (const panel of block.panels) if (panel.img) bulunan.add(panel.img);
			}
		}
	}

	return [...bulunan];
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
