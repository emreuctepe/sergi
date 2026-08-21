<!--
	Süs çizgisi. İçerik taşımaz ama kendi blok kimliği vardır — bir bölümün
	bittiği yer de yorumlanabilir bir yerdir.
-->
<script lang="ts">
	import RuleArt from '$lib/art/Rule.svelte';
	import type { BlockAttrs } from './attrs';

	let { ...attrs }: BlockAttrs = $props();
</script>

<div {...attrs} class={['rule-wrap', attrs.class]}><RuleArt /></div>
