<script lang="ts">
	import type { H3Block } from '$lib/content/types';
	import type { BlockAttrs } from './attrs';
	import Inline from './Inline.svelte';

	let { block, ...attrs }: { block: H3Block } & BlockAttrs = $props();
</script>

<h3 {...attrs} class={['h3', attrs.class]}><Inline text={block.text} /></h3>
