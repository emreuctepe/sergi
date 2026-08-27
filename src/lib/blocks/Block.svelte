<!--
	BLOK DAĞITICI — `render.js`'in BLOCKS nesnesinin Svelte karşılığı.

	Neden nesne değil de `{#if}` zinciri: TypeScript ayrımlı birliği ancak
	dallanmayla daraltıyor — her dalda `block` gerçekten o tipe iniyor ve
	bileşenler tam tipli prop alıyor. Zincirin sonundaki `bilinmeyenTip()`
	kapsam denetimi: `types.ts`'e yeni bir tip eklenip buraya yazılmazsa
	`pnpm run check` kırılır. Prototipte aynı durumda konsola bir uyarı basılıp
	blok SESSİZCE atlanıyordu — sayfada eksik bir paragraf, hiçbir yerde hata.

	Sarmalayıcı öznitelikler (`.blk`, `--i`, ankraj kimliği) burada hesaplanıp
	bloğun kök öğesine YAYILIYOR — sarmalayıcı bir <div> koyulamaz, çünkü CSS
	`.page__inner > .blk + .blk` gibi doğrudan-çocuk seçicileri kullanıyor
	(bkz. attrs.ts).

	Dört bileşen `block` almıyor (`rule`, `puzzleSlots`, `cover`, `outro`):
	o blokların verisi yok. Boş bir prop geçip kullanmamak yerine hiç geçmiyoruz
	— çağrı yerindeki `{...attrs}` tek başına "bu bloğun okunacak alanı yok"
	diyor.
-->
<script lang="ts">
	import type { Block } from '$lib/content/types';
	import type { BlockAttrs } from './attrs';
	import Byline from './Byline.svelte';
	import Caption from './Caption.svelte';
	import Cover from './Cover.svelte';
	import Dialog from './Dialog.svelte';
	import Figure from './Figure.svelte';
	import H1 from './H1.svelte';
	import H2 from './H2.svelte';
	import H3 from './H3.svelte';
	import Kicker from './Kicker.svelte';
	import Lead from './Lead.svelte';
	import List from './List.svelte';
	import Manga from './Manga.svelte';
	import Note from './Note.svelte';
	import Outro from './Outro.svelte';
	import Paragraph from './Paragraph.svelte';
	import Pull from './Pull.svelte';
	import PuzzleSlots from './PuzzleSlots.svelte';
	import Quote from './Quote.svelte';
	import Rule from './Rule.svelte';
	import Stat from './Stat.svelte';

	let { block, index }: { block: Block; index: number } = $props();

	/**
	 * Zincirin sonundaki imkânsız dal. Bütün tipler karşılandıysa buraya düşen
	 * `block`un tipi `never`dır ve bu çağrı derlenir; `types.ts`'e yeni bir tip
	 * eklenip zincire yazılmazsa argüman tipi tutmaz ve `pnpm run check` kırılır.
	 */
	function bilinmeyenTip(block: never): never {
		throw new Error(`Blok tipi karşılanmadı: "${(block as Block).t}".`);
	}

	const attrs: BlockAttrs = $derived({
		class: block.invert ? 'blk blk--invert' : 'blk',
		style: `--i: ${index}`,
		'data-block-id': block.id,
		'data-block-kind': block.t
	});
</script>

{#if block.t === 'kicker'}
	<Kicker {block} {...attrs} />
{:else if block.t === 'h1'}
	<H1 {block} {...attrs} />
{:else if block.t === 'h2'}
	<H2 {block} {...attrs} />
{:else if block.t === 'h3'}
	<H3 {block} {...attrs} />
{:else if block.t === 'lead'}
	<Lead {block} {...attrs} />
{:else if block.t === 'p'}
	<Paragraph {block} {...attrs} />
{:else if block.t === 'pull'}
	<Pull {block} {...attrs} />
{:else if block.t === 'quote'}
	<Quote {block} {...attrs} />
{:else if block.t === 'note'}
	<Note {block} {...attrs} />
{:else if block.t === 'caption'}
	<Caption {block} {...attrs} />
{:else if block.t === 'figure'}
	<Figure {block} {...attrs} />
{:else if block.t === 'rule'}
	<Rule {...attrs} />
{:else if block.t === 'byline'}
	<Byline {block} {...attrs} />
{:else if block.t === 'stat'}
	<Stat {block} {...attrs} />
{:else if block.t === 'list'}
	<List {block} {...attrs} />
{:else if block.t === 'dialog'}
	<Dialog {block} {...attrs} />
{:else if block.t === 'manga'}
	<Manga {block} {...attrs} />
{:else if block.t === 'puzzleSlots'}
	<PuzzleSlots {...attrs} />
{:else if block.t === 'cover'}
	<Cover {...attrs} />
{:else if block.t === 'outro'}
	<Outro {...attrs} />
{:else}
	{bilinmeyenTip(block)}
{/if}
