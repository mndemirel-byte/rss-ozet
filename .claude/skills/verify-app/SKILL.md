---
name: verify-app
description: >
  rss-ozet uygulamasının çalışır durumda olduğunu uçtan uca doğrular.
  Bir feature'ı "bitti" ilan etmeden önce, önemli bir değişiklikten
  sonra ya da bir /goal koşulu uygulama davranışına referans
  verdiğinde kullan.
---

# Uygulama doğrulama prosedürü

Amaç: "kod derleniyor" ile "uygulama çalışıyor" arasındaki farkı
kapatmak. Herhangi bir adım başarısız olursa: sorunu düzelt ve
prosedüre 1. adımdan yeniden başla. Kısmi doğrulama, doğrulama
değildir.

## Adımlar

1. Temiz zemin: `npx tsc --noEmit` ve `npm test` — ikisi de sıfır
   hatayla geçmeli. Çıktıları terminale olduğu gibi yaz.
2. `npm run dev` ile server'ı arka planda başlat;
   http://localhost:3000 hazır olana kadar bekle (en fazla 15 sn).
3. `curl -sS -w "\nHTTP %{http_code}" http://localhost:3000/api/items`
   çağır ve doğrula: son satırda `HTTP 200` yazıyor (status code'u
   kanıt olarak yazdırıyoruz — gövde tek başına 200 kanıtı değildir);
   gövde bir JSON array; en az 1 öğe var; her öğede `title`, `link`
   ve `summary` alanları boş değil.
4. `curl -sS http://localhost:3000/` çıktısında, API'nin döndürdüğü
   en az bir başlık HTML-escaped hâliyle geçiyor (server dış veriyi
   escape ederek basar: API `R&D` dönerse sayfada `R&amp;D` ara —
   ham karşılaştırma, sağlıklı uygulamayı KALDI sayar).
5. Server log'unu tara: uncaught exception / unhandled rejection
   satırı varsa adım başarısızdır.
6. Server'ı kapat ve raporla.

## Raporlama biçimi

Her adım için tek satır:
`ADIM n: GEÇTİ|KALDI — çalıştırılan komut + özet çıktı`
Kanıtı iddiayla değil, komut çıktısıyla ver. Altı adımın tamamı
geçmeden "doğrulama tamam" deme.
