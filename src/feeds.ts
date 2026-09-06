// src/feeds.ts — üç RSS kaynağını çeker, normalize eder, özetler ve yazar.
import Parser from "rss-parser";
import { readFileSync, writeFileSync } from "node:fs";
import { summarize } from "./summarize";
import type { Item } from "./server";

export const SOURCES: readonly string[] = [
  "https://hnrss.org/frontpage",
  "https://webrazzi.com/feed/",
  "https://feeds.arstechnica.com/arstechnica/index",
];

export type FeedFetcher = (url: string) => Promise<Parser.Output<unknown>>;

const parser = new Parser();
export const fetchFeed: FeedFetcher = (url) => parser.parseURL(url);

function toItem(raw: Parser.Item): Item | undefined {
  const { title, link } = raw;
  if (!title || !link) return undefined;
  const text = raw.contentSnippet || raw.content || raw.summary || title;
  const item: Item = { title: title.trim(), link: link.trim(), summary: summarize(text) };
  if (raw.guid) item.guid = raw.guid;
  return item;
}

export function itemId(item: Item): string {
  return item.guid ?? item.link;
}

type SourceItems = { source: string; items: Item[] };

async function collectItemsBySource(
  sources: readonly string[],
  fetcher: FeedFetcher
): Promise<SourceItems[]> {
  const results: SourceItems[] = [];
  for (const url of sources) {
    const feed = await fetcher(url);
    const items: Item[] = [];
    for (const raw of feed.items) {
      const item = toItem(raw);
      if (item) items.push(item);
    }
    results.push({ source: url, items });
  }
  return results;
}

export async function collectItems(
  sources: readonly string[] = SOURCES,
  fetcher: FeedFetcher = fetchFeed
): Promise<Item[]> {
  const grouped = await collectItemsBySource(sources, fetcher);
  return grouped.flatMap((g) => g.items);
}

export function writeItems(items: Item[], path = "data/items.json"): void {
  writeFileSync(path, JSON.stringify(items, null, 2) + "\n", "utf8");
}

export async function updateFeeds(
  path = "data/items.json",
  sources: readonly string[] = SOURCES,
  fetcher: FeedFetcher = fetchFeed
): Promise<Item[]> {
  const items = await collectItems(sources, fetcher);
  writeItems(items, path);
  return items;
}

export type SyncResult = { newCount: number; bySource: Record<string, number> };

export async function syncFeeds(
  path = "data/items.json",
  sources: readonly string[] = SOURCES,
  fetcher: FeedFetcher = fetchFeed
): Promise<SyncResult> {
  const existing: Item[] = JSON.parse(readFileSync(path, "utf8"));
  const seen = new Set(existing.map(itemId));
  const grouped = await collectItemsBySource(sources, fetcher);
  const bySource: Record<string, number> = {};
  const appended: Item[] = [];
  for (const { source, items } of grouped) {
    let count = 0;
    for (const item of items) {
      const id = itemId(item);
      if (seen.has(id)) continue;
      seen.add(id);
      appended.push(item);
      count++;
    }
    if (count > 0) bySource[source] = count;
  }
  if (appended.length > 0) writeItems([...existing, ...appended], path);
  return { newCount: appended.length, bySource };
}
