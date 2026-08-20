# Prototip

Derginin **tam görünümlü sahte hâli**. Gerçek arka uç, gerçek içerik derleyicisi ve
gerçek Supabase yok — ama ekranların hepsi var ve gerçekten çalışıyor.

## İlgili belgeler

- [`docs/MIMARI.md`](../docs/MIMARI.md) — mimari harita, modül haberleşmesi ve
  Mermaid akış diyagramları (açılış + yorum yazma veri akışı).
- [`AI_GUIDE.md`](../AI_GUIDE.md) — hangi fonksiyon hangi dosyada, global durum
  nerede tutulur; olay veri yolu ve konsol kısayolları.
- [`docs/PROJE.md`](../docs/PROJE.md) — nihai ürün planı (SvelteKit + Supabase).
- [`docs/YORUM-SISTEMI.md`](../docs/YORUM-SISTEMI.md) — yorum ankraj mantığının gerekçesi.

## Nasıl açılır

En kolayı: `index.html` dosyasına çift tıkla. Derleme adımı, `npm install`, sunucu
gerekmez (bilerek: klasik `<script>` etiketleri, ES modül yok).

Daha temiz bir deneyim için (kaydırma davranışı ve `localStorage` `file://` üzerinde
bazı tarayıcılarda kısıtlı olabilir):

```bash
python3 tools/devserver.py          # depo kökünden
# → http://localhost:4173
```

`tools/devserver.py` sadece bir geliştirme kolaylığı: `http.server` ile aynı iş,
ama önbelleği kapatır ve `index.html`'deki css/js bağlantılarına dosya damgası
ekler — kaydettiğin an tarayıcıda görürsün. Dosyaların kendisi değişmez.

## Yeni sayı hazırlama — Yazım Kiti (`dev.html`)

Sayı içeriği "lego" bloklardan (`{ t: "pull", text: "…" }`) kurulur; bunları
sıfırdan yazarken boğulmamak için `dev.html` var (yalnızca yerel, üretime girmez):

- **Katalog** sekmesi: her blok tipi canlı önizlemeli + **kopyalanabilir JS**.
  İstediğini kopyala, bölüm dosyandaki `blocks` dizisine yapıştır. Arka plan
  sahneleri ve sayfa alanları da burada listeli.
- **Canlı editör** sekmesi: bir **bölümün** JS'ini panelde düzenle, gerçek 3:4
  tuvalde **anında** gör (snap + derinlik filtresi çalışır). Katalogdan blok ekle,
  bitince "Bölüm dosyası olarak kopyala" ile `js/issues/<sayı>/sections/` altına
  yeni dosya olarak yapıştır.

**Sayı yapısı iki biçimden biriyle yazılabilir** (ikisi de aynı şekli üretir,
`data.js` farkı bilmez):

- **Tek dosya** (`js/issues/2026-09.js`): kendini doğrudan `MAG.issues`'a yazar.
- **Bölünmüş** (`js/issues/2026-10/`): `issue.js` (meta + tanıtım + bulmaca havuzu)
  + `sections/NN-slug.js` (her biri `MAG.defineSection`). `js/content.js` parçaları
  `order` alanına göre sıralayıp tek sayıya toplar. Yeni bölüm = yeni küçük dosya +
  `index.html`'e bir `<script>` satırı.

> **Yorum çıpası uyarısı:** yorumlar `pageId:blokIndex` ile bağlanır. Var olan bir
> sayıda `id`'leri ve sayfa içi blok sırasını değiştirme — yoksa tohum yorumlar
> yanlış cümleye kayar. Yeni sayıda (henüz yorum yokken) serbestsin.

## Neyi deneyebilirsin

| Ne | Nasıl |
|---|---|
| Tanıtım sahnesi | İlk açılışta gelir. Tekrar izlemek için: Menü → “Tanıtımı tekrar izle” |
| Sabit menü | Geniş pencerede menü kendiliğinden açık durur. “Sade görünüm” ile kapanır, hamburger ile geri gelir; tercih hatırlanır |
| Okuma derinliği | Üst çubuktaki üç çubuklu rozet. **İçerik gerçekten değişir** (güncel sayıda 16 / 23 / 26 sayfa; 2026-09'da 18 / 24 / 28) |
| Bloğa yorum | Eş okuma açıkken **bir paragrafa dokun**. Hedef koca bir paragraf, ıskalanmaz |
| Alıntılı yorum | Bir cümleyi seç → “Yorum yaz”. Cümle yorumun **içine** girer, ankraj yine bloktur |
| Görsele yorum | Görselde ya da manga panelinde **uzun bas** → tam o noktaya pin bırakılır |
| Eş okuma | Alt çubuktaki “yorumlar” düğmesi. Tuval geri çekilir, yorum baloncukları belirir |
| Baloncuğu taşı | Baloncuğu **basılı tutup sürükle**. Konum yoruma yazılır, yeniden çizimde orada kalır |
| One-shot manga | `?sayi=2026-09` → “Kapalı Kapılar” bölümü. KARGAMANGA'nın 7 kareli one-shot'ı, **soldan sağa** okunuyor; sağ altındaki PIGMENT filigranına dokun → YouTube Shorts |
| Dolu sayı | Güncel sayı (2026-10) 98 tohum yorumla, 2026-09 ise 248 yorumla geliyor |
| Stres testi | Konsolda `MAG.flood(250)` → 250 sahte yorum daha (yalnızca bellekte). `MAG.flood(0)` temizler |
| Pin kümelenmesi | Konsolda `MAG.pins()` → her pinin **çekim alanı** çizilir. Görselde uzun bas: nokta hangi pine katılacağını söyler |
| Giriş | İlk yorumdan sonra teklif gelir. Kod **konsola** yazılır ve ekranda da gösterilir |
| Bulmacalar | “Bulmaca” bölümü. İlk gelişte “hangisi kulağa hoş geliyor?” sorulur |
| Moderasyon | Menü → “Moderasyon paneli”. Bekleyen 5 tohum yorum + anonim yazdıkların. Onayla → sayfada anında belirir |
| Sıfırlama | Menü → “Prototipi sıfırla”, ya da konsolda `MAG.reset()` |

Klavye: `↑ ↓` / `PgUp PgDn` / `Space` sayfa gezinme, `Home` `End` uçlar, `Esc` kapat.

## Dosya haritası — ve gerçek projede karşılığı

| Prototip | Gerçek proje |
|---|---|
| `js/data.js` | `packages/content` derleyicisinin Markdown'dan ürettiği JSON |
| `js/data-comments.js` | Supabase `comments` tablosunun içeriği (sayı başına tohum yorumlar) |
| `js/art.js` | `content/issues/<ay>/sections/*/images/` altındaki AVIF/WebP dosyaları |
| `assets/<ay>/` | Aynı klasörün gerçek hâli — 2026-09'un fotoğrafları ve one-shot kareleri şimdiden burada |
| `js/render.js` | `apps/web/src/lib/blocks/<tip>/` — her blok tipi kendi klasöründe |
| `js/canvas.js` | `apps/web/src/lib/canvas/` — 3:4 tuval, snap motoru |
| `js/comments.js` | `apps/web/src/lib/comments/` + Supabase `comments` tablosu |
| `js/popup.js` | `apps/web/src/lib/comments/popup/` — baloncuğa dokununca açılan kart |
| `js/identity.js` | Supabase anonim giriş + `updateUser({email})` / `verifyOtp()` |
| `js/puzzles.js` | `packages/puzzle-sdk` + `puzzles/<id>/` klasörleri |
| `js/state.js` | `localStorage` yerine `readers`, `reading_progress`, `puzzle_runs` |
| `css/tokens.css` | `packages/ui` token'ları + `content/issues/<ay>/theme.css` |

## 3:4 tuval ve ekran boyutları

3:4 **tasarım** ölçüsüdür, çerçeve ölçüsü değil. İçerik hep 3:4'e göre kurgulanır
(`cqi` birimleri, yorum pinlerinin normalize koordinatları buna dayanır), ama tuval
her ekranda birebir 3:4 çizilmez:

| Ekran | Tuval | Neden |
|---|---|---|
| Telefon (ekran dergiden uzun) | Genişlik ekran kadar, yükseklik letterbox tam bir bant boyuna inene kadar uzar | 3:4'te bırakılırsa 19.5:9 bir telefonda ekranın **%38'i** ölü kalıyordu. Fazla yükseklik tam kanama görsellerin taşma payıdır |
| Tablet / masaüstü | 3:4, en fazla 560px | Yanında masa kalıyor: dergi bir **obje** gibi durur, boşluk arayüze (bantlar, sabit menü) ev sahipliği yapar |
| Basık ve geniş pencere | Yüksekliğe sığar, 3:4 korunur | Yanlardaki boşluğu sabit menü doldurur (pencere ≥ 440px yüksekse) |

Zemin (`--backdrop`) bilerek boş değil: derginin altında bir ışık havuzu ve karanlık
temada dergiye ince bir kenar ışığı var. Bir obje ancak kenarı görünüyorsa obje gibi
durur — yoksa geriye “kocaman siyah alan” izlenimi kalır.

## Yorum ankrajı

Ayrıntılı gerekçe: [`docs/YORUM-SISTEMI.md`](../docs/YORUM-SISTEMI.md).

| Seviye | Ne | Nerede |
|---|---|---|
| `block` | İçerik ağacındaki bir blok — `pageId:index[.alt]` | Metnin her yeri. Sözlük satırı ve manga paneli de ayrı blok |
| `point` | Tuvale göre normalize `{x,y}` | Yalnızca görseller ve manga panelleri: orada konum gerçekten anlam taşır |
| `page` | Blok gerçekten silinmişse | Yorum asla kaybolmaz |

`quote` bir ankraj **değil**, yorumun kendi alanıdır. Bu ayrım olmadan aynı cümleye
ikinci bir yorum yazılamıyordu: ilk yorum cümleyi sarıyor, sonrakiler kendi metnini
bulamayıp sessizce sayfa seviyesine düşüyordu. Alıntı artık metne dokunmuyor,
yorumun **içinde** duruyor — aynı cümleye kaç kişi isterse yazabilir.

Baloncuklar kümelenir ve bir sayfa en fazla 6 pin gösterir; yoğunluk artınca
baloncuk seyrelmez, kümeler kabalaşır. Bir kümede kaç ses varsa sayaçta durur,
dokununca hepsi pop-up'ta açılır. `MAG.flood(250)` ile bunların hepsi ölçekte
denenebilir.

### Yorum sunumu — baloncuk ve pop-up

Yorum bir arayüz katmanı değil, sayfanın üstünde duran küçük bir **baloncuk**.
Metin altı çizgisi, paragraf highlight'ı, kenar çentiği yok: eş okuma açıkken
yorumlu her blok kendi baloncuğunu alır, görsele bırakılanlar zaten bıraktıkları
noktada durur.

| Ne | Nasıl |
|---|---|
| Baloncuk | Yorumun yaşadığı yer. Boşta hafifçe salınır |
| Dokun | Tuvalin **üstünde** pop-up açılır: oradaki bütün sesler, kaydırmalı |
| Basılı tut + sürükle | Baloncuğu taşı; konum yoruma yazılır, yeniden çizimde orada kalır |
| Eş okuma kapalı | Baloncuklar gizli — ilk okuyuş yazarın |

Sayfa düzeni yorum sayısından bağımsız: 3 yorum da olsa 300 yorum da olsa sayfa
aynı kalır, değişen tek şey baloncuğun üstündeki sayaçtır.

### Pin kümelenmesini görmek — `MAG.pins()`

Kümelenme görünmez bir kural: iki pin "yeterince yakın"sa tek pine iner. Bu
görünüm o **yeterince yakın**ı çizer.

| Çizim | Ne demek |
|---|---|
| Kesikli mavi elips | Pinin **çekim alanı** — buraya düşen yeni yorum ona katılır |
| Turuncu elips | İki alan **çakışıyor**: oraya düşen yorum en yakına değil, **sırada önce olana** gider |
| Yeşil elips | Uzun bastığın nokta bu alana düştü — yorumun bu pine katılacak |
| `#1 #2 #3` | Sınama sırası. Çakışmada kazananı bu belirler |
| İnce mavi çizgi | Hangi ham nokta hangi pine katıldı (yarıçap kuralıyla) |
| Kalın pembe çizgi | **Pin sınırı** yüzünden birleşme — mesafeye bakılmadan |
| Pembe kesik çizgi | En yakın iki pin: sınır aşılırsa sırada bunlar var |
| `×` | Yorumun gerçek koordinatı; pin oraya değil kümenin **ortalamasına** konur |

Mesafe tuval **genişliği** biriminde ölçülür (`dy × 4/3`, 3:4 *tasarım* oranı).
Tam 3:4 bir tuvalde çekim alanı ekranda kusursuz bir dairedir; telefonda tuval
uzadığı için ekranda **dikey elipse** dönüşür (375px genişlikte 105×144 px).
Bu bilinçli: kural tasarım tuvaline bağlı olduğu için aynı iki yorum her cihazda
aynı şekilde birleşir. Görünüm bunu düzeltmez, olduğu gibi çizer.

Sınır birleşmelerini (pembe) görmek için önce `MAG.flood(250)` çalıştır — tohum
veride bir sayfa 6 pin sınırını aşmıyor.

## Bilinçli sadeleştirmeler

- **Tek dil.** Dil seçici çalışır ama içerik yalnızca Türkçe. Çok dillilik altyapısı
  (yönlendirme, eksik çeviri notu) gerçek projede kurulacak.
- **İki dolu sayı.** Arşivde dört sayı listelenir (№ 01–04), ikisi gerçekten açılır:
  № 04 “Gürültü” (2026-10, güncel) ve № 03 “Kızıl Mevsim” (2026-09). № 02 ve № 01
  bilerek içeriksiz — arşivin boş hâli de tasarımın parçası.
- **Sahte OTP.** Kod istemcide üretilir. Gerçekte Supabase + Resend.
- **İstatistikler sabit.** `puzzle_stats` yerine `data.js` içinde elle yazılmış sayılar.

## Görseller ve gömülü font

Prototip **ağa hiç çıkmaz** — CDN yok, dış istek yok. Ama "her şey satır içi SVG"
de artık doğru değil: 2026-09 gerçek dosyalarla döşendi, hepsi depoda duruyor.

| Ne | Nerede | Not |
|---|---|---|
| Sayfa fotoğrafları | `assets/2026-09/*.webp` (8 dosya) | Commons görselleri; künye sayfasında kaynakları yazılı |
| One-shot kareleri | `assets/2026-09/kapali-kapilar/` (9 dosya, ~390 KB) | 7 kare + bölüm kapağı + stüdyo logosu |
| Çizilmiş sahneler | `js/art.js` | 2026-10'un tamamı hâlâ satır içi SVG (`scene:` öneki) |
| Gömülü font | `assets/animeace2_reg.ttf` (64 KB) | Projenin **tek** gömülü fontu; yalnız manga balonu ve başlığı |

`render.js`'teki `backgroundFor()` üç öneki çözer: `scene:` (çizilmiş),
`photo:` (tohumlu sahte fotoğraf), `img:` (gerçek dosya).

**One-shot — “Kapalı Kapılar”.** 2026-09'un manga bölümü KARGAMANGA'ya ait,
**izinle** yayımlandı; telif sahibinde kalıyor. 7 kare, tek sayfalık plan düzeni,
soldan sağa okunuyor (Japon one-shot'ı değil, o yüzden `dir: "ltr"`). Sağ alttaki
PIGMENT filigranı yorum baloncuklarıyla aynı dilde: dokununca stüdyonun YouTube
Shorts sürümüne gider.

> **Font lisans borcu:** Anime Ace şu an ham TTF olarak gömülü ve yalnızca
> prototipte kullanılıyor. Yayın öncesi ya lisansı satın alınmalı ya da OFL bir
> alternatifle değiştirilmeli. Gerçek build'de WOFF2'ye inecek (~30 KB).

## Bulmaca sözleşmesi

Prototipteki bulmacalar **gerçek custom element**. Yani plandaki sözleşme burada da
birebir geçerli:

```html
<magazine-puzzle-kelime-avi config='{…}' locale="tr" state='{…}'></magazine-puzzle-kelime-avi>
```

Yaydığı olaylar: `puzzle:ready` · `puzzle:progress` · `puzzle:solved` · `puzzle:failed`
· `puzzle:hint`. Bulmaca ağa çıkmaz, veritabanı bilmez, dergiyi tanımaz.

`panel-sirala` bilerek en son yazıldı: çekirdek kodun tek satırına dokunmadan,
sadece bir sınıf + `customElements.define` + `data.js`'te bir kayıt ile eklendi.
“Her parça lego” ilkesinin prototipteki kanıtı bu.
