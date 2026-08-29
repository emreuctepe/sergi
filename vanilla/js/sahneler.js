/* ============================================================================
   SAHNELER — tanıtım kartlarının arka planları
   ----------------------------------------------------------------------------
   Beş kartın arkasındaki SVG'ler burada ÜRETİLİYOR, dosyaya gömülü durmuyor.
   Sebebi ölçüldü: `waves` tek başına 21,6 KB'lık üretilmiş işaretleme —
   360 çember. Onu bir HTML dosyasına yapıştırmak hem okunamaz bir blob
   bırakırdı hem de "neden bu çember burada?" sorusunun cevabını silerdi.
   Aşağıdaki kırk satır aynı çıktıyı veriyor ve gerekçesi okunabiliyor.

   Sayfaların (sayının kendisinin) arka planları BURADA DEĞİL: onlar zaten
   `sayfalar/<id>/sayfa.html` içinde yazılı duruyor, çünkü sayfa dosyaları
   kendi kendine yeten parçalar olmalı.

   ⚠️ TOHUMLU RASTGELELİK — `Math.random()` değil. Sahnelerin serpiştirmesi her
   açılışta AYNI olmak zorunda: dergi sayfası bir kompozisyondur, her ziyarette
   yeniden zar atılan bir şey değil.

   ⚠️ RASTGELE ÇAĞRI SIRASI SÖZLEŞMENİN PARÇASI. `leaves`te sıra konum → ölçek
   → dönüş → saydamlık → ton; `street`te genişlik → yükseklik → ton → saydamlık.
   Bir satırı yukarı almak diziyi kaydırır ve bütün kompozisyon başkalaşır —
   üstelik yine "makul" görünerek, yani hata fark edilmeden.
   ========================================================================= */

/* ==========================================================================
   TOHUMLU RASTGELELİK — xorshift32
   ======================================================================= */

function rng(tohum) {
  let s = tohum >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 4294967296;
  };
}

/** Koordinatlar yuvarlanıyor: onsuz DOM'a `243.53674962744117` yazılıyor. */
const yuvarla = (n, basamak) => Number(n.toFixed(basamak));

/* Degrade kimlikleri belge içinde TEKİL olmak zorunda: aynı sahne iki kez
   çizilseydi ikinci `url(#…)` birincinin degradesini gösterirdi. */
let sayac = 0;
const kimlik = (ad) => `${ad}-${++sayac}`;

/** Her sahnenin dış kabuğu aynı. */
function svg(icerik) {
  return `<svg class="art" viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice"
    aria-hidden="true" focusable="false">${icerik}</svg>`;
}

/* ==========================================================================
   KÂĞIT — en sessiz sahne. İki soluk leke, gerisi kâğıdın kendisi.
   ======================================================================= */

function paper() {
  return svg(`
    <rect width="300" height="400" fill="var(--paper)" />
    <circle cx="270" cy="-20" r="120" fill="var(--accent)" opacity="0.05" />
    <circle cx="10" cy="420" r="150" fill="var(--accent-3)" opacity="0.05" />`);
}

/* ==========================================================================
   YAPRAKLAR — on yedi yaprak, seyrek ve yumuşak
   --------------------------------------------------------------------------
   Sayı bilerek tek ve küçük: bu bir yaprak yağmuru değil, sayfanın kenarına
   düşmüş birkaç yaprak. Kalabalıklaşırsa üstündeki metni yer.
   ======================================================================= */

/** Yaprağın dış hattı ve damarları — kapaktaki damgayla aynı yol. */
const YAPRAK = 'M0 13 C-7.5 7 -10.5 -2 -5.5 -8.5 C-3 -11.8 3 -11.8 5.5 -8.5 C10.5 -2 7.5 7 0 13Z';
const YAPRAK_DAMAR = 'M0 12 L0 -9 M0 2 L5 -3 M0 2 L-5 -3 M0 7 L4.5 3 M0 7 L-4.5 3';
const YAPRAK_TONLARI = ['var(--accent)', 'var(--accent-2)', 'var(--accent-3)'];

function leaves() {
  const rand = rng(31337);
  let yapraklar = '';

  for (let i = 0; i < 17; i++) {
    const x = yuvarla(rand() * 300, 0);
    const y = yuvarla(rand() * 400, 0);
    const olcek = yuvarla(0.55 + rand() * 1.25, 2);
    const donus = yuvarla(rand() * 360, 0);
    const saydam = yuvarla(0.16 + rand() * 0.42, 2);
    const ton = YAPRAK_TONLARI[Math.floor(rand() * 3)];

    yapraklar += `
      <g transform="translate(${x},${y}) rotate(${donus}) scale(${olcek})" opacity="${saydam}">
        <path d="${YAPRAK}" fill="${ton}" />
        <path d="${YAPRAK_DAMAR}" fill="none" stroke="var(--paper)" stroke-width="0.8"
              opacity="0.45" stroke-linecap="round" />
      </g>`;
  }

  return svg(`
    <rect width="300" height="400" fill="var(--paper)" />
    <circle cx="248" cy="52" r="110" fill="var(--accent)" opacity="0.05" />
    ${yapraklar}`);
}

/* ==========================================================================
   DALGALAR — seigaiha (青海波), "mavi deniz dalgası"
   --------------------------------------------------------------------------
   Rastgelelik YOK, tamamı ızgara aritmetiği. Sol sütun -1'den başlıyor ve
   sağdaki sonuncusu tuvalin dışına taşıyor: desen KESİLMİŞ görünmeli,
   sayfaya sığdırılmış değil. Tek sıralar yarım adım (22) kayıyor, saydamlık
   üç sırada bir dönüyor — düz bir ızgaranın dokuya dönüşmesi bu ikisinden.
   ======================================================================= */

const HALKA_YARICAPLARI = [26, 19, 12, 5];

function waves() {
  let obekler = '';

  for (let satir = 0; satir < 10; satir++) {
    for (let sutun = -1; sutun < 8; sutun++) {
      const cx = sutun * 44 + (satir % 2 ? 22 : 0);
      const cy = satir * 42;
      const saydam = Number((0.14 + (satir % 3) * 0.08).toFixed(2));
      const cemberler = HALKA_YARICAPLARI.map(
        (r) => `<circle cx="${cx}" cy="${cy}" r="${r}" />`
      ).join('');
      obekler += `<g opacity="${saydam}" fill="none" stroke="var(--accent)" stroke-width="2">${cemberler}</g>`;
    }
  }

  return svg(`<rect width="300" height="400" fill="var(--paper-sunken)" />${obekler}`);
}

/* ==========================================================================
   SOKAK — dar bir sokak, iki yandan sarkan tabelalar, dipte tek ışık
   --------------------------------------------------------------------------
   İki perspektif duvarı 96 ve 204'te kesişiyor; tabelalar ve yerdeki huzme
   aynı kaçış noktasına bakıyor. Çift indeksli tabelalar solda, tekler sağda;
   her biri bir öncekinden biraz daha içeride — sokak dibe doğru daralıyor.
   ======================================================================= */

function street() {
  const rand = rng(2211);
  const grad = kimlik('street');
  let tabelalar = '';

  for (let i = 0; i < 9; i++) {
    const g = 14 + rand() * 16;
    const y = 40 + rand() * 40;
    const ton = rand() > 0.5 ? 'var(--accent)' : 'var(--accent-2)';
    const saydam = yuvarla(0.45 + rand() * 0.5, 2);
    const solda = i % 2 === 0;

    /* Sağdaki tabelanın sol kenarı YUVARLANMAMIŞ genişlikten hesaplanıyor;
       çizilen genişlik ise yuvarlak. Aradaki yarım birimlik fark 300 birimlik
       bir tuvalde görünmüyor. */
    tabelalar += `<rect x="${yuvarla(solda ? 22 + i * 3 : 268 - i * 3 - g, 1)}"
      y="${100 + i * 26}" width="${yuvarla(g, 0)}" height="${yuvarla(y, 0)}"
      rx="2" fill="${ton}" opacity="${saydam}" />`;
  }

  return svg(`
    <defs>
      <linearGradient id="${grad}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="var(--ink)" stop-opacity="0.92" />
        <stop offset="0.6" stop-color="var(--accent-3)" stop-opacity="0.6" />
        <stop offset="1" stop-color="var(--accent)" stop-opacity="0.35" />
      </linearGradient>
    </defs>
    <rect width="300" height="400" fill="var(--paper-sunken)" />
    <rect width="300" height="400" fill="url(#${grad})" />
    <path d="M0 0 L96 150 L96 400 L0 400Z" fill="var(--ink)" opacity="0.72" />
    <path d="M300 0 L204 150 L204 400 L300 400Z" fill="var(--ink)" opacity="0.72" />
    ${tabelalar}
    <path d="M96 400 L138 220 L162 220 L204 400Z" fill="var(--accent-2)" opacity="0.2" />
    <circle cx="150" cy="214" r="16" fill="var(--paper-raised)" opacity="0.55" />`);
}

/* ==========================================================================
   TORİİ — batan güneşin önünde bir kapı
   --------------------------------------------------------------------------
   Son kartın altında durması tesadüf değil: torii bir EŞİK işaretidir,
   ardındaki yere girilir. Okurun bir sonraki hareketi de tam olarak bu.

   Rastgelelik yok, hepsi elle konmuş koordinat.
   ======================================================================= */

function torii() {
  const gok = kimlik('torii-sky');
  const tepe = kimlik('torii-hill');
  const tarama = kimlik('torii-tooth');

  return svg(`
    <defs>
      <linearGradient id="${gok}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="var(--accent-2)" stop-opacity="0.35" />
        <stop offset="0.55" stop-color="var(--accent)" stop-opacity="0.5" />
        <stop offset="1" stop-color="var(--accent)" stop-opacity="0.85" />
      </linearGradient>
      <linearGradient id="${tepe}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="var(--accent-3)" stop-opacity="0.85" />
        <stop offset="1" stop-color="var(--accent-3)" stop-opacity="1" />
      </linearGradient>
      <!-- 35° eğik ince tarama: hem güneşin hem sahnenin üstünde, baskı hissi -->
      <pattern id="${tarama}" width="4" height="4" patternUnits="userSpaceOnUse"
               patternTransform="rotate(35)">
        <line x1="0" y1="0" x2="0" y2="4" stroke="var(--ink)" stroke-width="1" opacity="0.06" />
      </pattern>
    </defs>

    <rect width="300" height="400" fill="var(--paper-sunken)" />
    <rect width="300" height="400" fill="url(#${gok})" />

    <circle cx="150" cy="196" r="62" fill="var(--paper-raised)" opacity="0.92" />
    <circle cx="150" cy="196" r="62" fill="url(#${tarama})" />

    <path d="M0 250 L52 196 L96 238 L140 188 L196 246 L242 206 L300 258 L300 400 L0 400Z"
          fill="var(--ink)" opacity="0.14" />
    <path d="M0 288 L60 250 L118 286 L172 246 L232 292 L300 262 L300 400 L0 400Z"
          fill="url(#${tepe})" opacity="0.55" />

    <!-- kapının kendisi: kasa, bağ kirişi, iki ayak, tabela levhası -->
    <g fill="var(--accent)" opacity="0.96">
      <path d="M62 168 h176 l-8 15 H70Z" />
      <rect x="72" y="190" width="156" height="11" rx="2" />
      <rect x="92" y="183" width="15" height="180" rx="3" />
      <rect x="193" y="183" width="15" height="180" rx="3" />
      <rect x="140" y="201" width="20" height="26" rx="2" />
    </g>

    <rect y="352" width="300" height="48" fill="var(--ink)" opacity="0.2" />
    <rect width="300" height="400" fill="url(#${tarama})" />`);
}

/* ==========================================================================
   DIŞARI AÇILAN
   ======================================================================= */

export const SAHNELER = { paper, leaves, waves, street, torii };
