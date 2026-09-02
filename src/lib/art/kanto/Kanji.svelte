<!--
	KANJİ — felaketten sonraki günler. Yazının ahlaki merkezi.

	"Sokakta rastgele insanlara zorla kanji okumalarını isteyip okuyamayanların
	Japon olmadığına kanaat getirdiler."

	⚠️ BU SAHNE A KİPİNDE (sinematik gece) DEĞİL, C KİPİNDE (düotone) — ve bu
	konunun kendisiyle ilgili bir karar. A kipinin gerçekçiliği burada yanlış
	olurdu: altı ila sekiz bin insanın öldürüldüğü günleri "atmosferik" bir gece
	sahnesi yapmak olayı yeniden canlandırmak olur. Düotone canlandırmaz, İŞARET
	EDER — tek rengin düz tonları, nötr gölge yok, derinlik yok. Afiş dili.

	⚠️ ŞİDDET ÇİZİLMİYOR. Kadrajda ne silah var ne darp. Olan tek şey bir el, bir
	kâğıt ve etrafını saran yüzsüz bir kütle. Ağırlık kompozisyonda: kadrajın
	tek aydınlık yeri sorgulanan kişinin elindeki kâğıt, geri kalan her şey onu
	kapatıyor.

	⚠️ KAĞITTAKİ İBARE. Varsayılan `十五円五十銭` (jūgo-en gojissen) — kaynaklarda
	1923'te sokak kontrollerinde okutulan ibarelerden biri olarak geçiyor.
	SAYININ KENDİ METNİ bunu söylemiyor; yazıda yalnız "kanji okutma" var. Sayfa
	bu ibareyi kadrajda gösterecekse kendi kaynağını da göstermeli, yoksa `ibare`
	alanını boş geçip kâğıdı boş bırakmak daha dürüst.

	Yazı `var(--font-ja)` ile — tokens.css'te bilerek MINCHO. Font yüklenmezse
	kanji yine çıkar ama gothic çıkar; sessiz ama zararsız bir sapma.
-->
<script lang="ts">
	import { KIZIL as K, TUVAL } from './palet';
	import Kaplama from './Kaplama.svelte';

	let {
		/** Kâğıttaki karakterler, yukarıdan aşağıya. Boş dizi → kâğıt boş kalır. */
		ibare = ['十', '五', '円', '五', '十', '銭'],
		etiket = 'Kalabalığın ortasında bir el, üstünde kanji yazılı bir kâğıt uzatıyor.'
	}: { ibare?: string[]; etiket?: string } = $props();

	/* Dikey Japonca dizgi `writing-mode` ile de yazılabilirdi; karakterler tek
	   tek `<tspan>`e bölündü çünkü SVG metninde `writing-mode` desteği tarayıcıya
	   göre değişiyor ve bir tarayıcıda ibarenin YATAY çıkması sessiz bir hata
	   olurdu — metin görünür, sadece yanlış yönde.

	   ⚠️ ALTI KARAKTERE KADAR. İlk satır 204'te başlıyor, satır aralığı 15,
	   kâğıdın dibi 288: yedinci karakter kâğıdın dışına taşar. Daha uzun bir
	   ibare gerekirse kâğıdın yüksekliği de elin yeri de birlikte değişmeli. */
	const SATIR = 15;
</script>

<svg
	class="art"
	viewBox="0 0 {TUVAL.g} {TUVAL.y}"
	preserveAspectRatio="xMidYMid slice"
	role="img"
	aria-label={etiket}
>
	<rect width={TUVAL.g} height={TUVAL.y} fill={K.kagit} />

	<!-- ① zemin: tek düz ton. Perspektif yok — düotone derinlik iddia etmez. -->
	<path d="M0 400 V300 L60 292 L132 302 L204 290 L300 300 V400 Z" fill={K.ac} />

	<!--
		② kalabalık: dört baş ve omuz, hepsi aynı orta tonda ve hepsi YÜZSÜZ.
		Ayrı ayrı çizilmemeleri gerekiyordu — bu bir kalabalık, dört kişi değil;
		tek bir tonda olmaları onları tek kütle yapıyor.
	-->
	<g fill={K.orta}>
		<path d="M104 214 L108 194 L124 186 L140 192 L145 210 L138 228 L118 232 L106 226 Z" />
		<path d="M92 300 V254 L104 232 L124 226 L146 234 L158 256 L160 300 Z" />
		<path d="M150 200 L154 180 L170 172 L186 178 L191 196 L184 214 L164 218 L152 212 Z" />
		<path d="M138 300 V240 L150 218 L170 212 L192 220 L204 242 L206 300 Z" />
		<path d="M84 240 L88 222 L102 215 L116 221 L120 237 L114 253 L96 257 L86 252 Z" />
		<path d="M70 300 V266 L84 250 L102 245 L120 252 L130 270 L132 300 Z" />
		<path d="M196 236 L200 218 L214 211 L228 217 L232 233 L226 249 L208 253 L198 248 Z" />
	</g>

	<!--
		③ fener (提灯) ve onu tutan kol. Kol kadrajın DIŞINDAN giriyor: sahnenin
		kimin baktığına dair söylediği tek şey bu — bakan taraf kadrajın içinde
		değil, kenarında.
	-->
	<path d="M312 96 L182 46 L174 62 L312 122 Z" fill={K.koyu} />
	<path d="M164 40 L186 46 L188 60 L166 62 Z" fill={K.derin} />
	<g>
		<!--
			⚠️ GÖVDE `kagit` DEĞİL `ac`. İlk sürümde fener zeminle AYNI renkti;
			geriye yalnız çubukları kalıyor ve kadrajda havada asılı bir barkod
			gibi duruyordu. Düotone kipte bir formun var olması için komşusundan
			farklı bir düz tonda olması ŞART — kontur (kural 1) yok.
		-->
		<path d="M158 54 H186 L190 68 V102 L186 116 H158 L154 102 V68 Z" fill={K.ac} />
		<g fill={K.koyu}>
			<rect x="155" y="64" width="34" height="2" />
			<rect x="154" y="78" width="36" height="2" />
			<rect x="154" y="92" width="36" height="2" />
			<rect x="155" y="104" width="34" height="2" />
		</g>
		<rect x="162" y="114" width="20" height="6" fill={K.derin} />
	</g>

	<!--
		④ ön düzlem: iki kişi, sırtları dönük, kadrajı kırparak dikey bantlara
		bölüyor (kural 8). Aradaki boşluk sorgulananın durduğu yer — kadrajın
		tek açık koridoru.
	-->
	<g fill={K.derin}>
		<path d="M14 132 L20 100 L44 86 L70 94 L78 122 L70 148 L40 156 L18 150 Z" />
		<path d="M-10 400 V210 L4 172 L38 152 L76 162 L98 200 L100 400 Z" />
		<path d="M228 118 L236 88 L262 76 L286 86 L294 112 L286 136 L256 144 L232 138 Z" />
		<path d="M206 400 V200 L222 160 L256 142 L294 154 L312 194 V400 Z" />
	</g>

	<!--
		⑤ uzatılan el.

		⚠️ KOL DAR, EL GENİŞ. İlk sürümde kol 50 birimdi ve arkasındaki ortadaki
		figürle birleşip GÖVDE gibi okunuyordu — uzatılan bir el değil, bir cübbe.
		Kâğıdın altından elin görünmesi de şart: kâğıt eli tamamen örtünce
		havada duran bir sayfa oluyor.
	-->
	<g fill={K.koyu}>
		<path d="M114 400 L108 352 L114 320 L142 316 L150 350 L146 400 Z" />
		<path d="M110 322 L104 300 L118 288 L144 286 L156 296 L154 322 Z" />
	</g>

	<!--
		⑥ kâğıt: kadrajın en açık yeri ve en küçüğü. Hafif eğik duruyor —
		dümdüz konsa belge olurdu, eğik olunca uzatılmış bir şey oluyor.
	-->
	<g transform="rotate(-6 130 250)">
		<path d="M106 194 H154 V288 H106 Z" fill={K.kagit} />
		{#if ibare.length > 0}
			<text
				x="130"
				y="204"
				font-family="var(--font-ja)"
				font-size="14"
				text-anchor="middle"
				fill={K.derin}
			>
				{#each ibare as harf, i (i)}
					<tspan x="130" dy={i === 0 ? 0 : SATIR}>{harf}</tspan>
				{/each}
			</text>
		{/if}
		<!--
			başparmak: kâğıdın ÖNÜNDE, yoksa kâğıt elin içinde değil önünde durur.
			Sol kenara sıkışmış, çünkü ortada dursaydı ibarenin son karakterini
			örterdi — kadrajdaki tek okunacak şeyi.
		-->
		<path d="M100 256 L114 250 L122 270 L104 280 Z" fill={K.koyu} />
	</g>

	<!--
		Düotone kipte vinyet neredeyse yok: vinyet derinlik demek, bu kip
		derinlik iddia etmiyor. Gren duruyor — baskı hissi kipin bir parçası.
	-->
	<Kaplama ton={K.derin} vinyet={0.12} gren={0.075} />
</svg>

<style>
	svg {
		display: block;
		background: #f4efe6;
	}
</style>
