import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Tool } from "@aid/shared/types";

const mockRequest = vi.fn();

vi.mock("@/lib/directus", () => ({
  getDirectusClient: () => ({ request: mockRequest }),
}));

vi.mock("@directus/sdk", () => ({
  readItems: vi.fn((collection: string, query: unknown) => ({ collection, query })),
  readItem: vi.fn((collection: string, id: string, query: unknown) => ({ collection, id, query })),
}));

const MOCK_TOOL: Tool = {
  id: "1",
  name: "Test Tool",
  slug: "test-tool",
  overview: "A great AI tool for testing.",
  pricing_type: "free",
  pricing_min: null,
  pricing_max: null,
  pricing_label: null,
  pros: ["Fast", "Accurate"],
  cons: ["Expensive"],
  is_featured: true,
  status: "published",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

describe("fetchTools", () => {
  beforeEach(() => {
    vi.resetModules();
    mockRequest.mockReset();
  });

  it("returns tools and total from Directus", async () => {
    mockRequest
      .mockResolvedValueOnce([MOCK_TOOL])
      .mockResolvedValueOnce([{ count: { id: 1 } }]);

    const { fetchTools } = await import("@/lib/queries/tools");
    const result = await fetchTools();

    expect(result.tools).toEqual([MOCK_TOOL]);
    expect(result.total).toBe(1);
  });

  it("returns empty tools and zero total when Directus returns nothing", async () => {
    mockRequest
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ count: { id: 0 } }]);

    const { fetchTools } = await import("@/lib/queries/tools");
    const result = await fetchTools();

    expect(result.tools).toEqual([]);
    expect(result.total).toBe(0);
  });

  it("handles missing count gracefully", async () => {
    mockRequest
      .mockResolvedValueOnce([MOCK_TOOL])
      .mockResolvedValueOnce([{}]);

    const { fetchTools } = await import("@/lib/queries/tools");
    const result = await fetchTools();

    expect(result.total).toBe(0);
  });
});

describe("fetchToolBySlug", () => {
  beforeEach(() => {
    vi.resetModules();
    mockRequest.mockReset();
  });

  it("returns the tool when found", async () => {
    mockRequest.mockResolvedValueOnce([MOCK_TOOL]);

    const { fetchToolBySlug } = await import("@/lib/queries/tools");
    const result = await fetchToolBySlug("test-tool");

    expect(result).toEqual(MOCK_TOOL);
  });

  it("returns null when no tool matches the slug", async () => {
    mockRequest.mockResolvedValueOnce([]);

    const { fetchToolBySlug } = await import("@/lib/queries/tools");
    const result = await fetchToolBySlug("nonexistent");

    expect(result).toBeNull();
  });
});

describe("fetchFeaturedTools", () => {
  beforeEach(() => {
    vi.resetModules();
    mockRequest.mockReset();
  });

  it("returns only featured tools", async () => {
    mockRequest
      .mockResolvedValueOnce([MOCK_TOOL])
      .mockResolvedValueOnce([{ count: { id: 1 } }]);

    const { fetchFeaturedTools } = await import("@/lib/queries/tools");
    const result = await fetchFeaturedTools(6);

    expect(result).toEqual([MOCK_TOOL]);
  });
});
