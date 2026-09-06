import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { readFileSync, writeFileSync } from "node:fs";
import type { AddressInfo } from "node:net";
import app from "../src/server";
import { writeItems } from "../src/feeds";
import type { Item } from "../src/server";

const DATA_PATH = "data/items.json";
const FIXTURE_ITEMS: Item[] = [
  { title: "R&D Duyurusu", link: "https://example.com/rd", summary: "Test özeti." },
  { title: "İkinci Öğe", link: "https://example.com/ikinci", summary: "Başka bir özet." },
];

describe("integration: data/items.json -> /api/items -> SSR ana sayfa", () => {
  let originalData: string;
  let server: ReturnType<typeof app.listen>;
  let baseUrl: string;

  beforeAll(async () => {
    originalData = readFileSync(DATA_PATH, "utf8");
    writeItems(FIXTURE_ITEMS, DATA_PATH);
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => resolve());
    });
    const { port } = server.address() as AddressInfo;
    baseUrl = `http://localhost:${port}`;
  });

  afterAll(async () => {
    writeFileSync(DATA_PATH, originalData, "utf8");
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  });

  it("/api/items fixture kayıtlarını JSON array olarak döner", async () => {
    const res = await fetch(`${baseUrl}/api/items`);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(FIXTURE_ITEMS);
  });

  it("SSR ana sayfa aynı kayıtları HTML-escaped biçimde render eder", async () => {
    const res = await fetch(`${baseUrl}/`);
    const html = await res.text();
    expect(html).toContain("R&amp;D Duyurusu");
    expect(html).toContain(FIXTURE_ITEMS[1].title);
    expect(html).toContain(FIXTURE_ITEMS[0].link);
  });
});
