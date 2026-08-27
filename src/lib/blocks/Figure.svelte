<!--
	Metnin altına oturan tek görsel.

	`bg: 'img:…'` ile karıştırılmasın: o görseli sayfanın TAMAMINA seriyor ve
	metin üstünde yüzüyor (bkz. PageBackground.svelte). Burada ilişki ters —
	görsel akışın bir parçası, kendinden önceki paragrafın altında durur.

	⚠️ Stil neden burada, `blocks.css`'te değil: o dosya prototiple BAYT BAYT
	eşit tutuluyor (src/lib/styles/parity.test.ts → MIRRORED) ve `figure` bloğu
	prototipte hiç yok. Aynı gerekçeyle PageBackground.svelte de kendi kapsamlı
	stilini taşıyor (karar 1.40).
-->
<script lang="ts">
	import { assetUrl, avifSrcset } from '$lib/content/assets';
	import type { FigureBlock } from '$lib/content/types';
	import type { BlockAttrs } from './attrs';
	import Inline from './Inline.svelte';

	let { block, ...attrs }: { block: FigureBlock } & BlockAttrs = $props();

	const avif = $derived(avifSrcset(block.img));

	/* Manga karesiyle aynı cömert değer: tuval masaüstünde 560 CSS px'te
	   sabit, sayfa onun neredeyse tamamı. */
	const SIZES = '(max-width: 640px) 100vw, 600px';
</script>

<figure {...attrs} class={['figure', attrs.class]}>
	<picture>
		{#if avif}<source type="image/avif" srcset={avif} sizes={SIZES} />{/if}
		<img src={assetUrl(block.img)} sizes={SIZES} alt={block.alt} loading="lazy" decoding="async" />
	</picture>
	<!-- `caption` bloğuyla aynı metin türü, aynı muamele: satır içi biçimleme geçerli. -->
	{#if block.caption}<figcaption><Inline text={block.caption} /></figcaption>{/if}
</figure>

<style>
	.figure {
		margin: 0;
	}

	/* Kaynaklar 400px genişlikte ve boyları 180-200 arasında oynuyor. Sabit bir
	   `aspect-ratio` verip kırpmak yerine kendi oranlarında çiziliyorlar: her
	   biri kendi sayfasında tek başına duruyor, aradaki 20 pikselin farkı
	   görünmüyor — kırpılan kompozisyon ise görünürdü. */
	.figure img {
		width: 100%;
		height: auto;
		display: block;
		border-radius: var(--radius-md);
	}

	/* `.caption` bloğuyla aynı ölçü — ikisi de görsel altı yazısı. */
	.figure figcaption {
		margin-block-start: var(--sp-2);
		font-family: var(--font-ui);
		font-size: var(--fs-xs);
		line-height: var(--lh-snug);
		color: var(--ink-faint);
		letter-spacing: 0.01em;
	}
</style>
