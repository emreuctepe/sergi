<!--
	SUMI — mürekkep. Ensō (円相) ve yanında bir mühür.

	Halka BİLEREK kapanmıyor: ensō'nun anlamı tam da orada. Fırça baskısı sabit
	olmadığı için tek kalın daire yerine üç yay üst üste — girişte ince, ortada
	dolgun, çıkışta incelerek bitiyor. Çevre ≈ 528; çizilen 0→452, kalanı boşluk.
	Üstündeki kâğıt renkli kesikler *kasure*, kuru fırçanın bıraktığı iz.

	Sıçramaların ve imgelerin yeri `sumi.ts`'te tohumdan hesaplanıyor; gerekçe
	ve prototiple paritesi orada.
-->
<script lang="ts">
	import { sealCuts, sumiInk } from './sumi';

	/* Doku ve yıkama kimlikleri örnek başına benzersiz — bkz. Portrait.svelte. */
	const uid = $props.id();
	const tooth = `sumi-tooth-${uid}`;
	const wash = `sumi-wash-${uid}`;

	const { glyphs, splatter } = sumiInk();
	const cuts = sealCuts(240, 206, 28);

	/* Mühür ölçüleri tek yerde — kesikler de aynı kareye göre hesaplandı. */
	const seal = { x: 240, y: 206, size: 28 };
</script>

<svg
	class="art"
	viewBox="0 0 300 400"
	preserveAspectRatio="xMidYMid slice"
	aria-hidden="true"
	focusable="false"
>
	<defs>
		<!-- kâğıdın dokusu: 35° eğik ince tarama, baskı hissi verir -->
		<pattern
			id={tooth}
			width="4"
			height="4"
			patternUnits="userSpaceOnUse"
			patternTransform="rotate(35)"
		>
			<line x1="0" y1="0" x2="0" y2="4" stroke="var(--ink)" stroke-width="1" opacity="0.05" />
		</pattern>
		<linearGradient id={wash} x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stop-color="var(--ink)" stop-opacity="0" />
			<stop offset="1" stop-color="var(--ink)" stop-opacity="0.13" />
		</linearGradient>
	</defs>

	<rect width="300" height="400" fill="var(--paper)" />
	<rect width="300" height="400" fill="url(#{tooth})" />
	<rect y="300" width="300" height="100" fill="url(#{wash})" />

	<!-- ensō -->
	<g fill="none" transform="rotate(-34 150 176)">
		<circle
			cx="150"
			cy="176"
			r="84"
			stroke="var(--ink)"
			stroke-width="10"
			stroke-linecap="round"
			stroke-dasharray="164 364"
			opacity="0.88"
		/>
		<circle
			cx="150"
			cy="176"
			r="84"
			stroke="var(--ink)"
			stroke-width="18"
			stroke-linecap="round"
			stroke-dasharray="196 332"
			stroke-dashoffset="-142"
			opacity="0.88"
		/>
		<circle
			cx="150"
			cy="176"
			r="84"
			stroke="var(--ink)"
			stroke-width="11"
			stroke-linecap="round"
			stroke-dasharray="128 400"
			stroke-dashoffset="-324"
			opacity="0.88"
		/>
		<circle
			cx="150"
			cy="176"
			r="89"
			stroke="var(--ink)"
			stroke-width="4"
			stroke-linecap="round"
			stroke-dasharray="120 408"
			stroke-dashoffset="-150"
			opacity="0.24"
		/>

		<!-- kasure — kuru fırça izi -->
		<circle
			cx="150"
			cy="176"
			r="87"
			stroke="var(--paper)"
			stroke-width="1.7"
			stroke-dasharray="7 15"
			stroke-dashoffset="-320"
			opacity="0.5"
		/>
		<circle
			cx="150"
			cy="176"
			r="81"
			stroke="var(--paper)"
			stroke-width="1.2"
			stroke-dasharray="5 21"
			stroke-dashoffset="-352"
			opacity="0.42"
		/>
	</g>

	<!-- mürekkep sıçraması -->
	<g fill="var(--ink)">
		{#each splatter as dot, i (i)}
			<circle cx={dot.cx} cy={dot.cy} r={dot.r} opacity={dot.opacity} />
		{/each}
	</g>

	<!-- sağ kenarda soyut "yazı" — okunmuyor, doku sayılsın diye -->
	<g stroke="var(--ink)" stroke-width="2.4" stroke-linecap="round" opacity="0.62">
		{#each glyphs as s, i (i)}
			<line x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} />
		{/each}
	</g>

	<!-- hanko -->
	<g opacity="0.8">
		<rect
			x={seal.x}
			y={seal.y}
			width={seal.size}
			height={seal.size}
			rx={seal.size * 0.12}
			fill="var(--accent)"
		/>
		<g stroke="var(--paper)" stroke-width={seal.size * 0.08} stroke-linecap="square" opacity="0.9">
			{#each cuts as c, i (i)}
				<line x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2} />
			{/each}
		</g>
	</g>
</svg>
