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
