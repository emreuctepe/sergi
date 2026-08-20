# Yorum Sistemi — Yeniden Tasarım Planı

> **Durum:** §2 (ankraj modeli) ve §3.1 (temsilci ses) **uygulandı**, stres testi
> ayakta (§2 sonundaki ölçümler). Sunum tarafında karar verildi: birkaç biçim
> denendi, hepsi elendi — geriye **baloncuk + pop-up** kaldı (§4). Metne dokunan
> hiçbir işaret yok. Sırada **B6 — Mektuplar sayfası** (§3.3).
> İlgili: [PROJE.md §5.9](PROJE.md), [PROTOTIP-TODO.md](PROTOTIP-TODO.md)

> **Stres testinde ölçülen (250 sentetik yorum):** en yoğun blokta 36 yorum birikti
> ve sayfa düzeni bozulmadı; çizim 7 ms sürdü. §0.1'deki "aynı cümleye ikinci yorum
> imkânsız" hatası tohum veride bilerek kurulan bir örnekle doğrulandı: `km-3:3`
> bloğundaki cümleye üç ayrı ses bağlı, üçü de yerinde duruyor.

> **Dolu sayıda ölçülen (elle yazılmış 248 yorum):** akıştaki 29 sayfanın hepsinde
> yorum var, en yoğun blokta 21 ses birikti, en çok alıntılanan cümleyi 16 kişi
> seçmiş. Çizim 3.6 ms. Eş okuma kapalıyken 31 yorumlu `km-1` sayfası tertemiz
> kalıyor: ilk okuyuş hâlâ yazarın.

---

## 0. Gerçek sorun ne?

Şu anki sistem (A12–A13) tek bir varsayım üzerine kurulu: **bir yorum, metinde bir
karakter aralığına ya da tuvalde bir noktaya çakılır.** Bu varsayım 14 yorumda
çalışıyor. 300 yorumda üç ayrı yerden çöküyor.

### 0.1 Yazma sorunu — ankraj bırakmak nişancılık işi

Yorum yazmak için ya cümleyi **tam** seçeceksin ya da 480 ms parmağını basılı tutup
**doğru piksele** pin bırakacaksın. İkisi de telefonda hassasiyet ister. Okurun
söylemek istediği şey genelde o kadar keskin değil zaten: "şu paragraf çok iyiydi"
demek isteyen kişiye "hangi 40 karakter?" diye soruyoruz.

### 0.2 Okuma sorunu — iki ayrı mod

Bugün: katman kapalı = temiz okuma, katman açık = işaretler belirir, işarete
dokun = **alttan panel açılır ve sayfayı kapatır**. Yani okumak ile yorumları
okumak asla aynı anda olmuyor. Her yorum bir bağlam değişimi.

### 0.3 Ölçek sorunu — ve sistemin sessizce yalan söylemesi

Bunlar kozmetik değil, o günün kodundaki gerçek sınırlardı (`js/comments.js`;
adı geçen fonksiyonlar bu yeniden tasarımla kaldırıldı):

| Sınır | Nerede | 300 yorumda ne olur |
|---|---|---|
| Aynı metne ikinci yorum **imkânsız** | `textNodesIn()` `.anno` içindeki düğümleri reddediyor → ikinci yorum kendi metnini bulamaz | En çok konuşulan cümle, en az işaretlenen cümle olur. Tam tersi olmalı |
| Öğe sınırını aşan seçim düşer | `range.surroundContents()` hata atar → `return false` | Paragraf sonundan diğerine geçen seçimler sessizce sayfa seviyesine iner |
| Yalnızca **ilk** eşleşme işaretlenir | `node.nodeValue.indexOf(exact)` | "Bu ay" gibi sık bir ifade yanlış yere ankrajlanır |
| Ekranda üst üste binen işaretler | `.pin` mutlak konumda, çakışma yönetimi yok | 60 yorumlu bir sayfa = pin çorbası |

En kritik satır ilk sıradaki. Şu anki tasarımda **iki kişi aynı cümleye yorum
yapamaz** — ikincisi sessizce "sayfa yorumu"na düşer ve okur bunu fark etmez.
Sistem hata vermiyor, sadece yavaşça anlamsızlaşıyor. Yüzlerce yorumda geriye
kalan şey: bir avuç işaret + kocaman bir "bu sayfaya 47 yorum" rozeti.

---

## 1. Dört yasa

Bundan sonraki her karar bunlara karşı test edilecek.

1. **Ankraj bir aralık değil, bir bloktur.**
   Yorum paragrafa, panele, sözlük satırına, alt yazıya bağlanır. Blok zaten
   içerik ağacında var; kimliği sağlam, düzenlemeye dayanıklı, okuma derinliği
   değişince de aynı kalıyor.

2. **Alıntı ankraj değil, gövdedir.**
   Okur yine cümle seçer — ama seçtiği cümle yorumun *içinde* alıntı olarak durur,
   sayfada bir `<mark>` olarak değil. Aynı jest, dayanıklı depolama.

3. **Bir yerde kaç ses varsa olsun, sayfada tek ses görünür.**
   Ölçeği yaşanabilir kılan tek kural bu. 3 yorum da olsa 300 yorum da olsa sayfa
   düzeni değişmez: bir temsilci + sayaç.

4. **Yorum metnin üstünde değil, yanında yaşar.**
   Hiçbir yorum içeriği kapatmaz. Panel bir istisnadır, kural değil.

---

## 2. Temel değişiklik: ankraj modeli

Sunum biçiminden bağımsız olan kısım budur: hangi sunum seçilirse seçilsin bu
temel aynı kalır. Önce bu kuruldu, sunum sonra denendi.

### 2.1 Blok kimliği

Prototipte blokların kimliği yok (`data.js` → `blocks: [{t:"p", text:"…"}]`).
Ekleyeceğimiz: `pageId + ":" + blokIndeksi` → `km-1:3`. Yeterince sağlam, çünkü
prototipte içerik donmuş durumda.

**Gerçek üründe** bunu `packages/content` derleyicisi üretecek: kaynak
Markdown'daki blok sırasından türetilen kararlı bir kimlik, istenirse elle
sabitlenebilen `{#kimlik}` etiketiyle. Bu, planın derleyici kısmına eklenmesi
gereken yeni bir sorumluluk — şimdiden not düşülmeli.

> **Yan kazanç:** blok kimliği okuma derinliğinden bağımsız. `full` modda bir
> paragrafa yazılan yorum, o paragraf `mid` modda da varsa aynı yere bağlanır.
> Bugün bu iş metin arayarak yapılıyor ve metin değişince kopuyor.

### 2.2 Yorum bırakmak

| Jest | Bugün | Bundan sonra |
|---|---|---|
| Bloğa dokunma | — | **Yeni:** blok seviyesinde yorum. Hedef koca bir paragraf, ıskalanmaz |
| Metin seçme | ankraj olur | Yine mümkün — ama seçilen cümle **alıntı** olarak gövdeye girer, ankraj yine bloktur |
| Görsele uzun basma | pin | Aynen kalır. Görselde konum gerçekten anlam taşır ("şu adamın şapkası") |

### 2.3 Alıntı ısısı — denendi, kaldırıldı

Ara bir aşamada `<mark>` korunmuş, anlamı değiştirilmişti: "burada bir yorum var"
yerine **"bu cümleyi kaç kişi alıntıladı"**. Kalınlık alıntı sayısıyla artıyordu
(1 alıntı → çok hafif alt çizgi, 20 → tam vurgu).

**2.x sadeleştirmesinde kaldırıldı.** Gerekçe: metnin üstündeki her işaret, ne
kadar hafif olursa olsun, sayfanın dizgisine karışan bir arayüz öğesi. Isı ölçeği
kalabalıkta zaten ayırt etmiyordu ve ölçeği düzeltmek sayfayı daha da şeritli
yapıyordu. Metne dokunmayan bir sunuma (§4) geçilince gerekçesi de kalmadı.

Önemli olan şu: **ankraj kazanımı ısıya bağlı değildi.** §0.3'teki "aynı cümleye
ikinci yorum imkânsız" hatası, alıntının ankraj olmaktan çıkıp gövdeye taşınmasıyla
(§2.2) çözüldü; `<mark>` bunun yalnızca görsel tarafıydı. Isı kalktı, çözüm durdu.

### 2.4 Pin kümelenmesi

Görsel pinleri kalıyor ama birbirine **0.14'ten** yakın pinler tek bir küme pinine
dönüşüyor (`3` sayacıyla). Mesafe tuval **genişliği** biriminde ölçülüyor
(`dy × 4/3`, 3:4 *tasarım* oranı) — böylece aynı iki yorum her cihazda aynı şekilde
birleşiyor. `MAG.pins()` bu çekim alanlarını çiziyor. Haritaların otuz yıllık
çözümü; burada da doğru çözüm.

### 2.5 Düşme zinciri (yenisi)

`blok → sayfa` — sadece iki basamak, ve blok bulunamaması ancak içerik gerçekten
silinmişse mümkün. Bugünkü `metin → sayfa` düşmesi ise **normal işleyişte
sürekli** oluyor. Yorum yine asla kaybolmuyor, ama artık nadiren düşüyor.

---

## 3. Ölçek: yüzlerce yorumu yaşanabilir kılan üç parça

### 3.1 Temsilci ses

Her baloncuk için tek bir yorum görünür — bir baloncuk bir bloğu da temsil edebilir,
üst üste binmiş birkaç pinden oluşan bir kümeyi de. Seçim şeffaf ve açıklanabilir:

```
puan = 2 × tepki  +  1 × cevap sayısı  +  100 × editör seçimi
       (eşitlikte yeni olan kazanır)
```

Kalanlar yok olmuyor — temsilcinin yanındaki `+7` rozetinde duruyorlar, dokununca
thread açılıyor. **Editör bir yorumu "öne çıkarabilir".** Tek kişilik editöryel bir
dergide bu çok değerli bir kaldıraç: konuşmanın tonunu seçebiliyorsun.

### 3.2 Isı çubuğu

Üst banttaki ilerleme çubuğu aynı zamanda sayının **konuşma haritası** olur:
yorumun yoğunlaştığı yerler parlar. "Nerede tartışma var?" sorusunun cevabı tek
bakışta. Ölçek arttıkça daha da faydalı hale gelen ikinci parça.

### 3.3 "Mektuplar" sayfası

Her bölümün sonuna, akışın içine, **dergi sayfası olarak tasarlanmış** bir yorum
derlemesi: o bölümün en çok konuşulan 6-8 yorumu, alıntıladıkları cümleyle
birlikte, editöryel dizgiyle. Dergiler bunu yüz yıldır yapıyor ("okur mektupları").

Bu bir *yol* değil, hangi yol seçilirse seçilsin eklenmesi gereken bir parça:
sayfa içi sunum "yanımdaki ses"i çözer, mektuplar sayfası "bu sayıda ne konuşuldu"yu.

---

## 4. Sunum: baloncuk ve pop-up

Birkaç sunum biçimi yazılıp yan yana denendi — alt bantta konuşan bir şerit, sayfanın
sağındaki boşlukta hizalı kartlar, sayfa altına dizilen dipnotlar. Hepsi elendi.
Ortak sorunları aynıydı: her biri ya sayfanın dizgisine karışıyordu, ya belirli bir
ekran genişliğine muhtaçtı, ya da "aynı anda" sözünü tutamayıp "bir dokunuş uzakta"da
kalıyordu. Üçünü aynı anda menüde tutmak da bir maliyetti: aynı veriyi üç ayrı
şekilde çizen üç ayrı dosya.

Geriye §1'in dört yasasını en ucuza tutan model kaldı: **her yorum bir baloncuk.**

| Ne | Nasıl |
|---|---|
| Baloncuk | Yorumun yaşadığı yer. Blok yorumu bloğun sol üstüne, nokta yorumu bıraktığı koordinata, sayfa yorumu köşeye oturur |
| Salınım | Baloncuklar boşta hafifçe yüzer — sayfa donuk durmasın, "burada biri var" duygusu kalsın diye |
| Sürükleme | Basılı tut ve taşı. Konum yoruma yazılır, yeniden çizimde orada kalır — okur kendi işaretinin yerini seçebiliyor |
| Dokunma | Tuvalin **üstünde** pop-up: o baloncuktaki bütün sesler, kaydırmalı, cevaplarıyla birlikte |
| Eş okuma kapalı | Baloncuklar tamamen gizli. İlk okuyuş yazarın |

**Dört yasaya karşı:** (1) ankraj hâlâ blok — baloncuk yalnızca onun görünen yüzü.
(2) Alıntı gövdede, sayfada değil. (3) Bir baloncuk = bir temsilci ses + sayaç,
kalabalık kümelenmeyle emiliyor (§2.4). (4) Baloncuk metnin üstünde değil, metnin
*yanında* duruyor ve hiçbir harfi kapatmıyor.

**Bedeli — dürüstçe:** "cümle ve sesi aynı anda" sözü tam olarak tutulmuyor. Baloncuk
sesin *var olduğunu* gösteriyor, içeriğini bir dokunuş sonra. Elenen sunumlardan biri
(sağdaki hizalı kartlar) bunu gerçekten çözüyordu ama yalnızca geniş ekranda ve
derginin sağında boşluk kaldığı sürece. Telefonda — asıl hedef cihazda — hiçbiri
baloncuktan daha iyisini yapamadı.

---

### Sırada denenecek yollar (fikir havuzu)

Aynı temeli (blok ankrajı, temsilci ses, kümelenme, `comments:decorated`) kullanan,
hiçbiri henüz yazılmamış adaylar:

- **Karşı sayfa (spread)** — derginin kullanmadığı bir eksen var: **yatay**. Her
  içerik sayfasının bir karşı sayfası olur: aynı 3:4 ölçüsünde, ama içeriği o
  sayfanın konuşması. Geniş ekranda tuval 3:2'ye açılır ve gerçek bir açık dergi
  olur — solda yazı, sağda okurlar. Telefonda sola kaydır → karşı sayfa. Marka
  açısından en güçlü fikir; maliyeti de en yüksek (yatay eksen + tuval geometrisinin
  ikinci hâli). Risk: yatay jest manga bölümünün okuma yönüyle çakışabilir.
- **Uğultu** — satır arasında hiç yorum metni yok; yalnızca *nerede* konuşulduğu:
  yığılmış minik yüzler, bir "mırıltı" dokusu. Okuma tertemiz kalır, sosyallik
  ortam ışığı gibi. "İlk okuyuş yazarın"a en sadık.
- **Mektuplar sistemi** — satır arasında hiçbir şey; yorum bloğa dokununca yazılır
  ama yalnızca bölüm/sayı sonundaki editöryel dizilmiş "Okur Mektupları" sayfasında
  okunur. En marka-doğal, en az gürültü (§3.3 zaten planlı).
- **Tepki izi** — bir yol değil, çarpan: bloğa/cümleye emoji bırak (bir dokunuş),
  marjda ince tepki izi birikir. "Bir şey hissettim" ile "söyleyecek sözüm var"
  ayrışır; yazma sürtünmesini düşürür.
- **Yönetmen yorumu** — yorumları editöre sorulan sorular olarak çerçevele, senin
  cevapların birinci sınıf; marj bir soru-cevap / commentary bandına döner.


## 5. Prototipte nereye dokunuldu

| Dosya | Ne oldu |
|---|---|
| `js/render.js` | Her bloğa `data-block-id` (`pageId:index`) basılıyor |
| `js/comments.js` | Ankraj çözümleme baştan yazıldı: `markText()` gitti, yerine blok eşleme + pin kümeleme + temsilci puanlama geldi. `decorate()` bitince `comments:decorated` yayıyor — yeniden çizimin tek kapısı |
| `js/data-comments.js` | Tohum yorumların ankrajları `block`'a taşındı, `exact` metinleri `quote` alanına indi (kayıpsız) |
| `js/debug.js` | `MAG.flood(250)` stres modu — sentetik yorum, yalnızca bellekte |
| `js/popup.js` | Baloncuğa dokununca tuvalin üstünde açılan kart |
| `js/overlays.js` | Thread paneli aynı kaldı, artık **blok** başlığıyla açılıyor |
| `css/comments.css` | Baloncuk, sayfa rozeti, pop-up ve thread stilleri |

Geriye dönük uyum: eski `text` ankrajlı yorumlar açılışta bir kez bloklara
eşlenir, eşleşmeyen kalırsa sayfa seviyesine düşer. Kimse bir yorumunu kaybetmez.

---

## 6. Gerçek ürüne etkisi (PROJE.md'de güncellenecek yerler)

- **§5.4 içerik derleyicisi:** yeni sorumluluk — kararlı blok kimliği üretmek
  (`{#kimlik}` ile elle sabitlenebilir). Bu bir *şema* değişikliği, ertelenirse
  pahalıya patlar.
- **§5.12 veri modeli:**
  ```
  comments.anchor_type   'text' | 'point' | 'page'
                       → 'block' | 'point' | 'page'
  comments.anchor        {blockId} | {x,y} | {}
  comments.quote         jsonb null  -- {exact, prefix}  YENİ
  comments.featured      bool        -- editör öne çıkardı  YENİ
  ```
  `quote` ayrı tablo istemiyor; "bu cümleyi kaç kişi alıntıladı" sorusu ileride
  gerekirse `count(*) group by quote->>'exact'` ile cevaplanır.
- **§5.9:** üç seviyeli ankraj → iki seviyeli; "yorum katmanı aç/kapa" → "eş okuma
  modu"; temsilci ses eklenir, sunum baloncuk + pop-up olarak tarif edilir.

---

## 7. Karar bekleyen sorular

1. **Eş okuma varsayılan mı, kapalı mı?** Öneri: **kapalı**. İlk okuyuş yazarın,
   ikinci okuyuş okurların. Ama tersini de savunabilirim — sosyalliği gizlemek
   projenin kalbini gizlemek olabilir.
2. **Temsilci sesi kim seçer?** Saf algoritma mı, yoksa editörün her bölümde 1-2
   yorumu öne çıkarması mı? (Öneri: algoritma + editör vetosu.)
3. **Yorum yazmak da eş okuma modunda mı?** Yani "okurken yorum yazılamaz" diye
   net bir ayrım mı olsun, yoksa her an mı yazılabilsin?
4. **250 yorumlu stres testinde hedef ne?** Benim ölçütüm: bir sayfada gözün
   çarptığı yorum sayısı **hiçbir zaman 1'i geçmemeli**, geri kalan her şey sayaç
   olmalı. Katılıyor musun?
5. **Pin çekim alanı tasarım tuvaline mi, gerçek ekrana mı bağlı olsun?**
   (B2.6'daki `MAG.pins()` görünümü bunu görünür kıldı.) Bugün mesafe 3:4
   **tasarım** oranıyla ölçülüyor: telefonda tuval uzadığı için çekim alanı
   ekranda dikey bir elips oluyor — 375px genişlikte 105×144 px. Yani dikeyde
   birbirinden uzak duran iki pin yine de birleşebiliyor.
   **Öneri: kalsın.** Kural tasarım tuvaline bağlı olduğu için aynı iki yorum
   telefonda da masaüstünde de aynı şekilde kümeleniyor; alternatifte küme
   cihazdan cihaza değişir ve "aynı pin herkeste aynı yerde" sözü bozulur.
   Ama ekranda göze dairesel görünmediği de doğru.
