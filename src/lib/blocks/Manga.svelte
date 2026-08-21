<!--
	Manga sayfası: kare ızgarası + folio numarası + stüdyo filigranı.

	Okuma yönü BLOKTAN gelir. Japon one-shot'ları sağdan sola okunur ama her
	manga öyle değil — 2026-09'un "Kapalı Kapılar"ı soldan sağa kurgulanmış bir
	dikey şerit. `dir` özniteliği ızgara sütunlarının yönünü de çeviriyor.

	Prototipteki `manga--<düzen>` sınıfı taşınmadı: adı Türkçe karakterlerden
	arındırırken `3-üst-1-alt` → `manga--3st-1-alt` gibi bozuluyordu ve CSS'te
	hiçbir yerde kullanılmıyor — düzeni `[data-layout]` seçiyor.
-->
<script lang="ts">
	import type { MangaBlock } from '$lib/content/types';
	import type { BlockAttrs } from './attrs';
	import MangaMark from './MangaMark.svelte';
	import MangaPanel from './MangaPanel.svelte';

	let { block, ...attrs }: { block: MangaBlock } & BlockAttrs = $props();
</script>

<div {...attrs} class={['manga-page', attrs.class]}>
	<div class="manga" data-layout={block.layout} dir={block.dir === 'ltr' ? 'ltr' : 'rtl'}>
		{#each block.panels as panel, i (i)}
			<MangaPanel {panel} blockId={block.id} index={i} />
		{/each}
		<!-- Başlık bazı düzenlerde kompozisyonun kendi kutusu (bkz. "plan"),
		     ayrı bir açılış sayfası değil. Kare indeksleri kaymasın diye en
		     sonda: CSS `nth-child` ile kareleri yerleştiriyor. -->
		{#if block.title}<div class="manga-title">{block.title}</div>{/if}
	</div>
	<span class="manga-page__no">{block.page}</span>
	{#if block.mark}<MangaMark mark={block.mark} />{/if}
</div>
