<!--
	TSUNAMİ — "Yaklaşık on metre yüksekliğinde olduğu söylenilen Tsunami
	dalgalarında yüzlerce insanın öldüğü söylenmektedir."

	⚠️ SAHNENİN ANLATTIĞI ŞEY ÖLÇEK, DALGA DEĞİL. "On metre" bir sayı olarak
	okunduğunda hiçbir şey ifade etmiyor; kadrajın altındaki çatı sırası onu
	ifade ediyor. Bu yüzden kasaba en ÖN düzlemde ve en koyu tonda: dalgaya
	bakan göz onu ikinci anda fark ediyor, ve fark ettiği an ölçeği anlıyor.

	Soğuk aile, tek sıcak vurgu (`SU.vurgu`) — ufukta yanan kıyı. İki felaket
	aynı kadrajda ama aynı düzlemde değil: yangın ARKADA, deniz önde. Deprem
	yangını çıkardı, deniz sonra geldi.

	⚠️ İLK SÜRÜM DEV BİR KEMER ÇİZİYORDU ve ekranda görülüp atıldı. Sebebi
	yöntemdi: dalganın ön kenarını alıp hem sağa hem aşağı kaydırarak "şerit"
	üretiyordum, ama kaydırılan kenar hem tepede hem dipte kenarın kendisiyle
	buluşuyor ve kapalı bir kemer oluşturuyordu. Kasaba da o kemerin arkasında
	tamamen kayboluyordu — yani sahnenin ANLATTIĞI ŞEY görünmüyordu.

	Şimdiki yöntem daha aptal ve tam da bu yüzden doğru: kenar yalnız DİKEY
	kaydırılıyor. Dikey kaydırma kenarı asla kendisiyle kesiştiremez, o yüzden
	bantlar dalganın yüzünde yatay dilimler olarak kalıyor. Kemer imkânsız.
-->
<script lang="ts">
	import { SU as S, TUVAL } from './palet';
	import Kaplama from './Kaplama.svelte';

	/**
	 * Dalganın tepe çizgisi: sağ üstten sol alta.
	 *
	 * Eğri değil, kırık. (188,66) ve (96,142) noktaları çizgiyi geri kırıyor —
	 * dalganın devrilmek üzere olan dudağı o iki kırıkta okunuyor. Onlarsız
	 * çizgi düz bir yokuş olurdu, tehdit değil.
	 */
	const TEPE: readonly [number, number][] = [
		[300, 34],
		[256, 50],
		[216, 74],
		[188, 66],
		[150, 112],
		[118, 150],
		[96, 142],
		[68, 202],
		[44, 258],
		[30, 322],
		[18, 400]
	];

	/** Tepe çizgisinin `d` alt katarı, `dy` kadar aşağı kaydırılmış hâliyle. */
	const cizgi = (dy: number, ters = false) =>
		(ters ? [...TEPE].reverse() : TEPE).map(([x, y]) => `${x},${y + dy}`).join('L');

	/** Dalganın bütün kütlesi: tepe çizgisi + sağ alt köşe. */
	const kutle = `M${cizgi(0)}L300,400Z`;

	/** Yüzdeki yatay dilim. Yalnız DİKEY kayma — kemer bu yüzden imkânsız. */
	const dilim = (ust: number, alt: number) => `M${cizgi(ust)}L${cizgi(alt, true)}Z`;

	/**
	 * Ön düzlemdeki kasaba: `[x, genişlik, mahya yüksekliği]`.
	 *
	 * En yüksek mahya 15 birim, dalga 366. Oran gerçekçi değil (on metrelik
	 * dalga beş metrelik evin iki katıdır, yirmi beş katı değil) ve olması da
	 * gerekmiyor: sahne bir kesit değil, bir izlenim. Gerçek oran kadrajda
	 * "büyük bir dalga" verirdi; istenen "üstüne kapanan bir duvar".
	 */
	const CATILAR = [
		[0, 30, 19],
		[32, 24, 13],
		[58, 34, 21],
		[94, 22, 14],
		[118, 30, 18],
		[150, 26, 12],
		[178, 36, 20],
		[216, 22, 13],
		[240, 32, 19],
		[274, 28, 14]
	] as const;

	/** Çatı tabanı — kasabanın oturduğu çizgi. */
	const TABAN = 372;
	/** Kıyı şeridi: kasabanın üstünde durduğu düzlem, dalganın önünde. */
	const KIYI = 344;
</script>

<svg
	class="art"
	viewBox="0 0 {TUVAL.g} {TUVAL.y}"
	preserveAspectRatio="xMidYMid slice"
	aria-hidden="true"
	focusable="false"
>
	<rect width={TUVAL.g} height={TUVAL.y} fill={S.gece} />

	<!-- ① gökyüzü: iki düz bant. Dalganın solunda kalan üçgende görünüyor. -->
	<path d="M0 118 L52 128 L112 112 L176 126 L300 114 V400 H0 Z" fill={S.derin} />

	<!-- ② ufuktaki yanan kıyı: kadrajın izinli TEK sıcak rengi -->
	<rect x="0" y="196" width="180" height="20" fill={S.vurgu} />
	<path
		d="M0 216 V206 H12 V198 H28 V210 H44 V200 H62 V212 H80 V202 H100 V214 H118 V216 Z"
		fill={S.gece}
	/>
	<rect x="0" y="216" width="180" height="184" fill={S.derin} />

	<!--
		③ dalga: kütle, sonra yüzünde üç yatay dilim (üstte açık, altta koyu).

		⚠️ KÜTLE `gece` DEĞİL `derin`. İlk denemede en koyu tondaydı ve kadrajın
		alt yarısı siyah bir boşluğa dönüyordu; daha kötüsü, önündeki kasaba da
		`gece` olduğu için TAMAMEN kayboluyordu — yani sahnenin anlattığı şey
		(ölçek) görünmüyordu. Kütle bir basamak açılınca `gece` yeniden kullanıma
		girdi ve kadrajın en koyu tonu ait olduğu yere, en öndeki çatılara gitti.
	-->
	<path d={kutle} fill={S.derin} />
	<path d={dilim(0, 150)} fill={S.su} />
	<path d={dilim(0, 70)} fill={S.su2} />
	<path d={dilim(0, 26)} fill={S.su3} />

	<!-- ④ köpük: tepe boyunca üçgenler. Kenarları düz, tepeleri sivri. -->
	<g fill={S.kopuk}>
		<path d="M256 50 L264 26 L278 46 Z" />
		<path d="M216 74 L222 48 L238 68 Z" />
		<path d="M188 66 L192 42 L206 62 Z" />
		<path d="M150 112 L152 84 L170 98 Z" />
		<path d="M118 150 L116 124 L136 132 Z" />
		<path d="M96 142 L92 118 L112 128 Z" />
		<path d="M68 202 L62 178 L84 184 Z" />
	</g>
	<g fill={S.kopuk2}>
		<path d="M259 40 L264 26 L270 42 Z" />
		<path d="M219 62 L222 48 L230 64 Z" />
		<path d="M190 55 L192 42 L199 57 Z" />
		<path d="M151 99 L152 84 L161 96 Z" />
		<path d="M117 137 L116 124 L126 130 Z" />
		<path d="M94 131 L92 118 L103 125 Z" />
		<!--
			serpinti: tepenin ÜSTÜNDE ama YAKININDA kopmuş kareler. İlk denemede
			gökyüzüne dağılmışlardı ve yıldız gibi okunuyorlardı — kopan su
			köpüğün birkaç birim üstünde durur, kadrajın öbür ucunda değil.
		-->
		<rect x="272" y="20" width="3" height="3" />
		<rect x="240" y="30" width="4" height="4" />
		<rect x="206" y="48" width="3" height="3" />
		<rect x="176" y="40" width="3" height="3" />
		<rect x="146" y="76" width="4" height="4" />
		<rect x="112" y="106" width="3" height="3" />
		<rect x="88" y="108" width="3" height="3" />
		<rect x="62" y="164" width="3" height="3" />
	</g>

	<!--
		⑤ kıyı ve kasaba. Kadrajın EN KOYU tonu çatılarda — kontur çizmek
		(kural 1) seçenek olmadığı için iki koyu kütlenin ayrışması ancak
		değerle olur, ve arkalarındaki açık kıyı şeridi o değeri veriyor.

		Kıyı şeridi aynı zamanda dalganın NEDEN dalga olduğunu söylüyor: onsuz
		kadraj yalnız eğik bantlardan oluşan bir yamaçtı. Su bir yüzeyin
		üstünden gelir; o yüzey görünmezse gelen şey de su gibi durmuyor.
	-->
	<rect x="0" y={KIYI} width={TUVAL.g} height={TUVAL.y - KIYI} fill={S.su} />
	<g fill={S.gece}>
		{#each CATILAR as [x, g, y] (x)}
			<path
				d="M{x} {TABAN} L{x} {TABAN - y + 4} L{x + g / 2} {TABAN - y} L{x + g} {TABAN - y + 4} L{x +
					g} {TABAN} Z"
			/>
		{/each}
		<rect x="0" y={TABAN} width={TUVAL.g} height={TUVAL.y - TABAN} />
	</g>

	<Kaplama ton={S.gece} vinyet={0.5} gren={0.08} />
</svg>

<style>
	svg {
		display: block;
		background: #0a0d10;
	}
</style>
