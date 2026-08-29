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
| `min` — Doomscroller | 19 | |
| `mid` — Dengeli | 26 | |
| `full` — Doomreader | 30 | |
| **DOM'daki toplam** | **31** | |

⚠️ Toplam 31, en büyük mod 30: **`min`, `full`ün alt kümesi değil.** `km-min`
sayfası ("Üç cümlede sonbahar") yalnızca `min` modunda var — uzun dosyanın üç
cümlelik karşılığı. Bu yüzden "full'ü göster, fazlasını gizle" gibi bir kısayol
kullanılamıyor.

Mod, üst banttaki çipe tıklayınca açılan kartlardan seçiliyor ve
`localStorage`da hatırlanıyor.

---

## Dosyalar

```
index.html          sıra + kabuk (bantlar, folio, ilerleme çubuğu)
js/acilis.js        tek giriş noktası: yükleme → tanıtım → mod seçimi → sayı
js/okuyucu.js       dizme, mod, folio, ilerleme, gezinme, giriş animasyonları
js/sahneler.js      tanıtım kartlarının arka planları (tohumlu üretim)
css/app.css         katman sırasını beyan eder ve diğerlerini çağırır
css/bilesen.css     ana projede bileşenlerin içinde kalan kurallar + mod süzgeci
css/*.css           derginin küresel stilleri
sayfalar/<id>/      her snap sayfası kendi klasöründe
assets/2026-09/     görseller (webp kaynak + avif türevleri)
fonts/              Bad Comic (OFL 1.1) + lisans metni
```

---

## Bu sürümde OLMAYANLAR

Klon **yalnızca okumak** için. Ana projedeki şu şeyler burada yok:

- Yorumlar, okur kimliği, giriş
- Bulmaca motoru — `bl-1` sayfasında yer tutucu duruyor (ana projede de öyle)
- Analitik, ilerleme kaydı, seri takibi
- Sayı arşivi, başka sayılar

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
