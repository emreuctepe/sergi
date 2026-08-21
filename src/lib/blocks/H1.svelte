<script lang="ts">
	import type { H1Block } from '$lib/content/types';
	import type { BlockAttrs } from './attrs';
	import Inline from './Inline.svelte';

	let { block, ...attrs }: { block: H1Block } & BlockAttrs = $props();
</script>

<h1 {...attrs} class={['h1', block.big && 'h1--big', attrs.class]}><Inline text={block.text} /></h1>
