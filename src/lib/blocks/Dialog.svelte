<!--
	Söyleşi replikası. Soruda rozet "S", cevapta cevaplayanın baş harfi —
	iki sesi ayırt etmek için ad tekrar tekrar yazılmasın diye.
-->
<script lang="ts">
	import type { DialogBlock } from '$lib/content/types';
	import type { BlockAttrs } from './attrs';
	import Inline from './Inline.svelte';

	let { block, ...attrs }: { block: DialogBlock } & BlockAttrs = $props();

	const isQuestion = $derived(block.who === 'q');
	const badge = $derived(isQuestion ? 'S' : (block.name || 'C').slice(0, 1));
</script>

<div {...attrs} class={['dialog', isQuestion ? 'dialog--q' : 'dialog--a', attrs.class]}>
	<span class="dialog__who">{badge}</span>
	<p class="dialog__text"><Inline text={block.text} /></p>
</div>
