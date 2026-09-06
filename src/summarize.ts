// src/summarize.ts — extractive stub; LLM özetleme Part 4'ün konusu.
export function summarize(text: string, maxSentences = 2): string {
  const sentences = text.replace(/\s+/g, " ").trim().split(/(?<=[.!?])\s+/);
  return sentences.slice(0, maxSentences).join(" ");
}
