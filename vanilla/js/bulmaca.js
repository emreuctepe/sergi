/* ============================================================================
   BULMACA — emoji bilmecesi (bl-1)
   ----------------------------------------------------------------------------
   Üç emoji bir şeyi anlatıyor; okur dört şıktan birini seçiyor. Sekiz soru,
   hepsi Japonya'dan: beşi pop kültür (anime, film, oyun), üçü gelenek ve simge.

   EKRANDA TEK SORU VAR. Alt alta dizilseydi sayfa uzar, cevaplanmış sorular da
   taşınmaya devam ederdi; oyun hissi kaydırmanın içinde dağılırdı. Tek soru
   ayrıca sayfayı `data-fit="contain"` tutmayı mümkün kılıyor — oynarken hiç
   kaydırma yok.

   ⚠️ `contain` demek "tuvale sığmak ZORUNDA" demek: `.page`te `overflow:
   hidden` var (canvas.css §sayfa), taşan şey uyarı vermeden kesilir. Düzen bu
   yüzden sabit yükseklikli değil ESNEK — emoji sahnesi artan alanı alıyor,
   geri kalan parçalar kendi boylarında duruyor. Cevap verilince beliren
   açıklama şeridi de baştan yer ayırtıyor (`css/puzzles.css` §ŞERİT), yoksa
   şık listesi cevap anında zıplardı.

   SUNUCU YOK, KAYIT YOK. Skor `localStorage`a yazılmıyor ve bu bilinçli:
   okuyucu sayfaları DOM'dan söküp takmıyor (`okuyucu.js` §3 — yalnız
   gizliyor), yani okur sayının içinde gezip dönse bile bulmacayı bıraktığı
   yerde buluyor. Depolama ancak "ikinci ziyarette de hatırla" demek olurdu;
   bu bir bulmaca, bir hesap değil.
   ========================================================================= */

/* ==========================================================================
   1 · SORULAR
   --------------------------------------------------------------------------
   Soru eklemek = diziye bir kayıt eklemek. Nokta dizisi de sonuçtaki bölen de
   `BULMACALAR.length`ten geliyor, hiçbir yerde elle yazılı sayı yok.

   `emoji` neden dizi, düz metin değil: 🏴‍☠️ tek bir karakter DEĞİL (bayrak +
   ZWJ + kurukafa). Düz metni bölmeye kalkan her yol er geç o birleşimi ortadan
   ikiye ayırır ve ekrana bozuk bir bayrak düşer.

   `celme` üçü de GERÇEK. Uydurma bir şık, bilmeyeni eler ama bilene hiçbir şey
   söylemez; gerçek olanı yanlış cevap veren okura da bir isim bırakıyor.
   6. sorudaki "Fuji'nin Otuz Altı Manzarası" bunun en açık hâli: baskının
   kendisi değil, ait olduğu seri — ve `not` tam olarak bunu anlatıyor.
   ======================================================================= */

const BULMACALAR = [
  {
    emoji: ['🏴‍☠️', '👒', '🍖'],
    cevap: 'One Piece',
    celme: ['Naruto', 'Bleach', 'Hunter × Hunter'],
    not: 'Eiichiro Oda 1997’den beri haftalık çiziyor; seri çeyrek asrı geçti.'
  },
  {
    emoji: ['🐷', '🏯', '👻'],
    cevap: 'Ruhların Kaçışı',
    celme: ['Komşum Totoro', 'Prenses Mononoke', 'Yürüyen Şato'],
    not: 'Miyazaki filmi arkadaşlarının on yaşındaki kızları için yaptı.'
  },
  {
    emoji: ['⚡', '🐭', '🔴'],
    cevap: 'Pokémon',
    celme: ['Digimon', 'Doraemon', 'Yu-Gi-Oh!'],
    not: 'Adı "poketto monsutā"nın kısaltması: cep canavarları.'
  },
  {
    emoji: ['☢️', '🦖', '🏙️'],
    cevap: 'Godzilla',
    celme: ['Gamera', 'Mothra', 'Ultraman'],
    not: 'İlk film 1954’te çekildi: bir nükleer deneme Japon balıkçı teknesini vurduktan aylar sonra.'
  },
  {
    emoji: ['📓', '💀', '🖊️'],
    cevap: 'Ölüm Defteri',
    celme: ['Tokyo Ghoul', 'Monster', 'Psycho-Pass'],
    not: 'Yazar olarak yazan Tsugumi Ohba bir takma ad; arkasında kim olduğu hâlâ açıklanmadı.'
  },
  {
    emoji: ['🌊', '🗻', '🖼️'],
    cevap: 'Büyük Dalga',
    celme: ['Kırmızı Fuji', 'Yağmurda Ani Sağanak', 'Fuji’nin Otuz Altı Manzarası'],
    not: 'Serinin kendisi değil, serideki bir yaprak — ve en tanınmışı. Hokusai onu yetmişini geçtikten sonra yaptı.'
  },
  {
    emoji: ['⛩️', '🦊', '🏮'],
    cevap: 'Fushimi Inari',
    celme: ['Itsukushima', 'Meiji Tapınağı', 'Kinkaku-ji'],
    not: 'Kyoto’daki bu tapınağın yokuşunu on binden fazla torii örtüyor; her birinin arkasında bir bağışçının adı yazılı.'
  },
  {
    emoji: ['🐕', '🚉', '🕰️'],
    cevap: 'Hachikō',
    celme: ['Tama', 'Maru', 'Saigō’nun köpeği'],
    not: 'Sahibi 1925’te öldü; Hachikō dokuz yıl boyunca her gün Shibuya istasyonuna gitmeye devam etti.'
  }
];

/* Skor yorumları — üst sınırdan aşağı taranıyor, ilk uyan kazanıyor.
   Sıra bozulursa yorum da bozulur: `enAz` değerleri BÜYÜKTEN KÜÇÜĞE. */
const YORUMLAR = [
  { enAz: 8, metin: 'Sekizde sekiz. Bu sayfayı sen mi hazırladın?' },
  { enAz: 6, metin: 'İyi. Zaten bir ikisi tuzaktı.' },
  { enAz: 4, metin: 'Yarısı. Emojiler kimsenin dostu değil.' },
  { enAz: 2, metin: 'Az. Ama emoji okumak diye bir ders de yok.' },
  { enAz: 0, metin: 'Sıfıra yakın. Bunu da bir yere yazmak lazım.' }
];

/* ==========================================================================
   2 · YARDIMCILAR
   ======================================================================= */

/** Fisher–Yates. Şıkların sırası her soruda ve her turda yeniden karışıyor —
    sabit kalsaydı doğru cevap hep aynı satırda olurdu. */
function karistir(dizi) {
  const kopya = [...dizi];
  for (let i = kopya.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [kopya[i], kopya[j]] = [kopya[j], kopya[i]];
  }
  return kopya;
}

/* ==========================================================================
   3 · OYUN
   ======================================================================= */

export function bulmacaBaslat() {
  const kok = document.getElementById('bulmaca');

  /* Sayfa sayıdan çıkarılmış olabilir: sıra `index.html`deki `#sira` bloğunda
     ve oradan bir satır silmek serbest (bkz. BENIOKU.md). */
  if (!kok) return;

  kok.innerHTML = iskelet();

  const iz = [...kok.querySelectorAll('.bulmaca__iz li')];
  const sahne = kok.querySelector('.bulmaca__sahne');
  const secenekKutusu = kok.querySelector('.bulmaca__secenekler');
  const secenekler = [...secenekKutusu.querySelectorAll('.secenek')];
  const not = kok.querySelector('.bulmaca__not');
  const ileriDugmesi = kok.querySelector('.bulmaca__ileri');
  const skor = kok.querySelector('.bulmaca__skor b');
  const yorum = kok.querySelector('.bulmaca__yorum');
  const tekrarDugmesi = kok.querySelector('.bulmaca__tekrar');

  let sira = 0;
  let dogruSayisi = 0;

  /**
   * Odak YALNIZCA bulmacanın içindeyken taşınıyor.
   *
   * ⚠️ Koşulsuz `focus()` bir hata olurdu: odak vermek kaydırma kabını hedefe
   * sürükler, yani sayının başka bir yerinde okuyan birini bulmaca sayfasına
   * çeker. Fareyle oynayan okur zaten odağı düğmede taşıyor; hiç dokunmamış
   * okur da yerinde kalıyor.
   */
  function odagiVer(hedef) {
    if (!kok.contains(document.activeElement)) return;
    hedef.focus({ preventScroll: true });
  }

  /** Sıradaki soruyu ekrana kurar. */
  function soruyuKur() {
    const soru = BULMACALAR[sira];

    kok.dataset.evre = 'soru';

    /* Emoji düğümleri her soruda YENİDEN kuruluyor, metinleri değiştirilmiyor:
       giriş animasyonu (§EMOJİ) böylece kendiliğinden baştan çalışıyor.
       Aynı düğümün içeriğini değiştirmek animasyonu tetiklemezdi. */
    sahne.replaceChildren(
      ...soru.emoji.map((im, i) => {
        const span = document.createElement('span');
        span.className = 'bulmaca__im';
        span.style.setProperty('--i', String(i));
        span.textContent = im;
        return span;
      })
    );

    /* Şıklar karışık; hangisinin doğru olduğu `data-dogru` ile taşınıyor,
       konumla değil. */
    const siralama = karistir([soru.cevap, ...soru.celme]);
    secenekler.forEach((dugme, i) => {
      dugme.textContent = siralama[i];
      dugme.dataset.dogru = String(siralama[i] === soru.cevap);
      dugme.dataset.durum = '';
      dugme.disabled = false;
    });

    /* Ekran okuyucu soru numarasını şık grubuna girerken duyuyor — ayrı bir
       canlı bölge açmaya gerek yok, o da her ilerlemede araya girerdi. */
    secenekKutusu.setAttribute(
      'aria-label',
      `Soru ${sira + 1} / ${BULMACALAR.length} — şıklar`
    );

    not.textContent = '';
    delete not.dataset.hukum;
    ileriDugmesi.hidden = true;
    ileriDugmesi.textContent =
      sira === BULMACALAR.length - 1 ? 'Sonucu gör' : 'Sonraki';

    izleriGuncelle();
  }

  /** Nokta dizisi: geçmiş turların sonucu + şu an nerede olduğumuz. */
  function izleriGuncelle() {
    iz.forEach((nokta, i) => {
      if (i < sira) return; /* cevaplanmışların durumu `cevapla`da yazıldı */
      nokta.dataset.durum = i === sira ? 'simdiki' : 'bekliyor';
    });
  }

  function cevapla(secilen) {
    const dogruMu = secilen.dataset.dogru === 'true';
    const soru = BULMACALAR[sira];

    kok.dataset.evre = 'cevap';
    if (dogruMu) dogruSayisi++;

    for (const dugme of secenekler) {
      dugme.disabled = true;
      if (dugme.dataset.dogru === 'true') dugme.dataset.durum = 'dogru';
      else if (dugme === secilen) dugme.dataset.durum = 'yanlis';
      else dugme.dataset.durum = 'solgun';
    }

    iz[sira].dataset.durum = dogruMu ? 'dogru' : 'yanlis';

    /* Hüküm ayrı bir düğümde: rengi ondan geliyor ve `role="status"` taşıyan
       şerit tek parça olarak okunuyor — "Doğru. Eiichiro Oda…" */
    not.dataset.hukum = dogruMu ? 'dogru' : 'yanlis';
    not.replaceChildren(
      Object.assign(document.createElement('b'), {
        className: 'bulmaca__hukum',
        textContent: dogruMu ? 'Doğru.' : `Yanlış — ${soru.cevap}.`
      }),
      document.createTextNode(` ${soru.not}`)
    );

    ileriDugmesi.hidden = false;
    odagiVer(ileriDugmesi);
  }

  function ilerle() {
    sira++;
    if (sira >= BULMACALAR.length) return sonucuGoster();
    soruyuKur();
    odagiVer(secenekler[0]);
  }

  function sonucuGoster() {
    kok.dataset.evre = 'sonuc';
    skor.textContent = String(dogruSayisi);
    yorum.textContent = YORUMLAR.find((y) => dogruSayisi >= y.enAz).metin;
    odagiVer(tekrarDugmesi);
  }

  function bastanAl() {
    sira = 0;
    dogruSayisi = 0;
    for (const nokta of iz) nokta.dataset.durum = 'bekliyor';
    soruyuKur();
    odagiVer(secenekler[0]);
  }

  for (const dugme of secenekler) {
    dugme.addEventListener('click', () => cevapla(dugme));
  }
  ileriDugmesi.addEventListener('click', ilerle);
  tekrarDugmesi.addEventListener('click', bastanAl);

  soruyuKur();
}

/* ==========================================================================
   4 · İSKELET
   --------------------------------------------------------------------------
   Şıkların sayısı sabit (4) ve düğümleri BİR KEZ kuruluyor; her soruda yalnız
   metinleri ve durumları değişiyor. Her soruda yeniden kurulsalardı odak
   düğümle birlikte kaybolur, klavyeyle oynayan okur her cevaptan sonra
   sayfanın başına düşerdi.

   Nokta sayısı ise sorulardan geliyor — soru eklenince dizi kendiliğinden
   uzuyor.
   ======================================================================= */

function iskelet() {
  const noktalar = BULMACALAR.map(
    () => '<li data-durum="bekliyor"></li>'
  ).join('');

  /* `aria-hidden`: noktalar bir SÜS. Taşıdıkları bilgi (kaçıncı sorudayız)
     zaten şık grubunun etiketinde, cevaplar da açıklama şeridinde okunuyor;
     sekiz anlamsız madde işareti duyurmanın kimseye faydası yok. */
  return `
    <ol class="bulmaca__iz" aria-hidden="true">${noktalar}</ol>

    <p class="bulmaca__sahne"></p>

    <div class="bulmaca__secenekler" role="group">
      ${'<button class="secenek" type="button"></button>'.repeat(4)}
    </div>

    <div class="bulmaca__serit">
      <p class="bulmaca__not" role="status"></p>
      <button class="bulmaca__ileri" type="button" hidden>Sonraki</button>
    </div>

    <div class="bulmaca__sonuc">
      <p class="bulmaca__skor"><b>0</b> <span>/ ${BULMACALAR.length}</span></p>
      <p class="bulmaca__yorum"></p>
      <button class="bulmaca__tekrar" type="button">Baştan al</button>
    </div>`;
}
