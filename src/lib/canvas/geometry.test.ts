/* ============================================================================
   TUVAL GEOMETRİSİ TESTLERİ
   ----------------------------------------------------------------------------
   Bu hesaplar prototipte tarayıcı olmadan sınanamıyordu: eşiği doğrulamanın
   tek yolu pencereyi sürükleyip bantların yerinden oynamasını izlemekti.
   Ayrıldılar; artık her eşiğin iki yanı da yazılı.
   ========================================================================= */

import { describe, expect, it } from 'vitest';
import {
	DOCK,
	dockFit,
	indexAt,
	letterboxFree,
	letterboxMode,
	nextStep,
	prevStep,
	progressPercent,
	type PageMetrics
} from './geometry';

/* ==========================================================================
   LETTERBOX
   ======================================================================= */

describe('letterbox', () => {
	/* 900px ekran, 700px tuval → iki yanda 100'er px. 52px bant rahat sığar. */
	it('bant sığıyorsa roomy', () => {
		expect(letterboxMode(900, 700, 52)).toBe('roomy');
	});

	it('sığmıyorsa tight', () => {
		expect(letterboxMode(760, 700, 52)).toBe('tight');
	});

	/* 2px'lik pay: `getBoundingClientRect` kesirli piksel döndürüyor ve tam
	   sınırdaki bir pencere, kullanıcı hiçbir şey yapmadan iki mod arasında
	   titriyordu. Sınırın 2px altı hâlâ "roomy" sayılmalı. */
	it('tam sınırda titremiyor', () => {
		expect(letterboxMode(900, 800, 52)).toBe('roomy'); // free = 50, bant 52
		expect(letterboxMode(900, 804, 52)).toBe('tight'); // free = 48
	});

	it('tuval ekrandan uzunsa boşluk negatif olmuyor', () => {
		expect(letterboxFree(600, 900)).toBe(0);
	});
});

/* ==========================================================================
   SABİT MENÜ
   ======================================================================= */

describe('sabit menü', () => {
	/* 1440 - 40 (kenarlar) - 24 (boşluk) - 560 (tuval) = 816 → bolca yer. */
	it('geniş masaüstünde sığıyor', () => {
		const fit = dockFit(1440, 900, 560);
		expect(fit.fits).toBe(true);
		expect(fit.width).toBe(DOCK.maxWidth);
	});

	it('telefonda sığmıyor', () => {
		expect(dockFit(390, 844, 390).fits).toBe(false);
	});

	/* Boy eşiği ayrı bir kural: yer VAR ama menü okunabilir olmayacak kadar
	   basık. Bu, "genişlik yeter, o zaman aç" demenin yanlış olduğu yer. */
	it('basık ve geniş pencerede yer olsa da açılmıyor', () => {
		expect(dockFit(1440, 400, 300).fits).toBe(false);
	});

	it('dar kalan boşlukta menü genişliği kırpılıyor', () => {
		/* 1000 - 40 - 24 - 680 = 256 → min ile max arasında, olduğu gibi. */
		const fit = dockFit(1000, 900, 680);
		expect(fit.fits).toBe(true);
		expect(fit.width).toBe(256);
	});
});

/* ==========================================================================
   AKIŞ
   ======================================================================= */

/** 400px'lik üç sayfa, ortadaki uzun ve kaydırmalı. */
const PAGES: PageMetrics[] = [
	{ top: 0, height: 400, fit: 'contain' },
	{ top: 400, height: 1200, fit: 'scroll' },
	{ top: 1600, height: 400, fit: 'contain' }
];

describe('okunan sayfa', () => {
	it('tepedeyken ilk sayfa', () => {
		expect(indexAt(PAGES, 0, 400)).toBe(0);
	});

	/**
	 * Ölçüm noktası ekranın tepesi değil %40'ı. Pratikteki karşılığı: sayfa
	 * ancak tuvalin %60'ını kapladığında "okunan sayfa" olur. Sonraki sayfa
	 * tepeden görünmeye başlar başlamaz folio'nun değişmesi erken olurdu —
	 * okur hâlâ öncekini okuyor.
	 */
	it('yeni sayfa tuvalin %60ını kaplayana kadar öncekini sayıyor', () => {
		expect(indexAt(PAGES, 200, 400)).toBe(0); // 2. sayfa tuvalin yarısında
		expect(indexAt(PAGES, 239, 400)).toBe(0); // bir piksel kala
		expect(indexAt(PAGES, 240, 400)).toBe(1); // %60 → devraldı
	});

	it('sayfa yerine oturunca değişiyor', () => {
		expect(indexAt(PAGES, 400, 400)).toBe(1);
		expect(indexAt(PAGES, 1600, 400)).toBe(2);
	});
});

describe('ilerleme yüzdesi', () => {
	it('başta 0, sonda 100', () => {
		expect(progressPercent(0, 2000, 400)).toBe(0);
		expect(progressPercent(1600, 2000, 400)).toBe(100);
	});

	it('ortada orantılı', () => {
		expect(progressPercent(800, 2000, 400)).toBe(50);
	});

	/* İçerik tuvale sığıyorsa kaydırılacak yer yok — sıfıra bölme değil, 0. */
	it('kaydırılamayan akışta 0', () => {
		expect(progressPercent(0, 400, 400)).toBe(0);
	});
});

/* ==========================================================================
   İLERİ / GERİ
   ======================================================================= */

describe('sonraki', () => {
	it('kısa sayfadan sonraki sayfaya geçiyor', () => {
		expect(nextStep(PAGES, 0, 0, 400)).toEqual({ kind: 'page', index: 1 });
	});

	/* Asıl mesele bu: 1200px'lik bir yazının ortasındayken bir tuş basışı
	   yazının kalanını atlamamalı. Önce sayfanın içinde ilerlenir. */
	it('uzun sayfanın içinde önce kaydırıyor', () => {
		const step = nextStep(PAGES, 1, 400, 400);
		expect(step).toEqual({ kind: 'scroll', top: 400 + 400 * 0.86 });
	});

	it('uzun sayfanın sonuna gelince sıradakine geçiyor', () => {
		/* Sayfanın dibi 1600; 1200'de 400px'lik pencereyle tam dibindeyiz. */
		expect(nextStep(PAGES, 1, 1200, 400)).toEqual({ kind: 'page', index: 2 });
	});

	it('son sayfadan ileri gidilmiyor', () => {
		expect(nextStep(PAGES, 2, 1600, 400)).toEqual({ kind: 'page', index: 2 });
	});
});

describe('önceki', () => {
	it('kısa sayfadan öncekine dönüyor', () => {
		expect(prevStep(PAGES, 2, 1600, 400)).toEqual({ kind: 'page', index: 1 });
	});

	it('uzun sayfanın içinde önce yukarı kaydırıyor', () => {
		const step = prevStep(PAGES, 1, 1000, 400);
		expect(step).toEqual({ kind: 'scroll', top: 1000 - 400 * 0.86 });
	});

	it('uzun sayfanın tepesindeyken öncekine geçiyor', () => {
		expect(prevStep(PAGES, 1, 400, 400)).toEqual({ kind: 'page', index: 0 });
	});

	it('ilk sayfadan geri gidilmiyor', () => {
		expect(prevStep(PAGES, 0, 0, 400)).toEqual({ kind: 'page', index: 0 });
	});

	/* Kaydırma adımı sayfanın dışına taşmıyor: uzun sayfanın az aşağısındayken
	   bir adım geri, sayfanın tepesinde durur — bir öncekinin içine sarkmaz. */
	it('kaydırma adımı sayfa sınırında duruyor', () => {
		expect(prevStep(PAGES, 1, 500, 400)).toEqual({ kind: 'scroll', top: 400 });
	});
});
