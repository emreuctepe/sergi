<!--
	Sayfanın arka plan katmanı. Üç kaynak var (bkz. content/types.ts):

	  img:assets/…   → gerçek dosya. Burada çiziliyor.
	  scene:torii    → çizilmiş SVG sahne   ⟶ Faz 1e
	  photo:101      → üretilmiş "fotoğraf" ⟶ Faz 1e

	1e gelene kadar sahne/foto sayfaları kâğıt zemininde açılıyor: metin okunur,
	yalnızca resim eksik. Yerine gri bir yer tutucu koymak "burada bir hata var"
	derdi — oysa henüz sıra gelmedi.
-->
<script lang="ts">
	import { assetUrl } from '$lib/content/assets';
	import type { Background } from '$lib/content/types';

	let { bg }: { bg: Background } = $props();

	const source = $derived.by(() => {
		const at = bg.indexOf(':');
		return { kind: bg.slice(0, at), value: bg.slice(at + 1) };
	});
</script>

{#if source.kind === 'img'}
	<div class="page__bg">
		<img class="page__bg-img" src={assetUrl(source.value)} alt="" loading="lazy" decoding="async" />
	</div>
{/if}
