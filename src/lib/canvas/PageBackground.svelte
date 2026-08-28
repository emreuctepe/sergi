<!--
	Sayfanın arka plan katmanı. İki kaynak var (bkz. content/types.ts):

	  img:assets/…      → gerçek dosya
	  scene:sumi        → çizilmiş SVG sahne (src/lib/art/)

	`photo:` üçüncü bir kaynaktı ve 1e'de KALDIRILDI: tek kullanıcısı "Gece
	Hattı"nın çekilmemiş üç karesiydi, o sayfalar da sayıdan düştü
	(bkz. tools/tasi-icerik.mjs → DUSEN_SAYFALAR).

	Bilinmeyen bir kaynak sessizce boş geçmiyor: `scene:` adları `validate.ts`'te
	denetleniyor, `Scene.svelte` de `never` ile derleme zamanında kapıyor.

	Fotoğraflar `<picture>` içinde: kaynak webp duruyor, yanına AVIF türevleri
	`srcset` ile veriliyor. Ölçüm — 1× masaüstünde 3.634 KB → 672 KB, 2×
	telefonda 1.225 KB; AVIF bilmeyen tarayıcı `<img>`e düşüp eskisini alıyor.
-->
<!--
	⚠️ `<picture>` sarmalayıcısı `canvas.css`'teki `.page__bg > img` ÇOCUK
	seçicisini kırıyor — `<img>` artık `.page__bg`'nin doğrudan çocuğu değil.
	Kural bu dosyanın kapsamlı stiline KOPYALANDI, `canvas.css` düzeltilmedi:
	o dosya prototiple bayt bayt aynı ve 14 KB'ı tek bir satır için FORKED
	listesine taşımak, dosyanın tamamındaki güvenceyi kaybetmek olurdu
	(bkz. src/lib/styles/parity.test.ts). Üç satırlık ikizleme, bir dosyalık
	kör noktadan ucuz. `.manga-panel__art img` torun seçici olduğu için orada
	böyle bir sorun yok.
-->
<script lang="ts">
	import Scene from '$lib/art/Scene.svelte';
	import { isSceneName } from '$lib/art/scenes';
	import { assetUrl, avifSrcset, GORSEL_SIZES as SIZES } from '$lib/content/assets';
	import type { Background } from '$lib/content/types';

	/** `eager`: yalnız sayının İLK sayfası. Gerekçe aşağıda. */
	let { bg, eager = false }: { bg: Background; eager?: boolean } = $props();

	const source = $derived.by(() => {
		const at = bg.indexOf(':');
		return { kind: bg.slice(0, at), value: bg.slice(at + 1) };
	});

	const avif = $derived(source.kind === 'img' ? avifSrcset(source.value) : null);
</script>

{#if source.kind === 'img'}
	<div class="page__bg">
		<picture>
			{#if avif}<source type="image/avif" srcset={avif} sizes={SIZES} />{/if}
			<img
				class="page__bg-img"
				src={assetUrl(source.value)}
				sizes={SIZES}
				alt=""
				loading={eager ? 'eager' : 'lazy'}
				fetchpriority={eager ? 'high' : 'auto'}
				decoding="async"
			/>
		</picture>
	</div>
{:else if source.kind === 'scene' && isSceneName(source.value)}
	<div class="page__bg">
		<Scene name={source.value} />
	</div>
{/if}

<style>
	/* `<picture>` düzenden çıkıyor; kutu ağacında yalnız `<img>` kalsın. */
	picture {
		display: contents;
	}

	/* canvas.css:166 `.page__bg > img` ile aynı — yukarıdaki nota bak. */
	.page__bg-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
</style>
