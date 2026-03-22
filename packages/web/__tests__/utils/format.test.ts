import { describe, it, expect } from "vitest";
import { formatDate, formatPricing, truncate } from "@/lib/utils/format";

describe("formatDate", () => {
  it("formats a valid ISO date string", () => {
    const result = formatDate("2024-06-15T00:00:00.000Z");
    expect(result).toMatch(/Jun\s+15,?\s+2024/);
  });

  it("returns empty string for null", () => {
    expect(formatDate(null)).toBe("");
  });

  it("returns empty string for undefined", () => {
    expect(formatDate(undefined)).toBe("");
  });

  it("returns empty string for invalid date string", () => {
    expect(formatDate("not-a-date")).toBe("");
  });

  it("returns empty string for empty string", () => {
    expect(formatDate("")).toBe("");
  });
});

describe("formatPricing", () => {
  it("returns pricingLabel when provided", () => {
    const result = formatPricing("paid", 10, 50, "Custom label");
    expect(result).toBe("Custom label");
  });

  it("returns 'Free' for free pricing type with no label", () => {
    expect(formatPricing("free", null, null, null)).toBe("Free");
  });

  it("returns 'Freemium' for freemium type with no label", () => {
    expect(formatPricing("freemium", null, null, null)).toBe("Freemium");
  });

  it("returns 'Open Source' for open_source type", () => {
    expect(formatPricing("open_source", null, null, null)).toBe("Open Source");
  });

  it("returns price range for paid type with min and max", () => {
    expect(formatPricing("paid", 10, 50, null)).toBe("$10–$50/mo");
  });

  it("returns 'From $X/mo' for paid type with min only", () => {
    expect(formatPricing("paid", 20, null, null)).toBe("From $20/mo");
  });

  it("returns 'Paid' for paid type with no price info", () => {
    expect(formatPricing("paid", null, null, null)).toBe("Paid");
  });
});

describe("truncate", () => {
  it("returns the string unchanged when within maxLength", () => {
    expect(truncate("hello", 10)).toBe("hello");
  });

  it("returns the string unchanged when exactly at maxLength", () => {
    expect(truncate("hello", 5)).toBe("hello");
  });

  it("truncates and appends ellipsis when over maxLength", () => {
    const result = truncate("hello world", 5);
    expect(result).toMatch(/^hello.*…$/);
    expect(result.length).toBeLessThanOrEqual(6);
  });

  it("handles empty string", () => {
    expect(truncate("", 10)).toBe("");
  });
});
