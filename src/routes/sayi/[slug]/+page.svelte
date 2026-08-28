<!--
	SAYI ROTASI — tuval ve üstündeki katmanlar.

	Tuval içeriğin ne olduğunu bilmiyor (bkz. Canvas.svelte), katmanlar da
	tuvalin nasıl çalıştığını. İkisinin arasındaki tek bağ burada: hangi okuma
	modundayız ve şu an okurun önünde ne var.

	AÇILIŞ SIRASI (prototipteki `app.js` `boot()`in karşılığı)
	  her ziyaret      → yükleme (sayının görselleri + fontlar)
	  ilk ziyaret      → · → tanıtım → mod seçimi (kapatılamaz) → sayı
	  modu olmayan     → · → mod seçimi (kapatılamaz) → sayı
	  dönen okur       → · → doğrudan sayı, kendi modunda

	Yükleme HEPSİNİN ÖNÜNDE ve tek istisnası yok: ötekiler okura göre açılıp
	kapanıyor, o ise sayının kendisi hazır olana kadar duruyor. Tanıtımı
	yüklemenin önüne koymak, kartların arkasındaki sahneleri çizilmemiş
	göstermek olurdu.

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
	import DepthPicker from '$lib/overlays/DepthPicker.svelte';
	import Intro from '$lib/overlays/Intro.svelte';
	import Loader from '$lib/overlays/Loader.svelte';
	import Modal from '$lib/overlays/Modal.svelte';
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

	/** Okurun SEÇTİĞİ mod. `null` = henüz sorulmadı; `depth` o sırada yedek. */
	let chosen = $state<Depth | null>(null);
	let showIntro = $state(false);
	let showPicker = $state(false);

	/**
	 * Sayının görselleri ve fontları indi mi? Yukarıdaki ⚠️'in TERSİ: bu alan
	 * `false` DOĞUYOR ve önceden çizilen HTML'e yükleme ekranıyla giriyor.
	 * Uyuşmazlık riski yok çünkü okura göre değişmiyor — herkes yükleniyor
	 * durumunda başlıyor, tarayıcıda biten iş onu kaldırıyor.
	 */
	let hazir = $state(false);

	$effect(() => {
		const prefs = readPrefs();
		chosen = prefs.depth;
		if (prefs.depth) depth = prefs.depth;

		if (!prefs.seenIntro) showIntro = true;
		else if (!prefs.depth) showPicker = true;
	});

	function introDone() {
		writePrefs({ seenIntro: true });
		showIntro = false;
		/* Tanıtımın üçüncü kartı "üç okuma derinliği" diye söz veriyor; seçim
		   hemen arkasından geliyor ki söz havada kalmasın. */
		showPicker = true;
	}

	function choose(next: Depth) {
		chosen = next;
		depth = next;
		writePrefs({ depth: next });
		showPicker = false;
	}
</script>

<svelte:head>
	<title>{issue.title} · {brand.name}</title>
	<meta name="description" content={issue.subtitle} />
</svelte:head>

<Canvas
	content={data.content}
	{depth}
	inert={!hazir || showIntro || showPicker}
	ondepthclick={() => (showPicker = true)}
/>

{#if !hazir}
	<Loader content={data.content} ondone={() => (hazir = true)} />
{:else if showIntro}
	<Intro cards={data.content.intro} ondone={introDone} />
{:else if showPicker}
	<!--
		İlk seçim KAPATILAMAZ: kapatılırsa geriye seçilmemiş bir mod kalır ve
		okur, hiç sormadığımız bir varsayılanla okumaya başlar. Çipten açılan
		ikinci ve sonraki seçimler kapatılabilir — orada zaten bir seçim var.
	-->
	<Modal
		title={chosen ? 'Okuma modu' : 'Nasıl okumak istersin?'}
		closable={chosen !== null}
		onclose={() => (showPicker = false)}
	>
		<DepthPicker content={data.content} current={chosen} onchoose={choose} />
	</Modal>
{/if}
