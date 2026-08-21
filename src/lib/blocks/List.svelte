<!--
	Üç biçim: madde, numara, sözlük.

	Her satır kendi ankrajını taşır (`blokId.index`) — sözlükte bir maddeye,
	listede bir şıkka yorum yazılabilmesinin dayanağı bu. Prototipte satırlara
	`data-sub` konur, kimlik sonradan DOM gezilerek takılırdı; burada bloğun
	kendisi kimliğini bildiği için ara adım yok.
-->
<script lang="ts">
	import type { ListBlock } from '$lib/content/types';
	import { subAttrs, type BlockAttrs } from './attrs';
	import Inline from './Inline.svelte';

	let { block, ...attrs }: { block: ListBlock } & BlockAttrs = $props();
</script>

{#if block.style === 'dict'}
	<dl {...attrs} class={['dict', attrs.class]}>
		{#each block.items as item, i (i)}
			<div class="dict__row" {...subAttrs(block.id, block.t, i)}>
				<dt>{item.term}</dt>
				<dd><Inline text={item.def} /></dd>
			</div>
		{/each}
	</dl>
{:else if block.style === 'num'}
	<ol {...attrs} class={['list', 'list--num', attrs.class]}>
		{#each block.items as item, i (i)}
			<li {...subAttrs(block.id, block.t, i)}><Inline text={item} /></li>
		{/each}
	</ol>
{:else}
	<ul {...attrs} class={['list', attrs.class]}>
		{#each block.items as item, i (i)}
			<li {...subAttrs(block.id, block.t, i)}><Inline text={item} /></li>
		{/each}
	</ul>
{/if}
