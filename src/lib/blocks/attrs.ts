/* ============================================================================
   BLOK SARMALAYICI ÖZNİTELİKLERİ
   ----------------------------------------------------------------------------
   Prototipte bu öznitelikleri `R.page` çizimden SONRA DOM'a takıyordu. Burada
   sarmalayıcı bir `<div class="blk">` de yok — olamaz da: `blocks.css`
   `.page__inner > .blk + .blk` (doğrudan çocuk) ve `.blk--invert.caption`
   (aynı öğe) gibi seçiciler kullanıyor. Yani `.blk` bloğun KENDİ kök öğesinde
   olmak zorunda.

   Çözüm: Block.svelte bu nesneyi hesaplar, her blok bileşeni kendi kök öğesine
   yayar. Bileşenin bunları taşımayı unutması TypeScript hatası olur.
   ========================================================================= */

export interface BlockAttrs {
	/** `blk` — `invert` ise `blk blk--invert`. */
	class: string;
	/** `--i: <sıra>` — blokların sırayla belirmesi buna bağlı. */
	style: string;
	/** Yorum ankrajı (docs/YORUM-SISTEMI.md §2.1). */
	'data-block-id': string;
	/** Yorum katmanının "neyin üstündeyim?" sorusunun cevabı. */
	'data-block-kind': string;
}

/**
 * Bir alt birimin (liste satırı, manga karesi) öznitelikleri.
 * Kimlik `blokId.index` — prototipte `[data-sub]` gezilerek takılıyordu,
 * burada bloğun kendisi biliyor.
 */
export function subAttrs(blockId: string, kind: string, index: number) {
	return {
		style: `--i: ${index}`,
		'data-block-id': `${blockId}.${index}`,
		'data-block-kind': `${kind}-item`
	};
}

/* ============================================================================
   ÇİZERİN KENDİ İŞİ — kazara kaldırmayı zorlaştıran öznitelikler
   ----------------------------------------------------------------------------
   YALNIZCA KargaManga'nın çizimlerinde kullanılır: manga kareleri
   (MangaPanel.svelte) ve söyleşi çizimleri (Figure.svelte). Künyede ikisi de
   "telif sahibinde, izinle" diye geçiyor.

   ⚠️ SAYFA ARKA PLANLARINA UYGULANMAZ ve bu bir ihmal değil, zorunluluk:
   o 11 görsel Wikimedia Commons'tan CC lisanslı geliyor ve CC BY-SA 4.0
   §2(a)(5)(B) lisans alanın "etkin teknolojik önlem" uygulamasını açıkça
   yasaklıyor. Künyede o lisansları verip görselleri kilitlemek kendi
   künyemizle çelişmek olurdu (bkz. 08-son.ts → "Görseller").

   ⚠️ BU KORUMA DEĞİL, CAYDIRICI. Görselin adresi sayfa kaynağında düz duruyor;
   `/assets/2026-09/kapali-kapilar/01.webp` adresini açan, ağ sekmesine bakan
   ya da ekran görüntüsü alan herkes görsele ulaşır. Engellenen tek şey KAZARA
   ve KOLAY kaldırma: sağ tık menüsü, sürükleyip sekmeye bırakma, seçip
   kopyalama. Bunu gerçek bir kilit sanmak, olmayan bir güvenceye yaslanmaktır.

   Seçim engeli bilerek yalnız GÖRSELDE: derginin yorum sistemi metin seçmeye
   dayanıyor (docs/YORUM-SISTEMI.md), metne `user-select: none` vermek Faz 3'ü
   doğmadan öldürürdü.

   Faz 3 notu: prototip `#pages` üstünde zaten `contextmenu`u kapatıyor ama
   BAŞKA bir sebeple — uzun basma → koordinat pini (comments.js). O geldiğinde
   iki engel çakışmaz, çünkü bu yalnız görselin kendisinde duruyor.
   ========================================================================= */

export const cizimAttrs = {
	/* Enumerated bir öznitelik, boolean değil: dizgi olarak verilmezse Svelte
	   `false`u yok sayıp özniteliği hiç basmaz ve sürükleme açık kalır.
	   `as const` de şart — literal olmadan tip `string`e genişliyor ve
	   Svelte'in `'true' | 'false'` beklentisini karşılamıyor. */
	draggable: 'false',
	oncontextmenu: (e: Event) => e.preventDefault()
} as const;
