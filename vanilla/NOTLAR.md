# `index.html` — geliştirici notları

`index.html` bir iskelet: sıra bloğu, bantlar, folio, üç `<dialog>` ve yükleme
ekranı. Ama iskeletin her parçası bir KARARIN sonucu ve o kararlar kodun
kendisinden okunmuyor — "bu düğme neden `.band__nav`ın içinde değil" sorusunun
cevabı işaretlemede yazmıyor.

O gerekçeler eskiden dosyanın içinde, HTML yorumu olarak duruyordu. Buraya
alındılar: `index.html` 333 satırdan **231 satıra** indi ve okunan şey artık
işaretlemenin kendisi.

## Nasıl bağlanıyor

Yorumun kaldırıldığı yerde tek satırlık bir işaret duruyor:

```html
<!-- not: NOTLAR.md §btn-buyut -->
```

Aşağıdaki başlıklar o işaretlerin karşılığı. Ad seçerken **HTML'de gerçekten
var olan kimlik** yeğlendi (`#sira`, `#loader`, `#btn-buyut`…): başlık uydurma
bir etiket olsaydı, düğüm yeniden adlandırıldığında not sessizce yetim kalırdı.

> ⚠️ `#sira` bloğunun İÇİNDEKİ `#` ile başlayan satırlar taşınmadı, bilerek.
> Onlar gerekçe değil İÇERİK DİZİNİ — "`k-2` hangi sahne?" sorusunu sıranın
> kendisine bakarak cevaplıyorlar ve ayrı bir dosyaya taşınsalardı sıraya bakan
> kişi onları hiç görmezdi.

---

## §dosya

Dosyanın en başındaki başlık (`<!doctype html>` ile `<html>` arasında).

> sErgi · Sayı 03 — "Kızıl Mevsim" · okuma sürümü
>
> Bu klasör ana projeden BAĞIMSIZ: derleme adımı yok, sunucu tarafı yok, dış
> bağımlılık yok. Başka bir yere kopyalanıp statik olarak servis edilirse aynen
> çalışır.
>
> Çalıştırmak için (klasörün içinden): `python3 -m http.server 8080`
> Sonra: `http://localhost:8080`
>
> ⚠️ Dosyaya çift tıklayarak (`file://`) AÇILMAZ — sayfalar `fetch` ile
> yükleniyor ve tarayıcı `file://` altında yerel dosya okumaya izin vermiyor.
> Ayrıntı: BENIOKU.md

## §favicon

`<head>` içindeki `<link rel="icon">` — kapaktaki yaprak damgası.

Ana projede burada hâlâ SvelteKit şablonunun turuncu Svelte logosu duruyor
(BUILD-TODO blocker #2) — bu klon paylaşmak için var, yani sekmede başka bir
markanın işaretini taşıyamaz.

## §tema-betigi

`<head>` içindeki satır içi `<script>`.

Tema, CSS inmeden ÖNCE yazılıyor: sonra yazılsaydı okur bir kare boyunca yanlış
temayı görürdü. Betik hata yutuyor çünkü `localStorage` gizli sekmede ya da sıkı
gizlilik ayarında erişilemez olabiliyor.

⚠️ **VARSAYILANIN TEK YERİ BURASI**: "kayıt yoksa karanlık" kuralı o satırda
yazılı ve başka hiçbir yerde tekrarlanmıyor. `acilis.js` temayı kendi
varsayılanından değil, bu betiğin `<html>`e yazdığı değerden okuyor — iki yerde
yazsaydı biri gün gelir öbürünü yalanlardı. `<html>` etiketindeki
`data-theme="dark"` de aynı kuralın JS'siz karşılığı.

Sistem tercihi (`prefers-color-scheme`) bilerek SORULMUYOR: tema artık okuma
modu ekranından elle seçiliyor ve orada iki düğme var. İşletim sistemi üçüncü
bir ses olsaydı, okurun seçtiği şeyi ne zaman ezeceği belirsiz kalırdı.

Depolama anahtarı `acilis.js`teki `ANAHTAR` ile aynı olmak ZORUNDA.

## §noscript

`<head>` sonundaki `<noscript>` bloğu.

JS hiç çalışmazsa yükleme ekranı sonsuza kadar "%0"da kalır ve sayının önünü
kapatır. O satır onu baştan gizliyor.

## §sira

`<script id="sira" type="text/plain">` bloğu.

Bloğun her satırı `sayfalar/` altındaki bir klasörü gösteriyor ve sayının sırası
TAM OLARAK o satırların sırası:

- bir satırı yukarı/aşağı taşı → sayfa yer değiştirir
- bir satırı sil → sayfa sayıdan çıkar
- yeni klasör aç + satır ekle → sayfa eklenir

Boş satırlar ve `#` ile başlayanlar atlanıyor, yani not düşebilirsin.

Bu liste TEK kaynak: klasör adlarında sıra numarası YOK, çünkü sıra iki yerde
yazsaydı ilk taşımada biri yalan söylemeye başlardı.

`type="text/plain"` — tarayıcı bunu çalıştırmıyor, düz metin olarak okuyor.
JSON dizisi yerine düz satırlar: unutulan bir virgül bütün sayıyı kırmasın.

## §shell

`<div id="shell">`.

`inert` bilerek açık doğuyor: açılış akışı bitene kadar (yükleme → mod seçimi)
tuval odaklanamaz ve tıklanamaz olmalı. `acilis.js` sayı hazır olduğunda
kaldırıyor.

## §pages

`<div id="pages">`.

Sayfalar buraya, `#sira`daki sıraya göre diziliyor (`js/okuyucu.js`).

## §bant-dugmeleri

Alt bant (`<footer class="band band--bottom">`).

Düğmeler `id` ile anılıyor, konumla değil. Önceden `okuyucu.js` bunları
`.band__btn:first-child` / `:last-child` ile buluyordu ve banda üçüncü bir düğme
eklemek "sonraki sayfa"yı sessizce başka bir düğmeye bağlardı — nitekim büyütme
düğmesi eklenirken tam bu oldu.

## §btn-buyut

`<button id="btn-buyut">`.

Büyütme düğmesi yalnız manga sayfasında beliriyor (`okuyucu.js` her sayfa
değişiminde `hidden`ı yazıyor). Belirmesinin kendisi bir davet: bir ipucu balonu
yerine düğme, sayfaya varıldığında bir kez nabız atıyor.

⚠️ Kendi yanına konuluyor, `.band__nav`ın içine DEĞİL. İçinde olduğu sürece
belirip kaybolması ileri/geri düğmelerini yatayda oynatıyordu; bant artık üç
yuvalı bir ızgara ve orta yuva yanlarda ne olursa olsun yerinden kımıldamıyor
(bkz. `canvas.css` §alt bant).

## §btn-jenerik

`<button id="btn-jenerik">`.

Sayının SON sayfasında beliren oynat/durdur düğmesi. Jenerik (`son-jenerik`)
uzun bir kaydırma sayfası ve akışı okurun kendi kaydırması yapıyor; motor o
kaydırmayı film jeneriği gibi sabit bir hızla yürütüyor, okur tekerleğe,
ekrana ya da bir tuşa dokunduğu anda susuyor.

⚠️ Motor sayfaya ilk gelişte KENDİLİĞİNDEN başlıyor (`js/jenerik.js`
§KENDİLİĞİNDEN), yani okur bu düğmeyi çoğu zaman DURDURMAK için görüyor,
başlatmak için değil. Düğmenin ilk hâli bu yüzden ⏸: `aria-pressed` zaten
durumu söylüyor, ikon ondan türüyor — değişmesi gereken bir şey yok.

Aynı yuvayı `#btn-buyut` ve sergi oklarıyla paylaşıyor, aynı gerekçeyle: üçü
hiç aynı anda görünmüyor (manga, galeri, sayı sonu). `.band__nav`ın İÇİNE
konulmadı — orta yuva yanlarda ne olursa olsun kımıldamamalı.

⚠️ Tek düğme, iki durum: hangi ikonun görüneceğini `aria-pressed` söylüyor
(`css/overlays.css` §JENERİK DÜĞMESİ). İki ayrı düğme olsaydı durum iki yerde
yazılı olurdu; ekran okuyucunun duyduğu şeyle gözün gördüğü şey ilk
düzenlemede ayrışırdı.

⚠️ Hareket kapalıyken (`prefers-reduced-motion`) düğme HİÇ GELMİYOR —
`hidden`ı `js/jenerik.js` yazıyor. Kendiliğinden kayan bir sayfa tam olarak o
tercihin istemediği şey ve jenerik düğmesiz eksilmiyor: akışı zaten kaydırma
yapıyor.

## §btn-sergi

`<button id="btn-sergi-bas">` ve `<button id="btn-sergi-son">`.

Sergi okları `#btn-buyut` ile aynı yuvada ve aynı sözleşmeyle: yalnız
`ms-galeri` sayfasında beliriyorlar (`galeri.js` → `galeriDugmeleriniAyarla`).
Büyütme düğmesiyle ÇAKIŞMIYORLAR — biri manga, öbürü galeri; ikisi aynı anda hiç
görünmüyor, o yüzden yuvayı paylaşmaları yer sorunu çıkarmıyor.

⚠️ `.band__nav`ın İÇİNE KONMADILAR, `#btn-buyut` ile aynı gerekçe: orta yuva
yanlarda ne olursa olsun kımıldamamalı, yoksa sergiye girip çıkarken sayfa ok
tuşları yatayda zıplar.

Bunlar SAYFA değil SERGİ gezdiriyor: ▲▼ sayıyı, ◀◀▶▶ koridoru. İki ok bilerek
çift — tek ok "bir durak" demek olurdu, oysa bunlar uca gidiyor (fast travel).
Bir durak zaten sürüklemenin işi.

## §icindekiler

`<dialog id="icindekiler">`.

İÇİNDEKİLER — bölüm açılışlarına atlama listesi. Kabuğun DIŞINDA, tam ekran
manga penceresiyle aynı sebeple: açıkken `#shell` `inert` oluyor, yoksa ok
tuşları arkadaki sayıyı kaydırırdı. İçi `js/icindekiler.js` tarafından, o anda
GÖRÜNÜR olan sayfalardan kuruluyor — okuma modu değişince liste de değişmeli.

## §manga-zoom

`<dialog id="manga-zoom">`.

TAM EKRAN MANGA — kabuğun DIŞINDA, çünkü açıkken `#shell` `inert` oluyor.
`<dialog>` seçildi: üst katman (z-index yarışı yok), `::backdrop`, Escape ve odak
tuzağı tarayıcıdan geliyor.

İçi boş doğuyor; açılırken `.manga-page` buraya TAŞINIYOR (kopyalanmıyor). Kopya
olsaydı iki DOM ağacı ayrı ayrı bozulabilirdi ve aynı yedi görsel iki kez inerdi.

## §loader

`<div id="loader">`.

Yükleme ekranı HTML'de duruyor, JS'le sonradan eklenmiyor: sonradan eklenseydi
okur bir an bozuk (henüz sayfasız) bir sayı görür, sonra üstü örtülürdü.

## §acilis

`<script type="module" src="js/acilis.js">`.

Tek giriş noktası açılış akışı; okuyucunun kendisi `js/okuyucu.js`te ve buradan
çağrılıyor.
