# Sayı 04 · "Gürültü" görselleri

Bu klasör bilerek boş: **bu sayının** tek bir dış görseli yok, bütün sahneler
`js/art.js` içinde satır içi SVG olarak çiziliyor ve sayının CSS değişkenleriyle
boyanıyor (yani tema/koyu mod ile birlikte değişiyorlar).

> Prototipin tamamı için geçerli değil: 2026-09 gerçek dosyalarla döşendi —
> `assets/2026-09/` altında 8 sayfa fotoğrafı ve `kapali-kapilar/` one-shot'ının
> 9 karesi duruyor. İki yol yan yana çalışıyor.

## Çizilmiş sahneyi gerçek görselle değiştirmek

1. Dosyayı buraya koy (`kapak.webp`, `anatomi.webp`, …).
2. İlgili bölüm dosyasında (`js/issues/2026-10/sections/NN-*.js`) o sayfanın
   `bg` alanını değiştir:

   ```js
   bg: "scene:neon-city"                     // önce
   bg: "img:assets/2026-10/kapak.webp"       // sonra
   ```

Başka hiçbir şey değişmez. `render.js`'teki `backgroundFor()` üç öneki tanıyor:
`scene:` (art.js sahnesi) · `photo:` (üretilmiş sahte fotoğraf) · `img:` (dosya).

Sayfalar 3:4 tuvale `object-fit: cover` ile oturuyor — 1200×1600 civarı dikey
görseller en iyi sonucu veriyor.

## Şu an hangi sayfa hangi sahneyi kullanıyor

27 sayfanın dağılımı:

| sahne | kaç sayfa | sayfalar | ne anlatıyor |
|---|---|---|---|
| `paper` | 18 | metin sayfalarının hepsi | dokulu kâğıt zemin — sayının varsayılanı |
| `circuit` | 3 | `bs-acilis`, `gu-4`, `an-5` | devre yolları, düğümler |
| `terminal` | 2 | `an-acilis`, `gu-2` | CRT ekran, tarama çizgileri, akan kayıt |
| `neon-city` | 2 | `gr-kapak`, `gu-acilis` | yağmurlu neon şehir silüeti |
| `signal-grid` | 2 | `gr-bl-1`, `gr-son` | tel kafes ufuk + üç halka (bulmacaya gönderme) |

Gerçek görsele geçirmenin en çok işe yarayacağı yerler `neon-city` ve
`signal-grid` sayfaları: kapak, dosya açılışı, bulmaca ve sayı sonu.
