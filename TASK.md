# TASK.md

## Aktif iş
Feed katmanı: üç kaynaktan öğe çek, normalize et, stub özetten geçir,
data/items.json'a yaz — /api/items ve SSR sayfa aynı veriyi sunsun.

## Kabul kriterleri (Adım 4'teki /goal ile birebir aynı sözleşme)
- [ ] feeds.ts: üç kaynak → normalize → stub özet → data/items.json
- [ ] tests/feeds.test.ts fixture ile geçiyor (ağ erişimi yok)
- [ ] integration test: data/items.json → /api/items → SSR zinciri
- [ ] npm test: ≥ 8 test, tamamı yeşil; lint + tsc temiz
- [ ] verify-app: 6/6 GEÇTİ

## Kaynak listesi
- https://hnrss.org/frontpage
- https://webrazzi.com/feed/
- https://feeds.arstechnica.com/arstechnica/index

## Bağımlılık gerekçeleri
- rss-parser: RSS/Atom parse; std kütüphanede karşılığı yok.
