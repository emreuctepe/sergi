/* ============================================================================
   SAYI BAĞLAMI — "hangi sayının içindeyim?"
   ----------------------------------------------------------------------------
   Prototipte tek bir küresel `MAG.data.issue` vardı; bir sayı açıksa o oydu.
   Burada olmaz: sunucuda aynı anda iki isteğin iki farklı sayısı olabilir ve
   küresel bir değişken ikisini birbirine karıştırır.

   Neden prop değil de bağlam: künyeye 19 blok tipinden yalnızca `cover`
   bakıyor. Sayıyı 90 bloğun hepsine prop olarak geçirmek, tek bir bileşenin
   ihtiyacını bütün ağaca yaymak olurdu.
   ========================================================================= */

import { getContext, setContext } from 'svelte';
import type { Issue } from './types';

const KEY = Symbol('sergi:issue');

/** Sayı rotası (ve blok kataloğu) bunu bir kez kurar. */
export function setIssueContext(issue: Issue): void {
	setContext(KEY, issue);
}

/**
 * Bağlamı bileşen ağacının DIŞINDAN kurmak için — `svelte/server`'ın `render()`
 * çağrısı gibi. Anahtarın kendisi dışa verilmiyor: bağlamı kurmanın iki yolu
 * var, ikisi de burada; üçüncüsünü uydurmak mümkün değil.
 */
export function issueContextMap(issue: Issue): Map<unknown, unknown> {
	return new Map<unknown, unknown>([[KEY, issue]]);
}

/** Künyeye ihtiyacı olan blok bunu okur. Bağlam yoksa bu bir kurulum hatasıdır. */
export function getIssueContext(): Issue {
	const issue = getContext<Issue | undefined>(KEY);
	if (!issue) {
		throw new Error('Sayı bağlamı kurulmamış: üst bileşende setIssueContext() çağrılmalı.');
	}
	return issue;
}
