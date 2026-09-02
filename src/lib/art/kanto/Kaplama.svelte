<!--
	KAPLAMA — her Kantō sahnesinin en üstündeki iki katman: vinyet + gren.

	`visual_design.md` §"Core style DNA" 3 düz yüzeylerin İÇİNDE degradeyi
	yasaklıyor ama 9. kural sahne GENELİNDE ince bir grenle vinyet istiyor.
	İkisi çelişmiyor: yasak olan formun kendi içinde yumuşak geçiş, serbest
	olan formların hepsinin üstünden geçen tek bir tabaka. Bu dosya o
	tabakanın tamamı — degrade ve `feTurbulence` yalnız burada geçiyor, altı
	sahnenin hiçbirinde geçmiyor.

	Ayrı bir bileşen olmasının sebebi tekrar: aynı otuz satır altı dosyaya
	kopyalansaydı grenin şiddetini değiştirmek altı yerde düzenleme olurdu ve
	beşinci dosyada unutulurdu.

	⚠️ `<defs>` ve `<rect>` doğrudan çağıran `<svg>`nin içine düşüyor — bu
	bileşen kendi `<svg>` kabuğunu AÇMIYOR. Bir sahnenin en SON çocuğu olarak
	çağrılmalı, yoksa üstüne çizilen her şey grenin dışında kalır.
-->
<script lang="ts">
	import { TUVAL } from './palet';

	let {
		/** Vinyetin kenardaki koyuluğu. Gündüz sahnelerinde düşürülür. */
		vinyet = 0.55,
		/** Grenin görünürlüğü. 0.05 altında kaybolur, 0.14 üstünde doku olur. */
		gren = 0.085,
		/** Vinyetin rengi — sahnenin kendi en koyu tonu verilir, saf siyah değil. */
		ton = '#000000'
	}: { vinyet?: number; gren?: number; ton?: string } = $props();

	/* Kimlikler örnek başına benzersiz: aynı sayfada iki sahne varsa ikincinin
	   `url(#…)` çağrısı birincinin filtresini gösterirdi. Diğer sahnelerdeki
	   `$props.id()` kalıbının aynısı. */
	const uid = $props.id();
	const vig = `kanto-vig-${uid}`;
	const dok = `kanto-grain-${uid}`;
</script>

<defs>
	<radialGradient id={vig} cx="0.5" cy="0.46" r="0.78">
		<stop offset="0.45" stop-color={ton} stop-opacity="0" />
		<stop offset="1" stop-color={ton} stop-opacity={vinyet} />
	</radialGradient>

	<!--
		Grenin `baseFrequency`i yüksek (1.5) ve `numOctaves` düşük (1): istenen
		şey film greni, bulut değil. Düşük frekans yumuşak lekeler üretir ve
		sahneyi kirli gösterir; bir oktav tek boyda tanecik bırakır.

		⚠️ `saturate 0` YETMİYOR, ve bu gözle görüldü. `feTurbulence` yalnız RGB'yi
		değil ALFA kanalını da gürültüyle dolduruyor; doygunluğu almak rengi
		griye çeviriyor ama saydamlığı rastgele bırakıyor. Sonuç film greni değil,
		sahnenin üstüne serpilmiş yüzlerce KONFETİ oluyordu — ilk denemede altı
		sahnenin hepsinde açık renkli noktacıklar vardı.

		Aşağıdaki matris onun yerine rengi tamamen siyaha sabitliyor (ilk üç satır
		sıfır) ve alfayı gürültünün PARLAKLIĞINDAN türetiyor. `-0.12` kaydırması
		alfanın alt ucunu kesiyor: onsuz her piksel az çok kararıyor ve gren doku
		değil is olurdu.

		`color-interpolation-filters="sRGB"`: varsayılan linearRGB, aynı matrisi
		belirgin biçimde daha koyu gösteriyor. Şiddet burada ayarlanıyorsa
		hangi uzayda ölçüldüğü yazılı olmalı.
	-->
	<filter
		id={dok}
		x="0"
		y="0"
		width="100%"
		height="100%"
		filterUnits="objectBoundingBox"
		color-interpolation-filters="sRGB"
	>
		<feTurbulence type="fractalNoise" baseFrequency="1.5" numOctaves="1" seed="1923" />
		<feColorMatrix
			type="matrix"
			values="0 0 0 0 0
			        0 0 0 0 0
			        0 0 0 0 0
			        0.34 0.34 0.32 0 -0.12"
		/>
	</filter>
</defs>

<rect width={TUVAL.g} height={TUVAL.y} fill="url(#{vig})" />
<rect width={TUVAL.g} height={TUVAL.y} filter="url(#{dok})" opacity={gren} />
