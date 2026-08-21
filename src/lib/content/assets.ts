/* ============================================================================
   VARLIK YOLU — içerikteki `assets/…` → tarayıcı URL'i
   ----------------------------------------------------------------------------
   İçerik dosyaları yolları `static/`e GÖRE yazıyor (`assets/2026-09/tren.webp`);
   `validate.test.ts` de dosyayı orada arıyor. Prototipte bu yol `index.html`
   kökten açıldığı için olduğu gibi `src`e konabiliyordu. Burada olmaz: sayı
   `/sayi/2026-09` gibi bir rotada açılıyor ve göreli yol `/sayi/assets/…`
   olurdu — sessizce kırık bir görsel.

   `base` bilerek eklenmiyor: uygulama alan adının kökünde yayınlanıyor
   (adapter-cloudflare, `wrangler.jsonc`). Bir gün alt yolda yayınlanırsa
   `$app/paths`'in `base`'i BURAYA girer, 90 blok içine değil.
   ========================================================================= */

/** `assets/2026-09/tren.webp` → `/assets/2026-09/tren.webp` */
export function assetUrl(path: string): string {
	return path.startsWith('/') ? path : `/${path}`;
}
