<!--
	OCAK — 11.58.

	Yazının en somut cümlesinin karşılığı: "Deprem 11.58 yani öğle saatlerinde
	birçok kişinin ocak kullanarak öğlen yemeği yaptığı sıralarda meydana geldi."
	Yüz bin ölünün sebebi sarsıntı değil yangındı; yangının sebebi de bu
	kadrajdaki şey — devrilmiş bir ocak ve tutuşan bir kâğıt duvar.

	⚠️ SAHNEDE TEK IŞIK KAYNAĞI VAR ve o da yerde (kural 5). Duvarın kâğıt
	gözleri bu yüzden yukarı doğru KOYULAŞIYOR — ama basamak basamak, dört ayrı
	düz yüzeyde. Sürekli bir degrade kural 3'ü bozardı; ışığın azalması burada
	merdiven, rampa değil.

	Saat 11.58'i gösteriyor: akrep ve yelkovan neredeyse üst üste, aralarında
	11 derece var. Kadraja ilk bakışta "12" gibi görünür, ve bu bilinçli —
	tarihin kendi ayrıntısı bu, okunaklı olsun diye 11.30'a çevrilmedi.
-->
<script lang="ts">
	import { ATES as A, TUVAL } from './palet';
	import Kaplama from './Kaplama.svelte';

	/** Şōji dikmelerinin x'leri. Kadrajı dikey bantlara bölen şey (kural 8). */
	const DIKMELER = [0, 52, 104, 156, 208, 260] as const;

	/**
	 * Kâğıt gözlerin sıraları: `[üst, alt, ton]`.
	 *
	 * Aşağıdan yukarı koyulaşıyor — kaynak yerde. Dört basamak yeterli: beşinci
	 * bir sıra farkı gözle seçilemeyecek kadar kapatır ve degradeye benzemeye
	 * başlar, ki tam olarak kaçınılan şey odur.
	 */
	const SIRALAR = [
		[0, 60, A.gece],
		[60, 140, A.kok],
		[140, 220, A.duman],
		[220, 258, A.duman2]
	] as const;

	/** Saçılan korlar: `[x, y, kenar, ton]`. Ocağın ağzından sola doğru. */
	const KORLAR = [
		[112, 318, 3, A.alev2],
		[104, 327, 4, A.kor],
		[96, 333, 3, A.alev3],
		[88, 341, 5, A.kor],
		[78, 347, 3, A.alev2],
		[70, 353, 4, A.kizil],
		[60, 359, 3, A.kor],
		[50, 365, 5, A.kizil],
		[64, 342, 3, A.alev3],
		[84, 357, 3, A.kizil],
		[100, 349, 4, A.kor]
	] as const;
</script>

<svg
	class="art"
	viewBox="0 0 {TUVAL.g} {TUVAL.y}"
	preserveAspectRatio="xMidYMid slice"
	aria-hidden="true"
	focusable="false"
>
	<rect width={TUVAL.g} height={TUVAL.y} fill={A.gece} />

	<!-- ① şōji: kâğıt gözler, ışıktan uzaklaştıkça basamak basamak koyulaşıyor -->
	{#each SIRALAR as [ust, alt, ton] (ust)}
		<rect x="0" y={ust} width={TUVAL.g} height={alt - ust} fill={ton} />
	{/each}

	<!-- dikmeler ve kayıtlar: ince ama KONTUR DEĞİL, dolgulu dikdörtgen -->
	<g fill={A.gece}>
		{#each DIKMELER as x (x)}
			<rect {x} y="0" width="3" height="258" />
		{/each}
		<rect x="0" y="58" width={TUVAL.g} height="3" />
		<rect x="0" y="138" width={TUVAL.g} height="3" />
		<rect x="0" y="218" width={TUVAL.g} height="3" />
		<rect x="0" y="254" width={TUVAL.g} height="5" />
	</g>

	<!-- ② saat: karanlığın içinde, ikinci bakışta görülsün diye alçak kontrastta -->
	<g>
		<path
			d="M272 66 L265.6 81.6 L250 88 L234.4 81.6 L228 66 L234.4 50.4 L250 44 L265.6 50.4 Z"
			fill={A.duman}
		/>
		<g fill={A.gece}>
			<!-- yelkovan: 58. dakika → 12'den 12° geride -->
			<rect x="248.8" y="50" width="2.4" height="17" transform="rotate(-12 250 66)" />
			<!-- akrep: 11.58 → 12'ye 1° kala -->
			<rect x="248.6" y="56" width="2.8" height="11" transform="rotate(-1 250 66)" />
		</g>
	</g>

	<!-- ③ zemin -->
	<rect x="0" y="258" width={TUVAL.g} height="142" fill={A.kok} />
	<g fill={A.gece}>
		<rect x="0" y="292" width={TUVAL.g} height="2" />
		<rect x="0" y="330" width={TUVAL.g} height="2" />
		<rect x="0" y="374" width={TUVAL.g} height="2" />
	</g>

	<!--
		④ ışık gölü. Kenarları testere: kural 5 "cast shadows with straight or
		jagged polygon edges — never soft ellipses". Yumuşak bir daire burada
		sahneyi tek başına 3B render'a çevirirdi.
	-->
	<path
		d="M150 292 L96 286 L52 300 L22 322 L8 356 L30 384 L86 396 L154 388 L214 396
		   L258 372 L246 340 L206 318 L178 296 Z"
		fill={A.kizil}
		opacity="0.45"
	/>
	<path
		d="M144 296 L106 294 L70 310 L48 334 L58 360 L104 372 L156 366 L200 372 L226 352
		   L206 328 L172 304 Z"
		fill={A.kor}
		opacity="0.4"
	/>

	<!--
		⑤ devrilmiş ocak (七輪): pişmiş toprak, beş düz yüzey.

		⚠️ AĞIZ SOLDA. Alev de ORADAN çıkmak zorunda — ilk sürümde ocağın
		ortasından yükseliyordu ve ikisi birbirine bağlanmıyordu: bir kaya ve
		yanında havada duran bir alev gibi okunuyordu. Ateşin nereden çıktığı
		sahnenin tek nedensel cümlesi, kadrajda görünmesi gerek.
	-->
	<!--
		⚠️ BÜTÜN OCAK 20° DEVRİK. Dik dururken kadrajda kaya gibi okunuyordu ve
		yazının nedensel cümlesi ("ocak kullanarak öğlen yemeği yaptığı sıralarda")
		kayboluyordu: dik duran bir ocak yangın çıkarmaz. Devrilmesi tek bir
		`rotate` ile — gövdeyi eğik koordinatlarla elden yazmak aynı şeyi
		okunmaz sayılarla yapmak olurdu.
	-->
	<g transform="rotate(-20 158 320)">
		<path d="M126 344 L120 306 L134 292 L176 288 L192 300 L196 338 L170 350 Z" fill={A.duman2} />
		<path d="M126 344 L170 350 L196 338 L192 349 L164 358 L128 352 Z" fill={A.kok} />
		<!-- korun aydınlattığı üst kenar: kilin ışık alan tek yüzeyi -->
		<path
			d="M120 306 L134 292 L176 288 L192 300 L184 304 L170 296 L136 300 L126 312 Z"
			fill={A.kor}
		/>
		<!-- ağız: koyu halka, içinde kor -->
		<path d="M120 306 L134 292 L162 290 L166 306 L148 316 L126 316 Z" fill={A.kizil} />
		<path d="M129 305 L139 298 L155 297 L157 304 L146 310 L132 311 Z" fill={A.alev3} />
	</g>

	<!-- ⑥ saçılan korlar -->
	{#each KORLAR as [x, y, e, ton] (`${x}-${y}`)}
		<rect {x} {y} width={e} height={e} fill={ton} />
	{/each}

	<!--
		⑦ alev dili: devrilen ağızdan çıkıyor, kâğıt duvara UZANIYOR, henüz değmedi.
		Taban ocağın 20°'lik dönüşünden sonraki ağzın yerine göre; ocak
		döndürülürse alevin de kaydırılması gerek, ikisi ayrı koordinatta.
	-->
	<path d="M122 312 L132 270 L125 234 L140 194 L149 238 L146 276 L154 310 Z" fill={A.alev} />
	<path d="M128 308 L136 270 L131 242 L141 212 L144 250 L142 280 Z" fill={A.alev3} />
	<path d="M135 248 L141 214 L144 248 Z" fill={A.kul} />

	<!-- ⑧ ön düzlem: tavan kenarı ve yerdeki bir kiriş, ikisi de kırpılmış -->
	<g fill={A.gece}>
		<path d="M0 0 H300 V26 L212 38 L108 24 L0 40 Z" />
		<path d="M-4 400 V352 L36 372 L48 400 Z" />
	</g>

	<Kaplama ton={A.gece} vinyet={0.66} gren={0.09} />
</svg>

<style>
	svg {
		display: block;
		background: #0a0807;
	}
</style>
