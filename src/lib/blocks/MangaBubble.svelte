<!--
	Konuşma balonu. Balonlar HTML — görselin içine gömülü DEĞİL: seçilebilir,
	büyütülebilir, bir gün çevrilebilir ve üstlerine yorum düşülebilir.

	Yerleşim iki biçimde: `at: 'alt'` hazır alt konum (aynı karede ikinci ses),
	`at: {top,right,bottom,left,width}` serbest yerleşim. Serbest yerleşimde
	CSS taban kuralın `top/right` değerlerini sıfırlıyor (`.manga-bubble--free`),
	yoksa satır içi `bottom` ile birleşip balonu iki uç arasında gerer.
-->
<script lang="ts">
	import type { MangaBubble } from '$lib/content/types';

	let { bubble }: { bubble: MangaBubble } = $props();

	const free = $derived(typeof bubble.at === 'object' ? bubble.at : null);
	const style = $derived(
		free
			? (['top', 'right', 'bottom', 'left', 'width'] as const)
					.filter((side) => free[side] != null)
					.map((side) => `${side}: ${free[side]}`)
					.join('; ')
			: undefined
	);
</script>

<div
	class={[
		'manga-bubble',
		bubble.kind && `manga-bubble--${bubble.kind}`,
		bubble.at === 'alt' && 'manga-bubble--alt',
		free && 'manga-bubble--free'
	]}
	{style}
>
	{bubble.text}
</div>
