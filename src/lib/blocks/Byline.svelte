<!--
	Yazar satırı: ad · rol · süre.
	Ayıraç noktaları CSS'ten (`.byline__role::before`) geliyor, metne yazılmıyor —
	rol ya da süre yoksa ortada öksüz bir nokta kalmasın diye.
-->
<script lang="ts">
	import type { BylineBlock } from '$lib/content/types';
	import type { BlockAttrs } from './attrs';

	let { block, ...attrs }: { block: BylineBlock } & BlockAttrs = $props();
</script>

<div {...attrs} class={['byline', attrs.class]}>
	<span class="byline__author">{block.author}</span>
	{#if block.role}<span class="byline__role">{block.role}</span>{/if}
	{#if block.minutes}<span class="byline__time">{block.minutes} dk</span>{/if}
</div>
