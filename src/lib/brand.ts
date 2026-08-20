/* ============================================================================
   MARKA — tek doğruluk kaynağı
   ----------------------------------------------------------------------------
   Derginin adı, alan adı ve künyesi YALNIZCA burada yazılır. Kodun hiçbir
   yerine — başlık etiketine, PWA manifest'ine, e-posta şablonuna, OG
   etiketlerine — ad gömülmez; hepsi buradan okur.

   Neden: marka adı henüz kesinleşmedi (docs/PROJE.md §8.4 açık sorusu). Ada
   yayın gününe yakın karar verilecek ve o karar tek satırlık bir değişiklik
   olmak zorunda. Bir kez koda dağılırsa geri toplanamaz.

   ⚠️ `name` ve `domain` şu an YER TUTUCU. Yayın öncesi doldurulacak —
   bkz. docs/BUILD-TODO.md "Yayın blocker'ları".
   ========================================================================= */

export const brand = {
	/** Görünen ad. Başlık, künye, e-posta imzası, PWA. */
	name: 'sErgi',

	/** Dar alanlar: PWA ana ekran etiketi, sekme başlığı kuyruğu. */
	shortName: 'sErgi',

	/** Tek cümlelik tanım. OG açıklaması ve tanıtım sahnesi için. */
	tagline: 'Aylık bir sosyal dergi. Başlıyor ve bitiyor.',

	/** Protokolsüz alan adı. Kanonik URL ve OG için. */
	domain: 'ornek.com',

	/** Giriş kodlarının ve bülten postalarının gönderileceği adres (Resend). */
	senderEmail: 'merhaba@ornek.com',

	/** Künye satırı — sayı sonu ve hakkında sayfası. */
	colophon: 'Tek kişilik editöryel',

	/** Arayüz dili. 1.0 tek dilli; i18n 2. sayıya ertelendi. */
	locale: 'tr',

	/** Tarayıcı arayüzü rengi (PWA + mobil adres çubuğu). */
	themeColor: '#b8432c'
} as const;

/** `https://alanadi` — kanonik URL kurmak için. */
export const origin = `https://${brand.domain}`;

/** Sekme başlığı: "Kızıl Mevsim · sErgi". Sayfa adı yoksa yalnız marka. */
export function pageTitle(pageName?: string): string {
	return pageName ? `${pageName} · ${brand.name}` : brand.name;
}
