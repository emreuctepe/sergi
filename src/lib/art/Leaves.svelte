<!--
	YAPRAKLAR — tanıtımın ikinci kartı: "Ayda bir sayı."

	Sade kâğıt üstünde on yedi yaprak, seyrek ve yumuşak. Yaprağın silueti
	`leaf.ts`'ten geliyor — aynı yol kapaktaki damgayı da çiziyor, iki yerde
	yazılsa bir gün ayrışırdı. Yerleşim `leaves.ts`'te, prototiple paritesi orada.
-->
<script lang="ts">
	import { LEAF, LEAF_VEIN } from './leaf';
	import { fallenLeaves } from './leaves';

	const leaves = fallenLeaves();
</script>

<svg
	class="art"
	viewBox="0 0 300 400"
	preserveAspectRatio="xMidYMid slice"
	aria-hidden="true"
	focusable="false"
>
	<rect width="300" height="400" fill="var(--paper)" />

	<!-- sağ üstte solgun bir leke: kompozisyonun ağırlık merkezi -->
	<circle cx="248" cy="52" r="110" fill="var(--accent)" opacity="0.05" />

	{#each leaves as leaf, i (i)}
		<g
			transform="translate({leaf.x},{leaf.y}) rotate({leaf.rotate}) scale({leaf.scale})"
			opacity={leaf.opacity}
		>
			<path d={LEAF} fill={leaf.tone} />
			<path
				d={LEAF_VEIN}
				fill="none"
				stroke="var(--paper)"
				stroke-width="0.8"
				opacity="0.45"
				stroke-linecap="round"
			/>
		</g>
	{/each}
</svg>
