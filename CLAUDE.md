# rss-ozet

RSS kaynaklarını çekip özetleyen minimal haber servisi.
TypeScript + Express. Özetleme şimdilik extractive stub'dır
(bkz. src/summarize.ts).

## Komutlar
- Kur: `npm install`
- Tip kontrolü: `npx tsc --noEmit`
- Test: `npm test`
- Lint: `npm run lint`
- Dev server: `npm run dev` (http://localhost:3000)

## Çalışma kuralları
- Her davranış değişikliği bir testle gelir; testi olmayan feature
  bitmiş sayılmaz.
- Test ve lint çıktısını terminale olduğu gibi yaz; özetleyerek aktarma.
- `src/summarize.ts` içindeki stub'ı gerçek bir LLM çağrısıyla
  DEĞİŞTİRME — bilinçli bir karar, Part 4'te ele alınacak.
- Yeni bağımlılık eklemeden önce gerekçesini TASK.md'ye yaz.

## Yapılmayacaklar
- `git push` yok (permission katmanında ayrıca engelli; push insan işidir).
- `.env`, kimlik bilgisi ya da API key dosyası oluşturma.
- Testi geçirmek için testi zayıflatma; kaynağı düzelt.

## Durum dosyaları
- Yeni oturuma başlarken önce TASK.md ve PROGRESS.md'yi oku.
- TASK.md: aktif işin tanımı ve kabul kriterleri.
- PROGRESS.md: her anlamlı adımdan sonra tek satır ekle (append-only).
