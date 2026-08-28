<!--
	YÜKLEME EKRANI — yüzde ve altında bir satır. Başka hiçbir şey.

	⚠️ BU KATMAN ÖNCEDEN ÇİZİLEN HTML'İN İÇİNDE. Rotanın kendisi prerender
	ediliyor (karar 1.36), yani okur JS gelmeden önce de bir şey görüyor: tam
	sayfa, fontsuz ve görselsiz. Tanıtım ve mod seçici bu sorunu yaşamıyor
	çünkü onlar okura GÖRE değişiyor ve montajdan sonra açılıyorlar — bu ekran
	ise herkes için aynı, o yüzden `hazir` başlangıçta `false` ve katman
	statik HTML'e basılıyor. Montajdan sonra açılsaydı okur önce kırık sayıyı,
	sonra onu örten bir yükleme ekranını görürdü; yani düzeltmeye çalıştığımız
	şeyi bir kez daha gösterirdik.

	⚠️ JS ÇALIŞMAZSA BU KATMAN KALKMAZ — kaldıran kod JS. `<noscript>` kuralı
	o yüzden var: betik yoksa ekran hiç çizilmiyor ve okur en azından önceden
	çizilmiş sayıya bakabiliyor. Onsuz JS'siz bir tarayıcıda dergi sonsuza
	kadar "0%" derdi.

	Stil `overlays.css`'e YAZILMADI, bileşenin kapsamlı `<style>`ına girdi:
	o dosya prototiple bayt bayt aynı ve tek bir katman için parite güvencesini
	kaybetmeye değmez (1.40/1.43/1.47/1.49'un aynısı).
-->
<script lang="ts">
	import { gorselYollari } from '$lib/content/assets';
	import type { IssueContent } from '$lib/content/types';
	import { onYukle, SABIR_SINIRI, SATIR_SURESI, YUKLEME_SATIRLARI } from './yukleme';

	let { content, ondone }: { content: IssueContent; ondone: () => void } = $props();

	let yuzde = $state(0);
	let satir = $state(0);
	/* Çıkış animasyonu için: yüzde 100 olunca katman soluyor, sonra kalkıyor. */
	let cikiyor = $state(false);

	function azHareket() {
		return (
			document.documentElement.dataset.motion === 'off' ||
			window.matchMedia('(prefers-reduced-motion: reduce)').matches
		);
	}

	function bitir() {
		if (cikiyor) return;
		cikiyor = true;
		/* Okur BEKLETİLMİYOR: hazırsa hazır. Buradaki 200 ms bir gecikme değil,
		   katmanın solma süresi — sayı zaten arkada duruyor ve etkileşime
		   açılmadan önce yalnızca perde kalkıyor. */
		setTimeout(ondone, azHareket() ? 0 : 200);
	}

	$effect(() => {
		const yollar = gorselYollari(content);

		const dur = onYukle(yollar, ({ toplam, biten }) => {
			yuzde = Math.round((biten / toplam) * 100);
			if (biten >= toplam) bitir();
		});

		/* Bir dosya ne yüklenir ne hata verirse (askıda kalan bağlantı) okur
		   burada süresiz kalırdı. Sınır dolunca sayı olduğu yüzdede bırakılıp
		   dergi açılıyor: eksik görsel, kilitli okurdan iyidir. */
		const sinir = setTimeout(bitir, SABIR_SINIRI);

		const tik = setInterval(() => {
			/* Son satırda duruyor, başa sarmıyor: liste bir şakanın sırası ve
			   döngüye girseydi "postacı koşuyor" sonrası yine baskıya dönerdi. */
			satir = Math.min(satir + 1, YUKLEME_SATIRLARI.length - 1);
		}, SATIR_SURESI);

		return () => {
			dur();
			clearTimeout(sinir);
			clearInterval(tik);
		};
	});
</script>

<svelte:head>
	<noscript>
		<style>
			#loader {
				display: none !important;
			}
		</style>
	</noscript>
</svelte:head>

<div id="loader" class="loader" data-cikiyor={cikiyor} role="status" aria-live="polite">
	<!-- `aria-label` yüzdeyi tek parça okutuyor: işaretteki "%" ayrı bir düğüm
	     ve ekran okuyucu onu "yüzde elli" değil "elli yüzde" diye söylerdi. -->
	<p class="loader__pct" aria-label="%{yuzde} yüklendi">
		<span aria-hidden="true">%{yuzde}</span>
	</p>
	<p class="loader__line">{YUKLEME_SATIRLARI[satir]}</p>
</div>

<style>
	.loader {
		position: fixed;
		inset: 0;
		z-index: 90;

		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--ui-sp-3);

		background: var(--backdrop);
		color: var(--on-backdrop);

		opacity: 1;
		transition: opacity 200ms ease-out;
	}

	.loader[data-cikiyor='true'] {
		opacity: 0;
	}

	.loader__pct {
		margin: 0;
		font-family: var(--font-display);
		font-size: clamp(44px, 12vmin, 92px);
		line-height: var(--lh-tight);
		letter-spacing: var(--tracking-tight);
		/* Rakamlar eşit genişlikte: onsuz sayı her artışta hafifçe kayıyor ve
		   sabit durması gereken tek şey oynuyor. */
		font-variant-numeric: tabular-nums;
	}

	.loader__line {
		margin: 0;
		font-family: var(--font-ui);
		font-size: var(--ui-fs-sm);
		letter-spacing: var(--tracking-wide);
		/* Satır ikinci planda: yüzde ölçüm, bu yalnızca eşlik. */
		opacity: 0.62;
		text-align: center;
		padding-inline: var(--ui-sp-5);
	}

	@media (prefers-reduced-motion: reduce) {
		.loader {
			transition: none;
		}
	}
</style>
