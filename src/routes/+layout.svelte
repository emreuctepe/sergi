<script lang="ts">
	import '../app.css';
	import { brand, pageTitle } from '$lib/brand';

	let { children } = $props();
</script>

<svelte:head>
	<title>{pageTitle()}</title>
	<meta name="description" content={brand.tagline} />
	<meta name="theme-color" content={brand.themeColor} />
</svelte:head>

{@render children()}
