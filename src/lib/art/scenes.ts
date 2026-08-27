/* ============================================================================
   SAHNE KAYDI — `bg: "scene:…"` hangi adları kabul ediyor?
   ----------------------------------------------------------------------------
   Prototipte kayıt yoktu: `A.scene(name)` bilinmeyen bir ad görünce sessizce
   `paper`e düşüyordu. Yani `bg: "scene:tori"` (yazım hatası) bomboş bir kâğıt
   sayfa üretir ve kimse fark etmezdi. Burada bilinmeyen ad iki yerden birden
   yakalanıyor: `SceneName` derleme zamanında, `validate.ts` içerik zamanında —
   `img:` yolunun var olup olmadığını denetleyen kuralın karşılığı.

   ⚠️ 1.0'da YEDİ sahne var. Prototipteki 22'nin kalan 15'i yalnız 2026-10'a ait
   (`neon-city`, `terminal`, `circuit`, `emaki`…) ve o sayı gelene kadar
   taşınmıyor — hiçbir sayfanın çağırmayacağı, gözle doğrulanamayan kod olurdu.
   `term`/`rtlhint` blok tiplerinde verilen kararın aynısı.
   Yeni sahne eklemek: bileşeni yaz, adını buraya ekle, `Scene.svelte`'in
   `switch`ine bir dal koy. Üçüncüsü unutulursa `check` kırılır.

   SAYIM BİR KEZ EKSİK ÇIKTI (karar 1.41): sahneleri yalnız `bg: "scene:…"`
   yazımını arayarak saymak üçünü buluyordu, oysa tanıtım kartları sahneyi
   ÇIPLAK bir alanda (`scene: 'leaves'`) çağırıyor. `IntroCard.scene` o gün düz
   `string`ti, yani derleyici de yakalayamadı. Şimdi o alan da `SceneName`:
   sayının sahne yüzeyi tek yerden kapanıyor.
   ========================================================================= */

/** Sayının çağırabileceği sahneler. Sıra alfabetik, kaynak bu dizi. */
export const SCENE_NAMES = [
	'leaves',
	'paper',
	'portrait',
	'street',
	'sumi',
	'torii',
	'waves'
] as const;

export type SceneName = (typeof SCENE_NAMES)[number];

/** Kayıtlı bir sahne adı mı? `validate.ts` ve `Scene.svelte` buradan soruyor. */
export function isSceneName(name: string): name is SceneName {
	return (SCENE_NAMES as readonly string[]).includes(name);
}
