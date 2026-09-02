/* ============================================================================
   ALEV HORTUMU — dört karelik döngünün geometrisi
   ----------------------------------------------------------------------------
   Yazıdaki cümle: "Yüzlerce yangının üzerine alev tornadosu denen bir tür
   hortum da başladı." Sahnenin canlandırmak zorunda olduğu şey bu — duran bir
   alev resmi değil, KIVRANAN bir sütun.

   ⚠️ DÖRT KARE, SANİYEDE DÖRT. Daha akıcı bir animasyon burada YANLIŞ olurdu:
   `visual_design.md`in bütün dil kuralları (sıfır kontur, sayılabilir yüzey,
   form içinde degrade yok) sürekliliği reddediyor. Kare atlayan hareket o
   dilin zamandaki karşılığı — yüzeyler nasıl basamaklıysa hareket de öyle.
   SMIL tarafında bunun adı `calcMode="discrete"`; ara değer üretmiyor, kareden
   kareye ZIPLIYOR.

   ⚠️ KARELER ARASINDA GEÇİŞ YOK demek, karelerin nokta sayısının tutmak
   ZORUNDA OLMAMASI demek. Yine de hepsi aynı sayıda üretiliyor: bir gün
   `calcMode` kaldırılırsa animasyon bozulmasın, yavaşlasın.

   ⚠️ RASTGELELİK YOK. `leaves`/`street` sahnelerinin aksine burada tek bir
   `rng` çağrısı geçmiyor — sütun tamamen sinüsten. Sebebi: hortumun kıvrımı
   AŞAĞIYA DOĞRU İLERLEMELİ. Rastgele serpiştirilmiş bir kıvrım her karede
   başka yerde olur ve göz hareket değil titreme görür. Korlar da öyle:
   yükseliyorlar, zıplamıyorlar.

   ⚠️ İLK SÜRÜM MUM ALEVİNE BENZİYORDU, ekranda görülüp değişti. Üç sebebi
   vardı ve üçü de burada düzeltildi:

     1. Sütun tuvalin İÇİNDE başlıyordu (`UST = 44`) ve tepesi düz kesiliyordu.
        Şimdi kadrajın üstünden çıkıyor — bir hortumun tepesi görünmez.
     2. Simetrikti. Şimdi `EGIM` ile yukarı doğru sağa yatıyor.
        Dikey duran şey mum, yatan şey hortum.
     3. Çekirdek çok genişti; kadrajın ortasında kocaman krem bir yaprak
        duruyordu. Şimdi `cekirdek()` yalnız tabana yakın kısmı çiziyor —
        en parlak yer ateşin en sıcak yeri, yani dibi.
   ========================================================================= */

/** Sütunun üst ucu. NEGATİF: tuvalin dışından başlıyor, tepesi kesilmiyor. */
const UST = -30;
/** Ayağın yere bastığı yer — şehir siluetinin ufuk çizgisiyle aynı. */
const TABAN = 302;
/** Kaç yatay dilim. Az: kenarlar SAYILABİLİR düz parça olmalı (kural 2). */
const DILIM = 9;
/** Döngünün kare sayısı. */
export const KARE = 4;
/** Sütunun yukarı doğru sağa yatması. Dikey bir sütun mum gibi durur. */
const EGIM = 22;

/**
 * Kabukların genişlik çarpanı — dıştan içe.
 *
 * Beş kabuk, beş ton: duman → köz → alev → alev2 → alev3. Sayı
 * `visual_design.md` §Palette'in "5-9 düz ton" bütçesine bilerek yakın;
 * altıncı bir kabuk sahneyi ton sayısıyla değil, GEÇİŞİN yumuşaklığıyla
 * bozardı — beş basamak hâlâ sayılıyor, altı basamak degradeye benziyor.
 */
export const KABUK_CARPANLARI = [1, 0.74, 0.52, 0.32, 0.15] as const;

const yuvarla = (n: number) => Number(n.toFixed(1));

const y_ = (t: number) => UST + t * (TABAN - UST);

/** Dilimin yarı genişliği. `t`: 0 tepe, 1 ayak. Tepede geniş, ayakta dar. */
function yariGenislik(t: number): number {
	return 5 + 46 * Math.pow(1 - t, 1.35);
}

/**
 * Dilimin merkezi.
 *
 * Genlik `(1 - t)` ile çarpılıyor: hortum YERE ÇİVİLİ, tepesi savruluyor.
 * Tersi (tepede sabit, ayakta savrulan) fiziksel olarak da yanlış olurdu,
 * görsel olarak da — sütun yerden kopmuş gibi durur.
 */
function merkez(t: number, faz: number): number {
	return 150 + EGIM * (1 - t) + 28 * (1 - t) * Math.sin(t * 5.8 + faz);
}

/** Kabuklar aynı anda kıvrılmasın diye her birine ayrı faz gecikmesi. */
const faz = (kare: number, gecikme: number) => (kare * Math.PI) / 2 + gecikme;

/**
 * Bir kabuğun dört karesi, `d` özniteliği olarak.
 *
 * Yol sol kenardan aşağı iner, sağ kenardan yukarı çıkar ve kapanır. Hepsi
 * `L` — tek bir eğri komutu yok, çünkü kural 2 eğri yüzey kabul etmiyor.
 *
 * `t0` kabuğun nereden başladığı: 0 tepeden, 0.5 yarıdan. Çekirdek bunu
 * kullanıyor.
 */
function kabuk(carpan: number, gecikme: number, t0 = 0, sivri = false): string[] {
	const kareler: string[] = [];

	for (let kare = 0; kare < KARE; kare++) {
		const f = faz(kare, gecikme);
		const sol: string[] = [];
		const sag: string[] = [];

		for (let i = 0; i <= DILIM; i++) {
			const t = t0 + (i / DILIM) * (1 - t0);
			const y = yuvarla(y_(t));
			const cx = merkez(t, f);
			/* `sivri`: en üst dilim sıfır genişlikte, yani kabuk bir UÇLA başlıyor.
			   Sütunun ortasından başlayan çekirdek bunsuz düz bir kenarla
			   kesiliyordu ve ekranda alevin içinde asılı duran bir şerit gibi
			   görünüyordu — parlak, ama neye ait olduğu belirsiz. */
			const w = sivri && i === 0 ? 0 : yariGenislik(t) * carpan;
			sol.push(`${yuvarla(cx - w)},${y}`);
			sag.unshift(`${yuvarla(cx + w)},${y}`);
		}

		kareler.push(`M${sol.join('L')}L${sag.join('L')}Z`);
	}

	return kareler;
}

/** Beş kabuk × dört kare. Dış kabuk önce — çizim sırası da bu. */
export function hortumKabuklari(): string[][] {
	return KABUK_CARPANLARI.map((carpan, i) => kabuk(carpan, i * 0.55));
}

/**
 * Çekirdek: kadrajın en parlak yeri, ve en KÜÇÜĞÜ.
 *
 * `t0 = 0.62` — sütunun yalnız alt üçte biri. Ateşin en sıcak yeri dibidir;
 * tepeye kadar uzanan bir çekirdek hem yanlış hem de kadrajın parlak alan
 * bütçesini (kural 6) tek başına tüketiyordu. İlk ölçüde (0.34 / 0.52) hâlâ
 * kalındı ve alevin ortasında ayrı bir şerit gibi duruyordu; daralttıktan ve
 * ucunu sivrilttikten sonra alevin İÇİ oldu.
 */
export function cekirdekKareleri(): string[] {
	return kabuk(0.22, 0.55 * 2, 0.62, true);
}

/* ==========================================================================
   SARMAL — DENENDİ VE ÇIKARILDI (bkz. scenes.ts'teki `portrait` notu)
   --------------------------------------------------------------------------
   Sütunu saran koyu şeritler vardı: fire whirl'ü mum alevinden ayıran şey
   dönmedir, dönmeyi de yüzeyi kesen bantlar gösterir. Fikir doğruydu, çıktı
   değildi.

   Üç şerit, dış kabukla aynı fazdan üretiliyordu (yani hep içeride kalıyordu),
   önce yatay sonra eğik denendi. İkisi de ekranda AYNI şeyi verdi: alevin
   üstüne yapıştırılmış yarı saydam dikdörtgenler. Sebebi düz kenarların birden
   fazla renk bandını aynı anda kesmesi — göz onu "dönen yüzey" diye değil,
   "üstteki katman" diye okuyor.

   Şerit olmadan da sütun hortum gibi duruyor: eğim (`EGIM`), yukarı doğru
   açılan profil ve dört karelik kıvranma zaten dönmeyi anlatıyor. Kod git'te
   duruyor; aynı fikir bir gün kabuğun KENDİ kenarına çentik açarak (üstüne
   katman koymadan) denenebilir.
   ========================================================================== */

/* ==========================================================================
   KORLAR — sütundan kopup yükselen kıvılcımlar
   ======================================================================= */

export interface Kor {
	x: number;
	y: number;
	/** Kenar uzunluğu. Kare çiziliyor, çember değil: kural 2. */
	e: number;
}

/** Kaç kıvılcım. Sekiz: ilk denemedeki on bir konfetiye benziyordu. */
const KOR_SAYISI = 8;

/**
 * Korların dört karesi.
 *
 * Her kıvılcımın kendi hızı var ama hepsi YUKARI gidiyor. Dört karede tepeye
 * varmıyorlar; döngü başa sarınca aşağıdan devam ediyormuş gibi görünsün diye
 * yükseliş sarmalanıyor (`modulo`). Sarmalama olmadan dördüncü karede hepsi
 * tavanda toplanır ve beşinci karede (yani döngü başında) hep birden aşağı
 * ışınlanırdı.
 */
export function korKareleri(): Kor[][] {
	const kareler: Kor[][] = [];
	/* Korlar tuvalin İÇİNDE kalıyor: sütun yukarıda kadrajı terk ediyor ama
	   kıvılcımın görünmeyen yerde sürüklenmesinin bir anlamı yok. */
	const ust = 20;
	const yukseklik = TABAN - ust;

	for (let kare = 0; kare < KARE; kare++) {
		const kor: Kor[] = [];

		for (let i = 0; i < KOR_SAYISI; i++) {
			/* Başlangıç yerleri de sinüsten, çünkü sütunun kıvrımını İZLEMELİLER:
			   kıvılcım alevin dışından değil içinden kopuyor. */
			const t0 = (i * 0.41 + 0.07) % 1;
			const hiz = 10 + (i % 4) * 6;
			const kalan = (t0 * yukseklik - kare * hiz + yukseklik) % yukseklik;
			const y = ust + kalan;
			const t = (y - UST) / (TABAN - UST);
			/* Yanal kayma: yükseldikçe sütundan uzaklaşıyor. */
			const yon = i % 2 === 0 ? 1 : -1;
			const x = merkez(t, i * 0.9) + yon * (yariGenislik(t) * 0.75 + (1 - t) * 18);

			kor.push({ x: yuvarla(x), y: yuvarla(y), e: 1.2 + (i % 3) * 0.6 });
		}

		kareler.push(kor);
	}

	return kareler;
}
