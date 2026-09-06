import { describe, expect, it } from "vitest";
import { summarize } from "../src/summarize";

describe("summarize (extractive stub)", () => {
  it("ilk iki cümleyi alır", () => {
    expect(summarize("Bir. İki. Üç.")).toBe("Bir. İki.");
  });
  it("kısa metni olduğu gibi döndürür", () => {
    expect(summarize("Tek cümle.")).toBe("Tek cümle.");
  });
});
