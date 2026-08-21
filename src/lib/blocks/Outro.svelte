<!--
	Sayı sonu — sonraki sayı kartı, bulmaca özeti, paylaşım.

	Şimdilik boş bir kabuk: içeriğinin çoğu okurun kendi verisinden geliyor
	(hangi bulmacayı çözdü, kaç sayfa okudu) ve o veri Faz 2–5'te geliyor.
	Uydurmasını basmak, tohum yorumları elemekle aynı gerekçeyle yanlış olurdu.
-->
<script lang="ts">
	import type { BlockAttrs } from './attrs';

	let { ...attrs }: BlockAttrs = $props();
</script>

<div {...attrs} class={['outro', attrs.class]}>
	<p class="note">…</p>
</div>
