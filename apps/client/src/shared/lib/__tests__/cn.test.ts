import { describe, expect, it } from "vitest";
import { cn } from "../cn.js";

describe("cn", () => {
  it("joins class names, ignoring falsy values", () => {
    expect(cn("a", false, undefined, "b")).toBe("a b");
  });

  it("resolves conflicting Tailwind utilities, keeping the last one", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });
});
