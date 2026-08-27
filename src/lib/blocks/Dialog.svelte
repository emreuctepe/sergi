<!--
	Söyleşi replikası — "BALON" düzeni.

	Eski hâli sekiz sayfa boyunca aynıydı: yuvarlak "S"/"K" rozeti, soru sans,
	cevap serif, altında görsel. Sohbet dökümü gibi duruyordu, dergi sayfası
	gibi değil. /dev/soylesi'de sekiz aday yan yana çizildi; kazanan 3 numara
	(karar: kullanıcı seçimi) ve o aday buraya taşındı.

	Fikir: röportajın konusu MANGACI, sayfa da öyle konuşuyor.
	  soru  → çizimin üstüne binen Anime Ace konuşma balonu (kuyruğu kareye bakar)
	  cevap → balonun tersi: köşeli, konturlu manga ANLATI kutusu

	Rozet öldü. Cevapta ad artık baş harf değil, kutunun tepesinde tam hâliyle
	yazıyor — anlatı kutusunun künyesi gibi. Soruda ise hiçbir işaret yok:
	balonun kendisi zaten "bu bir soru" diyor.

	⚠️ Stil neden burada, `blocks.css`'te değil: o dosya prototiple BAYT BAYT
	eşit tutuluyor (src/lib/styles/parity.test.ts → MIRRORED) ve prototipte bu
	tasarım yok. Figure.svelte ve PageBackground.svelte de aynı gerekçeyle kendi
	kapsamlı stilini taşıyor (karar 1.40).

	Buradaki kurallar blocks.css'teki `.dialog` kurallarını EZİYOR ve bu
	tesadüf değil: app.css'in katman beyanı gereği katmansız CSS her zaman
	kazanır, yani bileşen kendi görünümünün son sözünü söyler. Eski iki sütunlu
	ızgara (`grid-template-columns: auto 1fr`) bu yüzden aşağıda `display: block`
	ile kapatılıyor — rozet sütunu artık yok.

	Balonun ÇİZİMLE ÖRTÜŞMESİ burada değil, Page.svelte'de: örtüşme iki ayrı
	bloğun (dialog + figure) birbirine göre yerleşmesi demek ve o ikisini aynı
	ızgara gözünde buluşturan tek yer sayfa.
-->
<script lang="ts">
	import type { DialogBlock } from '$lib/content/types';
	import type { BlockAttrs } from './attrs';
	import Inline from './Inline.svelte';

	let { block, ...attrs }: { block: DialogBlock } & BlockAttrs = $props();

	const isQuestion = $derived(block.who === 'q');
</script>

<div {...attrs} class={['dialog', isQuestion ? 'dialog--q' : 'dialog--a', attrs.class]}>
	{#if !isQuestion && block.name}<span class="dialog__name">{block.name}</span>{/if}
	<p class="dialog__text"><Inline text={block.text} /></p>
</div>

<style>
	/* ======================================================================
	   SORU / CEVAP ÖLÇEĞİ
	   ----------------------------------------------------------------------
	   Soru %10 küçüldü, cevap %25 büyüdü (adaylar yan yanayken verilen karar).
	   İki çarpan olarak duruyorlar, dört ayrı `font-size` olarak değil: oran
	   yeniden ayarlanacaksa BURASI değişir, aşağıdaki kurallar değil.
	   =================================================================== */
	.dialog {
		--soru-olcek: 0.9;
		--cevap-olcek: 1.25;

		/* blocks.css'in rozet + metin ızgarasını kapat: rozet sütunu kalmadı. */
		display: block;
	}

	/* ======================================================================
	   SORU — konuşma balonu
	   ----------------------------------------------------------------------
	   Sağdan fazladan boşluk bilerek: balon sayfayı baştan sona kaplarsa
	   kutuya benzer. Asimetri onu "konuşma" yapan şeylerden biri.

	   Anime Ace'te UZUN TİRE YOK (tokens.css'teki nota bak). Metin içerikten
	   geliyor ve tire içerebilir; `--font-manga` zaten yedekli bir yığın
	   (Anime Ace → Comic Sans → arayüz fontu), eksik glif oradan karşılanıyor.
	   =================================================================== */
	.dialog--q {
		position: relative;
		margin-right: calc(var(--pad-page) * 0.6);
		padding: var(--sp-3) var(--sp-4);
		border-radius: 3.2cqi;
		background: var(--paper-raised);
		box-shadow: var(--shadow-2);
	}

	.dialog--q .dialog__text {
		font-family: var(--font-manga);
		font-size: calc(var(--fs-xs) * var(--soru-olcek));
		line-height: var(--lh-snug);
		color: var(--ink);
		text-wrap: pretty;
	}

	/* Kuyruk: sola yatık üçgen, balonun alt kenarından kareye doğru. Balon
	   çizimin ALTINA taşıyor (bkz. Page.svelte `--balon-tasma`), kuyruk da
	   onun altından çıkıyor — yani üçgen boşluğa değil, resme işaret ediyor. */
	.dialog--q::after {
		content: '';
		position: absolute;
		left: 8cqi;
		bottom: -2.6cqi;
		border-inline: 2.4cqi solid transparent;
		border-top: 3cqi solid var(--paper-raised);
	}

	/* ======================================================================
	   CEVAP — manga anlatı kutusu
	   ----------------------------------------------------------------------
	   Balonun tersi: yuvarlak değil köşeli, gölgeli değil konturlu, kâğıdın
	   üstünde yükselmiyor onun içine oyuluyor. İki ses birbirine benzemesin.
	   =================================================================== */
	.dialog--a {
		padding: var(--sp-3) var(--sp-4);
		border: 0.4cqi solid var(--ink);
		background: var(--paper);
	}

	.dialog__name {
		display: block;
		margin-bottom: var(--sp-2);
		font-family: var(--font-manga);
		font-size: var(--fs-2xs);
		letter-spacing: 0.04em;
		color: var(--accent);
	}

	.dialog--a .dialog__text {
		font-family: var(--font-text);
		font-size: calc(var(--fs-sm) * var(--cevap-olcek));
		line-height: var(--lh-body);
		text-wrap: pretty;
	}
</style>
