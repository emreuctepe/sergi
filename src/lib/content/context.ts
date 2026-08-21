/* ============================================================================
   SAYI BAĞLAMI — "hangi sayının içindeyim?"
   ----------------------------------------------------------------------------
   Prototipte tek bir küresel `MAG.data.issue` vardı; bir sayı açıksa o oydu.
   Burada olmaz: sunucuda aynı anda iki isteğin iki farklı sayısı olabilir ve
   küresel bir değişken ikisini birbirine karıştırır.

   Neden prop değil de bağlam: künyeye 19 blok tipinden yalnızca `cover`
   bakıyor. Sayıyı 90 bloğun hepsine prop olarak geçirmek, tek bir bileşenin
   ihtiyacını bütün ağaca yaymak olurdu.

   NEDEN DEĞER DEĞİL DE OKUYUCU FONKSİYON
   `setContext` yalnızca bileşen kurulurken çağrılabilir, yani bağlama konan
   değer o andaki değerde DONAR. `/sayi/2026-09`'dan `/sayi/2026-10`'a
   gidildiğinde SvelteKit aynı bileşeni yeniden kullanıp yalnızca prop'u
   değiştiriyor — donmuş bir künye orada eski sayıyı göstermeye devam ederdi.
   Bağlamda değer değil, değeri o an okuyan bir fonksiyon duruyor.
   ========================================================================= */

import { getContext, setContext } from 'svelte';
import type { Issue } from './types';

const KEY = Symbol('sergi:issue');

type ReadIssue = () => Issue;

/**
 * Sayı rotası (ve blok kataloğu) bunu bir kez kurar. Okuyucu fonksiyon
 * geçilir — `() => content.issue` gibi — ki prop değişince bağlam da değişsin.
 */
export function setIssueContext(read: ReadIssue): void {
	setContext(KEY, read);
}

/**
 * Bağlamı bileşen ağacının DIŞINDAN kurmak için — `svelte/server`'ın `render()`
 * çağrısı gibi. Anahtarın kendisi dışa verilmiyor: bağlamı kurmanın iki yolu
 * var, ikisi de burada; üçüncüsünü uydurmak mümkün değil.
 */
export function issueContextMap(issue: Issue): Map<unknown, unknown> {
	return new Map<unknown, unknown>([[KEY, () => issue]]);
}

/**
 * Künyeye ihtiyacı olan blok bunu KURULURKEN çağırıp döndüğü fonksiyonu saklar,
 * sonra her okumada onu çağırır (`$derived(read())`). Bağlam yoksa bu bir
 * kurulum hatasıdır — sessizce boş bir kapak çizmek daha kötü olurdu.
 */
export function issueContext(): ReadIssue {
	const read = getContext<ReadIssue | undefined>(KEY);
	if (!read) {
		throw new Error('Sayı bağlamı kurulmamış: üst bileşende setIssueContext() çağrılmalı.');
	}
	return read;
}
