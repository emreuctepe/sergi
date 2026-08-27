/* ============================================================================
   CİHAZ TERCİHLERİ
   ----------------------------------------------------------------------------
   Buradaki asıl mesele mutlu yol değil, BOZUK yol: `localStorage` yok (sayı
   rotası önceden çiziliyor), erişilemiyor (Safari üçüncü taraf çerçeve), dolu
   ya da içinde çöp var. Dördü de derginin açılmasını engellememeli.
   ========================================================================= */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { readPrefs, writePrefs } from './prefs';

const KEY = 'sergi:prefs:v1';

/** Bellekte yaşayan, istenirse atan bir `localStorage` taklidi. */
function fakeStorage(seed: Record<string, string> = {}) {
	const data = new Map(Object.entries(seed));
	return {
		getItem: (k: string) => data.get(k) ?? null,
		setItem: (k: string, v: string) => void data.set(k, v),
		removeItem: (k: string) => void data.delete(k),
		clear: () => data.clear(),
		key: (i: number) => [...data.keys()][i] ?? null,
		get length() {
			return data.size;
		},
		raw: data
	} as unknown as Storage & { raw: Map<string, string> };
}

function install(store: Storage | undefined) {
	vi.stubGlobal('localStorage', store);
}

afterEach(() => vi.unstubAllGlobals());

describe('depo yokken', () => {
	it('varsayılanları veriyor', () => {
		install(undefined);
		expect(readPrefs()).toEqual({ depth: null, seenIntro: false });
	});

	it('yazma atmıyor, yazılanı geri veriyor', () => {
		/* Prerender sırasında olan tam olarak bu: yazacak yer yok ama çağrı
		   yapılmış olabilir. Patlarsa sayı derlenmez. */
		install(undefined);
		expect(writePrefs({ depth: 'mid' })).toEqual({ depth: 'mid', seenIntro: false });
	});
});

describe('depo erişilemezken', () => {
	it('`localStorage`a dokunmak ATIYORSA varsayılanlara düşüyor', () => {
		vi.stubGlobal('localStorage', {
			get getItem(): never {
				throw new DOMException('erişim reddedildi');
			}
		});
		expect(readPrefs()).toEqual({ depth: null, seenIntro: false });
	});

	it('depo doluysa yazma sessizce geçiliyor', () => {
		const store = fakeStorage();
		store.setItem = () => {
			throw new DOMException('QuotaExceededError');
		};
		install(store);
		expect(() => writePrefs({ seenIntro: true })).not.toThrow();
	});
});

describe('gidiş-dönüş', () => {
	it('yazılan okunuyor', () => {
		install(fakeStorage());
		writePrefs({ depth: 'min' });
		expect(readPrefs()).toEqual({ depth: 'min', seenIntro: false });

		writePrefs({ seenIntro: true });
		/* Yama BİRLEŞİYOR: ikinci yazma birincinin modunu silmemeli. */
		expect(readPrefs()).toEqual({ depth: 'min', seenIntro: true });
	});
});

describe('bozuk kayıt', () => {
	it('yarım JSON varsayılana düşüyor', () => {
		install(fakeStorage({ [KEY]: '{"depth":' }));
		expect(readPrefs()).toEqual({ depth: null, seenIntro: false });
	});

	it('tanınmayan mod adı `null` oluyor — "sorulmadı" sayılıyor', () => {
		/* Elle "depth":"hepsi" yazılmış bir kayıt tuvale geçersiz bir derinlik
		   sokardı ve akış BOŞ dönerdi: okur bomboş bir sayı görürdü. */
		install(fakeStorage({ [KEY]: '{"depth":"hepsi","seenIntro":true}' }));
		expect(readPrefs()).toEqual({ depth: null, seenIntro: true });
	});

	it('`seenIntro` yalnız gerçek `true` ile geçiyor', () => {
		install(fakeStorage({ [KEY]: '{"seenIntro":"true"}' }));
		expect(readPrefs().seenIntro).toBe(false);
	});

	it('dizi ya da düz sayı gelirse varsayılan', () => {
		install(fakeStorage({ [KEY]: '[1,2,3]' }));
		expect(readPrefs()).toEqual({ depth: null, seenIntro: false });
		install(fakeStorage({ [KEY]: '42' }));
		expect(readPrefs()).toEqual({ depth: null, seenIntro: false });
	});

	it('bilinmeyen alanlar kaydı geçersiz kılmıyor, süzülüyor', () => {
		install(fakeStorage({ [KEY]: '{"depth":"full","jeton":9999,"reader":{"id":"x"}}' }));
		expect(readPrefs()).toEqual({ depth: 'full', seenIntro: false });
	});
});
