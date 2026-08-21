<!--
	Kapak. Kendi verisi yok: her alanı sayının künyesinden okur — başlık iki
	yerde yazılırsa bir gün ikisi ayrışır.
-->
<script lang="ts">
	import LeafMark from '$lib/art/LeafMark.svelte';
	import { issueContext } from '$lib/content/context';
	import type { BlockAttrs } from './attrs';

	let { ...attrs }: BlockAttrs = $props();

	const readIssue = issueContext();
	const issue = $derived(readIssue());
	const no = $derived(String(issue.number).padStart(2, '0'));
</script>

<div {...attrs} class={['cover', attrs.class]}>
	<div class="cover__top">
		<span class="cover__mark"><LeafMark /></span>
		<span class="cover__meta">{issue.colophon}</span>
	</div>
	<div class="cover__mid">
		<span class="cover__no">№ {no}</span>
		<h1 class="cover__title">{issue.title}</h1>
		<p class="cover__sub">{issue.subtitle}</p>
	</div>
	<div class="cover__bottom">
		<span class="cover__hint">kaydır</span>
		<span class="cover__chev">⌄</span>
	</div>
</div>
