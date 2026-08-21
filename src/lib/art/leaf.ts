/* ============================================================================
   YAPRAK SİLUETİ — derginin tek çizim imzası
   ----------------------------------------------------------------------------
   Prototipte `art.js`'in tepesinde iki `var` olarak duruyordu ve hem sahnelerin
   içindeki yaprak yağmuru hem kapaktaki damga aynı yoldan besleniyordu. Faz 1e
   sahneleri getirdiğinde onlar da buradan okuyacak — yol iki yerde yazılırsa
   ikisi bir gün ayrışır.
   ========================================================================= */

/** Yaprağın dış hattı. viewBox merkezi (0,0), yaklaşık 22×26 birim. */
export const LEAF =
	'M0 13 C-7.5 7 -10.5 -2 -5.5 -8.5 C-3 -11.8 3 -11.8 5.5 -8.5 C10.5 -2 7.5 7 0 13Z';

/** Orta damar ve dört yan damar — tek `path`, çizgi ucu yuvarlak. */
export const LEAF_VEIN = 'M0 12 L0 -9 M0 2 L5 -3 M0 2 L-5 -3 M0 7 L4.5 3 M0 7 L-4.5 3';
