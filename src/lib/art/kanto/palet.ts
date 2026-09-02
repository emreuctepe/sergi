/* ============================================================================
   KANTŌ PALETİ — sahnelerin tek renk kaynağı
   ----------------------------------------------------------------------------
   ⚠️ BURADA `var(--accent)` YOK, ve bu bilinçli bir sapma.

   `src/lib/art/`teki altı sahne (paper, leaves, waves, street, sumi, torii)
   renklerini tema değişkenlerinden alıyor: tema koyuya dönünce sahne de döner,
   çünkü o sahneler DESEN — bir seigaiha ızgarası açık zeminde de koyu zeminde
   de aynı şeyi anlatır.

   Buradakiler desen değil, IŞIK. `visual_design.md` §"Core style DNA" 6:
   "Extreme value structure. Large near-black masses; a small number of bright
   accents; silhouette does the storytelling." Bir alev hortumunun anlamı
   karanlığın içindeki tek parlak kütle olmasında. `--paper` açık temada
   #f5f1e8'e dönseydi hortum açık zemine düşerdi ve sahne "gece yanan şehir"
   olmaktan çıkıp turuncu bir leke olurdu — silüet okunmaz, değer yapısı çöker.

   Yani bu sahneler temayı izlemiyor; kendi gecelerini yanlarında taşıyorlar.
   Sayfa `blk--invert` ile metnini zaten açık renge çeviriyor, ikisi uyuşuyor.

   ⚠️ SAHNE BAŞINA TEK SICAKLIK AİLESİ (aynı belge, kural 7). Aşağıdaki dört
   grup KARIŞTIRILMAZ: `ATES`in içine `SEHIR`den bir mavi koymak sahnenin tek
   sıcaklık kuralını bozar. Tek istisna her grubun sonundaki `vurgu` alanı —
   sahnenin izinli olduğu TEK karşıt renk, ve o da tek bir yerde kullanılır.

   Değerler ölçülmedi, gözle seçildi: `visual_design.md` yazıldığı gün palet
   çıkarımı (Step 0) yapılmamıştı, dosyada hex tablosu yok. Referans
   görüntülerin ton aralığına bakılarak kuruldu ve o belgenin kurallarına
   (5-9 düz ton, tek vurgu, düşük doygunluk) uyuyor. Ölçülmüş sayı sanılmasın.
   ========================================================================= */

/** Bir sahnenin düz ton listesi. 5-9 arası — `visual_design.md` §Palette. */
export interface Palet {
	readonly [ton: string]: string;
}

/* ==========================================================================
   ATEŞ — yangın ve alev hortumu. Sıcak aile, gece.
   --------------------------------------------------------------------------
   Karanlıktan köze doğru on basamak. Aradaki adımlar EŞİT DEĞİL: alt uçta
   (gece → duman) fark küçük, üst uçta (alev → kul) büyük. Sebebi gözün kendisi
   — karanlıkta ayırt etme gücü yüksek, parlakta düşük. Eşit aralıklı bir
   rampa koyu ucu lapa, açık ucu basamaklı gösterirdi.

   ⚠️ ON TON, YANİ BÜTÇENİN BİR ÜSTÜ. `visual_design.md` §Palette sahne başına
   "5-9 düz ton" diyor; `SU` (8), `SEHIR` (9) ve `KIZIL` (5) bu sınırın içinde,
   bu aile değil. Kuralı hiç yazılmamış saymıyoruz, bilerek bir taviyle
   aşıyoruz ve gerekçesi şu: öbür üç aile kadrajın YALNIZ BİR BÖLÜMÜNÜ
   kaplıyor, bu aile ise tek bir formun içinde neredeyse siyahtan neredeyse
   beyaza kadar bütün aralığı yürümek zorunda. Alev hortumunun beş kabuğu +
   çekirdeği altı basamağı tek başına harcıyor; geriye gökyüzü, şehir silueti,
   duman ve ışık gölü kalıyor. Dokuz tonla ya duman bantları birleşiyor ya da
   alevin içi degradeye benziyor — ikisi de daha pahalı.

   Yeni bir ATEŞ sahnesi eklenirse bu tavizin genişlemediğine dikkat: on bir
   ton kuralın delindiği değil, kaldırıldığı anlamına gelir.
   ======================================================================= */

export const ATES = {
	gece: '#0a0807',
	kok: '#171210',
	duman: '#241b17',
	duman2: '#33251e',
	kizil: '#5e2a1c',
	kor: '#8f3a1e',
	alev: '#c2551f',
	alev2: '#e2882c',
	alev3: '#f3b544',
	/** Sahnenin en parlak noktası. Kadrajın %2'sinden fazlasına sürülmez. */
	kul: '#f6e0ac'
} as const satisfies Palet;

/* ==========================================================================
   SU — tsunami. Soğuk aile, tek sıcak vurgu.
   --------------------------------------------------------------------------
   `vurgu` yanan kıyı: dalganın ARKASINDA duruyor, önünde değil. İki felaket
   aynı karede ama aynı düzlemde değil — deprem yangını çıkardı, deniz sonra
   geldi.
   ======================================================================= */

export const SU = {
	gece: '#0a0d10',
	derin: '#16202a',
	su: '#243440',
	su2: '#375062',
	su3: '#4e6f83',
	kopuk: '#93b0bd',
	kopuk2: '#d6e4e9',
	/** Ufuktaki yangın — sahnenin izinli TEK sıcak rengi. */
	vurgu: '#8f3a1e'
} as const satisfies Palet;

/* ==========================================================================
   ŞEHİR — 2025 Tokyo. Soğuk aile, GÜNDÜZ.
   --------------------------------------------------------------------------
   Yazının son paragrafının karşılığı ve `ATES`in kasıtlı tersi: aynı
   kompozisyon dili (dikey bantlar, düz yüzeyler, tek vurgu), ters değer
   yapısı. Orada kadrajın çoğu neredeyse siyahtı; burada neredeyse beyaz.
   Yan yana konduklarında yüz yılın farkını renk anlatıyor, altyazı değil.

   `vurgu` yine `ATES`ten alınmış tek sıcak nokta: 1923'e giden tek iplik.
   ======================================================================= */

export const SEHIR = {
	gok: '#dfe7ea',
	gok2: '#cbd7dc',
	uzak: '#a8bcc5',
	orta: '#8199a6',
	yakin: '#5b7180',
	golge: '#3a4b57',
	koyu: '#222e37',
	cam: '#eef3f4',
	/** Tek yanan pencere. Bu renk `ATES.kor`un kardeşi, tesadüf değil. */
	vurgu: '#e2882c'
} as const satisfies Palet;

/* ==========================================================================
   KIZIL — düotone. `visual_design.md` "Mode C — Duotone Card".
   --------------------------------------------------------------------------
   TEK RENGİN düz tonları, nötr gölge YOK: bu kipin tanımı bu. Katliam
   sahnesi bu kipte, çünkü A kipinin (sinematik gece) gerçekçiliği burada
   yanlış olurdu — düotone bir olayı yeniden canlandırmaz, ona İŞARET eder.
   ======================================================================= */

export const KIZIL = {
	kagit: '#f4efe6',
	ac: '#e0a99c',
	orta: '#c05a45',
	koyu: '#9b2d1c',
	derin: '#5e1710'
} as const satisfies Palet;

/* ==========================================================================
   ORTAK
   ======================================================================= */

/** Bütün sahnelerin tuvali — `.page__bg > svg` 3:4'e kırpıyor. */
export const TUVAL = { g: 300, y: 400 } as const;
