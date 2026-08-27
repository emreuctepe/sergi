<!--
	SAYI ROTASI — tuval ve üstündeki katmanlar.

	Tuval içeriğin ne olduğunu bilmiyor (bkz. Canvas.svelte), katmanlar da
	tuvalin nasıl çalıştığını. İkisinin arasındaki tek bağ burada: hangi okuma
	modundayız ve şu an okurun önünde ne var.

	⚠️ TERCİHLER MONTAJDAN SONRA OKUNUYOR.
	Bu rota önceden çiziliyor (karar 1.36): HTML derleme sırasında bir kez
	üretiliyor ve bütün okurlara aynısı gidiyor. Okura göre değişen bir ilk
	HTML üretmenin yolu yok — denenirse hidratlama uyuşmazlığı olur ve Svelte
	ağacı temizler (karar 1.18'de tam olarak bu yaşandı). Bedeli: modu `min`
	olan bir okur ilk karede tam akışı görüp sonra kısalmasını izliyor.
	Prerender'ın kazancı (563 ms → 0 ms) bu tek karelik oynamadan büyük.
-->
<script lang="ts">
	import { brand } from '$lib/brand';
	import Canvas from '$lib/canvas/Canvas.svelte';
	import type { Depth } from '$lib/content/types';
	import Intro from '$lib/overlays/Intro.svelte';
	import { readPrefs, writePrefs } from '$lib/state/prefs';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const issue = $derived(data.content.issue);

	/**
	 * Prerender edilen HTML'in modu. `full` seçildi çünkü en KAPSAYICI olan o:
	 * betik hiç çalışmazsa (ya da arama motoru okuyorsa) sayının tamamı ortada
	 * kalır. `min` ile çizilseydi JavaScript'siz okur sayının üçte birini
	 * görür ve eksik olduğunu hiç bilmezdi.
	 */
	let depth = $state<Depth>('full');
	let showIntro = $state(false);

	$effect(() => {
		const prefs = readPrefs();
		if (prefs.depth) depth = prefs.depth;
		showIntro = !prefs.seenIntro;
	});

	function introDone() {
		writePrefs({ seenIntro: true });
		showIntro = false;
	}
</script>

<svelte:head>
	<title>{issue.title} · {brand.name}</title>
	<meta name="description" content={issue.subtitle} />
</svelte:head>

<Canvas content={data.content} {depth} inert={showIntro} />

{#if showIntro}
	<Intro cards={data.content.intro} ondone={introDone} />
{/if}
