<script lang="ts">
	import type { ParagraphBlock } from '$lib/content/types';
	import type { BlockAttrs } from './attrs';
	import Inline from './Inline.svelte';

	let { block, ...attrs }: { block: ParagraphBlock } & BlockAttrs = $props();
</script>

<!-- `drop` = ilk harf büyütülür (`::first-letter`), yazı başına bir tane. -->
<p {...attrs} class={['para', block.drop && 'para--drop', attrs.class]}>
	<Inline text={block.text} />
</p>
