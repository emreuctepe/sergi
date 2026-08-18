# Prototip Yol Haritası (canlı to-do)

> **Bu dosya her adımda güncellenir.** Oturum yarıda kesilirse buradan devam edilir.
> Prototip = **sahte ama tam görünümlü** ürün. Gerçek arka uç, gerçek derleyici, gerçek
> Supabase **yok**. Amaç: tüm proje neye benzeyecek, uçtan uca görmek.

## Nerede kaldık?

- **Yorum sistemi 2.x — SADELEŞTİRİLDİ:** Fısıltı/Kenar/Şerh üç deneyi budandı; tek model kaldı:
  her yorum bir **baloncuk (pin)**, dokununca üstte **pop-up** (tüm yorumlar kaydırmalı). Metin/paragraf
  highlight'ları tamamen kalktı. Baloncuklar idle'da hafif **salınıyor** ve basılı tutup **sürüklenebiliyor**
  (konum yoruma yazılır, yeniden çizimde kalır). Eş okuma kapalıyken pinler gizli.
- **Son tamamlananlar:** (1) Rötuşlar — modal/panel/popup kontrast halkası (`--edge`), yüzen/sürüklenebilir
  baloncuklar, okuma modu isimleri **Doomscroller 🫠 / Dengeli ⚖️ / Doomreader 🧠**. (2) **Analitik paneli**
  (editör-only, sahte veri): `js/data-analytics.js` + `js/analytics.js` + `css/analytics.css`. Türev+olay
  ayrımı etiketli, **tam agregasyon** (kişi-bazlı iz yok), yasal not. Menü > "Analitik" veya `#analitik`.
- **Sayfalama kararı:** Otomatik sayfalayıcı prototipte görünmez → **asıl build'e ertelendi** ([`PROJE.md`](PROJE.md) §8).
  Prototipte sadece Sözlük 3 `fit:contain` sayfaya bölündü (örnek).
- **ARTIK ÇOK SAYILI (C1).** İçerik `js/issues/<slug>.js` dosyalarında, `data.js` yalnızca hangisinin
  açılacağına karar veriyor. Aktif sayı URL'de: `?sayi=2026-09` → Kızıl Mevsim, temiz adres → güncel sayı.
  Arşivden eski sayıya geçmek gerçekten çalışıyor (doğrulanmış hesap gerekiyor, tasarım gereği).
  **Yeni sayı yazmak:** `js/issues/<yyyy-mm>.js` (+ istersen `.comments.js`), `tokens.css`'e bir tema bloğu,
  `data.js`'te `D.archive`'a bir satır, `index.html`'e iki script etiketi. Başka hiçbir yer değişmiyor.
- **Yayımlanmış sayılar:** № 03 "Kızıl Mevsim" (2026-09) · № 04 "Gürültü" (2026-10, siber güvenlik/cyberpunk).
  Arşivdeki № 02 ve № 01 hâlâ içeriksiz — arşivin boş hâli de bilerek duruyor.
- **SIRADA (kullanıcı):** Gerçek içerikle 1. sayıyı döşemek (yazı/manga/röportaj/görseller tek tek gelecek),
  uçtan uca test, sonra **asıl build** (SvelteKit mimarisi).
- **Not:** Prototip saf HTML/CSS/JS, derleme adımı yok. `prototype/index.html` çift
  tıklanarak açılabilir (klasik `<script>` etiketleri, ES modül yok — `file://` uyumlu).

## Prototip kuralları

1. **Derleme yok.** Node, npm, bundler yok. Çift tıkla çalışsın.
2. **Ağ yok.** Dış font, dış görsel, CDN yok. Tüm görseller elle çizilmiş satır içi SVG.
3. **Veri sahte ama gerçekçi.** Her sayı `js/issues/<slug>.js` içinde eksiksiz durur;
   `js/data.js` yalnızca hangisinin açılacağını seçer.
4. **Durum `localStorage`'da.** Okuma modu, ilerleme, yorumlar, bulmaca sonuçları.
5. **Her adım kendi başına çalışır.** Yarıda kalırsa prototip yine açılır, çökmez.

---

## Adımlar

### Temel

- [x] **A0 — Depo iskeleti**
      `docs/PROJE.md`, bu dosya, `prototype/` klasör düzeni, boş `index.html` kabuğu.
- [x] **A1 — Tasarım token'ları**
      `css/tokens.css`: renk/tipografi/boşluk ölçekleri, karanlık-aydınlık,
      sayı teması değişkenleri (Eylül 2026 = kızıl/kâğıt paleti).
- [x] **A2 — 3:4 tuval + bantlar**
      `css/canvas.css` + `js/canvas.js`: sabit oranlı tuval, üst bant (menü/mod/dil/
      ilerleme), alt bant (yorum katmanı düğmesi + sayaç), masaüstünde "dergi objesi".
- [x] **A3 — Snap motoru**
      Dikey sayfa sayfa oturma, ilerleme çubuğu, klavye gezinmesi (↑↓/PgUp/PgDn),
      `fit: contain` ve `fit: scroll` sayfa davranışları.

### İçerik

- [x] **A4 — Sahte sayı verisi**
      `js/data.js`: Sayı 03 / Eylül 2026, 8 bölüm, 3 okuma derinliği, TR metinleri.
- [x] **A5 — Satır içi SVG görsel kitaplığı**
      `js/art.js`: kapak, manzara, şehir, yağmur, portre, doku — hepsi tema
      değişkenleriyle boyanır.
- [x] **A6 — `article` + `list` blokları**
      `js/render.js` + `css/blocks.css`: başlık, drop cap, alıntı, dipnot, sözlük kartları.
- [x] **A7 — `gallery` + `interview` blokları**
      Tam ekran foto-öykü; iki sesli söyleşi dizgisi.
- [x] **A8 — `manga` bloğu**
      One-shot okuyucu: sağdan sola, sayfa sayfa, panel vurgulu rehberli görünüm.

### Deneyim

- [x] **A9 — Tanıtım (about) sahnesi**
      İlk ziyarette 10-15 sn kaydırmalı tanıtım, atlanabilir.
- [x] **A10 — Okuma modu seçimi**
      3 kart (en az / orta / klasik) + üst banttan anlık değişim + konum koruma.
- [x] **A11 — Animasyon sahneleri**
      `fade-up`, `stagger`, `parallax`, `mask-wipe`, `type-in`, `panel-reveal`,
      imza sahne; `prefers-reduced-motion` düşüşü.

### Sosyal

- [x] **A12 — Yorum katmanı**
      Metin seçimi ankrajı + görsele koordinat pini, katman aç/kapa, hafif vurgular.
- [x] **A13 — Yorum thread paneli**
      Alttan açılan panel, iç içe cevaplar, emoji tepkileri, yorum yazma alanı.
- [x] **A14 — Kimlik ve giriş**
      Sessiz anonim takma ad + emoji/renk, ilk yorum sonrası giriş teklifi,
      e-posta + 6 haneli kod modalı, "geçmişin taşındı" anı.

### Oyun ve kapanış

- [x] **A15 — Bulmaca motoru + 2 bulmaca**
      Custom element sözleşmesi (sahte), kelime avı + görsel bulmaca, sonuç ekranı,
      anonim okur istatistikleri, öneri rozeti ("bunu neden gördün?").
- [x] **A16 — Sayı sonu ekranı**
      "Bitirdin" rozeti, okuma istatistikleri, bulmaca özeti, ikinci giriş teklifi.
- [x] **A17 — Menü, arşiv, ayarlar**
      Yan menü, sayı arşivi, dil değiştirici (TR/EN/JA), tema, erişilebilirlik ayarları.
- [x] **A18 — Moderasyon paneli**
      Sahte `/admin` onay kuyruğu: bağlamıyla birlikte yorum kartları.
- [x] **A19 — Cila**
      Alıntı paylaşma görseli, geçişler, boş/hata durumları, mobil elden geçirme.

---

## Adım günlüğü

| Adım | Durum | Not |
|---|---|---|
| A0 | ✅ | `docs/` + `prototype/` iskeleti kuruldu. |
| A1 | ✅ | `css/tokens.css` — iki ölçek (cqi tuval / px arayüz), 2 sayı teması. |
| A2 | ✅ | `css/base.css`, `css/canvas.css`, `index.html` kabuğu. Letterbox `roomy/tight`. |
| A3 | ✅ | `js/canvas.js` — snap motoru, ilerleme, klavye, folio, sahne gözlemcisi. |
| A5 | ✅ | `js/art.js` — 12 sahne + foto üreteci + manga paneli, hepsi tema değişkenli. |
| A4 | ✅ | `js/data.js` — Sayı 03 "Kızıl Mevsim": 8 bölüm, 29 sayfa (klasik), 14 tohum yorum, 4 bulmaca. |
| A6 | ✅ | `js/render.js` + `css/blocks.css` — 22 blok tipi, drop cap, sözlük, istatistik şeridi. |
| A7 | ✅ | Foto-öykü (tam kanama + alt yazı) ve söyleşi (iki sesli dizgi) blokları. |
| A8 | ✅ | Manga bloğu — 3 panel düzeni, sağdan sola, konuşma/düşünce/anlatı balonları. |
| A9 | ✅ | Tanıtım sahnesi — 5 kaydırmalı slayt, atlanabilir, nokta göstergesi. |
| A10 | ✅ | Mod seçimi — 3 kart, her mod için gerçek süre/sayfa tahmini, konum koruma. |
| A11 | ✅ | 6 sahne preseti + `prefers-reduced-motion` ve elle kapatma düşüşü. |
| A12 | ✅ | Yorum katmanı — metin ankrajı, normalize (x,y) pin, uzun basma, düşme mantığı. |
| A13 | ✅ | Thread paneli — iç içe cevap, emoji tepki seçici, bağlam alıntısı. |
| A14 | ✅ | Anonim kimlik + e-posta/6 haneli kod; `reader.id` korunuyor, geçmiş taşınıyor. |
| A15 | ✅ | 4 bulmaca, GERÇEK custom element olarak. Öneri algoritması + soğuk başlangıç. |
| A16 | ✅ | Sayı sonu — bitirdin rozeti, 4 istatistik, ikinci ve son giriş teklifi. |
| A17 | ✅ | Menü (içindekiler + ayarlar), arşiv, dil seçici, tema/animasyon anahtarları. |
| A18 | ✅ | Moderasyon paneli — bağlamıyla birlikte onay kuyruğu. |
| A19 | ✅ | Portre çizimi soyutlandı, yaprak simgesi yenilendi, folio perdesi, süre tahmini ayarlandı (6/8/10 dk), `prototype/README.md`. |
| — | 🐞 | Düzeltilen 4 hata: `art.js`'te yorum içinde `*/` tüm dosyayı bozuyordu; uzun sayfalarda IntersectionObserver eşiği içeriği görünmez bırakıyordu; manga sayfasında tam kanama dolgusu; folio uzun sayfada metnin üstüne biniyordu. |
| — | 🐞 | Karanlık temada bantlar okunmuyordu: `.band` rengi `--paper` idi, karanlıkta hem kâğıt hem zemin koyu olduğu için yazı zemine gömülüyordu. Yeni `--on-backdrop` token'ı (aydınlık: kâğıt, karanlık: mürekkep) eklendi — kontrast 1.09'dan 15.9'a çıktı. |
| A20 | ✅ | Masaüstünde sabit menü: tuvalin yanındaki boşlukta durur, perde yok, okuma engellenmez. “Sade görünüm” düğmesiyle kapanır, hamburgerle geri gelir, tercih saklanır. Menü açıkken tuval yarım menü kadar sağa kayar → menü + dergi birlikte ortalanır. Dar pencerede eski çekmece davranışı korunur. |
| B1 | ✅ | **Yorum temeli.** Ankraj artık karakter aralığı değil **blok** (`pageId:index[.alt]`, `render.js` basıyor; sözlük satırı ve manga paneli de ayrı blok). Alıntı ankraj olmaktan çıkıp yorumun gövdesine taşındı → aynı cümleye kaç kişi isterse yorum yazabiliyor (eskiden ikincisi sessizce sayfa seviyesine düşüyordu). Sayfadaki `<mark>` artık **alıntı ısısı**: bir cümle başına tek işaret, kalınlığı kaç kişinin alıntıladığı. Blok kenarında sayaç çentiği, blok başına tek **temsilci ses** (`2×tepki + cevap + editör seçimi`). Pinler kümeleniyor: sayfa en fazla 6 pin gösterir, yoğunluk artınca kümeler kabalaşır. Eski `text` ankrajları açılışta bloklara taşınıyor, kimse yorumunu kaybetmiyor. |
| — | 🐞 | `overlays.closeTop()` gecikmeli temizliği, 260 ms içinde yeniden açılan paneli siliyordu: bir yoruma tepki verince thread paneli bomboş kalıyordu. Her açılışa sıra numarası verildi, temizlik yalnızca kendi açılışı güncelse çalışıyor. |
| B2 | ✅ | **Stres modu** (`js/debug.js`, `MAG.flood(250)`). Sıcak-soğuk dağılım (bloklar 1/sıra^1.15 ağırlıklı), %22 cevap, %18 koordinat pini, %45 alıntı. Yalnızca bellekte. 250 yorumda ölçüm: 7 ms'de çiziliyor, en yoğun blokta 36 yorum → sayfada yine tek ses, bir sayfadaki en fazla işaret 9 (6 pin + 3 blok). |
| B2.5 | ✅ | **Sayı gerçek yorumla dolduruldu.** `js/data-comments.js` (yeni): 248 elle yazılmış tohum yorum — 225 kök + 23 cevap, 30 farklı okur, 58 blokta rozet, 5'i onay kuyruğunda. Dağılım bilerek eşitsiz: en yoğun blok 21 yorum, en sıcak cümle 16 alıntı (ısı 4), 3 cümle ısı 3, 41 cümle ısı 2. Akıştaki **29 sayfanın hepsinde** yorum var; klasik modda 214, ortada 188, en azda 103 yorum görünüyor. Bir sayfadaki en fazla işaret 7, temsilcisiz blok 0, çizim 3.6 ms. İçerik ile yorum ayrı dosyaya çıktı (`data.js` artık yalnızca derleyici çıktısı). Moderasyon kuyruğu artık okurun kendi yorumlarını değil **bekleyen her yorumu** gösteriyor; onaylanan tohum yorum sayfada anında beliriyor. |
| B2.6 | ✅ | **Pin kümelenmesi hata ayıklama görünümü** (`MAG.pins()`). Kümelenme görünmez bir kuraldı; artık her pinin **çekim alanı** çiziliyor: kesikli elips (yarıçap 0.14, tuval genişliği birimi), pinin kendi gövdesi (8.5cqi) kıyas için, ham koordinatlardan küme ortasına giden bağlar, sınama sırası (`#1 #2 …`), çakışan alanlar turuncu (“en yakına değil sırada önce olana katılır”), pin sınırı yüzünden gelen birleşmeler pembe, en yakın iki pin ve mesafesi. Görselde uzun basınca nokta canlı sınanıyor: “#1 pinine katılır (0.112 ≤ 0.14)” ya da “yeni pin açılır”. `clusterPoints` isteğe bağlı bir birleşme günlüğü tutuyor; görünüm ürün CSS'ine dokunmuyor, kendi stilini kendi enjekte ediyor. |
| — | 🐞 | **Isı ölçeği kalabalıkta ayırt etmiyordu.** 248 yorumla eş okuma açıkken her işarete zemin dolgusu veriliyordu: tek sayfada 7 işaret olunca sayfa şeritli bir bloğa dönüşüyordu ve ısı 4 ile ısı 2 aynı görünüyordu — “yorum arttıkça koyulaşır” sözü tutulmuyordu. Ağırlık artık altı çizginin kalınlığında (0.09 → 0.34em) ve dolgu yalnızca ısı 3-4'te. 14 yorumla fark edilmesi imkânsız bir hataydı; dolu sayı olmadan görünmezdi. |
| B3 | ✅ | **Yol B: Fısıltı** (`js/whisper.js`). Alt bant iki satıra açılıyor ve o an odaktaki bloğun temsilci sesini söylüyor: kim, nereye (alıntıysa alıntının kendisi), ne dedi, `+N` başka ses. Odak sırası: son dokunulan blok → kaydırmalı sayfada ekran ortasına en yakın yorumlu blok → sayfanın en yüksek puanlı sesi. Yorumlu bloğa **ilk dokunuş sesi banda taşır** (okuma bölünmez), **ikinci dokunuş konuşmayı açar**; banda dokunmak da açar. Odaktaki blok hafifçe aydınlanıyor. Sayfa DOM'una tek düğüm eklenmiyor. Şerit ses olmasa da yer tutuyor (sessiz hâl) — yoksa bant her sayfa değişiminde büyüyüp küçülüyor, telefonda okuma yerini oynatıyordu. Menüde “Yorum sunumu” anahtarı: Fısıltı / Yok (temel) / Kenar (kapalı, B4). |
| B4 | ✅ | **Yol A: Kenar** (`js/kenar.js`). İki biçim, tuval genişliğine göre js seçiyor. **Ray (geniş, ≥520px tuval):** metin %60'a daralıyor, sağdaki rayda her kart bloğunun tam yanında (avatar+isim+yanıtladığı alıntı+gövde+`+N`). Kartlar bloğun layout üstüne hizalanıyor (offsetTop zinciri, ölçekten bağımsız), çakışanlar aşağı itiliyor, sığmayanlar “+N daha” hapına toplanıyor (hap thread açıyor). **Dokuma (telefon):** kenar yok; şerit bloğun hemen ardında tek satır, dokun → yerinde 3 satır, tekrar dokun → thread; yorumlu sayfa uzuyor, alt bloklar şeridi kendi içine alıyor. Kapsam: yalnızca metin sayfaları; görsel/manga/kapak/bulmaca eski rozet+thread'e düşüyor, pinler her yerde. Menüdeki “Yorum sunumu” anahtarında artık üç seçenek de canlı. |
| B4.1 | ✅ | **Ray tuvalin dışına taşındı (kullanıcı isteği).** İlk sürümde kartlar tuvalin içindeydi, metni %60'a daraltıp üstüne biniyordu. Kullanıcı "balonları derginin sağındaki boşluğa taşıyalım" dedi. Artık ray tuvalin **dışında**, sağ letterbox boşluğunda (`#shell` çocuğu, `left:100%`, genişlik/konum js ölçüyor): dergi tam 3:4/tam genişlikte ve temiz. Kartlar tuvalle kaymadığı için hizalama görsel koordinatta (`getBoundingClientRect`) ve **kaydırmada js yeniden konumluyor**; `scale(0.965)` geçişi bitince bir kez daha. Scroll sayfada görüş dışı kart gizleniyor, contain'de sığmayan "+N daha" hapına. Metin daralması ve `data-kenar-col` kaldırıldı. 1280+dock-kapalı: dergi 370–910, ray 934–1234 (300px), çakışma/taşma yok, hizalama 0–1px. Dock açıkken sağ boşluk daraldığından dar pencerede dokumaya düşüyor (dock↔ray gerilimi, §4 v2). |
| B4.2 | ✅ | **Yol D: Şerh** (dipnot/haşiye, `js/serh.js`). Yorum kitabın diziliş dilinin parçası: metinde bloğun sonuna üst-simge numara `[1]`, sayfa altında numaralı "haşiye" (okur, alıntı, gövde, +N). Sayfa notlar için uzuyor (dokuma gibi), her şey in-flow → Kenar'ın gutter/hizalama/kaydırma derdi yok. Numaraya dokun → notuna kayar + kısa flash; nota dokun → thread. Liste/sözlük satırları tek tek numaralanıyor (sz-1: 6 not). Menüde artık 4 sunum: Fısıltı / Kenar / Şerh / Yok. Karar ertelendi — eleme yerine biriktirme. |
| — | 🔤 | **Yorum yazısı 1.5×.** Sunum yüzeyleri küçük kalmıştı. `--fs-cmt` (gövde, ~21px) / `--fs-cmt-quote` (~15-18px) / `--fs-cmt-name` değişkenleri tanımlandı, Fısıltı/Kenar/Şerh/thread hepsi buradan besleniyor — tek yerden ayarlanıyor. Büyük font Fısıltı şeridini 66→82px'e çıkarınca `--whisper-h` rezervasyonu 84'e güncellendi (telefonda örtme 0). |
| — | 🎨 | **Eş okuma tonlaması içeriden çevreye taşındı.** `#comment-layer` tuvalin İÇİNE %12 koyu tül seriyordu → "içerisi bulanıklaşıyor" hissi. Kullanıcı: "içi aynı renk kalsın, renk değişimini çerçevenin dışına ver." İç tül kapatıldı (`display:none`), yerine `body::after` çevre tülü (z:0, #shell'in altında, tuval opak olduğu için yalnız çerçevenin dışında görünür) — eş okuma açılınca %32 karararak dergi objesini öne çıkarıyor (spotlight). Zoom-out korundu. İçerik iki durumda da birebir aynı parlaklıkta. |
| — | ♻️ | **`comments:decorated` olayı.** `decorate()` bitince tek olay yayıyor; Fısıltı ve Kenar buna bağlanıp otomatik tazeliyor. Önce her sunum ayrı ayrı `comment:added`/`flow:render`/… dinliyordu ve `MAG.flood()` hiçbirini yaymadığı için stres modunda ray eksik kart gösteriyordu — bu tek kapı onu kökten çözdü (ekleme, tepki, stres, moderasyon hepsi decorate'ten geçiyor). |
| — | 📐 | **Fısıltı'nın bedeli ölçüldü.** Şerit 66 px, bant 50 → 129 px. Telefonda (390×844) tuval bunu 3:4'ün üstündeki **taşma payından** karşılıyor: 720 → 588 px, örtme **1 px** — kurgulanmış içerikten hiçbir şey kapanmıyor. Pay yoksa bedel görünüyor: basık telefonda alt %15, kısa masaüstü penceresinde (1280×800) alt %14, uzun pencerede (1280×1000) 8 px. Karar §8'de açık soru olarak duruyor. 498 yorumla çizim + fısıltı 14.5 ms. |
| C1 | ✅ | **Çok sayılılık + Sayı 04 "Gürültü".** Prototip tek sayıya kilitliydi (`data.js` tek bir `D.issue` singleton'ı ihraç ediyordu; arşivdeki eski sayılar tıklanınca "yalnızca güncel sayı var" toast'ı veriyordu). İçerik `js/issues/<slug>.js` + `js/issues/<slug>.comments.js` dosyalarına çıktı, her biri kendini `MAG.issues`'a kaydediyor; `data.js` yükleyiciye, `data-comments.js` koşum takımına döndü. Aktif sayı **URL'de** taşınıyor (`?sayi=2026-09`) — localStorage'a yazılmıyor, böylece eski bir sayı okunurken yenilemek okuduğunu kaybettirmiyor ve arşiv paylaşılabilir bağlantı üretiyor. Sayı değişimi tam yeniden yükleme: her modül tek bir `MAG.data` ile açılıyor, `state.js` zaten `issueSlug` ile isimlendirdiği için ilerleme/bulmaca kayıtları ayrışıyor. Çekirdekte (render/canvas/comments/analytics) **tek satır değişmedi.** Yeni sayı: cyberpunk tema (mono başlıklar — kullanılmayan `--issue-display` token'ı nihayet bağlandı), 4 yeni sahne, yeni `term` blok tipi, `bg: "img:…"` öneki (çizilmiş sahneyi gerçek dosyayla değiştirmek tek satır), 8 bölüm / 27 sayfa (16·23·26), 98 tohum yorum, "Üç Halka" bulmacası. |
| C1a | ✅ | **Ölçüm dersi.** `fit:contain` taşma kontrolünü `page.scrollHeight` ile yapmak yanıltıyor: `parallax`/`signature` sahneleri `.page__bg`'yi ölçekliyor, dönüştürülmüş arka plan sayfayı taşırıyor ve içerik taşması gibi okunuyor. Doğru ölçüm `.page__inner`. Bu ölçüyle taşma her iki sayıda, üç modda, mobil+masaüstünde **sıfır**. |
| A21 | ✅ | **Responsive elden geçirme — “siyah bölümler”.** 11 ekran boyutunda ölçüldü, 4 ayrı kaynak bulundu: (1) telefonda 3:4 tuval ekranın %38'ini ölü bırakıyordu → tuval artık letterbox tam bir bant boyuna inene kadar uzuyor, ölü alan sıfır; (2) galeri “fotoğrafları” kâğıt paletinden boyanıyordu, karanlıkta kapkara dikdörtgene dönüyorlardı → fotoğrafın kendi tonlaması var artık; (3) tanıtım sahnesi karanlıkta siyah ekrandı (kâğıt zemin + koyu perde) → sayı rengiyle tonlama + karanlıkta hafifletilmiş perde; (4) basık-geniş pencerede yanlarda 500px+ boşluk kalıyordu → sabit menü eşiği 560px'den 440px'e indi, menü o boşluğu dolduruyor. Ayrıca karanlıkta dergiye kenar ışığı ve zemine ışık havuzu: obje zemine karışmıyor. |

---

## B — Yorum sistemi yeniden tasarımı

Ayrıntılı plan: [`docs/YORUM-SISTEMI.md`](YORUM-SISTEMI.md).
Sorun: ankraj modeli (karakter aralığı + piksel pini) yüzlerce yorumda **sessizce**
bozuluyor — aynı cümleye ikinci yorum bugünkü kodda zaten imkânsız. Hedef: okur,
yazıyı ve ona iliştirilen sesleri aynı anda okuyabilsin.

- [x] **B0 — Plan onayı.** Sıra: temel → Fısıltı → Kenar. Karşı sayfa ertelendi.
- [x] **B1 — Temel.** Blok kimliği, blok ankrajı, alıntı ısısı, pin kümelenmesi,
      temsilci ses puanlaması, geriye dönük ankraj taşıma.
- [x] **B2 — Stres modu.** `MAG.flood(250)` — her yol 14 yorumda güzel görünür,
      ayrım 250'de çıkar.
- [x] **B2.5 — Dolu sayı.** 248 elle yazılmış tohum yorum (`js/data-comments.js`).
      Sentetik stres modundan farkı: kalıcı, okunabilir ve *gerçekten* tartışıyor —
      sunum yolları buna bakarak seçilecek. Isı ölçeği burada bir kez düzeltildi.
- [x] **B2.6 — Kümelenme görünümü.** `MAG.pins()` — çekim alanları, sınama sırası,
      çakışmalar, sınır birleşmeleri ve canlı nokta sınaması.
- [x] **B3 — Yol: Fısıltı** (ucuz, karşılaştırma zemini). `js/whisper.js` —
      alt bant konuşuyor, sayfa düzenine dokunulmuyor. Bedeli ölçüldü ve
      [`YORUM-SISTEMI.md`](YORUM-SISTEMI.md) §8.6'da açık soru olarak duruyor.
- [x] **B4 — Yol: Kenar** (kullanıcının tarif ettiğinin birebir karşılığı).
      `js/kenar.js` — geniş ekranda ray (hizalı kartlar + çakışma + hap),
      telefonda dokuma (bloğun ardında şerit). Yalnızca metin sayfalarında.
- [x] **B5 — Karar: KENAR.** Kullanıcı seçti; varsayılan `commentUI = "rail"`.
      Kaybeden yollar (Fısıltı/Şerh) şimdilik menüde kalıyor — silme onaya bağlı.
- [ ] **B6 — Mektuplar sayfası** (hangi yol kazanırsa kazansın eklenir).

---

## Sırada ne var (kullanıcı kararı bekliyor)

0. **Yorum sistemi planı** — yukarıdaki B0. Diğer maddelerden önce gelir.
1. **Görsel yön.** Şu anki palet ve çizim dili bir öneri — beğenmediğin her şey
   `css/tokens.css` ve `js/art.js`'te tek yerden değişir.
2. **Niş ve marka adı.** Prototip içeriği (Kyoto/sonbahar/gece) plandaki örneklerden
   türetildi, yer tutucu. Niş netleşince bölüm şablonları ona göre ayarlanır.
3. **One-shot manga.** Kimin çizeceği hâlâ açık — takvimi belirleyen en ağır kalem bu.
4. **Onaydan sonra:** Faz 0 (gerçek SvelteKit iskeleti). Prototip o noktada
   referans olarak kalır, silinmez.

### Asıl build'e kaydedilen iki madde ([`PROJE.md`](PROJE.md))

- **Güvenlik denetimi (1.0 sonrası) → PROJE.md §6 Faz 9.** Site 1.0 canlıya
  çıktıktan sonra giriş/kimlik başta olmak üzere önemli yüzeylerde güvenlik
  açıkları taranacak (kod deneme sınırı, oturum, RLS yetki, XSS/enjeksiyon,
  hesap devralma). Her faz sonrası tekrarlanan bir geçiş.
- **Dergi boyutu ve saklama verimi → PROJE.md §8.7.** Bir sayının toplam
  ağırlığı ölçülecek, en ağır parça (muhtemelen görseller) tespit edilecek;
  görsel formatı/duyarlı boyut/tembel yükleme, kod bölme, CDN/edge önbelleği,
  eski sayıların soğuk saklaması değerlendirilecek — arşiv büyüdükçe ilk açılış
  maliyeti sabit kalsın diye.
