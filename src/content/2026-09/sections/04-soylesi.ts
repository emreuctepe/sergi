/* ==========================================================================
   04 · KARGAMANGA
   --------------------------------------------------------------------------
   9 sayfa: sy-acilis + sy-1…sy-8. Her soru-cevap KENDİ sayfasında, cevabın
   altında o cevaba eşlik eden çizim.

   Kaynak: KargaManga ile yapılan röportajın dizgi dosyası (iki sütunlu tek
   sayfa). Oradan yalnız METİN ve GÖRSEL EŞLEŞMESİ alındı; sütun düzeni tuvale
   girmiyor — tuval dikey ve snap'li, iki sütun orada okunmaz.

   Bu bölüm sayının prototipten AYRILAN ilk yeri: yerine geçtiği "Fener Ustası"
   uydurma bir söyleşiydi (bkz. docs/BUILD-TODO.md karar 1.42).

   Blok kimlikleri (`sayfaId:index`) yorum ankrajıdır — bir bloğu silmek
   ya da taşımak ona bağlı yorumları etkiler. Sıra değiştirirken
   kimlikleri OLDUĞU GİBİ bırak; docs/YORUM-SISTEMI.md §2.1.
   ======================================================================= */

import type { Section } from '$lib/content/types';

export const soylesi: Section = {
	slug: 'soylesi',
	type: 'interview',
	title: 'KargaManga',
	kicker: 'Röportaj',
	author: 'Emre',
	minutes: 5,
	tags: ['manga', 'portre'],
	pages: [
		{
			id: 'sy-acilis',
			depth: ['all'],
			kind: 'opener',
			fit: 'contain',
			bleed: 'full',
			/* Kanal afişi (1707×282) önce arka plan, sonra kendi oranında bir blok
			   olarak denendi; ikisi de tutmadı (karar 1.44). Yerine çizerin kendi
			   karga portresi geldi — dikey, tuvalin oranına yakın ve bölümün sesi
			   zaten bu. ⚠️ Kaynak 405×720, yani arka plan için önerilen 1200×1600'ün
			   altında; büyük ekranda yumuşak görünüyor (karar 1.45). */
			bg: 'img:assets/2026-09/soylesi/kapak.webp',
			scene: 'mask-wipe',
			blocks: [
				{ t: 'kicker', id: 'sy-acilis:0', text: 'Röportaj', invert: true },
				{ t: 'h1', id: 'sy-acilis:1', text: 'KargaManga Kimdir?', invert: true },
				{
					t: 'lead',
					id: 'sy-acilis:2',
					invert: true,
					text: 'Küçük yaşlardan itibaren manga-anime kültürüne ilgi duyan ve zamanla kendisi de bu alanda eserler üretmeye çalışan bir çizer.'
				}
			]
		},
		{
			id: 'sy-1',
			depth: ['all'],
			fit: 'scroll',
			scene: 'fade-up',
			blocks: [
				{
					t: 'dialog',
					id: 'sy-1:0',
					who: 'q',
					text: 'Düzenli olarak içerik üretmenizdeki motivasyon nedir? Sürekliliği nasıl sağlıyorsunuz?'
				},
				{
					t: 'dialog',
					id: 'sy-1:1',
					who: 'a',
					name: 'KargaManga',
					text: 'Çizim yapmak ve hikâyeler oluşturmak, hâlihazırda en keyif aldığım aktiviteler. Özellikle ortaya çıkardığım ürünün son hâlini görmenin verdiği tatmin duygusu, bir sonraki oluşturacağım içerik için beni heyecanlandırıyor. En büyük motivasyonumun ise içeriklerime ilgi duyan ve desteğini esirgemeyen insanların yorumlarını okumak olduğunu söyleyebilirim.'
				},
				{
					t: 'figure',
					id: 'sy-1:2',
					img: 'assets/2026-09/soylesi/01-motivasyon.webp',
					alt: 'Taçlı bir kral, gülen bir çocuğun başını okşuyor.'
				}
			]
		},
		{
			id: 'sy-2',
			depth: ['mid', 'full'],
			fit: 'scroll',
			scene: 'fade-up',
			blocks: [
				{ t: 'dialog', id: 'sy-2:0', who: 'q', text: 'Nihai hedefiniz nedir?' },
				{
					t: 'dialog',
					id: 'sy-2:1',
					who: 'a',
					name: 'KargaManga',
					text: 'Sanırım tek bir nihai hedefim yok. Genel olarak, hatırlanacak ve okuyucuyu etkisi altına alacak hikâyeler oluşturmak diyebilirim.'
				},
				{
					t: 'figure',
					id: 'sy-2:2',
					img: 'assets/2026-09/soylesi/02-hedef.webp',
					alt: 'Kollarını havaya kaldırmış, gözleri kapalı sevinen bir çocuk.'
				}
			]
		},
		{
			id: 'sy-3',
			depth: ['all'],
			fit: 'scroll',
			scene: 'fade-up',
			blocks: [
				{
					t: 'dialog',
					id: 'sy-3:0',
					who: 'q',
					text: 'Mangalara olan ilgin nasıl başladı ve nereye doğru gidiyor sence?'
				},
				{
					t: 'dialog',
					id: 'sy-3:1',
					who: 'a',
					name: 'KargaManga',
					text: 'Mangaya olan ilgim, Naruto serisiyle başladı. Onun sayesinde bu kültürle tanıştım ve sonrasında başka serilerle de deneyimimi sürdürdüm. İnsanların zihinlerindeki hikâyeleri çizerek bunları bu kadar güzel bir şekilde karşı tarafa aktarabildiğini görünce, “Ben de bunu yapmak istiyorum.” diyerek kendimi bu yönde geliştirdim. Tüketici olarak başladığım bu sektörde, üretici olmaya çalışarak devam ediyorum.'
				},
				{
					t: 'figure',
					id: 'sy-3:2',
					img: 'assets/2026-09/soylesi/03-baslangic.webp',
					alt: 'Kareli defter kâğıdına çizilmiş iki profil, aralarında çiçek taçyapraklarının ortasında duran bir figür.'
				}
			]
		},
		{
			id: 'sy-4',
			depth: ['all'],
			fit: 'scroll',
			scene: 'fade-up',
			blocks: [
				{
					t: 'dialog',
					id: 'sy-4:0',
					who: 'q',
					text: 'İçerikleriniz kitle kaygısı olmaksızın olumlu duygu ve düşünceler üzerine kurulu. Daha büyük kitlelere ulaşmak uğruna kitle memnun eden içeriklere yönelmektense kendi tarzınızda ilerlemek konusunda ne düşünüyorsunuz?'
				},
				{
					t: 'dialog',
					id: 'sy-4:1',
					who: 'a',
					name: 'KargaManga',
					text: 'Sosyal medyada mizahi içeriklerin daha popüler olduğu bir gerçek. Genelde komik bir içerik gördüğünüzde bunu arkadaşlarınızla paylaşırsınız, bu da o videonun algoritmasını önemli derecede etkiler. Benim oluşturduğum içerikler ise biraz bunun dışında kalıyor. Başlangıçta bu yüzden, “Acaba mizahi içerikler mi üretmeliyim?” diye kendime sormadım değil. Çünkü geçmişte de absürt komedi tarzında içerikler yazıyordum ve bu daha büyük bir kitleye hitap etmemi sağlayabilirdi. Ama sonrasında şunu fark ettim: Mizahi içerikler oluşturmaktansa, şu an yaptığım gibi insan psikolojisi üzerine, izleyen kişinin empati kurabileceği veya üzerine düşünebileceği içerikler yapmak çok daha hoşuma gidiyor. Bu tarz içerikler oluşturmanın bana da iyi geldiğini fark ettim. Mizahi içerikler oluşturmak için her zaman uygun modda olmayabilirim ama şu an yaptığım içerik türü, kötü bir moddaysam bile o moddan çıkmamı sağlayabilecek türde. Tabii yine de bazı içeriklerime biraz mizah eklemenin, tamamen düşündürücü olmasından daha iyi olabileceğini de düşünüyorum. Aksi hâlde okuyucuda fazla karamsar bir etki bırakabilirim.'
				},
				{
					t: 'figure',
					id: 'sy-4:2',
					img: 'assets/2026-09/soylesi/04-tarz.webp',
					alt: 'Gün batımında çimenlikte karşılıklı oturan iki siluet, arkalarında ışıkları yanan şehir.'
				}
			]
		},
		{
			id: 'sy-5',
			depth: ['mid', 'full'],
			fit: 'scroll',
			scene: 'fade-up',
			blocks: [
				{
					t: 'dialog',
					id: 'sy-5:0',
					who: 'q',
					text: 'Çizimlerinin yanında yazdığın olay örgüleri de gerçekten çok başarılı. Hikâye kurgulama konusunda özel olarak çalışıyor musun?'
				},
				{
					t: 'dialog',
					id: 'sy-5:1',
					who: 'a',
					name: 'KargaManga',
					text: 'Günümün bir kısmında bunun üzerine düşünüyorum ama en hoşuma giden konular genelde üzerine düşündüğümde değil, günün bir vakti ansızın aklıma gelenler oluyor. Geldiği zaman kenara not alıyorum ve videoya dönüştürmek istediğimde de diyalog ekleyerek son hâlini veriyorum.'
				},
				{
					t: 'figure',
					id: 'sy-5:2',
					img: 'assets/2026-09/soylesi/05-kurgu.webp',
					alt: 'Koyu bir zeminde, ana hatları soluklaşmış beyaz gömlekli bir figür.'
				}
			]
		},
		{
			id: 'sy-6',
			depth: ['full'],
			fit: 'scroll',
			scene: 'fade-up',
			blocks: [
				{
					t: 'dialog',
					id: 'sy-6:0',
					who: 'q',
					text: 'Çizimlerinde örnek aldığın mangakalar kimler?'
				},
				{
					t: 'dialog',
					id: 'sy-6:1',
					who: 'a',
					name: 'KargaManga',
					/* Dört mangaka adı Vikipedi'ye bağlandı: okur için bu isimler
					   bir sonraki adımın kendisi, aramaya göndermenin anlamı yok.

					   ⚠️ Üçü Türkçe Vikipedi, Murata İNGİLİZCE — Türkçesi yok
					   (`Yusuke Murata`, `Yūsuke Murata`, `Murata Yusuke` üç yazım
					   da boş; API ile bakıldı). Türkçesi açılırsa bu bağ da
					   tr'ye döner.

					   Bağ metinleri röportajın kendi sözleri: metin "Murata
					   Yusuke" diyor (Japonca sıra), Vikipedi maddesi "Yusuke
					   Murata". Adres maddeye gider, GÖRÜNEN ad konuşanın
					   yazdığı gibi kalır — alıntıyı düzeltmek bize düşmez. */
					text: 'Kendi tarzımı oluşturmaya başladığım süreçte çizimlerini çok beğendiğim, incelediğim ve örnek almaya çalıştığım birçok mangaka oldu. Bunlardan bazıları [Masashi Kishimoto](https://tr.wikipedia.org/wiki/Masashi_Kishimoto), [Junji Ito](https://tr.wikipedia.org/wiki/Junji_Ito), [Takeshi Obata](https://tr.wikipedia.org/wiki/Takeshi_Obata) ve [Murata Yusuke](https://en.wikipedia.org/wiki/Yusuke_Murata) diyebilirim. Bu mangakaların eserleri hem okumaya hem de örnek almaya değer.'
				},
				{
					t: 'figure',
					id: 'sy-6:2',
					img: 'assets/2026-09/soylesi/06-mangakalar.webp',
					alt: 'Dolunayın önünde, bulutların üstünde duran pelerinli karanlık bir figür.'
				}
			]
		},
		{
			id: 'sy-7',
			depth: ['full'],
			fit: 'scroll',
			scene: 'fade-up',
			blocks: [
				{ t: 'dialog', id: 'sy-7:0', who: 'q', text: 'Hiç âşık oldun mu?' },
				{
					t: 'dialog',
					id: 'sy-7:1',
					who: 'a',
					name: 'KargaManga',
					text: 'Bu konuları konuşmak beni utandırdığı için pas geçeceğim, kusura bakma asdfjkasjda)'
				},
				{
					t: 'figure',
					id: 'sy-7:2',
					img: 'assets/2026-09/soylesi/07-ask.webp',
					alt: 'Yan yana duran bir kız ve bir erkek; kızın arkasında gökkuşağı renginde bir halka.'
				}
			]
		},
		{
			id: 'sy-8',
			depth: ['mid', 'full'],
			fit: 'scroll',
			scene: 'fade-up',
			blocks: [
				{
					t: 'dialog',
					id: 'sy-8:0',
					who: 'q',
					text: 'Hayatının her beş senesini bir kelimeyle anlatır mısın?'
				},
				{
					t: 'dialog',
					id: 'sy-8:1',
					who: 'a',
					name: 'KargaManga',
					text: '0-5, bulanık. 5-10, bilinç. 10-15, farkındalık. 15-20, karmaşa. 20-25, durgunluk.'
				},
				{
					t: 'figure',
					id: 'sy-8:2',
					img: 'assets/2026-09/soylesi/08-bes-sene.webp',
					alt: 'Bir elinde tuttuğu polaroid fotoğrafları gözünün önüne kaldırmış figür.'
				},
				{ t: 'rule', id: 'sy-8:3' },
				{
					t: 'note',
					id: 'sy-8:4',
					text: 'Söyleşi yazışmayla yapıldı. Çizimler KargaManga’ya aittir.'
				}
			]
		}
	]
};
