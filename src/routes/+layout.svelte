<script lang="ts">
	import '../app.css';
	/* `import` edilen varlık derleyiciden hash'li çıkıyor → bir yıllık
	   `immutable` önbellek. `app.html`e elle yazılsaydı dosyanın `static/`te
	   durması gerekirdi (bkz. oradaki not). */
	import favicon from '$lib/assets/favicon.svg';
	import { brand, pageTitle } from '$lib/brand';

	let { children } = $props();
</script>

<svelte:head>
	<title>{pageTitle()}</title>
	<link rel="icon" href={favicon} />
	<meta name="description" content={brand.tagline} />
	<meta name="theme-color" content={brand.themeColor} />
</svelte:head>

{@render children()}
