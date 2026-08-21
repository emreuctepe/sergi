<!--
	Sayfanın köşesindeki stüdyo filigranı — imza ve aynı zamanda bir kapı.

	PROTOTİPTEN FARK: orada bu bir <button>'dı, dokununca "nereye gidiyorsun"
	diyen bir pop-up açıyordu. Pop-up katmanı henüz yok (Faz 3). Filigranı o
	katman gelene kadar hiçbir şey yapmayan bir düğme olarak bırakmak yerine
	doğrudan kaynağa giden bir bağ yaptık: gideceği yer `aria-label` ve `title`
	içinde zaten yazılı, yani pop-up'ın SÖYLEDİĞİ şey kayboluyor değil, sunum
	biçimi değişiyor. Pop-up geldiğinde burası tek satırda geri alınır.

	`href` yoksa filigran yalnızca imza: tıklanabilir görünmesin diye <span>.
-->
<script lang="ts">
	import ShortsIcon from '$lib/art/ShortsIcon.svelte';
	import { assetUrl } from '$lib/content/assets';
	import type { MangaMark } from '$lib/content/types';

	let { mark }: { mark: MangaMark } = $props();

	const label = $derived(mark.note ? `${mark.label} — ${mark.note}` : mark.label);
</script>

<svelte:element
	this={mark.href ? 'a' : 'span'}
	class="manga-mark"
	href={mark.href}
	target={mark.href ? '_blank' : undefined}
	rel={mark.href ? 'noopener' : undefined}
	aria-label={mark.href ? label : undefined}
	title={label}
>
	{#if mark.img}
		<img
			class="manga-mark__logo"
			src={assetUrl(mark.img)}
			alt={mark.label}
			loading="lazy"
			decoding="async"
		/>
	{:else}
		<span class="manga-mark__label">{mark.label}</span>
	{/if}
	{#if mark.href}
		<!-- Küçük rozet: filigranın yalnızca imza değil, bir kapı da olduğunu
		     tek bakışta söyleyen şey. -->
		<span class="manga-mark__badge"><ShortsIcon /></span>
	{/if}
</svelte:element>
