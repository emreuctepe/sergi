/* ============================================================================
   CİHAZ TERCİHLERİ — localStorage'da duran, okura ait OLMAYAN ayarlar
   ----------------------------------------------------------------------------
   Faz 2'de durum ikiye ayrılacak: okur verisi (kim olduğu, nereye kadar
   okuduğu, yorumları) sunucuda, CİHAZ tercihleri burada. Bu dosya o ayrımın
   istemci tarafı ve bilerek küçük — prototipin `state.js`'i yirmi alanlık tek
   bir blob'du ve yarısı gerçekte veritabanına aitti.

   İki alan var, ikisi de bu cihaza ait:
     · `depth`      — bu tarayıcıda hangi okuma modu seçildi
     · `seenIntro`  — tanıtım kartları bu tarayıcıda gösterildi mi

   ⚠️ SSR/prerender güvenli. Sayı rotası önceden çiziliyor (karar 1.36), yani
   bu kod derleme sırasında `localStorage` olmadan da çalışıyor: depo yoksa
   varsayılanlar dönüyor. Depo VAR ama erişilemiyor da olabilir — Safari
   üçüncü taraf çerçevede `localStorage`a dokununca ATIYOR, ve okunamayan bir
   tercih yüzünden derginin açılmaması saçma olurdu.
   ========================================================================= */

import { DEPTHS, type Depth } from '$lib/content/types';

export interface Prefs {
	/** Seçilmiş okuma modu. `null` = HENÜZ SORULMADI (mod seçici açılır). */
	depth: Depth | null;
	/** Tanıtım kartları gösterildi mi? */
	seenIntro: boolean;
}

/**
 * Anahtar sürümlü: alanlar değişirse `v2` açılır ve eski kayıt okunmaz.
 * Prototiple aynı anahtarı (`state:v1`) KULLANMIYOR — o blob'un yirmi alanı
 * var ve buradaki iki alanla aynı şey değil.
 */
const KEY = 'sergi:prefs:v1';

const DEFAULTS: Prefs = { depth: null, seenIntro: false };

/** Erişilebilir depo ya da `null`. Hiçbir koşulda atmıyor. */
function storage(): Storage | null {
	try {
		return typeof localStorage === 'undefined' ? null : localStorage;
	} catch {
		return null;
	}
}

/**
 * Diskten gelen her şey ŞÜPHELİ: okur konsoldan elle yazmış, eski bir sürüm
 * başka alanlar bırakmış ya da JSON yarım kalmış olabilir. Tanınmayan değer
 * varsayılana düşüyor; kayıt reddedilmiyor, süzülüyor.
 */
function sanitize(data: unknown): Prefs {
	if (typeof data !== 'object' || data === null) return { ...DEFAULTS };
	const raw = data as Record<string, unknown>;
	const depth = raw.depth;
	return {
		depth:
			typeof depth === 'string' && (DEPTHS as readonly string[]).includes(depth)
				? (depth as Depth)
				: null,
		/* `=== true`: "false" dizgisi ya da 0 gibi bir kalıntı "gördü" sayılmasın. */
		seenIntro: raw.seenIntro === true
	};
}

/** Kayıtlı tercihler. Depo yoksa, boşsa ya da bozuksa varsayılanlar. */
export function readPrefs(): Prefs {
	const store = storage();
	if (!store) return { ...DEFAULTS };

	try {
		const raw = store.getItem(KEY);
		return raw ? sanitize(JSON.parse(raw)) : { ...DEFAULTS };
	} catch {
		return { ...DEFAULTS };
	}
}

/**
 * Verilen alanları yazar ve GÜNCEL tercihleri döndürür.
 *
 * Yazma başarısız olabilir (depo dolu, özel pencere) ve bu sessizce geçiliyor:
 * tercihi kaydedememek derginin okunmasını engellememeli. Bedeli okurun
 * seçimini bir dahaki ziyarette yeniden yapması — kabul edilebilir; alternatifi
 * hiç açılmayan bir dergi.
 */
export function writePrefs(patch: Partial<Prefs>): Prefs {
	const next = { ...readPrefs(), ...patch };
	const store = storage();
	if (store) {
		try {
			store.setItem(KEY, JSON.stringify(next));
		} catch {
			/* yazılamadı — okumaya devam */
		}
	}
	return next;
}
