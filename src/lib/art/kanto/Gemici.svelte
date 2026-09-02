<!--
	GEMİCİ — Yokohama İç Limanı, Dongola'nın güvertesi.

	Yazıdaki karşılığı: "Deprem sırasında Yokohama İç Limanı'nda demirli bulunan
	Dongola gemisindeki Kraliyet Donanma Yedek Kuvvetleri'nden Komutan
	R. H. Griffin, deprem meydana gelirken dehşet içinde izliyordu."

	`visual_design.md` §"Mode B — Comic-Panel Cutscene": ince siyah oluklu tek
	panel, kadrajın kalanı siyah. Referanstaki iki yan yana panel burada TEK
	panele indi — 3:4 tuvalde iki dikey panel telefonda parmak eni kadar kalır
	ve ikisi de okunmaz. Kipin ayırt edici işareti panel sayısı değil, oluk +
	balon; ikisi de duruyor.

	⚠️ YÜZDE GÖZ YOK ve bu kural 4'ün kendisi. Griffin neredeyse tamamen silüet;
	yalnız ateşe DÖNÜK kenarında iki yüzey aydınlanıyor. Manzarayı anlatan şey
	adamın ifadesi değil, ufuk — o yüzden kadrajın parlak yeri yüzü değil,
	ardındaki şehir.

	⚠️ `aria-hidden` YOK, `role="img"` var. Diğer sahneler süs olduğu için
	ekran okuyucudan gizleniyor; bunun balonunda METİN taşınıyor, gizlenirse
	sayfanın söylediği bir şey kaybolur.
-->
<script lang="ts">
	import { ATES as A, TUVAL } from './palet';
	import Kaplama from './Kaplama.svelte';

	let {
		/**
		 * Balondaki satırlar.
		 *
		 * ⚠️ VARSAYILAN GRIFFIN'İN KAYITLI SÖZÜ DEĞİL. Yazının kendi anlatısının
		 * ("Yarım saat içinde tüm şehir, Dante'nin Cehennemi'nden fırlamış bir
		 * manzarayı andırıyordu") balona sığdırılmış hâli — ve balon onu
		 * konuşturuyor GİBİ görünür. Griffin gerçek bir kişi; sayfaya koyarken
		 * ya kaynaklı bir alıntıyla değiştir ya da satırları anlatıcıya bırakacak
		 * şekilde yeniden yaz. Bileşen karar vermiyor, sayfa veriyor.
		 *
		 * Satır sarma YOK: SVG `<text>` sarmıyor. Satırları sen bölüyorsun.
		 */
		soz = ['Yarım saatte şehir', "Dante'nin cehennemine", 'döndü.'],
		/** Ekran okuyucunun duyduğu. Balon metnini tekrarlamak yeterli değil. */
		etiket = 'Yanan Yokohama’yı gemi küpeştesinden izleyen bir deniz subayı.'
	}: { soz?: string[]; etiket?: string } = $props();

	/* Panel oluğu: kadrajın kenarında kalan siyah şerit. Kip bunsuz okunmuyor.
	   Alt kenar 348 — ilk sürümde 300'dü ve altında kadrajın dörtte birini
	   kaplayan ölü bir siyah alan bırakıyordu. */
	const P = { x: 16, y: 28, sag: 284, alt: 348 };

	/* Kırpma kimliği örnek başına benzersiz — diğer sahnelerdeki `$props.id()`
	   kalıbının aynısı. Sabit bir kimlik olsaydı aynı sayfadaki ikinci panel
	   birincinin kırpmasını kullanır ve boş çıkardı. `$props.id()` yalnız en üst
	   düzeyde ve doğrudan bir değişkene atanabiliyor; şablon dizgisine gömülemez. */
	const uid = $props.id();
	const kirpma = `gemici-panel-${uid}`;

	const YAZI = 10.5;
	const SATIR = 14;

	/**
	 * Balonun ölçüsü METİNDEN hesaplanıyor.
	 *
	 * ⚠️ SVG metni ÖLÇEMİYOR: `<text>` sarmıyor ve genişliğini önceden bilmenin
	 * bir yolu yok. İlk sürümde balon sabit 122 genişlikteydi ve varsayılan söz
	 * balonun sağından TAŞIYORDU — ekranda görüldü. Şimdi genişlik en uzun
	 * satırın karakter sayısından KESTİRİLİYOR, ve kestirim bilerek cömert
	 * (karakter başına 6.4, oysa çoğu harf daha dar): balonun fazla geniş olması
	 * göze batmıyor, dar olması metni kesiyor.
	 *
	 * Sağ kenar sabit (286), balon SOLA doğru büyüyor — böylece uzun bir söz
	 * balonu kadrajın dışına taşırmıyor, kuyruğa doğru yaklaştırıyor.
	 */
	const enUzun = $derived(Math.max(1, ...soz.map((s) => s.length)));
	const bg = $derived(Math.min(170, Math.max(84, enUzun * 6.4 + 22)));
	const bh = $derived(20 + soz.length * SATIR);
	const bx = $derived(286 - bg);
	const BY = 40;
</script>

<svg
	class="art"
	viewBox="0 0 {TUVAL.g} {TUVAL.y}"
	preserveAspectRatio="xMidYMid slice"
	role="img"
	aria-label={etiket}
>
	<rect width={TUVAL.g} height={TUVAL.y} fill={A.gece} />

	<!-- Panelin içi ayrı bir dünya: dışına taşan hiçbir şey yok. -->
	<clipPath id={kirpma}>
		<rect x={P.x} y={P.y} width={P.sag - P.x} height={P.alt - P.y} />
	</clipPath>

	<g clip-path="url(#{kirpma})">
		<!-- gökyüzü: üç düz bant, ufka doğru AÇILIYOR (ışık aşağıda) -->
		<rect x={P.x} y={P.y} width={P.sag - P.x} height="68" fill={A.kok} />
		<path d="M16 96 L84 88 L152 100 L216 86 L284 94 V140 H16 Z" fill={A.duman} />
		<path d="M16 140 L74 132 L138 144 L206 130 L284 138 V168 H16 Z" fill={A.duman2} />

		<!-- ufuktaki yangın bandı -->
		<path
			d="M16 152 L62 158 L108 146 L156 156 L204 144 L252 154 L284 148 V168 H16 Z"
			fill={A.kizil}
		/>

		<!-- karşı kıyı: alçak ahşap şehir, hepsi neredeyse siyah -->
		<path
			d="M16 168 V160 H36 V152 H54 V163 H74 V150 H96 V161 H120 V154 H142 V147 H164
			   V160 H186 V151 H208 V162 H230 V153 H250 V159 H268 V150 H284 V168 Z"
			fill={A.gece}
		/>

		<!-- yangın sütunları: dar üçgenler, kıyının üstünde. Üç tane, hepsi ayrı. -->
		<g fill={A.kor}>
			<path d="M148 152 L154 112 L162 152 Z" />
			<path d="M232 156 L238 132 L243 156 Z" />
			<path d="M196 150 L201 126 L207 150 Z" />
		</g>
		<g fill={A.alev2}>
			<path d="M151 150 L154 112 L158 150 Z" />
			<path d="M234 154 L238 132 L241 154 Z" />
		</g>

		<!-- deniz: üç bant. En üsttekinde yangının yansıması var. -->
		<path d="M16 168 H284 V194 H16 Z" fill={A.kizil} opacity="0.7" />
		<path d="M16 194 H284 V244 H16 Z" fill={A.duman} />
		<path d="M16 244 H284 V348 H16 Z" fill={A.kok} />

		<!-- suyun üstündeki kırık yansıma: dikdörtgenler, dalga değil -->
		<g fill={A.kor} opacity="0.45">
			<rect x="146" y="176" width="22" height="3" />
			<rect x="150" y="186" width="14" height="3" />
			<rect x="142" y="200" width="28" height="2" />
			<rect x="152" y="214" width="12" height="2" />
			<rect x="228" y="180" width="16" height="3" />
			<rect x="232" y="196" width="10" height="2" />
		</g>

		<!--
			geminin küpeştesi: bir üst tırabzan, bir alt kayıt, iki dikme.
			İlk sürümde üç dikme ve iki kayıt vardı ve kafes gibi okunuyordu —
			küpeşte değil, pencere. Az parça daha çok gemi.
		-->
		<g fill={A.gece}>
			<rect x="16" y="252" width="268" height="6" />
			<rect x="16" y="300" width="268" height="4" />
			<rect x="200" y="252" width="6" height="60" />
			<rect x="262" y="252" width="6" height="60" />
		</g>

		<!--
			GRIFFIN. Gövde kadrajı alttan kırpıyor (kural 8); baş üçte bir
			noktasında, bakışı ateşe dönük.

			⚠️ CEKET `gece` DEĞİL `kok`: ilk sürümde ceket de zemin de en koyu
			tondaydı ve adam kadrajın içinde KAYBOLUYORDU. Silüetin okunması
			(kural 6) kontur çizerek değil, komşu iki yüzeyin değerini ayırarak
			sağlanmak zorunda — kural 1 kontur bırakmıyor.
		-->
		<path d="M6 348 L16 258 L46 228 L92 216 L138 232 L160 268 L166 348 Z" fill={A.kok} />
		<!-- omuz düzlemi: ateşe dönük yan, tek basamak açık -->
		<path d="M92 216 L138 232 L160 268 L166 348 L128 348 L124 258 Z" fill={A.duman} />
		<!-- yaka: tek kama -->
		<path d="M66 216 L92 224 L120 212 L128 230 L92 242 L58 230 Z" fill={A.duman2} />

		<!-- kafatası: sekiz düz kenar, hiçbiri eğri değil -->
		<path
			d="M70 216 L64 186 L70 162 L88 152 L108 156 L118 172 L120 196 L112 214 L88 222 Z"
			fill={A.duman}
		/>
		<!--
			ateşe dönük kenar: sahnedeki TEK anahtar ışığın yüze düşen yüzeyi.

			⚠️ ÜÇ BASAMAK, ve en parlağı kıl payı. İlk sürümde en dış yüzey `kor`,
			içindeki de kocaman bir `alev2` dörtgeniydi; yüzün ortasında turuncu
			bir GAGA gibi okunuyordu. Işık yüzün kenarından girer, ortasından
			değil — parlak yüzey o yüzden kenara sıkışmak zorunda.
		-->
		<path d="M108 156 L118 172 L120 196 L112 214 L105 209 L107 178 L101 160 Z" fill={A.kizil} />
		<path d="M110 168 L118 177 L119 198 L112 208 L109 196 Z" fill={A.kor} />
		<path d="M114 181 L119 189 L118 198 L114 194 Z" fill={A.alev2} />
		<!-- kulak: tek koyu kama, kural 4'ün "bir gölge düzlemi + bir kama"sı -->
		<path d="M78 186 L86 182 L88 194 L79 197 Z" fill={A.duman2} />

		<!-- kasket: kubbe, bant, siperlik. Üç parça, üçü de düz. -->
		<path d="M60 162 L66 140 L92 131 L116 140 L122 158 L118 164 L63 166 Z" fill={A.gece} />
		<path d="M62 160 L120 157 L121 168 L63 171 Z" fill={A.kok} />
		<path d="M112 166 L134 170 L136 177 L112 174 Z" fill={A.gece} />
	</g>

	<!--
		BALON. Panelin oluğunu KIRIYOR (üstü panelin dışına taşıyor) — çizgi
		roman geleneğinde balonun panelden taşması "bu ses kadrajdan büyük"
		demek. Köşeler kırık: yumuşak bir elips kural 2'yi bozardı.
	-->
	<path
		d="M{bx + 4} {BY} L{bx + bg} {BY + 2} L{bx + bg - 2} {BY + bh - 12}
		   L{bx + bg - 18} {BY + bh} L{bx + 18} {BY + bh - 2} L{bx} {BY + bh - 16} L{bx + 3} {BY + 10} Z"
		fill={A.kul}
	/>
	<path
		d="M{bx + 22} {BY + bh - 6} L{bx - 4} {BY + bh + 28} L{bx + 46} {BY + bh - 3} Z"
		fill={A.kul}
	/>

	<text x={bx + 14} y={BY + 20} font-family="var(--font-manga)" font-size={YAZI} fill={A.gece}>
		{#each soz as satir, i (i)}
			<tspan x={bx + 14} dy={i === 0 ? 0 : SATIR}>{satir}</tspan>
		{/each}
	</text>

	<Kaplama ton={A.gece} vinyet={0.42} gren={0.075} />
</svg>

<style>
	svg {
		display: block;
		background: #0a0807;
	}
</style>
