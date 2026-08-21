<!--
	Sayfanın arka plan katmanı. İki kaynak var (bkz. content/types.ts):

	  img:assets/…      → gerçek dosya
	  scene:sumi        → çizilmiş SVG sahne (src/lib/art/)

	`photo:` üçüncü bir kaynaktı ve 1e'de KALDIRILDI: tek kullanıcısı "Gece
	Hattı"nın çekilmemiş üç karesiydi, o sayfalar da sayıdan düştü
	(bkz. tools/tasi-icerik.mjs → DUSEN_SAYFALAR).

	Bilinmeyen bir kaynak sessizce boş geçmiyor: `scene:` adları `validate.ts`'te
	denetleniyor, `Scene.svelte` de `never` ile derleme zamanında kapıyor.
-->
<script lang="ts">
	import Scene from '$lib/art/Scene.svelte';
	import { isSceneName } from '$lib/art/scenes';
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
{:else if source.kind === 'scene' && isSceneName(source.value)}
	<div class="page__bg">
		<Scene name={source.value} />
	</div>
{/if}
