# Gerçek Build — Canlı İlerleme

Prototipten (`prototype/`) gerçek 1.0'a geçişin adım listesi. Prototipin kendi
ilerleme dosyası [PROTOTIP-TODO.md](PROTOTIP-TODO.md) artık **kapandı**; bu dosya
onun yerine geçer. Mimari gerekçeler için [PROJE.md](PROJE.md), yorum sisteminin
kararları için [YORUM-SISTEMI.md](YORUM-SISTEMI.md).

---

## Nerede kaldık?

| | |
|---|---|
| **Aktif adım** | Faz 1 — tuval, bloklar, içerik (**1a–1e bitti**, sırada 1f) |
| **Son tamamlanan** | **Röportaj tasarımı seçildi ve üretime geçti**: sekiz adaydan `3 · Balon` — soru çizimin üstünde Anime Ace balonunda, cevap manga anlatı kutusunda, rozet kalktı (karar 1.47) |
| **Sonraki dosya** | 1f — `estimateMinutes()`, mod seçici, konum koruma, tanıtım kartları |
| **Çalışır durum** | `pnpm dev` → http://localhost:5173/sayi/2026-09 · `lint` · `check` (453 dosya) · `test:unit` (304 test) · `test:e2e` (14 test) · `wrangler deploy --dry-run` hepsi yeşil |
| **Canlı** | **https://sergi.muhammedemreuctepe.workers.dev/sayi/2026-09** (Cloudflare Workers, `main`'e her push). Prototip arşivi → https://emreuctepe.github.io/sergi/ |

**Ortam notu:** Node 22 LTS gerekiyor (Vite 8 Node 20+ istiyor). Konteynerde
`/usr/local` altına kuruldu, `pnpm` corepack ile geldi. Node 18 ile çalışmaz.

---

## Kilitlenmiş kararlar

Bunlar tartışıldı ve kapandı; yeniden açmak için yeni bir sebep gerekir.

| Konu | Karar |
|---|---|
| 1.0'da kaç sayı | **Tek**: "Kızıl Mevsim" (2026-09). ~~bugünkü hâliyle~~ — içerik 1.42'de editöryel olarak açıldı |
| Tohum yorumlar | **Girmiyor.** Yorum katmanı boş açılır — uydurma kişileri gerçek okur gibi sunmuyoruz |
| Keşfet + jeton ekonomisi | **Kapsam dışı** |
| Dil seçici (TR/EN/JA) | **Kapsam dışı** — 1.0 tek dilli, sıfır çeviri varken üç dil vaat etmek yalan olur |
| Alıntı kartı PNG | **Kapsam dışı** |
| Editör analitik paneli | **Kapsam içi**, ama gerçek olay verisiyle |
| İçerik biçimi | **Tipli TS dosyaları.** Markdown derleyicisi 2. sayıya ertelendi |
| Blok kimliği | **Veri, türetme değil.** Biçim prototipteki gibi `sayfaId:index` — eski ankrajlar geçerli kalsın diye |
| Uydurma bulmaca istatistikleri | **Taşınmıyor.** Tohum yorumlarla aynı gerekçe: sahte sayıyı gerçek gibi göstermiyoruz |
| Varlık yolları | `img:assets/…` prototiptekiyle aynı → `static/assets/`. `assets/` atılsaydı `/2026-09` sayı rotasıyla çakışırdı |
| Yığın | SvelteKit + Svelte 5 + TS + Supabase + Resend + **Cloudflare Workers** (Pages değil — bkz. 1.34) |
| Depo | **Monorepo değil**, tek uygulama. Klasör sınırları gelecekteki paketleri taklit eder |
| Marka adı | `src/lib/brand.ts` tek kaynak; koda gömülmez |
| `prototype/` | **Dokunulmaz.** Lint, Prettier ve build kapsamı dışında |

---

## Fazlar

### ✅ Faz 0 — İskelet

- [x] Node 22 LTS + pnpm 11 (Node 18 EOL ve Vite 8 ile uyumsuzdu)
- [x] SvelteKit 2.63 · Svelte 5.56 · TS 6 · Vite 8 · adapter-cloudflare 7 · vitest 4 · Playwright
- [x] `src/lib/brand.ts` — ad, alan adı, künye, gönderen e-posta tek kaynakta
- [x] Küresel CSS taşındı: 7 dosya, 4.665 satır → `src/lib/styles/`
- [x] `src/app.css` — `@layer tokens, base, canvas, blocks, comments, overlays, puzzles`
- [x] `app.html` — `lang="tr"`, FOUC'suz tema betiği, `viewport-fit=cover`
- [x] Prettier/ESLint kapsamı sınırlandı: `prototype/`, `docs/`, üretilen dosyalar dışarıda
- [x] `.gitignore` birleştirildi (ham PNG kuralı korundu — 8,8 MB depoya girmiyor)
- [x] `.claude/launch.json`: `sergi` :5173, prototip :4174'e taşındı (4173'ü `pnpm preview` kullanıyor)
- [x] Testler: marka sözleşmesi + CSS ↔ prototip paritesi (12 test)

**Doğrulandı:** Kızıl Mevsim paleti iki temada da uygulanıyor; `cqi` tipografi
ölçeği 1280px ve 375px'te oranını koruyor (13.91/7.95/4.07cqi); yatay taşma yok;
`@layer` sırası tarayıcıda doğru; konsol ve sunucu hatasız.

---

### ⏳ Faz 1 — Tuval, bloklar, içerik

Backend yok; sayı baştan sona okunuyor. **1.0'ın en büyük tek teslimatı.**

- [x] **1a** `src/lib/content/types.ts` — `Issue → Section → Page[] → Block[]`
- [x] **1a** Taşıma script'i: `prototype/js/issues/2026-09.js` → `src/content/2026-09/`
      **açık blok kimlikleriyle** (90 blok / 29 sayfa / 19 tip)
- [x] **1b** `validate.ts`: kayıtlı blok tipi, geçerli `depth`/`fit`,
      boş metin, bulmaca referansları, var olan `img:` yolu
- [x] **1b** `blockids.lock.json` — kimlik silinirse CI kırmızı yanar
- [x] **1b** Varlıklar `static/assets/`e: 17 webp (3,6 MB) — *1e'den öne alındı,
      `img:` yolu denetimi ancak dosyalar oradayken gerçek oluyor*
- [x] **1c** 19 blok bileşeni (`term` ve `rtlhint` taşınmıyor — yalnız 2026-10'da)
- [x] **1c** `inline.ts` — `*italik*`, `**kalın**`, `` `kod` ``, `[bağ](url)`;
      dizgi değil JETON döndürüyor, yani `{@html}` yok
- [x] **1c** `/dev/bloklar` katalog rotası — 29 çeşit, küçültülmüş tuvallerde
- [x] **1d** `canvas/` — letterbox, dock ölçüsü, snap, IntersectionObserver, klavye
- [x] **1d** `/sayi/[slug]` rotası — sayı baştan sona okunuyor
- [x] **1d** Uçtan uca testler (Playwright): gezinme, sahne tetikleme, taşma denetimi
- [x] **1e** "Gece Hattı"nın çekilmemiş 3 karesi sayıdan düşürüldü
      (`gh-2/3/4`) — sayı 29→**26 sayfa**, 90→**87 blok**, derinlik
      18/24/28 → **17/22/25**. Gerekçe ve liste: `tools/tasi-icerik.mjs`
      → `DUSEN_SAYFALAR`
- [x] **1e** `art/` — **3 SVG sahne** (`paper`, `sumi`, `portrait`) + sahne kaydı
      ⚠️ *Sayım eksikti: tanıtım kartları 4 sahne daha çağırıyor, 1f'e kaldı (bkz. 1.41)*
      (`rule`, `leafMark`, Shorts rozeti ve manga karesinin işaretlemesi 1c'de geldi.
      Plan "22 sahne" diyordu; sayılan sahne `art.js`'in TOPLAMIYDI, kalan 19'u
      yalnız 2026-10 çağırıyor. `photo()` hiç yazılmadı — tek kullanıcısı
      düşürülen üç sayfaydı)
- [ ] **1f** Derinlik: `estimateMinutes()`, mod seçici, konum koruma
      (`flow()`/`pageVisible()` 1b'de yazıldı — doğrulayıcının ihtiyacıydı)
- [ ] **1f** Tanıtım (intro) 5 kartı — içerik `issue.ts`'te hazır, CSS
      `overlays.css`'te hazır; eksik olan bileşen ve 4 sahne
- [ ] **1f** `leaves`, `waves`, `street`, `torii` sahneleri (tanıtımın çağırdıkları)
- [ ] **1f** `IntroCard.scene` → `SceneName`; `string` bırakılmış tek sahne alanı
- [ ] `tokens.css`'ten kullanılmayan sayı temalarını (2026-08/10/11) ayıkla

### İçerik · Söyleşi

- [x] **"Fener Ustası" → KargaManga röportajı** (karar 1.42) — uydurma söyleşi
      gerçeğiyle değişti. 4 sayfa / 18 blok → **9 sayfa / 29 blok**: açılış +
      8 soru-cevap, her soru-cevap KENDİ snap'inde, cevabın altında o cevaba
      eşlik eden çizim. Sayı 26→**31 sayfa**, 87→**98 blok**, derinlik
      17/22/25 → **19/26/30**. Bölümün ayak izi 2/3/4 → **4/7/9**
- [x] **20. blok tipi: `figure`** (karar 1.43) — metnin altına oturan tek görsel
- [x] **9 görsel** `static/assets/2026-09/soylesi/` altına (açılış kapağı +
      8 çizim); 17→**26 kaynak**, 47→**56 türev**
- [x] Açılış arka planı: çizerin karga portresi (karar 1.45). Kanal afişi iki
      kez denendi, ikisi de tutmadı (1.44)
- [ ] ⚠️ Açılış kapağının kaynağı **405×720** — arka plan için önerilen
      1200×1600'ün çok altında, büyük ekranda yumuşak. Yüksek çözünürlüklü
      kopyası bulunursa değiştirilecek (aynı dosya adı, sonra türev script'i)
- [ ] `portrait` sahnesi artık HİÇBİR sayfa tarafından çağrılmıyor (tek
      kullanıcısı `sy-acilis`'ti). Kodu duruyor; 1f'de ya kullanıcı bulur ya
      kayıttan düşer
- [x] Prototip paritesi kapandı: `content/parity.test.ts` → `integrity.test.ts`,
      `tools/tasi-icerik.mjs` emekli
- [ ] "Haiku Tamamla"nın 3. maddesi hâlâ Fener Ustası'na yaslanıyor
      (`issue.ts`, *"kâğıdın ardında / ses alçalıyor"* → "Fenerin içinde").
      Bulmaca `içerik-bağlı` etiketli ve dayandığı yazı artık sayıda yok
- [x] 🎨 **`sy-1…sy-8`in görünümü SEÇİLDİ: `3 · Balon`** (karar 1.46 → 1.47).
      Sekiz aday `/dev/soylesi`de yan yana çizildi, kazanan `Dialog.svelte` +
      `Page.svelte`'ye taşındı. `blocks.css` yine ellenmedi. Sayfa silinmedi:
      yedi aday çizilmemiş yolun kaydı — ama artık ayna değil kopya
- [x] Soru ×0.9, cevap ×1.25 (istek üzerine) üretime de geçti: çarpanlar
      `Dialog.svelte`te `.dialog` üstünde. ⚠️ `/dev/soylesi`teki `.stage`
      kopyası ELLE eşlenik — biri değişirse öteki değişmez
- [ ] ⚠️ Balon'un yeri çizimin YÜKSEKLİĞİNE bağlı ama `Figure.svelte`
      `width`/`height` yazmıyor, yani görsel geç inerse balon zıplar. Sekiz
      sayfa ölçüldü: hepsinde görsel sayfa görünmeden yükleniyor, yerelde
      sorun yok — yavaş bağlantıda olabilir. Kalıcı çözüm boyutları manifeste
      yazmak; `gorsel-turevleri.json` şu an yalnız GENİŞLİK tutuyor (karar 1.47)

**Doğrulama:** 31 sayfa telefonda ve masaüstünde akıcı; min 19 / mid 26 / full 30
sayfa; mod değişince okunan yer kaybolmuyor; `prefers-reduced-motion` sadeleşiyor.

⚠️ Aşağıdaki "1a–1d'de doğrulandı" paragrafları O GÜNÜN sayılarını taşıyor
(29 sayfa / 90 blok / 18-24-28). Rakamlar 1e'de değişti; paragraflar tarih
kaydı olduğu için geriye dönük düzeltilmedi. Güncel sayı yukarıdaki satırda,
kanıtı `validate.test.ts` ile `integrity.test.ts`'te. (O paragraflardaki
`content/parity.test.ts` adı da tarihî: dosya 1.42'de `integrity.test.ts` oldu.)

**1a'da doğrulandı:** `src/lib/content/parity.test.ts` taşınan sayıyı prototiple
her çalıştırmada karşılaştırıyor (11 test). Sayımlar tuttu: 9 bölüm, 29 sayfa,
90 blok, 19 tip, 90 benzersiz blok kimliği. Test bilerek bozulan bir cümlede
kırmızı yandı — yani ısırıyor.

**1b'de doğrulandı:** `validateIssue(2026-09)` sıfır sorun döndürüyor ve
doğrulayıcının kendisi 11 bozuk örnekle sınandı (her kural için bir tane —
"her zaman boş liste döndüren" bir doğrulayıcı bu testlerden geçemez).
Derinlik sayıları vaadi tutuyor: **min 18 / mid 24 / full 28**. 17 görselin
hepsi `static/assets/` altında. Kilit ve varlık testleri de bilerek bozulup
kırmızı yandığı görülerek doğrulandı. Toplam 57 test, `check` 398 dosya 0 hata.

**1c'de doğrulandı:** `/dev/bloklar` tarayıcıda ölçüldü — 29 çeşit kart, 29 blok,
42 ankraj (29 blok + 13 alt birim), aydınlık ve koyu temada yatay taşma yok,
kırık görsel yok, `contain` sayfaların hiçbiri taşmıyor (375px ve masaüstünde).
`h1--big`, `para--drop`, `pull--big`, sözlük, numaralı liste, soru/cevap ve
ters çevrilmiş 6 blok kataloğun içinde görünüyor. Testler 57 → **206**:
prototiple satır içi biçimleme paritesi (87 metin + 20 kenar durumu) ve 19
tipin sözleşmesi. İki bite testi yapıldı: dağıtıcıdan bir dal silinince hem
`check` hem test kırmızı yanıyor, alt birim kimliği bir kayınca üç test düşüyor.
**1d'de doğrulandı:** Sayı gerçek bir tarayıcıda baştan sona okundu (Playwright,
üretim derlemesi): 28 sayfa, klavyeyle gezinme, folio, ilerleme çubuğu, letterbox
iki kırılımda, ve **hiçbir sayfa gizli kalmadan** açılıyor. 12 uçtan uca test.
Gömülü önizleme panelinde doğrulanamadı — o panel sayfayı boyamıyor, dolayısıyla
`requestAnimationFrame` ve `IntersectionObserver` orada hiç çalışmıyor; tuvalin
doğrulaması gerçek bir tarayıcı gerektiriyor.

**1e'de doğrulandı:** Üç sahne prototiple YAN YANA çizilip karşılaştırıldı
(kendi üretim derlemesinden sökülen SVG, prototipin `MAG.art.scene()` çıktısının
yanına konup aynı sayfada aynı CSS değişkenleriyle boyandı): `paper`, `portrait`
ve `sumi` aydınlık ve koyu temada birebir aynı, ensō tema dönünce mürekkepten
kâğıda geçiyor. Sayısal parite ayrıca `art.test.ts`'te: `rng` prototiple aynı
50 sayıyı veriyor, 14 sıçrama · imge sütunu · 5 mühür kesiği aynı koordinatlarda.
Bite testi — sıçramada iki `rand()` çağrısının sırası değiştirildi, parite
kırmızı yandı. Uçtan uca iki test eklendi: sahneler sayfaya gerçekten basılıyor
(0×0 değil) ve `url(#…)` başvurularının hepsi bir tanım buluyor. 234 birim +
14 uçtan uca test.


**Hız — canlıda doğrulandı (1e sonrası):**

| | önce | sonra |
|---|---|---|
| Sayfanın sunucu süresi | 563 ms (SSR) | **0 ms** — `robots.txt` ile aynı, statik |
| 1× masaüstü, tam okuma | 3.634 KB | **672 KB** |
| 2× telefon | 3.634 KB | **1.225 KB** |
| 3× telefon / 2× tablet | 3.634 KB | **2.182 KB** |
| Görsel önbelleği | her ziyarette 17 koşullu istek | 1 hafta |

`x-sveltekit-page` başlığı yanıttan kalktı — kanıt bu. Kalan ~500 ms ölçümün
yapıldığı konteynerin ağ mesafesi (tek başına TCP el sıkışması 300 ms), sunucu
işi değil. AVIF desteklemeyen tarayıcı kaynak webp'e düşüyor, hiçbir kayıp yok.

---

### ⏳ Faz 2 — Supabase ve kimlik

- [ ] Supabase projesi (**EU bölgesi — sonradan değiştirilemez**)
- [ ] `readers`, `reading_progress`, `issue_reads` + RLS
- [ ] Anonim giriş → takma ad/emoji/renk
- [ ] E-posta + 6 haneli kod; `reader.id` DEĞİŞMEZ
- [ ] Resend custom SMTP (yerleşik posta saatte ~2-3 mail, yetersiz)
- [ ] State ikiye ayrılır: cihaz tercihleri localStorage'da, okur verisi sunucuda

---

### ⏳ Faz 3 — Yorumlar

- [ ] Şema **YORUM-SISTEMI §6**'ya göre: `anchor_type 'block'|'point'|'page'`,
      `quote jsonb`, `featured bool` — PROJE.md §5.12'deki eski `'text'` şeması **değil**
- [ ] `status` trigger'la belirlenir (istemci yazamaz) + hız sınırı
- [ ] Saf algoritmalar aynen taşınır: kümelenme (0.14, `dy×4/3`), temsilci puanı
- [ ] Baloncuk + pop-up + thread + composer + eş okuma
- [ ] `/admin` moderasyon kuyruğu
- [ ] Pin sürükleme konumu artık kalıcı (prototipte yalnız bellekteydi)

---

### ⏳ Faz 4 — Bulmacalar

- [ ] 4 bulmaca custom element olarak taşınır (`uc-halka` 2026-10'a ait, gelmiyor)
- [ ] `puzzle_runs` + `puzzle_stats` view
- [ ] ⚠️ Açılışta istatistik **sıfır**: N < 20 iken karşılaştırma cümlesi gösterilmez

---

### ⏳ Faz 5 — Mod tamamlama ve analitik

- [ ] `streak.js` jetonsuz taşınır (altın kart kalır)
- [ ] Okuma süresi sunucuda duvar saatiyle sınırlanır
- [ ] `POST /api/e` → `events`. Doğrudan PostgREST'e **değil**: IP hiç Supabase'e
      ulaşmaz, olay şeması doğrulanır, toplama tek yerden kapatılabilir
- [ ] Günlük rollup (`events_daily`), panel ham tabloyu taramaz
- [ ] `/admin/analitik` — panel UI'ı aynen taşınır, veri kaynağı değişir
- [ ] Menüde "analitiği kapat" anahtarı + DNT/GPC uyumu

---

### ⏳ Faz 6 — Yayın hazırlığı

- [ ] PWA, statik OG görseli, erişilebilirlik denetimi, performans bütçesi
- [ ] Görseller AVIF/WebP + duyarlı boyutlar (yayın gününün en büyük tek kazancı)
- [ ] CSP + güvenlik başlıkları (tema betiğinin sha256'sı script-src'ye)
- [ ] `/gizlilik` + çalışan **"hesabımı sil"** düğmesi (olmadan gizlilik metni yalan olur)
- [ ] SPF/DKIM/DMARC — eksikse giriş kodları spam'e düşer
- [ ] Cloudflare Pages + DNS + Supabase prod
- [ ] `.github/workflows/deploy.yml` silinir (prototipin Pages yayını kapanır)
- [ ] `docs/` senkronu: PROJE.md §5.12 şemasını YORUM-SISTEMI §6 ile hizala

---

## 🚧 Yayın blocker'ları

Kod değil, karar. Hiçbiri çözülmeden 1.0 çıkamaz.

1. **Marka adı + alan adı.** `src/lib/brand.ts` şu an yer tutucu (`ornek.com`).
   `brand.test.ts` bunu bilerek test ediyor — gerçek alan adı girilince o test silinir.
2. **Favicon hâlâ SvelteKit şablonunun SVELTE LOGOSU.** `src/lib/assets/favicon.svg`
   turuncu Svelte işareti (`<title>svelte-logo</title>`). Derginin kendi imzası
   var — `src/lib/art/leaf.ts`'teki yaprak. Değişmeden yayına çıkarsa sekmede
   başka bir markanın logosu durur.
3. **`_headers`'taki önbellek süresi bir haftadan bir yıla çıkarılacak**
   (`max-age=31536000, immutable`) — sayı dondurulduktan sonra.
4. **Font lisansı.** `static/fonts/animeace2_reg.ttf` lisanssız. OFL/ticari kullanıma
   açık bir alternatifle değişecek, subset + woff2'ye inecek. Aday font
   `tokens.css`'teki Türkçe kapsam denetiminden aynen geçmeli (ç Ç ğ Ğ ı İ ö Ö ş Ş ü Ü;
   Anime Ace'te uzun tire — – yoktu).

---

## Karar bekleyen sorular

1. **Eş okuma varsayılan mı, kapalı mı?** (YORUM-SISTEMI §7.1) Öneri: kapalı.
2. **Prototip URL'i yayından sonra kalsın mı?** Öneri: kalsın, `noindex` + üstte bant.
3. **Yorum düzenleme yok, silme var** — 1.0 sadeliği için kabul mü?
4. ~~**`fit:contain` taşma denetimi** derleyici yokken nasıl?~~ **Kapandı (1d).**
   Playwright iki ekran ölçüsünde bütün sayfaları ölçüyor (`e2e/tuval.e2e.ts`).
   Cevap acı: **üç sayfa taşıyor** — `km-acilis`, `km-imza`, `son-kunye`. Sayfa
   `overflow: hidden` olduğu için metnin altı KIRPILIYOR ve hiçbir belirti yok.
   Gerileme değil, devralınan bir borç: prototip 1280×1000'de birebir aynı üç
   sayfada taşıyor (817/811/1343 → 747). Test şimdilik bu listeyi sabitliyor;
   düzeltmesi editöryel (aşağıda 6. madde).
5. **`min` modun vaadi zayıf:** `sozluk`, `gece-hatti` ve manga hiç kısalmıyor;
   gerçek ayrışma yalnız `kizil-mevsim` + `soylesi`'de. Editöryel iş: ya min sürümleri
   yazılacak ya vaat dürüstleştirilecek. (1.42'de `soylesi` 4/7/9'a genişledi —
   ayrışması arttı ama madde kapanmadı, diğer bölümler hâlâ tek sürümlü.)
6. **Taşan üç sayfa nasıl düzelecek?** (4. maddenin devamı) Üç seçenek:
   `fit: 'scroll'`e almak (en ucuz, ama `son-kunye` 1343px — o sayfa tuvalde
   bir sayfa olmayı hak etmiyor), metni kısaltmak, ya da sayfayı ikiye bölmek.
   Bu maddenin "önce script'in ömrü bitirilmeli" engeli **kalktı**: 1.42'de
   `src/content/` elle bakımlı hâle geçti, yani üç sayfa doğrudan düzenlenebilir.
   **Yayın öncesi kapanmalı** — şu an okur, üç sayfanın altını hiç göremiyor.

---

## Adım günlüğü

| # | Ne yapıldı | Neden / ölçüm |
|---|---|---|
| 0.1 | Node 22.23.2 + pnpm 11.22 kuruldu | Konteynerde Node 18.20 vardı (2025-04'te EOL). Vite 8 Node 20+ istiyor — yükseltme tercih değil, zorunluluktu |
| 0.2 | `sv create` ile iskelet | Tüm seçenekler non-interactive verildi; adapter `cloudflare`+`pages` |
| 0.3 | 🐞 Prettier tüm prototipi ve belgeleri yeniden biçimlendirdi | 56 dosya değişti. `git checkout` ile geri alındı; `.prettierignore`'a `/prototype/`, `/docs/`, `/AI_GUIDE.md` eklendi |
| 0.4 | 🐞 `sv create` `.gitignore`'u ezdi | Ham PNG kuralı (8,8 MB) kayboldu, dosyalar izlenmeye aday oldu. İki liste birleştirildi |
| 0.5 | CSS Prettier kapsamı dışında bırakıldı | Önce override denendi ama Prettier CSS'te tırnakları da değiştirdi ve parite bozuldu. `.prettierignore` daha temiz: 6 dosya prototiple **bayt bayt aynı**, `tokens.css` yalnız font yolunda ayrılıyor |
| 0.6 | Parite testi yazıldı | Pariteyi yoruma değil teste bağladı. Bir dosya bilerek ayrılırsa `FORKED` listesine nedeniyle taşınır |
| 0.7 | ESLint `prototype/`'i dışladı | 32 hatanın hepsi oradaydı: IIFE düzeni ve `window.MAG` bilinçli kararlar, düzeltilmeyecek |
| 0.8 | `@layer` ile kaskad sırası beyan edildi | Prototipte sıra `index.html`'deki `<link>` sırasına bağlıydı — bir satır kayarsa tema bozulurdu. Artık sıra kaskadın kendisinde |
| 0.9 | 🐞 Sonda tuvalinde `--pad-page` dolgusu container'ın kendisine verilmişti | Bir öğe kendi container'ı olamaz → `cqi` viewport'a düşüyor, dolgu 28px yerine 102px oldu. Dolgu içteki katmana alındı (gerçek yapı da `.canvas > .page__inner`) |
| 0.10 | 🐞 Faz 0 sayfası zemine doğrudan yazıyordu | `base.css` gövdeye koyu `--backdrop` ve `overflow:hidden` veriyor (kaydırma tuvalin içinde olmalı). Aydınlık temada `--ink` okunmuyordu ve sayfanın altı erişilemezdi. Sayfa kendi kâğıt yüzeyini kurup kendi içinde kaydırıyor |
| 1.1 | `types.ts` — 19 blok `t` üzerinden ayrımlı birlik | Blok bileşenlerini yazarken `switch (b.t)` tam kapsam denetimine giriyor: yeni tip ekleyip bir yerde unutmak derleme hatası. `term`/`rtlhint` bilerek dışarıda (yalnız 2026-10) |
| 1.2 | Taşıma elle değil script'le (`tools/tasi-icerik.mjs`) | 90 blok elle kopyalanırsa kayan tek bir tırnak içeriği sessizce bozar ve diff'te kaybolur. Script prototipi sahte bir `window` altında çalıştırıp çıktıyı Prettier'dan geçiriyor — sonuç yeniden üretilebilir |
| 1.3 | Blok kimliği türetilmekten çıkıp veri oldu | Prototipte kimlik çizim anında `page.id + ":" + i`'den geliyordu: bir blok yer değiştirince ona bağlı yorumlar sessizce komşu paragrafa kayıyordu. Artık dosyada yazılı; taşımak bilinçli bir karar |
| 1.4 | Bulmacaların `stats` alanı düşürüldü | `plays: 1284`, `firstTryRate: 0.34`… hepsi uydurmaydı. İçerik dosyasında durmaları onları gerçek istatistik gibi sunmak olurdu. Gerçek sayılar Faz 4'te `puzzle_stats`'tan |
| 1.5 | İçerik parite testi (11 test) | CSS'te işe yarayan sözleşmenin aynısı: taşınan sayı her çalıştırmada script çıktısıyla karşılaştırılıyor. Bilerek bozulan bir cümleyle kırmızı yandığı doğrulandı. 1.0 "tek sayı, bugünkü hâliyle" kararına dayanıyor — içerik editöryel olarak açılırsa test silinir |
| 1.6 | 🐞 Parite testi üretilen klasörün içine konmuştu | Taşıma script'i `src/content/<slug>/`'i her çalıştırmada siliyor; ikinci çalıştırma testi de sildi. Test `src/lib/content/`'e taşındı, script'in başına uyarı yazıldı: o klasörün sahibi script |
| 1.7 | `validate.ts` throw etmiyor, liste döndürüyor | Bir sayı hazırlanırken on hatası olabilir; ilkinde patlayan doğrulayıcı on kez çalıştırılan doğrulayıcıdır. Dosya sistemine de bakmıyor — saf kalsın, tarayıcıda da çalışsın |
| 1.8 | Doğrulayıcı 11 bozuk örnekle sınandı | Sadece "gerçek içerik temiz geçiyor" testi yazmak yeterli değil: her zaman boş liste döndüren bir fonksiyon da geçer. Her kuralın bilerek bozulmuş bir örneği var |
| 1.9 | `blockids.lock.json` elle bakımlı bırakıldı | Üreteç script'i yazılabilirdi ama kilit tam da "otomatik tazelenmesin" diye var: bir kimliği silmek kilitten de silmeyi gerektiriyor, o da diff'te görünen bilinçli bir satır. CSS'teki `FORKED` listesiyle aynı mantık |
| 1.10 | Varlıklar 1e'den öne alındı | `img:` yolunun geçerliliğini denetleyen bir test, dosyalar `static/` altında değilken ya yalan söyler ya kapalı durur. 17 webp (3,6 MB) `static/assets/`e kopyalandı; prototipteki kopya dokunulmaz kaldığı için ikizleme kaçınılmaz |
| 1.11 | Satır içi biçimleme dizgi değil JETON döndürüyor | Prototipin `U.inline()`'ı HTML dizgisi üretiyordu ve `innerHTML`e basılıyordu. Aynı fonksiyon Faz 3'te okur yorumlarını biçimlendirecek — o gün `{@html}` ile basılan bir dizgi, sunucudan gelen metnin tarayıcıda HTML olarak çalışması demek. Jeton listesi o kapıyı hiç açmıyor |
| 1.12 | Blok sarmalayıcısı yok, öznitelikler YAYILIYOR | `.blk` sınıfı bloğun kendi kök öğesinde olmak zorunda: CSS `.page__inner > .blk + .blk` (doğrudan çocuk) ve `.blk--invert.caption` (aynı öğe) diyor. Araya bir `<div>` koymak aralıkları ve ters çevirmeyi birden bozardı |
| 1.13 | Dağıtıcının sonunda `bilinmeyenTip(block: never)` | Prototip bilinmeyen bir tipte konsola uyarı basıp bloğu ATLIYORDU: sayfada eksik bir paragraf, hiçbir yerde hata. Artık `types.ts`'e eklenip dağıtıcıya yazılmayan tip `pnpm run check`'i kırıyor. Bir dal silinerek denendi, iki yerden birden kırmızı yandı |
| 1.14 | Kapak künyeyi küresel değil BAĞLAM'dan okuyor | Prototipte `MAG.data.issue` küreseldi. Sunucuda aynı anda iki isteğin iki farklı sayısı olabilir; küresel değişken ikisini karıştırır. Bağlamı 90 bloğa prop olarak geçirmek yerine `setIssueContext` — künyeye 19 tipten yalnız biri bakıyor |
| 1.15 | Varlık yoluna baştaki eğik çizgi eklendi (`assetUrl`) | Prototipte `index.html` kökten açıldığı için `assets/…` çalışıyordu. Sayı `/sayi/2026-09` gibi bir rotada açılınca aynı yol `/sayi/assets/…` olur ve görsel SESSİZCE kırılır — yani kırıldığını ancak biri bakarsa anlarsınız |
| 1.16 | İçerikteki bağların dış adres olması doğrulayıcıya bağlandı | Bloklar bağları `target="_blank"` ile basıyor; bu yalnız dış adres için doğru. ESLint'in `no-navigation-without-resolve` kuralı burada susturuldu ama garanti kaybolmadı, `validate.ts`'e taşındı: sayı içine giden bir bağ artık içerik doğrulamasında kırılıyor |
| 1.17 | Manga filigranı pop-up yerine bağ oldu | Pop-up katmanı Faz 3'te geliyor. "Hiçbir şey yapmayan düğme" ile "doğrudan kaynağa giden bağ" arasında ikincisi dürüst: pop-up'ın SÖYLEDİĞİ şey (`aria-label` + `title`) duruyor, yalnızca sunum biçimi değişti. `href` yoksa filigran `<span>` — sahte tıklanabilirlik yok |
| 1.18 | 🐞 `%sveltekit.body%` doğrudan `<body>` içindeydi | Katalog sayfası iframe'de çalışıyor, sekmenin kendisinde BOMBOŞ geliyordu. Sebep: `<body>`ye dışarıdan sokulan bir düğüm hidrasyon sırasını kaydırıyor, Svelte "hydration_mismatch" deyip ağacı temizliyor. Bu, eklentisi olan gerçek okurların da başına gelirdi. `<div style="display: contents">` ile sarıldı |
| 1.19 | 🐞 Katalog kartı `--canvas-h`yi `auto` bırakmıştı | Manga "plan" sayfası kartta taşıyordu. `blocks.css` sayfanın boyunu `calc(var(--canvas-h) - …)` ile hesaplıyor; `auto` orada geçersiz bir calc üretiyor. Tuvalin sözleşmesi bir UZUNLUK vermek — `aspect-ratio` ile idare etmek onu bozdu. Bloklarda hata yoktu, ölçen kaptaydı |
| 1.20 | Katalog "tip"e değil "ÇEŞİT"e göre kuruldu | İlk hâli her tipin sayıdaki ilk örneğini gösteriyordu ve sayıdaki ilk `h1` düz, ilk `list` madde listesiydi: `h1--big` ve sözlük katalogda hiç görünmüyordu. Yani kapsadığını sandığı yüzeyin yarısını kaçırıyordu. Artık ayırt edici bayrakların her bileşimi ayrı bir kart — 19 tip, 29 çeşit |
| 1.21 | Tuval aritmetiği DOM'dan ayrıldı (`geometry.ts`) | Prototipte letterbox eşiği, sayfa seçimi ve adım hesabı olay dinleyicilerinin gövdesindeydi: "eşik doğru mu?" sorusunu sormanın tek yolu pencereyi sürüklemekti. Girdi sayı, çıktı sayı olunca her eşiğin iki yanı da yazılabildi (23 test) |
| 1.22 | 🐞 `metrics` `$state`ti ve tuvali FELÇ ediyordu | Ölçüm effect'i aynı diziye hem yazıp hem okuyordu → sonsuz döngü → Svelte `effect_update_depth_exceeded` atıp effect'leri bırakıyor. Sayfa çiziliyor ama kaydırma, folio ve ilerleme ölü doğuyor; konsolda tek satır, ekranda hiçbir belirti. Dizi zaten yalnız olay işleyicilerinde okunuyor — reaktif olmaması döngüyü baştan imkânsız kılıyor |
| 1.23 | `data-inview` "true" doğuyor, "false" değil | Giriş animasyonları `opacity: 0` ile başlıyor. "false" ile doğan bir sayfa, kendisini açacak JS herhangi bir sebeple çalışmazsa (betik yok, IntersectionObserver yok, sekme hiç boyanmamış) SONSUZA KADAR görünmez kalır. Prototip tam da öyleydi: `if (!('IntersectionObserver' in window)) return;` — eski tarayıcıda dergi bomboş. Sıra tersine çevrildi: sayfalar görünür doğuyor, tuval yalnız ekranın altındakileri gizleyip gözlemciye veriyor |
| 1.24 | 🐞 Hızlı basılan tuşların üçte ikisi yutuluyordu | `scrollTo({behavior:'smooth'})` hemen bitmiyor; ikinci basış yol yarıdayken geldiğinde `current` hâlâ eski sayfaydı ve basış aynı sayfayı yeniden hedefliyordu. Uçtan uca testte 27 basış 10 sayfa ilerletti. Gezinme artık hedefi anında yazıyor; kaydırma konumunun sözü animasyon oturunca geçerli |
| 1.25 | Uçtan uca testler ÜRETİM derlemesine bakıyor | Tuvalin üç can damarı (rAF, IntersectionObserver, yumuşak kaydırma) yalnızca BOYAYAN bir tarayıcıda çalışıyor — gömülü önizleme paneli boyamıyor ve orada tuval "bozuk" görünüyordu. Playwright hem gerçek tarayıcı hem gerçek derleme: dev sunucusunda çalışıp derlemede kırılanı yayın günü öğrenmek istemiyoruz |
| 1.26 | Taşma denetimi "0 taşma" değil, BİLİNEN LİSTE sabitliyor | Üç sayfa taşıyor ve prototip birebir aynı üçünde taşıyor — yani devralınan borç. "0 bekle" demek testi kalıcı kırmızıya, "hiç bakma" demek borcu görünmezliğe mahkûm ederdi. Liste büyürse de küçülürse de kırmızı yanıyor |
| 1.27 | Canlı yayın GitHub Pages'e değil Cloudflare'e bağlandı | Pages'e statik basmak bugün mümkündü (sunucu uç noktası yok, `/sayi/[slug]` zaten `entries()` üretiyor) ama `adapter-static` + `base: '/sergi'` + `.nojekyll` iskelesi Faz 2'de silinecekti: Supabase girişi, yorum uçları ve Resend postaları sunucu ister, Pages yalnız statik dosya sunar. Cloudflare zaten kilitlenmiş yığın kararı ve kodda tek satır değişiklik istemedi. Pages prototip arşivi olarak kaldı — parite testleri ona bakıyor |
| 1.28 | "Gece Hattı"nın üç karesi sayıdan DÜŞÜRÜLDÜ | Beş sayfalık foto-öykünün üç sayfasında arka plan `photo:<seed>`ti: çekilmiş bir kare değil, `art.js`'in seed'den ürettiği rastgele daire ve dikdörtgenler. Altyazı belgesel dilinde konuşuyor ("00:19 — Turnikeler. Tek ses, kartların çıkardığı ses."), altındaki görüntü uydurma. Uydurma bulmaca istatistikleriyle aynı karar. Düşürme `tasi-icerik.mjs`'te açık bir listede — elle silinse taşıma script'inin ilk koşusunda geri gelirdi. Test iki yönlü: liste boşalırsa da, prototip değişip sayfalar oradan kalkarsa da kırmızı yanıyor (boşaltılarak denendi, iki test düştü) |
| 1.29 | 1e 22 sahne değil 3 sahne ⚠️ **SAYI EKSİK, bkz. 1.41** | Plandaki 22, `art.js`'in TOPLAM sahne sayısıydı. Kızıl Mevsim'in gerçekte çağırdığı `bg: scene:` değerleri sayıldı: `paper` ×2, `sumi`, `portrait`. Kalan 19'u (`neon-city`, `terminal`, `circuit`, `emaki`…) yalnız 2026-10 kullanıyor — `term`/`rtlhint` bileşenlerini taşımama kararıyla aynı. 1.0'da hiçbir sayfanın çağırmayacağı 19 bileşen, test edilemeyen ve gözle doğrulanamayan ölü kod olurdu |
| 1.30 | Sahne adı `string` değil `SceneName` | Prototipte `A.scene()` bilinmeyen adı sessizce `paper`e düşürüyordu: `scene:tori` yazım hatasının cezası boş bir kâğıt sayfaydı ve kimse fark etmezdi. Artık ad üç yerden birden kapanıyor — `Background` tipi derlemede, `validate.ts` içerikte, `Scene.svelte`'in `never` dalı dağıtıcıda. `bilinmeyenTip(block: never)` kararının (1.13) sahne karşılığı |
| 1.31 | Sahne id'leri `$props.id()` ile örnek başına benzersiz | Prototip degradeye sabit `pg` id'si veriyordu. Bir belgede id'ler tekil olmak zorunda: aynı sahne iki kez çizilseydi ikinci `url(#pg)` birincinin degradesini gösterirdi. Prototipte fark edilmedi çünkü her sahne sayıda bir kez geçiyor — yani hata değil, patlamamış bir mayındı. Uçtan uca test artık hem benzersizliği hem her başvurunun karşılığını ölçüyor |
| 1.32 | Sahne geometrisi bileşenden ayrı (`sumi.ts`) | `sumi` 14 sıçramayı, 5 imgeyi ve mühür kesiklerini tohumdan üretiyor. Elle taşınan böyle bir üreteç "çalışıyor" görünür — yanlış tohumda da makul bir kompozisyon çıkar, sadece prototipteki çıkmaz. Sayılar SVG'den ayrılınca prototipin kendi çıktısıyla karşılaştırılabildi. `canvas/geometry.ts` ile aynı gerekçe (1.21) |
| 1.33 | `rng` `Math.random()` değil, tohumlu | Dergi sayfası bir kompozisyon; her ziyarette yeniden zar atılan bir şey değil. Ayrıca sunucuda çizilenle tarayıcıda hidratlanan tutmazdı — Svelte `hydration_mismatch` deyip ağacı temizler, okur boş sayfa görürdü (1.18'de tam olarak bu yaşandı) |
| 1.34 | Cloudflare hedefi Pages değil WORKERS | İlk dağıtım `Missing entry-point to Worker script` diyerek düştü: panel projeyi Workers olarak açmış ve `wrangler deploy` koşuyordu, ama `wrangler.jsonc`'de Pages'in anahtarı (`pages_build_output_dir`) vardı. İkisi aynı dosyayı okumuyor — Workers `main` + `assets.directory` + `assets.binding` istiyor. Workers'a geçildi çünkü Cloudflare yeni projeleri oraya yönlendiriyor ve adaptör ikisini de destekliyor; fark yalnızca `wrangler.jsonc`'de. Eksik anahtar artık DERLEME hatası (adapter-cloudflare/utils.js doğruluyor), yani sorun Cloudflare'e çıkmadan yerelde görünüyor. `pnpm preview` de `wrangler pages dev`'den `wrangler dev`'e geçti; uçtan uca 14 test gerçek Worker'a karşı yeşil |
| 1.35 | `wrangler types --check` `build`in İÇİNDEN çıkarıldı | Bu kontrol dağıtımı ikinci kez düşürecekti ve sebebi ince: `wrangler types`, `main`'in gösterdiği dosya diskte VARSA çıktıya bir satır daha ekliyor (`mainModule: typeof import("./.svelte-kit/cloudflare/_worker")`). Cloudflare temiz bir ağaçta derliyor — orada o dosya henüz yok, yani commit'lenmiş tipler ne olursa olsun kontrol düşerdi. Üstüne, o satır commit'lenirse `checkJs` üretilmiş Worker'ı tip denetimine sokup `pnpm check`'i 747 hatayla patlatıyor (yaşandı). Cloudflare'in kendi SvelteKit şablonu da `build`e böyle bir kontrol koymuyor. `build` artık yalnız `vite build`; sözleşme `src/lib/deploy.test.ts`'e taşındı ve üç iddiası da bilerek bozulup kırmızı yandığı görüldü |
| 1.36 | Sayı rotası önceden çiziliyor (`prerender = true`) | Sayfa her istekte sunucuda üretiliyordu (canlıda TTFB 563 ms, `x-sveltekit-page: true`) ama içerik uygulama paketinin içinde — sunucu hiç değişmeyen bir girdiden hep aynı HTML'i kuruyordu. `entries()` zaten bu iş için yazılmıştı, bayrak açılmamıştı. Bedava bir yan etkisi oldu: prerender kırık bağları geziyor ve `/favicon.svg`'nin canlıda 404 verdiğini ortaya çıkardı — `app.html` onu `static/`te arıyordu, dosya `src/lib/assets/` altındaydı. Faz 3'te yorumlar istemcide yüklendiği için bu satır bozulmuyor |
| 1.37 | Görsel ve font önbelleği `_headers` ile açıldı | Adaptörün ürettiği `_headers` yalnız `/_app/immutable/*`ı kapsıyor; 3,6 MB'lık görseller Cloudflare varsayılanına (`max-age=0, must-revalidate`) kalıyordu, yani her ziyarette 17 koşullu istek. Süre bilerek BİR HAFTA: sayı hâlâ yapımda ve görseller yeniden kodlanıyor, bir yıllık `immutable` verilseydi hem tarayıcı hem kenar eski dosyayı tutardı |
| 1.38 | Görseller AVIF türevleriyle, `srcset` üzerinden | Canlıdan ölçüldü: sayıyı baştan sona okumak 3.947 KB ve %97'si görsel — kod tarafında kazanılacak 100 KB bile yok. İlk denenen şey İŞE YARAMADI: aynı boyda webp'i yeniden kodlamak, dosyaları q78'de BÜYÜTTÜ; kaynaklar zaten verimli, ağırlık ince dokudan geliyor (yaprak, tapınak). İki gerçek kaldıraç kaldı — ölçek (tuval masaüstünde 560 CSS px'te sabitleniyor, 1200px göndermek dört kat israf) ve format (AVIF ince dokuda webp'ten belirgin iyi). Sonuç: 1× masaüstü 3.634→672 KB (%82), 2× telefon 1.225 KB (%66), 3× telefon 2.182 KB (%40). AVIF bilmeyen tarayıcı kaynak webp'e düşüyor, hiçbir şey kaybetmiyor |
| 1.39 | Türevler tahmin edilmiyor, MANİFESTTEN okunuyor | Her dosya her boyu alamıyor (`logo.webp` 256px, `kapak.webp` 1200px) ve upscale hem israf hem yalan. "Hep üç boy vardır" varsayımı olmayan bir türevi `srcset`e yazardı — üstelik `<source>` tarayıcıyla eşleştiği için 404 alındığında `<img>`e DÜŞMEZ, okur kırık görsel görür. Bu yüzden `tools/gorsel-turevleri.mjs` bir manifest yazıyor ve 47 türevin her biri ayrı testle diskte aranıyor |
| 1.40 | `<picture>` sarmalayıcısı için `canvas.css` FORK EDİLMEDİ | Sarmalayıcı `.page__bg > img` çocuk seçicisini kırıyor. Kural `PageBackground.svelte`'in kapsamlı stiline kopyalandı: `canvas.css` prototiple bayt bayt aynı ve 14 KB'lık bir dosyayı tek satır için FORKED listesine taşımak, dosyanın tamamındaki parite güvencesini kaybetmek olurdu. Üç satırlık ikizleme bir dosyalık kör noktadan ucuz. `.manga-panel__art img` torun seçici olduğu için orada değişiklik gerekmedi |
| 1.41 | 🐞 1.29'daki sahne sayımı EKSİKTİ: 3 değil 7 | Tanıtım kartları da sahne çağırıyor (`leaves`, `waves`, `street`, `torii`) ve sayım onları atlamıştı. Sebep: arka planlar `bg: 'scene:paper'` biçiminde yazılıyor, tanıtım kartları ise `scene: 'leaves'` diye ÇIPLAK bir alan kullanıyor — sayım ilk biçimi arayan bir regex'ti. Tip denetimi de yakalayamadı çünkü `IntroCard.scene` düz `string`; `Background` için kapatılan delik burada açık kalmıştı. Sıkıştırılıp denendi: `check` tam o dört adı sayarak kırmızı yandı. Ders, sayımın kendisinden büyük — bir alanı `string` bırakmak, o alanın doğruluğunu insan dikkatine havale etmek demek |
| 1.42 | İçerik editöryel olarak AÇILDI: söyleşi gerçek röportajla değişti | "Fener Ustası" uydurma bir söyleşiydi — tohum yorumlar ve uydurma bulmaca istatistikleriyle aynı türden bir borç, ama farkı şu: o ikisi *gösterilmiyordu*, bu okunuyordu. Yerine KargaManga ile yapılmış gerçek röportaj girdi (8 soru-cevap + 8 çizim, kaynak dizgi dosyası). Düzen prototipten alınmadı: PDF iki sütunlu, tuval dikey ve snap'li — taşınan şey yalnız metin ve hangi çizimin hangi cevaba ait olduğu. Her soru-cevap KENDİ sayfasına ayrıldı, yani snap "bir soru, bir cevap, bir çizim" demek oldu. Bedeli önceden biliniyordu ve ödendi: `content/parity.test.ts` prototiple bayt bayt pariteyi bekliyordu ve kendi notu "içerik açılırsa silinecek, esnetilmeyecek" diyordu — silindi, `integrity.test.ts` olarak yalnız sayının kendi tutarlılığı kaldı; `tools/tasi-icerik.mjs` emekli oldu (bugün çalıştırılsa röportajı siler, başına ⛔ yazıldı). CSS paritesi bundan etkilenmedi, orada prototip hâlâ referans |
| 1.43 | 20. blok tipi: `figure` | Sayının 19 tipinde görsel taşıyan TEK tip `manga`'ydı; bir görseli sayfaya koymanın diğer yolu `bg: 'img:…'`, yani onu sayfanın TAMAMINA sermekti. Söyleşinin istediği bunun tersi: soru-cevap okunur, altında çizim durur. `PageKind`'da zaten bir `figure` vardı ama o yalnız `data-kind` yazan bir etiket. Stil `blocks.css`'e YAZILMADI, bileşenin kapsamlı `<style>`ına girdi — 1.40'ın aynısı: prototiple bayt bayt eşit bir dosyayı tek blok için FORKED'a taşımak, dosyanın tamamındaki parite güvencesini kaybetmek olurdu. Altyazı `<Inline>`'dan geçiyor (`caption` bloğuyla aynı metin türü, farklı davranması tutarsızlık olurdu) ve `alt` zorunlu — manga karesindeki borcun aynısı |
| 1.44 | 🐞 Banner arka plan olarak DENENDİ ve olmadı | Söyleşinin açılışına KargaManga kanal afişi arka plan yapıldı; tarayıcıda bakılınca 1707×282'lik şeridin `cover` ile 3:4 sayfaya oturduğu, yani ortasından dar bir dilimin altı kat büyütüldüğü görüldü — okunmayan, bulanık bir "AM" parçası. Afiş kendi oranında bir `figure` bloğuna alındı, sayfanın arka planı `scene:portrait` olarak kaldı. Yan fayda: `portrait` sahnesi tek kullanıcısını kaybetmiş oluyordu (e2e'de `SAHNELI_SAYFA` 4→3 diye kırmızı yandı, hatayı bu yakaladı) — geri döndü. Ders: bir görselin "arka plan olur mu" sorusu ancak gerçek oranıyla gerçek tuvalde cevaplanıyor, içerik dosyasına bakarak değil |
| 1.45 | Söyleşinin açılışı: kanal afişi DEĞİL, çizerin karga portresi | 1.44'te afiş arka plan olmaktan çıkıp kendi oranında bir `figure` bloğuna alınmıştı; o da tutmadı — 1707×282'lik bir şerit dikey bir açılış sayfasının ortasında kartvizit gibi duruyor, sayfanın sesini kurmuyor. Yerine çizerin kendi karga portresi geldi: dikey, tuvalin oranına yakın (0.56 ↔ masaüstünde 0.75, telefonda 0.53) ve bölümün tonu zaten bu. Ölçüldü: masaüstünde dikey %25 kırpılıyor (üstteki "KARGAMANGA" filigranı gidiyor, kompozisyon kazanıyor), telefonda neredeyse birebir oturuyor. ⚠️ Bilinen borç: kaynak **405×720**, yani 1.38'in arka plan için hesapladığı 1200×1600'ün çok altında — masaüstü retina'da 1120×1493 gerekiyor, elde 405×720 var, ~2.8× büyütülüyor. Karanlık ve yüksek kontrastlı bir çizim olduğu için taşıyor ama yumuşaklık görülüyor; yüksek çözünürlüklü kopya bulunursa dosya değişecek. Yan etki: `portrait` sahnesi tek kullanıcısını kaybetti, `SAHNELI_SAYFA` 4→3 (e2e bunu yakaladı) |
| 1.46 | Röportajın sekiz sayfası için sekiz aday, üretime dokunmadan | `sy-1…sy-8` sekiz kez aynı görünüyordu (rozet · soru · cevap · görsel) ve toplamı bir dergi bölümü değil bir sohbet dökümü gibi okunuyordu. Adaylar tek tek CSS denemesi olarak değil, `/dev/soylesi`de YAN YANA üretildi: seçim ancak karşılaştırmayla yapılabilir. İkinci karar, adayları çizerin kendi görsel dilinden türetmekti — kaynaklar 400×180, yani makale fotoğrafı değil VİDEO KARESİ; tarama çizgisi, hâle konturu ve 20:9 oran adayların çoğunun çıkış noktası oldu. Sayfaya "hepsi aynı sayfayı çizsin" seçicisi kondu ve bu, üç sessiz kırığı yakaladı: (a) `Numara`da rakamla soru negatif marjla bindiriliyordu — kısa soruda hoş, sy-4'ün beş satırlık sorusunda rakamın üstüne yazıyor; (b) `Marj`da soru dikey diziliyordu ve sy-4'ün 230 karakteri dört dikey satır olup cevaba tek kelimelik sütun bırakıyordu, `overflow: hidden` de onu okunamaz hâlde kesiyordu — rayda artık sabit uzunlukta bir künye var, sorunun kendisi değil; (c) o rayın genişliği `7cqi` diye TAHMİN edilmişti, dikey metnin gerçek blok ölçüsü 41px çıktı ve fazlası sessizce cevabın üstüne biniyordu — sütun `auto` oldu. Üçü de tek bir sayfada, gözle değil ölçerek bulundu (çakışma ve "karenin yüzde kaçı örtülü" sorgusuyla). Kalan iki dürüst zayıflık kayda geçti: `Film Karesi`nde uzun soru karenin %54'ünü örtüyordu (zemin yüksekliği verilip %39'a indi), `Dizgi`de sy-4 kartı 469px'ten 1128px'e uzuyor. Üretimdeki hiçbir dosya değişmedi — `Dialog.svelte`, `Figure.svelte` ve `blocks.css` (prototiple bayt bayt eşit) elle sürülmedi; kazanan seçilince taşınacak, `/dev/soylesi` silinecek |
| 1.47 | **Kazanan: 3 · Balon.** Röportaj sekiz sayfasıyla üretime geçti | 1.46'nın sekiz adayından `Balon` seçildi ve `/dev/soylesi`den `sy-1…sy-8`'e taşındı: soru çizimin üstüne binen Anime Ace balonunda, cevap köşeli manga anlatı kutusunda. Rozet ("S" / adın baş harfi) öldü — soruyu balonun kendisi işaretliyor, cevabı kutunun tepesindeki TAM ad. Taşımanın asıl kısıtı içerikti: blok sırası kilitli (`sy-N:0` soru, `:1` cevap, `:2` çizim) ve `integrity.test.ts` her kimliği `sayfaId:index` olmaya zorluyor, kimlikler de yorum ankrajı — blokları görsel sıraya dizmek sekiz sayfalık bir tasarım tercihi için okurların yorumlarını sayfa seviyesine düşürürdü. Bu yüzden **içerik değil düzen değişti**: `Page.svelte`'de `[data-kind="interview"]` ızgarası DOM sırasını koruyup yerleşimi `grid-row` ile veriyor ve akışın yapamadığını yapıyor — çizimle balonu aynı göze koyup bindiriyor. Açılış sayfası kapsam dışı kaldı, çünkü `kind: 'opener'` taşıyor. `blocks.css` yine ELLENMEDİ (1.40/1.43'ün aynısı: tek tasarım için bayt bayt pariteyi kaybetmek); stil katmansız bileşen `<style>`ına yazıldı, app.css'in katman beyanı gereği zaten `blocks.css`'i eziyor. 🐞 İki hata gözle değil ÖLÇEREK bulundu: (a) figüre verdiğim `margin-top` sessizce düşüyordu — yine benim yazdığım `.blk + .blk { margin-top: 0 }` sıfırlaması daha özgüldü ve kendi kuralımı eziyordu (`:not(.figure)` muafiyeti eklendi); (b) çizim balonun ÜSTÜNE boyanıyor, sorunun üst satırlarını yutuyordu — soru DOM'da çizimden önce geliyor ve aynı gözü paylaşan iki öğede sonra gelen kazanıyor. İkincisi özellikle sinsiydi: kısa sorularda balon resmin altında kaldığı için hiç görünmüyor, yalnız sy-4 gibi uzun sorularda ortaya çıkıyordu (`z-index: 1`). Ölçüldü: çizim tam kanıyor (0→252, sayfanın tepesinden), balon 48.6px altına taşıyor, kuyrukla cevap kutusu arasında 10px kalıyor — `/dev/soylesi` kartındaki geometrinin aynısı. ⚠️ Yeni ve kabul edilen zayıflık: balonun yeri artık ÇİZİMİN YÜKSEKLİĞİNE bağlı, oysa `Figure.svelte` `width`/`height` yazmıyor (oranlar 2.00–2.22 arasında değişiyor, sabit `aspect-ratio` altıncı görseli %10 kırpardı — 1.43'ün "kırpma" kararı). Yani görsel geç inerse balon zıplar. Sekiz sayfa tek tek ölçüldü: hepsinde görsel sayfa görünür olmadan yükleniyor, yerelde zıplama oluşmuyor — yavaş bağlantıda oluşabilir. Kalıcı çözüm görsel boyutlarını manifeste yazmak; `gorsel-turevleri.json` şu an yalnız GENİŞLİK tutuyor. `/dev/soylesi` **silinmedi**: yedi aday çizilmemiş yolu taşıyor, ama artık bir ayna değil kopya ve başına o uyarı yazıldı |
