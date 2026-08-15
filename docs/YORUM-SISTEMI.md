# Yorum Sistemi — Yeniden Tasarım Planı

> **Durum:** §2 ve §3.1 **uygulandı** (adım B1), §4'ün stres testi hazır (B2),
> **Yol B — Fısıltı** (B3) ve **Yol A — Kenar** (B4) ikisi de ayakta, menüden
> geçiliyor. Sırada karar (B5): ekrana bakarak, kaybeden yollar silinir.
> İlgili: [PROJE.md §5.9](PROJE.md), [PROTOTIP-TODO.md](PROTOTIP-TODO.md)

> **B1'de ölçülen:** 250 yorumla en yoğun blokta 36 yorum birikti ve sayfada yine
> tek ses göründü; bir sayfadaki en fazla işaret 9 oldu (6 pin + 3 blok çentiği),
> çizim 7 ms sürdü. §0.1'deki "aynı cümleye ikinci yorum imkânsız" hatası
> tohum veride bilerek kurulan bir örnekle doğrulandı: `km-3:3` bloğundaki
> cümleye üç ayrı ses bağlı, sayfada tek bir alıntı işareti var.

> **B2.5'te ölçülen (elle yazılmış dolu sayı, 248 yorum):** akıştaki 29 sayfanın
> hepsinde yorum var, en yoğun blokta 21 ses birikti, en sıcak cümleyi 16 kişi
> alıntıladı — sayfada yine **tek işaret**, yalnızca daha koyu. Bir sayfadaki en
> fazla işaret 7, temsilcisiz blok 0, çizim 3.6 ms. Eş okuma kapalıyken 31 yorumlu
> `km-1` sayfasında yalnızca 2 soluk iz kalıyor: ilk okuyuş hâlâ yazarın.
>
> Bu ölçüm bir hata da buldu: ısı ölçeği kalabalıkta **ayırt etmiyordu** (her
> işarete zemin dolgusu → sayfa şeritleniyor, ısı 4 ile ısı 2 aynı görünüyor).
> Ağırlık altı çizginin kalınlığına taşındı, dolgu ısı 3'te başlıyor. Sentetik
> stres modunda görünmeyen, ancak *gerçek* dolu sayıda görünen bir hataydı.

> **B4'te ölçülen (Kenar, `js/kenar.js`):** 11 metin sayfasında ray/dokuma
> çalışıyor. **Ray tuvalin dışında** (v2): dergi tam 3:4/tam genişlikte, kartlar
> sağ boşlukta. 1280px, dock kapalı → dergi 370–910px, ray 934–1234px (300px),
> çakışma yok, yatay taşma yok; kart üstleri bloğun görsel üstüne birebir (0–1px)
> oturuyor (yerleşince; geçiş anında ~13px, o an zaten her şey oynuyor).
> Kaydırmada kartlar bloklarını takip ediyor, görüş dışı gizleniyor. Çakışma
> çözümü ve "+N daha" hapı doğrulandı (contain sayfada; scroll sayfada kaydırınca
> geliyor). Dock açıkken sağ boşluk daralıyor: 1280'de ray sığıyor (~162px),
> 980'de sığmıyor → dokumaya düşüyor. Telefonda (390px) dokuma: şerit bloğun
> ardında, dokun → 3 satır (42→81px), tekrar dokun → thread; sayfa uzuyor (sz-1:
> 720 → 948px), alt bloklar şeridi içine alıyor. Metin-dışı sayfalarda (foto,
> manga) ray gizli. Tüm sunum geçişleri temiz, `comments:decorated` üzerinden
> otomatik tazeliyor. Ray düzeni 500 yorumda 40 ms (aç/kapa ve decorate'te;
> kaydırmada yalnız hafif yeniden-konumlama).

> **B3'te ölçülen (Fısıltı, `js/whisper.js`):** 29 sayfanın hepsinde şerit bir ses
> buluyor, hepsi farklı okur, çoğu alıntısıyla birlikte. Sayfa DOM'una tek bir
> düğüm eklenmiyor (odak bloğa yalnızca bir öznitelik). 498 yorumla (tohum +
> stres) çizim + fısıltı 14.5 ms.
>
> **Asıl ölçüm ekranın kaç pikselini yediği:** şerit 66 px, bant 50 → 129 px.
> Telefonda (390×844) tuval, 3:4'ün üstündeki *taşma payından* borç alıyor:
> 720 → 588 px, örtme **1 px** — yani sayfanın kurgulanmış içeriğinden hiçbir şey
> kapanmıyor. Payın bittiği yerlerde bedel görünür oluyor: basık telefonda
> (390×620) alt %15, kısa masaüstü penceresinde (1280×800) alt %14 örtülüyor;
> uzun pencerede (1280×1000) 8 px. Bu, yolun kendi maliyeti — gizlenmedi.
>
> Ayrıca: şerit **ses olmasa da yer tutuyor** (sessiz hâl). İlk denemede sayfa
> değişince bant büyüyüp küçülüyordu, telefonda bu tuvali yeniden ölçtürüp okuma
> yerini oynatıyordu.

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

Bunlar kozmetik değil, koddaki gerçek sınırlar (`js/comments.js`):

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

3. **Bir blokta kaç ses varsa olsun, sayfada tek ses görünür.**
   Ölçeği yaşanabilir kılan tek kural bu. 3 yorum da olsa 300 yorum da olsa sayfa
   düzeni değişmez: bir temsilci + sayaç.

4. **Yorum metnin üstünde değil, yanında yaşar.**
   Hiçbir yorum içeriği kapatmaz. Panel bir istisnadır, kural değil.

---

## 2. Temel değişiklik: ankraj modeli

Aşağıdaki üç yolun **hepsi** bu temeli paylaşır. Önce bu kurulur, sonra sunum
biçimleri denenir.

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

### 2.3 Alıntı ısısı — işaretler toplulaşır

`<mark>` tamamen kaybolmuyor, **anlamı değişiyor.** Artık "burada bir yorum var"
demiyor; **"bu cümleyi kaç kişi alıntıladı"** diyor.

```
1 alıntı   → çok hafif alt çizgi
5 alıntı   → belirgin
20 alıntı  → tam vurgu + dokununca "23 okur bu cümleyi alıntıladı"
```

Bu tek hamle 0.3'teki dört sınırın üçünü birden siliyor: çakışma yok (cümle başına
tek işaret), ikinci yorum kaybolmuyor, ve işaret **yorum arttıkça daha bilgilendirici
oluyor, daha gürültülü değil.** Kindle'ın "popular highlights"ı yıllardır bunu böyle
çözüyor; kanıtlanmış bir örüntü.

### 2.4 Pin kümelenmesi

Görsel pinleri kalıyor ama birbirine %8'den yakın pinler tek bir küme pinine
dönüşüyor (`3` sayacıyla). Yakınlaştırılınca ayrışıyor. Haritaların otuz yıllık
çözümü; burada da doğru çözüm.

### 2.5 Düşme zinciri (yenisi)

`blok → sayfa` — sadece iki basamak, ve blok bulunamaması ancak içerik gerçekten
silinmişse mümkün. Bugünkü `metin → sayfa` düşmesi ise **normal işleyişte
sürekli** oluyor. Yorum yine asla kaybolmuyor, ama artık nadiren düşüyor.

---

## 3. Ölçek: yüzlerce yorumu yaşanabilir kılan üç parça

### 3.1 Temsilci ses

Her blok için tek bir yorum sayfada görünür. Seçim şeffaf ve açıklanabilir:

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

## 4. Üç yol — prototipe değer üç sunum biçimi

Hepsi §2'nin temelini kullanır, hepsi aynı veriyi gösterir. Fark: **ses nerede
duruyor.**

---

### Yol A — “Kenar” (kenar rayı / dokuma)

Eş okuma modunda metin sütunu daralır, açılan şeritte yorumlar **hizalı** durur:
her kart, ait olduğu bloğun tam yanında.

- **Geniş ekranda:** metin %64, ray %36. Kartlar blokların `offsetTop`'una
  hizalanır, çakışanlar aşağı itilir (Google Docs'un klasik yerleştirme geçişi,
  ~25 satır). Sayfaya sığmayan kartlar altta `+5 daha` hapına toplanır.
- **Telefonda:** ray yok, çünkü kenar yok. Aynı veri **dokuma** olarak iner:
  bloğun hemen ardına tek satırlık ince bir şerit — `🦩 "Kaynak var mı acaba?" +3`.
  Dokunulunca yerinde 3 satıra açılır, tekrar dokunulunca thread. Sayfa bu modda
  `fit: scroll`'a geçer (zaten desteklenen bir davranış).
- **Kanıtladığı şey:** kullanıcının tarif ettiği şeyin *birebir* karşılığı —
  cümleyi ve ona iliştirilen sesi aynı anda okumak.
- **Maliyet:** orta-yüksek. Ölçüm + çakışma çözümü + iki ayrı sunum.
- **Risk:** dar ekranda 240 px'lik metin sütunu tipografiyi zorlar; dokuma
  biçiminde sayfa uzar, "sığan sayfa" kimliği bu modda esner.

#### Yazıldıktan sonra (B4) — tahminden farklı çıkanlar

| Tahmin | Gerçek |
|---|---|
| Ray/dokuma kararı letterbox'a | **Tuval genişliğine** (≥520px → ray). Letterbox dikey boşluk demek; telefon portrede dikeyde bol boşluk olur ama kenar yine yoktur — ilk deneme 390px tuvalde ray açıp metni 197px'e sıkıştırdı |
| metin %64, ray %36 | metin %60, ray %36, arada %4 boşluk. Ray, sütunla **aynı içerik kutusu** yüzdesiyle ölçülüyor; pageWidth yüzdesiyle verince iki kenar 2px çakışıyordu |
| Telefonda `fit: scroll`'a geçer | Registration'a dokunmadan: yorumlu sayfa CSS ile uzuyor (`height:auto`), `p.fit` "contain" kalıyor. prev/next o sayfada içeriği atlayabilir — kabul, "sığan sayfa esner" zaten deniyordu |
| Kapsam: her sayfa | Yalnızca **metin sayfaları**. Tam kanama görsel, kapak, manga, bulmaca, sayı sonu dışarıda: blok yorumları eski rozet+thread'e düşüyor, nokta pinleri her yerde çalışıyor |

**v2 — ray tuvalin İÇİNDEN DIŞINA taşındı (kullanıcı isteği).** İlk sürümde
kartlar tuvalin içindeydi, metni %60'a daraltıyordu — okuma sütunu daralıyor,
kartlar metnin üstüne biniyordu. Kullanıcı "balonları derginin sağındaki boşluğa
taşıyalım" dedi. Artık ray tuvalin **dışında**, sağ letterbox boşluğunda; dergi
tam 3:4 ve temiz kalıyor, kartlar gerçek bir dergi kenar notu gibi yanında.

| v2'de değişen | Nasıl |
|---|---|
| Metin daralması | **Kaldırıldı.** Dergi tam genişlikte |
| Ray konumu | `#shell` çocuğu, `left:100%` ile tuvalin sağ boşluğunda; genişlik/konum js ölçüyor. Dock kayması dâhil tuvalle birlikte kayar |
| Hizalama | Ray artık ölçekli tuvalin dışında → `getBoundingClientRect` (görsel koordinat) doğru. Kartlar tuvalle kaymadığından **kaydırmada js yeniden konumluyor**; `scale(0.965)` geçişi bitince de bir kez |
| Görünürlük | Bir sayfa gösterilir; scroll sayfada görüş dışına çıkan kart gizlenir, kaydırınca gelir. contain sayfada sığmayan "+N daha" hapına |
| Bedel | Metin artık daralmıyor; yeni bedel: ray **sağ boşluğa** muhtaç. Dock (sol menü) açıkken sağ boşluk daralıyor — dar pencerede ray sığmazsa dokumaya düşüyor. Dock kapalıyken (Sade görünüm) simetrik: solda menü, ortada dergi, sağda ray |

Yol tek dosya + tek CSS bölümünde (`js/kenar.js`, `css/comments.css` sonu).

---

### Yol B — “Fısıltı” (alt bant konuşur)

Hiçbir düzen değişmiyor. Zaten var olan **alt bant** iki satıra açılıyor ve o an
odaktaki bloğun temsilci sesini gösteriyor.

- Odak = son dokunulan blok; dokunulmadıysa sayfanın en yüksek puanlı yorumu.
  Kaydırmalı sayfalarda ekranın dikey ortasına en yakın blok.
- Bir paragrafa dokun → bant o paragrafın sesine geçer, blok hafifçe aydınlanır.
  Banda dokun → thread.
- **Kanıtladığı şey:** yorumların içeriğe *hiç dokunmadan* okuma akışına
  karışabileceği. Tasarım bütünlüğü açısından en temiz seçenek.
- **Maliyet:** düşük. Tahminen ~120 satır, mevcut bant ve panel yeniden kullanılır.
- **Risk:** "aynı anda" değil "bir dokunuş uzakta". Kullanıcının istediğinin tam
  karşılığı olmayabilir. Buna karşılık her ekranda kusursuz çalışır.

#### Yazıldıktan sonra (B3) — tahminden farklı çıkanlar

| Tahmin | Gerçek |
|---|---|
| ~120 satır | 250 satır (`js/whisper.js`) + 150 satır CSS |
| "Hiçbir düzen değişmiyor" | Sayfa düzeni gerçekten değişmiyor, ama şerit **66 px yer istiyor**. Telefonda tuvalin taşma payından alıyor (örtme 1 px), pay yoksa sayfanın altına biniyor (%14-15) |
| Odak üç kuralla belirlenir | Aynen öyle; ek olarak şeridin **ses olmasa da yer tutması** gerekti (yoksa bant sayfa başına büyüyüp küçülüyor) |
| Banda dokun → thread | Buna bir adım eklendi: yorumlu bloğa **ilk dokunuş sesi banda taşır, ikinci dokunuş konuşmayı açar**. "Önce duy, istersen aç" — okuma bölünmüyor |

Yolun tamamı tek dosyada + tek CSS bölümünde duruyor (`js/whisper.js`,
`css/comments.css` sonu). Kaybederse silmek: bir dosya, bir bölüm, bir betik
etiketi, bir menü satırı, `state.js`'te bir alan.

---

### Yol C — “Karşı sayfa” (spread)

Derginin kullanmadığı bir eksen var: **yatay.** Dikey = akış. Yatay boş.

Her içerik sayfasının bir **karşı sayfası** olur: aynı 3:4 ölçüsünde, ama içeriği
o sayfanın konuşması — dizilmiş, tasarlanmış, alıntılarıyla birlikte.

- **Geniş ekranda:** eş okuma modunda tuval 3:4'ten 3:2'ye açılır ve **gerçek bir
  açık dergi olur**: solda yazı, sağda okurlar. Kelimenin tam anlamıyla aynı anda.
- **Telefonda:** sola kaydır → karşı sayfa gelir, sağa kaydır → geri. Tek jest.
- **Kanıtladığı şey:** yorumun *dergiye ait* olabileceği — arayüz katmanı değil,
  sayfanın kendisi. Marka açısından en güçlü fikir bu.
- **Maliyet:** yüksek. Yatay eksen, geçiş tasarımı, tuval geometrisinin ikinci
  bir hâli (yeni bitirdiğimiz responsive işine dokunur).
- **Risk:** telefonda "aynı anda" yine değil, "bir kaydırma uzakta". Yatay jest
  manga bölümündeki sağdan-sola okumayla çakışabilir.

---

### Yol D — “Şerh” (dipnot / haşiye)

Yorum bir arayüz balonu değil, **kitabın kendi diziliş dili**. Metinde bloğun
sonuna küçük bir üst-simge numara (¹ ² ³) düşer; yorumun kendisi sayfanın altında,
numaralı bir "haşiye" bloğunda dizilir. Osmanlı yazma geleneğindeki *şerh/haşiye*
budur: metnin kenarına düşülmüş okur notu. Dipnot okuma alışkanlığının aynısı.

- Metinde `[1]` üst-simge, sayfa altında `1. Okur — "alıntı" → yorum`.
- Numaraya dokun → notuna kayar (dipnot gezinmesi). Nota dokun → thread.
- Sayfa notlar için **uzar** (dokuma gibi); her şey in-flow olduğu için Kenar'ın
  gutter/hizalama/kaydırma derdi yok — en basit sunum bu.
- **Kanıtladığı şey:** yorum "arayüz katmanı" değil, sayfanın tipografisi olabilir.
  Kenar'ın kartları "uygulama" gibi durur; şerh "kitap" gibi durur.
- **Maliyet:** düşük. `js/serh.js` + bir CSS bölümü.
- **Risk:** "aynı anda" değil "aşağıda"; okur numarayı görüp aşağı bakmalı.
  Yoğun sayfada dipnot listesi uzar. Yalnızca metin sayfalarında.

**Yazıldıktan sonra (B4.2):** Beklendiği gibi çıktı — 11 metin sayfasında numara +
haşiye. sz-1 gibi listede alt satırlar (dict) tek tek numaralanıyor (1 liste-üstü +
5 satır = 6 not). Numara→not kaydırma + kısa "flash", not→thread çalışıyor.
Telefonda da aynı (in-flow), sayfa uzuyor. Liste/sözlük kabına üst-simge geçersiz
olduğu için son satırına oturuyor.

---

### Nasıl deneriz

Yolların hepsi **aynı anda kodda durur**, menüdeki "Yorum sunumu" anahtarıyla
değiştirilir (Menü → Ayarlar → Yorum sunumu). Aynı sayı, aynı yorumlar, farklı
sunum. Karar ekrana bakarak verilir, tarif okuyarak değil.

> **Yaklaşım değişti (kullanıcı kararı):** yolları eleyerek değil, **biriktirerek**
> ilerliyoruz — "sağlam bir yorum sistemi bulana kadar". Her yol ayrı dosya
> (`whisper.js` / `kenar.js` / `serh.js` …) olduğu için kod temizliği baskısı yok;
> burası prototip alanı. Şerh ile başladık, sırayla diğerleri de gelecek
> (Uğultu, Mektuplar, Yönetmen yorumu — §"başka neler" aşağıda). Eleme, ancak
> hepsini görüp "bu" dediğimizde yapılır; o zaman kaybedenler tek dosya + tek
> CSS bölümü silinerek gider.

**Stres testi zorunlu:** `data.js`'e tek bir bayrakla ~250 sahte yorum üreten bir
mod. Her yol 14 yorumla güzel görünür; ayrım 250'de ortaya çıkar. Bu testi
gerçekten yapacağız.

### Sırada denenecek yollar (fikir havuzu)

Aynı temeli (blok ankrajı, temsilci ses, ısı, `comments:decorated`) kullanan,
her biri menüye bir seçenek olarak eklenecek adaylar:

- **Uğultu** — satır arasında hiç yorum metni yok; yalnızca *nerede* konuşulduğu:
  ısının büyütülmüş hâli, yığılmış minik yüzler, bir "mırıltı" dokusu. Okuma
  tertemiz kalır, sosyallik ortam ışığı gibi. "İlk okuyuş yazarın"a en sadık.
- **Mektuplar sistemi** — satır arasında hiçbir şey; yorum bloğa dokununca yazılır
  ama yalnızca bölüm/sayı sonundaki editöryel dizilmiş "Okur Mektupları" sayfasında
  okunur. En marka-doğal, en az gürültü (§3.3 zaten planlı).
- **Tepki izi** — bir yol değil, çarpan: bloğa/cümleye emoji bırak (bir dokunuş),
  marjda ince tepki izi birikir. "Bir şey hissettim" ile "söyleyecek sözüm var"
  ayrışır; yazma sürtünmesini düşürür.
- **Yönetmen yorumu** — yorumları editöre sorulan sorular olarak çerçevele, senin
  cevapların birinci sınıf; marj bir soru-cevap / commentary bandına döner.

---

## 5. Önerim

**Önce temel (§2 + §3.1), sonra B, sonra A. C'yi ertele.**

Gerekçe:

- **§2 pazarlık konusu değil.** Sunumdan bağımsız olarak bugünkü ankraj modeli
  ölçekte bozuluyor ve bunu *sessizce* yapıyor. Hangi yolu seçersek seçelim bu iş
  yapılacak; en riskli parça da bu, o yüzden ilk o.
- **B ucuz ve karşılaştırma zemini kuruyor.** Bir gün içinde ayakta olur ve
  "aslında yeterliymiş" ihtimali gerçek. Bunu bilmeden A'ya yatırım yapmak
  pahalı.
- **A senin tarif ettiğin şeyin birebir karşılığı.** B'nin yanında görünce
  aradaki farkın gerçekten hissedilip hissedilmediği anlaşılır.
- **C en güzel fikir ama en pahalısı ve "aynı anda"lık konusunda A'dan zayıf.**
  Geniş ekranda büyüleyici, telefonda — asıl hedef cihazda — B ile aynı mesafede.
  A ile B arasında karar verilmeden buna girmek erken.

---

## 6. Prototipte nereye dokunulur

| Dosya | Ne olur |
|---|---|
| `js/render.js` | Her bloğa `data-block-id` (`pageId:index`) basılır |
| `js/comments.js` | Ankraj çözümleme baştan yazılır: `markText()` gider, yerine blok eşleme + alıntı ısısı toplama + pin kümeleme + temsilci puanlama gelir |
| `js/data.js` | 14 tohum yorumun ankrajları `block`'a taşınır, mevcut `exact` metinleri `quote` alanına iner (kayıpsız). `+ MAG.debug.floodComments(250)` stres modu |
| `js/overlays.js` | Thread paneli aynı kalır, artık **blok** başlığıyla açılır |
| `css/comments.css` | `.anno` ısı ölçeğine döner; ray/dokuma/fısıltı stilleri eklenir |
| `js/canvas.js` | (yalnız C seçilirse) yatay eksen |
| `js/state.js` | `commentUI` tercihi |
| `js/whisper.js` | **(B3, yeni)** Fısıltı'nın tamamı: odak seçimi, şerit, sessiz hâl |
| `js/kenar.js` | **(B4, yeni)** Kenar'ın tamamı: ray (hizalama+çakışma+hap) ve dokuma |
| `js/comments.js` | **(B4)** `decorate()` bitince `comments:decorated` yayıyor: sunum katmanlarının tek tazeleme kapısı |

Geriye dönük uyum: eski `text` ankrajlı yorumlar açılışta bir kez bloklara
eşlenir, eşleşmeyen kalırsa sayfa seviyesine düşer. Kimse bir yorumunu kaybetmez.

---

## 7. Gerçek ürüne etkisi (PROJE.md'de güncellenecek yerler)

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
  Alıntı ısısı ayrı tablo istemiyor: `count(*) group by quote->>'exact'`.
- **§5.9:** üç seviyeli ankraj → iki seviyeli; "yorum katmanı aç/kapa" → "eş okuma
  modu"; temsilci ses ve ısı çubuğu eklenir.

---

## 8. Karar bekleyen sorular

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
6. **Fısıltı şeridinin bedeli kabul edilebilir mi?** (B3'ten sonra.) Şerit 66 px
   istiyor. Telefonda bunu tuvalin taşma payından alıyor, yani içerikten hiçbir
   şey kapanmıyor (örtme 1 px). Ama basık ekranda ve kısa masaüstü penceresinde
   sayfanın alt ~%14'ünün üstüne biniyor. Seçenekler: (a) böyle kalsın — bedel
   görünsün; (b) şerit tek satıra insin (~44 px, ses kırpılır); (c) şerit açıkken
   tuval her ekranda küçülsün — düzen gerçekten değişir, "hiç dokunmuyor" sözü
   biter. **Önerim (a):** kararı Kenar'la yan yana görünce vermek daha doğru.
7. **B5 — Karar: Fısıltı mı Kenar mı?** (Artık ikisi de menüde, aynı sayı, aynı
   yorumlar.) İkisinin ayrıldığı yer:
   - **Fısıltı** düzene hiç dokunmuyor, her ekranda birebir çalışıyor, ama "aynı
     anda" değil "bir dokunuş uzakta" — tek seferde tek ses gösteriyor.
   - **Kenar** kullanıcının tarif ettiği şeyin birebir karşılığı: cümle ve sesi
     *aynı anda*, hepsi birden. **v2'de ray tuvalin dışına, sağ boşluğa taşındı**
     — dergi artık tam genişlikte ve temiz kalıyor, metin daralmıyor. Yeni bedel:
     ray sağ boşluğa muhtaç; sol menü (dock) açıkken o boşluk daralıyor, dar
     pencerede ray sığmayıp dokumaya düşüyor. Telefonda sayfa uzuyor. Yalnızca
     metin sayfalarında; görsel/manga eski davranışta.
   Karar ekrana bakarak verilecek. Olası sonuç melez de olabilir: telefonda
   Fısıltı (bedava, temiz), geniş ekranda Kenar rayı (dergi tam genişlikte, "aynı
   anda" sağ boşlukta). Not: geniş ekranda ray + sol dock aynı anda isteniyorsa
   simetrik bir düzen için dock kayması ile ray boşluğu arasındaki gerilim (§4 v2
   tablosu) çözülmeli — şimdilik dock kapalıyken simetrik, açıkken 1280+ ekranda
   çalışıyor. Bu, iki yolu da menüde tutup şu an denemekle görülür.
