# sErgi

Aylık bir sosyal web dergisi. Ayda bir sayı çıkar, bir oturuşta okunur, biter.
Okur hesap açmadan okur ve istediği yere yorum bırakır.

> **Marka adı henüz kesin değil.** Ad, alan adı ve künye tek bir yerden geliyor:
> [`src/lib/brand.ts`](src/lib/brand.ts). Koda hiçbir yere gömülmedi.

---

## Depo iki katmanlı

| Katman | Konum | Durum |
|---|---|---|
| **Gerçek ürün** | `src/`, `static/` | SvelteKit + Svelte 5 + TS. **Yapım aşamasında** — [docs/BUILD-TODO.md](docs/BUILD-TODO.md) |
| **Prototip** | `prototype/` | Derlemesiz saf HTML/CSS/JS. Uçtan uca çalışan referans. **Donmuş** |

`prototype/` silinmiyor: 1.0'ın neyi nasıl yapacağının çalışan referansı o.
Lint, Prettier ve build kapsamının dışında tutuluyor — bilinçli olarak modern
kuralların dışında yazıldı (`window.MAG`, ES modül yok, `file://` ile açılabilir).

---

## Çalıştırma

**Node 22+ gerekiyor** (Vite 8 Node 20+ istiyor; Node 18 ile çalışmaz).

```sh
pnpm install
pnpm dev            # → http://localhost:5173
```

| Komut | Ne yapar |
|---|---|
| `pnpm dev` | Geliştirme sunucusu |
| `pnpm build` | Üretim derlemesi (Cloudflare Workers) |
| `pnpm preview` | Derlemeyi yerelde wrangler ile sun (:4173) |
| `pnpm check` | TypeScript + Svelte tip denetimi |
| `pnpm lint` | Prettier + ESLint |
| `pnpm test:unit` | Birim testleri |
| `pnpm test:e2e` | Playwright |
| `pnpm gen` | `wrangler types` yeniden üretir |

Prototipi ayrıca çalıştırmak için:

```sh
python3 tools/devserver.py 4174 prototype    # → http://localhost:4174
```

---

## Yayın

İki ayrı hedef var; hangi URL'in neyi gösterdiğini karıştırmamak gerekiyor.

| Hedef | Ne yayınlanır | Nasıl tetiklenir |
|---|---|---|
| **Cloudflare Workers** | **Gerçek 1.0 build'i** (`src/`) → [sergi.muhammedemreuctepe.workers.dev](https://sergi.muhammedemreuctepe.workers.dev/sayi/2026-09) | Cloudflare panelinden depo bağlantısı — `main`'e her push |
| **GitHub Pages** | Prototip arşivi (`prototype/`) | [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) — yalnız `prototype/` değişince |

Gerçek build **GitHub Pages'te yayınlanamaz**: `adapter-cloudflare` çıktısı bir
Worker (`.svelte-kit/cloudflare/_worker.js`) ve Pages yalnız statik dosya sunar.
Faz 2'nin Supabase girişi, yorum uçları ve Resend postaları da sunucu ister.

### Cloudflare bağlantısı — panel ayarları

**Workers**, Pages değil. Cloudflare yeni panelde depo bağlarken projeyi Workers
olarak açıyor ve dağıtımı `wrangler deploy` ile yapıyor; Pages'inki
`wrangler pages deploy`. İkisi aynı yapılandırmayı okumadığı için karıştırmak
"Missing entry-point to Worker script" hatası veriyor
(bkz. [wrangler.jsonc](wrangler.jsonc) başındaki not).

Workers & Pages → Create → **Workers** → Connect to Git → `emreuctepe/sergi`:

| Alan | Değer |
|---|---|
| Production branch | `main` |
| Build command | `pnpm build` |
| Deploy command | `npx wrangler deploy` *(varsayılan)* |

Çıktı klasörü panelde SORULMAZ — `wrangler.jsonc`'deki `main` ve
`assets.directory` zaten söylüyor. Node ve pnpm sürümleri de depoda sabit:
[`.node-version`](.node-version) 22.23.2, `package.json` içindeki
`packageManager` alanı pnpm 11.22.0.

⚠️ `wrangler.jsonc` değişirse **`pnpm gen` çalıştırıp
`worker-configuration.d.ts`'i commit'lemek gerekiyor** — ve `gen` derleme çıktısı
SİLİNMİŞKEN çalıştırılmalı (`rm -rf .svelte-kit/cloudflare`). Sebebi:
`wrangler types`, `main`'in gösterdiği dosya diskte varsa çıktıya
`typeof import("./.svelte-kit/cloudflare/_worker")` satırını ekliyor; o satır
commit'lenirse `checkJs` üretilmiş Worker'ı da tip denetimine sokuyor ve
`pnpm check` yüzlerce hatayla patlıyor. `src/lib/deploy.test.ts` bunu bekliyor.

Ortam değişkeni (`.env`) gerekmiyor; Faz 2'de Supabase ve Resend anahtarları
panelin **Settings → Environment variables** bölümüne girecek, depoya değil.

---

## Belgeler

| Dosya | İçerik |
|---|---|
| [docs/BUILD-TODO.md](docs/BUILD-TODO.md) | **Canlı ilerleme.** Nerede kaldık, sıradaki adım, karar günlüğü |
| [docs/PROJE.md](docs/PROJE.md) | Ana mimari plan: ürün ilkeleri, veri modeli, fazlar |
| [docs/YORUM-SISTEMI.md](docs/YORUM-SISTEMI.md) | Yorum ankrajının gerekçesi. **Şemanın doğru hâli §6'da** |
| [docs/MIMARI.md](docs/MIMARI.md) | Prototipin mimari haritası |
| [AI_GUIDE.md](AI_GUIDE.md) | Makine-okur özet: hangi fonksiyon nerede |

---

## Stil sistemi

Küresel CSS `src/lib/styles/` altında, [`src/app.css`](src/app.css)'te katmanlı
olarak yükleniyor:

```css
@layer tokens, base, canvas, blocks, comments, overlays, puzzles;
```

Bu dosyalar prototipten **bayt bayt** taşındı ve öyle kalmaları bir testle
korunuyor ([`parity.test.ts`](src/lib/styles/parity.test.ts)). Bilerek ayrılan
dosya `FORKED` listesine nedeniyle yazılır. Prettier bu klasöre girmez.

İki ölçek var: tuval içi her şey `cqi` (3:4 tuvalin genişliğine göre), tuval
dışı arayüz `px`/`clamp`. Ayrıntı [`tokens.css`](src/lib/styles/tokens.css)
başındaki notta.

---

## İçerik

Bir sayının şekli tek yerde: [`src/lib/content/types.ts`](src/lib/content/types.ts)
— `Issue → Section → Page[] → Block[]`, 20 blok tipi `t` alanı üzerinden ayrımlı
bir birlik. Markdown derleyicisi yok; 1.0 tek sayı yayınlıyor ve o sayı tipli TS
dosyalarında yaşıyor.

Sayının kendisi [`src/content/2026-09/`](src/content/2026-09/) altında: künye +
tanıtım + bulmacalar `issue.ts`'te, dokuz bölüm `sections/NN-*.ts`'te, sıra
`index.ts`'te. Klasör başlangıçta `tools/tasi-icerik.mjs` ile prototipten
üretildi; **artık elle bakımlı** — söyleşi bölümü editöryel olarak yeniden
yazıldığı gün script'in ömrü bitti (bkz. BUILD-TODO karar 1.42). Script'i
tekrar çalıştırmak klasörü sıfırdan yazar ve o düzenlemeleri siler.

Sayının kendi içinde tutarlılığı
[`integrity.test.ts`](src/lib/content/integrity.test.ts)'te sabitleniyor:
bölüm/sayfa/blok sayıları, kimlik biçimi, benzersizlik. (Prototiple BAYT BAYT
parite yalnız CSS tarafında sürüyor.)

Her blok **açık bir kimlik** taşıyor (`km-1:3` = `sayfaId:index`). Bu kimlik
yorum ankrajının dayanağı: bir bloğu taşımak ona bağlı yorumları da taşır, o
yüzden kimlikler içerik düzenlenirken elle korunur
([YORUM-SISTEMI §2.1](docs/YORUM-SISTEMI.md)). Kimlikler
[`blockids.lock.json`](src/lib/content/blockids.lock.json)'da kilitli — biri
kaybolursa test kırmızı yanar. Kilit elle bakımlıdır: silmek bilinçli bir satır
olmalı, otomatik tazelenen bir kilit hiçbir şey korumaz.

Tipin yakalayamadığı tutarsızlıkları
[`validate.ts`](src/lib/content/validate.ts) denetliyor: yinelenen kimlik,
sayfasıyla uyuşmayan blok kimliği, `text: ''`, tanımsız bulmaca referansı,
olmayan görsel dosyası, sayı içine giden bir bağ. Sorun listesi döndürüyor —
`throw` etmiyor ki bir sayı hazırlanırken bütün hatalar tek seferde görülsün.

---

## Bloklar

20 blok tipinin her biri [`src/lib/blocks/`](src/lib/blocks/) altında bir Svelte
bileşeni; hepsini [`Block.svelte`](src/lib/blocks/Block.svelte) dağıtıyor. Zincirin
sonundaki `bilinmeyenTip(block: never)` kapsam denetimi: `types.ts`'e eklenip
buraya yazılmayan bir tip `pnpm check`'i kırıyor. (Prototip aynı durumda konsola
uyarı basıp bloğu sessizce atlıyordu.)

`.blk`, `--i` ve ankraj kimliği bloğun **kendi kök öğesine** yayılıyor; sarmalayıcı
bir `<div>` yok, çünkü CSS `.page__inner > .blk + .blk` gibi doğrudan-çocuk
seçicileri kullanıyor ([`attrs.ts`](src/lib/blocks/attrs.ts)).

Satır içi biçimleme (`*italik*`, `**kalın**`, `` `kod` ``, `[bağ](url)`) HTML
dizgisi değil **jeton listesi** üretiyor ([`inline.ts`](src/lib/blocks/inline.ts))
— aynı fonksiyon Faz 3'te okur yorumlarını da biçimlendirecek ve o gün `{@html}`
bir güvenlik açığı olurdu. Prototiple aynı çıktıyı verdiği, sayının 84 metni
üzerinde ölçülerek doğrulanıyor.

Hepsini bir arada görmek için:

```sh
pnpm dev            # → http://localhost:5173/dev/bloklar
```

Katalog örnekleri **sayının kendi içeriğinden** alıyor (uydurma "lorem" yok) ve
tipe değil *çeşide* göre gruplanıyor: `h1 · big`, `list · dict`, `kicker · invert`
gibi 29 kart. Kartlar küçültülmüş birer tuval, çünkü blok ölçülerinin hepsi `cqi`.

---

## Tuval

Sayının okunduğu yer: `/sayi/2026-09`. [`src/lib/canvas/`](src/lib/canvas/) —
3:4 kabuk, dikey snap, letterbox bantları, klavye ve sahne tetikleme.

Aritmetik DOM'dan ayrı duruyor ([`geometry.ts`](src/lib/canvas/geometry.ts)):
letterbox eşiği, okunan sayfanın seçimi, ilerleme yüzdesi, ileri/geri adımı —
hepsi girdi sayı çıktı sayı, hepsi tarayıcısız test edilebilir. Bileşene kalan
iş ölçmek ve yazmak.

İki kural kolay unutuluyor:

- **Sayfalar `data-inview="true"` doğar.** Giriş animasyonları `opacity: 0` ile
  başlıyor; "false" ile doğan bir sayfayı açacak JavaScript çalışmazsa dergi
  bomboş açılır. Tuval yalnızca ekranın altında kalanları gizleyip gözlemciye
  verir — yani animasyon bir eklenti, bir şart değil.
- **Sayfa ölçüleri (`metrics`) reaktif değildir.** `$state` yapıldığında ölçüm
  effect'i kendi kendini tetikleyip `effect_update_depth_exceeded` ile bütün
  effect'leri düşürüyor: sayfa çizilir, kaydırma ve folio ölü doğar.

## Sahneler

Bazı sayfaların arka planı fotoğraf değil, çizim: `bg: 'scene:sumi'`.
[`src/lib/art/`](src/lib/art/) — 1.0'da **üç** sahne var (`paper`, `portrait`,
`sumi`). Prototipteki 22'nin kalan 19'unu yalnız 2026-10 çağırıyor, o sayı
gelene kadar taşınmıyorlar.

Sahne adı `string` değil [`SceneName`](src/lib/art/scenes.ts): prototipte
bilinmeyen bir ad sessizce `paper`e düşüyordu, yani `scene:tori` yazım hatası
boş bir kâğıt sayfa üretip görünmez kalıyordu. Ad artık üç yerden kapanıyor —
tip derlemede, `validate.ts` içerikte, `Scene.svelte`'in `never` dalı dağıtıcıda.

Sahne eklemek: bileşeni yaz → adını `SCENE_NAMES`'e ekle → `Scene.svelte`'e dal
koy. Üçüncüsü unutulursa `pnpm check` kırılır.

İki ayrıntı:

- **`sumi`nin sayıları tohumdan geliyor** ([`sumi.ts`](src/lib/art/sumi.ts)) ve
  `rand()` çağrı sırası sözleşmenin parçası — bir satırı yukarı almak
  kompozisyonu sessizce başkalaştırır. `Math.random()` olamaz: sunucuda çizilenle
  tarayıcıda hidratlanan tutmazsa Svelte ağacı temizler, okur boş sayfa görür.
- **`<defs>` kimlikleri `$props.id()` ile benzersiz.** Aynı sahne bir belgede iki
  kez çizilirse sabit bir id ikinci örneği birincinin degradesine bağlardı.

## Görseller

Sayının ağırlığının **%97'si** fotoğraf: kod tarafında kazanılacak 100 KB bile
yok. Kaynak `.webp` dosyaları `static/assets/<sayı>/` altında durur ve doğruluk
kaynağıdır; yanlarına [`tools/gorsel-turevleri.mjs`](tools/gorsel-turevleri.mjs)
birkaç boyda AVIF yazar:

```sh
node tools/gorsel-turevleri.mjs
```

Ölçülen sonuç — sayıyı baştan sona okumak:

| Cihaz | Önce | Sonra |
|---|---|---|
| 1× masaüstü / geniş ekran | 3.634 KB | **672 KB** |
| 2× telefon | 3.634 KB | **1.225 KB** |
| 3× telefon, 2× tablet | 3.634 KB | **2.182 KB** |
| AVIF desteklemeyen tarayıcı | 3.634 KB | 3.634 KB (kaynak webp) |

Aynı boyda yeniden kodlamak işe YARAMIYOR — denendi, dosyalar büyüdü. Kaynaklar
zaten verimli sıkıştırılmış; ağırlık ince dokudan geliyor. Kazanç iki yerden:
ölçek (tuval masaüstünde 560 CSS px'te sabitleniyor) ve format.

Hangi dosyanın hangi boyları olduğu
[`gorsel-turevleri.json`](src/lib/content/gorsel-turevleri.json)'da yazılı ve
bileşen bunu **tahmin etmiyor, okuyor**: eksik bir AVIF `<source>` ile eşleşip
404 alır ve `<img>`e geri DÜŞMEZ — okur kırık görsel görür. 56 türevin her biri
ayrı testle diskte aranıyor.

Yeni görsel eklerken: dosyayı `static/assets/` altına koy, script'i çalıştır,
manifesti commit'le. Unutulursa `pnpm test` kırmızı yanar.

### Uçtan uca testler

```sh
pnpm exec playwright test        # tarayıcı kuruluysa
pnpm test:e2e                    # tarayıcıyı da kurar
```

[`e2e/tuval.e2e.ts`](e2e/tuval.e2e.ts) üretim derlemesini gerçek bir tarayıcıda
gezer. Tuvalin üç can damarı — `requestAnimationFrame`, `IntersectionObserver`,
yumuşak kaydırma — yalnızca BOYAYAN bir tarayıcıda çalışıyor; gömülü önizleme
panelleri boyamadığı için orada tuval "bozuk" görünür. Doğrulama buradan geçer.

⚠️ Testlerden biri "taşma yok" demiyor, **bilinen taşma listesini** sabitliyor:
üç sayfa (`km-acilis`, `km-imza`, `son-kunye`) tuvale sığmıyor ve altları
kırpılıyor. Prototip de birebir aynı üç sayfada taşıyor — devralınmış bir
içerik borcu, yayın öncesi kapanacak (bkz. BUILD-TODO "karar bekleyen sorular").
