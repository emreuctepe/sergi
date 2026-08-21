<script lang="ts">
	import type { QuoteBlock } from '$lib/content/types';
	import type { BlockAttrs } from './attrs';
	import Inline from './Inline.svelte';

	let { block, ...attrs }: { block: QuoteBlock } & BlockAttrs = $props();
</script>

<blockquote {...attrs} class={['quote', attrs.class]}>
	<p><Inline text={block.text} /></p>
	{#if block.by}<cite>{block.by}</cite>{/if}
</blockquote>
