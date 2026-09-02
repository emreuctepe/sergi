<!--
	TOKYO BUGÜN — yazının son paragrafının karşılığı.

	"Aradan geçen yüzyılda Tokyo şu an ne durumda peki? … 2025 yılı itibarıyla
	Tokyo'daki konutların yaklaşık %93,4'ünün yürürlükteki deprem standartlarını
	karşıladığı belirtiliyor."

	⚠️ BU SAHNE `AlevHortumu`NUN KASITLI TERSİ. Aynı kompozisyon dili — dört
	üst üste değer düzlemi, dikey bantlarla bölünmüş kadraj, kenardan kırpılan
	ön düzlem, tek vurgu — ama ters değer yapısı: orada kadrajın çoğu neredeyse
	siyahtı, burada neredeyse beyaz. İkisi sayının iki ucunda yan yana durursa
	yüz yılın farkını altyazı değil DEĞER anlatır.

	⚠️ ÇAPRAZ PERDELER SÜS DEĞİL, YAZININ ARGÜMANI. İki kulenin üstündeki X'ler
	sismik çaprazlar; %93,4'ün görsel karşılığı bu. Öndeki alçak ahşap
	çatı sırası da kalan %6,6 — 1923'te şehrin tamamı oydu. Sayıyı sayfa
	`caption` bloğu yazar; sahne yalnız neye baktığını gösterir.

	Tek sıcak nokta (`SEHIR.vurgu`) yanan tek pencere: `ATES.kor`un kardeşi ve
	sahnenin izinli TEK karşıt rengi (kural 7).
-->
<script lang="ts">
	import { SEHIR as S, TUVAL } from './palet';
	import Kaplama from './Kaplama.svelte';

	/**
	 * Bir çapraz perde kolu.
	 *
	 * ⚠️ `stroke` DEĞİL, dolgulu dörtgen. `visual_design.md` §10'un ilk sert
	 * kuralı "stroke: none everywhere" — bir çizgi çubuğu `stroke-width` ile
	 * çizmek kadrajdaki tek kontur olurdu ve sıfır-kontur kuralını tek başına
	 * bozardı. `k` çubuğun YATAY kalınlığı; eğik durduğu için görünen kalınlık
	 * bundan biraz ince çıkıyor, istenen de bu.
	 */
	const capraz = (x1: number, y1: number, x2: number, y2: number, k = 2.5) =>
		`M${x1} ${y1} L${x1 + k} ${y1} L${x2 + k} ${y2} L${x2} ${y2} Z`;

	/**
	 * Bir kulenin çapraz perdeleri — hücre başına iki kol.
	 *
	 * ⚠️ HÜCRE SAYISI ÜÇTEN BEŞE ÇIKTI, kollar da inceldi. Üç kalın X, kulenin
	 * üstünde asılı üç ELMAS gibi okunuyordu — süs. Beş ince X kat kat tekrar
	 * eden bir şey oluyor, yani yapı. Sismik çapraz bir bina boyunca sürer;
	 * üç tanesi olan şey bir desendir.
	 */
	function perde(sol: number, sag: number, ust: number, alt: number, hucre = 5) {
		const boy = (alt - ust) / hucre;
		return Array.from({ length: hucre }, (_, i) => {
			const y0 = ust + i * boy;
			const y1 = y0 + boy;
			return [capraz(sol, y0, sag, y1), capraz(sag, y0, sol, y1)];
		}).flat();
	}

	const perdeA = perde(184, 212, 196, 288);
	const perdeB = perde(63, 89, 200, 288);

	/** Uzak sıra: alçak, açık tonda, tepeleri düz. */
	const uzakSira = [
		[8, 22, 168],
		[34, 16, 182],
		[54, 26, 156],
		[84, 18, 176],
		[106, 24, 164],
		[134, 14, 186],
		[152, 28, 150],
		[184, 18, 172],
		[206, 22, 160],
		[232, 16, 180],
		[252, 26, 166],
		[282, 18, 178]
	] as const;

	const ortaSira = [
		[0, 30, 214],
		[34, 22, 232],
		[60, 34, 196],
		[98, 20, 224],
		[122, 28, 206],
		[154, 24, 236],
		[182, 36, 192],
		[222, 22, 220],
		[248, 30, 204],
		[282, 18, 228]
	] as const;

	const yakinSira = [
		[-4, 40, 268],
		[40, 30, 250],
		[74, 44, 280],
		[122, 34, 258],
		[160, 28, 286],
		[192, 46, 246],
		[242, 32, 272],
		[278, 26, 260]
	] as const;

	/** Ön düzlemdeki alçak evler: `[x, genişlik, mahya yüksekliği]`. */
	const EVLER = [
		[0, 26, 12],
		[28, 20, 9],
		[50, 30, 13],
		[84, 22, 10],
		[110, 28, 12],
		[142, 24, 9],
		[170, 32, 13],
		[206, 20, 10],
		[230, 28, 12],
		[262, 24, 9],
		[290, 26, 11]
	] as const;

	/** Evlerin oturduğu çizgi. */
	const EV_TABAN = 388;

	/** Pencereler: seyrek ve hizalı. Kalabalık bir ızgara doku olur, bina değil. */
	const pencereler = [
		[80, 292],
		[92, 292],
		[104, 292],
		[80, 306],
		[104, 306],
		[198, 258],
		[210, 258],
		[222, 258],
		[198, 272],
		[222, 272],
		[198, 286],
		[210, 286]
	] as const;
</script>

<svg
	class="art"
	viewBox="0 0 {TUVAL.g} {TUVAL.y}"
	preserveAspectRatio="xMidYMid slice"
	aria-hidden="true"
	focusable="false"
>
	<rect width={TUVAL.g} height={TUVAL.y} fill={S.gok2} />

	<!-- gökyüzü ufka doğru AÇILIYOR: gündüz sahnesi, ışık yukarıdan değil her yerden -->
	<path d="M0 118 L68 128 L140 114 L212 126 L300 112 V240 H0 Z" fill={S.gok} />

	<!-- Fuji: dört düz kenar. En uzak düzlem, o yüzden en açık kütle. -->
	<path d="M118 198 L184 148 L200 134 L217 141 L228 154 L300 198 Z" fill={S.uzak} />
	<!-- kar: tepenin ışık alan yüzeyi, ayrı bir yüzey olarak (kural 3) -->
	<path d="M192 140 L200 134 L217 141 L222 148 L208 144 L198 149 Z" fill={S.cam} />

	<!-- ① uzak sıra -->
	<g fill={S.orta}>
		{#each uzakSira as [x, g, ust] (x)}
			<rect {x} y={ust} width={g} height={230 - ust} />
		{/each}
	</g>

	<!-- ② orta sıra — çapraz perdeli iki kule burada -->
	<g fill={S.yakin}>
		{#each ortaSira as [x, g, ust] (x)}
			<rect {x} y={ust} width={g} height={290 - ust} />
		{/each}
	</g>
	<g fill={S.cam} opacity="0.55">
		{#each [...perdeA, ...perdeB] as d, i (i)}
			<path {d} />
		{/each}
	</g>

	<!-- ③ yakın sıra -->
	<g fill={S.golge}>
		{#each yakinSira as [x, g, ust] (x)}
			<rect {x} y={ust} width={g} height={360 - ust} />
		{/each}
	</g>
	<g fill={S.cam}>
		{#each pencereler as [x, y] (`${x}-${y}`)}
			<rect {x} {y} width="8" height="7" />
		{/each}
	</g>
	<!-- kadrajdaki TEK sıcak nokta -->
	<rect x="130" y="272" width="8" height="7" fill={S.vurgu} />

	<!--
		④ ön düzlem: alçak ahşap çatılar — 1923'te şehrin TAMAMI buydu.

		⚠️ İLK SÜRÜMDE MAHYALAR 40 BİRİMDİ ve kadrajın altında sıradağ gibi
		duruyorlardı — ev değil, manzara. Şimdi 13 birim: kulelerin yanında
		ne kadar küçük kaldıkları sahnenin söylediği şeyin yarısı. Arkalarındaki
		açık zemin bandı olmadan da okunmuyorlardı, çünkü üstlerindeki yakın
		sıra da koyu: iki koyu kütle kontursuz ayrışmaz (kural 1).
	-->
	<rect x="0" y="358" width={TUVAL.g} height="42" fill={S.yakin} />
	<g fill={S.koyu}>
		{#each EVLER as [x, g, y] (x)}
			<path
				d="M{x} {EV_TABAN} L{x} {EV_TABAN - y + 4} L{x + g / 2} {EV_TABAN - y} L{x + g} {EV_TABAN -
					y +
					4} L{x + g} {EV_TABAN} Z"
			/>
		{/each}
		<rect x="0" y={EV_TABAN} width={TUVAL.g} height={TUVAL.y - EV_TABAN} />
	</g>

	<!-- kadrajı dikey bölen kırpılmış kenar (kural 8) -->
	<path d="M300 0 L276 10 L280 400 L300 400 Z" fill={S.koyu} />

	<!--
		Vinyet burada KOYU değil, sahnenin kendi en koyu tonu ve zayıf: gündüz
		bir kadraja gece vinyeti koymak onu "karanlık" yapar, derin değil.
	-->
	<Kaplama ton={S.golge} vinyet={0.22} gren={0.06} />
</svg>

<style>
	svg {
		display: block;
		background: #cbd7dc;
	}
</style>
