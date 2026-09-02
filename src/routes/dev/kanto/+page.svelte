<script lang="ts">
	/* ==========================================================================
	   /dev/kanto — KANTŌ SAHNELERİ
	   --------------------------------------------------------------------------
	   `src/lib/art/kanto/` altındaki altı sahne, bir arada.

	   Bu sayfanın var olma sebebi: o sahneler `scenes.ts` kaydında DEĞİL (sebep
	   `kanto/BENIOKU.md`'de), yani hiçbir sayfa onları çağırmıyor ve sayının
	   içinden bakılamıyorlar. Kayda girene kadar tek görünür oldukları yer
	   burası. Yazı yazılıp sahneler bağlandığında bu sayfa bir AYNA olmaya
	   başlar ve o gün ya gerçek sayfalara işaret etmeli ya da silinmeli
	   (bkz. /dev/soylesi'nin başındaki aynı not).

	   ⚠️ ÜST BANTTAKİ "kontrol" ÖLÇEĞİ SÜS DEĞİL, TEST. `visual_design.md` §12'nin
	   geçme ölçütlerinden biri "silhouette still readable at 10% scale" — bir
	   sahne ancak küçültülünce yalan söyleyip söylemediğini itiraf ediyor. Büyük
	   ölçekte iyi duran bir kompozisyon 110 pikselde gri bir lekeye dönüşüyorsa
	   sorun kompozisyondadır, ölçekte değil.

	   Sahnelerin kendi paletleri var (tema değişkeni kullanmıyorlar), o yüzden
	   bu sayfanın zemini bilerek nötr gri: sahnenin gecesi zeminden gelmediği,
	   kendi içinden geldiği görünsün.
	   ========================================================================= */
	import AlevHortumu from '$lib/art/kanto/AlevHortumu.svelte';
	import Gemici from '$lib/art/kanto/Gemici.svelte';
	import Kanji from '$lib/art/kanto/Kanji.svelte';
	import Ocak from '$lib/art/kanto/Ocak.svelte';
	import TokyoBugun from '$lib/art/kanto/TokyoBugun.svelte';
	import Tsunami from '$lib/art/kanto/Tsunami.svelte';

	/** Sahneler, yazıdaki sırayla — kronoloji: sarsıntı → yangın → deniz → sonra. */
	const SAHNELER = [
		{ ad: 'Ocak', bilesen: Ocak, not: '11.58 — devrilen ocak' },
		{ ad: 'AlevHortumu', bilesen: AlevHortumu, not: 'alev tornadosu · HAREKETLİ' },
		{ ad: 'Gemici', bilesen: Gemici, not: 'Dongola’nın güvertesi' },
		{ ad: 'Tsunami', bilesen: Tsunami, not: 'on metre' },
		{ ad: 'Kanji', bilesen: Kanji, not: 'sokak kontrolü · düotone' },
		{ ad: 'TokyoBugun', bilesen: TokyoBugun, not: '2025 · %93,4' }
	];

	/** `sayfa`: telefonda göründüğü boy. `kontrol`: §12'nin siluet testi. */
	let olcek = $state<'sayfa' | 'kontrol'>('sayfa');

	const EN = { sayfa: 300, kontrol: 110 };
</script>

<header>
	<h1>Kantō sahneleri</h1>
	<p>
		<code>src/lib/art/kanto/</code> — altısı da <code>scenes.ts</code> kaydında değil, sayının içinden
		çağrılamıyorlar.
	</p>
	<div class="secim" role="group" aria-label="Ölçek">
		<button type="button" aria-pressed={olcek === 'sayfa'} onclick={() => (olcek = 'sayfa')}>
			sayfa boyu
		</button>
		<button type="button" aria-pressed={olcek === 'kontrol'} onclick={() => (olcek = 'kontrol')}>
			siluet testi (%10)
		</button>
	</div>
</header>

<div class="izgara" style="--en: {EN[olcek]}px">
	{#each SAHNELER as sahne (sahne.ad)}
		{@const Sahne = sahne.bilesen}
		<figure>
			<div class="tuval"><Sahne /></div>
			<figcaption>
				<b>{sahne.ad}</b>
				<span>{sahne.not}</span>
			</figcaption>
		</figure>
	{/each}
</div>

<p class="dipnot">
	Hareket <code>prefers-reduced-motion</code>'a bağlı: işletim sisteminde "hareketi azalt" açıksa
	<code>AlevHortumu</code> duruk ilk karede kalır. Sunucuda da hep duruk çizilir.
</p>

<style>
	:global(body) {
		margin: 0;
		background: #3a3a3a;
		color: #e8e8e8;
		font-family: ui-sans-serif, system-ui, sans-serif;
	}

	header {
		padding: 24px 24px 0;
	}
	h1 {
		font-size: 20px;
		margin: 0 0 4px;
	}
	header p {
		margin: 0 0 14px;
		font-size: 13px;
		color: #a8a8a8;
	}
	code {
		font-family: ui-monospace, monospace;
		font-size: 0.92em;
	}

	.secim {
		display: flex;
		gap: 6px;
	}
	.secim button {
		border: 1px solid #5a5a5a;
		background: transparent;
		color: #ccc;
		font: inherit;
		font-size: 13px;
		padding: 5px 12px;
		border-radius: 4px;
		cursor: pointer;
	}
	.secim button[aria-pressed='true'] {
		background: #e8e8e8;
		border-color: #e8e8e8;
		color: #222;
	}

	.izgara {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(var(--en), max-content));
		justify-content: start;
		gap: 20px;
		padding: 20px 24px;
	}

	figure {
		margin: 0;
		width: var(--en);
	}

	/* Sahneler 3:4 tuval için çizildi; kutu da 3:4 olmalı, yoksa
	   `preserveAspectRatio="…slice"` kadrajı kırpar ve kompozisyon yalan söyler. */
	.tuval {
		aspect-ratio: 3 / 4;
		overflow: hidden;
	}
	.tuval :global(svg) {
		display: block;
		width: 100%;
		height: 100%;
	}

	figcaption {
		padding-top: 6px;
		font-size: 12px;
		line-height: 1.4;
	}
	figcaption span {
		display: block;
		color: #a0a0a0;
	}

	.dipnot {
		margin: 0;
		padding: 0 24px 28px;
		font-size: 12px;
		color: #9a9a9a;
		max-width: 62ch;
	}
</style>
