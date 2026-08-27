<script lang="ts">
	/* ==========================================================================
	   /dev/soylesi — RÖPORTAJ SAYFASI TASARIM ADAYLARI
	   --------------------------------------------------------------------------
	   Röportajın açılış sayfası (sy-acilis) beğenildi; ondan SONRAKİ sekiz sayfa
	   (sy-1…sy-8) beğenilmedi. Şu anki hâlleri sekiz kez aynı: yuvarlak "S"/"K"
	   rozeti, soru sans, cevap serif, altında görsel. Sekiz kez tekrarlanan bir
	   sohbet dökümü gibi duruyor; dergi sayfası gibi durmuyor.

	   Bu sayfa sekiz AYRI aday tasarım gösterir. Hiçbiri henüz üretimde değil:
	   `Dialog.svelte` ve `Figure.svelte` ellenmedi, `blocks.css` ellenmedi
	   (parity.test.ts onu prototiple bayt bayt eşit tutuyor). Seçim yapıldıktan
	   sonra kazanan buradan çıkarılıp gerçek bloklara taşınacak.

	   Adaylar çizerin KENDİ görsel dilinden türetildi: tarama çizgisi, hâle
	   konturu, yüksek kontrast, 20:9 sinema karesi. Kaynaklar 400×180 civarı,
	   yani makale fotoğrafı değil VİDEO KARESİ — tasarımların çoğu onları kare
	   gibi değil, kare gibi davranmayan bir şey gibi göstermemeye çalışıyor.

	   Karşılaştırma dürüst olsun diye üstteki seçiciyle bütün adaylar AYNI
	   sayfayı çizebiliyor: sy-4'ün cevabı 1500 karakter, sy-7'ninki tek satır.
	   Kısa cevapta güzel duran tasarım uzun cevapta çökebiliyor; bunu ancak
	   ikisini de aynı tasarımda görünce anlıyorsun.
	   ========================================================================= */
	import { assetUrl, avifSrcset } from '$lib/content/assets';
	import { setIssueContext } from '$lib/content/context';
	import type { DialogBlock, FigureBlock, Page } from '$lib/content/types';
	import { content } from '../../../content/2026-09';

	setIssueContext(() => content.issue);

	const ISSUE = content.issue.slug;

	/* --- içerik: sayfayı soru / cevap / görsele indirge -------------------- */

	interface QA {
		page: Page;
		/** Sıra numarası — "01" gibi basılıyor, sayfa kimliğinden değil sıradan. */
		no: string;
		q: string;
		a: string;
		/** Cevaplayan — her sayfada "KargaManga", yine de içerikten okunuyor. */
		name: string;
		img: string;
		alt: string;
		/** sy-8'in sonundaki kapanış notu; öbür sayfalarda yok. */
		note?: string;
	}

	const section = content.sections.find((s) => s.slug === 'soylesi')!;

	/** Açılış sayfası dışarıda: beğenilen o değil, ondan sonrası. */
	const qas: QA[] = section.pages
		.filter((p) => p.id !== 'sy-acilis')
		.map((page, i) => {
			const dialogs = page.blocks.filter((b): b is DialogBlock => b.t === 'dialog');
			const figure = page.blocks.find((b): b is FigureBlock => b.t === 'figure');
			const note = page.blocks.find((b) => b.t === 'note');
			return {
				page,
				no: String(i + 1).padStart(2, '0'),
				q: dialogs.find((d) => d.who === 'q')?.text ?? '',
				a: dialogs.find((d) => d.who === 'a')?.text ?? '',
				name: dialogs.find((d) => d.who === 'a')?.name ?? 'KargaManga',
				img: figure?.img ?? '',
				alt: figure?.alt ?? '',
				note: note && 'text' in note ? note.text : undefined
			};
		});

	/** Kaynaklar 400px genişlikte; kart tuvali 22rem, retina'da bile yetiyor. */
	const SIZES = '(max-width: 640px) 100vw, 360px';

	function avif(path: string) {
		return avifSrcset(path);
	}

	/* --- adaylar ----------------------------------------------------------- */

	interface Variant {
		id: number;
		ad: string;
		fikir: string;
	}

	const variants: Variant[] = [
		{
			id: 1,
			ad: 'Film Karesi',
			fikir:
				'Görsel sayfanın tepesinde tam kanıyor, soru karenin altına perdeyle biniyor. ' +
				'Kaynak zaten video karesi — kare gibi davranıyor.'
		},
		{
			id: 2,
			ad: 'Numara',
			fikir:
				'Soldan taşan içi boş dev rakam, soru display serifte. Görsel altta, çizerin ' +
				'hâle konturunu tekrarlayan beyaz çerçeveyle. En klasik dergi düzeni.'
		},
		{
			id: 3,
			ad: 'Balon',
			fikir:
				'Soru karenin üstünde Anime Ace balonunda, cevap manga anlatı kutusunda. ' +
				'Röportajın konusu mangacı — sayfa da öyle konuşuyor.'
		},
		{
			id: 4,
			ad: 'Kart',
			fikir:
				'Görsel sayfanın tamamına yayılıp karartılıyor, metin üstünde yükseltilmiş ' +
				'bir kâğıt kartta duruyor. Derinlik ve sergi hissi.'
		},
		{
			id: 5,
			ad: 'Marj',
			fikir:
				'Soru sol marjda dikey diziliyor (tategaki selamı), cevap tam ölçüde ve ' +
				'kapital harfle başlıyor. En baskı-işi duran aday.'
		},
		{
			id: 6,
			ad: 'Kontakt',
			fikir:
				'Kare bir kontakt föyünden çıkmış gibi: ince çerçeve, üstünde mono künye. ' +
				'Soru koyu bir şeritte. Arşiv / belgesel kaydı.'
		},
		{
			id: 7,
			ad: 'Tarama',
			fikir:
				'Sayfa temadan bağımsız koyu; görsel tam kanıyor ve tarama çizgileri kaynaktaki ' +
				'dokuyu sürdürüyor. Atmosferi en yüksek, en riskli aday.'
		},
		{
			id: 8,
			ad: 'Dizgi',
			fikir:
				'Görsel küçülüp yana çekiliyor, CEVAP büyüyüp sayfanın kendisi oluyor. ' +
				'Kısa ve şiirsel cevaplarda parlıyor, uzun cevapta çöküyor.'
		}
	];

	/* --- kontroller -------------------------------------------------------- */

	/** `null` = her aday kendi sayfasını çizsin (1→sy-1, 2→sy-2 …). */
	let seciliSayfa = $state<number | null>(null);
	let theme = $state<'light' | 'dark'>('light');

	const icerikFor = (i: number) => qas[seciliSayfa ?? i] ?? qas[0];

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
	<title>Röportaj tasarım adayları · {ISSUE}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<!-- ==========================================================================
     ADAY 1 · FİLM KARESİ
     ======================================================================= -->
{#snippet v1(d: QA)}
	<div class="v1">
		<figure class="v1__frame">
			<picture>
				{#if avif(d.img)}<source type="image/avif" srcset={avif(d.img)} sizes={SIZES} />{/if}
				<img src={assetUrl(d.img)} sizes={SIZES} alt={d.alt} loading="lazy" decoding="async" />
			</picture>
			<div class="v1__scrim"></div>
			<p class="v1__q">{d.q}</p>
		</figure>
		<div class="v1__body">
			<p class="v1__name">{d.name}</p>
			<p class="v1__a">{d.a}</p>
			{#if d.note}<p class="v1__note">{d.note}</p>{/if}
		</div>
	</div>
{/snippet}

<!-- ==========================================================================
     ADAY 2 · NUMARA
     ======================================================================= -->
{#snippet v2(d: QA)}
	<div class="v2">
		<div class="v2__head">
			<span class="v2__no" aria-hidden="true">{d.no}</span>
			<p class="v2__q">{d.q}</p>
		</div>
		<p class="v2__a">{d.a}</p>
		<figure class="v2__figure">
			<picture>
				{#if avif(d.img)}<source type="image/avif" srcset={avif(d.img)} sizes={SIZES} />{/if}
				<img src={assetUrl(d.img)} sizes={SIZES} alt={d.alt} loading="lazy" decoding="async" />
			</picture>
		</figure>
		{#if d.note}<p class="v2__note">{d.note}</p>{/if}
	</div>
{/snippet}

<!-- ==========================================================================
     ADAY 3 · BALON
     ======================================================================= -->
{#snippet v3(d: QA)}
	<div class="v3">
		<figure class="v3__frame">
			<picture>
				{#if avif(d.img)}<source type="image/avif" srcset={avif(d.img)} sizes={SIZES} />{/if}
				<img src={assetUrl(d.img)} sizes={SIZES} alt={d.alt} loading="lazy" decoding="async" />
			</picture>
			<p class="v3__bubble">{d.q}</p>
		</figure>
		<div class="v3__box">
			<span class="v3__name">{d.name}</span>
			<p class="v3__a">{d.a}</p>
		</div>
		{#if d.note}<p class="v3__note">{d.note}</p>{/if}
	</div>
{/snippet}

<!-- ==========================================================================
     ADAY 4 · KART
     ======================================================================= -->
{#snippet v4(d: QA)}
	<div class="v4">
		<div class="v4__bg">
			<picture>
				{#if avif(d.img)}<source type="image/avif" srcset={avif(d.img)} sizes={SIZES} />{/if}
				<img src={assetUrl(d.img)} sizes={SIZES} alt={d.alt} loading="lazy" decoding="async" />
			</picture>
		</div>
		<div class="v4__card">
			<!-- Aynı görsel ikinci kez, bu kez KESKİN ve kendi oranında: arkadaki
			     bulanık kopya ışık veriyor, buradaki okunuyor. Tarayıcı ikisini de
			     tek istekten alıyor. -->
			<figure class="v4__frame">
				<picture>
					{#if avif(d.img)}<source type="image/avif" srcset={avif(d.img)} sizes={SIZES} />{/if}
					<img src={assetUrl(d.img)} sizes={SIZES} alt="" loading="lazy" decoding="async" />
				</picture>
			</figure>
			<p class="v4__q">{d.q}</p>
			<p class="v4__a">{d.a}</p>
			{#if d.note}<p class="v4__note">{d.note}</p>{/if}
		</div>
	</div>
{/snippet}

<!-- ==========================================================================
     ADAY 5 · MARJ
     ======================================================================= -->
{#snippet v5(d: QA)}
	<div class="v5">
		<div class="v5__cols">
			<!-- Rayda SABİT uzunlukta bir künye var, sorunun kendisi değil: soru
			     dikeye konunca sy-4'ün 230 karakteri dört dikey satır oluyor ve
			     cevaba tek kelimelik bir sütun kalıyordu. Künye her sayfada aynı
			     boyda — ray da öyle. Cevaplayanın adı buraya EKLENMİYOR; eklenince
			     dikey metin sayfanın boyunu aşıp cevabın üstüne taşıyordu, zaten
			     görsel altındaki künyede yazıyor. -->

			<div class="v5__rail">
				<p class="v5__spine">SORU {d.no}</p>
			</div>
			<div>
				<p class="v5__q">{d.q}</p>
				<p class="v5__a">{d.a}</p>
			</div>
		</div>
		<figure class="v5__figure">
			<picture>
				{#if avif(d.img)}<source type="image/avif" srcset={avif(d.img)} sizes={SIZES} />{/if}
				<img src={assetUrl(d.img)} sizes={SIZES} alt={d.alt} loading="lazy" decoding="async" />
			</picture>
			<figcaption>{d.name}</figcaption>
		</figure>
		{#if d.note}<p class="v5__note">{d.note}</p>{/if}
	</div>
{/snippet}

<!-- ==========================================================================
     ADAY 6 · KONTAKT
     ======================================================================= -->
{#snippet v6(d: QA)}
	<div class="v6">
		<p class="v6__slug">KARE {d.no} / {String(qas.length).padStart(2, '0')}</p>
		<figure class="v6__frame">
			<picture>
				{#if avif(d.img)}<source type="image/avif" srcset={avif(d.img)} sizes={SIZES} />{/if}
				<img src={assetUrl(d.img)} sizes={SIZES} alt={d.alt} loading="lazy" decoding="async" />
			</picture>
		</figure>
		<p class="v6__q">{d.q}</p>
		<p class="v6__a">{d.a}</p>
		{#if d.note}<p class="v6__note">{d.note}</p>{/if}
	</div>
{/snippet}

<!-- ==========================================================================
     ADAY 7 · TARAMA
     ======================================================================= -->
{#snippet v7(d: QA)}
	<div class="v7">
		<figure class="v7__frame">
			<picture>
				{#if avif(d.img)}<source type="image/avif" srcset={avif(d.img)} sizes={SIZES} />{/if}
				<img src={assetUrl(d.img)} sizes={SIZES} alt={d.alt} loading="lazy" decoding="async" />
			</picture>
			<div class="v7__lines" aria-hidden="true"></div>
			<p class="v7__q">{d.q}</p>
		</figure>
		<div class="v7__body">
			<p class="v7__a">{d.a}</p>
			<p class="v7__name">— {d.name}</p>
			{#if d.note}<p class="v7__note">{d.note}</p>{/if}
		</div>
	</div>
{/snippet}

<!-- ==========================================================================
     ADAY 8 · DİZGİ
     ======================================================================= -->
{#snippet v8(d: QA)}
	<div class="v8">
		<p class="v8__q"><span aria-hidden="true">{d.no}</span>{d.q}</p>
		<p class="v8__a">{d.a}</p>
		<figure class="v8__figure">
			<picture>
				{#if avif(d.img)}<source type="image/avif" srcset={avif(d.img)} sizes={SIZES} />{/if}
				<img src={assetUrl(d.img)} sizes={SIZES} alt={d.alt} loading="lazy" decoding="async" />
			</picture>
		</figure>
		{#if d.note}<p class="v8__note">{d.note}</p>{/if}
	</div>
{/snippet}

<!-- ==========================================================================
     ŞU AN CANLIDA OLAN — kıyas tabanı
     ======================================================================= -->
{#snippet mevcut(d: QA)}
	<div class="v0">
		<div class="v0__row v0__row--q">
			<span class="v0__who v0__who--q">S</span>
			<p class="v0__q">{d.q}</p>
		</div>
		<div class="v0__row v0__row--a">
			<span class="v0__who v0__who--a">{d.name.slice(0, 1)}</span>
			<p class="v0__a">{d.a}</p>
		</div>
		<figure class="v0__figure">
			<picture>
				{#if avif(d.img)}<source type="image/avif" srcset={avif(d.img)} sizes={SIZES} />{/if}
				<img src={assetUrl(d.img)} sizes={SIZES} alt={d.alt} loading="lazy" decoding="async" />
			</picture>
		</figure>
	</div>
{/snippet}

<main>
	<header>
		<p class="kicker">Faz 1f · dev · üretime girmedi</p>
		<h1>Röportaj sayfası — sekiz aday</h1>
		<p class="tagline">
			<code>sy-1…sy-8</code> için sekiz ayrı tasarım. Açılış sayfası (<code>sy-acilis</code>) kapsam
			dışı. Hiçbiri henüz gerçek bloklara dokunmuyor — seçilen buradan taşınacak.
		</p>

		<div class="controls">
			<div class="seg" role="group" aria-label="Hangi sayfa çizilsin">
				<button
					class:on={seciliSayfa === null}
					aria-pressed={seciliSayfa === null}
					onclick={() => (seciliSayfa = null)}>her aday kendi sayfası</button
				>
				{#each qas as d, i (d.page.id)}
					<button
						class:on={seciliSayfa === i}
						aria-pressed={seciliSayfa === i}
						onclick={() => (seciliSayfa = i)}
						title={d.q}>{d.page.id}</button
					>
				{/each}
			</div>
			<button class="theme" onclick={toggleTheme}>
				{theme === 'light' ? '🌙 koyu' : '☀️ aydınlık'}
			</button>
		</div>

		<p class="hint">
			{#if seciliSayfa === null}
				Her kart kendi sayfasını çiziyor — sekizi arka arkaya okuyunca bölümün RİTMİ görünüyor.
			{:else}
				Sekizi de <code>{qas[seciliSayfa].page.id}</code> çiziyor ({qas[seciliSayfa].a.length}
				karakterlik cevap) — adaylar aynı metinde yan yana.
			{/if}
		</p>
	</header>

	<div class="grid">
		<!-- Kıyas tabanı önce: "neyi beğenmedik" gözün önünde dursun. -->
		<figure class="card card--base">
			<figcaption>
				<span class="tag tag--base">şu anki hâli</span>
				<span class="pid">{icerikFor(0).page.id}</span>
			</figcaption>
			<div class="stage"><div class="stage__inner">{@render mevcut(icerikFor(0))}</div></div>
			<p class="fikir">Sekiz sayfa boyunca değişmiyor: rozet, soru, cevap, görsel.</p>
		</figure>

		{#each variants as v, i (v.id)}
			<!-- Snippet'ler `<script>`ten görünmüyor (şablonda tanımlılar), o yüzden
			     eşleme burada: `{@const}` yalnız `{#each}`in doğrudan çocuğu olabilir. -->
			{@const ciz = [v1, v2, v3, v4, v5, v6, v7, v8][i]}
			<figure class="card">
				<figcaption>
					<span class="tag">{v.id} · {v.ad}</span>
					<span class="pid">{icerikFor(i).page.id}</span>
				</figcaption>
				<div class="stage"><div class="stage__inner">{@render ciz(icerikFor(i))}</div></div>
				<p class="fikir">{v.fikir}</p>
			</figure>
		{/each}
	</div>
</main>

<style>
	/* ======================================================================
	   KABUK
	   ----------------------------------------------------------------------
	   base.css gövdeye koyu zemin + `overflow: hidden` veriyor (kaydırma
	   tuvalin içinde olur). Bu bir tuval değil katalog: kendi kaydırmasını
	   kuruyor — /dev/bloklar'daki aynı not.
	   =================================================================== */
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
		max-width: 46rem;
		line-height: var(--lh-snug);
	}

	.controls {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--ui-sp-3);
	}

	.seg {
		display: flex;
		flex-wrap: wrap;
		gap: 2px;
		padding: 2px;
		border: 1px solid color-mix(in oklab, currentColor 30%, transparent);
		border-radius: var(--radius-full);
	}

	.seg button,
	.theme {
		font: inherit;
		font-size: var(--ui-fs-xs);
		min-height: 32px;
		padding: 0 var(--ui-sp-3);
		border: 0;
		border-radius: var(--radius-full);
		background: transparent;
		color: inherit;
		cursor: pointer;
		opacity: 0.7;
	}

	.seg button.on {
		background: var(--accent);
		color: var(--accent-ink);
		opacity: 1;
	}

	.theme {
		border: 1px solid color-mix(in oklab, currentColor 30%, transparent);
		min-height: 36px;
	}

	.hint {
		font-size: var(--ui-fs-xs);
		opacity: 0.6;
		margin: var(--ui-sp-3) 0 0;
	}

	.grid {
		max-width: 96rem;
		margin-inline: auto;
		display: grid;
		grid-template-columns: repeat(auto-fill, 22rem);
		justify-content: center;
		gap: var(--ui-sp-6) var(--ui-sp-5);
	}

	.card {
		margin: 0;
	}

	figcaption {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: var(--ui-sp-2);
		font-size: var(--ui-fs-xs);
		margin-bottom: var(--ui-sp-2);
	}

	.tag {
		font-weight: 700;
		letter-spacing: 0.02em;
	}

	.tag--base {
		opacity: 0.55;
		font-weight: 500;
	}

	.pid {
		opacity: 0.45;
		font-family: var(--font-mono);
	}

	.fikir {
		font-size: var(--ui-fs-xs);
		line-height: var(--lh-snug);
		opacity: 0.62;
		margin: var(--ui-sp-2) 0 0;
	}

	.card--base .stage {
		outline: 1px dashed color-mix(in oklab, currentColor 35%, transparent);
		outline-offset: 3px;
	}

	/* ======================================================================
	   SAHNE — tuvalin küçültülmüş kopyası
	   ----------------------------------------------------------------------
	   Bütün blok ölçüleri `cqi`: tuvalin GENİŞLİĞİNE bağlı. `container-type`
	   olmadan 1cqi en yakın atadan okunur ve boylar tamamen kayar — bu yüzden
	   `.canvas`ın iki satırı burada birebir tekrarlanıyor.

	   Yükseklik `min-height`: sayfa 3:4'e sığmak zorunda değil (`fit: scroll`),
	   uzun cevap kartı uzatır. `max-height` KOYULMUYOR — kırpılan bir tasarımı
	   değerlendiremezsin, taşan bir tasarımı değerlendirirsin.
	   =================================================================== */
	.stage {
		--canvas-w: 22rem;
		--canvas-h: calc(var(--canvas-w) * 4 / 3);
		width: var(--canvas-w);
		min-height: var(--canvas-h);
		container-type: inline-size;
		container-name: canvas;
		position: relative;
		overflow: hidden;
		border-radius: 4px;
		background: var(--paper);
		color: var(--ink);
		box-shadow: var(--shadow-3);
	}

	/* Sayfa iç kenar boşluğu tuvaldekiyle aynı; tam kanayan adaylar bunu
	   kendi içinde negatif marjla geri alıyor. */
	.stage__inner {
		min-height: inherit;
		display: flex;
		flex-direction: column;
	}

	.stage :where(img) {
		display: block;
		width: 100%;
		height: auto;
	}

	.stage :where(p) {
		margin: 0;
	}

	/* ======================================================================
	   0 · ŞU ANKİ HÂLİ — blocks.css'teki `.dialog` + `.figure`nin kopyası
	   ----------------------------------------------------------------------
	   Gerçek bileşenleri çağırmak yerine kopyalandı: `Dialog.svelte` global
	   `.dialog` sınıfını kullanıyor, Svelte kapsamı ona işlemiyor ve kart
	   içinde ölçüleri denetleyemiyorduk. Kıyas tabanı olarak birebir yeter.
	   =================================================================== */
	.v0 {
		padding: calc(var(--pad-page) * 1.35) var(--pad-page);
		display: grid;
		gap: var(--sp-3);
	}

	.v0__row {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--sp-2);
		align-items: start;
	}

	.v0__who {
		display: grid;
		place-items: center;
		width: 5.4cqi;
		height: 5.4cqi;
		border-radius: var(--radius-full);
		font-family: var(--font-ui);
		font-size: var(--fs-2xs);
		font-weight: 800;
	}

	.v0__who--q {
		background: var(--ink);
		color: var(--paper);
	}

	.v0__who--a {
		background: var(--accent);
		color: var(--accent-ink);
	}

	.v0__q {
		font-family: var(--font-ui);
		font-size: var(--fs-sm);
		font-weight: 600;
		color: var(--ink-soft);
		line-height: var(--lh-body);
		padding-top: 0.35cqi;
	}

	.v0__a {
		font-family: var(--font-text);
		font-size: var(--fs-base);
		line-height: var(--lh-body);
	}

	.v0__figure {
		margin: 0;
	}

	.v0__figure img {
		border-radius: var(--radius-md);
	}

	/* ======================================================================
	   1 · FİLM KARESİ
	   ----------------------------------------------------------------------
	   Kare sayfanın tepesine tam kanıyor ve soru onun İÇİNDE yaşıyor: altyazı
	   mantığı. Perde şart — kaynakların bir kısmı altta açık (03, 04), soru
	   beyaz ve perdesiz orada kayboluyordu.
	   =================================================================== */
	/* Kare kendi 20:9 boyunda bırakılınca beş satırlık bir soru (sy-4) onun
	   %54'ünü örtüyordu — altyazı görselden çok yer kaplıyor demektir. Zemin
	   yüksekliği veriliyor ve kare `cover` ile dolduruyor: yanlardan kırpılıyor
	   ama uzun soruda bile üstte görülecek görsel kalıyor. */
	.v1__frame {
		position: relative;
		margin: 0;
		min-height: 62cqi;
		overflow: hidden;
	}

	.v1__frame picture,
	.v1__frame img {
		height: 100%;
		position: absolute;
		inset: 0;
		object-fit: cover;
	}

	.v1__scrim {
		position: absolute;
		inset: 40% 0 0;
		background: linear-gradient(to top, rgb(8 6 5 / 0.88) 0%, rgb(8 6 5 / 0.15) 70%, transparent);
	}

	.v1__q {
		position: absolute;
		inset-inline: var(--pad-page);
		bottom: calc(var(--pad-page) * 0.55);
		font-family: var(--font-ui);
		font-size: var(--fs-sm);
		font-weight: 600;
		line-height: var(--lh-snug);
		color: #fbf6ee;
		text-wrap: pretty;
	}

	/* Sorunun solundaki kısa vurgu çubuğu — "burada biri konuşuyor". */
	.v1__q::before {
		content: '';
		display: block;
		width: 7cqi;
		height: 0.7cqi;
		margin-bottom: var(--sp-2);
		background: var(--accent);
	}

	.v1__body {
		padding: var(--sp-5) var(--pad-page) calc(var(--pad-page) * 1.2);
	}

	.v1__name {
		font-family: var(--font-ui);
		font-size: var(--fs-2xs);
		letter-spacing: var(--tracking-caps);
		text-transform: uppercase;
		color: var(--accent);
		margin-bottom: var(--sp-2) !important;
	}

	.v1__a {
		font-family: var(--font-text);
		font-size: var(--fs-base);
		line-height: var(--lh-body);
		text-wrap: pretty;
	}

	/* ======================================================================
	   2 · NUMARA
	   ----------------------------------------------------------------------
	   Rakam içi boş ve soldan taşıyor: sayfada ağırlık kuruyor ama okumayı
	   kesmiyor. `-webkit-text-stroke` yaygın destekleniyor; düşerse rakam
	   dolu çıkar, düzen bozulmaz.
	   =================================================================== */
	.v2 {
		padding: calc(var(--pad-page) * 1.1) var(--pad-page) calc(var(--pad-page) * 1.2);
	}

	.v2__head {
		margin-bottom: var(--sp-4);
	}

	/* Akışta duruyor, mutlak konumda DEĞİL: mutlakken kartın üst kenarı rakamı
	   kesiyordu. Negatif marjla soruyu rakamın eteğine bindirmeyi de denedik;
	   kısa soruda hoştu ama sy-4'ün beş satırlık sorusu rakamın ÜSTÜNE yazdı.
	   Bindirme yok — sıkı `line-height` ikisini zaten bağlıyor. */
	.v2__no {
		display: block;
		font-family: var(--font-display);
		font-size: var(--fs-2xl);
		font-weight: 700;
		line-height: 0.86;
		color: transparent;
		-webkit-text-stroke: 0.32cqi color-mix(in oklab, var(--accent) 60%, transparent);
		user-select: none;
	}

	.v2__q {
		position: relative;
		font-family: var(--issue-display, var(--font-display));
		font-size: var(--fs-md);
		line-height: var(--lh-tight);
		letter-spacing: var(--tracking-tight);
		text-wrap: balance;
	}

	.v2__a {
		font-family: var(--font-text);
		font-size: var(--fs-base);
		line-height: var(--lh-body);
		text-wrap: pretty;
		padding-top: var(--sp-3);
		border-top: 1px solid var(--line);
	}

	/* Çizerin kendi hâle konturunun sayfaya tercümesi: beyaz halka + gölge. */
	.v2__figure {
		margin: var(--sp-5) 0 0;
	}

	.v2__figure img {
		border: 0.9cqi solid var(--paper-raised);
		box-shadow: var(--shadow-2);
	}

	/* ======================================================================
	   3 · BALON
	   ----------------------------------------------------------------------
	   Anime Ace'te UZUN TİRE YOK (tokens.css'teki nota bak) — buradaki metin
	   içerikten geliyor ve tire içerebilir, o yüzden balon metni normal
	   noktalamayla yazılmış sorulara da dayanacak şekilde yedekli yığında.
	   =================================================================== */
	.v3__frame {
		position: relative;
		margin: 0;
		padding-bottom: 9cqi; /* balonun taşan kuyruğuna yer */
	}

	.v3__bubble {
		position: absolute;
		left: var(--pad-page);
		right: calc(var(--pad-page) * 1.6);
		bottom: 0;
		padding: var(--sp-3) var(--sp-4);
		border-radius: 3.2cqi;
		background: var(--paper-raised);
		box-shadow: var(--shadow-2);
		font-family: var(--font-manga);
		font-size: var(--fs-xs);
		line-height: var(--lh-snug);
		color: var(--ink);
		text-wrap: pretty;
	}

	/* Kuyruk: sola yatık üçgen, balonun alt kenarından kareye doğru. */
	.v3__bubble::after {
		content: '';
		position: absolute;
		left: 8cqi;
		bottom: -2.6cqi;
		border-inline: 2.4cqi solid transparent;
		border-top: 3cqi solid var(--paper-raised);
	}

	/* Anlatı kutusu: balonun tersi — köşeli, konturlu, mürekkep. */
	.v3__box {
		margin: var(--sp-4) var(--pad-page) 0;
		padding: var(--sp-3) var(--sp-4);
		border: 0.4cqi solid var(--ink);
		background: var(--paper);
	}

	.v3__name {
		display: block;
		font-family: var(--font-manga);
		font-size: var(--fs-2xs);
		letter-spacing: 0.04em;
		color: var(--accent);
		margin-bottom: var(--sp-2);
	}

	.v3__a {
		font-family: var(--font-text);
		font-size: var(--fs-sm);
		line-height: var(--lh-body);
		text-wrap: pretty;
	}

	/* ======================================================================
	   4 · KART
	   ----------------------------------------------------------------------
	   Görsel 20:9 ve sayfa 3:4 — `object-fit: cover` ile kırpılıyor. Kırpma
	   burada kabul edilebilir çünkü kare zaten okunmuyor, ATMOSFER olarak
	   çalışıyor; okunması gereken kart üstünde.
	   =================================================================== */
	.v4 {
		position: relative;
		flex: 1;
		display: flex;
		align-items: flex-end;
		min-height: var(--canvas-h);
	}

	.v4__bg {
		position: absolute;
		inset: 0;
		overflow: hidden;
	}

	/* 20:9 kaynak 3:4 kutuya `cover` ile giriyor — kırpma 3-4 kat, yani karenin
	   kompozisyonu zaten kayboluyor. Keskin bırakıldığında sonuç resim gibi
	   değil PARAZİT gibi duruyordu (tarama çizgileri büyütülünce şerit oluyor).
	   Bulanıklık kırpmayı bir karara çeviriyor: kare burada okunmak için değil,
	   renk ve ışık vermek için. `scale` bulanıklığın kenarda saydamlaşmasını
	   örtüyor. */
	.v4__bg img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transform: scale(1.15);
		filter: blur(1.6cqi) saturate(0.85) contrast(1.05);
	}

	.v4__bg::after {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(to bottom, rgb(10 8 6 / 0.35), rgb(10 8 6 / 0.72));
	}

	.v4__card {
		position: relative;
		z-index: 1;
		margin: calc(var(--pad-page) * 1.2) calc(var(--pad-page) * 0.7);
		padding: var(--sp-4);
		border-radius: var(--radius-md);
		background: var(--paper-raised);
		box-shadow: var(--shadow-3);
	}

	.v4__frame {
		margin: 0 0 var(--sp-4);
	}

	.v4__frame img {
		border-radius: var(--radius-sm);
	}

	.v4__q {
		font-family: var(--font-ui);
		font-size: var(--fs-xs);
		font-weight: 700;
		letter-spacing: 0.01em;
		line-height: var(--lh-snug);
		color: var(--accent);
		padding-bottom: var(--sp-2);
		margin-bottom: var(--sp-3) !important;
		border-bottom: 1px solid var(--line);
		text-wrap: pretty;
	}

	.v4__a {
		font-family: var(--font-text);
		font-size: var(--fs-sm);
		line-height: var(--lh-body);
		text-wrap: pretty;
	}

	/* ======================================================================
	   5 · MARJ
	   ----------------------------------------------------------------------
	   Soru dikey: `vertical-rl` + 180° dönüş = soldan yukarı okunan raylı
	   başlık. Tategaki'nin kendisi DEĞİL (o sağdan sola satırlanır); ona bir
	   selam. Rayın genişliği sabit değil `cqi` — uzun soru rayı uzatmasın
	   diye rayın kendisi kayabiliyor.
	   =================================================================== */
	.v5 {
		padding: calc(var(--pad-page) * 1.2) var(--pad-page) calc(var(--pad-page) * 1.2);
	}

	/* Ray sütunu `auto`, tahmini bir `cqi` DEĞİL: dikey yazılan metnin blok
	   ölçüsü tahmin ettiğimden genişti (25px'lik raya 41px'lik künye) ve fazlası
	   sessizce cevabın üstüne biniyordu. Künye artık sabit uzunlukta olduğu için
	   `auto` her sayfada aynı genişliği veriyor. */
	.v5__cols {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--sp-3);
	}

	.v5__rail {
		border-left: 0.6cqi solid var(--accent);
		padding-left: var(--sp-2);
	}

	/* Dönüş YOK: `rotate(180deg)` metni aşağıdan yukarı okutur (kitap sırtı
	   yönü). Düz `vertical-rl` yukarıdan aşağı okunur — marj künyesinin yönü. */
	.v5__spine {
		writing-mode: vertical-rl;
		font-family: var(--font-ui);
		font-size: var(--fs-2xs);
		font-weight: 700;
		letter-spacing: var(--tracking-caps);
		text-transform: uppercase;
		color: var(--ink-faint);
		white-space: nowrap;
	}

	.v5__q {
		font-family: var(--issue-display, var(--font-display));
		font-size: var(--fs-sm);
		font-style: italic;
		line-height: var(--lh-snug);
		color: var(--accent);
		margin-bottom: var(--sp-3) !important;
		text-wrap: pretty;
	}

	.v5__a {
		font-family: var(--font-text);
		font-size: var(--fs-base);
		line-height: var(--lh-body);
		text-wrap: pretty;
	}

	/* Kapital harf: cevabın ilk harfi iki satır boyu, akışa gömülü. */
	.v5__a::first-letter {
		float: left;
		font-family: var(--issue-display, var(--font-display));
		font-size: 3.4em;
		line-height: 0.82;
		padding-right: 0.06em;
		color: var(--accent);
	}

	.v5__figure {
		margin: var(--sp-5) 0 0;
	}

	.v5__figure figcaption {
		margin-top: var(--sp-2);
		font-family: var(--font-ui);
		font-size: var(--fs-2xs);
		letter-spacing: var(--tracking-caps);
		text-transform: uppercase;
		color: var(--ink-faint);
	}

	/* ======================================================================
	   6 · KONTAKT
	   =================================================================== */
	.v6 {
		padding: calc(var(--pad-page) * 1.1) var(--pad-page) calc(var(--pad-page) * 1.2);
	}

	.v6__slug {
		font-family: var(--font-mono);
		font-size: var(--fs-2xs);
		letter-spacing: var(--tracking-wide);
		color: var(--ink-faint);
		margin-bottom: var(--sp-2) !important;
	}

	.v6__frame {
		margin: 0;
		padding: 1.2cqi;
		border: 1px solid var(--line);
		background: var(--paper-sunken);
	}

	.v6__q {
		margin: var(--sp-4) 0 var(--sp-3) !important;
		padding: var(--sp-2) var(--sp-3);
		background: var(--ink);
		color: var(--paper);
		font-family: var(--font-ui);
		font-size: var(--fs-xs);
		font-weight: 700;
		line-height: var(--lh-snug);
		text-wrap: pretty;
	}

	.v6__a {
		font-family: var(--font-text);
		font-size: var(--fs-base);
		line-height: var(--lh-body);
		text-wrap: pretty;
	}

	/* ======================================================================
	   7 · TARAMA
	   ----------------------------------------------------------------------
	   Sayfa TEMADAN BAĞIMSIZ koyu: kaynaklar zaten koyu ve yüksek kontrastlı,
	   aydınlık kâğıt üstünde delik gibi duruyorlardı. Bedeli: bu aday seçilirse
	   bölüm aydınlık temada da koyu kalır — bilinçli bir karar olmalı, kaza
	   değil.
	   =================================================================== */
	.v7 {
		background: #0c0a09;
		color: #ece3d5;
		flex: 1;
	}

	.v7__frame {
		position: relative;
		margin: 0;
	}

	/* Kaynaktaki tarama dokusunu sayfaya taşıyor — görselin kendi çizgileriyle
	   hizalanmıyor (hizalanamaz, ölçüler farklı), sadece aynı dili konuşuyor. */
	.v7__lines {
		position: absolute;
		inset: 0;
		background: repeating-linear-gradient(
			to bottom,
			rgb(255 255 255 / 0.05) 0 1px,
			transparent 1px 3px
		);
		mix-blend-mode: overlay;
	}

	.v7__q {
		position: absolute;
		inset-inline: var(--pad-page);
		top: var(--sp-4);
		font-family: var(--font-ui);
		font-size: var(--fs-xs);
		font-weight: 700;
		line-height: var(--lh-snug);
		color: #fff;
		text-shadow:
			0 0 0.8cqi rgb(0 0 0 / 0.9),
			0 0.3cqi 1.2cqi rgb(0 0 0 / 0.7);
		text-wrap: pretty;
	}

	.v7__body {
		padding: var(--sp-5) var(--pad-page) calc(var(--pad-page) * 1.2);
	}

	.v7__a {
		font-family: var(--font-text);
		font-size: var(--fs-base);
		line-height: var(--lh-body);
		color: #e2d9cc;
		text-wrap: pretty;
	}

	.v7__name {
		margin-top: var(--sp-3) !important;
		font-family: var(--font-ui);
		font-size: var(--fs-2xs);
		letter-spacing: var(--tracking-caps);
		text-transform: uppercase;
		color: #d0664b;
	}

	/* ======================================================================
	   8 · DİZGİ
	   ----------------------------------------------------------------------
	   Tek hiyerarşi tersine çevrilmiş aday: sayfanın kahramanı CEVAP.
	   sy-7 ("pas geçeceğim") ve sy-8 (beş kelime) burada parlıyor; sy-4'ün
	   1500 karakteri --fs-lg'de sayfayı üç ekran uzatıyor. Seçicide sy-4'e
	   basıp bakmadan bu adaya evet deme.
	   =================================================================== */
	.v8 {
		padding: calc(var(--pad-page) * 1.3) var(--pad-page) calc(var(--pad-page) * 1.2);
		display: flex;
		flex-direction: column;
		gap: var(--sp-4);
		flex: 1;
	}

	.v8__q {
		font-family: var(--font-ui);
		font-size: var(--fs-2xs);
		font-weight: 600;
		letter-spacing: var(--tracking-wide);
		line-height: var(--lh-snug);
		color: var(--ink-faint);
		text-transform: uppercase;
	}

	.v8__q span {
		color: var(--accent);
		margin-right: var(--sp-2);
		font-variant-numeric: tabular-nums;
	}

	.v8__a {
		font-family: var(--issue-display, var(--font-display));
		font-size: var(--fs-lg);
		line-height: var(--lh-tight);
		letter-spacing: var(--tracking-tight);
		text-wrap: pretty;
	}

	/* Görsel küçülüp sağa çekiliyor: sayfayı yönetmiyor, cevabı imzalıyor. */
	.v8__figure {
		margin: auto 0 0 auto;
		width: 62%;
	}

	.v8__figure img {
		box-shadow: var(--shadow-2);
	}

	/* ======================================================================
	   Kapanış notu — sekiz adayda da aynı, sadece sy-8'de basılıyor.
	   =================================================================== */
	.v1__note,
	.v2__note,
	.v3__note,
	.v4__note,
	.v5__note,
	.v6__note,
	.v7__note,
	.v8__note {
		margin-top: var(--sp-4) !important;
		padding-top: var(--sp-2);
		border-top: 1px solid color-mix(in oklab, currentColor 20%, transparent);
		font-family: var(--font-ui);
		font-size: var(--fs-2xs);
		line-height: var(--lh-snug);
		opacity: 0.6;
	}

	.v3__note,
	.v5__note,
	.v6__note,
	.v8__note {
		margin-inline: 0;
	}

	.v3__note {
		margin-inline: var(--pad-page);
	}

	.v4__note {
		margin-top: var(--sp-3) !important;
	}
</style>
