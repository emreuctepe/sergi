/* ==========================================================================
   "Kızıl Mevsim" — sayının tamamı
   --------------------------------------------------------------------------
   Bölüm sırası BURADAKİ dizi sırasıdır. Prototipte sıra dosya yükleme
   sırasına bağlıydı (bir <script> satırı kayarsa sayı karışırdı); burada
   sıra tek bir yerde, açıkça duruyor.
   ======================================================================= */

import type { IssueContent } from '$lib/content/types';
import { intro, issue, puzzles } from './issue';
import { kapak } from './sections/00-kapak';
import { editorden } from './sections/01-editorden';
import { kizilMevsim } from './sections/02-kizil-mevsim';
import { geceHatti } from './sections/03-gece-hatti';
import { soylesi } from './sections/04-soylesi';
import { sozluk } from './sections/05-sozluk';
import { bulmaca } from './sections/06-bulmaca';
import { kapaliKapilar } from './sections/07-kapali-kapilar';
import { son } from './sections/08-son';

export const content: IssueContent = {
	issue,
	intro,
	sections: [
		kapak,
		editorden,
		kizilMevsim,
		geceHatti,
		soylesi,
		sozluk,
		bulmaca,
		kapaliKapilar,
		son
	],
	puzzles
};

export default content;
