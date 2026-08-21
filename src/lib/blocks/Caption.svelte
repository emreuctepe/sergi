<script lang="ts">
	import type { CaptionBlock } from '$lib/content/types';
	import type { BlockAttrs } from './attrs';
	import Inline from './Inline.svelte';

	let { block, ...attrs }: { block: CaptionBlock } & BlockAttrs = $props();
</script>

<p {...attrs} class={['caption', attrs.class]}><Inline text={block.text} /></p>
