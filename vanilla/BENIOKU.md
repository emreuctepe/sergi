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
  sayfalar/ed-sunus
  sayfalar/k-acilis
  …
</script>
```

> `sayfalar/ed-1` ("Eylül, aslında bir veda") ve `sayfalar/ed-2` **sırada yok**:
> ikisinin de yerini `ed-sunus` aldı. `ed-2`nin metni oraya taşındı (son üç
> dilim), yani sayıda iki kez durmuyor. Klasörleri diskte duruyor, geri
> getirmek listeye bir satır yazmak.
>
> Aynısı sayının sonunda: `sayfalar/son-kunye` (künye listesi) ve
> `sayfalar/son-1` (tek bir "…" taşıyan yaprak sayfası) **sırada yok**,
> ikisinin de yerini `son-jenerik` aldı. Künyenin içeriği oraya taşındı ve
> genişledi (lisanslar, yazı tipleri, başvuru).

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

Okura **iki mod** soruluyor ve **sayfalar DOM'dan çıkmıyor, yalnızca
gizleniyor** — süzme `css/bilesen.css` §7'deki CSS kurallarında:

```css
:root[data-depth='min'] .page:not([data-mod~='min']):not([data-mod~='all']) { display: none; }
```

| Mod | Sayfa | Not |
|---|---|---|
| `min` — Doomscroller | 19 | |
| `full` — Doomreader | 31 | |
| `mid` — Dengeli | 26 | okura **sorulmuyor** (aşağıya bak) |
| **DOM'daki toplam** | **32** | |

(Sayılar tarayıcıda ölçüldü — `#sira`daki satırlar da sayılıp doğrulandı.
Önceki tablo 20/33/34 diyordu; iki sayfa bir sayfaya indi — `son-kunye` +
`son-1` → `son-jenerik` — ama tablo zaten bir fazla sayıyordu, yani düşüş
ikiden fazla görünüyor. Daha önceki 19/28/31 ise `ms-1` → `ms-galeri`
takasından önceye aitti.)

⚠️ Toplam 32, en büyük mod 31: **`min`, `full`ün alt kümesi değil.** `k-min`
sayfası ("Üç cümlede 1923") yalnızca `min` modunda var — uzun dosyanın üç
cümlelik karşılığı. Bu yüzden "full'ü göster, fazlasını gizle" gibi bir kısayol
kullanılamıyor.

**`mid` gizli, silinmiş değil.** Seçenek listesinden (`js/okuyucu.js`
§`MODLAR`) çıkarıldı; sayfalardaki `data-mod="mid full"` etiketleri ve §7'deki
süzgeç kuralı yerinde duruyor, yani modu geri açmak o listeye bir satır eklemek
(bir de çipin çubuğunu geri koymak, `css/canvas.css`). Hiçbir sayfa bu arada
sahipsiz kalmıyor: yalnız `mid` etiketli tek bir sayfa yok, `mid`in gösterdiği
her şey `full`de de var. Kayıtlı tercih de aynı listeden doğrulandığı için
"Dengeli"de kalmış bir okura seçim ekranı bir kez daha açılıyor — artık
sorulmayan bir modda okumaya devam eden kimse olmuyor.

Mod, üst banttaki çipe tıklayınca açılan seçiciden geliyor ve `localStorage`da
hatırlanıyor. Aynı ekranda ikinci bir soru daha var: **görünüm**
(aydınlık/karanlık). İkisi de aynı desende çiziliyor — bir önizleme kutusu,
altında tek kelime. Kutuların çerçevesi ortak, içleri değil: okuma modunda
ortada modun simgesi, görünümde kâğıt rengini taşıyan bir sayfa taklidi.

Okuma modunun kutuların altında bir de açıklaması var — ama **yalnız seçili
olanınki**, tek satır, seçimle birlikte değişiyor. Her kutunun kendi cümlesi
(eskiden öyleydi) seçenekleri karşılaştırılacak metin bloklarına çeviriyordu;
iki kutu yan yanaysa fark zaten bakarak görülüyor. Tek satır onun yerine "şu an
buradasın"ı anlatıyor. Dakika ve sayfa künyesi bilerek yok.

⚠️ O iki cümle **sayıdan bağımsız** yazılmalı. `js/acilis.js` kabuğun parçası,
içeriğin değil: sayı her ay değişiyor, o satırlar değişmiyor. Bir dönem "manga,
foto-öykü ve bulmaca kısalmaz" diyorlardı — yani 2026-09'un bölüm listesini;
mangası olmayan ilk sayıda sessizce yalan olurlardı. Şimdi modun kuralını
anlatıyorlar (neyin kısaldığı, neyin kalmadığı). Ölçü: cümle önümüzdeki sayı
için de doğru mu?

**Hiçbir seçim modalı kapatmıyor.** İkisi de tıklandığı anda uygulanıp
kaydediliyor, kapatma kararı okurun. Mod seçimi bir dönem tıklanınca
kapatıyordu; aynı ekranda bir soru kaçarken öbürü durduğu için kaldırıldı —
kaçan taraf hem modu seçtikten sonra temaya dokunmayı hem de "seçtim ama
öbürüne de bakayım"ı imkânsız kılıyordu. Bedeli: seçim geri alınamıyor, Escape
"vazgeç" değil "kapat" demek. Okur sonucu arkadaki sayıda zaten gördüğü için
doğrusu bu.

Kapanış yolu açılışa göre değişiyor: ilk açılışta ✕/Escape/perde yok, altta
"Sayıyı aç" düğmesi var (sayıyı açmak bilinçli bir hareket kalsın diye);
çipten açılınca üçü de çalışıyor.

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
js/acilis.js        tek giriş noktası: yükleme → mod + tema seçimi → sayı
js/okuyucu.js       dizme, mod, folio, ilerleme, gezinme, giriş animasyonları
js/manga.js         manga sayfasının tam ekran / yakınlaştırma katmanı
js/telif.js         çizerin görsellerine dokunma engeli (kapsam: 18 görsel)
js/kanto.js         alev hortumunun SMIL saati (hareket tercihi CSS'e işlemiyor)
js/sahneler.js      ŞU AN KULLANILMIYOR — beş üretilmiş arkalık; beklediği outro
                    yazıldı ve onu İSTEMEDİ (aşağıya bak), yani artık sahipsiz
js/bulmaca.js       emoji bilmecesi (bl-1) — sorular da bu dosyada
js/jenerik.js       jeneriğin (son-jenerik) motoru: kaydırmayı yürütür, gelişte kendi başlar
js/hikaye.js        hikâye kabuğu: süre çubukları, dokunma bölgeleri, duraklatma
                    (içeriği tanımaz — dilimin içi boş bir kanvas)
js/karistir.js      metni karakter karakter çözen yazı motoru (scramble text)
js/yazi.js          karıştırmayan üç yazı animasyonu: süpürme, daktilo, netleşme
js/perde.js         SVG sahneyi satır içine indirir (katmanları animasyona açılsın)
js/sunus.js         `ed-sunus`un koreografisi — sayı ve tezgâh aynı zinciri oynatır
css/app.css         katman sırasını beyan eder ve diğerlerini çağırır
css/jenerik.css     jeneriğin düzeni: sabit perde + film künyesi tipografisi
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

| | akışta | sığdırma | **açılış (1.5×)** | çift tıklama |
|---|---|---|---|---|
| sayfa genişliği | 374px | 531px | **797px** | 1274px |
| balon yazısı | 7.6px | 10.7px | **16.1px** | 25.8px |

(1920×1000 ekranda ölçüldü.) Katman **sığdırmada değil 1.5 katında açılıyor**:
sığdırma balonu 10.7px'te bırakıyordu, yani akıştaki 7.6px'ten yalnız üç punto
ileride — 1280×720'lik bir pencerede ise ikisi birebir aynı çıkıyor ve düğme
hiçbir şey kazandırmıyordu. 1.5, balon yazısının 16px'i geçtiği ilk adım
(1.4× → 15.0px). Bedeli dikey: sayfa 1.42 ekran boyunda, okur aşağı kaydırıyor.
Sığdırmaya dönüş banttaki düğmede, `0` tuşunda ve çift tıklamada duruyor.

Ayrıntı ve gerekçeler `js/manga.js` başındaki blokta ve
`css/overlays.css` §TAM EKRAN MANGA'da.

---

## Sunuş sayfası (`ed-sunus`) nasıl çalışıyor?

Kapaktan sonraki ikinci sayfa bir **Instagram hikâyesi**: üstte altı süre
çubuğu, kenarlarda dokunma bölgeleri, arkada bir SVG sahne, önünde dört ayrı
dilde açılan yazı.

| # | dilim | yazı animasyonu | arkasındaki sahne | ne söylüyor |
|---|---|---|---|---|
| 1 | `baslik` | karıştırma | `ay` (`04.svg`) | kelime çoğalır → çekilir → kalan sayının adı olur |
| 2 | `sozler` | karıştırma | `ay` | dergi ne, dokuz cümlede |
| 3 | `sehir` | **süpürme** | `fener` (`02.svg`) | Kantō yazısı |
| 4 | `icerik` | **daktilo** | `yagmur` (`09.svg`) | röportaj, manga, masal |
| 5 | `cagri` | **netleşme** | `halka` (`06.svg`) | alıntı + "aşağı kaydır" |
| 6 | `kunye` | karıştırma | `ay` | Aylık · Eylül 2026 → Sayı 03 |

3–5'in metni `ed-2`den geldi (o sayfa sıradan çıktı) ve **bölündü, yeniden
yazılmadı**. Tam tur ~37 saniye; okur beklemek zorunda değil, kenara dokunup
geçiyor.

**Neden dört ayrı yazı dili?** İkisi için. Biri üslup: aynı karıştırma altı
dilim sürseydi üçüncüden sonra "efekt", dördüncüden sonra görünmez olurdu.
Öbürü daha somut — karıştırma **uzun cümle için yanlış araç**: okur metni ancak
tamamen çözüldükten sonra okumaya başlayabiliyor. Beş harflik bir kelimede
bedeli yok; on altı kelimelik bir cümlede dilimin yarısı okunamayan bir yazıya
bakmakla geçiyor. Süpürme ve daktilo açılırken okunuyor.

Altı dosya, altı iş, hiçbiri öbürünü tanımıyor:

| dosya | işi |
|---|---|
| `sayfalar/ed-sunus/sayfa.html` | işaretleme — 23 kopyalı baklava dilimi ve bütün metin |
| `js/sunus.js` | koreografi — hangi metin, hangi sırayla, kaç milisaniye |
| `js/hikaye.js` | kabuk — çubuklar, dokunma, duraklatma (içeriği tanımaz) |
| `js/karistir.js` | motor — metni karakter karakter çözer |
| `js/yazi.js` | motor — süpürme, daktilo, netleşme |
| `js/perde.js` | arkadaki SVG'yi satır içine indirir, katmanlarını numaralar |

**Arkadaki sahne neden `<img>` değil?** Çünkü istenen şey katmanların
**birbirine göre** süzülmesi — dağ ayrı, ay ayrı. Dışarıdan yüklenen bir SVG'nin
içine CSS giremiyor, o yüzden dosya `fetch` edilip satır içine indiriliyor
(kopyalanmıyor: iki kopya ilk düzenlemede ayrışır).

⚠️ **Buradaki dört SVG sunuşa ÖZEL — sergiyle ortak değil.** Bir dönem öyleydi
ve "asıl çizimler gelince sunuşun arkası kendiliğinden değişecek" diye yazılıydı.
Asıl çizimler geldi (2026-09-11) ve **bilerek buraya bağlanmadı**: kullanıcı
kararı, çizimler yalnız sergide. Sebebi bu sayfanın ne olduğu — `ed-sunus` bir
Instagram hikâyesi gibi kendi kendine akan altı dilim, yani sergi salonu değil.
Masalın kareleri orada, dolaşılarak, künyesiyle okunuyor; burada yalnız doku var.

İkinci bir sebep teknik: bu modülün varlık nedeni katman ayırmak, `.webp` ise
**tek katman**. Raster bir perde parallaxı sessizce öldürürdü.

Yani `02/04/06/09.svg` **silinemez** — sunuşun arkası onlara bağlı. Sergideki
`01…10.webp` ile aynı klasörde durmaları tarihsel: ikisi de aynı masaldan.

**Opaklık (`--kr-perde-opak: 0.38`) ölçülerek seçildi.** Sınırı koyan katman her
perdede aynı: `#e8d9b0`, ayın/fenerin içindeki krem leke. `--ink` ile kontrastı
α=0.38'de 5.1:1, α=0.42'de tam 4.5:1 (AA eşiği, payı yok), α=0.50'de 3.6:1.
Hesap analitik (`sonuç = zemin·(1-α) + katman·α`), yani ekran görüntüsü
gerekmiyor; tezgâhtaki **KONTRAST** panosu her perde için bu tabloyu yazıyor ve
"eşiği geçen en yüksek α"yı söylüyor.

**Sayfa döngüde.** Son perde künyeyi dağıtıyor, yani bitişte ekranda boş bir
kâğıt kalırdı; okur sayfaya geç gelirse hiçbir şey görmemiş olurdu. Zeminin son
dağılmayla birlikte açılış rengine dönmesi de zaten başa sarmak için tasarlandı
— sarışta tek bir renk geçişi oluyor, kâğıt parlaması yok.

**Ekrandan çıkınca perde geri sarılıyor.** Okur kapaktayken hikâyenin arkada
yanıp bitmemesi gerekiyordu. Saati durdurmak yetmedi: koreografi kendi
`setTimeout` zinciriyle akmaya devam ediyordu ve kapakta üç saniye duran okur
ilk perdenin yarısını kaçırıyordu. `hikaye.js` artık "kimse bakmıyor"
duraklatmasında (`gorus` / `gizli`) zinciri kesip dilimi **başa sarıyor** —
okur döndüğünde perdeyi baştan görüyor. Bakarak beklemek (`elle`, basılı tutma)
geri sarmıyor, kareyi donduruyor. Ayrıntı `js/hikaye.js` §IZLENMIYOR'da.

**Tezgâhı `tezgah-karistir.html`.** Koreografiyi kopyalamıyor: sayfayı `fetch`
edip `js/sunus.js`i çağırıyor, yani ölçtüğü zincir sayının oynattığı zincirin ta
kendisi. Üç panel var — satırın karışırken ne kadar "zıpladığı", perde
opaklığının kontrastı, ve her dilimin beyan/ölçülen süre payı.

> Son üç dilimin süresi **elle yazılmıyor, metnin uzunluğundan hesaplanıyor**
> (`js/sunus.js` §SÜRELER). Bir cümleye kelime eklemek dilimi kendiliğinden
> uzatıyor. Hesap tezgâhta doğrulandı: `sehir` 5748ms ölçüldü, hesap 5746
> demişti; `cagri` 7127'ye karşı 7126.

---

## Jenerik (`son-jenerik`) nasıl çalışıyor?

Sayı bir **jenerikle** kapanıyor: 終 karesi, sonra akan künye — emeği geçenler,
konuk, görseller ve lisansları, yazı tipleri, "nasıl yapıldı", sonraki sayının
başvuru kuponu, teşekkür, damga, ve jenerik sonrası sahne.

İki sayfanın yerini aldı: `son-kunye` (künye listesi) ve `son-1` (tek bir "…"
taşıyan yaprak sayfası). Gerekçe: künye bir liste olarak duruyordu ve ardından
gelen sayfanın söyleyecek hiçbir şeyi yoktu — sayı sönerek bitiyordu.

**Akış bir animasyon değil, sayfanın kendi uzunluğu.** Jenerik
`data-fit="scroll"` ve yaklaşık **sekiz kadraj** boyunda; okur kaydırdıkça
akıyor. Film hissini veren tek şey **perde** (`css/jenerik.css` §PERDE):
`position: sticky` bir katman tuvale yapışıyor, üstte ve altta yazıyı kâğıda
eritiyor, üstünde sayının 35° baskı taraması, altta soluk bir ışık havuzu var.
Yazı o havuzdan doğup yukarıda kâğıda karışıyor.

Bu yüzden jenerikte **blok blok beliren giriş animasyonu yok** ve olmamalı:
perde zaten aynı işi yapıyor, ikisi üst üste binince "beliren metnin bir daha
belirmesi" gibi duruyor.

⚠️ Sayfanın `overflow`u `clip`, `hidden` DEĞİL. `hidden` bir kaydırma kabı
yaratıyor ve `sticky` en yakın kaydırma kabına yapışıyor — perde `.page`e
yapışır, `.page` de kaymadığı için sayfanın tepesinde donup kalırdı.

⚠️ Sayfanın dikey dolgusu **sıfır**. Perde tuvalin tepesinden başlasın diye:
dolgu dursaydı ilk karede onun kadar aşağıda doğardı ve kapanış karesi tam da
yapışmadan önce görülen kare. Kadraj ölçüsü de böylece doğrudan `--canvas-h`.

### Motor ve banttaki düğme

`js/jenerik.js` o kaydırmayı **motorlu** hâle getiriyor: sabit hızla, bir tuval
boyu **~7,3 saniyede** (`KADRAJ_SURESI = 11000 / 1.5`) — yani tam tur ~60
saniye. Hız piksele değil kadraja bağlı, jenerik her ekranda aynı tempoda
akıyor.

**Motor sayfaya ilk gelişte kendiliğinden başlıyor**, gelişten 1,1 saniye sonra
(`OTOMATIK_GECIKME`). O bekleme ① 終 karesini bir beat olarak tutuyor. Düğme
kalkmadı, anlamı değişti: artık başlatan değil durduran.

- Okur tekerleğe, ekrana, bir tuşa ya da herhangi bir düğmeye dokunduğu anda
  motor susuyor ve okur **tam kaldığı yerde** kalıyor. Oynatma bir gösteri
  değil, okurun elindeki hareketin sürdürülmesi.
- Kendiliğinden başlama **bir kez**: durdurup geri gelince tekrar çalışmıyor.
  Durdurmak bir karardı, sayfadan çıkmak onu geçersiz kılmaz.
- Bekleme dolduğunda okur açılış karesinden yarım tuvalden fazla ilerlemişse
  motor hiç girmiyor — jeneriği zaten kendi eliyle yürütüyor demektir.
- Dipteyken basılan düğme jeneriğin başına sarıp yeniden oynatıyor.
- Sayfadan çıkılınca kendiliğinden duruyor (`okuyucu.js` §5 her sayfa
  değişiminde haber veriyor); bekleyen otomatik başlatma da iptal oluyor.
- **Hareket kapalıysa ne düğme geliyor ne motor kendiliğinden başlıyor.**
  Jenerik ikisi olmadan da eksilmiyor: akışı zaten okurun kaydırması yapıyor.

⚠️ `scroll-snap-type`a DOKUNULMUYOR — `okuyucu.js` §6'daki sıçramaların
tersine. Gerekmiyor, çünkü jenerik sayfasının snap alanı tuvalden büyük ve CSS
Scroll Snap bu durumda kabın alanın içinde herhangi bir yerde durmasına izin
veriyor (sayının bütün uzun sayfaları zaten bu sayede ortasında durabiliyor).
Kapatmak zararlı da olurdu: durdurma anında geri açılan snap okuru en yakın
noktaya, yani jeneriğin başına çekebilirdi.

⚠️ Saat `setTimeout`, `requestAnimationFrame` değil — `js/hikaye.js` §SAAT ile
aynı gerekçe. Mantık da saatten ayrı: `ilerlet()` saf bir fonksiyon (konum, hız,
geçen süre → yeni konum), rAF'sız da sınanabiliyor.

### Metin dosyada, JS'te değil

Lisans atıfları (CC BY / CC BY-SA) yasal bir yükümlülük: JS çalışmasa da,
oynatma hiç kullanılmasa da okunabilir olmak zorundalar. Bu sayfada JS'in tek
işi kaydırmayı yürütmek.

⚠️ **`js/sahneler.js` beş üretilmiş arkalığı "outro için" saklıyordu; outro bu
sayfa oldu ve onları İSTEMEDİ.** O sahneler tek kadrajlık tam ekran arkalıklar
(`preserveAspectRatio="slice"`, 300×400); sekiz kadraj boyundaki bir akış
sayfasının arkasına gerilseler tanınmaz hâle gelirlerdi. Jeneriğin arkası
bilerek boş: perde zaten bir katman ve ikincisi metni yer. Yani o dosya artık
sahipsiz — `sahneler.js` başlığının kendi deyişiyle "gönül rahatlığıyla
silinebilir", ama bu bir karar, kendiliğinden yapılmadı.

---

## Kantō sahneleri neden temayı izlemiyor?

Kantō Depremi dosyasının (`k-*`) altı arka planı fotoğraf değil, satır içi SVG —
ana projedeki `src/lib/art/kanto/` klasörünün vanilla karşılığı. Yanlarındaki
öbür üretilmiş sahneler (`ed-1`, `bl-1`) renklerini
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
| `assets/2026-09/*.webp` | 5 arka plan (**2'si** kullanımda) | Wikimedia Commons (CC0 / CC BY / CC BY-SA) |
| `assets/2026-09/KantoDepremi/` | 3 arşiv fotoğrafı (1923) + 1 Tokyo karesi (2023) | ⚠️ **belirsiz — aşağıya bak** |
| `assets/2026-09/kapali-kapilar/` | 7 kare + kapak + logo | KARGAMANGA |
| `assets/2026-09/soylesi/` | 8 çizim + kapak | KARGAMANGA |

Beş webp'ten **ikisi** sayfalarda: `kapak` (kapak-1) ve `dalga` (sz-1).

⚠️ `yaprak` DÜŞTÜ. İki sayfada kullanılıyordu: `km-imza` (zaten `#sira`da
değildi) ve `son-1` — yani jeneriğin yerini aldığı sayfada. Jeneriğin arka
planı yok, dolayısıyla görsel artık sayının hiçbir yerinde görünmüyor ve
**atfı da künyeden çıkarıldı**: kullanılmayan bir görselin atfı, CC BY'nin
istediği şeyi yapmak değil, listeyi yanlış hâle getirmek. Dosya silinmedi
(`km-imza` bir gün sıraya geri yazılabilir); geri gelirse atıf da geri gelmeli.
Yaprak motifi jenerikte yine var — fotoğraf olarak değil, kapağın ve sekmenin
çizili damgası olarak.

Kalan ikisi — `sisli-vadi` ve `tapinak` — Kızıl Mevsim'in arka
planlarıydı; sayfaları (`km-acilis`, `km-2`) klasörde duruyor ama `#sira`da
değil, o yüzden görseller de sayıya girmiyor. Sıraya geri yazılırlarsa
çalışırlar, künyeye de atıfları geri gelmeli.

Bir zamanlar sekiz taneydiler. `fener`, `yagmur` ve `tren` eski "Gece Hattı"
foto-öyküsünündü; o bölüm Kantō Depremi dosyasına dönüşünce hiçbir sayfa onları
çağırmaz oldu ve **dosyaları silindi** (12 dosya: 3 webp + 9 avif türevi).
Künyeleri `sayfalar/son-jenerik/sayfa.html` içindeki yorumda kayıtlı (künyeyle
birlikte oradan taşındı) — depoda sürüm kontrolü yok, geri istenirlerse
Commons'tan yeniden indirilecekler.

⚠️ **`KantoDepremi/` künyesi henüz doğrulanmadı.** Üç kare 1923 tarihli, yani
eserin kendi telifi büyük olasılıkla düşmüş; ama dosya adlarındaki uzun
numaralar (`…-1053504330`, `…-1825192360`) stok ajansı kimliğine benziyor ve
ajans TARAMASI ayrı bir hak doğurabiliyor. Jenerikteki satır bu yüzden yer
tutucu — ve artık okura da öyle görünüyor ("künyesi henüz doğrulanmadı"),
sessizce eksik değil. Sayı yayımlanmadan önce her karenin arşivi, erişim
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

---

## Fontlar hakkında

Ana projede iki manga fontu kayıtlı: **Bad Comic** (SIL OFL 1.1, seçili olan) ve
**Anime Ace** (lisanssız, henüz `static/` altında duruyor).

Klona yalnızca Bad Comic kopyalandı. Sebebi bu klasörün varlık sebebi: klon
paylaşılmak için var, yani lisanssız bir fontu dağıtır hâle gelmemeli.
`css/tokens.css`teki Anime Ace `@font-face` bloğu bu yüzden çıkarıldı.

`fonts/BadComic-OFL.txt` "eklenmese de olur" bir dosya değil — OFL 1.1 fontun
lisansıyla birlikte dağıtılmasını şart koşuyor.
