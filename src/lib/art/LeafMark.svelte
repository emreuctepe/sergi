<!--
	Kapaktaki yaprak damgası — prototipteki `A.leafMark()`.
	Yaprak `currentColor` ile dolar (kapakta `#fbf6ee`), damarlar kâğıt rengiyle
	çizilir: koyu bir görselin üstünde bile yaprağın içi okunur kalsın diye.
-->
<script lang="ts">
	import { LEAF, LEAF_VEIN } from './leaf';
</script>

<svg class="leafmark" viewBox="-14 -15 28 30" aria-hidden="true">
	<path d={LEAF} fill="currentColor" />
	<path
		d={LEAF_VEIN}
		fill="none"
		stroke="var(--paper)"
		stroke-width="0.9"
		opacity="0.5"
		stroke-linecap="round"
	/>
</svg>
