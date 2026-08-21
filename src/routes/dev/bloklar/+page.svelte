<script lang="ts">
	/* ==========================================================================
	   /dev/bloklar — BLOK KATALOĞU
	   --------------------------------------------------------------------------
	   19 blok tipinin hepsi, SAYININ GERÇEK İÇERİĞİNDEN alınmış örneklerle.
	   Uydurma örnek metin kullanmıyoruz: `caption` bloğunun gerçek uzunluğu,
	   `pull`ın gerçek satır sayısı ancak gerçek cümleyle görünür.

	   Kartlar tuvalin küçültülmüş bir kopyası (`.canvas > .page > .page__inner`)
	   çünkü blok ölçülerinin hepsi `cqi` — yani tuvalin genişliğine bağlı.
	   Bloğu sıradan bir `<div>` içinde göstermek yanlış boyları gösterirdi.

	   ⚠️ Buradaki tuval kabuğu, Faz 1d'nin gerçek tuvalinin YERİNE GEÇMEZ:
	   snap, letterbox, IntersectionObserver ve klavye orada. Bu sayfa yalnızca
	   "blok doğru mu çiziliyor" sorusuna bakar ve 1.0'a girmez.
	   ========================================================================= */
	import Block from '$lib/blocks/Block.svelte';
	import { content } from '../../../content/2026-09';
	import { assetUrl } from '$lib/content/assets';
	import { setIssueContext } from '$lib/content/context';
	import { BLOCK_TYPES, type Block as BlockType, type Page } from '$lib/content/types';

	setIssueContext(content.issue);

	const ISSUE = content.issue.slug;

	/**
	 * Bir bloğun "çeşidi": tip + görünümü değiştiren bayraklar.
	 *
	 * Yalnızca tipe bakmak yetmiyordu — sayıdaki ilk `h1` düz bir başlık, ilk
	 * `list` madde listesi. Katalog o hâliyle `h1--big`i ve sözlüğü hiç
	 * göstermiyor, yani kapsadığını sandığı yüzeyin yarısını kaçırıyordu.
	 */
	function variantOf(block: BlockType): string {
		const flags: string[] = [];
		if (block.t === 'h1' && block.big) flags.push('big');
		if (block.t === 'p' && block.drop) flags.push('drop');
		if (block.t === 'pull' && block.big) flags.push('big');
		if (block.t === 'list') flags.push(block.style ?? 'bullet');
		if (block.t === 'dialog') flags.push(block.who);
		if (block.t === 'manga') flags.push(block.layout);
		if (block.invert) flags.push('invert');
		return [block.t, ...flags].join(' · ');
	}

	interface Sample {
		variant: string;
		page: Page;
		block: BlockType;
		index: number;
	}

	/** Sayıda GERÇEKTEN geçen her çeşidin ilk örneği, geldiği sayfayla birlikte. */
	const samples = (() => {
		const out: Sample[] = [];
		for (const section of content.sections) {
			for (const page of section.pages) {
				page.blocks.forEach((block, index) => {
					const variant = variantOf(block);
					if (!out.some((s) => s.variant === variant)) out.push({ variant, page, block, index });
				});
			}
		}
		return out.sort((a, b) => BLOCK_TYPES.indexOf(a.block.t) - BLOCK_TYPES.indexOf(b.block.t));
	})();

	/** Sayıda hiç kullanılmayan tipler — katalog neyi GÖSTEREMEDİĞİNİ de söylesin. */
	const missing = BLOCK_TYPES.filter((t) => !samples.some((s) => s.block.t === t));

	/** Sayfanın gerçek arka planı — `img:` çizilebiliyor, `scene:`/`photo:` Faz 1e. */
	function background(page: Page): { src?: string; pending?: string } {
		if (!page.bg) return {};
		const [kind, value] = [
			page.bg.slice(0, page.bg.indexOf(':')),
			page.bg.slice(page.bg.indexOf(':') + 1)
		];
		return kind === 'img' ? { src: assetUrl(value) } : { pending: page.bg };
	}

	let theme = $state<'light' | 'dark'>('light');

	$effect(() => {
		document.documentElement.dataset.issue = ISSUE;
		theme = (document.documentElement.dataset.theme as 'light' | 'dark') ?? 'light';
	});

	function toggleTheme() {
		theme = theme === 'light' ? 'dark' : 'light';
		document.documentElement.dataset.theme = theme;
		localStorage.setItem('mag:theme', theme);
	}
</script>

<svelte:head>
	<title>Blok kataloğu · {ISSUE}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main>
	<header>
		<p class="kicker">Faz 1c · dev</p>
		<h1>Blok kataloğu</h1>
		<p class="tagline">
			{samples.length} çeşit / {BLOCK_TYPES.length} tip · örnekler <code>{ISSUE}</code> sayısının
			kendi içeriğinden.
			{#if missing.length}
				Sayıda geçmeyen tipler: <code>{missing.join(', ')}</code>.
			{/if}
		</p>
		<button onclick={toggleTheme}>
			{theme === 'light' ? '🌙 koyu temaya geç' : '☀️ aydınlık temaya geç'}
		</button>
	</header>

	<div class="grid">
		{#each samples as { variant, page, block, index } (variant)}
			{@const bg = background(page)}
			<figure>
				<figcaption>
					<code>{variant}</code>
					<span>{block.id}</span>
				</figcaption>

				<div class="canvas" data-fit={page.fit}>
					<section
						class={['page', (block.invert || page.bleed === 'full') && 'page--overlay']}
						data-page-id={page.id}
						data-kind={page.kind}
						data-fit={page.fit}
						data-bleed={page.bleed ?? 'none'}
					>
						{#if bg.src}
							<div class="page__bg">
								<img class="page__bg-img" src={bg.src} alt="" loading="lazy" decoding="async" />
							</div>
						{/if}
						<div class="page__inner">
							<Block {block} {index} />
						</div>
					</section>
				</div>

				{#if bg.pending}
					<p class="pending">arka plan <code>{bg.pending}</code> — çizilmiş sahneler Faz 1e</p>
				{/if}
			</figure>
		{/each}
	</div>
</main>

<style>
	/* base.css gövdeye koyu bir zemin ve `overflow: hidden` veriyor (kaydırma
	   tuvalin içinde olur). Bu sayfa bir tuval değil, bir katalog: kendi
	   kaydırma alanını kuruyor. Bkz. routes/+page.svelte'teki aynı not. */
	main {
		height: 100dvh;
		overflow-y: auto;
		overscroll-behavior: contain;
		position: relative;
		z-index: var(--z-canvas);
		padding: var(--ui-sp-6) var(--ui-sp-5) var(--ui-sp-7);
		color: var(--on-backdrop, #e8e2d8);
		font-family: var(--font-ui);
	}

	header {
		max-width: 60rem;
		margin: 0 auto var(--ui-sp-6);
	}

	.kicker {
		font-size: var(--ui-fs-xs);
		letter-spacing: var(--tracking-caps);
		text-transform: uppercase;
		opacity: 0.6;
		margin: 0 0 var(--ui-sp-2);
	}

	h1 {
		font-family: var(--font-display);
		font-size: var(--ui-fs-xl);
		margin: 0 0 var(--ui-sp-2);
	}

	.tagline {
		opacity: 0.75;
		margin: 0 0 var(--ui-sp-4);
	}

	button {
		font: inherit;
		font-size: var(--ui-fs-sm);
		min-height: var(--ui-tap);
		padding: 0 var(--ui-sp-4);
		border: 1px solid currentColor;
		border-radius: var(--radius-full);
		background: transparent;
		color: inherit;
		cursor: pointer;
	}

	.grid {
		max-width: 84rem;
		margin-inline: auto;
		display: grid;
		/* Esnek değil SABİT sütun: kartın tuvali `--canvas-w`yi bir UZUNLUK olarak
		   vermek zorunda (aşağıdaki nota bak), yüzde vermek zorunda değil. */
		grid-template-columns: repeat(auto-fill, 20rem);
		justify-content: center;
		gap: var(--ui-sp-6);
	}

	figure {
		margin: 0;
	}

	figcaption {
		display: flex;
		justify-content: space-between;
		gap: var(--ui-sp-2);
		font-size: var(--ui-fs-xs);
		margin-bottom: var(--ui-sp-2);
		opacity: 0.8;
	}

	figcaption span {
		opacity: 0.55;
	}

	/* Kartın tuvali. İki kural:
	   1. `--canvas-w` ve `--canvas-h` birlikte ezilmeli — ikisi de `:root`ta
	      hesaplanıyor, yalnız genişliği ezmek yüksekliği eskisinde bırakır.
	   2. İkisi de gerçek bir UZUNLUK olmalı. `aspect-ratio` ile idare etmeyi
	      denedik ve manga "plan" sayfası taştı: `blocks.css` sayfanın boyunu
	      `calc(var(--canvas-h) - …)` ile hesaplıyor, `auto` orada geçersiz bir
	      calc üretiyor. Tuvalin sözleşmesi bir sayı vermek; kart da veriyor. */
	.canvas {
		--canvas-w: 20rem;
		--canvas-h: calc(var(--canvas-w) * 4 / 3);
		width: var(--canvas-w);
		height: var(--canvas-h);
		border-radius: 4px;
		box-shadow: var(--shadow-3);
	}

	/* Kaydırmalı sayfalar 3:4'e sığmak zorunda değil; katalogda taşan kısım
	   kartın içinde kayar, kartı uzatmaz. */
	.canvas[data-fit='scroll'] {
		overflow-y: auto;
	}

	.pending {
		font-size: var(--ui-fs-xs);
		opacity: 0.6;
		margin: var(--ui-sp-2) 0 0;
	}

	code {
		font-family: var(--font-mono);
	}
</style>
