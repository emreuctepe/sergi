# Sayı 04 · "Gürültü" görselleri

Bu klasör bilerek boş: prototipte tek bir dış görsel yok, bütün sahneler
`js/art.js` içinde satır içi SVG olarak çiziliyor ve sayının CSS
değişkenleriyle boyanıyor (yani tema/koyu mod ile birlikte değişiyorlar).

## Çizilmiş sahneyi gerçek görselle değiştirmek

1. Dosyayı buraya koy (`kapak.webp`, `anatomi.webp`, …).
2. `js/issues/2026-10.js` içinde ilgili sayfanın `bg` alanını değiştir:

   ```js
   bg: "scene:neon-city"                     // önce
   bg: "img:assets/2026-10/kapak.webp"       // sonra
   ```

Başka hiçbir şey değişmez. `render.js`'teki `backgroundFor()` üç öneki tanıyor:
`scene:` (art.js sahnesi) · `photo:` (üretilmiş sahte fotoğraf) · `img:` (dosya).

Sayfalar 3:4 tuvale `object-fit: cover` ile oturuyor — 1200×1600 civarı dikey
görseller en iyi sonucu veriyor.

## Şu an hangi sayfa hangi sahneyi kullanıyor

| sayfa | sahne | ne anlatıyor |
|---|---|---|
| `gr-kapak`, `gu-acilis` | `neon-city` | yağmurlu neon şehir silüeti |
| `an-acilis` ve anatomi sayfaları | `terminal` | CRT ekran, tarama çizgileri, akan kayıt |
| `bs-acilis` | `circuit` | devre yolları, düğümler |
| `gr-bl-1`, `gr-son` | `signal-grid` | tel kafes ufuk + üç halka (bulmacaya gönderme) |
