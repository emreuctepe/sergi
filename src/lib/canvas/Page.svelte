<!--
	TEK SAYFA — `render.js`'in `R.page`'inin karşılığı.

	Sayfa kendi bölümünü bilmez, bölüm bağlamı prop olarak gelir: aynı sayfa
	içindekilerde de, folio'da da bölüm adıyla anılıyor.

	`data-*` öznitelikleri süs değil, ARAYÜZ: `canvas.css` düzeni (`fit`,
	`bleed`), `blocks.css` giriş animasyonunu (`scene` + `inview`) bunlardan
	okuyor. IntersectionObserver'ın yazdığı tek şey `data-inview`.

	⚠️ `data-inview` "true" DOĞUYOR, "false" değil.
	`blocks.css`'te giriş animasyonları `opacity: 0` ile başlıyor ve ancak
	`[data-inview="true"]` ile açılıyor. Yani "false" ile doğan bir sayfa,
	kendisini açacak JavaScript herhangi bir sebeple çalışmazsa — betik
	yüklenmemiş, IntersectionObserver yok, sekme hiç boyanmamış — sonsuza kadar
	GÖRÜNMEZ kalır. Dergiyi bir animasyonun çalışmasına bağlamak, boş sayfa
	riskini süs için almak olur.

	Sıra tersine çevrildi: her sayfa görünür doğuyor, tuval yalnızca ekranın
	ALTINDA kalanları gizleyip gözlemciye veriyor (bkz. Canvas.svelte). Bedeli:
	ilk sayfa açılış animasyonunu oynatmıyor — zaten görünür olduğu için.
-->
<script lang="ts">
	import Block from '$lib/blocks/Block.svelte';
	import type { Page, Section } from '$lib/content/types';
	import PageBackground from './PageBackground.svelte';

	let {
		section,
		page,
		index,
		total
	}: { section: Section; page: Page; index: number; total: number } = $props();

	/**
	 * Ters çevrilmiş metin taşıyan ya da tam kanayan sayfa "overlay" olur:
	 * arka planın üstüne alttan yukarı bir perde iner, yoksa açık renk yazı
	 * açık renk bir görselin üstünde kaybolur.
	 */
	const overlay = $derived(page.bleed === 'full' || page.blocks.some((b) => b.invert));
</script>

<section
	class={['page', overlay && 'page--overlay']}
	data-page-id={page.id}
	data-section={section.slug}
	data-section-title={section.title}
	data-kind={page.kind ?? section.type}
	data-scene={page.scene}
	data-fit={page.fit}
	data-bleed={page.bleed ?? 'none'}
	data-inview="true"
	data-index={index}
	role="group"
	aria-roledescription="sayfa"
	aria-label="{section.title} — sayfa {index + 1} / {total}"
>
	<!--
		İlk sayfa `eager`: kapak görseli sayının LCP öğesi ve 425 KB. Tembel
		işaretlenmiş bir LCP, tarayıcıya "acelesi yok" demektir — oysa okurun
		ilk gördüğü şey o. Geri kalan 14 görsel tembel kalıyor; ölçüldü, ilk
		görünümde yalnız iki görsel iniyor.
	-->
	{#if page.bg}<PageBackground bg={page.bg} eager={index === 0} />{/if}

	<div class="page__inner">
		{#each page.blocks as block, i (block.id)}
			<Block {block} index={i} />
		{/each}
	</div>
</section>

<style>
	/* ======================================================================
	   SÖYLEŞİ SAYFASI — "Balon" düzeni
	   ----------------------------------------------------------------------
	   Sekiz soru-cevap sayfası (sy-1…sy-8) burada kuruluyor. Açılış sayfası
	   DIŞARIDA: `kind: 'opener'` taşıdığı için `data-kind` "interview" değil
	   "opener" oluyor ve beğenilen o tasarım ellenmiyor.

	   NEDEN İÇERİK DEĞİL DÜZEN DEĞİŞTİ
	   Blok sırası kilitli: `sy-N:0` soru, `sy-N:1` cevap, `sy-N:2` çizim ve
	   integrity.test.ts her kimliği `sayfaId:index` olmaya zorluyor. Blokları
	   görsel sıraya dizmek kimlikleri kaydırırdı, kimlikler de yorum ankrajı
	   (docs/YORUM-SISTEMI.md §2.1) — sekiz sayfalık bir tasarım tercihi için
	   okurların yorumları sayfa seviyesine düşerdi.

	   Çözüm ızgara: DOM sırası olduğu gibi kalıyor, yerleşim `grid-row` ile
	   veriliyor. Ayrıca ızgara, akışın yapamadığı tek şeyi yapıyor — çizimle
	   balonu AYNI GÖZE koyup üst üste bindiriyor.

	         satır 1 │ çizim  +  soru balonu (alta yaslı, çizmenin üstünde)
	         satır 2 │ cevap kutusu
	         satır 3+│ kalanlar (sy-8'de `rule` + `note`) kendiliğinden dizilir

	   Kurallar `:global()` çünkü hedefler başka bileşenlerin kök öğeleri
	   (Dialog.svelte, Figure.svelte). Kapsam yine de dar: hepsi bu bileşenin
	   kendi `.page` öğesinden iniyor ve yalnız `data-kind="interview"` iken.
	   =================================================================== */
	.page[data-kind='interview'] {
		/* Balonun çizimin ALTINA taşan payı. Kuyruk da bu boşluğun içinde
		   duruyor — sayı büyürse balon resimden kopar, küçülürse kuyruk
		   cevap kutusuna girer. */
		--balon-tasma: 9cqi;
	}

	.page[data-kind='interview'] .page__inner {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		row-gap: var(--sp-4);
	}

	/* blocks.css bloklar arasına `margin-top` koyuyor; ızgarada aralığı
	   `row-gap` veriyor, ikisi üst üste binmesin.

	   `:not(.figure)` şart: figürün marjı SÜS DEĞİL, düzenin kendisi (aşağıya
	   bak — üstte sayfa dolgusunu geri alıyor, altta balona yer açıyor). O
	   muafiyet olmadan buradaki sıfırlama figür kuralını eziyordu; ikisi de
	   benim kuralım ama bu seçici daha özgül, yani sessizce kazanıyordu. */
	.page[data-kind='interview'] .page__inner > :global(.blk + .blk:not(.figure)) {
		margin-top: 0;
	}

	/* ÇİZİM — tam kanıyor. Kaynak bir makale fotoğrafı değil, VİDEO KARESİ;
	   kenar boşluğuna alınıp köşesi yuvarlatılınca "resim" gibi duruyordu,
	   oysa sayfanın zemini olması gerekiyor. Negatif marjlar sayfanın kendi
	   dolgusunu geri alıyor (canvas.css `.page` → 1.35 dikey / 1 yatay). */
	.page[data-kind='interview'] :global(.figure) {
		grid-row: 1;
		grid-column: 1;
		margin: calc(var(--pad-page) * -1.35) calc(var(--pad-page) * -1) var(--balon-tasma);
	}

	.page[data-kind='interview'] :global(.figure img) {
		border-radius: 0;
	}

	/* AÇILIŞ SORUSU — çizimle aynı gözde, alta yaslı. Figürün alt marjı
	   (`--balon-tasma`) satırı o kadar uzattığı için balon tam o kadar taşıyor:
	   ayrıca negatif marj vermeye gerek yok.

	   `:first-child` şart ve sınırı anlatıyor: çizimle eşleşen soru sayfanın
	   AÇILIŞ bloğu. Sayfada ikinci bir soru balonu olabilir (sy-7'de muhabirin
	   karşılığı var) ve o balon akışta, cevabın altında durmalı. Bu kural
	   `:first-child` olmadan onu da 1. satıra koyup açılış balonunun ÜSTÜNE
	   yığardı — iki balon aynı gözde üst üste.

	   ⚠️ `z-index` süs değil: soru DOM'da çizimden ÖNCE geliyor (blok sırası
	   kilitli — `sy-N:0` soru, `sy-N:2` çizim) ve aynı gözü paylaşan iki öğede
	   sonra gelen üste boyanır. Onsuz çizim balonun üstüne biniyor ve sorunun
	   ÜST SATIRLARI görünmez oluyordu — üstelik sessizce: kısa sorularda balon
	   resmin altında kaldığı için hiç fark edilmiyor, yalnız uzun sorularda
	   ortaya çıkıyordu. `.dialog--q` konumunu Dialog.svelte'den zaten alıyor
	   (kuyruk için `position: relative`), yığın burada sıralanıyor. */
	.page[data-kind='interview'] .page__inner > :global(.dialog--q:first-child) {
		grid-row: 1;
		grid-column: 1;
		align-self: end;
		z-index: 1;
	}
</style>
