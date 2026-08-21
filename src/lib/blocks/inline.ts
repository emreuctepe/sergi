/* ============================================================================
   SATIR İÇİ BİÇİMLEME — *italik*, **kalın**, `kod`, [bağ](url)
   ----------------------------------------------------------------------------
   Prototipteki `U.inline()` bir dizgi döndürüyordu: önce kaçırıyor, sonra HTML
   yapıştırıyor, sonuç `innerHTML`e basılıyordu. Burada çıktı HTML DEĞİL, JETON
   LİSTESİ — çünkü aynı fonksiyon Faz 3'te okur yorumlarını da biçimlendirecek.
   O gün geldiğinde `{@html}` ile basılan bir dizgi, sunucudan gelen metnin
   tarayıcıda HTML olarak çalışması demektir. Jeton listesi bu kapıyı hiç açmaz:
   Inline.svelte metni Svelte'in kendi kaçırmasıyla basar.

   Dilbilgisi bilerek prototiple aynı ve İÇ İÇE GEÇMİYOR (`**kalın *italik***`
   diye bir şey yok) — düz bir liste, prototipin dört regex'inin tam karşılığı.
   `inline.test.ts` bunu taşınan sayının bütün metinleri üzerinde prototiple
   karşılaştırarak doğruluyor.
   ========================================================================= */

/** Düz metin ya da tek bir biçim. Jetonlar iç içe geçmez. */
export type InlineToken =
	| { k: 'text'; text: string }
	| { k: 'strong'; text: string }
	| { k: 'em'; text: string }
	| { k: 'code'; text: string }
	| { k: 'link'; text: string; href: string };

/**
 * Sıra prototipteki `replace` zincirinin sırası: `**` her zaman `*`'dan önce
 * denenir, yoksa `**kalın**` iki boş italiğe bölünürdü.
 */
const MARKUP = /\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)/g;

/** Metni jetonlara ayırır. Biçim işareti yoksa tek bir `text` jetonu döner. */
export function inline(source: string): InlineToken[] {
	const tokens: InlineToken[] = [];
	let plain = '';
	let at = 0;

	MARKUP.lastIndex = 0;
	let m: RegExpExecArray | null;
	while ((m = MARKUP.exec(source))) {
		/* Prototipin italik regex'i `(^|[^*])\*…` idi: önündeki karakter yıldızsa
		   eşleşmiyordu. O koşul burada açıkça duruyor — `**` dalı zaten önce
		   denendiği için buraya yalnızca tek yıldızlı artıklar düşer. */
		if (m[2] !== undefined && m.index > 0 && source[m.index - 1] === '*') {
			MARKUP.lastIndex = m.index + 1;
			continue;
		}

		plain += source.slice(at, m.index);
		if (plain) {
			tokens.push({ k: 'text', text: plain });
			plain = '';
		}

		if (m[1] !== undefined) tokens.push({ k: 'strong', text: m[1] });
		else if (m[2] !== undefined) tokens.push({ k: 'em', text: m[2] });
		else if (m[3] !== undefined) tokens.push({ k: 'code', text: m[3] });
		else tokens.push({ k: 'link', text: m[4], href: m[5] });

		at = MARKUP.lastIndex;
	}

	plain += source.slice(at);
	if (plain) tokens.push({ k: 'text', text: plain });
	return tokens;
}
