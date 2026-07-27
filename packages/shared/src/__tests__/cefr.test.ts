import { describe, expect, it } from "vitest";
import { CEFR_LEVELS, isCefrLevel } from "../types/cefr.js";

describe("isCefrLevel", () => {
  it("accepts every declared CEFR level", () => {
    for (const level of CEFR_LEVELS) {
      expect(isCefrLevel(level)).toBe(true);
    }
  });

  it("rejects an unknown level", () => {
    expect(isCefrLevel("Z9")).toBe(false);
  });
});
