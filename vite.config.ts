import { defineConfig } from 'vitest/config';
import adapter from '@sveltejs/adapter-cloudflare';
import { sveltekit } from '@sveltejs/kit/vite';

/* 0.1 Erken Erişim yayını GitHub Pages'te ALT YOLDA duruyor (…/sergi/0.1) ama
   varlık yolları MUTLAK basılıyor (`/assets/…`, `/fonts/…`, `/_app/…`) — base
   verilmezse hepsi 404 ve sayfa çıplak HTML olarak açılır.

   Yalnızca o yayın için, ortam değişkeniyle. Cloudflare derlemesi kökten
   servis ediliyor ve değişkeni görmüyor, yani kök yayın ETKİLENMİYOR. */
const rawBase = process.env.SERGI_BASE ?? '';

/* SvelteKit base'i `'' | `/${string}`` olarak tipliyor ve kuralları sessiz
   değil: baştaki eğik çizgi ZORUNLU, sondaki YASAK. Değer ortamdan geldiği
   için tip denetimi burada bitiyor — bu yüzden kontrol çalışma anında ve
   derlemeyi DÜŞÜRÜYOR. Alternatifi bir `as` cast'i olurdu: `SERGI_BASE=sergi/0.1`
   (eğik çizgisiz) yazan biri hatasız derler, sonra bütün varlıklar 404 verirdi. */
if (rawBase !== '' && !rawBase.startsWith('/')) {
	throw new Error(`SERGI_BASE "/" ile BAŞLAMALI — gelen: "${rawBase}"`);
}
if (rawBase.endsWith('/')) {
	throw new Error(`SERGI_BASE "/" ile BİTMEMELİ — gelen: "${rawBase}"`);
}
const base = rawBase as '' | `/${string}`;

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter(),
			/* `relative: false` BİLEREK. SvelteKit varsayılanı `true` ve o hâlde
			   `base` sayfa başına göreli bir dizgiye ("..") dönüşüyor — kök
			   yayında `/assets/…` yerine `../assets/…` üretiyordu. Göreli yol
			   sondaki eğik çizgiye DUYARLI: `/sayi/2026-09` için doğru çözülür
			   ama `/sayi/2026-09/` için `/sayi/assets/…` olur ve sessizce kırılır.
			   Mutlak yol her iki yayında da tek anlamlı: kök `/assets/…`,
			   0.1 `/sergi/0.1/assets/…`. */
			paths: { base, relative: false }
		})
	],
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
