/* ============================================================================
   TUVAL GEOMETRİSİ — saf aritmetik
   ----------------------------------------------------------------------------
   `canvas.js`'in içindeki hesapların DOM'dan ayrılmış hâli. Prototipte hepsi
   olay dinleyicilerinin gövdesindeydi: `measureLetterbox` hem ölçüyor hem
   `document.documentElement.style`e yazıyordu, yani "eşik doğru mu?" sorusunu
   sormanın tek yolu tarayıcıyı açıp pencereyi sürüklemekti.

   Burada girdi sayı, çıktı sayı. Tuval bileşeni yalnızca ölçüp yazıyor;
   KARAR bu dosyada ve `geometry.test.ts` onu tarayıcısız sınıyor.
   ========================================================================= */

import type { Fit } from '$lib/content/types';

/* ==========================================================================
   LETTERBOX — tuvalin üstünde/altında kalan boşluk
   ======================================================================= */

/**
 * Bantlar nerede yaşıyor?
 *
 *   `roomy` → letterbox boşluğunda: tuval temiz kalır, arayüz dışarıda.
 *   `tight` → tuvalin üstüne biner, arkasına bulanık perde gerekir.
 *
 * 2px'lik pay bilinçli: `getBoundingClientRect` kesirli piksel döndürüyor ve
 * tam sınırda kalan bir pencere, kullanıcı hiçbir şey yapmadan iki mod
 * arasında titriyordu.
 */
export function letterboxMode(
	viewportH: number,
	canvasH: number,
	bandH: number
): 'roomy' | 'tight' {
	return letterboxFree(viewportH, canvasH) >= bandH - 2 ? 'roomy' : 'tight';
}

/** Tuvalin bir yanında kalan boşluk (px). Negatif olmaz. */
export function letterboxFree(viewportH: number, canvasH: number): number {
	return Math.max(0, (viewportH - canvasH) / 2);
}

/* ==========================================================================
   SABİT MENÜ (dock) — tuvalin yanındaki boşluğa sığar mı?
   ======================================================================= */

/** Ölçüler `canvas.css`'teki `--dock-w` / `--dock-gap` ile aynı olmalı. */
export const DOCK = {
	minWidth: 240,
	maxWidth: 320,
	gap: 24,
	edge: 20,
	/**
	 * Menünün kendi okunabilir olduğu en kısa boy. Bunun altında menü bir liste
	 * kaydırmaktan ibaret kalıyor — boşluğu boş bırakmak daha iyi.
	 */
	minHeight: 440
} as const;

/**
 * Yerleşim: `[kenar][menü][boşluk][tuval][kenar]`.
 * Sığıyorsa menünün alacağı genişliği de söyler.
 */
export function dockFit(
	viewportW: number,
	viewportH: number,
	canvasW: number
): { fits: boolean; width: number } {
	const room = viewportW - 2 * DOCK.edge - DOCK.gap - canvasW;
	const fits = room >= DOCK.minWidth && viewportH >= DOCK.minHeight;
	return { fits, width: Math.min(DOCK.maxWidth, Math.floor(room)) };
}

/* ==========================================================================
   SAYFA AKIŞI — kaydırma konumu hangi sayfaya denk geliyor?
   ======================================================================= */

/** Bir sayfanın kaydırma kabındaki yeri. */
export interface PageMetrics {
	/** `offsetTop` — kabın tepesine göre. */
	top: number;
	height: number;
	fit: Fit;
}

/**
 * Okunan sayfa hangisi?
 *
 * Ölçüm noktası ekranın tepesi değil, %40'ı: snap sırasında bir sonraki sayfa
 * tepeden girmeye başladığı anda folio'nun değişmesi erken olur — okur hâlâ
 * öncekini okuyordur. Prototipteki 0.4 oranı aynen korundu.
 */
export function indexAt(pages: readonly PageMetrics[], scrollTop: number, viewH: number): number {
	const mark = scrollTop + viewH * 0.4;
	let index = 0;
	for (let i = 0; i < pages.length; i++) {
		if (pages[i].top <= mark) index = i;
		else break;
	}
	return index;
}

/** Sayının tamamına göre okuma yüzdesi (0–100). */
export function progressPercent(scrollTop: number, scrollHeight: number, viewH: number): number {
	const max = scrollHeight - viewH;
	if (max <= 0) return 0;
	return Math.min(100, Math.max(0, (scrollTop / max) * 100));
}

/* ==========================================================================
   İLERİ / GERİ
   --------------------------------------------------------------------------
   "Sonraki" her zaman "sonraki sayfa" demek değil: `fit: scroll` bir sayfa
   tuvalden birkaç kat uzun olabilir ve okur oradayken bir tuş basışının
   yazının yarısını atlaması kayıp olurdu. Önce sayfanın içinde ilerlenir,
   sayfa bittiğinde sıradakine geçilir.
   ======================================================================= */

/** Ya bir sayfaya git, ya bulunduğun sayfanın içinde kaydır. */
export type Step = { kind: 'page'; index: number } | { kind: 'scroll'; top: number };

/** Bir ekranın ne kadarı atlanır — bir satırlık örtüşme okumayı sürdürüyor. */
const STEP = 0.86;

/** Sayfa sonuna bu kadar kalmışsa "bitti" sayılır (kesirli piksel payı). */
const EDGE = 24;

export function nextStep(
	pages: readonly PageMetrics[],
	index: number,
	scrollTop: number,
	viewH: number
): Step {
	const page = pages[index];
	if (page && page.fit === 'scroll') {
		const bottom = page.top + page.height;
		const seen = scrollTop + viewH;
		if (bottom - seen > EDGE) {
			return { kind: 'scroll', top: Math.min(scrollTop + viewH * STEP, bottom - viewH) };
		}
	}
	return { kind: 'page', index: clamp(index + 1, 0, pages.length - 1) };
}

export function prevStep(
	pages: readonly PageMetrics[],
	index: number,
	scrollTop: number,
	viewH: number
): Step {
	const page = pages[index];
	if (page && page.fit === 'scroll' && scrollTop - page.top > EDGE) {
		return { kind: 'scroll', top: Math.max(scrollTop - viewH * STEP, page.top) };
	}
	return { kind: 'page', index: clamp(index - 1, 0, pages.length - 1) };
}

export function clamp(value: number, min: number, max: number): number {
	return value < min ? min : value > max ? max : value;
}
