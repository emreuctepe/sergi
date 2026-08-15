# Prototip

Derginin **tam görünümlü sahte hâli**. Gerçek arka uç, gerçek içerik derleyicisi ve
gerçek Supabase yok — ama ekranların hepsi var ve gerçekten çalışıyor.

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

## Neyi deneyebilirsin

| Ne | Nasıl |
|---|---|
| Tanıtım sahnesi | İlk açılışta gelir. Tekrar izlemek için: Menü → “Tanıtımı tekrar izle” |
| Sabit menü | Geniş pencerede menü kendiliğinden açık durur. “Sade görünüm” ile kapanır, hamburger ile geri gelir; tercih hatırlanır |
| Okuma derinliği | Üst çubuktaki üç çubuklu rozet. **İçerik gerçekten değişir** (18 / 25 / 29 sayfa) |
| Bloğa yorum | Eş okuma açıkken **bir paragrafa dokun**. Hedef koca bir paragraf, ıskalanmaz |
| Alıntılı yorum | Bir cümleyi seç → “Yorum yaz”. Cümle yorumun **içine** girer, ankraj yine bloktur |
| Görsele yorum | Görselde ya da manga panelinde **uzun bas** → tam o noktaya pin bırakılır |
| Eş okuma | Alt çubuktaki “yorumlar” düğmesi. Tuval geri çekilir, blok çentikleri ve alıntı ısısı belirir |
| **Fısıltı** | Eş okuma açılınca alt bant iki satıra açılır ve o an odaktaki bloğun sesini söyler. Bir paragrafa dokun → bant o sese geçer; **aynı yere ikinci kez** dokun (ya da banda dokun) → konuşma açılır |
| **Kenar** | Menü → Yorum sunumu → Kenar. Geniş pencerede kartlar **derginin sağındaki boşlukta** (ray), dergi tam genişlikte kalır — en temizi “Sade görünüm” ile. Pencereyi telefon boyuna daralt → **dokuma**: şerit bloğun ardında, dokun → açılır, tekrar dokun → thread |
| **Şerh** | Menü → Yorum sunumu → Şerh. Dipnot gibi: metinde bloğun sonunda üst-simge numara `[1]`, sayfa altında numaralı **haşiye**. Numaraya dokun → notuna kayar, nota dokun → thread |
| Sunum değiştirme | Menü → Ayarlar → “Yorum sunumu”. Fısıltı / Kenar / Şerh / Yok. Aynı sayı, aynı yorumlar, farklı sunum — sağlamı bulana dek biriktiriyoruz |
| Alıntı ısısı | Çok alıntılanan cümlenin altı kalınlaşır. Dokun → o cümleye yazılmış bütün sesler |
| Dolu sayı | Sayı 248 yorumla geliyor. En sıcak cümle: `km-1`'de “renk her gün yaklaşık yirmi metre iner” — 16 alıntı, tek işaret |
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
| `js/data-comments.js` | Supabase `comments` tablosunun içeriği (248 tohum yorum) |
| `js/art.js` | `content/issues/<ay>/sections/*/images/` altındaki AVIF/WebP dosyaları |
| `js/render.js` | `apps/web/src/lib/blocks/<tip>/` — her blok tipi kendi klasöründe |
| `js/canvas.js` | `apps/web/src/lib/canvas/` — 3:4 tuval, snap motoru |
| `js/comments.js` | `apps/web/src/lib/comments/` + Supabase `comments` tablosu |
| `js/whisper.js` | `apps/web/src/lib/comments/whisper/` — yorum sunumu “Fısıltı” (deneniyor) |
| `js/kenar.js` | `apps/web/src/lib/comments/rail/` — yorum sunumu “Kenar” (ray/dokuma, deneniyor) |
| `js/serh.js` | `apps/web/src/lib/comments/footnote/` — yorum sunumu “Şerh” (dipnot/haşiye, deneniyor) |
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
bulamayıp sessizce sayfa seviyesine düşüyordu. Artık sayfadaki işaret bir yorumu
değil **kaç kişinin o cümleyi alıntıladığını** gösteriyor — bir cümle başına tek
işaret, yorum arttıkça çoğalmıyor, koyulaşıyor.

Bir blokta kaç yorum olursa olsun sayfada tek **temsilci ses** görünür
(`2×tepki + cevap sayısı + editör seçimi`), kalanlar sayaçta durur. Pinler
kümelenir ve bir sayfa en fazla 6 pin gösterir; yoğunluk artınca pinler seyrelmez,
kümeler kabalaşır. `MAG.flood(250)` ile bunların hepsi ölçekte denenebilir.

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

### Fısıltı — alt bant konuşur

Üç sunum yolundan ilki (`docs/YORUM-SISTEMI.md` §4, Yol B). Eş okuma açıkken alt
bant iki satıra açılır ve **o an odaktaki bloğun temsilci sesini** söyler.

| Ne | Nasıl belirlenir |
|---|---|
| Odak | 1) son dokunulan blok · 2) kaydırmalı sayfada ekranın dikey ortasına en yakın yorumlu blok · 3) sayfanın en yüksek puanlı sesi |
| Şeridin üst satırı | Kim + nerede. Yorumun alıntısı varsa **alıntının kendisi** yazar |
| Şeridin alt satırı | Yorumun gövdesi, iki satır. Gerisi bir dokunuş uzakta |
| `+7` | Aynı yerdeki diğer sesler (cevaplar dâhil) |
| Sessiz sayfa | Şerit yerinde durur, “henüz sessiz” der — bant sayfa başına büyüyüp küçülmesin diye |

Sayfanın kendisine **hiçbir düğüm eklenmez**; odaktaki blok yalnızca bir
öznitelikle aydınlatılır. Yolun tamamı `js/whisper.js` + `css/comments.css`
sonundaki tek bölümde durur.

**Yer maliyeti** (bu yolun asıl tartışması): şerit 66 px ister. Telefonda tuval
3:4'ün üstünde uzatıldığı için bunu **taşma payından** alır — 390×844'te tuval
720 → 588 px iner, sayfadan kapanan yer 1 px. Payın olmadığı ekranlarda (basık
telefon, kısa masaüstü penceresi) şerit sayfanın alt ~%14'ünün üstüne biner.

### Kenar — kenar rayı / dokuma

İkinci sunum yolu (`docs/YORUM-SISTEMI.md` §4, Yol A). Kullanıcının tarif ettiği
şeyin birebir karşılığı: **cümle ve ona iliştirilen ses aynı anda, hepsi birden.**
İki biçim, tuval genişliğine göre kendisi seçer.

**Ray** (geniş ekran). Kartlar **tuvalin dışında**, derginin sağındaki boşlukta
(letterbox gutter). Dergi objesi tam 3:4 ve tam genişlikte kalır — metin
daralmaz; kartlar gerçek bir dergi kenar notu gibi yanında durur:

| Çizim | Ne demek |
|---|---|
| Kart | Bloğun temsilci sesi: avatar, ad, yanıtladığı **alıntı**, gövde (3 satır), `+N ses` |
| Hizalama | Kartın üstü bloğunun tam hizasında; kaydırdıkça kartlar bloklarını takip eder |
| Aşağı itilen kartlar | İki blok birbirine yakınsa kartlar çakışmasın diye alttaki aşağı kayar |
| `+N daha` (rayın dibinde) | Bir sayfaya sığmayan kartlar burada toplanır; dokun → hepsi thread'de |

Sol menü (dock) açıkken sağ boşluk daralır; dar pencerede ray sığmazsa dokumaya
düşer. **Sade görünüm** (dock kapalı) simetrik durur: solda menü, ortada dergi,
sağda ray.

**Dokuma** (telefon, tuval <520px). Kenar yok, çünkü ekranın kenarı yok. Aynı
veri bloğun **hemen ardına** tek satırlık şerit olarak iner: `🦩 "…" +3`.
Dokun → yerinde 3 satıra açılır. Tekrar dokun → thread. Yorumlu sayfa bu modda
uzar ("sığan sayfa" kimliği bilerek esner).

**Kapsam:** ray/dokuma yalnızca **metin sayfalarında**. Tam kanama görsel, kapak,
manga, bulmaca, sayı sonu kendi düzenleriyle kalır; oralarda blok yorumu eski
rozet+thread'e düşer, nokta pinleri her yerde çalışır. Yolun tamamı `js/kenar.js`
+ `css/comments.css` sonundaki tek bölümde.

### Şerh — dipnot / haşiye

Üçüncü sunum yolu (`docs/YORUM-SISTEMI.md` §4, Yol D). Yorum bir arayüz balonu
değil, **kitabın kendi diziliş dili**: metinde bloğun sonuna üst-simge numara
`[1]`, yorumun kendisi sayfanın altında numaralı bir **haşiye** olarak dizilir.
Osmanlı yazma geleneğindeki şerh/haşiye gibi — metnin kenarına düşülmüş okur notu.

- Numaraya dokun → notuna kayar (dipnot gezinmesi, kısa bir parıltı).
- Nota dokun → thread açılır.
- Sayfa notlar için **uzar**; her şey akışın içinde olduğu için (Kenar'ın aksine)
  gutter/hizalama/kaydırma derdi yok — en basit sunum bu. Her ekranda aynı.
- Liste/sözlük satırları tek tek numaralanır.

Yolun tamamı `js/serh.js` + `css/comments.css` sonundaki tek bölümde.

> **Not — sunum yolları biriktiriliyor:** Fısıltı, Kenar, Şerh şu an menüde yan
> yana. "Doğru" yorum sistemi bulunana kadar eleme yapmıyoruz; sırada Uğultu,
> Mektuplar gibi başka yollar da var (`docs/YORUM-SISTEMI.md` §"Sırada denenecek").

## Bilinçli sadeleştirmeler

- **Tek dil.** Dil seçici çalışır ama içerik yalnızca Türkçe. Çok dillilik altyapısı
  (yönlendirme, eksik çeviri notu) gerçek projede kurulacak.
- **Tek sayı.** Arşivde üç sayı görünür, biri açılır.
- **Sahte OTP.** Kod istemcide üretilir. Gerçekte Supabase + Resend.
- **İstatistikler sabit.** `puzzle_stats` yerine `data.js` içinde elle yazılmış sayılar.

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
