<script lang="ts">
	import type { H2Block } from '$lib/content/types';
	import type { BlockAttrs } from './attrs';
	import Inline from './Inline.svelte';

	let { block, ...attrs }: { block: H2Block } & BlockAttrs = $props();
</script>

<h2 {...attrs} class={['h2', attrs.class]}><Inline text={block.text} /></h2>
