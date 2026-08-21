<script lang="ts">
	/* ==========================================================================
	   FAZ 0 — kurulum doğrulama sayfası (GEÇİCİ)
	   --------------------------------------------------------------------------
	   Bu sayfa 1.0'a girmeyecek. Faz 1'de yerini `/sayi/2026-09`'a yönlendirme
	   alacak. Tek işi gözle doğrulanabilir bir şey göstermek: tema token'ları
	   yüklendi mi, katman sırası tuttu mu, sayı teması uygulanıyor mu.
	   ========================================================================= */
	import { resolve } from '$app/paths';
	import { brand } from '$lib/brand';

	const ISSUE = '2026-09';

	let theme = $state<'light' | 'dark'>('light');

	$effect(() => {
		/* Sayı temasını köke as — tokens.css :root[data-issue="2026-09"] ile
		   paleti değiştiriyor. Faz 1'de bunu sayı route'u yapacak. */
		document.documentElement.dataset.issue = ISSUE;
		theme = (document.documentElement.dataset.theme as 'light' | 'dark') ?? 'light';
	});

	function toggleTheme() {
		theme = theme === 'light' ? 'dark' : 'light';
		document.documentElement.dataset.theme = theme;
		localStorage.setItem('mag:theme', theme);
	}

	const colors = [
		['--paper', 'kâğıt'],
		['--paper-raised', 'kabartma'],
		['--paper-sunken', 'çukur'],
		['--ink', 'mürekkep'],
		['--ink-soft', 'yumuşak'],
		['--accent', 'vurgu'],
		['--gold', 'altın']
	];

	const scale = [
		['--fs-3xl', 'Kızıl Mevsim'],
		['--fs-xl', 'Sonbaharın ilk haftası'],
		['--fs-base', 'Sokakların rengi eylülün ikinci haftasında değişmeye başlar.'],
		['--fs-xs', 'Aylık · Eylül 2026']
	];
</script>

<svelte:head>
	<title>Kurulum · {brand.name}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main>
	<header>
		<p class="kicker">Faz 0 · iskelet</p>
		<h1>{brand.name} kuruldu</h1>
		<p class="tagline">{brand.tagline}</p>
		<button onclick={toggleTheme}>
			{theme === 'light' ? '🌙 koyu temaya geç' : '☀️ aydınlık temaya geç'}
		</button>
	</header>

	<section>
		<h2>Palet — sayı teması <code>{ISSUE}</code></h2>
		<div class="swatches">
			{#each colors as [token, label] (token)}
				<figure>
					<div class="chip" style="background: var({token})"></div>
					<figcaption>{label}<br /><code>{token}</code></figcaption>
				</figure>
			{/each}
		</div>
	</section>

	<section class="canvas-probe">
		<h2>Tuval tipografi ölçeği</h2>
		<p class="hint">
			Bu kutu 3:4 ve <code>container-type: inline-size</code>. İçindeki her şey
			<code>cqi</code> ile ölçekleniyor — pencereyi daralt, orantı bozulmadan küçülsün.
		</p>
		<div class="probe">
			<!-- Dolgu bilerek İÇERDE: `--pad-page` cqi cinsinden ve bir öğe kendi
			     container'ı olamaz, yani dolguyu tuvalin kendisine verirsek cqi
			     viewport'a düşer. Gerçek tuval de aynı yapıda: .canvas > .page__inner -->
			<div class="probe__inner">
				{#each scale as [token, text] (token)}
					<p style="font-size: var({token})">{text}</p>
				{/each}
			</div>
		</div>
	</section>

	<section>
		<h2>Sırada</h2>
		<p>
			Faz 1: 3:4 tuval + snap motoru, 19 blok tipi, 22 çizilmiş sahne ve Kızıl Mevsim'in 29 sayfası.
			İlerleme: <code>docs/BUILD-TODO.md</code>
		</p>
		<p>
			Sayı baştan sona okunuyor: <a href={resolve('/sayi/[slug]', { slug: '2026-09' })}
				>Kızıl Mevsim</a
			> — 28 sayfa, 3:4 tuvalde.
		</p>
		<p>
			19 blok tipi hazır: <a href={resolve('/dev/bloklar')}>blok kataloğu</a> — sayının kendi içeriğinden
			29 çeşit, küçültülmüş tuvallerde.
		</p>
	</section>
</main>

<style>
	/* base.css gövdeye `background: var(--backdrop)` (iki temada da koyu — dergi
	   koyu bir masanın üstünde durur) ve `overflow: hidden` (kaydırma tuvalin
	   İÇİNDE olur) veriyor. Bu sayfanın da o sözleşmeye uyması gerek: kendi
	   kâğıt yüzeyini kurar ve kaydırmayı kendi içinde yapar. Zeminin üstüne
	   doğrudan `--ink` ile yazmak okunmaz olurdu; oranın rengi `--on-backdrop`. */
	main {
		height: 100dvh;
		overflow-y: auto;
		overscroll-behavior: contain;
		position: relative;
		z-index: var(--z-canvas);

		max-width: 60rem;
		margin-inline: auto;
		padding: var(--ui-sp-6) var(--ui-sp-5) var(--ui-sp-7);
		background: var(--paper);
		color: var(--ink);
		font-family: var(--font-text);
		box-shadow: var(--shadow-3);
	}

	header {
		margin-bottom: var(--ui-sp-7);
	}

	.kicker {
		font-family: var(--font-ui);
		font-size: var(--ui-fs-xs);
		letter-spacing: var(--tracking-caps);
		text-transform: uppercase;
		color: var(--ink-faint);
		margin: 0 0 var(--ui-sp-2);
	}

	h1 {
		font-family: var(--font-display);
		font-size: var(--ui-fs-xl);
		line-height: var(--lh-tight);
		margin: 0 0 var(--ui-sp-2);
	}

	.tagline {
		color: var(--ink-soft);
		font-size: var(--ui-fs-base);
		margin: 0 0 var(--ui-sp-4);
	}

	h2 {
		font-family: var(--font-ui);
		font-size: var(--ui-fs-sm);
		letter-spacing: var(--tracking-wide);
		text-transform: uppercase;
		color: var(--ink-faint);
		border-top: 1px solid var(--rule, var(--ink-faint));
		padding-top: var(--ui-sp-3);
		margin: 0 0 var(--ui-sp-4);
	}

	section {
		margin-bottom: var(--ui-sp-7);
	}

	button {
		font: inherit;
		font-family: var(--font-ui);
		font-size: var(--ui-fs-sm);
		min-height: var(--ui-tap);
		padding: 0 var(--ui-sp-4);
		border: 1px solid var(--ink-faint);
		border-radius: var(--radius-full);
		background: var(--paper-raised);
		color: var(--ink);
		cursor: pointer;
		transition: background var(--dur-fast) var(--ease-out);
	}

	button:hover {
		background: var(--paper-sunken);
	}

	.swatches {
		display: flex;
		flex-wrap: wrap;
		gap: var(--ui-sp-4);
	}

	figure {
		margin: 0;
		width: 7rem;
	}

	.chip {
		height: 4rem;
		border-radius: var(--radius-md);
		border: 1px solid var(--ink-faint);
	}

	figcaption {
		font-family: var(--font-ui);
		font-size: var(--ui-fs-xs);
		color: var(--ink-soft);
		margin-top: var(--ui-sp-2);
	}

	code {
		font-family: var(--font-mono);
		font-size: 0.9em;
		color: var(--ink-faint);
	}

	.hint {
		font-size: var(--ui-fs-sm);
		color: var(--ink-soft);
		max-width: 44ch;
	}

	/* Tuval ölçeğinin gerçekten `cqi`'ye bağlı olduğunu kanıtlayan minik tuval. */
	.probe {
		aspect-ratio: 3 / 4;
		width: min(100%, 22rem);
		container-type: inline-size;
		background: var(--paper-raised);
		border: 1px solid var(--ink-faint);
		border-radius: var(--radius-md);
		overflow: hidden;
	}

	.probe__inner {
		height: 100%;
		padding: var(--pad-page);
	}

	.probe p {
		font-family: var(--font-display);
		line-height: var(--lh-snug);
		margin: 0 0 var(--sp-3);
	}

	.probe p:last-child {
		font-family: var(--font-ui);
		letter-spacing: var(--tracking-caps);
		text-transform: uppercase;
		color: var(--ink-faint);
	}
</style>
