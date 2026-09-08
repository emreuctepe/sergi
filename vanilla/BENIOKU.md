# sErgi · Sayı 03 "Kızıl Mevsim" — okuma sürümü

Bu klasör derginin **bugünkü görünümünün** derlemesiz kopyası. Saf HTML, CSS ve
JavaScript; paket yöneticisi, derleme adımı, sunucu tarafı ve dış bağımlılık
yok.

Ana projeden **bağımsız**: klasörü olduğu gibi kopyalayıp başka bir yere
taşıyabilir, oradan servis edebilirsin.

---

## Çalıştırmak

Klasörün içinden:

```sh
python3 -m http.server 8080
```

Sonra tarayıcıda `http://localhost:8080`.

Statik dosya sunan herhangi bir şey olur (`npx serve`, nginx, GitHub Pages,
Cloudflare Pages…).

> ⚠️ **`index.html`e çift tıklamak çalışmaz.** Sayfalar `fetch` ile
> yükleniyor ve tarayıcılar `file://` altında yerel dosya okumaya izin vermiyor
> (CORS). Ekranda boş bir tuval görürsün, konsolda da fetch hatası.

---

## Sayının sırasını değiştirmek

Sıranın **tek** kaynağı `index.html` içindeki `#sira` bloğu:

```html
<script id="sira" type="text/plain">
  sayfalar/kapak-1
  sayfalar/ed-1
  sayfalar/ed-2
  …
</script>
```

| Ne istiyorsun | Ne yapacaksın |
|---|---|
| Sayfayı öne/arkaya al | Satırı yukarı/aşağı taşı |
| Sayfayı sayıdan çıkar | Satırı sil (klasör dursun, zararı yok) |
| Yeni sayfa ekle | `sayfalar/` altında klasör aç, içine `sayfa.html` koy, listeye bir satır ekle |
| Not düş | `#` ile başlayan satırlar ve boş satırlar atlanıyor |

Klasör adlarında **sıra numarası yok** ve bu bilinçli: numara koysaydık sıra
iki yerde yazılı olurdu ve ilk taşımada biri yalan söylemeye başlardı.

---

## Bir sayfa neye benziyor?

`sayfalar/<id>/sayfa.html` tek bir `<section>` — kendi kendine yeten bir parça.
Sayfayla ilgili her şey kendi özniteliklerinde yazıyor, ayrı bir tanım dosyası
yok:

```html
<section class="page"
         data-page-id="km-2"          <!-- kimlik -->
         data-mod="mid full"          <!-- hangi okuma modlarında görünür -->
         data-section-title="Kızıl Mevsim"
         data-kind="figure"           <!-- sayfa türü: düzeni etkiler -->
         data-fit="contain"           <!-- contain = tek ekran, scroll = uzun -->
         data-bleed="full"            <!-- görsel kenarlara taşıyor mu -->
         data-scene="mask-wipe"       <!-- giriş animasyonu -->
         data-inview="true">
```

`data-index` ve `aria-label` burada **yok**: onları `js/okuyucu.js` diziliş
sırasında yazıyor, çünkü hem sıra hem mod değişebiliyor. Dosyaya yazılsalardı
ilk düzenlemeden sonra yanlış olurlardı.

---

## Okuma modları

Üç mod var ve **sayfalar DOM'dan çıkmıyor, yalnızca gizleniyor** — süzme
`css/bilesen.css` §7'deki üç CSS kuralında:

```css
:root[data-depth='min'] .page:not([data-mod~='min']):not([data-mod~='all']) { display: none; }
```

| Mod | Sayfa | Not |
|---|---|---|
| `min` — Doomscroller | 20 | |
| `mid` — Dengeli | 30 | |
| `full` — Doomreader | 33 | |
| **DOM'daki toplam** | **34** | |

(Sayılar tarayıcıda ölçüldü. Önceki tablo 19/28/31 ve toplam 32 diyordu; o
değerler `ms-1` → `ms-galeri` takasından önceye aitti ve eskimişti.)

⚠️ Toplam 34, en büyük mod 33: **`min`, `full`ün alt kümesi değil.** `k-min`
sayfası ("Üç cümlede 1923") yalnızca `min` modunda var — uzun dosyanın üç
cümlelik karşılığı. Bu yüzden "full'ü göster, fazlasını gizle" gibi bir kısayol
kullanılamıyor.

Mod, üst banttaki çipe tıklayınca açılan kartlardan seçiliyor ve
`localStorage`da hatırlanıyor.

Aynı ekranın altında ikinci bir soru daha var: **görünüm** (aydınlık/karanlık).
Mod seçimi modalı kapatır, tema seçimi kapatmaz — tema anında uygulanıyor ve
okurun sonucu arkadaki sayıda görüp fikrini değiştirebilmesi gerekiyor.

**Varsayılan karanlık.** Kural tek bir yerde yazılı, `index.html`in
`<head>`indeki tema betiğinde; `js/acilis.js` temayı kendi varsayılanından
değil, o betiğin `<html>`e yazdığı değerden okuyor. Sistem tercihi
(`prefers-color-scheme`) bilerek sorulmuyor: okur burada bir karar veriyor ve
işletim sistemi o kararı ne zaman ezeceği belirsiz bir üçüncü ses olurdu.

---

## Dosyalar

```
index.html          sıra + kabuk (bantlar, folio, ilerleme çubuğu)
NOTLAR.md           index.html'in geliştirici notları — `<!-- not: … §x -->` işaretlerinin karşılığı
tezgah-*.html       tek parçayı başsız tarayıcıya poz verdiren tezgâhlar (sayı bunlara bakmıyor)
js/acilis.js        tek giriş noktası: yükleme → tanıtım → mod + tema seçimi → sayı
js/okuyucu.js       dizme, mod, folio, ilerleme, gezinme, giriş animasyonları
js/manga.js         manga sayfasının tam ekran / yakınlaştırma katmanı
js/telif.js         çizerin görsellerine dokunma engeli (kapsam: 18 görsel)
js/kanto.js         alev hortumunun SMIL saati (hareket tercihi CSS'e işlemiyor)
js/sahneler.js      tanıtım kartlarının arka planları (tohumlu üretim)
js/bulmaca.js       emoji bilmecesi (bl-1) — sorular da bu dosyada
css/app.css         katman sırasını beyan eder ve diğerlerini çağırır
css/bilesen.css     ana projede bileşenlerin içinde kalan kurallar + mod süzgeci
css/*.css           derginin küresel stilleri
sayfalar/<id>/      her snap sayfası kendi klasöründe
assets/2026-09/     görseller (webp kaynak + avif türevleri)
fonts/              Bad Comic (OFL 1.1) + lisans metni
```

---

## Manga sayfası neden tam ekran açılıyor?

`mn-1` sayının içindeki **tek 9:16 nesne** — bir YouTube Shorts uyarlaması. 3:4
tuvale ortalanınca 374px'e düşüyor, en küçük karesi 105px oluyor ve balon
yazısı **7.6px**'te kalıyor. Kaynak çizimler 1080×1920, yani sayfa onları 1/7
ölçekte gösteriyor.

Tarayıcı yakınlaştırması bunu çözmüyor: `--canvas-w` üç kısıtın en küçüğü ve
%135'ten sonra `100svh * 3/4` terimi bağlayıcı oluyor — tuval fiziksel **750
pikselde düzleşiyor**, ne kadar yakınlaştırırsan yakınlaştır.

Bu yüzden alt bantta yalnız o sayfada beliren bir düğme var (sayfaya tıklamak
da açıyor). Açılan katmanda sayfa **bütün olarak** duruyor — kare kare değil:
`plan` ızgarası bir sayfa kompozisyonu ve geleneksel manga sayfası bir bütün
olarak okunur.

Katmandaki ölçek bir `transform` **değil**, gerçek bir düzen ölçeği: sahne,
tuvalin büyütülmüş bir kopyası (`--canvas-h` ve container birimleri orada
yeniden tanımlanıyor), böylece `blocks.css`'teki plan formülü tek satırı
değişmeden çalışıyor. Dönüşüm kullanılsaydı `srcset` düzen boyutuna baktığı
için tarayıcı 600w dosyada kalır ve büyüdükçe çizim bulanıklaşırdı.

| | akışta | sığdırma | çift tıklama |
|---|---|---|---|
| sayfa genişliği | 374px | 531px | 1274px |
| balon yazısı | 7.6px | 10.7px | **25.8px** |

(1920×1000 ekranda ölçüldü.) Ayrıntı ve gerekçeler `js/manga.js` başındaki
blokta ve `css/overlays.css` §TAM EKRAN MANGA'da.

---

## Kantō sahneleri neden temayı izlemiyor?

Kantō Depremi dosyasının (`k-*`) altı arka planı fotoğraf değil, satır içi SVG —
ana projedeki `src/lib/art/kanto/` klasörünün vanilla karşılığı. Yanlarındaki
öbür üretilmiş sahneler (`ed-1`, `son-kunye`, tanıtım kartları) renklerini
`var(--paper)` / `var(--accent)`ten alıyor ve tema koyuya dönünce onlar da
dönüyor. **Bunlar dönmüyor: hexleri sabit.**

Sebep, bu sahnelerin DESEN değil IŞIK olması. Bir seigaiha ızgarası açık zeminde
de koyu zeminde de aynı şeyi anlatır; bir alev hortumunun anlamı ise karanlığın
içindeki tek parlak kütle olmasında. `--paper` açık temada `#f5f1e8`e dönseydi
hortum açık zemine düşer, değer yapısı çöker, silüet okunmazdı. Gerekçenin uzunu
ana projede `src/lib/art/kanto/palet.ts`in başında.

Bunun iki görünür sonucu var:

1. **`data-scrim`** (`css/bilesen.css` §8). `blocks.css` tam kanamalı sayfalara
   koşulsuz siyah, ötekilere koşulsuz kâğıt perdesi sürüyor; ikisi de fotoğraf
   için doğru, bu sahneler için değil. `k-son` (2025 Tokyo) **gündüz** bir sahne
   ve siyah perde onu karartıp `k-3` ile arasındaki bütün karşıtlığı silerdi —
   o yüzden `data-scrim="light"` ve metni `blk--invert` **kullanmıyor**.

2. **`js/kanto.js`**. `k-3`teki alev hortumu sayının tek SMIL animasyonu ve SMIL,
   CSS'in hareket kurallarını dinlemiyor: `prefers-reduced-motion` `<animate>`
   elemanına değmiyor. O dosya tercihi okuyup SVG'nin saatini durduruyor.

`k-5`in düotone sahnesi arka plan **değil**, `figure` bloğu: o sayfa uzun metin
taşıyor ve metin bir sahnenin üstünde okunmazdı.

---

## Bulmaca (`bl-1`)

Üç emoji bir şeyi anlatıyor, okur dört şıktan birini seçiyor. Sekiz soru;
beşi pop kültür (anime, film, oyun), üçü gelenek ve simge. Sorular
`js/bulmaca.js`in başındaki `BULMACALAR` dizisinde — soru eklemek diziye bir
kayıt eklemek demek, sayan başka hiçbir yer yok.

Ekranda **tek soru** var. Alt alta dizilseydi sayfa uzar ve oyun hissi
kaydırmanın içinde dağılırdı; tek soru ayrıca sayfayı `data-fit="contain"`
tutuyor, yani oynarken hiç kaydırma yok.

⚠️ `contain`in bedeli: içerik tuvale **sığmak zorunda**, `.page`te
`overflow: hidden` var ve taşan şey uyarısız kesilir. Düzen bu yüzden baştan
sona esnek ve üç yerde ölçüyle sabitlendi (`css/puzzles.css`):

| Ne | Neden |
|---|---|
| Başlık `--fs-2xl` değil `--fs-xl` | 2xl'de emoji sahnesine 4.7cqi kalıyordu — emojinin üçte biri |
| Açıklama şeridi `min-height: 12cqi` | Cevapla birlikte doğan metne baştan yer ayırıyor, yoksa şıklar cevap anında zıplıyordu |
| Emoji `min(1em, 76cqh)` | Sahne beklenenden kısalırsa emoji onunla birlikte küçülüyor, taşmıyor |

Skor `localStorage`a **yazılmıyor**: okuyucu sayfaları DOM'dan söküp takmıyor,
yani okur sayıda gezip dönse bile bulmacayı bıraktığı yerde buluyor. Kayıt
ancak "ikinci ziyarette de hatırla" demek olurdu.

## Çizerin görselleri

Sayıda iki telif rejimi var ve sınır `assets/2026-09/` klasör yapısına birebir
oturuyor:

| yol | ne | sahibi |
|---|---|---|
| `assets/2026-09/*.webp` | 5 arka plan (3'ü kullanımda) | Wikimedia Commons (CC0 / CC BY / CC BY-SA) |
| `assets/2026-09/KantoDepremi/` | 3 arşiv fotoğrafı (1923) + 1 Tokyo karesi (2023) | ⚠️ **belirsiz — aşağıya bak** |
| `assets/2026-09/kapali-kapilar/` | 7 kare + kapak + logo | KARGAMANGA |
| `assets/2026-09/soylesi/` | 8 çizim + kapak | KARGAMANGA |

Beş webp'ten üçü sayfalarda: `kapak` (kapak-1), `yaprak` (km-imza, son-1),
`dalga` (sz-1). Kalan ikisi — `sisli-vadi` ve `tapinak` — Kızıl Mevsim'in arka
planlarıydı; sayfaları (`km-acilis`, `km-2`) klasörde duruyor ama `#sira`da
değil, o yüzden görseller de sayıya girmiyor. Sıraya geri yazılırlarsa
çalışırlar, künyeye de atıfları geri gelmeli.

Bir zamanlar sekiz taneydiler. `fener`, `yagmur` ve `tren` eski "Gece Hattı"
foto-öyküsünündü; o bölüm Kantō Depremi dosyasına dönüşünce hiçbir sayfa onları
çağırmaz oldu ve **dosyaları silindi** (12 dosya: 3 webp + 9 avif türevi).
Künyeleri `sayfalar/son-kunye/sayfa.html` içindeki yorumda kayıtlı — depoda
sürüm kontrolü yok, geri istenirlerse Commons'tan yeniden indirilecekler.

⚠️ **`KantoDepremi/` künyesi henüz doğrulanmadı.** Üç kare 1923 tarihli, yani
eserin kendi telifi büyük olasılıkla düşmüş; ama dosya adlarındaki uzun
numaralar (`…-1053504330`, `…-1825192360`) stok ajansı kimliğine benziyor ve
ajans TARAMASI ayrı bir hak doğurabiliyor. `son-kunye` sayfasındaki satır bu
yüzden yer tutucu. Sayı yayımlanmadan önce her karenin arşivi, erişim
bağlantısı ve lisansı doğrulanmalı.

Dördüncü dosya (`960px-Tokyo_Tower_2023-…`, `k-son`un arka planı) ötekilerden
ayrı duruyor: `960px-` öneki Wikimedia küçük-resim adlandırmasıdır, yani kaynağı
büyük olasılıkla Commons ve lisansı oradan okunabilir. Yine de **doğrulanmadı**;
künyeye yazılmadan önce dosya sayfasındaki lisans ve yazar alanı görülmeli.

Foto sayfaları (`gh-acilis`, `gh-1`, `gh-5`, `k-son`) `srcset` KULLANMIYOR: türevleri
üretecek araç bu makinede yok (ne ImageMagick ne PIL ne avifenc). Gerçek künye
gelirken `-600/-900/-1200.avif` türevleri de üretilirse sayfalar öbür sekiz
arka planla aynı `<picture>` kalıbına döner.

İkinci gruptaki **18 görselde** sağ tık ve sürükleme kapalı (`js/telif.js` +
`css/bilesen.css` §5). Tek muaf görsel manga sayfasındaki PIGMENT filigranı:
o bir bağlantı ve sağ tıkı kesmek "yeni sekmede aç"ı da keserdi.

⚠️ **Kapsam genişletilemez.** Wikimedia görsellerinin bir kısmı CC BY-SA ve o
lisans (§2(a)(5)(B)) "etkin teknolojik önlem" uygulamayı açıkça yasaklıyor —
`document`e koşulsuz bir `contextmenu` engeli koymak sayının kendi künyesiyle
çelişirdi.

⚠️ Bu bir **koruma değil, caydırıcı**. Görsellerin adresi sayfa kaynağında düz
duruyor, ağ sekmesi zaten her şeyi gösteriyor, ekran görüntüsü de hiçbir web
tekniğinin altına inemeyeceği taban. Engellenen şey kazara ve kolay kaldırma.

---

## Bu sürümde OLMAYANLAR

Klon **yalnızca okumak** için. Ana projedeki şu şeyler burada yok:

- Yorumlar, okur kimliği, giriş
- Analitik, ilerleme kaydı, seri takibi
- Sayı arşivi, başka sayılar

Ana projenin **bulmaca motoru** da burada yok — ama `bl-1` artık boş değil:
yerinde kendi başına yeten tek bir oyun var (aşağıya bak).

Tanıtımın dördüncü kartı "Nereye istersen yorum yaz" diyor. Bu bir vaat ve
klonda karşılığı yok — ama ana projede de henüz yok (yorum sistemi ayrı bir
faz). Kart bilerek olduğu gibi bırakıldı; kopya, kopyaladığı şeyden daha
iddialı da daha mütevazı da olmamalı.

---

## Fontlar hakkında

Ana projede iki manga fontu kayıtlı: **Bad Comic** (SIL OFL 1.1, seçili olan) ve
**Anime Ace** (lisanssız, henüz `static/` altında duruyor).

Klona yalnızca Bad Comic kopyalandı. Sebebi bu klasörün varlık sebebi: klon
paylaşılmak için var, yani lisanssız bir fontu dağıtır hâle gelmemeli.
`css/tokens.css`teki Anime Ace `@font-face` bloğu bu yüzden çıkarıldı.

`fonts/BadComic-OFL.txt` "eklenmese de olur" bir dosya değil — OFL 1.1 fontun
lisansıyla birlikte dağıtılmasını şart koşuyor.
