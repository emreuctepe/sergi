<!--
	Rakam üçlüsü. Alt blok kimliği YOK: prototipte de tek tek yorumlanabilir
	değildi ve şerit görsel olarak tek bir şey — üç ayrı ankraj, üç ayrı yorum
	baloncuğu demek olurdu.
-->
<script lang="ts">
	import type { StatBlock } from '$lib/content/types';
	import type { BlockAttrs } from './attrs';

	let { block, ...attrs }: { block: StatBlock } & BlockAttrs = $props();
</script>

<div {...attrs} class={['stats', attrs.class]}>
	{#each block.items as item, i (i)}
		<div class="stat">
			<span class="stat__v">{item.v}</span>
			<span class="stat__k">{item.k}</span>
		</div>
	{/each}
</div>
