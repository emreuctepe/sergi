<script lang="ts">
	import type { LeadBlock } from '$lib/content/types';
	import type { BlockAttrs } from './attrs';
	import Inline from './Inline.svelte';

	let { block, ...attrs }: { block: LeadBlock } & BlockAttrs = $props();
</script>

<p {...attrs} class={['lead', attrs.class]}><Inline text={block.text} /></p>
