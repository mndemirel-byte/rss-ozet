import { describe, expect, it } from "vitest";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import Parser from "rss-parser";
import { collectItems, syncFeeds, updateFeeds, writeItems } from "../src/feeds";
import type { FeedFetcher } from "../src/feeds";

const FIXTURES: Record<string, string> = {
  a: `<?xml version="1.0"?><rss version="2.0"><channel><title>A</title>
    <item><title>Bir başlık. İkinci cümle.</title>
      <link>https://a.example.com/1</link>
      <guid>guid-a-1</guid>
      <description>Bir başlık. İkinci cümle. Üçüncü cümle.</description>
    </item>
  </channel></rss>`,
  b: `<?xml version="1.0"?><rss version="2.0"><channel><title>B</title>
    <item><title>Linksiz öğe</title>
      <description>Bu öğenin link'i yok, atlanmalı.</description>
    </item>
    <item><title>B kaynağından haber</title>
      <link>https://b.example.com/1</link>
      <description>B'den tek cümlelik özet.</description>
    </item>
  </channel></rss>`,
  c: `<?xml version="1.0"?><rss version="2.0"><channel><title>C</title>
    <item><title>C kaynağından haber</title>
      <link>https://c.example.com/1</link>
      <description>C'den ilk cümle. C'den ikinci cümle. C'den üçüncü cümle.</description>
    </item>
  </channel></rss>`,
};

const parser = new Parser();
const fixtureFetcher: FeedFetcher = (url) => parser.parseString(FIXTURES[url]);

describe("feeds (fixture, ağa çıkmadan)", () => {
  it("üç kaynaktan gelen öğeleri normalize edip birleştirir", async () => {
    const items = await collectItems(["a", "b", "c"], fixtureFetcher);
    expect(items).toHaveLength(3);
    expect(items.map((i) => i.link)).toEqual([
      "https://a.example.com/1",
      "https://b.example.com/1",
      "https://c.example.com/1",
    ]);
  });

  it("link'i olmayan öğeyi atlar", async () => {
    const items = await collectItems(["b"], fixtureFetcher);
    expect(items).toHaveLength(1);
    expect(items[0].title).toBe("B kaynağından haber");
  });

  it("özeti summarize stub'ı ile (ilk iki cümle) üretir", async () => {
    const items = await collectItems(["a"], fixtureFetcher);
    expect(items[0].summary).toBe("Bir başlık. İkinci cümle.");
  });

  it("her öğede title, link, summary alanları dolu", async () => {
    const items = await collectItems(["a", "b", "c"], fixtureFetcher);
    for (const item of items) {
      expect(item.title.length).toBeGreaterThan(0);
      expect(item.link.length).toBeGreaterThan(0);
      expect(item.summary.length).toBeGreaterThan(0);
    }
  });

  it("writeItems verilen yola geçerli JSON yazar", () => {
    const dir = mkdtempSync(join(tmpdir(), "rss-ozet-"));
    const path = join(dir, "items.json");
    writeItems([{ title: "T", link: "https://x.example.com", summary: "Ö" }], path);
    const written = JSON.parse(readFileSync(path, "utf8"));
    expect(written).toEqual([{ title: "T", link: "https://x.example.com", summary: "Ö" }]);
  });

  it("updateFeeds: çeker, özetler, verilen yola yazar ve döner", async () => {
    const dir = mkdtempSync(join(tmpdir(), "rss-ozet-"));
    const path = join(dir, "items.json");
    const items = await updateFeeds(path, ["a", "c"], fixtureFetcher);
    expect(items).toHaveLength(2);
    const written = JSON.parse(readFileSync(path, "utf8"));
    expect(written).toEqual(items);
  });
});

describe("syncFeeds (kimlik: guid varsa guid, yoksa link)", () => {
  it("aynı kimlikteki (link) öğeyi tekrar eklemez, sadece yenileri ekler", async () => {
    const dir = mkdtempSync(join(tmpdir(), "rss-ozet-"));
    const path = join(dir, "items.json");
    writeItems([{ title: "Var olan", link: "https://b.example.com/1", summary: "Zaten var." }], path);
    const result = await syncFeeds(path, ["a", "b", "c"], fixtureFetcher);
    expect(result.newCount).toBe(2);
    expect(result.bySource).toEqual({ a: 1, c: 1 });
    const written = JSON.parse(readFileSync(path, "utf8"));
    expect(written).toHaveLength(3);
  });

  it("aynı guid farklı link ile geldiğinde öğeyi yeni saymaz (guid önceliklidir)", async () => {
    const dir = mkdtempSync(join(tmpdir(), "rss-ozet-"));
    const path = join(dir, "items.json");
    writeItems(
      [{ title: "Eski başlık", link: "https://old.example.com/moved", summary: "Eski özet.", guid: "guid-a-1" }],
      path
    );
    const result = await syncFeeds(path, ["a"], fixtureFetcher);
    expect(result.newCount).toBe(0);
    expect(result.bySource).toEqual({});
  });

  it("hiç yeni öğe yoksa dosyaya dokunmaz", async () => {
    const dir = mkdtempSync(join(tmpdir(), "rss-ozet-"));
    const path = join(dir, "items.json");
    const existing = await collectItems(["a", "b", "c"], fixtureFetcher);
    writeItems(existing, path);
    const before = readFileSync(path, "utf8");
    const result = await syncFeeds(path, ["a", "b", "c"], fixtureFetcher);
    expect(result.newCount).toBe(0);
    expect(readFileSync(path, "utf8")).toBe(before);
  });
});
