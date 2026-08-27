<!--
	TORİİ — tanıtımın son kartı: "Hazırsan başlayalım."

	Batan güneşin önünde bir kapı. Son kartın altında durması tesadüf değil:
	torii bir eşik işaretidir, ardındaki yere girilir. Okurun bir sonraki
	hareketi de tam olarak bu — sayıyı açmak.

	Rastgelelik yok, hepsi elle konmuş koordinat; bu yüzden ayrı bir geometri
	dosyası da yok (bkz. Portrait.svelte, aynı gerekçe).
-->
<script lang="ts">
	/* Degrade ve doku kimlikleri örnek başına benzersiz — bkz. Portrait.svelte. */
	const uid = $props.id();
	const sky = `torii-sky-${uid}`;
	const hill = `torii-hill-${uid}`;
	const tooth = `torii-tooth-${uid}`;
</script>

<svg
	class="art"
	viewBox="0 0 300 400"
	preserveAspectRatio="xMidYMid slice"
	aria-hidden="true"
	focusable="false"
>
	<defs>
		<linearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stop-color="var(--accent-2)" stop-opacity="0.35" />
			<stop offset="0.55" stop-color="var(--accent)" stop-opacity="0.5" />
			<stop offset="1" stop-color="var(--accent)" stop-opacity="0.85" />
		</linearGradient>
		<linearGradient id={hill} x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stop-color="var(--accent-3)" stop-opacity="0.85" />
			<stop offset="1" stop-color="var(--accent-3)" stop-opacity="1" />
		</linearGradient>
		<!-- 35° eğik ince tarama: hem güneşin hem sahnenin üstünde, baskı hissi -->
		<pattern
			id={tooth}
			width="4"
			height="4"
			patternUnits="userSpaceOnUse"
			patternTransform="rotate(35)"
		>
			<line x1="0" y1="0" x2="0" y2="4" stroke="var(--ink)" stroke-width="1" opacity="0.06" />
		</pattern>
	</defs>

	<rect width="300" height="400" fill="var(--paper-sunken)" />
	<rect width="300" height="400" fill="url(#{sky})" />

	<!-- güneş -->
	<circle cx="150" cy="196" r="62" fill="var(--paper-raised)" opacity="0.92" />
	<circle cx="150" cy="196" r="62" fill="url(#{tooth})" />

	<!-- uzak dağlar, arkadan öne -->
	<path
		d="M0 250 L52 196 L96 238 L140 188 L196 246 L242 206 L300 258 L300 400 L0 400Z"
		fill="var(--ink)"
		opacity="0.14"
	/>
	<path
		d="M0 288 L60 250 L118 286 L172 246 L232 292 L300 262 L300 400 L0 400Z"
		fill="url(#{hill})"
		opacity="0.55"
	/>

	<!-- kapının kendisi: kasa, bağ kirişi, iki ayak, tabela levhası -->
	<g fill="var(--accent)" opacity="0.96">
		<path d="M62 168 h176 l-8 15 H70Z" />
		<rect x="72" y="190" width="156" height="11" rx="2" />
		<rect x="92" y="183" width="15" height="180" rx="3" />
		<rect x="193" y="183" width="15" height="180" rx="3" />
		<rect x="140" y="201" width="20" height="26" rx="2" />
	</g>

	<rect y="352" width="300" height="48" fill="var(--ink)" opacity="0.2" />
	<rect width="300" height="400" fill="url(#{tooth})" />
</svg>
