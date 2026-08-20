# Sosyal Dergi — Proje Planı ve Mimari

## 1. Bağlam

`~/Desktop/socialMagazinePlan.md` dosyasındaki 7 maddelik fikir taslağını, uygulanabilir bir ürün ve mimari planına dönüştürüyoruz.

> **Bu belgenin durumu:** aşağıdaki mimari **henüz kurulmadı** — Faz 0 başlamadı, `apps/`, `packages/`, `supabase/` klasörleri yok. Bunun yerine `prototype/` altında derlemesiz, saf HTML/CSS/JS bir **prototip** çalışıyor: iki dolu sayı, yorum sistemi, kimlik, bulmacalar, arşiv — hepsi sahte veriyle ama uçtan uca. Prototip bu planın *kanıtı*, yerine geçeni değil; asıl build başladığında referans olarak kalır. Prototipin mimarisi için [MIMARI.md](MIMARI.md), ilerleme için [PROTOTIP-TODO.md](PROTOTIP-TODO.md).

**Ne yapıyoruz:** Sosyal medyanın anlık katılım hissiyle, aylık derginin editöryel ağırlığını birleştiren, mobil öncelikli bir web dergisi. Aylık tek bir "sayı" yayımlanır; okur siteye girdiği anda hiçbir engel olmadan akışa girer, istediği yere yorum bırakır, o sayıya özel bulmacaları oynar.

**Neden:** Bugün uzun içerik ya sosyal medyada parçalanıyor ya da kimsenin açmadığı PDF dergilerde ölüyor. Aradaki boşluk: *tasarlanmış*, *bitişi olan*, *yorumlanabilir* bir aylık okuma deneyimi.

**Ölçek:** Yayımlanacak gerçek bir proje ama hobi ölçeğinde — yüzlerce okur, ücretsiz servis katmanları, tek kişilik editöryel ekip. Mimari kararlar bu gerçeğe göre alınıyor: *sürdürülebilirlik > eksiksizlik*.

---

## 2. Ürün İlkeleri

Her tasarım/kod kararı bu 5 ilkeye karşı test edilecek:

1. **Sıfır sürtünme.** Kullanıcı linke tıklar, okumaya başlar. Hesap, izin, çerez duvarı, "uygulamayı indir" yok. Kimlik arka planda sessizce oluşur.
2. **Giriş bir ödüldür, bir kapı değil.** Giriş yapmayan her şeyi okur ve yorum yazar. Giriş yapan ekstra kazanır (anında yayımlanan yorum, arşiv, cihazlar arası taşıma).
3. **Her parça lego.** Yeni bölüm türü, yeni bulmaca, yeni animasyon sahnesi eklemek = bir klasör açmak. Çekirdek kodu değiştirmek gerekmez.
4. **Tek tuval, her ekran.** Tüm içerik 3:4 oranlı sabit bir tuvalde tasarlanır. Bir kez tasarla, telefonda da masaüstünde de aynı görünsün.
5. **Bitişi olan bir şey.** Sonsuz akış yok. Sayı başlar, biter. Okur "bitirdim" der.

---

## 3. Karar Özeti

| Konu | Karar |
|---|---|
| İçerik üretimi | Solo editöryel (sen) |
| Sosyal derinlik | Sadece yorum katmanı — takip/DM/profil yok |
| Yayın ritmi | Saf aylık sayı |
| Ürün formu | Web / PWA, mobil öncelikli |
| İlk ziyaret | ~10-15 sn kaydırmalı tanıtım ("about") → o ayki sayı başlar |
| Kimlik | Sessiz anonim kimlik, rastgele takma ad + kullanıcının seçtiği emoji & renk |
| Anonim yorum | Yazabilir, **onay kuyruğuna** düşer |
| Girişli yorum | **Anında** yayımlanır |
| Giriş yöntemi | E-posta + 6 haneli kod, sayfadan hiç çıkmadan |
| Giriş teklifi | Yorum gönderdikten sonra + sayı sonunda (kapatılırsa o sayıda tekrar sorma) |
| Anonim geçmiş | Hesaba taşınır; kuyruktaki yorumlar onayda kalır |
| E-posta kullanımı | Giriş + "yeni sayı çıktı" bildirimi |
| Okuma modları | 3 derinlik (en az / orta / klasik) — **içerik gerçekten değişir**, elle yazılır |
| Mod seçimi | Sayı başında bir kez sorulur, sonra üst çubuktan değiştirilir |
| Gezinme | Dikey kaydırma, sayfa sayfa oturan (snap) 3:4 sayfalar |
| Yorum ankrajı | Metin seçimi (Medium) + görsel/boş alana koordinat pini |
| Yorum görünümü | Aç/kapa **yorum katmanı** modu |
| Yorum etkileşimi | Tam thread (iç içe cevaplar) + emoji tepki |
| Moderasyon | Sade onay paneli (otomatik filtre yok) |
| Bulmaca mimarisi | **Web Component** (framework bağımsız custom element) |
| Bulmaca dağıtımı | Sayı başına 2-4; okura **1 kişiselleştirilmiş + 1 editör seçimi** |
| Bulmaca geri bildirimi | Kişisel sonuç + anonim okur istatistikleri |
| Bulmaca arşivi | Kalıcı, eski sayılardan oynanabilir |
| Diller | TR (ana) + EN + JA — tam editöryel çeviri |
| Animasyon | Ortak sahne kitaplığı + sayıya özel "imza sahneler" |
| Görsel dil | Çekirdek düzen sabit, **her sayı kendi temasını getirir** |
| İçerik yönetimi | Dosya tabanlı (Markdown + git), ileride yazım paneli eklenir |
| Arşiv erişimi | Ücretsiz — sadece giriş yapmak yeterli |
| Arka uç | Supabase (veritabanı + kimlik + depolama), ücretsiz katman |
| Ek özellikler | Kaldığın yerden devam, alıntı paylaşma görseli, karanlık/aydınlık tema |
| Bölüm türleri | Uzun yazı, foto-öykü/galeri, söyleşi, kısa liste/sözlük, **aylık one-shot manga**, bulmaca |

---

## 4. Kullanıcı Yolculuğu

```
Link  →  [ilk ziyaret mi?]
           evet → Tanıtım sahnesi (10-15sn, kaydırmalı, atlanabilir)
                  → "Nasıl okumak istersin?" (3 kart: en az / orta / klasik)
           hayır → doğrudan sayıya, kaldığı sayfadan

       →  SAYI AKIŞI (3:4 snap sayfalar)
            ├─ üst bant: menü, dil, mod, ilerleme çubuğu
            ├─ alt bant: yorum katmanı aç/kapa + yorum sayısı
            ├─ bölümler: yazı · galeri · söyleşi · manga · liste · bulmaca
            └─ metin seç → yorum yaz     |  görsele uzun bas → pin bırak

       →  İlk yorum gönderildi
            → "Yorumun onay sırasında. 10 saniyede giriş yaparsan anında yayımlanır."
              → e-posta gir → 6 haneli kod → aynı sayfada, aynı yerde devam

       →  Sayı sonu
            ├─ "Bu sayıyı bitirdin" ekranı + okuma istatistiği
            ├─ bulmaca sonuçların + anonim okur istatistikleri
            ├─ (girişsizse) ikinci ve son giriş teklifi
            └─ arşiv / gelecek sayı bildirimi
```

---

## 5. Mimari

### 5.1 Teknoloji Yığını (ve gerekçesi)

| Katman | Seçim | Neden |
|---|---|---|
| Uygulama | **SvelteKit + Svelte 5** | Bu proje bir "içerik sitesi" değil, animasyonlu bir okuma *uygulaması*. Svelte'in yerleşik geçiş/hareket ilkelleri imza sahneler için ideal; paket boyutu React'in çok altında (mobil öncelikli hedefe uygun). **Kritik:** Svelte bileşenleri `customElement: true` ile doğrudan standart Web Component'e derlenir — bulmaca eklenti mimarisi bedavaya gelir. |
| Dil | **TypeScript** | İçerik şeması, bulmaca SDK sözleşmesi ve veri modeli tip güvenli olmalı; "lego" vaadi ancak sözleşmeler derleme zamanında denetlenirse tutar. |
| Stil | **CSS custom properties + container queries** | Sayı başına tema = sadece bir token dosyası. `cqi` birimleri 3:4 tuvalde tipografinin her ekranda birebir aynı ölçeklenmesini sağlar. |
| Arka uç | **Supabase** | Postgres + RLS + **anonim giriş** + **e-posta OTP** tek pakette ve ücretsiz katmanda. Anonim→kalıcı hesap yükseltmesi yerleşik (`updateUser({email})` aynı kullanıcı kimliğini korur) — "geçmiş taşınır" gereksinimi bedava karşılanır. |
| E-posta | **Resend** (Supabase custom SMTP) | Supabase'in yerleşik posta servisi saatte ~2-3 mail sınırlıdır, giriş akışı için yetersiz. Resend ücretsiz katmanı (aylık ~3.000) hobi ölçeği için fazlasıyla yeter. |
| Barındırma | **Cloudflare Pages** veya **Vercel** | Ücretsiz katman, kenar (edge) sunum, önizleme dağıtımları. |
| İçerik | **Markdown + özel direktifler**, git'te | Sürüm geçmişi, yedek, toplu düzenleme bedava. Derleme anında yapısal JSON'a çevrilir. |
| PWA | **vite-plugin-pwa** | Ana ekrana kurulum + varlık önbelleği. |

> **Not:** SvelteKit ile rahat değilsen aynı mimari Astro (+ islands) veya sade Web Components ile de kurulabilir; içerik derleyicisi, veri modeli ve bulmaca SDK'sı framework'ten bağımsız tasarlanıyor. Bağlanma noktası sadece `apps/web` altındaki okuyucu kabuğu.

### 5.2 Depo Yapısı

```
<proje-kökü>/                        # klasör adı sErgi, kod içi ad: `magazine`
├── apps/web/                        # SvelteKit uygulaması (okuyucu kabuğu)
│   └── src/lib/
│       ├── canvas/                  # 3:4 tuval, snap motoru, jestler, ilerleme
│       ├── blocks/                  # bölüm şablonları (bkz. 5.5)
│       ├── animation/               # sahne presetleri + imza sahne yükleyici
│       ├── comments/                # ankraj, katman, panel, thread, oluşturucu
│       ├── identity/                # anonim kimlik, e-posta+kod, oturum, profil
│       ├── puzzles/                 # host tarafı: yükleyici, kayıt, öneri, istatistik
│       ├── i18n/                    # yönlendirme, sözlük, dil geri dönüşü
│       └── theme/                   # token motoru, sayı teması, karanlık/aydınlık
├── packages/content/                # Markdown → yapısal JSON derleyici + şema
├── packages/puzzle-sdk/             # bulmaca sözleşmesi (tipler, olaylar, yardımcılar)
├── packages/ui/                     # paylaşılan temel bileşenler + token tanımları
├── puzzles/<bulmaca-id>/            # her bulmaca bağımsız bir custom element
├── content/issues/<yyyy-mm>/        # içerik (bkz. 5.4)
├── supabase/migrations/             # şema + RLS politikaları
└── docs/                            # PROJE.md (bu doküman), MIMARI.md, ICERIK-REHBERI.md
```

pnpm workspace. Tek kişilik ekip için monorepo ek yük değil, tam tersi: bulmacalar ve içerik derleyicisi bağımsız test edilebilir kalır.

### 5.3 3:4 Tuval Sistemi

Tüm içerik `aspect-ratio: 3/4` sabit bir tuval içinde yaşar:

```css
.canvas {
  aspect-ratio: 3 / 4;
  width: min(100vw, calc(100svh * 3 / 4));
  container-type: inline-size;   /* içerideki her şey cqi ile ölçeklenir */
  margin-inline: auto;
}
```

**Neden bu kadar önemli:** Tuval oranı sabit olduğu için tipografi, boşluk ve *yorum pinlerinin koordinatları* normalize edilebilir. Bir okurun iPhone'da bıraktığı pin, başkasının masaüstünde tam olarak aynı yere düşer. Tasarım bir kez yapılır.

**Letterbox bantları boşa gitmez:** Uzun telefon ekranlarında tuvalin üstünde/altında kalan boşluk, arayüzün kendisi olur — üstte menü/mod/ilerleme, altta yorum katmanı düğmesi ve yorum sayacı. Masaüstünde tuval, sayı temasının zemini üzerinde ortada duran bir "dergi objesi" gibi görünür.

**Sayfa sığdırma:** Her sayfa `fit` bildirir —
- `contain` (varsayılan): içerik tuvale sığmak zorunda; derleme sırasında taşma uyarısı verilir.
- `scroll`: sayfa içinde dikey kaydırma serbest, sonuna gelince bir sonraki sayfaya snap olur. Uzun paragraflı "klasik" mod sayfaları için gerekli.

### 5.4 İçerik Modeli

```
content/issues/2026-09/
├── issue.yaml            # sayı no, başlık, kapak, yayın tarihi, görünürlük, editör seçimi bulmaca
├── theme.css             # bu sayıya özel token'lar (renk, yazı tipi, doku)
├── intro/                # (yalnızca ilk sayıda) tanıtım sahnesi içeriği
└── sections/
    ├── 01-editorial/
    │   ├── meta.yaml     # tip: article, yazar, sıra, kapak, etiketler
    │   ├── tr.md
    │   ├── en.md
    │   └── ja.md
    ├── 02-tokyo-gece/
    │   ├── meta.yaml     # tip: gallery
    │   ├── images/
    │   └── tr.md         # alt yazılar
    ├── 03-soylesi/       # tip: interview
    ├── 04-oneshot/       # tip: manga  (sayfa görselleri + okuma yönü + panel bölgeleri)
    ├── 05-sozluk/        # tip: list
    └── 06-bulmaca/       # tip: puzzle (puzzleId + config)
```

**Sayfa + derinlik + sahne, tek dosyada:** Markdown'a üç direktif ekliyoruz. Bir *sayfa* aynı zamanda bir *sahne*dir; hangi okuma modlarında görüneceğini kendisi bildirir.

```markdown
:::page {depth: all, scene: fade-up}
# Kyoto'da Sonbahar
Sokakların rengi eylülün ikinci haftasında değişmeye başlar.
:::

:::page {depth: min}
Kısaca: eylül ortasında git, kalabalıktan kaç, kırmızıyı bekleme.
:::

:::page {depth: mid full, scene: parallax, fit: scroll}
Uzun anlatım buraya... (hem orta hem klasik modda görünür)
:::

:::page {depth: full, scene: signature, component: ./scenes/Tapinak.svelte}
:::
```

- `depth`: `min` | `mid` | `full` | `all` | boşluklu kombinasyon
- `scene`: ortak animasyon kitaplığından bir preset
- `component`: sayıya özel imza sahne (tam kodlanmış Svelte bileşeni)
- `fit`: `contain` | `scroll`

**Bu, "3 sürümü de elle yazarım" kararına aykırı değil** — tam tersi onu mümkün kılar: her derinlik için tamamen ayrı metin yazabilirsin, ama ortak kalması gereken kısımları (başlık, görsel, alıntı) tekrar yazmak zorunda kalmazsın. 3 dil × 3 derinlik = 9 ayrı dosya yerine **dil başına 1 dosya** olur.

**Derleyici** (`packages/content`): Markdown + direktifleri okur, doğrular (bilinmeyen sahne adı, eksik dil, sığmayan sayfa uyarısı), tip güvenli `Issue → Section → Page[] → Block[]` JSON'u üretir.

### 5.5 Blok/Bölüm Şablonları

Her biri `apps/web/src/lib/blocks/<tip>/` altında bağımsız bir klasör; ortak bir `BlockProps` sözleşmesi uygular. Yeni bölüm türü eklemek = yeni klasör + kayıt satırı.

| Tip | Ne yapar | Özel ihtiyaçları |
|---|---|---|
| `article` | Derginin omurgası: başlık, paragraf, alıntı, dipnot, drop cap | Derinlik direktifleri en çok burada işler |
| `gallery` | Tam ekran foto-öykü, sayfa sayfa görsel anlatı | Görsele koordinat pinli yorum burada parlar |
| `interview` | Soru-cevap dizgisi, konuşmacı rozetleri, öne çıkan alıntılar | İki sesli tipografi |
| `list` | "Bu ay 5 şey", terim sözlüğü, bilgi kartları | "En az" modunun bel kemiği |
| `manga` | **Aylık one-shot manga okuyucu** | Sağdan sola okuma seçeneği, sayfa görselleri, opsiyonel panel-panel rehberli görünüm, çift dokunuşla yakınlaştırma, panel üzerine yorum pini, sonraki sayfayı ön yükleme |
| `puzzle` | Bulmaca yuvası | Custom element'i yükler, sonucu kaydeder (bkz. 5.10) |

### 5.6 Okuma Modları

Üç mod, tek bir `depth` durumu üzerinden çalışır: `min` | `mid` | `full`.

- Sayı başında bir kez 3 görsel kartla sorulur; seçim okur profilinde saklanır (anonimde de).
- Üst bantta her an değiştirilebilir. **Mod değişince okur kaybolmaz:** o anki sayfanın "ankraj kimliği" üzerinden yeni moddaki en yakın sayfaya geçilir.
- Mod, yorum ankrajının parçasıdır: `full` modda bir paragrafa yazılmış yorum, `min` modda o paragraf yoksa sayfa seviyesine düşer (bkz. 5.9).

### 5.7 Animasyon Sistemi

- **Ortak kitaplık** (`lib/animation/scenes/`): `fade-up`, `stagger`, `parallax`, `mask-wipe`, `type-in`, `panel-reveal` (manga için), `counter`. Her preset saf bir fonksiyon: sayfanın görünürlük ilerlemesini (0→1) alır, öğelere uygular.
- **Tetikleme:** IntersectionObserver + destekleyen tarayıcılarda CSS `animation-timeline: view()`. Snap sayfa yapısı doğal sahne sınırı verdiği için tetikleme mantığı basittir.
- **İmza sahneler:** Sayfa `component:` bildirirse tam kodlanmış bir Svelte bileşeni tembel yüklenir. Sayı başına 1-2 tane hedefle.
- **`prefers-reduced-motion`:** tüm presetler otomatik olarak sade bir belirme animasyonuna düşer. Pazarlık konusu değil.

### 5.8 Kimlik ve Giriş

**Aşama 1 — sessiz anonim kimlik (ilk ziyaret, kullanıcı fark etmez)**
- `supabase.auth.signInAnonymously()` → kalıcı bir `reader` kaydı oluşur.
- Rastgele takma ad atanır ("Mor Balina 41"); emoji + renk kullanıcı isterse değiştirir.
- Okuma ilerlemesi, bulmaca durumu, yorumlar bu kimliğe bağlanır.

**Aşama 2 — kalıcılaştırma (e-posta + 6 haneli kod)**
```
[Giriş teklifi]  →  e-posta alanı (tek alan, sayfadan çıkmadan)
                 →  supabase.auth.updateUser({ email })   // ANONİM KULLANICI KORUNUR
                 →  kullanıcı maildeki 6 haneli kodu yapıştırır
                 →  verifyOtp({ type: 'email_change' })
                 →  aynı reader.id, tüm geçmiş yerinde
```
- Kod alanı `autocomplete="one-time-code"` + `inputmode="numeric"` → mobilde klavye kodu önerir.
- Modal, okunan sayfanın üzerinde açılır; **arka planda sayfa konumu korunur**, giriş bitince aynı yerde devam edilir.
- Oturum uzun ömürlü (sessiz yenilemeli); "beni hatırla" diye sormaya gerek yok.

**Kurallar**
- Anonim yorum → `status: pending`. Kullanıcı sonradan giriş yaparsa bunlar **onayda kalır** (bilinçli karar), ama yeni yorumları anında yayımlanır.
- Giriş teklifi en fazla 2 kez: ilk yorumdan hemen sonra + sayı sonunda. Kapatılırsa o sayı boyunca bir daha gösterilmez (`dismissed_for_issue` bayrağı).
- E-posta yalnızca giriş + aylık "yeni sayı çıktı" bildirimi için. Bu söz arayüzde açıkça yazılı olur ve tek tıkla iptal edilir.

### 5.9 Yorum Sistemi

**Ankraj (3 seviye, zarifçe düşer)**

| Seviye | Nasıl | Saklanan |
|---|---|---|
| `text` | Metin seçimi (Medium tarzı) | W3C Web Annotation stili `{exact, prefix, suffix}` + karakter konumu yedeği |
| `point` | Görsele/boş alana uzun basma | Tuvale göre **normalize** `{x, y}` (0-1) — 3:4 sabit olduğu için her ekranda aynı yer |
| `page` | Yukarıdakiler bulunamazsa | `section_slug` + `page_id` |

Yeniden ankrajlama render sırasında yapılır: metin aranır, bulunamazsa (içerik düzenlendi ya da okuma modu değişti) yorum sessizce sayfa seviyesine düşer ve "bu yorum farklı bir okuma modunda yazıldı" notuyla gösterilir. **Yorum asla kaybolmaz.**

**Görünüm — yorum katmanı modu**
- Alt banttaki düğme yorum katmanını açar: sayfa hafifçe geri çekilir, tüm yorumlar kendi konumlarında belirir.
- Katman kapalıyken okuma tamamen temizdir — yorumlanmış yerlerde yalnızca çok hafif bir vurgu kalır.
- Bir ankraja dokunmak alttan thread panelini açar (`Yorumlar 59` başlığıyla).
- Thread: iç içe cevaplar. Dar tuvalde okunaklılık için 3. seviyeden sonra girinti sabitlenir ve "cevapları göster" ile katlanır.
- Emoji tepkileri her yoruma.

**Moderasyon paneli** (`/admin`, yalnızca senin hesabın)
- Kuyruk: sırayla gelen kartlar, tek dokunuşla onayla/reddet, klavye kısayolları (masaüstü).
- Yorumun geçtiği bağlam (hangi sayfa, hangi cümle) kartın içinde gösterilir — panelden ayrılmadan karar verilir.
- Otomatik filtre yok (kararın), ama basit bir hız sınırı var: aynı kimlikten dakikada N yorum, sayfa başına M yorum.

### 5.10 Bulmaca Motoru

**Sözleşme (`packages/puzzle-sdk`)** — her bulmaca standart bir custom element:

```html
<magazine-puzzle-kelime-avi
  config='{"grid":[...], "words":[...]}'
  locale="tr"
  state='{"found":["kyoto"]}'>   <!-- yarım kalan oyunu geri yükler -->
</magazine-puzzle-kelime-avi>
```

Bulmacanın yaydığı olaylar (`bubbles: true, composed: true`):

| Olay | Ne zaman | Detay |
|---|---|---|
| `puzzle:ready` | Yüklendi, oynanabilir | `{ id }` |
| `puzzle:progress` | Durum değişti (otomatik kayıt için) | `{ state }` |
| `puzzle:solved` | Çözüldü | `{ durationMs, attempts, score? }` |
| `puzzle:failed` | Başarısız/pes | `{ attempts }` |
| `puzzle:hint` | İpucu kullanıldı | `{ level }` |

Bulmaca **hiçbir zaman** ağa çıkmaz, veritabanı bilmez, dergiyi tanımaz. Kaydetme, istatistik, paylaşım görseli — hepsi host tarafın işi. Böylece yeni bulmaca yazmak gerçekten "bir klasör açmak" olur:

```
puzzles/kelime-avi/
├── puzzle.json      # id, ad (3 dilde), tür etiketleri, zorluk, tahmini süre, ikon
├── src/Puzzle.svelte    # customElement:true ile derlenir
└── dist/kelime-avi.js
```

Tema geçişi bedava: shadow DOM CSS custom property'leri kalıtır, yani sayı teması bulmacanın içine kendiliğinden akar.

**Öneri algoritması (basit, şeffaf, anonimde de çalışır)**

Her sayıda okura **2 bulmaca** sunulur: biri **editör seçimi** (`issue.yaml`'da işaretli), biri **kişiselleştirilmiş**.

```
Her bulmacanın etiketleri var: kelime | mantık | görsel | içerik-bağlı

Okurun etiket puanı (kendi cihazından hesaplanır, gizlilik dostu):
  tamamladı        +2
  tekrar oynadı    +3
  başlayıp bıraktı −1
  hiç açmadı       −0.5
  ❤️ dedi          +5

Kişisel yuva = sayının havuzundaki (editör seçimi hariç) bulmacalar arasından
               en yüksek puanlı olan
               + son 3 sayıda görülmemiş etikete küçük bir yenilik bonusu
Soğuk başlangıç = ilk sayıda 3 ikonlu "hangisi kulağa hoş geliyor?" mikro-sorusu,
                  cevaplanmazsa editör seçimleri
```

Ne ML, ne sunucu tarafı çıkarım — tamamen `puzzle_runs` tablosundan hesaplanabilir ve okura "bunu neden gördün?" diye açıklanabilir.

**Geri bildirim:** Çözüm sonrası kişisel sonuç + anonim toplu istatistik ("okurların %38'i ilk denemede bildi"). Sıralama/lider tablosu yok — "zahmetsizlik" ilkesine aykırı.

### 5.11 Çok Dillilik

- Yönlendirme: `/[locale]/sayi/[issue]/[section]`, `locale ∈ {tr, en, ja}`. Varsayılan `tr`; tarayıcı dili ilk ziyarette öneri olarak kullanılır (zorlama yok).
- Arayüz metinleri `messages/{tr,en,ja}.json`.
- İçerik dili eksikse: sayı o dilde de açılır, eksik bölümde nazik bir not + ana dile dönüş bağlantısı. **Kısmi çeviri birinci sınıf vatandaş** — 3 dilin tamamını her sayıda bitirmek zorunda kalmamalısın.
- Japonca tipografi: uygun yazı tipi yığını, `line-break: strict`, `word-break: normal`, `<ruby>` (furigana) desteği; isteğe bağlı olarak bölüm bazında dikey yazım (`writing-mode: vertical-rl`) — 3:4 tuvalde çarpıcı durur.
- Yorumlar dile bağlıdır: varsayılan olarak okunan dilin yorumları gösterilir, "diğer dillerdeki yorumlar (23)" ile açılır.

### 5.12 Veri Modeli (Supabase / Postgres)

```
readers          id, display_name, emoji, color, email?, email_verified_at,
                 locale, preferred_depth, role ('reader'|'editor'), created_at
issues           slug, number, title_i18n, published_at, visibility ('public'|'members')
comments         id, issue_slug, section_slug, page_id, locale, depth_mode,
                 anchor_type ('text'|'point'|'page'), anchor jsonb,
                 body, reader_id, parent_id (self-ref),
                 status ('pending'|'published'|'rejected'), created_at, published_at
comment_reactions comment_id, reader_id, emoji                     -- PK: (comment_id, reader_id, emoji)
puzzle_runs      id, reader_id, issue_slug, puzzle_id, state jsonb,
                 completed_at, duration_ms, attempts, hints_used
puzzle_stats     puzzle_id, issue_slug, plays, solves, avg_duration_ms, first_try_rate
                 -- materialized view, periyodik yenilenir
reading_progress reader_id, issue_slug, section_slug, page_id, depth_mode, updated_at
issue_reads      reader_id, issue_slug, finished_at                -- "bitirdim" rozeti
newsletter       reader_id, subscribed_at, unsubscribed_at
```

**RLS politikaları (özet)**
- `comments` okuma: `status = 'published'` **veya** `reader_id = auth.uid()` (kendi bekleyen yorumunu görür).
- `comments` yazma: kimliği doğrulanmış herkes (anonim dahil); `status`, e-postası doğrulanmışsa `published`, değilse `pending` olarak **tetikleyici tarafından** belirlenir — istemci bu alana yazamaz.
- `reading_progress`, `puzzle_runs`: yalnızca kendi satırı.
- `issues` görünürlüğü `members` ise: yalnızca `email_verified_at IS NOT NULL` olan okurlar.
- Editör rolü: onay kuyruğunda tam yetki.

### 5.13 PWA, Performans, Erişilebilirlik

- Manifest + servis çalışanı: uygulama kabuğu ve mevcut sayının varlıkları önbelleğe alınır (offline okuma ilk sürümde hedef değil, ama altyapı buna hazır kurulur).
- Görseller: derleme zamanında AVIF/WebP + boyut varyantları; manga sayfaları için ilerleyen yükleme ve sonraki sayfa ön yüklemesi.
- Kod bölme: her blok tipi, her bulmaca, her imza sahne tembel yüklenir. Bulmaca kodu, o bulmacaya gelinene kadar indirilmez.
- Erişilebilirlik: snap sayfalarda klavye gezinme (PageUp/PageDown, ok tuşları), odak yönetimi, ekran okuyucu için doğrusal içerik akışı, `prefers-reduced-motion`, kontrast denetimi tema token'larında.
- Hedef: 3G'de ilk sayfa < 2 sn; Lighthouse mobil performans ≥ 90.

---

## 6. Sıfırdan Üretim Rehberi

Her faz kendi başına çalışan bir şey teslim eder. Tarih baskısı yok; sıra önemlidir.

### Faz 0 — İskelet
**Hedef:** Boş ama doğru kurulmuş bir tuval.
- pnpm workspace, SvelteKit + TS, ESLint/Prettier, git deposu.
- `lib/theme`: token motoru (renk/tipografi/boşluk), karanlık-aydınlık, sayı teması yükleyici.
- `lib/canvas`: 3:4 tuval, snap kaydırma motoru, üst/alt bant, ilerleme göstergesi, klavye gezinmesi.
- Elle yazılmış 3 örnek sayfa ile dolaşılabilir bir iskelet.
**Doğrulama:** Telefonda ve masaüstünde 3:4 tuval doğru ölçekleniyor, sayfalar takılmadan snap oluyor, klavyeyle gezilebiliyor.

### Faz 1 — İçerik Derleyicisi ve Okuma Modları
**Hedef:** Gerçek Markdown'dan gerçek sayı.
- `packages/content`: direktif ayrıştırıcı (`:::page {depth, scene, fit, component}`), şema doğrulama, tip üretimi.
- `blocks/article` ve `blocks/list`.
- 3 okuma modu + sayı başı mod seçim ekranı + mod değiştirince konum koruma.
- İçerik doğrulayıcı CLI: eksik dil, bilinmeyen sahne, taşan sayfa uyarıları.
**Doğrulama:** Tek bir `tr.md` dosyasından 3 farklı derinlikte okunabilir bir bölüm çıkıyor; mod değiştirince okunan yer kaybolmuyor.

### Faz 2 — Kimlik
**Hedef:** Kimse giriş yapmadan her şey çalışsın.
- Supabase projesi, `readers` tablosu, RLS.
- Sessiz anonim giriş, rastgele takma ad, emoji + renk seçici.
- E-posta + 6 haneli kod akışı (sayfadan çıkmadan), Resend ile SMTP.
- Oturum yenileme, `reading_progress` ile kaldığın yerden devam.
- Tanıtım ("about") sahnesi — sadece ilk ziyarette.
**Doğrulama:** Yeni tarayıcıda hiçbir ekran görmeden okumaya başlanıyor; e-posta+kod ile giriş yapılınca aynı kimlik ve tüm ilerleme korunuyor.

### Faz 3 — Yorumlar
**Hedef:** Derginin sosyal kalbi.
- Metin seçimi ankrajı + normalize koordinat pini + yeniden ankrajlama/düşme mantığı.
- Yorum katmanı aç/kapa, thread paneli, emoji tepkileri.
- `pending`/`published` tetikleyicisi, hız sınırı.
- `/admin` onay kuyruğu paneli (mobilde de kullanılabilir).
- İlk yorum sonrası giriş teklifi.
**Doğrulama:** İki farklı tarayıcıdan yorum yazılıyor; anonim olan kuyruğa düşüyor, girişli olan anında görünüyor; okuma modu değişince yorum kaybolmuyor.

### Faz 4 — Bulmaca Motoru
**Hedef:** "Lego" vaadinin kanıtı.
- `packages/puzzle-sdk`: tipler, olay sözleşmesi, tema köprüsü, test koşum aracı.
- Host tarafı: manifest keşfi, tembel yükleme, otomatik kayıt, sonuç ekranı, `puzzle_stats`.
- **İki örnek bulmaca** (biri kelime, biri görsel) — sözleşmenin gerçekten yeterli olduğunu ancak ikinci bulmaca kanıtlar.
- Öneri algoritması + "hangisi kulağa hoş geliyor?" soğuk başlangıç.
**Doğrulama:** Üçüncü bir bulmaca, çekirdek kodun tek satırına dokunmadan sadece klasör ekleyerek çalışıyor. (Bu testi gerçekten yap.)

### Faz 5 — Zengin Bölümler
**Hedef:** Derginin "vay be" anları.
- `blocks/gallery`, `blocks/interview`.
- `blocks/manga`: one-shot okuyucu (sağdan sola, yakınlaştırma, panel pinleri, ön yükleme).
- Animasyon kitaplığı presetleri + imza sahne yükleyici.
**Doğrulama:** Tam bir örnek sayı baştan sona akıcı okunuyor; manga bölümü telefonda rahat okunabiliyor.

### Faz 6 — Çok Dillilik
- Dil yönlendirmesi, dil değiştirici, arayüz sözlükleri.
- Japonca tipografi (ruby, satır kırma, opsiyonel dikey yazım).
- Eksik dil geri dönüşü, dile göre yorum filtresi.
**Doğrulama:** Yalnızca TR'si olan bir bölüm, EN dilinde açıldığında düzgün bir nota düşüyor; JA bölümü doğru kırılıyor.

### Faz 7 — Arşiv ve Üyelik
- Sayı listesi/arşiv sayfası, `visibility` kontrolü (üyelere = girişlilere).
- "Yeni sayı çıktı" e-postası + tek tıkla iptal.
- Sayı sonu ekranı: bitirdin rozeti, istatistikler, ikinci giriş teklifi.
**Doğrulama:** Girişsiz kullanıcı arşive girmeye çalışınca nazik bir giriş teklifi görüyor; giriş yapınca aynı sayfaya dönüyor.

### Faz 8 — Cila
- PWA kurulumu, alıntı paylaşma görseli üretimi, karanlık/aydınlık geçişi.
- Erişilebilirlik denetimi, performans bütçesi, hata izleme.
- `docs/` tamamlanması: içerik yazım rehberi, yeni bulmaca ekleme rehberi, yeni blok ekleme rehberi.

### Faz 9 — Güvenlik denetimi (1.0 yayımı sonrası)
Site 1.0 canlıya çıktıktan sonra, gerçek kullanıcı ve gerçek veri varken güvenlik açıkları taranır. Öncelik **kimlik/giriş yüzeyi** — dışarıdan gelen girdinin arka uca değdiği her yer.
- **Giriş akışı:** e-posta + 6 haneli kod — kod tahmin/deneme sınırı (rate limit + kilitleme), kodun kısa ömrü ve tek kullanımlık olması, oturum/token yönetimi, anonim → doğrulanmış geçişte hesap devralma (account takeover) senaryoları.
- **Yetki:** okur kendi olmayan yorumu/analitiği/moderasyon kuyruğunu göremesin/değiştiremesin (Supabase Row Level Security politikalarının denetimi), `/admin` yüzeyinin gerçekten korunması.
- **Girdi:** yorum gövdesi ve profil alanlarında XSS/enjeksiyon, oran sınırı (spam/flood), içerik boyutu sınırları.
- **Genel:** güvenlik başlıkları (CSP vb.), bağımlılık taraması, sır/anahtar sızıntısı kontrolü. Denetim tek seferlik değil, her sayı/faz sonrası tekrarlanan bir geçiş.

---

## 7. Doğrulama Stratejisi

- **Birim:** içerik derleyicisi (direktif ayrıştırma, derinlik filtreleme), yorum yeniden ankrajlama, öneri algoritması. Bunlar saf fonksiyonlar — test etmesi ucuz, hata maliyeti yüksek.
- **Bileşen:** blok şablonları ve bulmaca SDK'sı için görsel test sayfası (`/dev/blocks`, `/dev/puzzles`) — her şablonu izole çalıştırır.
- **Uçtan uca (Playwright):** (1) ilk ziyaret → tanıtım → mod seçimi → okuma; (2) anonim yorum → kuyruk → onay → görünür; (3) e-posta+kod ile yükseltme sonrası geçmişin korunması; (4) bulmaca çözme → kayıt → istatistik.
- **Elle:** gerçek telefonda 3:4 tuval, snap hissi, manga okunabilirliği ve animasyon akıcılığı. Bunlar otomatik test edilemez, her fazda elle bakılmalı.
- **İçerik CI:** her `content/` değişikliğinde derleyici doğrulaması çalışır — bozuk sayı yayına çıkamaz.

---

## 8. Açık Sorular (ilerledikçe netleşecek)

1. **One-shot manga içeriğini kim çizecek?** — *ilk örnek için çözüldü.* 2026-09'un one-shot'ı **KARGAMANGA**'nın "Kapalı Kapılar" eseri; **izinle** yayımlandı, telif sahibinde kaldı, künyede ve sayfa filigranında (PIGMENT) kaynak gösteriliyor. Yani model belli: davetli/işbirliği yapılan çizer + açık künye. Açık kalan kısım **süreklilik** — aylık bir one-shot ciddi bir üretim yükü; her sayıda mı, iki ayda bir mi, yoksa arada kamuya açık eserle mi dönülecek? (Mimariyi etkilemez, takvimi etkiler.) İlgili teknik borç: manga balonları için gömülen Anime Ace fontunun lisansı yayın öncesi çözülmeli.
2. **Manga formatı:** tam sayfa görselleri mi, yoksa panel panel mi teslim edilecek? (Panel bölgeleri tanımlanırsa "rehberli görünüm" ve panel bazlı yorum mümkün olur.)
3. **Niş** henüz net değil — bölüm şablonları genel tutuluyor, netleşince nişe özel şablon eklenecek.
4. **Marka adı** — kod içi ad `magazine`, tek yerden değiştirilebilir şekilde kurulacak.
5. **Tanıtım ("about") sahnesi** her yeni ziyaretçiye mi, yoksa sadece ilk sayıda mı? (Öneri: cihazda bir kez, menüden tekrar izlenebilir.)
6. **Sayfalama: elle mi, otomatik sayfalayıcı mı? — *asıl build'e ertelendi.*** Prototipte otomatik sayfalayıcının getirisi görünmüyordu (içerik zaten donmuş ve elle kurgulanmış), o yüzden karar Faz 1'e — içerik derleyicisinin yazılacağı yere — bırakıldı. Prototipte yalnızca Sözlük bölümü örnek olsun diye elle üç `fit:contain` sayfaya bölündü. Kararın kendisi hâlâ verilmedi, sadece yeri değişti. İçerik "her sayfa ≤ 1 ekran, temiz snap" ilkesine göre kurgulanıyor (uzun sayfa = kaydırınca okumadan atlama derdi). Uzun içeriği contain snap-sayfalara bölmenin iki yolu var:
   - **Elle:** her uzun sayfayı data'da parçalara böl + yorum ankrajlarını taşı. Basit ama tekrarlı, token yoğun, ve "hangi ekrana sığar" derdi (en kısa telefona göre bölünür, masaüstünde boşluk kalır). *Prototipte Sözlük bölümü şimdilik elle bölündü.*
   - **Otomatik sayfalayıcı (öneri):** render sırasında içerik viewport'a sığmıyorsa kendisi contain parçalara böler. Tek seferlik motor; her ekranda + gelecekteki her içerikte otomatik, minimum sayfa, elle bölme/ankraj derdi yok. Bedeli: yorum ankrajını "sayfa-bağımsız" (bloğa göre) yapmak için küçük bir refactor. **Gerçek ürünün içerik-derleyici modeli de zaten bu** — Faz 1'de derleyici bunu üstlenmeli, karar orada verilecek.
7. **Bir derginin toplam boyutu ne kadar, saklama nasıl verimli olur?** Bir sayı = metin (derleyici çıktısı) + görseller (şimdilik satır içi SVG, ileride gerçek foto/manga) + yorumlar. Ölçülecek: tipik bir sayının yayımlanmış toplam ağırlığı (KB/MB), en ağır parça hangisi (büyük olasılıkla görseller). Değerlendirilecek verim yolları: görsel için modern format (AVIF/WebP) + duyarlı boyutlar + tembel yükleme, uzun/ağır sayfalar için kod bölme (yalnız açılan bölümü indir), metin/yorumu ayrı yükleme (zaten `js/issues/<slug>.js` + `.comments.js` ayrık), CDN/edge önbelleği, arşivdeki eski sayıların soğuk saklaması. Amaç: yeni sayı eklendikçe ilk açılış maliyeti sabit kalsın, okur her seferinde tüm arşivi indirmesin.

## 9. Bilinçli Olarak Kapsam Dışı

Şimdilik yapılmayacaklar (ama mimari bunları engellemeyecek şekilde kuruluyor):
takip/profil/DM · bildirim merkezi · ödeme ve abonelik · otomatik içerik moderasyonu · lider tabloları · offline indirme · sesli okuma · yorum arama · kullanıcı içerik gönderimi.

---

## 10. Nerede kaldık

Planın kendisi yazıldı ve onaylandı. Ardından, doğrudan Faz 0'a girmek yerine, tüm ürünü uçtan uca görmek için `prototype/` kuruldu — bu plandaki her ekran orada çalışıyor (sahte veriyle). Prototipin sorduğu soruların cevapları bu belgeye işlendi: yorum ankrajı bloğa taşındı (§5.12 şeması güncellenmeli, bkz. [YORUM-SISTEMI.md](YORUM-SISTEMI.md) §6), sayfalama kararı Faz 1'e ertelendi (§8.6), one-shot üretim modeli belirlendi (§8.1).

**Sıradaki adım — Faz 0:** pnpm workspace + SvelteKit iskeleti + 3:4 tuval ve snap motorunun gerçek karşılığı. Prototip o noktada silinmez; blok blok neyin nasıl görüneceğinin referansı olarak kalır.
