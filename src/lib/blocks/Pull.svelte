<script lang="ts">
	import type { PullBlock } from '$lib/content/types';
	import type { BlockAttrs } from './attrs';
	import Inline from './Inline.svelte';

	let { block, ...attrs }: { block: PullBlock } & BlockAttrs = $props();
</script>

<aside {...attrs} class={['pull', block.big && 'pull--big', attrs.class]}>
	<Inline text={block.text} />
</aside>
