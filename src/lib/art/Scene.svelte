<!--
	SAHNE DAĞITICISI — ad → bileşen.

	`Block.svelte` ile aynı kalıp: sonda `bilinmeyenSahne(name: never)` var, yani
	`SCENE_NAMES`'e bir ad eklenip buraya dal yazılmazsa `pnpm check` kırılıyor.
	Prototipin sessiz `paper` yedeği bilerek yok — yazım hatası olan bir sahne
	adının cezası "boş bir kâğıt sayfa" olmamalı.
-->
<script lang="ts">
	import type { SceneName } from './scenes';
	import Leaves from './Leaves.svelte';
	import Paper from './Paper.svelte';
	import Portrait from './Portrait.svelte';
	import Street from './Street.svelte';
	import Sumi from './Sumi.svelte';
	import Torii from './Torii.svelte';
	import Waves from './Waves.svelte';

	let { name }: { name: SceneName } = $props();

	/** Kayıtlı her sahnenin bir dalı olmak zorunda — kanıtı `never`. */
	function bilinmeyenSahne(name: never): never {
		throw new Error(`Kayıtsız sahne: ${String(name)}`);
	}
</script>

{#if name === 'leaves'}
	<Leaves />
{:else if name === 'paper'}
	<Paper />
{:else if name === 'portrait'}
	<Portrait />
{:else if name === 'street'}
	<Street />
{:else if name === 'sumi'}
	<Sumi />
{:else if name === 'torii'}
	<Torii />
{:else if name === 'waves'}
	<Waves />
{:else}
	{bilinmeyenSahne(name)}
{/if}
