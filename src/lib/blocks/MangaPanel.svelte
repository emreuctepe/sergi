<!--
	Tek bir manga karesi: görsel + üstünde yüzen balonlar.

	Kare kendi ankrajını taşır (`blokId.index`) — bir one-shot'ta yorum sayfaya
	değil KAREYE düşer; "4. karedeki bakış" demek bunun üstünde duruyor.
-->
<script lang="ts">
	import { assetUrl } from '$lib/content/assets';
	import type { MangaPanel } from '$lib/content/types';
	import { subAttrs } from './attrs';
	import MangaBubble from './MangaBubble.svelte';

	let { panel, blockId, index }: { panel: MangaPanel; blockId: string; index: number } = $props();
</script>

<figure class="manga-panel" data-panel={index} {...subAttrs(blockId, 'manga', index)}>
	<div class="manga-panel__art">
		{#if panel.img}
			<img src={assetUrl(panel.img)} alt={panel.alt ?? ''} loading="lazy" decoding="async" />
		{/if}
		<!--
			`panel.art` (çizilmiş sahne) burada BOŞ kalıyor: sahneler Faz 1e'nin işi
			ve 2026-09'un yedi karesinin hepsi gerçek dosya. Tek çağrı yeri burası —
			1e geldiğinde bu yorumun yerine `<Scene name={…} />` gelir.
		-->
	</div>
	{#each panel.text ?? [] as bubble, i (i)}
		<MangaBubble {bubble} />
	{/each}
</figure>
