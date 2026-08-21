<!--
	Başlığın üstündeki küçük etiket: "Sunuş", "Dosya".
	Satır içi biçimleme YOK — prototipte de `text` olarak basılıyordu; bir
	etikette kalın/italik olması gereken bir şey olmaz.
-->
<script lang="ts">
	import type { KickerBlock } from '$lib/content/types';
	import type { BlockAttrs } from './attrs';

	let { block, ...attrs }: { block: KickerBlock } & BlockAttrs = $props();
</script>

<p {...attrs} class={['kicker', attrs.class]}>{block.text}</p>
