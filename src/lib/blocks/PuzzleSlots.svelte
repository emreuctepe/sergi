<!--
	Bulmaca yuvası — kendi verisini kendi getiren iki bloktan biri.

	İçini Faz 4 dolduracak (`puzzle_runs` + gerçek istatistikler). Prototipte
	bu yuvanın `id="puzzle-slots"` diye bir kimliği vardı ve `puzzles.js` onu
	belgede arıyordu; burada yok — bir bileşen belgede tek olduğunu varsayamaz,
	içeriğini kendi getirir.
-->
<script lang="ts">
	import type { BlockAttrs } from './attrs';

	let { ...attrs }: BlockAttrs = $props();
</script>

<div {...attrs} class={['puzzle-slots', attrs.class]}>
	<p class="note">Bulmacalar yükleniyor…</p>
</div>
