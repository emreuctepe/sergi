/* ============================================================================
   İÇERİK TİPLERİ — Issue → Section → Page[] → Block[]
   ----------------------------------------------------------------------------
   Bir sayının tüm şekli burada. `src/content/<slug>/` altındaki dosyalar bu
   tiplere göre yazılır; derleyici yerine TypeScript doğrular.

   Neden Markdown derleyicisi yok: 1.0'da tek sayı var ve o sayı yazılmış
   durumda. Derleyici yazmak, olmayan bir ikinci sayı için altyapı kurmak
   olurdu (bkz. docs/BUILD-TODO.md "Kilitlenmiş kararlar"). Bu dosya o
   derleyicinin ÇIKTI sözleşmesi: 2. sayıda Markdown gelirse üreteceği şey
   aynen budur, tüketen kod değişmez.

   BLOK KİMLİĞİ (docs/YORUM-SISTEMI.md §2.1)
   Prototipte kimlik çizim anında türetiliyordu (`page.id + ":" + i`) — yani
   bir blok yer değiştirirse ona bağlı bütün yorumlar sessizce başka bir
   paragrafa taşınıyordu. Burada kimlik VERİDİR: her blok kendi `id`'sini
   taşır ve içerik düzenlenirken elle korunur. Biçim aynı kalıyor
   (`sayfaId:index`) ki prototipte yazılmış ankrajlar geçerliliğini korusun.
   ========================================================================= */

import type { SceneName } from '$lib/art/scenes';

/* ==========================================================================
   TEMEL BİRİMLER
   ======================================================================= */

/** Yorum ankrajının dayanağı. Biçim: `sayfaId:index` → `km-1:3`. */
export type BlockId = string;

/** Liste satırı, manga karesi gibi tek tek yorumlanabilen alt birimler. */
export type SubBlockId = `${BlockId}.${number}`;

/** Okuma derinlikleri — sıra "az"dan "çok"a. */
export const DEPTHS = ['min', 'mid', 'full'] as const;
export type Depth = (typeof DEPTHS)[number];

/** Bir sayfanın hangi derinliklerde akışa gireceği. `all` = üçünde de. */
export type PageDepth = readonly (Depth | 'all')[];

/**
 * Sayfa arka planı — iki kaynak:
 *   `scene:sumi`                      → `src/lib/art/` altındaki SVG sahne
 *   `img:assets/2026-09/tren.webp`    → `static/` altındaki gerçek dosya
 *
 * Sahne adı `string` DEĞİL `SceneName`: prototipte `A.scene()` bilinmeyen adı
 * sessizce `paper`e düşürüyordu, yani `scene:tori` yazım hatası boş bir kâğıt
 * sayfa üretir ve kimse fark etmezdi. Artık yazım hatası derleme hatası.
 *
 * Üçüncü bir kaynak vardı — `photo:101`, `art.js`'in tohumdan ürettiği soyut
 * şekiller. 1e'de kaldırıldı: tek kullanıcısı "Gece Hattı"nın çekilmemiş üç
 * karesiydi ve o sayfalar sayıdan düştü (tools/tasi-icerik.mjs → DUSEN_SAYFALAR).
 *
 * `img:` yolu prototiptekiyle birebir aynı bırakıldı: dosyalar `static/assets/`
 * altına konur, URL `/assets/2026-09/tren.webp` olur. `assets/` önekini atıp
 * sayı klasörünü köke çıkarmak `/2026-09` rotasıyla kavram olarak çakışırdı.
 */
export type Background = `scene:${SceneName}` | `img:${string}`;

/** Sayfa içeriği tuvale sığar mı, yoksa kendi içinde kayar mı? */
export type Fit = 'contain' | 'scroll';

/** `full` = arka plan kenarlara taşar, içerik onun üstünde yüzer. */
export type Bleed = 'none' | 'full';

/** Sayfa girişindeki geçiş. CSS `[data-scene]` ile eşleşir. */
export type Transition =
	'none' | 'fade-up' | 'mask-wipe' | 'parallax' | 'stagger' | 'signature' | 'panel-reveal';

/** Sayfanın türü — verilmezse bölümün `type`'ı kullanılır. */
export type PageKind =
	'cover' | 'opener' | 'figure' | 'photo' | 'signature' | 'puzzle' | 'manga' | 'outro';

/** Bölüm türü — hem düzeni hem de içindekiler listesindeki rozeti belirler. */
export type SectionType =
	'cover' | 'article' | 'gallery' | 'interview' | 'list' | 'puzzle' | 'manga' | 'outro';

/* ==========================================================================
   BLOKLAR
   --------------------------------------------------------------------------
   20 tip. Ayrım `t` alanından: `switch (block.t)` yazan her yer TypeScript
   tarafından tam kapsam denetimine girer — yeni tip ekleyip bir yerde
   unutmak derleme hatası olur.

   ⚠️ Prototipte iki tip daha var: `term` (terminal kaydı) ve `rtlhint`.
   İkisi de yalnızca 2026-10'a ait; 1.0'da tek sayı yayınlandığı için
   bilerek taşınmadılar. Sayı 04'te buraya iki satır eklenecek.
   ======================================================================= */

/** Her bloğun taşıdığı ortak alanlar. */
interface BlockBase {
	/** Yorum ankrajı. Benzersiz ve KALICI — blok taşınsa da değişmez. */
	id: BlockId;
	/** Koyu arka plana oturan sayfalarda metni ters çevirir (`bleed: full`). */
	invert?: boolean;
}

/** Başlığın üstündeki küçük etiket: "Sunuş", "Dosya". */
export interface KickerBlock extends BlockBase {
	t: 'kicker';
	text: string;
}

export interface H1Block extends BlockBase {
	t: 'h1';
	text: string;
	/** Açılış sayfalarındaki dev punto. */
	big?: boolean;
}

export interface H2Block extends BlockBase {
	t: 'h2';
	text: string;
}

export interface H3Block extends BlockBase {
	t: 'h3';
	text: string;
}

/** Yazının giriş paragrafı — gövdeden bir punto büyük. */
export interface LeadBlock extends BlockBase {
	t: 'lead';
	text: string;
}

export interface ParagraphBlock extends BlockBase {
	t: 'p';
	text: string;
	/** İlk harf büyütülür (drop cap). Yazı başına bir tane. */
	drop?: boolean;
}

/** Metinden çekilip büyütülen cümle. */
export interface PullBlock extends BlockBase {
	t: 'pull';
	text: string;
	big?: boolean;
}

export interface QuoteBlock extends BlockBase {
	t: 'quote';
	text: string;
	/** Kaynak kişi. */
	by?: string;
}

/** Küçük puntolu editör notu. */
export interface NoteBlock extends BlockBase {
	t: 'note';
	text: string;
}

/** Görsel altı yazısı. */
export interface CaptionBlock extends BlockBase {
	t: 'caption';
	text: string;
}

/**
 * Metnin altına oturan tek görsel. Yol kökü `Background`'daki `img:` ile aynı
 * (`assets/2026-09/…`), yani aynı dosyalar, aynı AVIF türevleri.
 *
 * Neden `bg: 'img:…'` yetmedi: o görseli SAYFANIN TAMAMINA seriyor ve metin
 * üstünde yüzüyor. Söyleşinin istediği şey bunun tersi — soru-cevap okunur,
 * altında görsel durur. Kaydırılan bir sayfada arka plan bunu yapamaz.
 *
 * `alt` isteğe bağlı değil: `manga` karesinde de zorunlu ve orada da
 * doğrulayıcı ısırıyor (validate.ts). Erişilebilirlik borcu sonra kapanmıyor.
 */
export interface FigureBlock extends BlockBase {
	t: 'figure';
	img: string;
	alt: string;
	/** Görsel altı yazısı — verilmezse hiç basılmaz. */
	caption?: string;
}

/** Süs çizgisi. İçerik taşımaz ama kendi kimliği vardır (yorumlanabilir). */
export interface RuleBlock extends BlockBase {
	t: 'rule';
}

/** Yazar satırı: ad · rol · süre. */
export interface BylineBlock extends BlockBase {
	t: 'byline';
	author: string;
	role?: string;
	minutes?: number;
}

/** Rakam üçlüsü. `v` değer, `k` etiket. */
export interface StatBlock extends BlockBase {
	t: 'stat';
	items: readonly { v: string; k: string }[];
}

/** Sözlük satırı — `term` başlık, `def` tanım. */
export interface DictItem {
	term: string;
	def: string;
}

/**
 * Liste. Üç biçim: madde, numara, sözlük. Sözlük biçimi ayrı bir öğe şekli
 * kullandığı için birlik burada da ikiye ayrılıyor.
 */
export type ListBlock =
	| (BlockBase & { t: 'list'; style: 'dict'; items: readonly DictItem[] })
	| (BlockBase & { t: 'list'; style?: 'bullet' | 'num'; items: readonly string[] });

/** Söyleşi replikası. `q` soru, `a` cevap. */
export interface DialogBlock extends BlockBase {
	t: 'dialog';
	who: 'q' | 'a';
	text: string;
	/** Cevaplayanın adı — baş harfi rozete basılır. */
	name?: string;
}

/* --- manga ---------------------------------------------------------------- */

/** Balonun serbest yerleşimi. Değerler CSS uzunluğu (`"16%"`, `"-6%"`). */
export interface BubblePosition {
	top?: string;
	right?: string;
	bottom?: string;
	left?: string;
	width?: string;
}

export interface MangaBubble {
	text: string;
	/** `think` düşünce balonu, `narrate` kadraj dışı ses. */
	kind?: 'think' | 'narrate';
	/** `alt` hazır alt konum; nesne verilirse serbest yerleşim. */
	at?: 'alt' | BubblePosition;
}

export interface MangaPanel {
	/** Gerçek kare dosyası — `Background`'daki `img:` ile aynı kök. */
	img?: string;
	alt?: string;
	/** `img` yoksa art.ts'teki hazır karelerden biri (indeks). */
	art?: number;
	text?: readonly MangaBubble[];
}

/** Sayfanın köşesindeki stüdyo filigranı — dokununca kaynağa götürür. */
export interface MangaMark {
	label: string;
	note?: string;
	href?: string;
	/** Pop-up'taki düğme metni. Varsayılan: "YouTube Shorts'ta izle". */
	action?: string;
	/** Logo dosyası; yoksa `label` yazıyla basılır. */
	img?: string;
}

export type MangaLayout = '3-üst-1-alt' | '2-üst-2-alt' | '1-buyuk-2-kucuk' | 'dikey' | 'plan';

export interface MangaBlock extends BlockBase {
	t: 'manga';
	/** Sayfanın köşesine basılan numara. */
	page: number;
	layout: MangaLayout;
	/** Japon one-shot'ları sağdan sola; her manga öyle değil. Varsayılan `rtl`. */
	dir?: 'ltr' | 'rtl';
	/** Kompozisyonun içindeki başlık kutusu (ayrı açılış sayfası değil). */
	title?: string;
	mark?: MangaMark;
	panels: readonly MangaPanel[];
}

/* --- kendi verisini kendi getiren bloklar --------------------------------- */

/** Bulmaca yuvası — içeriği çalışma anında puzzles katmanı doldurur. */
export interface PuzzleSlotsBlock extends BlockBase {
	t: 'puzzleSlots';
}

/** Kapak — alanlarını `Issue`'dan okur, bu yüzden kendi verisi yok. */
export interface CoverBlock extends BlockBase {
	t: 'cover';
}

/** Sayı sonu — sonraki sayı, bulmaca özeti, paylaşım. */
export interface OutroBlock extends BlockBase {
	t: 'outro';
}

export type Block =
	| KickerBlock
	| H1Block
	| H2Block
	| H3Block
	| LeadBlock
	| ParagraphBlock
	| PullBlock
	| QuoteBlock
	| NoteBlock
	| CaptionBlock
	| FigureBlock
	| RuleBlock
	| BylineBlock
	| StatBlock
	| ListBlock
	| DialogBlock
	| MangaBlock
	| PuzzleSlotsBlock
	| CoverBlock
	| OutroBlock;

/** Blok tipi adları — çalışma anı doğrulaması (validate.ts) buradan okur. */
export const BLOCK_TYPES = [
	'kicker',
	'h1',
	'h2',
	'h3',
	'lead',
	'p',
	'pull',
	'quote',
	'note',
	'caption',
	'figure',
	'rule',
	'byline',
	'stat',
	'list',
	'dialog',
	'manga',
	'puzzleSlots',
	'cover',
	'outro'
] as const satisfies readonly Block['t'][];

export type BlockType = (typeof BLOCK_TYPES)[number];

/* ==========================================================================
   SAYFA VE BÖLÜM
   ======================================================================= */

export interface Page {
	/** Bölüm içinde değil, SAYI içinde benzersiz — blok kimliğinin öneki. */
	id: string;
	depth: PageDepth;
	kind?: PageKind;
	fit: Fit;
	bleed?: Bleed;
	bg?: Background;
	scene: Transition;
	blocks: readonly Block[];
}

export interface Section {
	slug: string;
	type: SectionType;
	title: string;
	/** İçindekilerde başlığın üstünde: "Dosya", "Foto-öykü". */
	kicker?: string;
	author?: string;
	/** Tahmini okuma süresi (dk) — içindekiler listesi için. */
	minutes?: number;
	tags?: readonly string[];
	/** Bölümün tamamı sağdan sola okunuyorsa. Varsayılan `ltr`. */
	direction?: 'ltr' | 'rtl';
	pages: readonly Page[];
}

/* ==========================================================================
   TANITIM (intro)
   ======================================================================= */

/**
 * İlk ziyarette gösterilen kaydırmalı kartlar, ~12 saniye.
 *
 * `scene` bir zamanlar düz `string`ti ve bu, `Background` için kapatılan
 * deliğin burada açık kalması demekti: yazım hatası derleme hatası değildi.
 * Daha kötüsü, sahneleri "kim çağırıyor" diye sayarken bu kartlar atlandı —
 * `bg: 'scene:…'` biçimini arayan sayım çıplak alanı görmedi ve 1e "üç sahne
 * yeter" diye kapandı, oysa yedi gerekiyordu (karar 1.41).
 */
export interface IntroCard {
	/** Kartın arka planı — `src/lib/art/` sahne kaydından. */
	scene: SceneName;
	big: string;
	small: string;
	/** Son kart: mod seçimine geçiş düğmesini taşır. */
	last?: boolean;
}

/* ==========================================================================
   BULMACALAR
   --------------------------------------------------------------------------
   ⚠️ Prototipteki `stats` alanı (plays/solves/firstTryRate/avgSeconds) BURADA
   YOK. O sayılar uydurmaydı ve içerik dosyasında durmaları, gerçek istatistik
   gibi gösterilmeleri anlamına gelirdi — tohum yorumları elemekle aynı gerekçe.
   Gerçek sayılar Faz 4'te `puzzle_stats` view'ından gelecek; N < 20 iken
   karşılaştırma cümlesi hiç gösterilmeyecek.
   ======================================================================= */

export interface WordHuntConfig {
	/** Izgara kenarı (kare). */
	size: number;
	words: readonly string[];
}

export interface ColorSequenceConfig {
	rounds: number;
}

export interface HaikuItem {
	/** Üç satır; eksik olan `___` ile işaretli. */
	lines: readonly string[];
	options: readonly string[];
	/** Doğru şıkkın `options` içindeki indeksi. */
	answer: number;
}

export interface HaikuConfig {
	items: readonly HaikuItem[];
}

export interface PanelOrderConfig {
	/** Sıralanacak kare sayısı — kareler one-shot bloğundan okunur. */
	panels: number;
}

interface PuzzleBase {
	name: string;
	blurb: string;
	tags: readonly string[];
	/** 1 (kolay) – 3 (zor). */
	difficulty: 1 | 2 | 3;
	estMinutes: number;
	icon: string;
	/** Editörün seçtiği bulmacada görünen tek cümlelik gerekçe. */
	editorsNote?: string;
}

/** `id` hem kimlik hem tür: hangi bulmaca motorunun çalışacağını o söyler. */
export type Puzzle =
	| (PuzzleBase & { id: 'kelime-avi'; config: WordHuntConfig })
	| (PuzzleBase & { id: 'renk-dizisi'; config: ColorSequenceConfig })
	| (PuzzleBase & { id: 'haiku-tamamla'; config: HaikuConfig })
	| (PuzzleBase & { id: 'panel-sirala'; config: PanelOrderConfig });

export type PuzzleId = Puzzle['id'];

/* ==========================================================================
   SAYI
   ======================================================================= */

export interface Issue {
	/** `2026-09` — hem klasör adı hem rota parçası (`/sayi/2026-09`). */
	slug: string;
	number: number;
	title: string;
	subtitle: string;
	/** ISO tarih (`2026-09-01`). */
	publishedAt: string;
	colophon: string;
	/** Bulmaca listesinde öne çıkarılan. */
	editorsPick?: PuzzleId;
	/** Sayının bulmaca havuzu — sıra listede görünen sıradır. */
	puzzlePool?: readonly PuzzleId[];
	/** Sayı sonundaki "sırada ne var" kartı. */
	next?: { date: string; title: string };
}

/** Bir sayının tamamı — `src/content/<slug>/index.ts` bunu dışa verir. */
export interface IssueContent {
	issue: Issue;
	intro: readonly IntroCard[];
	sections: readonly Section[];
	puzzles: readonly Puzzle[];
}
