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
