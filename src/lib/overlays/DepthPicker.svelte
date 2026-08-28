<!--
	OKUMA MODU SEÇİMİ — üç kart, her birinde gerçek süre ve gerçek sayfa sayısı.

	`overlays.js`'in `openDepthPicker`'ının karşılığı. Kartların metni
	`depths.ts`'te ve neden prototipten farklı olduğu da orada yazılı.

	İki kılıkta açılıyor:
	  · İLK SEÇİM   — tanıtımdan hemen sonra, KAPATILAMAZ. Kapatılabilseydi
	                  geriye seçilmemiş bir mod kalırdı.
	  · DEĞİŞTİRME  — banttaki çipten. Kapatılabilir ve okur yerini kaybetmiyor
	                  (konum koruma Canvas.svelte'te).

	Rakamlar buraya YAZILMIYOR, sayılıyor: `flow()` sayfa sayısını,
	`estimateMinutes()` süreyi veriyor. İçerik değişirse kartlar da değişir —
	elle yazılmış bir "~14 dk" bir gün sessizce yalan olurdu.

	⚠️ `.depth-card[data-done]` (altın zemin) CSS'te var ama BURADA YOK: onu
	besleyen "bu modu bitirdin" bilgisi Faz 5'in işi (streak). Veriyi
	uydurmaktansa kuralı kullanılmamış bırakıyoruz.
-->
<script lang="ts">
	import { estimateMinutes, flow } from '$lib/content/flow';
	import type { Depth, IssueContent } from '$lib/content/types';
	import { DEPTH_CARDS } from './depths';

	let {
		content,
		current,
		onchoose
	}: {
		content: IssueContent;
		/** Seçili mod — ilk açılışta henüz yok. */
		current: Depth | null;
		onchoose: (depth: Depth) => void;
	} = $props();

	const cards = $derived(
		DEPTH_CARDS.map((card) => {
			const items = flow(content, card.id);
			return { ...card, pages: items.length, minutes: estimateMinutes(items) };
		})
	);
</script>

<div class="depth-pick">
	<p class="depth-pick__intro">
		{current
			? 'İstediğin an değiştirebilirsin — okuduğun yeri kaybetmezsin.'
			: 'Bu sayıyı nasıl okumak istersin?'}
	</p>

	{#each cards as card (card.id)}
		<button
			class="depth-card"
			type="button"
			data-mod={card.id}
			data-active={card.id === current ? 'true' : null}
			aria-pressed={card.id === current}
			onclick={() => onchoose(card.id)}
		>
			<span class="depth-card__icon" aria-hidden="true">{card.icon}</span>
			<span class="depth-card__main">
				<b>{card.name}</b>
				<span class="depth-card__line">{card.line}</span>
				<span class="depth-card__detail">{card.detail}</span>
			</span>
			<span class="depth-card__meta">
				<b>~{card.minutes} dk</b>
				<span>{card.pages} sayfa</span>
			</span>
		</button>
	{/each}
</div>
