<!--
	MODAL — perde + ortada duran kutu.

	`overlays.js`'in `O.modal`'ının karşılığı, ama YIĞIN YOK. Prototipte bir
	`openStack` vardı çünkü orada üst üste açılabilen yedi katman vardı (menü,
	thread, arşiv, keşfet…). 1.0'da tek bir modal var: mod seçici. Bugün
	kullanılmayan bir yığın yöneticisi yazmak, kullanıldığı gün yanlış olduğunu
	keşfedeceğimiz bir yığın yöneticisi yazmaktır — Canvas.svelte'in `goToId`
	için verdiği kararın aynısı.

	`closable: false` gerçek bir durum: ilk açılışta mod seçimi ATLANAMAZ, çünkü
	kapatılırsa geriye seçilmemiş bir mod kalır ve tuval neyi çizeceğini
	bilmez. O hâlde ne ✕ var, ne perdeye tıklama, ne Escape.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title,
		closable = true,
		onclose,
		children
	}: {
		title: string;
		closable?: boolean;
		onclose: () => void;
		children: Snippet;
	} = $props();

	let on = $state(false);
	let box = $state<HTMLElement | null>(null);

	function close() {
		if (!closable) return;
		on = false;
		setTimeout(onclose, reducedMotion() ? 0 : 240);
	}

	function reducedMotion() {
		return (
			document.documentElement.dataset.motion === 'off' ||
			window.matchMedia('(prefers-reduced-motion: reduce)').matches
		);
	}

	function onKey(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			close();
		}
	}

	$effect(() => {
		const id = requestAnimationFrame(() => (on = true));
		/* Odak kutunun İÇİNE giriyor: arkadaki tuval `inert` olsa bile odak
		   belgenin başında kalırsa sekme tuşu adres çubuğuna kaçar. */
		box?.querySelector<HTMLElement>('button, input, textarea, select')?.focus();
		return () => cancelAnimationFrame(id);
	});
</script>

<svelte:window onkeydown={onKey} />

<!-- Perde tıklanabilir bir KAPATMA yüzeyi; `closable` değilken sadece karartıyor.
     Klavye karşılığı Escape olduğu için ayrıca odaklanabilir olması gerekmiyor. -->
<div
	class="scrim"
	data-on={on}
	onclick={close}
	onkeydown={null}
	role="presentation"
	aria-hidden="true"
></div>

<div class="modal-host" data-on={on}>
	<div class="modal" bind:this={box} role="dialog" aria-modal="true" aria-label={title}>
		<header class="modal__head">
			<h2 class="modal__title">{title}</h2>
			{#if closable}
				<button class="modal__x" type="button" aria-label="Kapat" onclick={close}>✕</button>
			{/if}
		</header>
		{@render children()}
	</div>
</div>
