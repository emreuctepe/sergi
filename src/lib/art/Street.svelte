<!--
	SOKAK — tanıtımın dördüncü kartı: "Nereye istersen yorum yaz."

	Dar bir sokak, iki yandan sarkan tabelalar, dipte tek bir ışık. İki
	perspektif duvarı 96 ve 204'te kesişiyor; tabelalar ve yerdeki ışık huzmesi
	aynı kaçış noktasına bakıyor.

	Tabelaların yeri `street.ts`'te tohumdan; prototiple paritesi orada.
-->
<script lang="ts">
	import { streetSigns } from './street';

	/* Degrade kimliği örnek başına benzersiz — bkz. Portrait.svelte. `$props.id()`
	   yalnız en üst düzeyde ve doğrudan bir değişkene atanabiliyor. */
	const uid = $props.id();
	const gradId = `street-${uid}`;

	const signs = streetSigns();
</script>

<svg
	class="art"
	viewBox="0 0 300 400"
	preserveAspectRatio="xMidYMid slice"
	aria-hidden="true"
	focusable="false"
>
	<defs>
		<linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stop-color="var(--ink)" stop-opacity="0.92" />
			<stop offset="0.6" stop-color="var(--accent-3)" stop-opacity="0.6" />
			<stop offset="1" stop-color="var(--accent)" stop-opacity="0.35" />
		</linearGradient>
	</defs>

	<rect width="300" height="400" fill="var(--paper-sunken)" />
	<rect width="300" height="400" fill="url(#{gradId})" />

	<!-- perspektif duvarları -->
	<path d="M0 0 L96 150 L96 400 L0 400Z" fill="var(--ink)" opacity="0.72" />
	<path d="M300 0 L204 150 L204 400 L300 400Z" fill="var(--ink)" opacity="0.72" />

	{#each signs as sign, i (i)}
		<rect
			x={sign.x}
			y={sign.y}
			width={sign.width}
			height={sign.height}
			rx="2"
			fill={sign.tone}
			opacity={sign.opacity}
		/>
	{/each}

	<!-- yerdeki ışık huzmesi ve kaynağı -->
	<path d="M96 400 L138 220 L162 220 L204 400Z" fill="var(--accent-2)" opacity="0.2" />
	<circle cx="150" cy="214" r="16" fill="var(--paper-raised)" opacity="0.55" />
</svg>
