/* ============================================================================
   TOHUMLU RASTGELELİK — prototipteki `U.rng`
   ----------------------------------------------------------------------------
   xorshift32. `Math.random()` DEĞİL, ve bu bilinçli: sahnelerin serpiştirmesi
   her açılışta aynı olmak zorunda. Aksi hâlde aynı sayfa her ziyarette başka
   türlü görünürdü — dergi sayfası bir kompozisyondur, her seferinde yeniden
   zar atılan bir şey değil. Sunucuda çizilen ile tarayıcıda hidratlanan da
   birbirini tutmaz, Svelte "hydration_mismatch" derdi.

   Tohum bir kez seçilir ve içerikte/sahnede sabit durur.
   ========================================================================= */

/** Verilen tohumdan başlayan, [0,1) aralığında deterministik dizi. */
export function rng(seed: number): () => number {
	let s = seed >>> 0 || 1;
	return () => {
		s ^= s << 13;
		s ^= s >>> 17;
		s ^= s << 5;
		s >>>= 0;
		return s / 4294967296;
	};
}

/** Prototip koordinatları `toFixed` ile yazıyordu; parite için aynı yuvarlama. */
export const round = (n: number, digits: number): number => Number(n.toFixed(digits));
