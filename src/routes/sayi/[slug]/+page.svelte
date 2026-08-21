<script lang="ts">
	import Canvas from '$lib/canvas/Canvas.svelte';
	import { brand } from '$lib/brand';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const issue = $derived(data.content.issue);
</script>

<svelte:head>
	<title>{issue.title} · {brand.name}</title>
	<meta name="description" content={issue.subtitle} />
</svelte:head>

<Canvas content={data.content} />
