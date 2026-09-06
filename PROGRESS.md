# PROGRESS.md
<!-- append-only; her anlamlı adımdan sonra TEK satır ekle -->
- 2026-09-07: src/feeds.ts eklendi (fetch → normalize → summarize → yaz); @types/xml2js dev bağımlılığı eklendi (rss-parser tip hatası için, gerekçe TASK.md'de).
- 2026-09-07: tests/feeds.test.ts (6 test, fixture XML ile, ağ erişimi yok) ve tests/integration.test.ts (2 test, data/items.json → /api/items → SSR zinciri) eklendi; npm test 10/10 yeşil, lint ve tsc temiz.
- 2026-09-07: verify-app skill'i 6/6 GEÇTİ raporu üretti; tüm kabul kriterleri sağlandı, /goal hedefi tamamlandı.
- 2026-09-07: /loop başlatıldı (5 dk aralık, cron 3da6d6a1); Item tipine guid alanı, feeds.ts'e itemId + syncFeeds (guid varsa guid, yoksa link'e göre dedup) eklendi; 4 yeni test (13/13 yeşil, lint+tsc temiz). İlk çalıştırma: 60 yeni öğe işlendi (kaynak: https://hnrss.org/frontpage: 20, kaynak: https://webrazzi.com/feed/: 20, kaynak: https://feeds.arstechnica.com/arstechnica/index: 20).
- 2026-09-07: 2 yeni öğe işlendi (kaynak: https://hnrss.org/frontpage).
