import { describe, expect, it } from "vitest";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import Parser from "rss-parser";
import { collectItems, updateFeeds, writeItems } from "../src/feeds";
import type { FeedFetcher } from "../src/feeds";

const FIXTURES: Record<string, string> = {
  a: `<?xml version="1.0"?><rss version="2.0"><channel><title>A</title>
    <item><title>Bir başlık. İkinci cümle.</title>
      <link>https://a.example.com/1</link>
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
