<!--
	Tek bir manga karesi: görsel + üstünde yüzen balonlar.

	Kare kendi ankrajını taşır (`blokId.index`) — bir one-shot'ta yorum sayfaya
	değil KAREYE düşer; "4. karedeki bakış" demek bunun üstünde duruyor.
-->
<script lang="ts">
	import { assetUrl, avifSrcset, GORSEL_SIZES as SIZES } from '$lib/content/assets';
	import type { MangaPanel } from '$lib/content/types';
	import { cizimAttrs, subAttrs } from './attrs';
	import MangaBubble from './MangaBubble.svelte';

	let { panel, blockId, index }: { panel: MangaPanel; blockId: string; index: number } = $props();

	const avif = $derived(panel.img ? avifSrcset(panel.img) : null);

	/* Kare düzene göre sayfanın yarısı da olabiliyor tamamı da ("plan" düzeni).
	   Arka planla aynı cömert değer kullanılıyor: dar vermek bulanık kare
	   demek, geniş vermenin bedeli ise burada küçük (kaynaklar 1080px). */
</script>

<figure class="manga-panel" data-panel={index} {...subAttrs(blockId, 'manga', index)}>
	<div class="manga-panel__art">
		{#if panel.img}
			<!-- `.manga-panel__art img` TORUN seçici, `<picture>` onu bozmuyor. -->
			<picture>
				{#if avif}<source type="image/avif" srcset={avif} sizes={SIZES} />{/if}
				<!-- `cizimAttrs`: sağ tık menüsü + sürükleme kapalı. Gerekçesi ve
				     neyin ENGELLENMEDİĞİ attrs.ts'te yazıyor. -->
				<img
					src={assetUrl(panel.img)}
					sizes={SIZES}
					alt={panel.alt ?? ''}
					loading="lazy"
					decoding="async"
					{...cizimAttrs}
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

<style>
	/* Karenin kendisi seçilemez ve sürüklenemez — `cizimAttrs`in CSS tarafı,
	   gerekçesi attrs.ts'te. Stil burada çünkü `blocks.css` prototiple bayt
	   bayt eşit tutuluyor (styles/parity.test.ts) ve katmansız bileşen stili
	   zaten onu eziyor.

	   Kural yalnız GÖRSELE iniyor: balonlar (`.manga-bubble`) HTML ve
	   seçilebilir kalmalı — okurun bir repliği alıntılaması derginin
	   yorum sisteminin kendisi. */
	.manga-panel__art img {
		user-select: none;
		-webkit-user-drag: none;
		-webkit-touch-callout: none; /* iOS: uzun basınca çıkan kaydet menüsü */
	}
</style>
