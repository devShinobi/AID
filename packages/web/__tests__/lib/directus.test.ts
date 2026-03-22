import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock @directus/sdk before importing the module under test
vi.mock("@directus/sdk", () => ({
  createDirectus: vi.fn((url: string) => ({
    _url: url,
    with: vi.fn(function (this: unknown) { return this; }),
  })),
  rest: vi.fn(() => ({})),
}));

describe("getDirectusClient", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("creates a client using PUBLIC_DIRECTUS_URL", async () => {
    vi.stubEnv("PUBLIC_DIRECTUS_URL", "http://localhost:8055");

    const { getDirectusClient } = await import("@/lib/directus");
    const { createDirectus } = await import("@directus/sdk");

    getDirectusClient();
    expect(createDirectus).toHaveBeenCalledWith("http://localhost:8055");
  });

  it("throws when PUBLIC_DIRECTUS_URL is not set", async () => {
    vi.stubEnv("PUBLIC_DIRECTUS_URL", "");

    const { getDirectusClient } = await import("@/lib/directus");
    expect(() => getDirectusClient()).toThrow("PUBLIC_DIRECTUS_URL");
  });
});
