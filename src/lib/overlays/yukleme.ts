/* ============================================================================
   YÜKLEME EKRANI — ölçüm ve metin
   ----------------------------------------------------------------------------
   İki parça bir dosyada duruyor çünkü ikisinin de tek kullanıcısı var
   (`Loader.svelte`) ve ikisi de onsuz anlamsız. `depths.ts`te kimlikle metni
   ayırmanın sebebi ötekinin onları AYRI AYRI kullanmasıydı; burada öyle bir
   ikinci kullanıcı yok. Çıkarsa bölünür.

   ⚠️ YÜZDE GERÇEK. Zamana bağlı bir animasyon değil, indirilmiş dosya sayısı.
   Bu, uydurma bulmaca istatistiklerini (1.4) ve "çoğu okur burada" cümlesini
   (depths.ts) eleyen kararın aynısı: okura gösterilen sayı ölçülmüş olmak
   zorunda. Sahte bir sayaç burada özellikle kolay olurdu ve özellikle yalan
   olurdu — çünkü tam da "her şey hazır" diye söz veriyor.
   ========================================================================= */

import { assetUrl, avifSrcset, GORSEL_SIZES } from '$lib/content/assets';

/* ==========================================================================
   METİN
   --------------------------------------------------------------------------
   Sıra rastgele DEĞİL: yükleme hızlı bağlantıda bir saniyede bitiyor, yani
   çoğu okur yalnız ilk bir-iki satırı görecek. Baştakiler o yüzden derginin
   gerçekten yaptığı şeyi söylüyor; saçmalık geriye, ancak yavaş bağlantıda
   görünecek yere konuldu. Bekleme uzadıkça metin de tuhaflaşıyor — okurun
   beklediği süreyle metnin sabrı aynı yönde bozuluyor.
   ======================================================================= */

export const YUKLEME_SATIRLARI: readonly string[] = [
	'sayfalar basılıyor…',
	'mürekkep kuruyor…',
	'dergi paketleniyor…',
	'dağıtıma verildi…',
	'postacı yola çıktı…',
	'postacı yolda sosyal medyaya daldı…',
	'postacıya video önerildi…',
	'postacı iki saattir aynı videoyu izliyor…',
	'postacıya "sadece bir tane daha" dedirtildi…',
	'postacının telefonu %1…',
	'postacı şarj aleti arıyor…',
	'postacı dergiyi hatırladı…',
	'postacı koşuyor…'
];

/** Satır değişim aralığı (ms). */
export const SATIR_SURESI = 2000;

/* ==========================================================================
   ÖLÇÜM
   ======================================================================= */

/** Hiçbir görsel yanıt vermezse okur burada kilitlenmesin diye üst sınır. */
export const SABIR_SINIRI = 15000;

export interface Ilerleme {
	/** İndirilmesi beklenen birim sayısı: görseller + fontlar. */
	toplam: number;
	/** Bitenler — yüklenen VE hata verenler. Aşağıdaki nota bak. */
	biten: number;
}

/**
 * Sayının bütün görsellerini ve fontlarını önden indirir; her adımda `bildir`
 * çağrılır. Dönen fonksiyon işi iptal eder ve DOM'u temizler.
 *
 * ⚠️ SAYFANIN İSTEYECEĞİ TÜREVİN AYNISI indiriliyor: `<picture>` burada da
 * `PageBackground.svelte`teki biçimde kuruluyor (AVIF `<source>` + webp
 * `<img>`, aynı `GORSEL_SIZES`). Ayrışsalardı tarayıcı ön yüklemede 600px'i,
 * sayfada 900px'i seçer ve okur aynı fotoğrafı iki kez indirirdi — yükleme
 * ekranı da "hazır" derken sayfa hâlâ indiriyor olurdu.
 *
 * ⚠️ HATA DA "BİTTİ" SAYILIYOR. Sunucudan 404 dönen bir dosya asla
 * yüklenmeyecek; onu beklemek okuru süresiz tutmak olurdu. Yüzde "indirildi"
 * değil "artık beklenmiyor" anlamına geliyor. Kırık dosyanın kendisi burada
 * değil `validate.test.ts`te yakalanıyor — orası dosyaların varlığını zaten
 * denetliyor ve CI'ı kırmızı yakıyor.
 *
 * `loading="lazy"` BİLEREK YOK: bu düğümler 0×0 ve ekran dışında, tembel
 * olsalardı hiç yüklenmez ve yüzde asla ilerlemezdi.
 */
export function onYukle(yollar: string[], bildir: (durum: Ilerleme) => void): () => void {
	const toplam = yollar.length + 1; /* +1: fontlar */
	let biten = 0;
	let iptal = false;

	const kap = document.createElement('div');
	kap.setAttribute('aria-hidden', 'true');
	/* `display: none` DEĞİL: o alt ağaçtaki görsellerin indirilmesi tarayıcıya
	   göre değişiyor. Sıfır boyut + taşma gizli her yerde indiriyor. */
	kap.style.cssText =
		'position:absolute;width:0;height:0;overflow:hidden;opacity:0;pointer-events:none';

	function adim() {
		if (iptal) return;
		biten++;
		bildir({ toplam, biten });
	}

	for (const yol of yollar) {
		const picture = document.createElement('picture');
		const avif = avifSrcset(yol);

		if (avif) {
			const source = document.createElement('source');
			source.type = 'image/avif';
			source.srcset = avif;
			source.sizes = GORSEL_SIZES;
			picture.appendChild(source);
		}

		const img = document.createElement('img');
		img.decoding = 'async';
		img.sizes = GORSEL_SIZES;
		img.alt = '';
		img.addEventListener('load', adim, { once: true });
		img.addEventListener('error', adim, { once: true });
		/* `src` EN SONA: önce olay dinleyicileri bağlanmalı, yoksa önbellekten
		   anında gelen bir görselin `load`u kaçar ve yüzde eksik kalır. */
		img.src = assetUrl(yol);

		picture.appendChild(img);
		kap.appendChild(picture);
	}

	document.body.appendChild(kap);

	/* Fontlar tek birim: `document.fonts.ready` bir söz, ilerleme vermiyor.
	   Ölçemediğimiz için parçalamıyoruz — yarısını uydurmak yerine bütününü
	   bir adım sayıyoruz. */
	document.fonts.ready.then(adim);

	bildir({ toplam, biten });

	return () => {
		iptal = true;
		kap.remove();
	};
}
