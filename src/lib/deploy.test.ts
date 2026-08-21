/* ============================================================================
   YAYIN SÖZLEŞMESİ — Cloudflare yapılandırması tutarlı mı?
   ----------------------------------------------------------------------------
   Bu dosya bir üretim kazasından doğdu. İlk dağıtım şu hatayla düştü:

       ✘ Missing entry-point to Worker script or to assets directory

   Sebep: Cloudflare paneli projeyi WORKERS olarak açmıştı ve `wrangler deploy`
   koşuyordu, ama `wrangler.jsonc` PAGES yapılandırmasını taşıyordu
   (`pages_build_output_dir`). İkisi aynı anahtarları okumuyor. Hata yalnızca
   Cloudflare'in build kütüğünde göründü — yerelde her şey yeşildi.

   Buradaki testler o kör noktayı kapatıyor: yapılandırma bozulursa `pnpm test`
   kırmızı yanıyor, dağıtım gününde değil.
   ========================================================================= */

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { unstable_readConfig } from 'wrangler';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const config = unstable_readConfig({ config: resolve(root, 'wrangler.jsonc') });

describe('wrangler.jsonc — Workers, Pages değil', () => {
	it('Pages anahtarı taşımıyor', () => {
		/* `pages_build_output_dir` varsa adaptör Pages modunda derliyor ve
		   `wrangler deploy` giriş noktası bulamıyor. Dağıtımı düşüren tam olarak
		   bu satırdı.

		   Not: anahtar geri konursa bu iddia değil, DOSYANIN KENDİSİ düşüyor —
		   `unstable_readConfig` yukarıda, modül gövdesinde çağrılıyor ve wrangler
		   "The name 'ASSETS' is reserved in Pages projects" diyerek atıyor. Yani
		   suite yüklenemiyor. Çirkin ama kırmızı ve mesaj sorunu adıyla söylüyor;
		   iddiayı korumak yine de anlamlı, çünkü `assets` bloğu olmadan
		   yapılandırma sessizce Pages moduna dönerdi. */
		expect(config.pages_build_output_dir).toBeFalsy();
	});

	it('Workers üçlüsü eksiksiz', () => {
		/* Üçü birlikte çalışıyor; biri eksikse adapter-cloudflare derleme
		   sırasında atıyor (adapter-cloudflare/utils.js → validate_worker_settings).
		   Yani eksik anahtar zaten build'i kırar — bu test onu sözleşmeye çevirip
		   NEDEN'ini yanına yazıyor. */
		expect(config.main, 'SvelteKit sunucusunun derleneceği yer').toBeTruthy();
		expect(config.assets?.directory, 'statiklerin sunulacağı klasör').toBeTruthy();
		expect(config.assets?.binding, "Worker'ın statiklere eriştiği bağlama").toBe('ASSETS');
	});
});

describe('worker-configuration.d.ts — derleme çıktısına bakmıyor', () => {
	it('`.svelte-kit` altına başvuru içermiyor', () => {
		/* `wrangler types` DEĞİŞKEN çıktı üretiyor: `main`'in gösterdiği dosya
		   diskte varsa dosyaya şu satırı ekliyor —

		       mainModule: typeof import("./.svelte-kit/cloudflare/_worker");

		   O satır commit'lenirse `tsconfig.json`'daki `checkJs` üretilmiş
		   Worker'ı da tip denetimine sokuyor ve `pnpm check` 747 hatayla
		   patlıyor (bir kez oldu). Bu yüzden `pnpm gen`, derleme çıktısı
		   SİLİNMİŞKEN çalıştırılmalı — temiz bir checkout'un durumu da o.

		   Aynı kaypaklık `wrangler types --check`'in `build`in içinde
		   durmamasının da sebebi: Cloudflare temiz bir ağaçta derliyor, orada
		   dosya henüz yok, kontrol kaçınılmaz olarak düşerdi. */
		const types = readFileSync(resolve(root, 'worker-configuration.d.ts'), 'utf-8');
		expect(types).not.toMatch(/typeof import\(["']\.\/\.svelte-kit/);
	});
});
