# Kantō sahneleri

1923 Büyük Kantō Depremi yazısı için altı SVG sahne. `src/lib/art/`in bir alt
klasörü, çünkü yanındaki altı sahneden (`paper`, `leaves`, `waves`, `street`,
`sumi`, `torii`) **iki bakımdan ayrılıyorlar** ve bu ayrım klasörde görünsün
istendi.

## Nerede duruyorlar, nerede DURMUYORLAR

⚠️ **`scenes.ts` kaydına eklenmediler.** Yani hiçbir sayfa `bg: "scene:ocak"`
yazamaz. Bu bilinçli: kayda bir ad eklemek `Scene.svelte`'in `switch`ine dal
yazmayı da gerektiriyor (`never` ile derleme zamanında kilitli) ve bu, henüz
yazılmamış bir yazının sahnelerini sayının canlı yüzeyine sokmak olurdu.

Yazı yazıldığında bağlamak üç adım:

1. `scenes.ts` → `SCENE_NAMES` dizisine adı ekle (sıra alfabetik).
2. `Scene.svelte` → `switch`e bir dal koy. Unutulursa `pnpm check` kırılır.
3. Sayfada `bg: "scene:<ad>"`.

`Gemici` ve `Kanji` metin taşıyor (balon / kâğıt), o ikisinin arka plan olarak
mı yoksa `figure` bloğu olarak mı gireceği ayrı bir karar.

## Neden tema değişkenleri kullanmıyorlar

Yanlarındaki altı sahne `var(--paper)` / `var(--accent)` kullanıyor ve tema
koyuya dönünce onlar da dönüyor. Bunlar dönmüyor: renkleri `palet.ts`'te sabit.

Sebep `visual_design.md` §"Core style DNA" 6 — bu sahneler DESEN değil IŞIK.
Bir alev hortumunun anlamı karanlığın içindeki tek parlak kütle olmasında;
`--paper` açık temada `#f5f1e8`e dönseydi hortum açık zemine düşer, değer
yapısı çöker, silüet okunmazdı. Gerekçenin uzunu `palet.ts`'in başında.

## Dosyalar

| Dosya                | Ne                                                            |
| -------------------- | ------------------------------------------------------------- |
| `palet.ts`           | Dört renk ailesi: `ATES`, `SU`, `SEHIR`, `KIZIL`. Tek kaynak. |
| `Kaplama.svelte`     | Vinyet + gren. Her sahnenin SON çocuğu olarak çağrılıyor.     |
| `alev.ts`            | Alev hortumunun dört karesi. Tek geometri üreteci.            |
| `AlevHortumu.svelte` | Alev tornadosu. **Sahnelerin tek hareketlisi.**               |
| `Gemici.svelte`      | Dongola'nın güvertesi, konuşma balonlu çizgi roman paneli.    |
| `Ocak.svelte`        | 11.58, devrilmiş ocak, tutuşmak üzere olan kâğıt duvar.       |
| `Tsunami.svelte`     | On metrelik dalga, önünde kasaba.                             |
| `Kanji.svelte`       | Sokak kontrolü. Düotone (C kipi).                             |
| `TokyoBugun.svelte`  | 2025 Tokyo. `AlevHortumu`nun kasıtlı tersi.                   |

## Sayfaya koymadan önce bakılacak iki şey

1. **`Gemici`nin balonu.** Varsayılan söz Griffin'in **kayıtlı sözü değil** —
   yazının kendi anlatısının balona sığdırılmış hâli, ve balon onu konuşturuyor
   gibi görünüyor. Griffin gerçek bir kişi. `soz` alanı bunun için var.
2. **`Kanji`nin kâğıdı.** Varsayılan `十五円五十銭`, kaynaklarda 1923 sokak
   kontrollerinde okutulan ibarelerden biri olarak geçiyor; **sayının kendi
   metni bunu söylemiyor.** Kadrajda göstermek istiyorsan sayfanın kaynağı da
   olmalı, yoksa `ibare={[]}` ile kâğıt boş bırakılabilir.

## Hareket

`AlevHortumu` SMIL ile saniyede dört kare. `calcMode="discrete"` — ara değer
üretmiyor, kareden kareye zıplıyor; üsluptaki basamaklı yüzeylerin zamandaki
karşılığı.

`<animate>` elemanları **sunucuda çizilmiyor**: `hareket` ilk çizimde `false`,
`$effect` tarayıcıda `prefers-reduced-motion`a bakıp açıyor. Ölçüldü — sunucu
çıktısında 0 `<animate>`, tarayıcıda 22.

## Üslup denetimi

`visual_design.md` §12'nin listesi, bu klasörde son durum:

- Sıfır kontur — ✅ (`stroke` yalnız iki yorumda geçiyor)
- Yüzeyler sayılabilir — ✅ (hortum 9 dilim, kule perdesi 5 hücre)
- Sahne başına ≤9 düz ton — ⚠️ **üçü geçiyor, biri geçmiyor.** `SU` 8,
  `SEHIR` 9, `KIZIL` 5; ama `ATES` **10**. Bilerek verilmiş bir taviz, gerekçesi
  `palet.ts`'te `ATES`in başında yazılı — o aile tek bir formun içinde
  neredeyse siyahtan neredeyse beyaza bütün aralığı yürüyor.
- Form içinde degrade yok — ✅ (tek `radialGradient` `Kaplama`nın vinyeti,
  sahne geneli)
- %10 ölçekte siluet okunuyor — ✅ (altısı da 210 px genişlikte denendi)
- Tek vurgu rengi — ✅

## Denendi ve çıkarıldı

- **Sarmal bantlar** (`alev.ts` içinde notu duruyor): hortumu saran koyu
  şeritler dönmeyi anlatacaktı, ekranda alevin üstüne yapıştırılmış yarı saydam
  dikdörtgenler olarak okundu.
- **Kaydırılmış şeritle dalga** (`Tsunami.svelte` içinde notu duruyor):
  dalganın kenarını hem sağa hem aşağı kaydırmak kapalı bir KEMER üretiyordu.
