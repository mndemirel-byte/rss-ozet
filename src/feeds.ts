// src/feeds.ts — üç RSS kaynağını çeker, normalize eder, özetler ve yazar.
import Parser from "rss-parser";
import { writeFileSync } from "node:fs";
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
  return { title: title.trim(), link: link.trim(), summary: summarize(text) };
}

export async function collectItems(
  sources: readonly string[] = SOURCES,
  fetcher: FeedFetcher = fetchFeed
): Promise<Item[]> {
  const items: Item[] = [];
  for (const url of sources) {
    const feed = await fetcher(url);
    for (const raw of feed.items) {
      const item = toItem(raw);
      if (item) items.push(item);
    }
  }
  return items;
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
