<!--
	DALGALAR — tanıtımın üçüncü kartı: "Üç okuma derinliği."

	Seigaiha (青海波): iç içe yaylardan kurulu klasik desen. Izgara `waves.ts`'te
	hesaplanıyor; burada yalnız çiziliyor.

	Desen tuvalin dışına TAŞIYOR ve öyle kalması gerekiyor — kenarında biten bir
	desen "sığdırılmış" görünür, kesilen bir desen sonsuz.
-->
<script lang="ts">
	import { RING_RADII, seigaiha } from './waves';

	const rings = seigaiha();
</script>

<svg
	class="art"
	viewBox="0 0 300 400"
	preserveAspectRatio="xMidYMid slice"
	aria-hidden="true"
	focusable="false"
>
	<rect width="300" height="400" fill="var(--paper-sunken)" />

	{#each rings as ring, i (i)}
		<g opacity={ring.opacity} fill="none" stroke="var(--accent)" stroke-width="2">
			{#each RING_RADII as r (r)}
				<circle cx={ring.cx} cy={ring.cy} {r} />
			{/each}
		</g>
	{/each}
</svg>
