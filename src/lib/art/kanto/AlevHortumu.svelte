<!--
	ALEV HORTUMU — 1 Eylül 1923, akşam. Sahnenin tek hareketli olanı.

	Yazıdaki karşılığı: "Yüzlerce yangının üzerine alev tornadosu denen bir tür
	hortum da başladı. Bu ana tanık olanlar bu manzaraya 'Dünyada Cehennem'
	demişlerdir."

	Kadraj dört düzleme bölünmüş (`visual_design.md` §Composition, "depth via
	3-4 overlapping value planes"): duman bantları → ufuktaki yangın parıltısı →
	şehir silueti → önde devrilmiş direk. Hortum üçüncü ve dördüncü düzlemin
	ARASINDA duruyor; şehrin önünde ama izleyicinin gerisinde.

	Sütunun geometrisi ve dört karesi `alev.ts`'te — orada neden dört kare ve
	neden rastgelelik olmadığı da yazıyor.

	⚠️ ANİMASYON SUNUCUDA ÇİZİLMİYOR. `hareket` ilk çizimde `false`; SMIL
	elemanları ancak `onMount`tan sonra DOM'a giriyor. İki sebep:

	  1. `prefers-reduced-motion` yalnız tarayıcıda sorulabiliyor. Sunucunun
	     tahmin etmesi gereken bir şey değil — güvenli varsayılan DURAN kare.
	  2. Sunucunun çizdiği ile tarayıcının hidratladığı işaretleme birebir aynı
	     olmak zorunda (bkz. rng.ts'teki aynı gerekçe). İlk çizim iki tarafta da
	     animasyonsuz; fark sonra, `$effect` ile açılıyor.

	Duran kare `kabuklar[…][0]` — yani döngünün ilk karesi. Hareket kapalıyken
	sahne eksik değil, sadece sabit.
-->
<script lang="ts">
	import { cekirdekKareleri, hortumKabuklari, korKareleri, type Kor } from './alev';
	import { ATES as A, TUVAL } from './palet';
	import Kaplama from './Kaplama.svelte';

	/** Dıştan içe beş kabuk, her biri dört kare. */
	const kabuklar = hortumKabuklari();
	const cekirdek = cekirdekKareleri();

	/** Kabukların tonları — `KABUK_CARPANLARI` ile aynı sırada. */
	const TONLAR = [A.duman2, A.kizil, A.kor, A.alev, A.alev2] as const;

	/* `korKareleri()` kare→kıvılcım veriyor, SMIL ise kıvılcım→kare istiyor:
	   her `<rect>` kendi dört konumunu tek `values` dizgisinde taşıyor. */
	const kareler = korKareleri();
	const korlar: Kor[][] = kareler[0].map((_, i) => kareler.map((k) => k[i]));

	/** SMIL `values` biçimi: kareler noktalı virgülle ayrılıyor. */
	const dizi = (v: (string | number)[]) => v.join(';');

	/**
	 * Hareket açık mı? İlk çizimde (sunucu ve hidratlama) DAİMA `false`.
	 *
	 * `matchMedia` sadece tarayıcıda var; `$effect` yalnız orada koşuyor.
	 * Dinleyici de bağlanıyor, çünkü kullanıcı ayarı sayfa açıkken değişebilir
	 * ve o an sayfayı yenilemek zorunda kalmamalı.
	 */
	let hareket = $state(false);

	$effect(() => {
		const sorgu = window.matchMedia('(prefers-reduced-motion: reduce)');
		const uygula = () => (hareket = !sorgu.matches);
		uygula();
		sorgu.addEventListener('change', uygula);
		return () => sorgu.removeEventListener('change', uygula);
	});

	/** Döngü süresi: dört kare / 1 sn = 4 fps. */
	const SURE = '1s';
</script>

<svg
	class="art"
	viewBox="0 0 {TUVAL.g} {TUVAL.y}"
	preserveAspectRatio="xMidYMid slice"
	aria-hidden="true"
	focusable="false"
>
	<rect width={TUVAL.g} height={TUVAL.y} fill={A.gece} />

	<!-- ① duman bantları: yukarı doğru koyulaşıyor, çünkü ışık AŞAĞIDA -->
	<path d="M0 0 H300 V62 L246 74 L188 58 L132 78 L74 62 L0 80 Z" fill={A.kok} />
	<path
		d="M0 80 L74 62 L132 78 L188 58 L246 74 L300 62 V128 L232 142 L166 122 L108 144 L46 126 L0 140 Z"
		fill={A.duman}
	/>
	<path d="M0 140 L46 126 L108 144 L166 122 L232 142 L300 128 V300 H0 Z" fill={A.duman2} />

	<!-- ② ufuktaki yangın: yüzlerce ayrı yangının tek bir bant hâline gelmesi -->
	<path d="M0 258 L44 268 L92 250 L146 264 L198 246 L252 262 L300 252 V300 H0 Z" fill={A.kizil} />

	<!-- ③ şehir silueti. Ahşap şehir: hepsi alçak, hiçbiri kule değil. -->
	<path
		d="M0 300 V289 H16 V277 H30 V293 H46 V270 H62 V285 H84 V274 H100 V291 H118 V281 H140
		   V266 H158 V287 H176 V275 H196 V292 H214 V279 H232 V268 H252 V288 H268 V276 H284 V290 H300 V300 Z"
		fill={A.gece}
	/>

	<!--
		④ yerdeki ışık gölü. Kenarları TESTERE: yumuşak elips kural 5'i bozar.
		İlk sürümde tuvalin altını kaplayan kahverengi bir çamur lekesiydi;
		küçültüldü — ışık gölü ayağı ele veren şey, sahnenin zemini değil.
	-->
	<path
		d="M174 300 L136 308 L114 304 L92 318 L104 330 L84 342 L114 352 L148 344 L184 352
		   L212 340 L224 346 L218 328 L234 320 L208 316 L194 304 Z"
		fill={A.kizil}
		opacity="0.42"
	/>
	<path
		d="M172 302 L146 308 L128 316 L140 324 L130 334 L158 330 L184 336 L196 326
		   L184 318 L192 310 L182 306 Z"
		fill={A.kor}
		opacity="0.38"
	/>

	<!-- ⑤ sütun: dıştan içe beş kabuk, her biri kendi dört karesinde -->
	{#each kabuklar as kareler, i (i)}
		<path d={kareler[0]} fill={TONLAR[i]}>
			{#if hareket}
				<animate
					attributeName="d"
					values={dizi(kareler)}
					dur={SURE}
					calcMode="discrete"
					repeatCount="indefinite"
				/>
			{/if}
		</path>
	{/each}

	<!-- ⑥ çekirdek: kadrajın en parlak yeri, ve en küçüğü. Yalnız dipte. -->
	<path d={cekirdek[0]} fill={A.kul} opacity="0.92">
		{#if hareket}
			<animate
				attributeName="d"
				values={dizi(cekirdek)}
				dur={SURE}
				calcMode="discrete"
				repeatCount="indefinite"
			/>
		{/if}
	</path>

	<!-- ⑦ korlar. Kare çiziliyor, çember değil — eğri yüzey yok (kural 2). -->
	<g fill={A.alev3}>
		{#each korlar as kor, i (i)}
			<rect x={kor[0].x} y={kor[0].y} width={kor[0].e} height={kor[0].e} opacity="0.8">
				{#if hareket}
					<animate
						attributeName="x"
						values={dizi(kor.map((k) => k.x))}
						dur={SURE}
						calcMode="discrete"
						repeatCount="indefinite"
					/>
					<animate
						attributeName="y"
						values={dizi(kor.map((k) => k.y))}
						dur={SURE}
						calcMode="discrete"
						repeatCount="indefinite"
					/>
				{/if}
			</rect>
		{/each}
	</g>

	<!--
		⑧ ön düzlem: devrilmiş bir direk ve bir kiriş, kadraja KIRPILARAK giriyor
		(kural 8). İkisi de neredeyse siyah — ölçek buradan okunuyor: hortum
		uzakta, izleyici bir enkazın arkasında.

		⚠️ IŞIK GÖLÜNÜN ÜSTÜNE BİNMELERİ ŞART. İlk sürümde kiriş de zemin de
		`gece`ydi ve enkaz görünmüyordu: siyah üstünde siyah. Silüetin okunması
		komşusundan farklı bir değere yaslanmak zorunda (kural 6) — burada o
		komşu, gölün kendisi.
	-->
	<g fill={A.gece}>
		<path d="M-4 322 L128 358 L120 400 L-4 400 Z" />
		<path d="M300 306 L268 314 L252 400 L300 400 Z" />
		<path d="M236 334 L172 356 L182 372 L244 350 Z" />
	</g>

	<Kaplama ton={A.gece} vinyet={0.62} gren={0.09} />
</svg>

<style>
	/* Sahne kendi gecesini taşıyor (bkz. palet.ts); tuvalin kalanı sızmasın. */
	svg {
		display: block;
		background: #0a0807;
	}
</style>
