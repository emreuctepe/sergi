/* ============================================================================
   WİKİ KAPISI — söyleşideki mangaka bağlantıları
   ----------------------------------------------------------------------------
   Düz sol tık burada yakalanıyor ve okuru sayfadan çıkarmak yerine ortada bir
   kart açıyor. `<a href>` yerinde duruyor, yani sağ tık / orta tık / ctrl+tık
   hâlâ yeni sekmede aramayı açar.

   ⚠️ İKİ AYRI ADRES, bilerek:
     · `href`            → DuckDuckGo araması. Okurun GİTTİĞİ yer.
     · `data-wiki-kapi`  → `dil:Makale_Adı`. Kartın OKUDUĞU yer.

   Ayrı olmalarının sebebi ölçüldü: DuckDuckGo bir önizleme kaynağı olamıyor.
     · IFRAME olmuyor — duckduckgo.com, html.* ve lite.* üçü de
       `X-Frame-Options: SAMEORIGIN` gönderiyor. Çerçeve `load` olayını atıyor
       ama belge BOŞ geliyor (ölçüldü: `body.innerHTML.length === 0`), yani
       hatasız ama sessizce kırık — Wikipedia makale sayfalarının da aynı
       sebeple çerçevelenememesi gibi.
     · INSTANT ANSWER API'si de olmuyor — `api.duckduckgo.com/?format=json`
       curl'e dolu cevap veriyor ama TARAYICIDAN istendiğinde bütün alanları
       boş dönüyor (`Type: "N"`). Sorguya bağlı değil: "Tokyo" ve "DuckDuckGo"
       da boş geliyor. Bu klonun sunucu tarafı yok, yani araya girip
       düzeltecek bir vekil de yok.

   Geriye CORS'a gerçekten açık tek kaynak kalıyor: Wikipedia'nın REST özet uç
   noktası (`/api/rest_v1/page/summary/`) — adı, görseli ve giriş paragrafı
   JSON olarak geliyor. Kart onu gösteriyor, kartın içindeki düğme ise okuru
   aramaya yolluyor.
   ========================================================================= */

let cache = new Map();

function azHareket() {
  return (
    document.documentElement.dataset.motion === 'off' ||
    matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/** `en:Junji_Ito` → { dil: 'en', baslik: 'Junji_Ito' } */
function kaynagiCoz(kaynak) {
  const ayrac = kaynak.indexOf(':');
  return { dil: kaynak.slice(0, ayrac), baslik: kaynak.slice(ayrac + 1) };
}

async function ozetGetir(kaynak) {
  if (cache.has(kaynak)) return cache.get(kaynak);

  const { dil, baslik } = kaynagiCoz(kaynak);
  const uc = `https://${dil}.wikipedia.org/api/rest_v1/page/summary/${baslik}`;

  const istek = fetch(uc, { headers: { Accept: 'application/json' } }).then((yanit) => {
    if (!yanit.ok) throw new Error(String(yanit.status));
    return yanit.json();
  });

  cache.set(kaynak, istek);
  istek.catch(() => cache.delete(kaynak));
  return istek;
}

/**
 * `href` her iki kartta da DuckDuckGo araması — okurun gideceği tek yer orası.
 *
 * Özet Wikipedia'dan geldiği için altına kaynağı yazılıyor: metin CC BY-SA ve
 * bu sayı kendi künyesinde başkalarının lisanslarını sayıp duruyor, kendi
 * çektiği paragrafı adsız bırakamaz.
 */
function ozetKarti(veri, href, kaynakAdresi) {
  const gorsel = veri.thumbnail?.source;
  return `
    ${gorsel ? `<img class="wiki-kart__img" src="${gorsel}" alt="" loading="lazy" />` : ''}
    <p class="wiki-kart__ozet">${veri.extract ?? 'Bu isim için özet bulunamadı.'}</p>
    <p class="wiki-kart__kaynak">
      Özet: <a href="${kaynakAdresi}" target="_blank" rel="noopener">Wikipedia</a> (CC BY-SA)
    </p>
    <a class="wiki-kart__dis" href="${href}" target="_blank" rel="noopener"
      >DuckDuckGo'da ara ↗</a
    >`;
}

function hataKarti(href) {
  return `
    <p class="wiki-kart__ozet">Bu isim için özet şu an getirilemedi.</p>
    <a class="wiki-kart__dis" href="${href}" target="_blank" rel="noopener"
      >DuckDuckGo'da ara ↗</a
    >`;
}

function modalKur(tetikleyici) {
  const kaynak = tetikleyici.dataset.wikiKapi;
  const { dil, baslik } = kaynagiCoz(kaynak);
  const gorunenAd = tetikleyici.textContent.trim() || baslik.replaceAll('_', ' ');

  /* Künyedeki "Wikipedia" bağlantısı makalenin KENDİSİNE gitsin diye adres
     burada kuruluyor: kartın okuduğu REST uç noktası okunacak bir sayfa
     değil, JSON döndürüyor. */
  const kaynakAdresi = `https://${dil}.wikipedia.org/wiki/${baslik}`;

  const perde = document.createElement('div');
  perde.className = 'scrim';
  perde.dataset.on = 'false';

  const host = document.createElement('div');
  host.className = 'modal-host';
  host.dataset.on = 'false';
  host.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true" aria-label="${gorunenAd}">
      <header class="modal__head">
        <h2 class="modal__title">${gorunenAd}</h2>
        <button class="modal__x" type="button" aria-label="Kapat">✕</button>
      </header>
      <div class="wiki-kart">
        <p class="wiki-kart__yukleniyor">Yükleniyor…</p>
      </div>
    </div>`;

  document.body.append(perde, host);
  requestAnimationFrame(() => {
    perde.dataset.on = 'true';
    host.dataset.on = 'true';
  });
  host.querySelector('.modal__x').focus({ preventScroll: true });

  const kapat = () => {
    perde.dataset.on = 'false';
    host.dataset.on = 'false';
    document.removeEventListener('keydown', kacis);
    setTimeout(
      () => {
        perde.remove();
        host.remove();
        tetikleyici.focus({ preventScroll: true });
      },
      azHareket() ? 0 : 240
    );
  };

  const kacis = (olay) => {
    if (olay.key === 'Escape') kapat();
  };

  host.querySelector('.modal__x').addEventListener('click', kapat);
  perde.addEventListener('click', kapat);
  document.addEventListener('keydown', kacis);

  ozetGetir(kaynak)
    .then((veri) => {
      host.querySelector('.wiki-kart').innerHTML = ozetKarti(veri, tetikleyici.href, kaynakAdresi);
    })
    .catch(() => {
      host.querySelector('.wiki-kart').innerHTML = hataKarti(tetikleyici.href);
    });
}

/** Söyleşideki mangaka bağlantılarını yakalar. `document` üzerinde tek dinleyici. */
export function wikiKapisiniBaslat() {
  document.addEventListener('click', (olay) => {
    if (olay.button !== 0 || olay.metaKey || olay.ctrlKey || olay.shiftKey || olay.altKey) return;

    const tetikleyici = olay.target.closest('[data-wiki-kapi]');
    if (!tetikleyici) return;

    olay.preventDefault();
    modalKur(tetikleyici);
  });
}
