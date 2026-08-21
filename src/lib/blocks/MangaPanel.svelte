<!--
	Tek bir manga karesi: görsel + üstünde yüzen balonlar.

	Kare kendi ankrajını taşır (`blokId.index`) — bir one-shot'ta yorum sayfaya
	değil KAREYE düşer; "4. karedeki bakış" demek bunun üstünde duruyor.
-->
<script lang="ts">
	import { assetUrl, avifSrcset } from '$lib/content/assets';
	import type { MangaPanel } from '$lib/content/types';
	import { subAttrs } from './attrs';
	import MangaBubble from './MangaBubble.svelte';

	let { panel, blockId, index }: { panel: MangaPanel; blockId: string; index: number } = $props();

	const avif = $derived(panel.img ? avifSrcset(panel.img) : null);

	/* Kare düzene göre sayfanın yarısı da olabiliyor tamamı da ("plan" düzeni).
	   Arka planla aynı cömert değer kullanılıyor: dar vermek bulanık kare
	   demek, geniş vermenin bedeli ise burada küçük (kaynaklar 1080px). */
	const SIZES = '(max-width: 640px) 100vw, 600px';
</script>

<figure class="manga-panel" data-panel={index} {...subAttrs(blockId, 'manga', index)}>
	<div class="manga-panel__art">
		{#if panel.img}
			<!-- `.manga-panel__art img` TORUN seçici, `<picture>` onu bozmuyor. -->
			<picture>
				{#if avif}<source type="image/avif" srcset={avif} sizes={SIZES} />{/if}
				<img
					src={assetUrl(panel.img)}
					sizes={SIZES}
					alt={panel.alt ?? ''}
					loading="lazy"
					decoding="async"
				/>
			</picture>
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
