/* ============================================================================
   GÖRSEL TÜREVLERİ — her webp için AVIF, birkaç boyda
   ----------------------------------------------------------------------------
   Kullanım:  node tools/gorsel-turevleri.mjs

   NEDEN
   Canlıdan ölçüldü: sayıyı baştan sona okumak 3.947 KB ve bunun 3.634 KB'ı
   (%97) görsel. JS, CSS, font ve HTML toplamı ~103 KB — yani optimize edilecek
   şey kod değil, fotoğraflar.

   İlk denenen şey işe YARAMADI: aynı boyda webp'i yeniden kodlamak. Kaynaklar
   zaten verimli sıkıştırılmış; q78'de dosyalar BÜYÜDÜ. Ağırlık kalitesizlikten
   değil, ince dokudan geliyor (yaprak, tapınak). İki gerçek kaldıraç kaldı:

     1. ÖLÇEK — tuval masaüstünde 560 CSS px'te sabitleniyor, telefonda 390.
        Yani gereken en büyük fiziksel genişlik 1170px (3× telefon); 1200px
        kaynak doğru ama 560px'lik bir yuvaya 1200px göndermek dört kat israf.
     2. FORMAT — AVIF ince dokuda webp'ten belirgin iyi. Ölçüldü: 1200px'te
        %42, 600px'te %84 kazanç.

   ÇIKTI TEK YÖNLÜ: kaynak `.webp` dosyalarına DOKUNULMAZ. Türevler onların
   yanına `<ad>-<genişlik>.avif` olarak yazılır. Kaynak hâlâ doğruluk kaynağı ve
   AVIF'i olmayan tarayıcı onu alır.

   MANİFEST NEDEN VAR
   Her dosya her boyu alamıyor: kaynaktan büyüğü üretmek (upscale) hem israf hem
   yalan. `logo.webp` 256px, `kapak.webp` 1200px. Bileşen "hep üç boy vardır"
   diye varsayarsa olmayan bir türevi `srcset`e yazar ve tarayıcı 404 alır —
   üstelik `<source>` eşleştiği için `<img>`e DÜŞMEZ, okur kırık görsel görür.
   O yüzden hangi dosyanın hangi boyları olduğu manifeste yazılıyor ve bileşen
   tahmin etmiyor, okuyor.
   ========================================================================= */

import { glob, mkdir, writeFile } from 'node:fs/promises';
import { statSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import prettier from 'prettier';

const ROOT = path.resolve(import.meta.dirname, '..');
const KAYNAK = path.join(ROOT, 'static');
const MANIFEST = path.join(ROOT, 'src/lib/content/gorsel-turevleri.json');

/**
 * Üretilecek genişlikler. Ölçülen ihtiyaç: 560px (1× masaüstü), 780px
 * (2× telefon), 1170px (3× telefon / 2× tablet). Üçü bunları karşılıyor;
 * tarayıcı `sizes` ile hangisini alacağına kendisi karar veriyor.
 */
const BOYLAR = [600, 900, 1200];

/** Bundan dar kaynaklara türev üretilmiyor — kazanç gürültüden küçük. */
const EN_KUCUK_KAYNAK = 400;

/** AVIF kalitesi. 52'de gözle fark yok, 60'ta dosyalar belirgin büyüyor. */
const KALITE = 52;

const kb = (n) => (n / 1024).toFixed(0);

/** @type {Record<string, number[]>} */
const manifest = {};
let kaynakToplam = 0;
let turevToplam = 0;
let uretilen = 0;

const dosyalar = [];
for await (const f of glob('assets/**/*.webp', { cwd: KAYNAK })) dosyalar.push(f);
dosyalar.sort();

for (const rel of dosyalar) {
	const abs = path.join(KAYNAK, rel);
	const meta = await sharp(abs).metadata();
	kaynakToplam += statSync(abs).size;

	if (!meta.width || meta.width < EN_KUCUK_KAYNAK) {
		console.log(`  atlandı (${meta.width}px dar): ${rel}`);
		continue;
	}

	/* Kaynaktan büyüğünü üretme; kaynak boyu listede yoksa onu da ekle ki en
	   büyük türev her zaman kaynağın tam çözünürlüğü olsun. */
	const boylar = [...new Set(BOYLAR.filter((b) => b <= meta.width).concat(meta.width))]
		.filter((b) => b <= meta.width)
		.sort((a, b) => a - b);

	const yazilan = [];
	for (const w of boylar) {
		const hedef = path.join(KAYNAK, turevYolu(rel, w));
		await mkdir(path.dirname(hedef), { recursive: true });
		const buf = await sharp(abs).resize(w).avif({ quality: KALITE, effort: 4 }).toBuffer();
		await writeFile(hedef, buf);
		turevToplam += buf.length;
		uretilen++;
		yazilan.push(w);
	}

	manifest[`assets/${rel.slice('assets/'.length)}`] = yazilan;
	console.log(`  ${rel.padEnd(42)} ${boylar.join(', ')}`);
}

/** `assets/2026-09/tren.webp` + 900 → `assets/2026-09/tren-900.avif` */
function turevYolu(rel, w) {
	const dir = path.dirname(rel);
	const ad = path.basename(rel, path.extname(rel));
	return path.join(dir, `${ad}-${w}.avif`);
}

const json = await prettier.format(JSON.stringify(manifest), { parser: 'json', useTabs: true });
await writeFile(MANIFEST, json);

console.log(`\n${dosyalar.length} kaynak · ${uretilen} türev üretildi`);
console.log(`kaynak toplamı : ${kb(kaynakToplam)} KB`);
console.log(`türev toplamı  : ${kb(turevToplam)} KB (depoya eklenen)`);
console.log(`manifest       : ${path.relative(ROOT, MANIFEST)}`);
