<!--
	SAHNE DAĞITICISI — ad → bileşen.

	`Block.svelte` ile aynı kalıp: sonda `bilinmeyenSahne(name: never)` var, yani
	`SCENE_NAMES`'e bir ad eklenip buraya dal yazılmazsa `pnpm check` kırılıyor.
	Prototipin sessiz `paper` yedeği bilerek yok — yazım hatası olan bir sahne
	adının cezası "boş bir kâğıt sayfa" olmamalı.
-->
<script lang="ts">
	import type { SceneName } from './scenes';
	import Paper from './Paper.svelte';
	import Portrait from './Portrait.svelte';
	import Sumi from './Sumi.svelte';

	let { name }: { name: SceneName } = $props();

	/** Kayıtlı her sahnenin bir dalı olmak zorunda — kanıtı `never`. */
	function bilinmeyenSahne(name: never): never {
		throw new Error(`Kayıtsız sahne: ${String(name)}`);
	}
</script>

{#if name === 'paper'}
	<Paper />
{:else if name === 'portrait'}
	<Portrait />
{:else if name === 'sumi'}
	<Sumi />
{:else}
	{bilinmeyenSahne(name)}
{/if}
