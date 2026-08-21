# Gerçek Build — Canlı İlerleme

Prototipten (`prototype/`) gerçek 1.0'a geçişin adım listesi. Prototipin kendi
ilerleme dosyası [PROTOTIP-TODO.md](PROTOTIP-TODO.md) artık **kapandı**; bu dosya
onun yerine geçer. Mimari gerekçeler için [PROJE.md](PROJE.md), yorum sisteminin
kararları için [YORUM-SISTEMI.md](YORUM-SISTEMI.md).

---

## Nerede kaldık?

| | |
|---|---|
| **Aktif adım** | Faz 1 — tuval, bloklar, içerik (**1a bitti**, sırada 1b) |
| **Son tamamlanan** | **1a — içerik taşındı**: 9 bölüm / 29 sayfa / 90 blok / 19 tip, hepsi tipli |
| **Sonraki dosya** | `src/lib/content/validate.ts` — çalışma anı doğrulaması + `blockids.lock.json` |
| **Çalışır durum** | `pnpm dev` → http://localhost:5173 · `pnpm run lint` · `pnpm run check` · `pnpm test:unit` (23 test) hepsi yeşil |

**Ortam notu:** Node 22 LTS gerekiyor (Vite 8 Node 20+ istiyor). Konteynerde
`/usr/local` altına kuruldu, `pnpm` corepack ile geldi. Node 18 ile çalışmaz.

---

## Kilitlenmiş kararlar

Bunlar tartışıldı ve kapandı; yeniden açmak için yeni bir sebep gerekir.

| Konu | Karar |
|---|---|
| 1.0'da kaç sayı | **Tek**: "Kızıl Mevsim" (2026-09), bugünkü hâliyle |
| Tohum yorumlar | **Girmiyor.** Yorum katmanı boş açılır — uydurma kişileri gerçek okur gibi sunmuyoruz |
| Keşfet + jeton ekonomisi | **Kapsam dışı** |
| Dil seçici (TR/EN/JA) | **Kapsam dışı** — 1.0 tek dilli, sıfır çeviri varken üç dil vaat etmek yalan olur |
| Alıntı kartı PNG | **Kapsam dışı** |
| Editör analitik paneli | **Kapsam içi**, ama gerçek olay verisiyle |
| İçerik biçimi | **Tipli TS dosyaları.** Markdown derleyicisi 2. sayıya ertelendi |
| Blok kimliği | **Veri, türetme değil.** Biçim prototipteki gibi `sayfaId:index` — eski ankrajlar geçerli kalsın diye |
| Uydurma bulmaca istatistikleri | **Taşınmıyor.** Tohum yorumlarla aynı gerekçe: sahte sayıyı gerçek gibi göstermiyoruz |
| Varlık yolları | `img:assets/…` prototiptekiyle aynı → `static/assets/`. `assets/` atılsaydı `/2026-09` sayı rotasıyla çakışırdı |
| Yığın | SvelteKit + Svelte 5 + TS + Supabase + Resend + Cloudflare Pages |
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
- [ ] **1b** `validate.ts`: kayıtlı blok tipi, geçerli `depth`/`fit`,
      var olan `img:` yolu (dosya denetimi 1e'deki varlık taşımasından sonra açılır)
- [ ] **1b** `blockids.lock.json` — kimlik silinirse CI kırmızı yanar
- [ ] **1c** 19 blok bileşeni (`term` ve `rtlhint` taşınmıyor — yalnız 2026-10'da)
- [ ] **1d** `canvas/` — letterbox, dock ölçüsü, snap, IntersectionObserver, klavye
- [ ] **1e** `art/` — 22 SVG sahne + `photo()` + `mangaPanel()`
- [ ] **1e** Varlıklar `static/`e: 17 webp (3,7 MB)
- [ ] **1f** Derinlik: `flow()`/`pageVisible()`/`estimateMinutes()`, mod seçici, konum koruma
- [ ] **1f** Tanıtım (intro) 5 kartı
- [ ] `/dev/bloklar` katalog rotası
- [ ] `tokens.css`'ten kullanılmayan sayı temalarını (2026-08/10/11) ayıkla

**Doğrulama:** 29 sayfa telefonda ve masaüstünde akıcı; min 18 / mid 24 / full 28
sayfa; mod değişince okunan yer kaybolmuyor; `prefers-reduced-motion` sadeleşiyor.

**1a'da doğrulandı:** `src/content/2026-09/parity.test.ts` taşınan sayıyı
prototiple her çalıştırmada karşılaştırıyor (11 test). Sayımlar tuttu: 9 bölüm,
29 sayfa, 90 blok, 19 tip, 90 benzersiz blok kimliği. `pnpm run check` 390 dosya
0 hata. Test bilerek bozulan bir cümlede kırmızı yandığı görüldü — yani ısırıyor.

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

Kod değil, karar. İkisi de çözülmeden 1.0 çıkamaz.

1. **Marka adı + alan adı.** `src/lib/brand.ts` şu an yer tutucu (`ornek.com`).
   `brand.test.ts` bunu bilerek test ediyor — gerçek alan adı girilince o test silinir.
2. **Font lisansı.** `static/fonts/animeace2_reg.ttf` lisanssız. OFL/ticari kullanıma
   açık bir alternatifle değişecek, subset + woff2'ye inecek. Aday font
   `tokens.css`'teki Türkçe kapsam denetiminden aynen geçmeli (ç Ç ğ Ğ ı İ ö Ö ş Ş ü Ü;
   Anime Ace'te uzun tire — – yoktu).

---

## Karar bekleyen sorular

1. **Eş okuma varsayılan mı, kapalı mı?** (YORUM-SISTEMI §7.1) Öneri: kapalı.
2. **Prototip URL'i yayından sonra kalsın mı?** Öneri: kalsın, `noindex` + üstte bant.
3. **Yorum düzenleme yok, silme var** — 1.0 sadeliği için kabul mü?
4. **`fit:contain` taşma denetimi** derleyici yokken nasıl? Öneri: Playwright'ta iki
   ekran ölçüsünde 29 sayfayı gez, `scrollHeight > clientHeight` olan `contain`
   sayfa varsa kırmızı.
5. **`min` modun vaadi zayıf:** `sozluk`, `gece-hatti` ve manga hiç kısalmıyor;
   gerçek ayrışma yalnız `kizil-mevsim` + `soylesi`'de. Editöryel iş: ya min sürümleri
   yazılacak ya vaat dürüstleştirilecek.

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
