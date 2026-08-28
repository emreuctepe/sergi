<!--
	TUVAL — 3:4 kabuk, snap gezinme, sahne tetikleme.

	`canvas.js`'in karşılığı. O dosyanın ilkesi burada da geçerli: TUVAL
	İÇERİĞİN NE OLDUĞUNU BİLMEZ. Sayfa denen kutuları yönetir — hangisi
	görünür, ne kadar ilerledik, klavye nereye götürür.

	Kimlikler (`#shell`, `#canvas`, `#pages`, `#folio`) bilerek korundu:
	`canvas.css` prototipten bayt bayt taşındı ve `#shell[data-letterbox]`,
	`:root[data-dock="on"] #shell` gibi seçicilerle onlara bağlı. Bir bileşenin
	belge-benzersiz kimlik sahiplenmesi normalde kaçınılacak bir şey ama tuval
	sayfada tektir — uygulamanın kabuğu odur.

	1.0'A GİRMEYEN, SONRAKİ FAZLARA AİT OLAN ŞEYLER
	Prototipin bantlarında menü, dil seçici, beğen/paylaş düğmeleri de vardı.
	Buraya yalnızca ÇALIŞANLAR alındı: ilerleme, folio, sayfa gezinme. Çalışmayan
	bir düğme, okura verilmiş yalan bir sözdür (prototipte `data-fake="true"`
	diye işaretliydiler; işaretlemek yerine getirmemek daha dürüst).
-->
<script lang="ts">
	import { setIssueContext } from '$lib/content/context';
	import { flow, nearestVisible } from '$lib/content/flow';
	import type { Depth, IssueContent } from '$lib/content/types';
	import { depthName } from '$lib/overlays/depths';
	import {
		dockFit,
		indexAt,
		letterboxFree,
		letterboxMode,
		nextStep,
		prevStep,
		progressPercent,
		type PageMetrics,
		type Step
	} from './geometry';
	import Page from './Page.svelte';

	let {
		content,
		depth = 'full',
		inert = false,
		ondepthclick
	}: {
		content: IssueContent;
		depth?: Depth;
		/**
		 * Banttaki mod çipine dokunulunca. Verilmezse çip HİÇ ÇİZİLMİYOR —
		 * hiçbir şey yapmayan bir düğme okura verilmiş yalan bir sözdür
		 * (bkz. bileşenin başındaki not).
		 */
		ondepthclick?: () => void;
		/**
		 * Üstünde bir katman varken (tanıtım, mod seçici) tuval çekilir: `inert`
		 * odağı ve işaretçiyi keser. Klavyeyi KESMEZ — `onKey` belgeye bağlı ve
		 * `inert` belge düzeyindeki dinleyiciyi durdurmuyor, o yüzden aşağıda
		 * ayrıca sınanıyor. Olmasaydı okur tanıtımı okurken arkadaki sayı ok
		 * tuşlarıyla sessizce ilerlerdi.
		 */
		inert?: boolean;
	} = $props();

	setIssueContext(() => content.issue);

	const items = $derived(flow(content, depth));

	let canvasEl = $state<HTMLElement | null>(null);
	let scroller = $state<HTMLDivElement | null>(null);

	/**
	 * Sayfa ölçüleri BİLEREK reaktif değil.
	 *
	 * `$state` yapılmıştı ve tuval sessizce felç oldu: ölçüm effect'i `metrics`e
	 * hem YAZIYOR hem (sayfa/ilerleme hesabı için) OKUYORDU — kendi kendini
	 * tetikleyen bir döngü. Svelte belli bir derinlikten sonra
	 * `effect_update_depth_exceeded` atıp EFFECT'LERİ BIRAKIYOR; sayfa çiziliyor
	 * ama kaydırma, folio ve ilerleme ölü doğuyordu. Konsolda tek satır hata,
	 * ekranda hiçbir belirti.
	 *
	 * Bu diziyi zaten yalnızca olay işleyicileri okuyor, şablon değil. Reaktif
	 * olmasına gerek yok — olmaması da döngüyü baştan imkânsız kılıyor.
	 */
	let metrics: PageMetrics[] = [];

	let current = $state(0);
	let percent = $state(0);
	let letterbox = $state<'roomy' | 'tight'>('roomy');
	let chrome = $state<'on' | 'dim'>('on');

	const page = $derived(items[current]);
	const total = $derived(items.length);

	/* Folio kapakta ve sayı sonunda susuyor: o iki sayfa kendi başına bir
	   kompozisyon, köşesinde sayfa numarası istemiyor. */
	const folioHidden = $derived(
		page?.page.kind === 'cover' || page?.page.kind === 'outro' || total === 0
	);
	const folioOverlay = $derived(page?.page.bleed === 'full' && page?.page.kind !== 'manga');

	/* ==========================================================================
	   ÖLÇÜM
	   ======================================================================= */

	function readMetrics() {
		if (!scroller) return;
		metrics = [...scroller.querySelectorAll<HTMLElement>('.page')].map((el) => ({
			top: el.offsetTop,
			height: el.offsetHeight,
			fit: el.dataset.fit === 'scroll' ? 'scroll' : 'contain'
		}));
	}

	/**
	 * Bantlara letterbox boşluğunda yer var mı, sabit menü tuvalin yanına sığar mı?
	 * Karar `geometry.ts`'te; buradaki iş ölçüp yazmak.
	 */
	function measure() {
		if (!canvasEl) return;
		const root = document.documentElement;
		const box = canvasEl.getBoundingClientRect();
		const bandH = parseFloat(getComputedStyle(root).getPropertyValue('--ui-band-h')) || 52;

		letterbox = letterboxMode(window.innerHeight, box.height, bandH);
		root.style.setProperty(
			'--letterbox-free',
			`${letterboxFree(window.innerHeight, box.height).toFixed(1)}px`
		);

		const dock = dockFit(window.innerWidth, window.innerHeight, box.width);
		if (dock.fits) root.style.setProperty('--dock-w', `${dock.width}px`);
		root.dataset.dockFits = String(dock.fits);
	}

	/* ==========================================================================
	   KAYDIRMA
	   ======================================================================= */

	let lastHeight = 0;
	let chromeTimer: ReturnType<typeof setTimeout> | undefined;
	let frame = 0;

	function onScroll() {
		if (frame) return;
		frame = requestAnimationFrame(() => {
			frame = 0;
			update();
			/* Ankraj YALNIZ buradan ve `apply()`ten tazeleniyor: ikisi de okurun
			   gerçekten hareket ettiği anlar. `update()`in içine konulmuştu ve
			   sessizce bozuyordu — mod değişince akış effect'i de `update()`
			   çağırıyor, o an tarayıcı kaydırmayı kısalan belgeye çoktan
			   sıkıştırmış oluyor ve ankraj "okurun olduğu yer"den "belgenin
			   sonu"na dönüşüyordu. Ölçüldü: `sy-5`teki okur `min`e geçince
			   ankraj `son-1` olarak okunuyordu, yani konum koruma kendi
			   kaydettiği yanlış yere sadakatle gidiyordu. */
			anchorId = items[current]?.page.id ?? anchorId;
		});
	}

	/**
	 * Okurun EN SON hangi sayfada olduğu — okuma modu değişince buraya dönülüyor.
	 *
	 * `current` bir İNDEKS ve mod değişince aynı indeks bambaşka bir sayfaya
	 * denk geliyor (`min` 19, `full` 30 sayfa). Kalıcı olan tek şey kimlik,
	 * o yüzden ankraj kimlikle tutuluyor. Reaktif DEĞİL: yalnız olay
	 * işleyicileri okuyor ve yazıyor — `metrics` ile aynı gerekçe.
	 *
	 * Yalnız İKİ yerden tazeleniyor, ikisi de okurun gerçekten yer değiştirdiği
	 * anlar: `onScroll` (kaydırma oturunca) ve `apply` (gezinme hedefi).
	 */
	let anchorId: string | null = null;

	function update() {
		if (!scroller || !metrics.length) return;

		/* Görseller yüklendikçe uzun sayfalar boy değiştiriyor. Her karede
		   yeniden ölçmek düzen sarsar; yalnız toplam boy oynadığında ölçüyoruz. */
		if (scroller.scrollHeight !== lastHeight) {
			lastHeight = scroller.scrollHeight;
			readMetrics();
		}

		const top = scroller.scrollTop;
		const viewH = scroller.clientHeight;

		/* Yumuşak kaydırma sürerken okunan sayfayı KONUMDAN türetmiyoruz: yol
		   henüz yarıda ve türetilen sayfa hâlâ eskisi olurdu (bkz. `settleAt`).

		   ⚠️ ANKRAJ BURADA YAZILMIYOR — gerekçesi `onScroll`da. */
		if (Date.now() >= settleAt) current = indexAt(metrics, top, viewH);

		/* İlerleme çubuğu her zaman gerçek konumdan: o bir vaat değil, ölçüm. */
		percent = progressPercent(top, scroller.scrollHeight, viewH);

		/* Okurken bantlar sessizleşir, durunca geri gelir. */
		chrome = 'dim';
		clearTimeout(chromeTimer);
		chromeTimer = setTimeout(() => (chrome = 'on'), 900);
	}

	/* ==========================================================================
	   GEZİNME
	   ======================================================================= */

	function reducedMotion() {
		return (
			document.documentElement.dataset.motion === 'off' ||
			window.matchMedia('(prefers-reduced-motion: reduce)').matches
		);
	}

	/**
	 * Yumuşak kaydırma bitene kadar "okunan sayfa"yı kaydırma konumundan
	 * türetmeyi bırakacağımız an.
	 *
	 * NEDEN GEREKLİ: `scrollTo({behavior:'smooth'})` hemen bitmiyor. Okur arka
	 * arkaya iki kez aşağı bastığında ikinci basış, yol daha yarıdayken
	 * geliyordu; `current` hâlâ eski sayfayı gösterdiği için ikinci basış aynı
	 * sayfayı yeniden hedefliyor ve BOŞA GİDİYORDU. Uçtan uca testte 27 basış
	 * 10 sayfa ilerletiyordu — hızlı okuyanın tuşlarının üçte ikisi yutuluyor.
	 *
	 * Hedef bilindiği için `current`ı gezinme anında yazıyoruz; kaydırma
	 * konumunun sözü ancak animasyon oturunca geçerli oluyor. Süre tarayıcının
	 * kendi kaydırma süresine göre tahmin: `scrollend` olayı her yerde yok.
	 */
	let settleAt = 0;
	let settleTop = 0;

	/**
	 * Hesaplarda kullanılacak kaydırma konumu. Bir gezinme sürerken GERÇEK
	 * konum değil HEDEF konum geçerli — aynı sebeple: yarıda bir ölçüm, yarıda
	 * bir karar verdirir. Uzun (`fit: scroll`) sayfalarda üst üste basılan
	 * tuşların da birbirinin üstüne binmesini bu sağlıyor.
	 */
	function referenceTop(): number {
		return Date.now() < settleAt ? settleTop : (scroller?.scrollTop ?? 0);
	}

	function apply(step: Step, instant = false) {
		if (!scroller) return;
		const smooth = !instant && !reducedMotion();
		const top = step.kind === 'scroll' ? step.top : (metrics[step.index]?.top ?? 0);

		if (step.kind === 'page') {
			current = step.index;
			/* Ankraj gezinmeyle birlikte yazılıyor: yumuşak kaydırma sürerken
			   `update()` konumdan türetmeyi bıraktığı için (`settleAt`) tek
			   güncel kaynak burası. */
			anchorId = items[step.index]?.page.id ?? anchorId;
		}
		settleTop = top;
		settleAt = Date.now() + (smooth ? 500 : 50);

		/* `'instant'` — `'auto'` DEĞİL. `auto`, "elementin CSS'teki
		   `scroll-behavior`ına uy" demek ve `.pages` orada `smooth`
		   (`canvas.css:108`). Yani `instant = true` diye çağrılan gezinme
		   sessizce YUMUŞAK kalıyordu: karar JS'te veriliyor, uygulaması CSS'e
		   bırakılıyordu. Ölçüldü — mod değişimindeki konum düzeltmesi ~600 ms
		   süren bir süzülmeye dönüşüyor, okur yeni düzenin içinden geçtiğini
		   görüyordu; aşağıdaki effect'in "kaydırma ANİ" sözünün tam tersi.
		   İkinci kurban `prefers-reduced-motion` okuru: CSS `scroll-behavior`ı
		   o medya sorgusunda çevirmiyor (yalnız `[data-motion="off"]`
		   çeviriyor), yani `reducedMotion()` doğru karar verip kararını
		   uygulayamıyordu. İki değeri de açıkça yazmak ikisini de kapatıyor. */
		scroller.scrollTo({ top, behavior: smooth ? 'smooth' : 'instant' });
	}

	function goTo(index: number) {
		apply({ kind: 'page', index });
	}

	function next() {
		if (!scroller) return;
		apply(nextStep(metrics, current, referenceTop(), scroller.clientHeight));
	}

	function prev() {
		if (!scroller) return;
		apply(prevStep(metrics, current, referenceTop(), scroller.clientHeight));
	}

	/* ==========================================================================
	   KLAVYE
	   ======================================================================= */

	function onKey(event: KeyboardEvent) {
		if (inert) return;
		if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;

		/* Yazarken boşluk tuşu sayfa çevirmemeli. */
		const target = event.target as HTMLElement | null;
		if (target?.matches?.('input, textarea, select') || target?.isContentEditable) return;

		switch (event.key) {
			case 'ArrowDown':
			case 'PageDown':
			case ' ':
				event.preventDefault();
				next();
				break;
			case 'ArrowUp':
			case 'PageUp':
				event.preventDefault();
				prev();
				break;
			case 'Home':
				event.preventDefault();
				goTo(0);
				break;
			case 'End':
				event.preventDefault();
				goTo(total - 1);
				break;
		}
	}

	/* ==========================================================================
	   BAĞLANTILAR
	   ======================================================================= */

	$effect(() => {
		document.documentElement.dataset.issue = content.issue.slug;
	});

	$effect(() => {
		/* `items` değişince (okuma modu) yeniden ölç. */
		void items;
		readMetrics();
		measure();
		update();
	});

	/**
	 * KONUM KORUMA — mod değişince okur bıraktığı yerde kalıyor.
	 *
	 * Kendi effect'inde, çünkü tetikleyicisi akışın yeniden çizilmesi değil
	 * MODUN DEĞİŞMESİ: aynı modda yeniden ölçülmek okuru yerinden oynatmamalı.
	 * İlk koşu (`lastDepth === null`) montaj; orada korunacak bir yer yok.
	 *
	 * Kaydırma BİR KARE SONRA. Effect çalıştığında sayfalar DOM'dan yeni
	 * kalkmış oluyor ve tarayıcı hem düzeni hem kaydırma sınırını daha
	 * hesaplamamış; o anda verilen `scrollTo` kısalan belgeye sıkıştırılıp
	 * yutuluyordu (ölçüldü: 8390'a sürüldü, bir sonraki koşuda konum hâlâ
	 * 14486'ydı). Bir kare beklemek düzenin oturmasını garanti ediyor.
	 *
	 * Ankrajın karşılığı yeni akışta olmayabilir (okur `km-4`teyken `min`e
	 * geçerse o sayfa artık yok); `nearestVisible` en yakın görünür sayfayı
	 * veriyor ve kuralı orada yazılı. Karşılık yoksa hiç kıpırdamıyoruz:
	 * yanlış bir yere atlamaktansa olduğu yerde kalmak daha az zarar verir.
	 *
	 * Kaydırma ANİ: okur bir mod seçti, yeni düzenin içinden yumuşakça
	 * süzülmesini izlemek istemiyor.
	 */
	let lastDepth: Depth | null = null;

	$effect(() => {
		const next = depth;
		const previous = lastDepth;
		lastDepth = next;
		if (previous === null || previous === next || !anchorId) return;

		const target = nearestVisible(content, anchorId, next);
		if (!target) return;

		const frame = requestAnimationFrame(() => {
			readMetrics();
			const index = items.findIndex((item) => item.page.id === target);
			if (index >= 0) apply({ kind: 'page', index }, true);
		});
		return () => cancelAnimationFrame(frame);
	});

	/* Banttaki çipin sinyal çubukları ve sayfa düzeni buradan besleniyor
	   (`canvas.css` → `:root[data-depth="…"]`). */
	$effect(() => {
		document.documentElement.dataset.depth = depth;
	});

	$effect(() => {
		const onResize = () => {
			measure();
			readMetrics();
		};
		window.addEventListener('resize', onResize);
		window.visualViewport?.addEventListener('resize', onResize);
		return () => {
			window.removeEventListener('resize', onResize);
			window.visualViewport?.removeEventListener('resize', onResize);
		};
	});

	/**
	 * SAHNE TETİKLEME — giriş animasyonları.
	 *
	 * Sayfalar `data-inview="true"` doğuyor (bkz. Page.svelte'teki not: aksi
	 * hâlde JavaScript çalışmadığında dergi bomboş açılırdı). Buradaki iş
	 * sırayı KURMAK: ekranın altında kalanları gizle, sonra gözlemciye ver.
	 *
	 * IntersectionObserver yoksa hiçbir şey gizlenmiyor — animasyon kaybolur,
	 * içerik kalır. Prototip bu durumda gözlemciyi kurmadan çıkıyordu ve
	 * sayfalar "false"ta donuyordu; yani eski tarayıcıda dergi boştu.
	 *
	 * Eşik bilerek çok düşük: `fit: scroll` sayfalar tuvalden kat kat uzun
	 * olabiliyor, kesişim oranı yüksek bir eşiğe hiç ulaşmıyor. Sahne bir kez
	 * açılınca da KAPANMIYOR — bunlar tek seferlik açılışlar, geri kaydırınca
	 * içeriğin yeniden kaybolması hata olurdu.
	 */
	$effect(() => {
		if (!scroller || typeof IntersectionObserver === 'undefined') return;

		const fold = scroller.scrollTop + scroller.clientHeight;
		const els = [...scroller.querySelectorAll<HTMLElement>('.page')];
		for (const el of els) {
			if (el.offsetTop >= fold) el.dataset.inview = 'false';
		}

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) (entry.target as HTMLElement).dataset.inview = 'true';
				}
			},
			{ root: scroller, threshold: 0.02 }
		);
		for (const el of els) observer.observe(el);
		return () => observer.disconnect();
	});
</script>

<svelte:document onkeydown={onKey} />

<a class="skip-link" href="#pages">İçeriğe atla</a>

<div id="shell" data-letterbox={letterbox} data-chrome={chrome} {inert}>
	<header class="band band--top">
		<div class="band__center">
			<!--
				MOD ÇİPİ — okurun modunu görebildiği ve değiştirebildiği tek yer.
				Prototipte bir de menü vardı; o Faz 2+ ve gelmeden bu düğme
				olmasaydı seçim TEK YÖNLÜ olurdu: tanıtım "üç okuma derinliği"
				diye söz veriyor, seçici "istediğin an değiştirebilirsin" diyor
				ve okurun elinde hiçbir kapı olmuyordu.

				Çubuklar `canvas.css`'te `:root[data-depth]`ten doluyor.
			-->
			{#if ondepthclick}
				<button
					class="depth-chip"
					type="button"
					aria-haspopup="dialog"
					aria-label="Okuma modu: {depthName(depth)} — değiştir"
					onclick={ondepthclick}
				>
					<span class="depth-chip__bars" aria-hidden="true"><i></i><i></i><i></i></span>
					<!-- Görünen etiket yalnız ad: bant dar ve çip başlığın yanında
					     duruyor. "Okuma modu" bağlamı `aria-label`da; çubuklar da
					     zaten hangi kademede olduğumuzu gösteriyor. -->
					<span class="depth-chip__label">{depthName(depth)}</span>
				</button>
			{/if}
			<div class="band__issue">
				<span class="band__issue-no">{String(content.issue.number).padStart(2, '0')}</span>
				<span class="band__issue-name">{content.issue.title}</span>
			</div>
		</div>

		<div
			class="progress"
			role="progressbar"
			aria-label="Okuma ilerlemesi"
			aria-valuemin={0}
			aria-valuemax={100}
			aria-valuenow={Math.round(percent)}
		>
			<div class="progress__fill" style="width: {percent.toFixed(1)}%"></div>
		</div>
	</header>

	<main id="canvas" class="canvas" bind:this={canvasEl} aria-label="{content.issue.title} tuvali">
		<div id="pages" class="pages" bind:this={scroller} onscroll={onScroll} tabindex="-1">
			{#each items as item, i (item.page.id)}
				<Page section={item.section} page={item.page} index={i} {total} />
			{/each}
		</div>

		<div
			id="folio"
			class="folio"
			data-hidden={folioHidden}
			data-overlay={folioOverlay}
			aria-hidden="true"
		>
			<span id="folio-section">{page?.section.title ?? ''}</span>
			<span id="folio-page">
				{String(current + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
			</span>
		</div>
	</main>

	<footer class="band band--bottom">
		<div class="band__nav">
			<button
				class="band__btn"
				type="button"
				aria-label="Önceki sayfa"
				disabled={current === 0}
				onclick={prev}
			>
				<svg viewBox="0 0 24 24" class="icon" aria-hidden="true">
					<path d="M18 15l-6-6-6 6" />
				</svg>
			</button>
			<button
				class="band__btn"
				type="button"
				aria-label="Sonraki sayfa"
				disabled={current === total - 1}
				onclick={next}
			>
				<svg viewBox="0 0 24 24" class="icon" aria-hidden="true">
					<path d="M6 9l6 6 6-6" />
				</svg>
			</button>
		</div>
	</footer>
</div>
