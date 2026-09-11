/* ============================================================================
   HİKÂYE — üstte süre çubukları, kenarlarda dokunma: Instagram hikâyesi kurgusu
   ----------------------------------------------------------------------------
   ⚠️ İÇİNE NE KONDUĞUNU BİLMİYOR, bilmemeli. Bu modül yalnız üç şeyi biliyor:
   kaç dilim var, hangisi etkin, ve etkin dilimin süresi ne. Dilimin içinde
   karıştırılan bir yazı mı, bir fotoğraf mı, bir SVG mi duruyor — hiç umurunda
   değil. Kutunun yeniden kullanılabilir olması tam olarak bu bilmezlikten
   geliyor.

   `karistir.js`i İMPORT ETMİYOR ve etmemeli. Aşağıdaki `azHareket()` o
   dosyadaki (ve `acilis.js`teki) eşinin kopyası; ortak bir yardımcıya
   çıkarılmadı çünkü üçü ayrı katmanlara ait ve biri silindiğinde öbürleri
   çalışmaya devam etmeli. Buraya bir gün `import { karistir }` girerse hikâye
   kutusu sessizce bir metin animasyonu oynatıcısına dönüşmeye başlar.

   ────────────────────────────────────────────────────────────────────────────
   KULLANIM
   ────────────────────────────────────────────────────────────────────────────
   İçerik İŞARETLEMEDE duruyor, motorda değil:

       <div class="hik" id="hikaye">
         <div class="hik__dilim" data-dilim="baslik"> … </div>
         <div class="hik__dilim" data-dilim="sozler"> … </div>
         <div class="hik__dilim" data-dilim="kunye" > … </div>
       </div>

   Sıra ve süre LİSTEDE:

       const h = hikaye(kutu, [
         { id: 'baslik', sure: 3600, oyna: async (kanvas, isaret) => { … } },
         { id: 'sozler', sure: 6100, oyna: … },
         { id: 'kunye',  sure: 2700 }          // `oyna` yok → durağan içerik
       ], { klavye: 'belge' });

   Eşleşme `data-dilim="<id>"` üzerinden, indeksle DEĞİL: listede iki satırın
   yerini değiştirmek hikâyenin sırasını değiştiriyor, işaretlemeye dokunmadan.
   Aynı gerekçe `index.html`deki `#sira` bloğunda da yazılı — sıra tek yerde.

   Motor `kap`ın içine yalnız KROMU ekliyor: çubuklar başa, iki dokunma bölgesi
   sona. Yazarın işaretlemesine dokunmuyor.
   ========================================================================= */

/* ==========================================================================
   SAAT — ⚠️ İKİ SAAT VAR, BİRİ SAHİCİ
   --------------------------------------------------------------------------
   Asıl saat `setTimeout`. Çubuğun dolması saf CSS (`@keyframes hik-dolgu` +
   dilim başında yazılan `--hik-sure`) ve TAMAMEN SÜS.

   Bu ayrım zorunluluktu, tercih değil: bu makinede `requestAnimationFrame`
   hiçbir yüzeyde ateşlemiyor (ölçüldü, bkz. `karistir.js` §ÇEKİRDEK). Saati
   rAF'a ya da çubuğun `animationend`ine bağlamak hikâyeyi bu ortamda
   SINANAMAZ yapardı — kompozitör kısıldığında dilim hiç ilerlemezdi. `bekle()`
   zaten bütün koreografide `setTimeout`; hikâye de aynı saate bakıyor.

   Bedeli: çubuk ile saat teorik olarak birbirinden kayabilir. Kaydığında
   görünen şey yalnız çubuğun biraz erken/geç dolması — mantık etkilenmiyor,
   ve ölçüm (bkz. tezgâhtaki DİLİM SÜRELERİ tablosu) saate bakıyor.

   Duraklatma: `clearTimeout` + `performance.now()` ile biriken süre. CSS
   tarafı `animation-play-state: paused` ile bedava donuyor — `transition`
   değil `animation` seçilmesinin sebebi bu; bir geçişi yarıda dondurmak
   hesaplanmış dönüşümü okuyup geri yazmayı gerektirirdi.
   ======================================================================= */

/* Dokunuşu "basılı tutma"dan ayıran eşik (ms). Altında kalan her şey dilim
   atlıyor, üstü duraklatıyor. */
const BASMA_ESIGI = 150;

/* Hikâyenin "ekranda sayılması" için gereken görünür pay. Yarının altında
   bilerek: dergi akışında iki sayfa arasında kalan bir hikâye, tepesi henüz
   görünürken çalışmaya başlayabilmeli. */
const GORUS_PAYI = 0.35;

const BOLGELER = [
  { yon: -1, ad: 'geri', etiket: 'Önceki', yol: 'M15 6l-6 6 6 6' },
  { yon: 1, ad: 'ileri', etiket: 'Sonraki', yol: 'M9 6l6 6-6 6' }
];

/** `karistir.js` ve `acilis.js`teki eşlerinin aynısı — bkz. dosya başlığı. */
export function azHareket() {
  return (
    document.documentElement.dataset.motion === 'off' ||
    matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * `kap`ı bir hikâye kutusuna çevirir.
 *
 * @param {Element} kap            `.hik__dilim` çocuklarını taşıyan kutu
 * @param {Array<{id: string, sure: number, oyna?: (kanvas: Element, isaret: AbortSignal, bilgi: {duragan: boolean, id: string, sira: number}) => Promise<void>}>} dilimler
 * @param {object}  [ayar]
 * @param {boolean} [ayar.dongu=false]     son dilimden sonra başa sarsın mı
 * @param {boolean} [ayar.basla=true]      saat hemen işlemeye başlasın mı
 * @param {boolean} [ayar.gorus=true]      ekrandan çıkınca duraklatsın mı
 * @param {'yok'|'belge'} [ayar.klavye]    ok tuşlarını belge düzeyinde dinle
 * @returns {{git:(i:number)=>void, ileri:()=>void, geri:()=>void,
 *            durakla:(sebep?:string)=>void, surdur:(sebep?:string)=>void,
 *            dur:()=>void, say:number, readonly sira:number,
 *            readonly duraktaMi:boolean}}
 */
export function hikaye(kap, dilimler, ayar = {}) {
  const { dongu = false, basla = true, gorus = true, klavye = 'yok' } = ayar;

  if (!Array.isArray(dilimler) || dilimler.length === 0) {
    throw new Error('hikaye(): dilim listesi boş');
  }

  /* Bütün dinleyiciler tek işaretle sökülüyor — `dur()` hepsini bir çağrıda
     bırakabilsin diye. Elle `removeEventListener` yazmak, her biri için adlı
     bir fonksiyon tutmayı ve birini unutmayı davet ediyordu. */
  const kapatma = new AbortController();
  const sok = { signal: kapatma.signal };

  const otomatik = !azHareket();

  kap.classList.add('hik');
  kap.dataset.otomatik = String(otomatik);
  kap.dataset.durakta = 'false';
  kap.dataset.bitti = 'false';

  /* ── İÇERİK EŞLEME ────────────────────────────────────────────────────────
     `:scope >` ile yalnız DOĞRUDAN çocuklar: bir dilimin içine başka bir
     hikâye kutusu konursa onun dilimleri buraya karışmamalı.

     Öznitelik seçicisi yerine Map: id'de tırnak ya da köşeli parantez olsaydı
     `querySelector` kırılırdı, üstelik sessizce. */
  const bulunan = new Map();
  for (const el of kap.querySelectorAll(':scope > .hik__dilim')) {
    bulunan.set(el.dataset.dilim, el);
  }

  const kanvaslar = dilimler.map(({ id }) => {
    const el = bulunan.get(id);
    /* ⚠️ SESSİZ GEÇİLMİYOR. Eşleşmeyen bir id görünmez bir boş dilim bırakır:
       çubuk dolar, ekranda hiçbir şey olmaz ve sebebi hiçbir yerde yazmaz. */
    if (!el) console.warn(`hikaye(): "${id}" için .hik__dilim bulunamadı`);
    bulunan.delete(id);
    return el ?? null;
  });

  /* Simetrik yazım hatası: işaretlemede duran ama listede olmayan dilim. */
  for (const artan of bulunan.keys()) {
    console.warn(`hikaye(): "${artan}" dilimi listede yok, hiç gösterilmeyecek`);
  }

  kanvaslar.forEach((el, i) => {
    if (!el) return;
    el.dataset.on = 'false';
    el.setAttribute('role', 'group');
    el.setAttribute('aria-label', `${i + 1} / ${dilimler.length}`);
    /* Saydamlığı sıfır olan bir kutu erişilebilirlik ağacından DÜŞMÜYOR;
       bu satır olmasa ekran okuyucu üç dilimin hepsini birden okurdu. */
    el.setAttribute('aria-hidden', 'true');
  });

  /* ── ÇUBUKLAR ─────────────────────────────────────────────────────────────
     İşaretlemede değil burada üretiliyor: sayı listeden geliyor, yani elle
     yazılsaydı iki yerde durur ve dördüncü dilim eklendiğinde biri yalan
     söylemeye başlardı.

     Şerit `aria-hidden`: taşıdığı bilgi ("2. dilimdeyiz") dilimlerin kendi
     `aria-label`ında zaten var, iki kez duyurmanın anlamı yok. */
  const cubuklar = document.createElement('div');
  cubuklar.className = 'hik__cubuklar';
  cubuklar.setAttribute('aria-hidden', 'true');

  for (let i = 0; i < dilimler.length; i++) {
    const cubuk = document.createElement('div');
    cubuk.className = 'hik__cubuk';
    cubuk.dataset.durum = 'bos';
    const dolgu = document.createElement('i');
    dolgu.className = 'hik__dolgu';
    cubuk.append(dolgu);
    cubuklar.append(cubuk);
  }
  kap.prepend(cubuklar);

  /* ── DOKUNMA BÖLGELERİ ────────────────────────────────────────────────────
     `galeri.css` §2'deki kalıbın eşi: görünmez düğme + yalnız farede/odakta
     belirten ok işareti. Orta %40 bilerek boş — dilimin içindeki bir şey
     tıklanabilir olmak isteyebilir, ve basılı tutmanın yeri de orası. */
  for (const { yon, ad, etiket, yol } of BOLGELER) {
    const dugme = document.createElement('button');
    dugme.type = 'button';
    dugme.className = `hik__bolge hik__bolge--${ad}`;
    dugme.dataset.yon = String(yon);
    dugme.setAttribute('aria-label', etiket);
    dugme.innerHTML =
      `<span class="hik__isaret" aria-hidden="true">` +
      `<svg viewBox="0 0 24 24" class="icon"><path d="${yol}"></path></svg></span>`;
    dugme.addEventListener('click', () => (yon < 0 ? geri() : ileri()), sok);
    kap.append(dugme);
  }

  /* ====================================================================
     DURUM
     ==================================================================== */

  let sira = -1;
  let saat = 0; /* setTimeout kimliği; 0 = saat işlemiyor (okuyucu.js kalıbı) */
  let basladi = 0; /* saatin en son kurulduğu an */
  let gecen = 0; /* duraklatmalar arasında biriken süre */
  let denetci = null; /* etkin dilimin AbortController'ı */

  /* ⚠️ SEBEPLER BİR KÜME, BOOLE DEĞİL. Dört ayrı kaynak duraklatabiliyor ve
     biri biterken öbürü sürebiliyor. Tek boole olsaydı şu hata kaçınılmazdı:
     parmağını kaldırmak, EKRANDAN ÇIKMIŞ bir hikâyeyi yeniden başlatırdı. */
  const sebepler = new Set(); /* 'bas' | 'gizli' | 'gorus' | 'elle' */

  /* ⚠️ İKİ TÜR DURAKLATMA VAR ve fark koreografide, saatte değil.

       'bas' / 'elle'      OKUR BAKIYOR ama beklemek istiyor. Ekranda duran
                           kare korunmalı; perde kaldığı yerde donar.
       'gorus' / 'gizli'   KİMSE BAKMIYOR. Burada saati durdurmak YETMİYOR:
                           koreografi `bekle()` zincirinden ibaret ve kendi
                           `setTimeout`larıyla akmaya devam eder. Okur sayfaya
                           vardığında perde çoktan oynamış olur.

     Bu ölçülmüş bir hataydı: sunuş sayfası kapaktan sonra ikinci sırada ve
     okur kapakta üç saniye durduğunda ilk perdenin (6.3s) yarısı arkada akıp
     gidiyordu — dergiye girişin en iyi kısmı hiç görünmüyordu.

     Çözüm perdeyi DONDURMAK değil BAŞA SARMAK: yarıda kalmış bir zinciri
     kaldığı yerden sürdürmek her adımın kendi ilerlemesini saklamayı
     gerektirirdi, oysa perdenin tamamı zaten birkaç saniye. Okur döndüğünde
     perdeyi baştan görüyor — ve zaten görmek istediği şey o. */
  const IZLENMIYOR = new Set(['gorus', 'gizli']);
  let geriSarilacak = false;

  /* ====================================================================
     ÇUBUK BOYAMA
     ==================================================================== */

  function cubuklariBoya(i) {
    [...cubuklar.children].forEach((cubuk, j) => {
      cubuk.dataset.durum = j < i ? 'dolu' : j === i ? 'simdiki' : 'bos';
    });
  }

  /**
   * Etkin çubuğun dolgusunu BAŞTAN başlatır.
   *
   * Elemanı klonuyla değiştiriyor: geri dönülen bir dilimde CSS animasyonu
   * kendiliğinden yeniden başlamaz, `animation-name`i söküp reflow okuyup geri
   * takmak gerekirdi. Yeni bir düğüm takmak aynı işi hilesiz yapıyor.
   */
  function dolguyuBastanBaslat(i, sure) {
    const cubuk = cubuklar.children[i];
    cubuk.style.setProperty('--hik-sure', `${sure}ms`);
    const dolgu = cubuk.firstElementChild;
    dolgu.replaceWith(dolgu.cloneNode(false));
  }

  /* ====================================================================
     SAAT
     ==================================================================== */

  function saatiKur(kalan) {
    clearTimeout(saat);
    basladi = performance.now();
    saat = setTimeout(sureDoldu, Math.max(0, kalan));
  }

  function saatiDurdur() {
    if (!saat) return;
    clearTimeout(saat);
    saat = 0;
    gecen += performance.now() - basladi;
  }

  function sureDoldu() {
    saat = 0;
    if (sira < dilimler.length - 1) return git(sira + 1);
    if (dongu) return git(0);
    bitir();
  }

  function bitir() {
    if (kap.dataset.bitti === 'true') return;
    saatiDurdur();
    kap.dataset.bitti = 'true';
    kap.dispatchEvent(
      new CustomEvent('hikaye:bitti', { bubbles: true, detail: { sira } })
    );
  }

  /* ====================================================================
     GEZİNME
     ==================================================================== */

  /**
   * `i`. dilime geçer. Aynı indekse gitmek dilimi BAŞTAN oynatıyor —
   * "Tekrar" düğmesi ve ilk dilimde geri dokunması buna dayanıyor.
   */
  function git(i) {
    const hedef = Math.max(0, Math.min(dilimler.length - 1, i));
    const d = dilimler[hedef];

    /* Önceki dilimin koreografisi kesiliyor. Bu çağrı olmadan iki `karistir`
       döngüsü aynı elemana yazar: metin titrer ve geri dönülen dilim bozuk
       açılır (bkz. `karistir.js` §İPTAL). */
    denetci?.abort();

    clearTimeout(saat);
    saat = 0;
    gecen = 0;
    geriSarilacak = false; /* yeni dilim zaten baştan oynuyor */
    kap.dataset.bitti = 'false';

    sira = hedef;
    kap.dataset.dilim = d.id;

    kanvaslar.forEach((el, j) => {
      if (!el) return;
      const acik = j === hedef;
      el.dataset.on = String(acik);
      el.setAttribute('aria-hidden', String(!acik));
    });

    const sure = Number.isFinite(d.sure) && d.sure > 0 ? d.sure : 3000;
    if (sure !== d.sure) {
      console.warn(`hikaye(): "${d.id}" dilimi geçersiz süre verdi (${d.sure}), 3000ms kullanılıyor`);
    }

    cubuklariBoya(hedef);
    dolguyuBastanBaslat(hedef, sure);

    /* ── KOREOGRAFİ ──────────────────────────────────────────────────────
       Motor `oyna()`yı başlatıyor ama BİTMESİNİ BEKLEMİYOR: dilimin süresini
       çubuk belirliyor, animasyon değil. `oyna` erken biterse kalan süre bir
       duraklama oluyor (Instagram'ın davranışı, ve 2. perdedeki okuma
       payının ta kendisi); geç biterse ortasından kesiliyor — tezgâhtaki
       DİLİM SÜRELERİ tablosu bunu sayıyla yakalıyor. */
    denetci = new AbortController();
    const isaret = denetci.signal;

    /* ⚠️ `duragan` KABUĞUN BİLGİSİ, içeriğin değil — o yüzden buradan geçiyor.
       Otomatik geçiş kapalıyken (hareket azaltma) dilim kendiliğinden
       bitmiyor: okur ona istediği kadar bakıyor. Yani koreografinin ÇIKIŞ
       adımları çalıştırılmamalı.

       Bu, ölçülmüş bir hataydı: `karistir()` hareket azaltmada hedefi ANINDA
       yazıyor, dolayısıyla "dağıl" adımı da anında koşuyor ve dilim BOŞ
       kalıyordu. Okur ekranda hiçbir şey görmüyordu. İçeriği yazan
       `bilgi.duragan` doğruysa dinlenme düzeninde durup dönüyor. */
    const bilgi = { duragan: !otomatik, id: d.id, sira: hedef };
    const ham = d.oyna ? d.oyna(kanvaslar[hedef], isaret, bilgi) : undefined;

    /* ⚠️ BU SÖZ HİÇ REDDEDİLMİYOR, bilerek. İptal edilmiş bir dilimin reddi
       BEKLENEN şey (koreografi `isaret`e uyup zinciri kesti) ve `hikaye:dilim`
       olayını dinleyen her yere `catch` yazdırmak istemiyoruz. Gerçek hatalar
       yutulmuyor ama: konsola yazılıyor.

       İptali `isaret.aborted`dan anlıyoruz, hatanın TÜRÜNDEN değil — motor
       `karistir.js`in `IPTAL` değerini tanımıyor ve tanımamalı. */
    const soz = Promise.resolve(ham).then(
      () => ({ iptal: false }),
      (hata) => {
        if (isaret.aborted) return { iptal: true };
        console.error(`hikaye(): "${d.id}" dilimi hata verdi`, hata);
        return { iptal: false, hata };
      }
    );

    kap.dispatchEvent(
      new CustomEvent('hikaye:dilim', {
        bubbles: true,
        detail: { id: d.id, sira: hedef, sure, soz }
      })
    );

    if (otomatik && sebepler.size === 0) saatiKur(sure);
  }

  function ileri() {
    if (sira < dilimler.length - 1) return git(sira + 1);
    if (dongu) return git(0);
    /* Son dilimde ileri = hikâyeyi bitir. Instagram burada hikâyeyi kapatıyor;
       gömüldüğü yerin ne yapacağına `hikaye:bitti`yi dinleyen karar verir. */
    bitir();
  }

  function geri() {
    /* İlk dilimde geri: gidecek bir yer yok ama dokunuş cevapsız kalmamalı,
       dilim baştan oynuyor. Bu yüzden bölge düğmeleri uçlarda `disabled`
       OLMUYOR — galeri koridorunun tersine, çünkü orada uç gerçekten uçtu. */
    git(Math.max(0, sira - 1));
  }

  /* ====================================================================
     DURAKLATMA
     ==================================================================== */

  function durakla(sebep = 'elle') {
    sebepler.add(sebep);
    kap.dataset.durakta = 'true';
    saatiDurdur();

    /* Kimse bakmıyorsa koreografi de kesiliyor (bkz. §IZLENMIYOR). Bayrak
       `git()`te temizleniyor, yani okur dilim atlarsa geri sarma borcu da
       düşüyor — gidilen dilim zaten baştan oynayacak. */
    if (!IZLENMIYOR.has(sebep) || geriSarilacak) return;
    if (sira < 0 || kap.dataset.bitti === 'true') return;
    denetci?.abort();
    geriSarilacak = true;
  }

  function surdur(sebep = 'elle') {
    sebepler.delete(sebep);
    if (sebepler.size) return;
    kap.dataset.durakta = 'false';

    /* ⚠️ `!otomatik` KONTROLÜNDEN ÖNCE. Hareket azaltmada da perde geri
       gelmeli: `git()` orada saat kurmuyor ama dilimin DİNLENME DÜZENİNİ
       çiziyor (`bilgi.duragan`). Aşağıdaki erken dönüşün ardına kalsaydı
       ekrana dönen okur kesilmiş, yarım bir kare bulurdu. */
    if (geriSarilacak) {
      geriSarilacak = false;
      return git(sira);
    }

    if (!otomatik || sira < 0 || kap.dataset.bitti === 'true') return;
    saatiKur(dilimler[sira].sure - gecen);
  }

  /* ── BASILI TUTMA ─────────────────────────────────────────────────────────
     Kutunun TAMAMINDA, yalnız bölgelerde değil: ortadaki serbest alanda
     basılı tutmak da duraklatmalı. */
  let basSaati = 0;
  let basiliTutuldu = false;

  kap.addEventListener(
    'pointerdown',
    (olay) => {
      if (olay.pointerType === 'mouse' && olay.button !== 0) return;
      basiliTutuldu = false;
      clearTimeout(basSaati);
      basSaati = setTimeout(() => {
        basiliTutuldu = true;
        durakla('bas');
      }, BASMA_ESIGI);
    },
    sok
  );

  /* ⚠️ BIRAKMA BELGE DÜZEYİNDE. Parmak kutudan çıkıp dışarıda kalkarsa
     `kap`ın `pointerup`ı hiç gelmez ve hikâye sonsuza kadar duraklı kalırdı —
     `galeri.js`teki sürükleme bırakması da aynı gerekçeyle belgede. */
  const birak = () => {
    clearTimeout(basSaati);
    basSaati = 0;
    if (basiliTutuldu) surdur('bas');
  };
  document.addEventListener('pointerup', birak, sok);
  document.addEventListener('pointercancel', birak, sok);

  /* Basılı tutmanın ARDINDAN GELEN tıklamayı yutuyor: yoksa duraklatmak için
     basılı tutmak aynı zamanda dilim atlardı. Yakalama evresinde, çünkü hedef
     bölge düğmesinin kendi dinleyicisine varmadan kesilmesi gerekiyor.

     `basiliTutuldu` burada sıfırlanıyor, `birak()`ta değil: `pointerup`
     `click`ten ÖNCE geliyor, orada sıfırlanırsa bayrak hiç görülmezdi. */
  kap.addEventListener(
    'click',
    (olay) => {
      if (!basiliTutuldu) return;
      basiliTutuldu = false;
      olay.preventDefault();
      olay.stopPropagation();
    },
    { capture: true, signal: kapatma.signal }
  );

  /* ── SEKME ARKAYA DÜŞTÜ ───────────────────────────────────────────────────
     ⚠️ YALNIZ GEÇİŞ DİNLENİYOR, açılıştaki durum OKUNMUYOR. Sebebi ölçülmüş
     bir tuzak: bu makinede tarayıcı paneli bir dönem kalıcı olarak
     `visibilityState: "hidden"` kalıyordu (bkz. `karistir.js` §ÇEKİRDEK).
     Açılışta duruma bakılsaydı hikâye o yüzeyde daha ilk kareden duraklı
     doğar ve hiç ilerlemezdi — yani sınanamazdı. Hiç `visibilitychange`
     ateşlemeyen bir yüzeyde bu dinleyici sessiz kalıyor, hikâye çalışıyor. */
  document.addEventListener(
    'visibilitychange',
    () => (document.visibilityState === 'hidden' ? durakla('gizli') : surdur('gizli')),
    sok
  );

  /* ── EKRANDAN ÇIKTI ───────────────────────────────────────────────────────
     Şart, süs değil: bu kutu dergi sayfasının içinde duruyor (`ed-sunus`) ve
     okur daha ona varmadan hikâye yanıp bitmiş olmamalı.

     ⚠️ BURADAKİ `durakla('gorus')` SAATTEN FAZLASINI YAPIYOR: koreografiyi de
     kesip dilimi geri sarıyor (bkz. §IZLENMIYOR). Yalnız saati durdurmak
     yetmiyordu — perde kendi `setTimeout`larıyla arkada akmaya devam ediyordu.

     Sayfalar `data-inview` taşıyor (`okuyucu.js` §giriş animasyonları) ama
     motor ona BAĞLANMIYOR, kendi gözcüsünü kuruyor: tezgâhta okuyucu yok ve
     ikisinde aynı çalışması gerekiyor. */
  let gozcu = null;
  if (gorus) {
    gozcu = new IntersectionObserver(
      ([giris]) => (giris.isIntersecting ? surdur('gorus') : durakla('gorus')),
      { threshold: GORUS_PAYI }
    );
    gozcu.observe(kap);
  }

  /* ── KLAVYE ───────────────────────────────────────────────────────────────
     İki bölge gerçek `<button>`, yani Enter/Space bedava çalışıyor. Ok tuşları
     BELGE DÜZEYİNDE ve varsayılan KAPALI: `galeri.js` ArrowLeft/Right'ı sergi
     koridorunda kullanıyor, iki dinleyici aynı tuşta kavga ederdi. Tezgâh bu
     bayrağı açıyor, sayfaya gömülen hikâye açmıyor. */
  if (klavye === 'belge') {
    document.addEventListener(
      'keydown',
      (olay) => {
        if (olay.defaultPrevented || olay.metaKey || olay.ctrlKey || olay.altKey) return;
        if (olay.key === 'ArrowRight') {
          olay.preventDefault();
          ileri();
        } else if (olay.key === 'ArrowLeft') {
          olay.preventDefault();
          geri();
        }
      },
      sok
    );
  }

  /* ====================================================================
     KAPATMA
     ==================================================================== */

  function dur() {
    denetci?.abort();
    clearTimeout(saat);
    saat = 0;
    clearTimeout(basSaati);
    gozcu?.disconnect();
    kapatma.abort(); /* bütün dinleyiciler tek hamlede sökülüyor */
  }

  /* ====================================================================
     BAŞLAT
     --------------------------------------------------------------------
     `basla: false` ile de İLK DİLİM OYNUYOR, yalnız saat işlemiyor: kutu boş
     durmasın ve tezgâh poz verdirebilsin diye. Bunun için ayrı bir kod yolu
     yok, `durakla('elle')` yetiyor — `surdur('elle')` saati başlatıyor.
     ==================================================================== */

  if (!basla) durakla('elle');
  git(0);

  return {
    git,
    ileri,
    geri,
    durakla,
    surdur,
    dur,
    say: dilimler.length,
    get sira() {
      return sira;
    },
    get duraktaMi() {
      return sebepler.size > 0;
    }
  };
}
