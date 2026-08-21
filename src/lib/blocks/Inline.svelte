<!--
	Satır içi biçimli metin. `{@html}` YOK: jetonlar Svelte'in kendi kaçırmasıyla
	basılıyor, yani aynı bileşen Faz 3'te okur yorumlarına da güvenle bakabilir.
	Etiketler arasında boşluk bırakmak yasak — şablondaki her yeni satır sayfada
	görünen bir boşluğa dönüşür.
-->
<script lang="ts">
	import { inline } from './inline';

	let { text }: { text: string } = $props();

	const tokens = $derived(inline(text));
</script>

<!--
	`no-navigation-without-resolve` kapalı: bu bağlar SAYININ İÇİNE değil dışarı
	gider (kaynak, lisans, video). Adresin gerçekten dış adres olduğunu
	`validate.ts`'teki `linkProblems` denetliyor — kural burada susturuluyor
	ama garanti ortadan kalkmıyor, içerik doğrulamasına taşınıyor.
-->
<!-- eslint-disable svelte/no-navigation-without-resolve -->
<!-- prettier-ignore -->
{#each tokens as token, i (i)}{#if token.k === 'strong'}<strong>{token.text}</strong>{:else if token.k === 'em'}<em>{token.text}</em>{:else if token.k === 'code'}<code>{token.text}</code>{:else if token.k === 'link'}<a href={token.href} target="_blank" rel="noopener">{token.text}</a>{:else}{token.text}{/if}{/each}
