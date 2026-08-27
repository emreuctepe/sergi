<!--
	TANITIM — ilk ziyarette gösterilen beş kart.

	`overlays.js`'in `openIntro`'sunun karşılığı. Dikey snap'li kartlar, her
	birinin arkasında bir sahne; son kartta "Sayıyı aç" düğmesi, üstte "Atla".

	NEDEN BU KATMAN VAR
	Dergi bir akış değil ve bunu söylemenin tek yolu SÖYLEMEK: okur "sonsuz
	kaydırma" bekleyerek geliyor. Beş kart bu beklentiyi bir kez düzeltiyor ve
	bir daha görünmüyor (`seenIntro`).

	⚠️ KATMAN KANVASIN ÜSTÜNE İNİYOR, ONUN YERİNE GEÇMİYOR.
	Sayı rotası önceden çiziliyor (karar 1.36) — yani okur ilk karede DERGİYİ
	görüyor, tanıtım üstüne sonra biniyor. Kaçınmanın yolu ya prerender'dan
	vazgeçmek ya da HTML'i okura göre değiştirmekti; ikisi de bu geçişten
	pahalı. `--dur-slow` boyunca yumuşak bir açılış, prototipteki gibi.

	Kanvas bu sırada `inert`: altta kalan sayfaya sekme ile gidilemesin,
	klavye tuvali çevirmesin (bkz. çağıran taraf, +page.svelte).
-->
<script lang="ts">
	import Scene from '$lib/art/Scene.svelte';
	import type { IntroCard } from '$lib/content/types';

	let { cards, ondone }: { cards: readonly IntroCard[]; ondone: () => void } = $props();

	let host = $state<HTMLElement | null>(null);
	let slides = $state<HTMLElement | null>(null);
	let on = $state(false);
	let current = $state(0);

	/* Tuvaldeki `reducedMotion()` ile aynı: hem sistem tercihi hem menüden
	   gelen anahtar. Süre CSS'te de 1ms'ye iniyor (tokens.css), yani bekleme
	   olmasaydı okur görünmez bir katmanın kalkmasını beklerdi. */
	function reducedMotion() {
		return (
			document.documentElement.dataset.motion === 'off' ||
			window.matchMedia('(prefers-reduced-motion: reduce)').matches
		);
	}

	/* Kapanış tek yönlü: "Atla", son karttaki düğme ve Escape aynı kapıdan
	   çıkıyor ve ikinci çağrı yutuluyor — yoksa hızlı bir okur `ondone`'ı iki
	   kez tetikleyip mod seçiciyi üst üste açabilirdi. */
	let finished = false;

	function finish() {
		if (finished) return;
		finished = true;
		on = false;
		setTimeout(ondone, reducedMotion() ? 0 : 420);
	}

	function onKey(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			finish();
		}
	}

	/** Kaydırma konumundan hangi kartta olduğumuzu türetir. */
	let frame = 0;
	function onScroll() {
		if (frame || !slides) return;
		frame = requestAnimationFrame(() => {
			frame = 0;
			if (slides) current = Math.round(slides.scrollTop / slides.clientHeight);
		});
	}

	$effect(() => {
		/* Açılış perdesi: `data-on` bir kare SONRA yazılmalı, yoksa geçiş
		   hiç başlamadan biter ve katman aniden belirir. */
		const id = requestAnimationFrame(() => (on = true));
		/* Odak katmana giriyor: Escape'in ve okla kaydırmanın çalışması için
		   odağın altta kalan tuvalde kalmaması gerekiyor. */
		slides?.focus({ preventScroll: true });
		return () => cancelAnimationFrame(id);
	});
</script>

<svelte:window onkeydown={onKey} />

<div
	class="intro-host"
	bind:this={host}
	data-on={on}
	role="dialog"
	aria-modal="true"
	aria-label="{cards.length} kartlık tanıtım"
>
	<div class="intro__slides" bind:this={slides} onscroll={onScroll} tabindex="-1">
		{#each cards as card, i (card.big)}
			<section class="intro__slide" data-i={i}>
				<div class="intro__bg"><Scene name={card.scene} /></div>
				<div class="intro__text">
					<h2 class="intro__big">{card.big}</h2>
					<p class="intro__small">{card.small}</p>
					{#if card.last}
						<button class="intro__start" type="button" onclick={finish}>Sayıyı aç</button>
					{:else}
						<!-- Aşağıyı işaret eden ok bir DÜĞME değil, işaret: dokunulacak
						     yer değil kaydırılacak yön. `aria-hidden` çünkü sesli okuyucu
						     için anlamı yok, kartların sırası zaten listede. -->
						<span class="intro__chev" aria-hidden="true">⌄</span>
					{/if}
				</div>
			</section>
		{/each}
	</div>

	<div class="intro__dots" aria-hidden="true">
		{#each cards as card, i (card.big)}
			<i data-i={i} data-on={i === current}></i>
		{/each}
	</div>

	<button class="intro__skip" type="button" onclick={finish}>Atla</button>
</div>
