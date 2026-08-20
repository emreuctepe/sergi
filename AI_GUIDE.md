# AI_GUIDE — Prototip için hızlı harita

Bu dosya bir yapay zekâ asistanının (veya yeni bir geliştiricinin) `prototype/`
kod tabanında **hangi fonksiyon nerede**, **global durum nerede tutulur**
sorularına saniyede yanıt bulması içindir. Mimari anlatı için
[docs/MIMARI.md](docs/MIMARI.md).

- **Ad alanı:** her şey `window.MAG` altında. ES modül yok (prototip `file://`
  ile açılabilsin diye), her dosya IIFE ile `MAG`'a yazar.
- **Yükleme sırası** (`prototype/index.html`, anlamlı):
  `util → art → content → issues/*.js → data → *.comments.js → data-comments → data-analytics → state → streak → render → canvas → comments → popup → identity → puzzles → overlays → analytics → debug → app`
  İki zorunluluk: `content.js` bölünmüş sayı dosyalarından **önce** (`defineSection`'ı
  o tanımlıyor), içerik dosyaları `data.js`'ten **önce** (`data.js` `MAG.issues`'un
  anlık kopyasını alıyor; sıra bozulursa `throw` ediyor).

---

## 1. Global durum ve veri nerede tutulur

| Ne | Nerede | Not |
|---|---|---|
| Tek global ad alanı | `window.MAG` | tüm modüller buraya asılır (`util.js:5`) |
| **Kalıcı durum** (okur, tercihler, ilerleme, yorumlar, tepkiler, bulmaca koşuları) | `MAG.state.data` → `js/state.js` | `localStorage["mag:state:v1"]`; alan adları Supabase şemasıyla birebir |
| Durum varsayılanları (şema) | `DEFAULTS`, `js/state.js:15` | `reader, depth, locale, theme, motion, dock, progress, finished, seenIntro, modeTime, modeDone, keys, comments, reactions, loginOffer, puzzleRuns, tagScores, coldStartAnswer, stats` |
| **Mod tamamlama ve anahtar** | `State.modeTime / modeDone / keys` | anahtarlar `{ [slug]: ts }`; kural `js/streak.js`, tek görünür iz altın mod kartı |
| **Aktif sayı içeriği** | `MAG.data` → `js/data.js` | `issue, intro, sections, puzzles`; hangi sayı? URL `?sayi=` → `pickSlug()` |
| Sayı kayıt defteri (çok sayılılık) | `MAG.issues` | tek dosya kendini doğrudan yazar; **bölünmüş** sayı `js/content.js` ile toplanır |
| Bölünmüş sayı ara belleği | `MAG.content.pending` → `js/content.js` | `defineSection`/`defineIssue` parçaları burada birikir, `order`'a göre `MAG.issues`'a toplanır |
| Yazım kiti (dev, üretime girmez) | `MAG.dev` → `js/dev/*`, `dev.html` | `samples` (blok/sahne örnekleri) · `catalog` · `editor` |
| Tohum yorumlar (aktif sayı) | `MAG.data.comments` | `js/data-comments.js` doldurur |
| Sahte editör analitiği | `MAG.analyticsData` → `js/data-analytics.js` | slug ile tohumlu, tutarlı; `A.build()` üretir |
| Okurun yazdığı yorumlar | `State.get("comments")` | `C.all()` = tohum + flood + bunlar |
| Kimlik (anonim okur) | `State.get("reader")` | `js/identity.js` doldurur, `reader.id` sabit kalır |
| Olay veri yolu | gizli DOM düğümü, `js/util.js:85` | `U.emit` / `U.listen` |
| localStorage sarmalayıcı | `U.store`, `js/util.js:212` | `mag:` önekiyle |
| Runtime DOM durumu | `document.documentElement.dataset` | `theme, motion, issue, depth, commentLayer, dockFits…` |

---

## 2. Modül sorumlulukları (tek satır)

| `MAG.*` | Dosya | Sorumluluk |
|---|---|---|
| `util` | `js/util.js` | DOM yardımcıları, olay yolu, localStorage, tohumlu RNG, metin biçimleme |
| `art` | `js/art.js` | Satır içi SVG sahne/foto/manga/avatar kitaplığı |
| `data` | `js/data.js` | Aktif sayıyı seçer, akış/görünürlük yardımcıları |
| `content` | `js/content.js` | Bölünmüş sayıları toplar: `defineIssue`/`defineSection` → `MAG.issues[slug]` |
| `issues` | `js/issues/*.js` · `js/issues/<slug>/` | Sayı içeriği (tek dosya **veya** issue.js + sections/*) |
| `state` | `js/state.js` | Merkezi durum + localStorage + sekmeler arası eşitleme |
| `streak` | `js/streak.js` | Okuma süresi sayacı; modun tahmini süresinin yarısı → mod tamam, üçü tamam → sayının anahtarı |
| `render` | `js/render.js` | İçerik ağacı → DOM; `BLOCKS` tablosu |
| `canvas` | `js/canvas.js` | 3:4 tuval, snap gezinme, ilerleme, klavye, sahne gözlemcisi |
| `comments` | `js/comments.js` | Yorum ankrajı, baloncuk (pin), kümelenme, katman |
| `popup` | `js/popup.js` | Baloncuğa dokununca tuvalin üstünde açılan yorum kartı |
| `identity` | `js/identity.js` | Anonim kimlik + e-posta/kod ile kalıcılaştırma |
| `puzzles` | `js/puzzles.js` | Custom element bulmacalar + host (kayıt/öneri/istatistik) |
| `overlays` | `js/overlays.js` | Tuval dışı UI: tanıtım, menü, thread, yazma, giriş, arşiv, sayı sonu, admin |
| `analytics` | `js/analytics.js` | Editör paneli (sahte agregasyon) |
| `debug` | `js/debug.js` | Stres modu (`MAG.flood`), pin kümeleme görselleştirme (`MAG.pins`) |
| `app` (boot) | `js/app.js` | Açılış sırası, modülleri bağlayan tek yer |
| `dev.*` | `js/dev/*.js` (yalnız `dev.html`) | Yazım kiti: `samples`, `catalog` (blok galerisi), `editor` (canlı 3:4 önizleme), `boot` |

---

## 3. Fonksiyon indeksi (dosyaya göre)

Yalnızca dışa açık / önemli fonksiyonlar. `MAG.<modül>.<ad>` biçimi dışa açık
API; küçük harfli adlar dosya-içi yardımcıdır.

### `js/util.js` → `MAG.util` (U)
`$, $$, el, append, clear, on` (DOM) · `emit, listen` (olay yolu) ·
`escape, inline, slug` (metin) · `clamp, pad2, timeAgo, minutes` (sayı/zaman) ·
`rng, pick, uid` (rastgele) · `debounce, raf, reducedMotion` (zamanlama) ·
`store.{get,set,remove,clearAll}` (localStorage)

### `js/state.js` → `MAG.state` (State)
`get, set, patch, save, reset` · `depth, isVerified` (kısayol) ·
`saveProgress, getProgress, markFinished` (ilerleme) ·
`modeKey, getModeTime, addModeTime, isModeDone, markModeDone` (mod tamamlama — depo; kural `streak.js`'te) ·
`hasKey, grantKey, keyList` (anahtar) ·
`bumpTags, tagScore` (bulmaca öneri puanı) ·
`runKey, getRun, saveRun` (bulmaca koşuları) · `DEFAULTS` (şema, satır 15)

### `js/streak.js` → `MAG.streak` (S)
`init` (sayaç `flow:render`'da başlar) · `targetMs(depth)` (tahminin yarısı) ·
`spentMs, progress, isDone` (okuma) · `hasKey, keys` (anahtar) ·
iç: `tik` (saniyede bir; yalnız sekme görünür + son 3 dk hareket varsa sayar),
`tamamla` (modu işaretle, üçü tamamsa anahtar) ·
dev: `report()` (konsol tablosu), `forward(dk)` (sayacı ileri sar)

### `js/data.js` → `MAG.data` (D)
`archive` (sayı listesi) · `hasIssue, currentSlug, issueHref` ·
`sectionBySlug, puzzleById` · `depths` (mod kimlikleri: `min, mid, full`) ·
`pageVisible` (derinlik filtresi) ·
`flow` (derinliğe göre sayfa dizisi) · `estimateMinutes` · `pickSlug` (iç, sayı seçer)

### `js/render.js` → `MAG.render` (R)
`BLOCKS` (blok tipi → çizici: `h1,h2,p,pull,quote,list,dialog,term,manga,cover,outro…`) ·
`page(section,page,index)` (sayfa DOM + blok kimlikleri) ·
`renderFlow(opts)` (tüm akışı bas + konum koru) · `backgroundFor, nearestVisible` (iç)

### `js/canvas.js` → `MAG.canvas` (Canvas)
`init, registerPages` · `pages, count, currentIndex, currentPage, pageById, scroller` (erişim) ·
`goTo, goToId, next, prev, goToSection` (gezinme) ·
`setCommentMode, lockScroll, toNormalized` (efekt/koordinat) ·
`onScroll, measureLetterbox, onKey, setupObserver` (iç: ilerleme, letterbox, klavye, sahne)

### `js/comments.js` → `MAG.comments` (C)
`all, visible, forPage, roots, replies, byId, total` (okuma) · `setFlood` (stres modu) ·
`blockIdOf, quoteOf, blockLabel` (ankraj) ·
`score, representative, rootsFor` (temsilci ses) ·
`add, react, myReactions` (yazma) ·
`decorate` (baloncukları bas) · `clusterPoints, pinDist` (pin kümeleme) ·
`setLayer, toggleLayer, layerOn, updateCount` (katman) · `clearGhost` ·
`init` · iç: `migrateLegacy, decoratePage, blockPoint, pinNode, onSelection, onPressStart, onPinDown…`

### `js/popup.js` → `MAG.popup` (P)
`open(sel, anchorEl), close, isOpen` · iç: `buildCard, commentBlock, position`

### `js/identity.js` → `MAG.identity` (I)
`ensure` (anonim kimlik kur) · `me` (mevcut okur) · `update, reroll, palette` ·
`requestCode, pendingEmail, verifyCode, signOut` (e-posta/kod akışı) ·
`canOffer, noteOffer` (giriş teklifi bayrağı)

### `js/puzzles.js` → `MAG.puzzles` (P)
`init, mount` (yuvaları bas) · `recommend` (öneri algoritması) ·
`coldStart` (soğuk başlangıç mikro-sorusu) ·
iç custom element'ler: `base, buildGrid` (kelime avı), `svgHalka/svgKule` (görsel bulmaca) ·
`openPuzzle, resultCard, slot` (host UI)

### `js/overlays.js` → `MAG.overlays` (O)
`init` · `modal, panel, toast, closeTop, closeAll` (çekirdek) ·
`openIntro, openDepthPicker` (ilk ziyaret) ·
`openMenu, toggleMenu, setDock, setTheme, openIdentityEditor, openLang` (menü) ·
`openThread, openComposer, openQuoteCard` (yorum) ·
`openAuth` (e-posta+kod girişi) · `openArchive` (arşiv) ·
`renderOutro` (sayı sonu) · `openAdmin` (moderasyon kuyruğu)

### `js/analytics.js` → `MAG.analytics` (An)
`open` (editör paneli) · `init` · iç: `head, bar, table, kpis, spark`

### `js/art.js` → `MAG.art` (A)
`scene(name), has(name)` · `photo(seed, ratio)` · `mangaPanel(index, text, kind)` ·
`avatarSvg(color, emoji)` · `rule, leafMark`

### `js/debug.js` → `MAG.debug` + globaller
`MAG.flood(n)` (n sahte yorum, yalnız bellek) · `MAG.pins(on)` (kümeleme görseli) ·
`MAG.debug.{pinsOn, drawPins, previewPoint}`

### `js/app.js` (boot, dışa API yok)
`boot` (açılış) · `applyPreferences` (tema/dil/derinlik uygula) ·
`wire` (olay dinleyicileri bağla) · `start` (renderFlow + decorate + puzzles.mount) ·
konsol kısayolu: `MAG.reset()`

### `js/content.js` → `MAG.defineIssue`, `MAG.defineSection`, `MAG.content`
`defineIssue(issue, intro, puzzles)` · `defineSection(slug, {order, …})` ·
iç `assemble(slug)` (sıra-bağımsız; `order`'a göre `MAG.issues[slug]`'a toplar)

### `js/dev/*` → `MAG.dev` (yalnız `dev.html`)
`samples` (blok/sahne/animasyon örnekleri — katalog + editörün ortak kaynağı) ·
`catalog.mount(host)` + `catalog.toJS/copy` · `editor.init/start` (canlı 3:4 önizleme) ·
`boot` (sekmeler + kit açılışı, `app.js` yerine)

---

## 4. Sık kullanılan olaylar (veri yolu)

| Olay | Yayan | Dinleyen (örnek) |
|---|---|---|
| `state:change` | `State.set` | `app.js` (derinlik etiketi) |
| `flow:render` | `render.renderFlow` | `comments.js`, `app.js` |
| `page:change` | `canvas.onScroll` | `comments.js`, `app.js` (sayı sonu) |
| `page:enter` | `canvas` (IntersectionObserver) | sahne animasyonu |
| `comment:added` | `comments.add` | `app.js` → `decorate + updateCount` |
| `comment:reaction` | `comments.react` | sunum katmanları |
| `comments:decorated` | `comments.decorate` | sunum katmanları |
| `comments:layer` | `comments.setLayer` | tuval modu |
| `issue:finished` | `State.markFinished` | `app.js` (toast) |
| `mode:done` | `State.markModeDone` | (yok — bilerek sessiz; iz yalnızca altın mod kartı) |
| `key:earned` | `State.grantKey` | (yok — keşfet sayfası bunu okuyacak) |
| `identity:upgraded` | `identity.verifyCode` | `app.js` (id sabit mi kontrol) |
| `dock:fit` | `canvas.measureLetterbox` | `overlays` (sabit menü) |

---

## 5. Konsol kısayolları (geliştirme)

`MAG.reset()` her şeyi sıfırla · `MAG.data` aktif sayı içeriği ·
`MAG.flood(250)` 250 sahte yorum (bellek) · `MAG.flood(0)` temizle ·
`MAG.pins()` pin çekim alanlarını çiz ·
`MAG.streak.report()` mod tamamlama tablosu · `MAG.streak.forward(12)` sayacı 12 dk ileri sar

Son ikisi açılış banner'ında bilerek duyurulmuyor: mod tamamlama okurdan
gizli bir mekanizma, konsolu açan meraklı okur onu hazır bulmasın.
