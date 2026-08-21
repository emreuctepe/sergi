<script lang="ts">
	import type { NoteBlock } from '$lib/content/types';
	import type { BlockAttrs } from './attrs';
	import Inline from './Inline.svelte';

	let { block, ...attrs }: { block: NoteBlock } & BlockAttrs = $props();
</script>

<p {...attrs} class={['note', attrs.class]}><Inline text={block.text} /></p>
