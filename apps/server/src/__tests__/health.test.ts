import { describe, expect, it } from "vitest";
import { app } from "../app.js";

describe("GET /api/v1/health", () => {
  it("returns ok:true", async () => {
    const response = await app.request("/api/v1/health");
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true, data: { status: "ok" } });
  });
});
