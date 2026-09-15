/* ============================================================================
   SAAT — duraklatılabilir zaman kaynağı
   ----------------------------------------------------------------------------
   `performance.now()`un durdurulabilir hâli. Tek işi var: duraklıyken
   İLERLEMEMEK. Animasyon motorları (`karistir.js`, `yazi.js`) geçen süreyi
   buradan okuyor, `hikaye.js` de okur parmağını basılı tuttuğunda burayı
   dondurup çözüyor.

   ⚠️ NEDEN AYRI DOSYA. Saati motorların içine gömmek ikisini de sınanamaz
   yapardı: kare kare çalışan bir kodun doğru olduğunu ancak zamanı elle
   ileri sararak gösterebilirsin. Ayrıldığı için `karisim()` ve
   `daktiloKurgusu()` saf kalabiliyor — ikisi de `kare(gecen)` alıp metin
   döndüren fonksiyonlar, hangi saatin kullanıldığını bilmiyorlar. Tezgâhın
   ölçüm döngüsü tam da bu yüzden rAF'sız çalışabiliyor.

   ⚠️ NEDEN MODÜL DÜZEYİNDE DURUM (tekil). Ekranda aynı anda tek bir hikâye
   akıyor: sayıda `ed-sunus`, tezgâhta `tezgah-karistir`. İkisini aynı anda
   kimse çalıştırmıyor. Örnek (instance) başına saat, `bekle()`nin imzasını
   değiştirmeyi ve onu çağıran yirmi küsur satırın hepsine saat taşımayı
   gerektirirdi — kazancı olmayan bir gürültü.

   ⚠️ BU SAAT YALNIZ `ed-sunus` ZİNCİRİNİ SÜRÜYOR. `karistir.js` ve `yazi.js`
   başka hiçbir yerden import edilmiyor (`galeri.js`, `acilis.js`, `jenerik.js`
   kendi zamanlarını kendileri tutuyor), yani burayı dondurmak derginin geri
   kalanına dokunmuyor.
   ========================================================================= */

/** Duraklamanın başladığı an (`performance.now()`). 0 = saat akıyor. */
let duraklamaBasi = 0;

/** Şimdiye kadar duraklı geçen toplam süre (ms). */
let duraklananToplam = 0;

/**
 * Duraklamaları düşülmüş şimdiki zaman (ms).
 *
 * Duraklıyken hep aynı sayıyı döndürüyor — motorların `gecen` hesabı da
 * böylece olduğu yerde kalıyor. `performance.now()` gibi monotonik: geri
 * gitmiyor, yalnız donuyor.
 *
 * @returns {number}
 */
export function simdi() {
  return (duraklamaBasi || performance.now()) - duraklananToplam;
}

/** Saati dondurur. Zaten duraklıysa bir şey yapmıyor. */
export function duraklat() {
  if (duraklamaBasi) return;
  duraklamaBasi = performance.now();
}

/** Saati çözer; duraklı geçen süre toplama ekleniyor. */
export function surdur() {
  if (!duraklamaBasi) return;
  duraklananToplam += performance.now() - duraklamaBasi;
  duraklamaBasi = 0;
}

/** @returns {boolean} saat şu an duraklı mı */
export function durakliMi() {
  return duraklamaBasi !== 0;
}
