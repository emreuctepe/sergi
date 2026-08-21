<!--
	PORTRE — söyleşi açılışının zemini.

	Yüz hatları YOK, sadece kontur. Söyleşi sayfasının arkasında duran şey bir
	kişinin resmi değil, "burada biri konuşuyor" işareti: gerçek bir insanın
	yüzünü uydurmak, olmayan bir fotoğrafı varmış gibi sunmak olurdu.

	Prototipteki `scenes.portrait` bir `flip` seçeneği alıyordu; taşınmadı, çünkü
	`bg` bir dizgi (`scene:portrait`) ve seçenek geçirecek yeri yok. Gerekirse
	sahne adı olarak döner (`portrait-flip`), gizli bir parametre olarak değil.
-->
<script lang="ts">
	/* Degrade kimliği örnek başına benzersiz. Prototipte sabit "pg"ydi ve aynı
	   sahne bir sayfada iki kez çizilseydi ikinci `url(#pg)` birincinin
	   degradesini gösterirdi — id'ler belgede tekil olmak zorunda. */
	const uid = $props.id();
	const gradId = `portrait-${uid}`;
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
			<stop offset="0" stop-color="var(--accent-soft)" />
			<stop offset="1" stop-color="var(--paper-sunken)" />
		</linearGradient>
	</defs>

	<rect width="300" height="400" fill="url(#{gradId})" />

	<!-- portrenin arkasındaki baskı lekesi ve zemin çizgisi -->
	<circle cx="164" cy="150" r="96" fill="var(--accent)" opacity="0.2" />
	<path d="M0 250 h300 v6 H0Z" fill="var(--ink)" opacity="0.12" />

	<!-- profil silueti -->
	<path
		d="M96 400 q-4 -78 26 -108 q-22 -20 -22 -58 q0 -66 54 -66 q52 0 52 62 q0 20 -6 34 q10 4 14 16 q6 18 -8 24 q4 26 -6 40 q28 26 32 56 Z"
		fill="var(--ink)"
		opacity="0.92"
	/>

	<!-- omuz / yaka -->
	<path
		d="M60 400 q10 -68 60 -84 l16 30 l18 -28 q54 14 66 82 Z"
		fill="var(--accent-3)"
		opacity="0.9"
	/>
	<path d="M136 316 l14 26 l14 -26 l-14 -8Z" fill="var(--paper-raised)" opacity="0.85" />

	<!-- ışık kenarı -->
	<path
		d="M100 234 q-24 34 -22 96"
		fill="none"
		stroke="var(--accent-2)"
		stroke-width="3"
		opacity="0.5"
	/>
</svg>
