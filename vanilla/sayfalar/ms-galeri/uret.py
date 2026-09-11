#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
uret.py — `sayfalar/ms-galeri/sayfa.html` dosyasını üretir (yanındaki dosyayı).

════════════════════════════════════════════════════════════════════════════
BU JENERATÖRÜN TEK İŞİ ODA.
────────────────────────────────────────────────────────────────────────────
Tavan, ray, spot, ışık konisi, duvar, zemin, akis — hepsi ya düz yatay bant
ya da sabit aralıkla tekrar eden birkaç şekil. Toplamı elli satır ve hata
yapması zor.

İNSANLARI, BANKI, SAKSIYI BU DOSYA ÇİZMİYOR. Onlar referans görselden kesilip
vektöre çevrilecek sprite'lar (bkz. `referans/BENIOKU.md`); buraya yalnız
konumları yazılacak — §NESNELER şimdilik boş ve orası bilerek boş.

Ayrım DETAY ihtiyacına göre değil SÜREKLİLİK ihtiyacına göre yapıldı:

  · dikişsiz olmak zorunda olan her şey   → düz dikdörtgen → kod
  · dikişten hiç geçmeyen her şey (nesne) → ne iyi çıkarıyorsa o

Elle poligon listesi olarak yazılmış bir insan silüeti, ne kadar uğraşılırsa
uğraşılsın sert ve ölü duruyor. Bu jeneratörün insan çizmemesinin sebebi
budur; çizemediği için değil, çizdiğinde iyi olmadığı için.

════════════════════════════════════════════════════════════════════════════
ÖLÇÜM
────────────────────────────────────────────────────────────────────────────
Aşağıdaki bütün sayılar `referans/ChatGPT Image 5 Eyl 2026 02_53_27.png`
(1672 × 941) üstünde ÖLÇÜLDÜ — göz kararı değil. Yöntem: satır medyanında
sıçrama arayarak bant sınırları, 9×9 medyan yamalarla renkler, eşik üstü
sürekli aralık tarayarak koninin açılma profili. Dikey oranlar görselin
BOYUNA bölünüp buraya 800 birimlik tuvalle çarpılarak taşındı (ölçek 0.85).

════════════════════════════════════════════════════════════════════════════
YATAY KURGU
────────────────────────────────────────────────────────────────────────────
    KAMERA = 600 birim (3:4'ün "3"ü, tuvalin kendisi)
    ADIM   = 235 birim (iki tablo arası VE iki durak arası)

⚠️ ADIM ÖLÇÜLEN DEĞER ve tek düğme burası. Referansta altı spot şu x'lerde:
148, 388, 692, 995, 1250, 1528 — ortalama aralık 276px, yani görselin boyunun
0.2933 katı. 800 birimlik tuvalde 235 ediyor.

Bunun bedeli var ve bilinçli ödeniyor: ADIM kameradan (600) çok dar olduğu
için her kadrajda ~2.5 tablo görünüyor ve bir durak ilerlemek ekranın ancak
%39'u kadar kayıyor. Yani okur "sonraki tabloya atlamıyor", koridorda bir
adım yürüyor — referansın kalabalık asımı da zaten bu.

    ADIM = 235 → kadrajda ~2.5 eser, ilerlemek ekranın %39'u   (ölçülen)
    ADIM = 420 → kadrajda ~1.4 eser, ilerlemek ekranın %70'i   (tek eser
                 ortada, komşular uçlardan hafifçe sarkıyor)

Değiştirmek için YALNIZ bu satır: geometri, CSS ve gezinme sayıyı sayfadan
okuyor, hiçbiri yeniden düzenlenmiyor.

    tablo i'nin merkezi   x = KAMERA/2 + i·ADIM
    şeridin boyu          W = KAMERA + (N-1)·ADIM

Kamera i. durakta i·ADIM kadar kaymış oluyor, yani tablo i tam ortada.

════════════════════════════════════════════════════════════════════════════
DİKEY BÜTÇE (viewBox yüksekliği 800 = 3:4 kameranın tam boyu)
────────────────────────────────────────────────────────────────────────────
      0 ─────────────────────────────────  tavan  ( 0.0% ölçülen)
     57 ═════════════════════════════════  RAY üstü ( 7.1%)
     66 ═════════════════════════════════  RAY altı ( 8.3%)
     74 ·· koninin tepesi ( 9.2% — eğimden geriye doğru çözüldü)
     93 ─────────────────────────────────  DUVAR başlıyor (11.6%)
    280 ·· koni sönüyor (~35%)
    348 ·· ASKI HATTI — çerçevelerin ortak merkezi (43.5%)
    455 ▭ künye levhaları (~55%)
    598 ─────────────────────────────────  duvarın dibi (74.7%)
    637 ─────────────────────────────────  ZEMİN başlıyor (79.6%)
    800 ─────────────────────────────────

⚠️ RAY TAVANIN DİBİNDE DEĞİL. Üstünde de altında da tavan var (0–57 ve 66–93):
spotlar bu alt şeritten sarkıyor. İlk sürümde ray duvarın hemen üstündeydi ve
lambalar duvara yapışık duruyordu.

⚠️ DUVARLA ZEMİN ARASINDA 39 BİRİMLİK KOYU BİR BANT VAR (598–637, #575c5d).
Ölçümdeki en büyük sıçrama orada (Δ207) ve sahnedeki tek SOĞUK yüzey o. İlk
sürümde 9 birimlik ince bir çizgiydi; oysa duvarı zeminden ayıran şey bu bant.

ASKI HATTI gerçek bir sergileme kuralı: eserler üst ya da alt kenarlarından
değil ORTALARINDAN hizalanır. Referanstaki altı çerçevenin boyları farklı ama
merkezleri 43.0–46.1% arasında toplanıyor — o resmin dağınık değil düzenli
görünmesinin sebebi bu.

════════════════════════════════════════════════════════════════════════════
Çalıştırma — çıktı ÜRETİLEN dosyanın üstüne yazılır:
    python3 sayfalar/ms-galeri/uret.py > sayfalar/ms-galeri/sayfa.html
"""

import re
import sys

# Yanındaki ÜRETİLMİŞ dosya (bkz. §NESNELER). Python betiğin kendi klasörünü
# yola eklediği için nereden çağrıldığı fark etmiyor.
from spritelar import SPRITE

# ═══════════════════════════════════════════════════════════════════════════
# ÖLÇÜLER
# ═══════════════════════════════════════════════════════════════════════════

N = 10             # durak sayısı
KAMERA = 600       # 3:4 tuvalin genişliği — bir kadraj
ADIM = 235         # iki tablo arası; ölçülen (bkz. başlıktaki §YATAY KURGU)
H = 800            # 3:4 tuvalin boyu
W = KAMERA + (N - 1) * ADIM

RAY_UST = 57       # ölçülen  7.1%
RAY_ALT = 66       #          8.3%
KONI_UST = 74      #          9.2% — koninin tepesi, spotun ağzı
DUVAR_UST = 93     #         11.6%
KONI_DIP = 280     #        ~35%   — koninin söndüğü yer
ASKI_HAT = 348     #         43.5% — çerçevelerin ortak merkezi
PLAKA_UST = 455    #        ~55%
DUVAR_ALT = 598    #         74.7%
ZEMIN_UST = 637    #         79.6%

# Koninin açılma eğimi: yarı-genişlik / tepeden uzaklık. Ölçüm dört yükseklikte
# 26 → 40.5 → 54.5 → 69 px verdi, aradaki ilişki DÜZ bir doğru (eğim 0.41) ve
# sıfıra geriye çözülünce tepe tam spotun ağzına düşüyor. Koni bir üçgen.
KONI_EGIM = 0.41

# ═══════════════════════════════════════════════════════════════════════════
# DEĞERLER — hepsi ÖLÇÜLDÜ (9×9 medyan yamalar; gren tek pikseli bozuyor)
# ---------------------------------------------------------------------------
# ⚠️ TAHMİNLERİM ÜÇ YERDE YANLIŞMIŞ, üçü de not olarak duruyor ki aynı hata
# ikinci kez yapılmasın:
#
#   · Duvarı #d9d5cd sanmıştım, #c0b7aa çıktı — belirgin biçimde daha KOYU
#     ve daha SICAK. Sahnedeki bütün figür değerleri buna göre kurulacak.
#   · Zemini soğuk sanmıştım (#8b8e90), sıcak çıktı (#75736e). Sahnedeki tek
#     SOĞUK yüzey zemin değil, duvarla zemin arasındaki bant (#575c5d).
#   · Duvarın koni altındaki açık hâli için ayrı bir renk tutuyordum; gereksiz.
#     Koni saydam bir kaplama olarak çizilince duvarın kendi rengi zaten
#     açılıyor. Bir renk eksildi.
#
# ⚠️ DUVARDA VİNYET YOK. Ölçüldü: y=640'ta soldan sağa parlaklık %1'den %99'a
# 182 sabit. Kadrajın kaplamasındaki vinyet bu yüzden çok hafif tutuldu.
# ═══════════════════════════════════════════════════════════════════════════

def dv(ad, yedek):
    """CSS değişkeni + yedek. Tezgâh override edebilsin diye."""
    return f"var({ad}, {yedek})"


TAVAN       = dv("--gal-tavan",      "#464540")   # ölçülen
RAY         = dv("--gal-ray",        "#1a1d1c")   # ölçülen
DUVAR       = dv("--gal-duvar",      "#c0b7aa")   # ölçülen
DIP         = dv("--gal-dip",        "#575c5d")   # ölçülen — tek soğuk yüzey
ZEMIN       = dv("--gal-zemin",      "#75736e")   # ölçülen
ZEMIN_ISIK  = dv("--gal-zemin-isik", "#817c75")   # ölçülen — zemindeki ışık gölü
KONI        = dv("--gal-koni",       "#fdf8ec")   # huzmenin kendisi
ORTU        = dv("--gal-ortu",       "#12100e")   # açılmamış eserin perdesi

# KEŞİF ÖRTÜSÜ — "henüz bakılmadı" hâli.
# ---------------------------------------------------------------------------
# İki düz yüzey, ikisi de eserin İÇİNE çiziliyor: koyu bir perde + camın
# üstündeki iki yansıma kaması. Okunuşu "bozuk/eksik" değil "camın ardında,
# ışığı henüz üstüne düşmemiş" — sergi salonunda bir esere yaklaşana kadar
# görülen şey de bu.
#
# ⚠️ ODANIN IŞIĞINA DOKUNULMADI. Konileri ve zemin göllerini de kısmak
# denenebilirdi ama sahnenin bütün ışık değerleri referanstan ÖLÇÜLDÜ; ilk
# açılışta okurun gördüğü hâl o ölçümden sapmasın diye kısılan tek şey eserin
# kendisi. Perde açılınca geriye ölçülen sahne kalıyor.
#
# İkisi de SVG özniteliği (CSS değil): `araclar/bas.js` ile basılan şeritte de
# görünsünler, yani "keşfedilmemiş hâl" gözle denetlenebilsin diye.
ORTU_OPAK = 0.58     # perde — açılınca 0'a iniyor (geçiş css/galeri.css'te)
CAM_OPAK = (0.10, 0.07)   # geniş ve ince yansıma kaması

CERCEVE_DIS = "#2a2724"   # pervazın gövdesi
CERCEVE_UST = "#4a4642"   # ışık alan üst yüzey
CERCEVE_ALT = "#181614"   # alt yüzey
PLAKA       = "#f2efe9"   # künye levhası — duvardan bir basamak açık
PLAKA_YAZI  = "#8d8880"   # şeritteki iki çizgi: yazının işareti
# ⚠️ ODAK KARTININ METNİ İÇİN AYRI BİR RENK YOK ve olmamalı. Kart açılınca
# levha diye bir yüzey kalmıyor (bkz. §SAYFA/ODAK); yazı doğrudan perdenin
# üstünde ve rengi --gal-koni'den türüyor. Buraya bir "kart mürekkebi" sabiti
# konsaydı ışığı değişen bir sahnede etiket tek başına eski ışıkta kalırdı.

# YER TUTUCU ESER. Hiç dosya verilmezse çerçevenin içi düz yeşil kalıyor.
YESIL = "#3f6b4a"
ESER_YOLU = "assets/2026-09/akilli-kiz"

# ESERLER — hem çerçevenin içi hem KÜNYE LEVHASININ metni buradan geliyor.
# ⚠️ Değiştirmesi TEK yer burası; `tablo()` geometrisi eser değişince kımıldamıyor.
#
#   dosya   None → yer tutucu yeşil. "01.webp" gibi bir ad → ESER_YOLU altından.
#   ad      levhanın başlığı; boşsa levhada "Eser 01" görünür
#   alt     sanatçı / teknik / yıl satırı — tek satırlık künye
#   metin   levhanın gövdesi; sergi metni
#
# ════════════════════════════════════════════════════════════════════════════
# GERÇEK ÇİZİMLER GELDİ (2026-09-11) — burada eskiden duran iki uyarı da kalktı
# ────────────────────────────────────────────────────────────────────────────
# Bir dönem burada "① metinler yazıldı ama ② görseller yer tutucu" diye iki
# ayrı "henüz değil" yazılıydı. İkisi de aynı anda kapandı ve ikisi de AYNI
# SEBEPLE kapandı: on çizim geldi, masalın kendi metniyle birlikte.
#
# ⚠️ ESKİ METİNLER SİLİNDİ, DÜZELTİLMEDİ. Yazıldıkları gün masalın on durağı
# hiçbir kaynakta yazılı değildi ve sahneler bilinen düğümlerden KURGULANMIŞTI
# — külden ip, dokuz kıvrımlı boncuk, kütüğün kökü, ne giyinik ne çıplak. Gelen
# çizimlerde o sahnelerin hiçbiri yok; masal keseden çekilen taşta bitiyor.
# Yani o on metin "eskimiş" değildi, var olmayan on eseri anlatıyordu.
#
# ════════════════════════════════════════════════════════════════════════════
# ⚠️ AŞAĞIDAKİ METİNLER BİREBİR ALINTI — SERGİ YORUMU DEĞİL
# ────────────────────────────────────────────────────────────────────────────
# Kaynak: çizimlerle birlikte teslim edilen `akıllıKız.txt`, masalın Türkçe
# anlatımı. Dosyada on numaralı bölüm var ve sıra BİREBİR: `NN.webp` metnin
# NN. bölümü.
#
# Bir ara buraya masalı anlatan DEĞİL yorumlayan metinler yazılmıştı ("çizer
# ölçeği öne koyuyor", "kalpler kadrajın yalnız bir yanında"). Kullanıcı
# kararı: künye masalın kendisini taşıyacak, benim okumamı değil. Yani
# aşağıdaki dizeler ÜRETİLMEDİ, KOPYALANDI.
#
# ⚠️ DEĞİŞTİRİLMEDİLER — yazım dahil. 01'deki "bir tüccari" kaynakta öyle
# yazıyor. Düzeltmek "olduğu gibi" olmaktan çıkarırdı; düzeltilecekse önce
# `akıllıKız.txt`te düzeltilmeli, sonra buraya taşınmalı.
#
# ⚠️ 08/09/10'DA SATIR BAŞI VAR ve anlamlı: replikler kaynakta ayrı satırlarda.
# `\n`ler burada duruyor, ekrana çıkmalarını `css/galeri.css`teki
# `.galeri__kunye-metin { white-space: pre-line }` sağlıyor. O kural
# kaldırılırsa diyalog tek paragrafa yapışır.
#
# `ad` alanları alıntı DEĞİL, levha başlığı: kaynakta bölüm adı yok ve levhanın
# bir başlığa ihtiyacı var (boşsa "Eser 01" yazıyor).
#
# ⚠️ `alt` SATIRI DOĞRULANMADI. `CIZER` aşağıda ve `ms-acilis` sergiyi Ece
# Özgür'ün çizimleriyle diye tanıtıyor; gelen dosyaların gerçekten ona ait
# olduğu bana söylenmedi, varsayıldı. Başka birine aitse düzeltilecek TEK yer
# `CIZER` sabiti.
ESERLER = [
    {
        "dosya": "01.webp",
        "ad": "İşler Yolunda",
        "metin":
            "Eskiden hareketli bir kasabada bir tüccari, eşi ve tek kızıyla beraber "
            "çalışkanlıkla yaşarmış, işleri de iyi gidiyormuş."
    },
    {
        "dosya": "02.webp",
        "ad": "İlaç Kore'den Geliyor",
        "metin":
            "Ama on küsur yıl sonra kadın hastalanmış ve durumu gün geçtikçe "
            "kötüleşmiş. Doktorlar iyileşme umudu vermemiş, tek çare olarak Kore'den "
            "(Joseon) getirilen bir ilacı işaret etmişler."
    },
    {
        "dosya": "03.webp",
        "ad": "Para Yanıyor",
        "metin":
            "Adam, karısına olan sevgisinden hiç durmadan bu pahalı ilacı almış; "
            "birikimleri bitince borç almaya başlamış."
    },
    {
        "dosya": "04.webp",
        "ad": "Geriye Borç Kaldı",
        "metin":
            "Ne yazık ki ilaç işe yaramamış ve kadın vefat etmiş. Tüccara kalan tek şey "
            "dağ gibi bir borçmuş. Adam yasa boğulup hiçbir şey yapamaz haldeyken, tek "
            "kızı babasını çok merak etmeye başlamış."
    },
    {
        "dosya": "05.webp",
        "ad": "Alacağımı Tahsile Geldim",
        "metin":
            "Derken tefeci gelmiş: \"Alacağımı tahsile geldim. Ödeyemezseniz dava açarım "
            "— ama ben o kadar kalpsiz biri değilim. Kızınızı bana verin, borcunuzu "
            "sileyim.\" demiş, hiç tereddüt etmeden."
    },
    {
        "dosya": "06.webp",
        "ad": "İkinci Teklif",
        "metin":
            "Aslında tefeci uzun zamandır kıza ilgi duyuyormuş, aralarındaki büyük yaş "
            "farkına rağmen bir kez evlenme teklif etmiş ama reddedilmiş. Ne baba ne de "
            "kız bu ikinci teklife sevinmiş, ama ödeyecek para olmadığından tüccar "
            "kendi çaresizliğine üzülmüş; yapabildiği tek şey ödeme süresini biraz "
            "uzatmasını rica etmekmiş."
    },
    {
        "dosya": "07.webp",
        "ad": "Bahis",
        "metin":
            "Birkaç gün sonra tefeci yine gelmiş ve kıza şöyle demiş: \"İlginç bir bahse "
            "ne dersin? Babanın şu an borcu ödeyecek parası yok, ama bu bahis onu "
            "kurtarabilir. Şu boş kesenin içine iki taş koyacağım — biri beyaz, biri "
            "siyah. Elini kesenin içine sokup bir taş çekeceksin. Siyah çıkarsa benimle "
            "evleneceksin ve babanın borcu silinecek. Beyaz çıkarsa hem evlilik hem "
            "borç iptal olacak. Ne olursa olsun baban için avantajlı. Bu bahsi kabul "
            "etmezsen baban hapse girer, bilesin.\""
    },
    {
        "dosya": "08.webp",
        "ad": "Taş Elimden Düştü",
        "metin":
            "Kızın başka çaresi kalmamış, istemeye istemeye bahsi kabul etmiş. Tüccarın "
            "bahçesinde bol miktarda beyaz ve siyah küçük taş varmış; tefeci bunlardan "
            "iki tane toplayıp kesenin içine koymuş."
            "\n"
            "\"Hadi, bir tane çek.\" demiş tefeci."
            "\n"
            "Kız kararlılıkla elini kesenin içine sokmuş ama dikkatsizce taşı elinden "
            "düşürmüş. Taş yuvarlanıp diğer taşların arasına karışmış."
    },
    {
        "dosya": "09.webp",
        "ad": "Kesedeki Taşın Rengi",
        "metin":
            "\"Aman, aman! Özür dilerim. Ne kadar sakarım! Taşın rengine bakmaya bile "
            "fırsat bulamadım.\" demiş kız, eğilip beyaz bir taş almış."
            "\n"
            "\"İşte bu.\" demiş — oysa yerdeki taşların hepsi birbirine benziyormuş, "
            "hangisinin düşen taş olduğu belli değilmiş."
            "\n"
            "Tefeci öfkeyle kıpkırmızı kesilip bağırmış: \"Öyle olamaz! Siyahtı!\""
            "\n"
            "Kız da sesini yükseltmiş: \"O kadar emin olduğunuza göre, kesenin içine "
            "bakarsak hangi renk taşın kaldığı belli olur. Benim çektiğim onun tam "
            "tersi renk olmalı.\""
            "\n"
            "Aslında tefeci, kızın çektiği taşın siyah olduğunu biliyormuş — çünkü "
            "keseye kasten iki siyah taş koymuşmuş. Ama bunu itiraf edemeyeceğinden, "
            "istemeyerek kesede kalan taşın siyah, kızın çektiğinin de beyaz olduğunu "
            "kabul etmek zorunda kalmış."
    },
    {
        "dosya": "10.webp",
        "ad": "Borç Silindi",
        "metin":
            "\"Bu kız gerçekten becerikliymiş.\" (diye düşünmüş tefeci.)"
            "\n"
            "Söz verdiği için tefeci kızla evlenmekten vazgeçmiş ve tüccarın borcunu da "
            "silmiş."
    },
]

# Sergiyi ms-acilis tanıtıyor ve çizeri orada adı geçen kişi: tek sanatçının
# tek serisi olduğu için `alt` satırı ondan türetiliyor, on kez elle yazılmıyor.
CIZER = "Ece Özgür · dijital çizim, 2026"
for _e in ESERLER:
    _e.setdefault("alt", CIZER)

assert len(ESERLER) == N, f"{len(ESERLER)} künye var, {N} durak"

# ÇERÇEVE ÖLÇÜLERİ
# ---------------------------------------------------------------------------
# ⚠️ BU SAYIYA ÖZEL. 2026-09'un eserlerinin hepsi 828×554 piksel ve hepsi aynı
# boyda isteniyor. Bir sonraki sayıda eserler yine karışık boydaysa geri alma
# yolu tek satır: aşağıdaki `CERCEVELER` atamasını silip yorumdaki eski listeyi
# açmak yeter — sayfanın geri kalanı çerçeve boyunu HAZIR BULUNAN değer olarak
# okuyor, hiçbir yerde 828/554 ikinci kez yazılı değil.
#
# Bedeli biliniyor: referansta altı AYRI boy var ve koridoru duvar kâğıdı
# olmaktan kurtaran şey o boy farkıydı. Karşılığında her eser kırpılmadan ve
# eşit ağırlıkta giriyor — sergi bir "eser dizisi" oluyor.
ESER_PIKSEL = (828, 554)   # bu sayıdaki eser dosyalarının piksel boyutu
PERVAZ = 8                 # pervaz kalınlığı — referansta çerçeveler İNCE

# ⚠️ GENİŞLİK ADIM'DAN (235) DAR OLMAK ZORUNDA, yoksa komşu çerçeveler çakışır.
# 205'te iki komşu arasında 30 birim duvar kalıyor; eski listenin en genişi de
# 205'ti, yani eserler öncekinden dar değil, yalnız hepsi o genişlikte.
CERCEVE_EN = 205

_ic_en = CERCEVE_EN - 2 * PERVAZ
_ic_boy = _ic_en * ESER_PIKSEL[1] / ESER_PIKSEL[0]
CERCEVELER = [(CERCEVE_EN, _ic_boy + 2 * PERVAZ)] * N

# ESKİ, DEĞİŞKEN BOYLAR — merkezleri ASKI_HAT'ta ortaktı, boylar 120–205 arası
# geziniyordu (referansta ölçülen oranlar 1.24–2.28). Yukarıdaki üç satırın
# yerine bunu açmak eski hâle döndürüyor:
# CERCEVELER = [
#     (168, 205), (124, 128), (205, 150), (140, 142), (152, 190),
#     (196, 132), (132, 176), (180, 126), (120, 160), (205, 145),
# ]


def dikd(x, y, w, h, dolgu, opak=None, sinif=None):
    o = f' opacity="{opak}"' if opak is not None else ""
    s = f' class="{sinif}"' if sinif is not None else ""
    return f'<rect{s} x="{x:g}" y="{y:g}" width="{w:g}" height="{h:g}" fill="{dolgu}"{o}></rect>'


def yol(*noktalar):
    """Köşe listesini kapalı bir SVG yoluna çevirir."""
    x, y = noktalar[0]
    d = f"M{x:g} {y:g}"
    for x, y in noktalar[1:]:
        d += f" L{x:g} {y:g}"
    return d + " Z"


# ═══════════════════════════════════════════════════════════════════════════
# TEKRAR EDEN PARÇALAR
# ═══════════════════════════════════════════════════════════════════════════

def spot(c):
    """
    Raydan sarkan spot gövdesi: kutu + ağız. Koniden SONRA çiziliyor, böylece
    koninin sivri tepesini örtüyor — gerçekte de ışık lambanın içinden değil
    ağzından çıkıyor.
    """
    return (f'    {dikd(c - 13, RAY_ALT, 26, 20, RAY)}\n'
            f'    {dikd(c - 10, RAY_ALT + 20, 20, 3, KONI)}\n')


def koni(c):
    """
    Havada görünen ışık hüzmesi: tepesi spotun ağzında, aşağı doğru açılan tek
    üçgen. Yarı-genişlik her yükseklikte KONI_EGIM × (y − tepe).

    ⚠️ SAYININ TEK DEGRADE'İ VE BİLEREK ÖYLE.

    `visual_design.md` §3 form içinde degradeyi yasaklıyor ve komşu sayfa
    (`ms-acilis`) kapının ışığını üç basamakla anlatıyor. Burada önce dört
    basamak denendi; ölçüm basamakların GÖRÜNDÜĞÜNÜ söyledi: eksen parlaklığı
    referansta 0.16→0.28 yüksekliklerinde +24, +20, +15, +10 diye düzgün
    inerken basamaklı sürümde +17.7, +17.7, +10.7, +10.7 çıkıyordu — yani
    ardışık iki ölçüm aynı, sonra sıçrama. Sahnedeki en göze batan kusur oydu.

    Kural esnetiliyor çünkü §3'ün konusu YÜZEY: bir formun üstündeki ışık
    düşüşü fasetlerle anlatılır. Bu ise havadaki sis — bir yüzeyi değil hacmi
    boyuyor ve doğada da basamağı yok. `ms-acilis`in kapı ışığı DUVARA ve
    ZEMİNE düşen ışıktır, yani yüzey; orada basamak doğru, burada değil.
    §3'ün kendi istisnası da bunu destekliyor: "yalnız sahne geneli vinyet ve
    gren süreklidir."

    ⚠️ ÇERÇEVELERDEN ÖNCE ÇİZİLİYOR. Üstlerine binseydi eserlerin üstünde soluk
    bir sis kalırdı; ışık duvarı aydınlatır, eseri örtmez. Zaten ölçüme göre
    koni ~%35'te sönüyor, yani eserlerin üst kenarına bile inmiyor.
    """
    ya = KONI_EGIM * (KONI_DIP - KONI_UST)
    return (f'    <path d="{yol((c, KONI_UST), (c + ya, KONI_DIP), (c - ya, KONI_DIP))}"'
            f' fill="url(#ms-koni)"></path>\n')


def zemin_isigi(c):
    """
    Hüzmenin zemindeki devamı: cilalı zemine düşen ışık gölü.

    ⚠️ GENİŞ VE YUMUŞAK. İlk sürümde dar ve keskin kenarlıydı; zeminde yukarı
    bakan üçgen kamalar gibi duruyordu. Referansın zemininde keskin kenarlı
    hiçbir şey yok — ölçülen yatay değişkenlik oradaki figür akislerinden
    geliyor, geometriden değil.
    """
    return (f'    <path d="{yol((c - 150, ZEMIN_UST), (c + 150, ZEMIN_UST), (c + 205, H), (c - 205, H))}"'
            f' fill="{ZEMIN_ISIK}" opacity="0.55"></path>\n')


def kutu(i, c=KAMERA / 2):
    """
    Durak i'nin çerçeve, eser ve künye kutuları. `c` verilmezse DURAK
    ORTALANMIŞ kabul ediliyor, yani sonuç doğrudan kameranın koordinatları.

    ⚠️ TEK KAYNAK OLMASI ŞART. Şeridin içindeki çerçeveyi bu çiziyor, üstteki
    görünmez hedef düğmesini de bu konumlandırıyor (bkz. §HEDEF). İki ayrı yerde
    hesaplansaydı düğme çerçevenin birkaç birim yanına düşerdi ve bu kusur
    GÖRÜNMEZDİ: tıklama yine çalışır, yalnız kenarında ölü bir şerit kalırdı.
    """
    gen, yuk = CERCEVELER[i % len(CERCEVELER)]
    L, T = c - gen / 2, ASKI_HAT - yuk / 2
    return {
        "cerceve": (L, T, gen, yuk),
        "ic": (L + PERVAZ, T + PERVAZ, gen - 2 * PERVAZ, yuk - 2 * PERVAZ),
        "kunye": (L, PLAKA_UST, 42, 24),
    }


def cam(x, y, w, h):
    """
    Açılmamış eserin üstündeki cam yansıması: iki eğik, DÜZ kama.

    Perdeyle birlikte çalışıyor — perde tek başına "karanlık", perde + yansıma
    "camın ardında". Kenarları keskin ve içleri düz: `visual_design.md` §1/§3
    (kontur yok, form içinde degrade yok). Kamalar eserin dışına taşmıyor,
    yatay yerleri oranla verildiği için çerçeve boyu değişse de taşmaz.
    """
    def kama(ust, kalinlik, opak):
        egim = 0.28 * w          # tepeden dibe kayma
        u = x + ust * w
        return (f'      <path class="galeri__cam" d="'
                f'{yol((u, y), (u + kalinlik * w, y), (u + kalinlik * w - egim, y + h), (u - egim, y + h))}"'
                f' fill="{KONI}" opacity="{opak}"></path>\n')

    return kama(0.30, 0.22, CAM_OPAK[0]) + kama(0.60, 0.07, CAM_OPAK[1])


def tablo(c, i):
    """
    Çerçeveli eser + künyesi, tek grup hâlinde. Pervaz dört eğik yüzey: üst en
    açık, alt en koyu — tek anahtar ışık yukarıdan.

    ⚠️ ALTTAKİ KOYU DİKDÖRTGEN, eser bir görsele dönüşünce de duruyor. Görsel
    404 verirse ya da ağ kesikken inemezse çerçevenin içi DELİK kalır ve kamera
    oradan duvarı değil şeridin arkasını gösterir; koyu yüzey o durumda "boş
    çerçeve" olarak okunuyor.

    ⚠️ KÜNYE LEVHASI BU GRUBUN İÇİNDE. Ayrı çizilebilirdi ama okur için tek
    nesne: tıklanınca ikisi birlikte açılıyor, "görüldü" damgası ikisine
    birden vuruluyor. DOM'da da tek düğüm olması bunu kendiliğinden sağlıyor.

    Levhanın üstündeki iki çizgi yazı değil yazının İŞARETİ — bu ölçekte gerçek
    metin okunmaz, okunmayan metin de gürültüdür. Gerçek metin odak kartında.
    """
    k = kutu(i, c)
    (L, T, gen, yuk) = k["cerceve"]
    (ix, iy, ien, iboy) = k["ic"]
    (kx, ky, ken, kboy) = k["kunye"]
    R, B, p = L + gen, T + yuk, PERVAZ

    s = (f'    <g class="galeri__tablo" data-eser="{i}" data-gorulen="false">\n'
         f'      {dikd(L, T, gen, yuk, CERCEVE_DIS)}\n'
         f'      <path d="{yol((L, T), (R, T), (R - p, T + p), (L + p, T + p))}" fill="{CERCEVE_UST}"></path>\n'
         f'      <path d="{yol((L, B), (R, B), (R - p, B - p), (L + p, B - p))}" fill="{CERCEVE_ALT}"></path>\n'
         f'      {dikd(ix, iy, ien, iboy, "#0f0d0c")}\n')

    dosya = ESERLER[i % len(ESERLER)]["dosya"]
    if dosya is None:
        s += f'      {dikd(ix, iy, ien, iboy, YESIL)}\n'
    else:
        # ⚠️ `slice` KIRPAR — çerçeve zaten ESER_PIKSEL oranında olduğu için
        # kırpacak bir şey yok. Dosya beklenenden başka oranda gelirse kırpma
        # boşluk bırakmaktan iyi: boşluk arkadaki koyu yüzeyi gösterir ve
        # "eser eksik" gibi okunur.
        s += (f'      <image href="{ESER_YOLU}/{dosya}"'
              f' x="{ix:g}" y="{iy:g}" width="{ien:g}" height="{iboy:g}"'
              f' preserveAspectRatio="xMidYMid slice"></image>\n')

    s += (f'      {dikd(ix, iy, ien, iboy, ORTU, ORTU_OPAK, "galeri__perde")}\n'
          + cam(ix, iy, ien, iboy)
          + f'      {dikd(kx, ky, ken, kboy, PLAKA)}\n'
            f'      {dikd(kx + 6, ky + 7, 30, 3, PLAKA_YAZI)}\n'
            f'      {dikd(kx + 6, ky + 13, 20, 3, PLAKA_YAZI)}\n'
            '    </g>\n')
    return s


# ═══════════════════════════════════════════════════════════════════════════
# NESNELER — ziyaretçiler ve bank
# ---------------------------------------------------------------------------
# Sprite'lar referans görselden kesilip vektöre çevrildi; `spritelar.py`
# ÜRETİLMİŞ dosya, kaynağı `referans/araclar/vektor.py`. Burada duruyor çünkü
# `referans/` silinince sayının aynen çalışması gerekiyor.
#
# Yerleştirme kuralı: bir nesnenin görünen boyu ayağının UFUK'a uzaklığıyla
# orantılı. Ufuk = ASKI_HAT: müzelerde eserin merkezi göz hizasına asılır, ve
# ölçülen ortak asma hattı bu. Bu kural olmadan duvarın dibindeki figür odanın
# ortasındakiyle aynı boyda çizilir ve derinlik çöker.
#
# ⚠️ TEK BİR "YETİŞKİN KAÇ BİRİM" SABİTİ YOK, ve önceki hâlindeki 210 birim
# ölçümle tutmuyordu: referanstaki üç ayakta figür ayak hattı ~687'de 307/327/335
# birim, yani o sabit gerçeği 1.7 kat küçültüyordu. Artık her sprite kendi
# ölçülen (birim, ayak) ikilisini taşıyor ve ölçek ondan türüyor:
#
#     boy(ayak2) = birim × (ayak2 − ASKI_HAT) / (ayak − ASKI_HAT)
#
# Böylece oturan adam+bank da, %9 boy farkı olan üç ziyaretçi de aynı formülle
# yerleşiyor; birini "ortalama yetişkin"e zorlamak gerekmiyor.
#
# İki ölçülen hiza: esere bakanlar DUVAR_DIBI'nde, öndeki koridor ODA_ORTASI'nda.
# ═══════════════════════════════════════════════════════════════════════════

DUVAR_DIBI = 687   # ölçülen — referanstaki üç ayakta ziyaretçinin ayak hattı
ODA_ORTASI = 731   # ölçülen — bankın ön ayaklarının değdiği hat

# Kalabalık. Sırası önemsiz: derinliğe göre sıralanıp çiziliyor.
#
# ⚠️ X'LER DURAK MERKEZLERİNDEN YARIM ADIM KAYIK (merkezler 300 + i·235).
# Figürler eserlerin tam önüne değil ARALARINA duruyor; kadrajda ikisinin de
# kenarını kesiyorlar, hiçbirini gömmüyorlar. Referansta da öyle: çift iki
# çerçevenin arasında duruyor.
NESNELER = [
    ("cantali",    182, 690),
    ("bank-adam",  530, 731),   # referanstaki hizası; üstü eserlerin altında kalıyor
    ("paltolu",    887, 702),
    ("cift",      1122, 688),
    ("cantali",   1592, 668),   # daha uzakta, daha küçük
    ("paltolu",   1827, 744),   # kameraya yakın, en büyük
    ("cift",      2297, 694),
]

# Gölge. ÖLÇÜLEN, tahmin değil: referansta ayak dibinde zemin temiz zeminin
# %72'si, uzakta %82'si kadar parlak → siyahın opaklığı 0.28'den 0.17'ye
# düşüyor. Gölge kadrajın DİBİNE kadar gidiyor, sönmüyor.
#
# ⚠️ AKİS DEĞİL GÖLGE. Plan "zemine akis" diyordu; ölçüm çürüttü. Cilalı zemin
# figürü aynalamıyor, ışık figürün önüne gölgesini düşürüyor: karanlık şerit
# ayakların altından başlayıp izleyiciye doğru uzuyor ve bacak arası kapanarak
# tek kütleye dönüşüyor. Aynalanmış bir kopya çizilseydi baş aşağı bir insan
# görünürdü, referansta öyle bir şey yok.
#
# ⚠️ DEĞERLER DEGRADENİN OPAKLIĞI DEĞİL, ÖLÇÜLEN SONUCUN GERİ ÇÖZÜMÜ. Zeminde
# ışık gölleri var, gölge de onların üstüne biniyor: 0.28 yazınca ekranda 0.743
# oranı çıktı (hedef 0.724), 0.31 yazınca 0.710. İkisinin arasından çözüldü.
# Değiştirilecekse üretilen şerit yeniden ölçülmeli, sayı tahmin edilmemeli.
GOLGE_DURAK = [(0.0, 0.30), (0.2, 0.215), (1.0, 0.185)]
GOLGE_ACIKLIK = 1.15   # gölge dipte temas izinden bu kadar geniş


def olcek(ad, ayak):
    """Sprite'ı yerel pikselden sahne birimine çeviren çarpan."""
    s = SPRITE[ad]
    return s["birim"] * (ayak - ASKI_HAT) / (s["ayak"] - ASKI_HAT) / s["boy"]


# ═══════════════════════════════════════════════════════════════════════════
# KONUŞMALAR — ziyaretçilerin balonları
# ---------------------------------------------------------------------------
# ⚠️ SIRA `NESNELER` İLE AYNI OLMAK ZORUNDA; `assert` aşağıda bekçilik ediyor.
#
# Her figür ÜÇ söz taşıyor (② hariç, bkz. aşağısı) ve sırayla açılıyorlar:
# dokun → birinci, tekrar dokun → ikinci, tekrar → üçüncü, sonra başa dönüyor.
# Balon kendi kendine kapanıyor; kalan süre kutunun içinde sağdan sola akan bir
# şeritle görünüyor.
#
# ════════════════════════════════════════════════════════════════════════════
# ⚠️ BU TABLO BİR DÖNEM ÜRETİLEN SAYFAYLA AYRIŞMIŞTI — 2026-09-11'de birleşti
# ────────────────────────────────────────────────────────────────────────────
# Öğretici sözler ve ②'nin susturulması doğrudan `sayfa.html`e elle yazılmış,
# buraya geri işlenmemişti. Yani jeneratörü çalıştırmak sayfayı düzeltmiyor,
# BOZUYORDU: öğretici balonlar silinir, susturulan iki söz geri gelirdi.
# Fark yalnızca yeniden üretip diff almakla görüldü — sayfaya bakarak değil.
#
# Ders, bu dosyanın başka yerlerinde de yazılı olanın aynısı: üretilen dosya
# düzenlenmez. Elle bir değişiklik gerekiyorsa yeri BURASI.
# ════════════════════════════════════════════════════════════════════════════
#
# `gizli` NORMALDE ERİŞİLEMEZ — yalnız konami dizisi girilince, yedi figür
# birden onu söylüyor (bkz. js/galeri.js §KONAMİ).
#
# ⚠️ `cift` TEK SPRITE AMA İKİ KİŞİ (bkz. DURUM.md §kütüphane). Ayrı ayrı
# tıklanabilir yapılmadılar: vektörde de ayrılamıyorlar ve zaten daha iyisi
# çıkıyor — üç söz iki kişi arasında GİDİP GELİYOR, yani sıra mekanizması
# diyalog oluyor. Konuşan değişince satır "— " ile başlıyor.
# ═══════════════════════════════════════════════════════════════════════════

KONUSMALAR = [
    # ① cantali @182 — duraklar 0-1, "İşler Yolunda" ve "İlaç Kore'den Geliyor"
    #
    # ⚠️ İLK İKİ SÖZ ÖĞRETİCİ VE SERGİ METNİ DEĞİL — dokunmadan, sergiye varılır
    # varılmaz kendiliğinden oynuyorlar. `js/galeri.js` §ÖĞRETİCİ ilk
    # `OGRETICI_SOZ_ADEDI = 2` sözü alıyor, yani bu iki satır SAYIYLA bağlı:
    # araya bir gözlem sıkıştırılırsa okur karşılama yerine künye yorumu duyar.
    # Gezinmeyi anlatan başka hiçbir işaret yok, o yüzden yeri burası.
    #
    # Çakıl zemini gözlemi bilerek buraya konmadı — üç yuva da dolu. Yeri
    # eserin kendi künyesi (§ESERLER 01) ve orada duruyor.
    ["Galeri de gezinmek için sağa-sola kaydır.",
     "Eserlere detaylı bakmak için tabloya tıkla. ",
     "Bir sergiye baştan başlamak diye bir şey var mı gerçekten? İstediğim "
     "yerden başlarım yani."],

    # ② bank-adam @530 — telefonlu adam. Serinin ana şakası burada.
    #
    # ⚠️ TEK SÖZ, BİLEREK. Şaka tek satırda duruyor; devamı susturuldu.
    # Susturulan ikisi kaybolmasın diye burada:
    #     "Kaydırıyorum ama duvara doğru değil. Aralarında fark var mı, emin
    #      değilim."
    #     "Doomreader'da okumuştum galiba. Ya da Doomreader'ı okurken burayı
    #      açtım. Aynı kapıya çıkıyor."
    # `gizli` de boş: konami ödülünde bu figür susuyor. `galeri.js` §KONAMİ
    # boş sözü atlıyor (`if (!gizli) return`), yani bu güvenli bir sessizlik.
    ["Yaa. Bunu zaten görmüştüm, akışımda çıkmıştı."],

    # ③ paltolu @887 — duraklar 2-3, "Para Yanıyor" ve "Geriye Borç Kaldı".
    # ⚠️ MASALIN ÇEKİRDEĞİ. Çizimler değişti, bu üç söz değişmedi: anlattıkları
    # düğüm masalın kendisinde duruyor ve sekizinci çerçevede aynen çizili.
    ["Şu taş meselesi: kız ak taşı çekiyor ve borç siliniyor, değil mi?",
     "Yok, dur. Çektiği taşı düşürüyor. Ama niye düşürsün, elinde tutsa da olurdu.",
     "…Ha. İkisi de karaymış. Şimdi anladım. Yirmi dakikadır buradayım."],

    # ④ cift @1122 — duraklar 3-4, "Geriye Borç Kaldı". Üç söz, iki ağız.
    ["Bu kare neden renksiz? Yanındakilerin hepsinde gökyüzü var.",
     "— Bir şey eksik olduğu için değil. Alındığı için.",
     "— …Tamam. Haklısın."],

    # ⑤ cantali @1592 — duraklar 5-6, "İkinci Teklif" ve "Bahis".
    # Künyeyi okuyana ödül: ikinci söz §ESERLER 06'daki CÜMLEYE dayanıyor
    # ("bir kez evlenme teklif etmiş ama reddedilmiş").
    #
    # ⚠️ ESKİ HÂLİ "Künyede yazıyormuş zaten" DİYORDU ve künyeler masalın
    # birebir metnine dönünce o cümle yalan oldu — levhada artık sergi yorumu
    # değil masalın kendisi var. Balonlar künyeden alıntı yapacaksa levhada
    # GERÇEKTEN yazan bir şeyi göstermeli.
    ["Kalpler hep aynı tarafta. Kızın durduğu yanda bir tane bile yok.",
     "Levhayı okudum: adam onu çoktan bir kez istemiş, kız reddetmiş.",
     "Yani buradaki tek yeni şey kalpler değil. Cevabın hâlâ aynı olması."],

    # ⑥ paltolu @1827 — duraklar 6-7, "Bahis" ve "Taş Elimden Düştü"
    ["Buradaki zemin, figürün üzerinde yürüdüğü malzemeyle kurduğu araçsal "
     "ilişki bakımından—",
     "Yani adam taşların üstünde yürüyor.",
     "Ama yürüyüşün ontolojisi—"],

    # ⑦ cift @2297 — duraklar 8-9, "Borç Silindi". Sonun rahatsızlığı.
    ["Sonu güzelmiş. Bak, ikisi de gülüyor.",
     "— Kız da hile yaptı ama.",
     "— …Adamın hilesini ona geri verdi. Aynı şey mi?"],
]

# Konami ödülü: yedi figür aynı anda konuşuyor.
GIZLI_SOZLER = [
    "Sen de mi baştan başladın? Kimse baştan başlamıyor.",
    "",  # ⚠️ bank-adam susuyor — gerekçe §KONUŞMALAR ②

    "Hâlâ taşları düşünüyorum. Sen git, ben yetişirim.",
    "— Sen hep haklı çıkıyorsun. — Biliyorum.",
    "Ya da tefeci gerçekten âşıktı. İki ihtimal de doğru olabilir.",
    "Kimseye söyleme: taşın neden düşürüldüğünü ben de bugün anladım.",
    "— Künyede de öyle yazıyor. — Okumuşsun demek. — Sen okumadın mı?",
]

assert len(KONUSMALAR) == len(NESNELER), "konuşma sayısı figür sayısıyla tutmuyor"
assert len(GIZLI_SOZLER) == len(NESNELER), "gizli söz sayısı figür sayısıyla tutmuyor"


def balon_verisi():
    """
    Her figür için: baş hizası (ŞERİT yüzdesi) + sözleri.

    ⚠️ KONUM `nesne()`DEN TÜRETİLİYOR, elle yazılmıyor. Sprite'ın tepesi
    `ayak - boy*olcek`, yatay merkezi de `x`; ikisi de figürü çizen satırın
    ta kendisinden geliyor, yani figür kımıldarsa balon da kımıldıyor.

    Yüzdeler KAMERANIN değil ŞERİDİN: katman şeritle aynı genişlikte ve aynı
    dönüşümü alıyor, yani kaydırmada beraber gidiyorlar.
    """
    import json
    kayit = []
    for (ad, x, ayak), sozler, gizli in zip(NESNELER, KONUSMALAR, GIZLI_SOZLER):
        tepe = ayak - SPRITE[ad]["boy"] * olcek(ad, ayak)

        # Figürü kadrajın ORTASINA getiren durak konumu. Kamera i. durakta
        # [i·ADIM, i·ADIM+KAMERA] aralığını gösteriyor; ortası i·ADIM+KAMERA/2.
        # Kesirli olması normal — serbest kayışta `--durak` zaten kesirli.
        #
        # ⚠️ UÇLARDAKİ FİGÜRLER ORTALANAMAZ ve bu bir kusur değil: koridorun
        # başından öncesi yok. `git()` 0..N-1'e kırpıyor, figür kadrajın
        # ortasına değil kenarına yakın kalıyor. Balon yine sığıyor —
        # ölçüldü, en kötü hâlde figür kadrajın %30'unda ve balon 34cqi.
        merkez = (x - KAMERA / 2) / ADIM

        kayit.append({
            "ad": ad,
            "sol": round(x / W * 100, 3),
            "ust": round(tepe / H * 100, 3),
            "merkez": round(max(0, min(N - 1, merkez)), 4),
            "sozler": sozler,
            "gizli": gizli,
        })
    return json.dumps(kayit, ensure_ascii=False, separators=(",", ":")).replace("<", "\\u003c")


def balonlar():
    """Konuşma katmanı: dokunma hedefi FİGÜRÜN KENDİSİ.

    ⚠️ HEDEF BAŞIN ÜSTÜNDEKİ NOKTA DEĞİL. Önce öyleydi; nokta mobilde
    dokunulamayacak kadar küçük bir hedefti (2.4cqi, dar ekranda ~8px).
    Şimdi düğme sprite'ın TAMAMINI kaplıyor — en küçüğü bile parmak boyunun
    kat kat üstünde — nokta ise `pointer-events: none` bir İŞARET.

    İşaret kalmak zorunda: figürün konuşabildiğini söyleyen başka hiçbir şey
    yok ve dokunmatikte imleç diye bir ipucu da yok.

    Kutu js tarafından dolduruluyor (söz sırası orada); burada yalnız YER ve
    erişilebilirlik kabuğu üretiliyor.
    """
    # ⚠️ HİÇBİR FİGÜR DÜĞMESİ ESER HATTININ ÜSTÜNE ÇIKMIYOR (kullanıcı kararı,
    # 2026-09-07). `hedef` eserin çerçevesini VE künye levhasını kaplıyor;
    # balon düğmeleri ondan yüksekte (z-index 5 > 4) durduğu için levhaya
    # dokunmak eseri değil ziyaretçiyi konuşturuyordu.
    #
    # Çözüm z-index takasıyla değil GEOMETRİYLE: düğme levhanın dibinden
    # başlıyor, yani iki hedef hiç örtüşmüyor. z-index takası yetmezdi —
    # o zaman da figürün gövdesi eserin altında kalırdı.
    #
    # Kesme hattı `kutu()`dan okunuyor, elle yazılmıyor. Bu sayıda bütün
    # çerçeveler eş boyda, yani hat bütün duraklarda aynı; `assert` bekçi.
    _, _, _, _kb_bir = kutu(0)["kunye"]
    _, _ky_bir, _, _ = kutu(0)["kunye"]
    kesme = _ky_bir + _kb_bir          # levhanın dibi = hedefin dibi
    for i in range(1, N):
        _, _ky, _, _kb = kutu(i)["kunye"]
        assert abs((_ky + _kb) - kesme) < 0.01, "levha dibi duraklar arasında değişiyor"

    s = ""
    for i, (ad, x, ayak) in enumerate(NESNELER):
        o = olcek(ad, ayak)
        en, boy = SPRITE[ad]["en"] * o, SPRITE[ad]["boy"] * o
        tepe = ayak - boy

        # Düğmenin figür kutusunun kaçta kaçından SONRA başladığı. Figür zaten
        # hattın altındaysa 0 — kimse kırpılmıyor.
        kes = max(0.0, min(0.92, (kesme - tepe) / boy))

        s += (f'    <div class="galeri__balon" data-figur="{i}" data-acik="false"\n'
              f'         style="--balon-sol: {round((x - en / 2) / W * 100, 3)}%;'
              f' --balon-ust: {round(tepe / H * 100, 3)}%;'
              f' --balon-en: {round(en / W * 100, 3)}%;'
              f' --balon-boy: {round(boy / H * 100, 3)}%;'
              f' --balon-kes: {round(kes * 100, 3)}%">\n'
              f'      <button class="galeri__balon-dugme" type="button"\n'
              f'              aria-expanded="false" aria-controls="ms-balon-{i}"\n'
              f'              aria-label="Ziyaretçi {i + 1} ne diyor?">\n'
              # ⚠️ Nokta düğmenin İÇİNDE. Kardeşi olduğu sürede düğmenin
              # dışına düşüyordu ve ona dokunmak eseri açıyordu.
              f'        <span class="galeri__balon-nokta" aria-hidden="true"></span>\n'
              f'      </button>\n'
              f'      <div class="galeri__balon-kutu" id="ms-balon-{i}" role="status" hidden>\n'
              f'        <span class="galeri__balon-sure" aria-hidden="true"></span>\n'
              f'        <p class="galeri__balon-metin"></p>\n'
              f'      </div>\n'
              f'    </div>\n')
    return s


def sprite_tanimlari():
    """Kullanılan her sprite bir kez tanımlanıyor, sonra `use` ile çoğaltılıyor.
       Aynı figür farklı derinliklerde tekrar ediyor; yol verisi tek kopya."""
    s = []
    for ad in dict.fromkeys(n[0] for n in NESNELER):
        v = SPRITE[ad]
        s.append(f'      <g id="ms-fig-{ad}">\n')
        for renk, d in v["yollar"]:
            # ⚠️ evenodd ŞART: yollarda delik var (bankın bacak arası, ve
            # temizlikte taban siluetinden çıkarılan tablo parçaları).
            s.append(f'        <path d="{d}" fill="{renk}"'
                     f' fill-rule="evenodd"></path>\n')
        s.append('      </g>\n')
    return "".join(s)


def golge_tanimi():
    """Bütün gölgelerin paylaştığı degrade. `objectBoundingBox` (varsayılan)
       birimler: her gölge kendi boyuna göre ölçekleniyor, tek tanım yetiyor."""
    s = '      <linearGradient id="ms-golge" x1="0" y1="0" x2="0" y2="1">\n'
    for konum, opak in GOLGE_DURAK:
        s += (f'        <stop offset="{konum}" stop-color="#000000"'
              f' stop-opacity="{opak}"></stop>\n')
    return s + '      </linearGradient>\n'


def golge(ad, x, ayak):
    """Ayak izinden kadrajın dibine uzanan yamuk."""
    o = olcek(ad, ayak)
    t0, t1 = SPRITE[ad]["temas"]
    sol = x + (t0 - SPRITE[ad]["en"] / 2) * o
    sag = x + (t1 - SPRITE[ad]["en"] / 2) * o
    orta, yari = (sol + sag) / 2, (sag - sol) / 2 * GOLGE_ACIKLIK
    return (f'    <path d="{yol((sol, ayak), (sag, ayak), (orta + yari, H), (orta - yari, H))}"'
            f' fill="url(#ms-golge)"></path>\n')


def nesne(ad, x, ayak):
    o = olcek(ad, ayak)
    v = SPRITE[ad]
    return (f'    <use href="#ms-fig-{ad}"'
            f' transform="translate({x - v["en"] * o / 2:.1f} {ayak - v["boy"] * o:.1f})'
            f' scale({o:.4f})"></use>\n')


# ═══════════════════════════════════════════════════════════════════════════
# ŞERİT
# ═══════════════════════════════════════════════════════════════════════════

# Koninin sönüm eğrisi. Ölçülen eksen parlaklıkları duvarın üstünde +24 → +20.7
# → +16 → +12 → +6.7 → +4.7 idi; koni (#fdf8ec) ile duvar (#c0b7aa) parlaklıkları
# arasındaki 64 birimlik farka bölününce opaklık çıkıyor. Tepedeki değer (0.47)
# ilk iki ölçümün eğiminden apeks'e geriye çözüldü — orada ölçüm yok, çünkü
# spot gövdesi koninin ilk birkaç birimini zaten örtüyor.
KONI_DURAK = [(74, 0.47), (127, 0.375), (157, 0.32), (187, 0.25),
              (217, 0.19), (246, 0.105), (280, 0.05)]


def koni_tanimi():
    """Bütün konilerin paylaştığı tek degrade. `userSpaceOnUse` şart: koniler
       şerit boyunca farklı x'lerde ama AYNI yüksekliklerde sönüyor."""
    s = (f'      <linearGradient id="ms-koni" gradientUnits="userSpaceOnUse"'
         f' x1="0" y1="{KONI_UST}" x2="0" y2="{KONI_DIP}">\n')
    yayilim = KONI_DIP - KONI_UST
    for y, opak in KONI_DURAK:
        s += (f'        <stop offset="{(y - KONI_UST) / yayilim:.3f}"'
              f' stop-color="{KONI}" stop-opacity="{opak}"></stop>\n')
    return s + '      </linearGradient>\n'


def serit():
    p = []
    a = p.append
    merkezler = [KAMERA / 2 + i * ADIM for i in range(N)]

    a('    <defs>\n')
    a(koni_tanimi())
    if NESNELER:
        a(golge_tanimi())
        a(sprite_tanimlari())
    a('    </defs>\n\n')

    a('    <!-- ① SÜREKLİ DÜZLEMLER — bir kez, şeridin bütün boyunca. Koridorun\n'
      '         tek parça olmasının sebebi bu: hiçbiri hiçbir yerde kesilmiyor,\n'
      '         kayan tek şey kamera. Dikiş olması matematiksel olarak mümkün\n'
      '         değil, çünkü ortada dikilecek iki parça yok.\n'
      '\n'
      '         Beş bant, hepsi ölçülen sınırlarda. Ray tavanın DİBİNDE değil:\n'
      '         üstünde de altında da tavan var, spotlar alt şeritten sarkıyor. -->\n')
    a(f'    {dikd(0, 0, W, RAY_UST, TAVAN)}\n')
    a(f'    {dikd(0, RAY_UST, W, RAY_ALT - RAY_UST, RAY)}\n')
    a(f'    {dikd(0, RAY_ALT, W, DUVAR_UST - RAY_ALT, TAVAN)}\n')
    a(f'    {dikd(0, DUVAR_UST, W, DUVAR_ALT - DUVAR_UST, DUVAR)}\n')
    a('    <!-- duvarla zemin arasındaki koyu bant: ölçümdeki en büyük sıçrama\n'
      '         (Δ207) ve sahnenin TEK soğuk yüzeyi. -->\n')
    a(f'    {dikd(0, DUVAR_ALT, W, ZEMIN_UST - DUVAR_ALT, DIP)}\n')
    a(f'    {dikd(0, ZEMIN_UST, W, H - ZEMIN_UST, ZEMIN)}\n')

    a('\n    <!-- ② ZEMİNDEKİ IŞIK GÖLLERİ\n'
      '         ⚠️ DERZ YOK. Önce 118 birimde bir düşey derz çizgisi vardı;\n'
      '         referansın zemininde öyle bir şey yok ve düzenli aralıkları\n'
      '         yüzünden zemin çizgili bir desene dönüşüyordu. Referanstaki\n'
      '         zemin hareketi desenden değil AKİSTEN geliyor — o da figürlerle\n'
      '         birlikte gelecek (adım 7). -->\n')
    for c in merkezler:
        a(zemin_isigi(c))

    a('\n    <!-- ③ KONİLER VE SPOTLAR — sahnedeki tek anahtar ışık. Koni ÖNCE:\n'
      '         spot gövdesi koninin sivri tepesini örtmek zorunda, çünkü ışık\n'
      '         lambanın içinden değil ağzından çıkıyor. -->\n')
    for c in merkezler:
        a(koni(c))
    for c in merkezler:
        a(spot(c))

    a(f'\n    <!-- ④ ESERLER — her durağın merkezinde (x = {KAMERA // 2} + i·{ADIM}). ADIM\n'
      f'         kameradan ({KAMERA}) çok dar olduğu için kadrajda aynı anda ~2.5\n'
      '         eser duruyor; koridor hissi oradan geliyor. -->\n')
    for i, c in enumerate(merkezler):
        a(f'    <!-- durak {i + 1:02d} -->\n')
        a(tablo(c, i))

    if NESNELER:
        # Derinliğe göre: uzaktaki önce çiziliyor, yakındaki üstünü örtüyor.
        sirali = sorted(NESNELER, key=lambda n: n[2])

        # ⚠️ ÖNCE BÜTÜN GÖLGELER, SONRA BÜTÜN FİGÜRLER. Figür-gölge-figür
        # sırasıyla çizilseydi öndeki birinin gölgesi arkadakinin bacağına
        # düşerdi; gölge zeminde, insanlar zeminin üstünde.
        a('\n    <!-- ⑤ GÖLGELER — zeminde, ayak izinden kadrajın dibine -->\n')
        for ad, x, ayak in sirali:
            a(golge(ad, x, ayak))

        a('\n    <!-- ⑥ ZİYARETÇİLER — referanstan kesilmiş sprite\'lar. Boy\n'
          '         `spritelar.py`deki ölçülen (birim, ayak) ikilisinden\n'
          '         türüyor; burada yalnız konum ve derinlik var. -->\n')
        for ad, x, ayak in sirali:
            a(nesne(ad, x, ayak))

    return "".join(p)


# ═══════════════════════════════════════════════════════════════════════════
# HEDEF VE KÜNYE VERİSİ
# ---------------------------------------------------------------------------
# Odak kartı eserin BÜYÜTÜLMÜŞ hâli değil, aynı nesnenin okunabilir hâli:
# çerçeve + altındaki beyaz levha, levhada da gerçek metin. Şeritteki minik
# levhaya gerçek yazı yazmak mümkün değil (24 birim boyunda bir kart), o yüzden
# metin burada duruyor ve kart açılınca HTML olarak yazılıyor.
# ═══════════════════════════════════════════════════════════════════════════

def kunye_verisi():
    """
    Her durak için: kadrajdaki kutusu (yüzde) + levhanın metni.

    ⚠️ KUTULAR `kutu()`DAN GELİYOR, yani şeridi çizen fonksiyonun ta kendisinden.
    Görünmez hedef düğmesi bu yüzden çerçeveyle birim birim aynı yerde.

    ⚠️ SAYFANIN İÇİNDE, ayrı bir .json dosyasında değil: ikinci bir ağ isteği
    kartın ilk açılışında görülebilir bir gecikme demek olurdu ve sayı statik
    bir klasör olarak da servis edilebiliyor.
    """
    import json
    kayit = []
    for i, e in enumerate(ESERLER):
        L, T, gen, _ = kutu(i)["cerceve"]
        kx, ky, ken, kboy = kutu(i)["kunye"]
        kayit.append({
            # sol, üst, en, boy — hepsi KAMERA yüzdesi. Boy çerçevenin üstünden
            # künye levhasının altına kadar: okur için tek nesne, tek hedef.
            "kutu": [round(L / KAMERA * 100, 3), round(T / H * 100, 3),
                     round(gen / KAMERA * 100, 3), round((ky + kboy - T) / H * 100, 3)],
            "dosya": f'{ESER_YOLU}/{e["dosya"]}' if e["dosya"] else None,
            # Boş alan kartta HİÇ görünmüyor. Metinler artık yazılı (§ESERLER)
            # ama yedek duruyor: bir sonraki sayının eserleri yine önce
            # görselsiz/metinsiz girecek ve levhanın o aralıkta kısa durması
            # yarım künye göstermesinden iyi.
            "ad": e["ad"] or f"Eser {i + 1:02d}",
            "alt": e["alt"],
            "metin": e["metin"],
        })
    # `</script>` kapanışını metin içinde taşımak sayfayı ortasından keserdi.
    return json.dumps(kayit, ensure_ascii=False, separators=(",", ":")).replace("<", "\\u003c")


# ═══════════════════════════════════════════════════════════════════════════
# SAYFA
# ═══════════════════════════════════════════════════════════════════════════

SAYFA = """\
<!--
  ms-galeri — "Akıllı Kız" sergisi, tek snap.

  ⚠️ BU DOSYA ÜRETİLİYOR. Elle düzenlemeyin; geometri yanındaki `uret.py`den
  geliyor (dikey bütçe şeması o dosyanın başında).

  NEDEN TEK SAYFA: on ayrı sayfa olsaydı sayı üçte bir uzardı ve okuma modları
  masalı ortadan kesmek zorunda kalırdı (bkz. BENIOKU §Okuma modları). Burada
  mod değişse de sayfa sayısı sabit.

  KAMERA {KAMERA} birim, ADIM {ADIM} birim. İkisinin farkı sergiyi slayt olmaktan
  çıkaran şey: komşu çerçeveler kadrajın uçlarından içeri sarkıyor.

  ⚠️ Sahne renkleri temayı İZLEMİYOR — Kantō sahneleriyle ve `ms-acilis`le aynı
  gerekçe: bu bir DESEN değil IŞIK sahnesi. Galerinin anlamı, karanlık bir
  koridorda spotun altındaki tek aydınlık yüzey olmasında. Ana düzlemler yine de
  `--gal-*` değişkenlerini okuyor; yayında sabitler, yalnız tezgâh override eder.
-->
<section
  class="page page--overlay galeri"
  data-page-id="ms-galeri"
  data-mod="all"
  data-section="akilli-kiz"
  data-section-title="Akıllı Kız"
  data-kind="gallery"
  data-scene="fade-up"
  data-fit="contain"
  data-bleed="full"
  data-inview="true"
  data-durak="0"
  data-suruklerken="false"
  style="--adet: {N}; --serit-en: {SERIT_EN:.4f}%; --adim-oran: {ADIM_ORAN:.6f};
         --eser-sol: {ESER_SOL:.3f}%; --eser-ust: {ESER_UST:.3f}%;
         --eser-en: {ESER_EN:.3f}%; --eser-boy: {ESER_BOY:.3f}%;
         --eser-oran: {ESER_ORAN}; --eser-yer: {YESIL}"
  role="group"
  aria-roledescription="sayfa"
>
  <!-- KAMERA. Taşan şeridi kırpan 3:4 pencere; kadrajın kendisi. -->
  <div class="page__bg galeri__kamera">
    <svg
      class="galeri__serit"
      viewBox="0 0 {W} {H}"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
{SERIT}    </svg>

    <!-- Vinyet ve gren KAMERAYA ait, şeride değil: objektifin özelliği,
         duvarın değil. Şeride konsaydı bütün boyuna yayılır ve kayarken
         kadrajın içinden geçen bir leke gibi görünürdü. -->
    <svg
      class="galeri__kaplama"
      viewBox="0 0 {KAMERA} {H}"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <!-- ⚠️ ÇOK HAFİF, ve bu ölçüme dayanıyor: referansta duvarın parlaklığı
             y=640 satırında soldan sağa (%1 → %99) 182'de SABİT, yani vinyet
             yok. Tamamen kaldırılmadı çünkü kadrajın kenarını yumuşatan tek
             şey o; ama 0.42'den 0.14'e indirildi. -->
        <radialGradient id="ms-gal-vig" cx="0.5" cy="0.44" r="0.86">
          <stop offset="0.5" stop-color="#12100e" stop-opacity="0"></stop>
          <stop offset="1" stop-color="#12100e" stop-opacity="0.14"></stop>
        </radialGradient>
        <filter id="ms-gal-gren" x="0" y="0" width="100%" height="100%"
                filterUnits="objectBoundingBox" color-interpolation-filters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="1.3" numOctaves="1" seed="41"></feTurbulence>
          <feColorMatrix type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.30 0.30 0.28 0 -0.12"></feColorMatrix>
        </filter>
      </defs>
      <rect width="{KAMERA}" height="{H}" fill="url(#ms-gal-vig)"></rect>
      <rect width="{KAMERA}" height="{H}" filter="url(#ms-gal-gren)" opacity="0.07"></rect>
    </svg>
  </div>

  <!--
    DOKUNMA BÖLGELERİ — ⛔ KAPALI (2026-09-06, kullanıcı isteği: "tamamen
    serbest olsun"). Sergi artık durak durak ilerlemiyor; parmak şeridi
    nerede bırakırsa orada duruyor (bkz. js/galeri.js §SERBEST KAYIŞ).

    GERİ ALMAK üç adım:
      ① aşağıdaki iki <button>'ı bu yorumun dışına çıkar,
      ② bu blok İKİ dosyada birden duruyor — `uret.py` şablonu ve ondan
        üretilmiş `sayfa.html`; ikisinde de aç, yoksa ilk üretimde geri
        kaybolur (ya da yalnız şablonu açıp `uret.py > sayfa.html` çalıştır),
      ③ js/galeri.js'te §SERBEST KAYIŞ diye işaretli dört bloğu eski hâline al.
    js tarafı bölgeler yokken de sağlam: querySelectorAll boş dizi veriyor,
    dinleyici döngüsü ve pultuYaz() sessizce boşa dönüyor.

    Eski gerekçe, geri gelirse diye duruyor:
      Instagram/Shorts deyimi: düğme GÖRÜNMÜYOR, kadrajın kenarına dokunmak
      yeter. Sağ %30 ileri, sol %30 geri, ortadaki %40 boş — orası eserin
      kendisi ve oraya dokunmak sergiyi ilerletmemeli.
      ⚠️ `<button>` OLMAK ZORUNDA, `<div>` değil. Görünmez olmaları klavyeyi
      ve ekran okuyucuyu da kaybetmeleri anlamına gelmemeli; sergiyi gezmenin
      dokunmatik dışında bir yolu kalmazdı. Bölgeler kalkınca o yol OK
      TUŞLARINDA kaldı (js/galeri.js §OK TUŞLARI) — hedef düğmesi de sekiliyor.

    <button class="galeri__bolge galeri__bolge--geri" type="button" data-yon="-1"
            aria-label="Önceki durak" disabled>
      <span class="galeri__isaret" aria-hidden="true">
        <svg viewBox="0 0 24 24" class="icon"><path d="M15 6l-6 6 6 6"></path></svg>
      </span>
    </button>
    <button class="galeri__bolge galeri__bolge--ileri" type="button" data-yon="1"
            aria-label="Sonraki durak">
      <span class="galeri__isaret" aria-hidden="true">
        <svg viewBox="0 0 24 24" class="icon"><path d="M9 6l6 6-6 6"></path></svg>
      </span>
    </button>
  -->

  <!--
    KONUŞMA KATMANI. Şeritle AYNI genişlikte ve AYNI dönüşümü alıyor, o yüzden
    balonlar figürlerin başında yapışık kalıyor — konum senkronu diye bir iş
    yok, ikisi tek hareketle gidiyor.

    ⚠️ SVG'nin İÇİNDE DEĞİL, KARDEŞİ. `<text>` sarmıyor, `foreignObject` da bu
    sahnede tipografi ölçeğini kaybettiriyor; burada balon gerçek HTML, yani
    gerçek `<button>`, gerçek satır kırma, gerçek odak halkası. Bedeli tek:
    genişliği ve dönüşümü şeritten kopyalamak (galeri.css §3c).

    ⚠️ KAMERANIN DIŞINDA VE HEDEFTEN SONRA — ikisi de zorunlu:
      · kameranın İÇİNDE olsaydı z-index 2'de kalır, hedefin (4) altına
        düşerdi ve balona dokunmak eseri açardı;
      · sahnede figürler tabloların ÖNÜNDE duruyor, yani balonun da önde
        olması sahnenin kendi derinliğine uyuyor — istisna değil, kural.
    Kırpmayı sayfa yapıyor — `.page` zaten `overflow: hidden` — kamera değil.

    Aynı anda en çok iki balon görünüyor: figürler 235-475 birim arayla,
    kamera 600 birim.
  -->
  <div class="galeri__balonlar" data-gizli="false">
{BALONLAR}  </div>

  <!--
    ⚠️ SERGİNİN BAŞINA/SONUNA ATLAMA DÜĞMELERİ BURADA DEĞİL. Alt bantta,
    `index.html` §band__yan--sag içinde (`#btn-sergi-bas` / `#btn-sergi-son`),
    büyütme düğmesiyle aynı yuvada ve aynı sözleşmeyle. Bir süre bu sayfanın
    içinde, zeminin üstünde durdular; kullanıcı banda taşınmasını istedi
    (2026-09-07). Sahnenin içinde durdukları sürüm sahne rengini kullanıyordu;
    bantta artık `.band__btn` deyimi geçerli, yani kabuğun teması.
  -->

  <!--
    HEDEF. Kadrajın ORTASINDAKİ eserin üstünde duran görünmez düğme: çerçevenin
    üst kenarından künye levhasının altına kadar. Konumu `--eser-*`
    değişkenlerinden geliyor, durak değişince `js/galeri.js` yeniden yazıyor.

    ⚠️ YALNIZ ORTADAKİ ESER TIKLANIYOR, komşular değil — ve sebep geometrik.
    Bir çerçeve kadrajın %34'ü, dokunma bölgeleri de %30+%30: komşu eserler
    tamamen o bölgelerin altında kalıyor. Hepsi tıklanabilir olsaydı kadrajın
    sağına dokunmak "ilerle" mi "şunu aç" mı belli olmazdı. Kural tek cümle
    kalsın diye: ORTADAKİ ESER AÇILIR, KENARLAR GEZDİRİR.

    ⚠️ Bölgelerden SONRA ve z-index'i büyük: çerçeve kadrajın ortasında dursa
    da iki ucundan bölgelere birkaç yüzde giriyor, o payda da eser açılmalı.
  -->
  <button class="galeri__hedef" type="button" aria-haspopup="dialog"
          aria-label="Eser 01 — büyüt">
    <span class="galeri__buyutec" aria-hidden="true">
      <svg viewBox="0 0 24 24" class="icon">
        <circle cx="11" cy="11" r="6"></circle>
        <path d="M15.5 15.5L21 21M8.5 11h5M11 8.5v5"></path>
      </svg>
    </span>
  </button>

  <!--
    ALT LEVHA. Masalın metni buraya gelecek (henüz yok — içerik ayrı iş).

    ⚠️ SAYAÇ EKRANDAN KALDIRILDI (2026-09-07, kullanıcı isteği) ama SİLİNMEDİ:
    `.sr-only` ile duruyor. Sebebi görsel değil — `role="status"` burada, ve
    durak değiştiğini duyuran tek şey o. Kadrajda ilerlemenin GÖRÜLEBİLİR
    işaretleri var (komşu çerçeveler kayıyor, eser değişiyor); ekran okuyucuda
    hiçbiri yok, sürükleme sessiz geçerdi. Yani span'i tamamen atmak sayacı
    kaldırmak değil, gezinmeyi tek bir kullanıcı grubu için köreltmek olur.
  -->
  <div
    class="page__inner galeri__levha blk"
    style="--i: 0"
    data-block-id="ms-galeri:0"
    data-block-kind="gallery"
  >
    <p class="galeri__alt">
      <span class="galeri__sayac sr-only" role="status" aria-live="polite">01 / {N:02d}</span>
      <!-- Bölgeler kalkınca "kenarlarda gez" yalan oldu; gezmenin yolu artık
           sürüklemek. Eski hâli: "tabloya dokun · kenarlarda gez" -->
      <span class="galeri__ipucu">tabloya dokun · sürükleyerek gez</span>
    </p>
  </div>

  <!--
    ODAK. Tıklanan eser burada açılıyor: eserin KENDİSİ ve altında etiketi.
    Başka hiçbir şey yok — pervaz da, levha da, kutu da.

    ⚠️ ÇERÇEVE ODANIN PARÇASI, ESERİN DEĞİL. Koridorda pervaz gerekiyor çünkü
    orada tablo bir DUVARA asılı ve o duvardan ayrılması gerek. Burada duvar
    yok: perde odayı söndürüyor, geriye eser kalıyor. Aynı pervazı büyütüp
    kartın etrafına koymak (ilk sürüm öyleydi) sergiyi salonun kendisinden
    çok salonun mobilyasına baktırıyordu.

    ⚠️ ŞERİTTEKİ LEVHAYA YAZI YAZILAMAZ, 24 birim boyunda bir kart o. Metnin
    kartta olmasının sebebi bu; şeritteki iki gri çizgi yazının işareti olarak
    kalıyor (bkz. `uret.py` §tablo).

    ⚠️ ETİKET DE BEYAZ BİR LEVHA DEĞİL. Sahnedeki kural "karanlık koridorda
    tek aydınlık yüzey" ve o yüzey eserin kendisi; altına ikinci bir aydınlık
    dikdörtgen koymak onunla yarışıyordu. Yazı doğrudan karanlığın üstünde ve
    rengi --gal-koni: odayı aydınlatan ışık neyse etiketi aydınlatan da o.

    ⚠️ SAYFANIN İÇİNDE, tuvalin dışına taşan bir modal değil. Sergi tuvalin
    içinde geziliyor; kart da orada açılırsa dergi objesi bozulmuyor ve manga
    okuyucusunun tam ekran perdesiyle sıraya girmiyor.

    ⚠️ KAPAT DÜĞMESİ KARTIN DIŞINDA. Uzun bir sergi metninde kayan şey kartın
    kendisi; düğme içinde kalsaydı okur aşağı indikçe kapatma yolu ekrandan
    çıkardı (Escape olmayan bir telefonda geriye yalnız perdeye dokunmak kalır).
  -->
  <div class="galeri__odak" hidden>
    <div class="galeri__odak-perde" data-kapat></div>
    <figure class="galeri__kart" role="dialog" aria-modal="true"
            aria-labelledby="ms-kunye-ad" tabindex="-1">
      <img class="galeri__kart-gorsel" alt="" hidden>
      <div class="galeri__kart-yer" aria-hidden="true"></div>
      <figcaption class="galeri__kunye">
        <p class="galeri__kunye-no"></p>
        <h3 class="galeri__kunye-ad" id="ms-kunye-ad"></h3>
        <p class="galeri__kunye-alt" hidden></p>
        <p class="galeri__kunye-metin" hidden></p>
      </figcaption>
    </figure>
    <button class="galeri__kapat" type="button" aria-label="Kapat" data-kapat>
      <svg viewBox="0 0 24 24" class="icon" aria-hidden="true">
        <path d="M6 6l12 12M18 6L6 18"></path>
      </svg>
    </button>
  </div>

  <!-- Künye metinleri ve her eserin kadrajdaki kutusu. `js/galeri.js` okuyor. -->
  <script class="galeri__veri" type="application/json">{KUNYELER}</script>

  <!-- Balonların sözleri. Künyeyle aynı gerekçe: ayrı bir .json ikinci bir ağ
       isteği demek olurdu ve sayı statik klasör olarak da servis edilebiliyor. -->
  <script class="galeri__sozler" type="application/json">{SOZLER}</script>
</section>
"""


def denetle(metin):
    """
    Her fill ya geçerli bir #hex, ya var(--gal-*, #hex), ya url(#…), ya none.

    Sebebi somut: geçersiz bir dolgu SVG'de hata vermiyor, o yüzey sessizce
    SİYAH doluyor. Yanlış yazılmış tek bir renk sahnenin ortasında kara bir
    dikdörtgen bırakıyor ve nereden geldiği ancak gözle aranarak bulunuyor.
    Üretim anında yakalamak ucuz.
    """
    hatali = [d for d in re.findall(r'fill="([^"]+)"', metin)
              if not re.fullmatch(r'#[0-9a-fA-F]{6}|url\(#[\w-]+\)|none', d)
              and not re.fullmatch(r'var\(--gal-[\w-]+, *#[0-9a-fA-F]{6}\)', d)]
    if hatali:
        raise SystemExit("geçersiz dolgu: " + ", ".join(sorted(set(hatali))))
    return metin


if __name__ == "__main__":
    # Hedef düğmesinin AÇILIŞTAKİ yeri (durak 0). Durak değiştikçe js aynı
    # değerleri künye verisinden okuyup yeniden yazıyor; burada yazılmasının
    # sebebi ilk karede düğmenin kadrajın sol üst köşesinde durmaması.
    _L, _T, _gen, _ = kutu(0)["cerceve"]
    _, _ky, _, _kboy = kutu(0)["kunye"]

    sys.stdout.write(denetle(SAYFA.format(
        N=N, W=W, H=H, KAMERA=KAMERA, ADIM=ADIM,
        SERIT_EN=W / KAMERA * 100,      # şerit kameranın kaç katı
        ADIM_ORAN=ADIM / W,             # bir durak, şeridin kaçta kaçı
        ESER_SOL=_L / KAMERA * 100,
        ESER_UST=_T / H * 100,
        ESER_EN=_gen / KAMERA * 100,
        ESER_BOY=(_ky + _kboy - _T) / H * 100,
        ESER_ORAN=f"{ESER_PIKSEL[0]} / {ESER_PIKSEL[1]}",
        YESIL=YESIL,
        KUNYELER=kunye_verisi(),
        SOZLER=balon_verisi(),
        BALONLAR=balonlar(),
        SERIT=serit())))
