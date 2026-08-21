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
| `pnpm build` | Üretim derlemesi (Cloudflare Pages) |
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
— `Issue → Section → Page[] → Block[]`, 19 blok tipi `t` alanı üzerinden ayrımlı
bir birlik. Markdown derleyicisi yok; 1.0 tek sayı yayınlıyor ve o sayı tipli TS
dosyalarında yaşıyor.

Sayının kendisi [`src/content/2026-09/`](src/content/2026-09/) altında: künye +
tanıtım + bulmacalar `issue.ts`'te, dokuz bölüm `sections/NN-*.ts`'te, sıra
`index.ts`'te. **O klasörün sahibi `tools/tasi-icerik.mjs`** — prototipten
üretiyor ve her çalıştığında klasörü sıfırdan yazıyor, elle dosya konmaz:

```sh
node tools/tasi-icerik.mjs 2026-09
```

Taşımanın prototipten sapmadığı bir testle korunuyor
([`parity.test.ts`](src/lib/content/parity.test.ts)) — CSS'teki parite testiyle
aynı sözleşme.

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

19 blok tipinin her biri [`src/lib/blocks/`](src/lib/blocks/) altında bir Svelte
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
bir güvenlik açığı olurdu. Prototiple aynı çıktıyı verdiği, sayının 87 metni
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
