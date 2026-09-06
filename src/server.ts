// src/server.ts
import express from "express";
import { readFileSync } from "node:fs";

export type Item = { title: string; link: string; summary: string; guid?: string };

const ESC: Record<string, string> = {
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
};

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ESC[c]);
}

function safeHref(url: string): string {
  return /^https?:\/\//i.test(url) ? escapeHtml(url) : "#";
}

const app = express();

function loadItems(): Item[] {
  return JSON.parse(readFileSync("data/items.json", "utf8")) as Item[];
}

app.get("/api/items", (_req, res) => {
  res.json(loadItems());
});

app.get("/", (_req, res) => {
  const template = readFileSync("src/public/index.html", "utf8");
  const list = loadItems()
    .map(
      (i) =>
        `<li><a href="${safeHref(i.link)}">${escapeHtml(i.title)}</a>` +
        `<p>${escapeHtml(i.summary)}</p></li>`
    )
    .join("\n");
  res.send(template.replace("<!--ITEMS-->", list));
});

export default app;
