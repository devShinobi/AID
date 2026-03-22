import { describe, it, expect } from "vitest";
import {
  buildPaginationParams,
  buildPaginationMeta,
  getPageFromUrl,
  DEFAULT_PAGE_SIZE,
} from "@/lib/utils/pagination";

describe("buildPaginationParams", () => {
  it("returns correct offset for page 1", () => {
    const result = buildPaginationParams(1, 10);
    expect(result).toEqual({ page: 1, limit: 10, offset: 0 });
  });

  it("returns correct offset for page 3", () => {
    const result = buildPaginationParams(3, 10);
    expect(result).toEqual({ page: 3, limit: 10, offset: 20 });
  });

  it("uses DEFAULT_PAGE_SIZE when limit is omitted", () => {
    const result = buildPaginationParams(1);
    expect(result.limit).toBe(DEFAULT_PAGE_SIZE);
  });

  it("clamps page to minimum of 1", () => {
    const result = buildPaginationParams(0, 10);
    expect(result.page).toBe(1);
    expect(result.offset).toBe(0);
  });

  it("clamps page to minimum 1 for negative values", () => {
    const result = buildPaginationParams(-5, 10);
    expect(result.page).toBe(1);
  });

  it("clamps limit to maximum of 100", () => {
    const result = buildPaginationParams(1, 999);
    expect(result.limit).toBe(100);
  });

  it("clamps limit to minimum of 1", () => {
    const result = buildPaginationParams(1, 0);
    expect(result.limit).toBe(1);
  });
});

describe("buildPaginationMeta", () => {
  it("calculates totalPages correctly", () => {
    const meta = buildPaginationMeta(1, 10, 35);
    expect(meta.totalPages).toBe(4);
  });

  it("sets hasNext true when not on last page", () => {
    const meta = buildPaginationMeta(2, 10, 35);
    expect(meta.hasNext).toBe(true);
  });

  it("sets hasNext false on last page", () => {
    const meta = buildPaginationMeta(4, 10, 35);
    expect(meta.hasNext).toBe(false);
  });

  it("sets hasPrev true when not on first page", () => {
    const meta = buildPaginationMeta(2, 10, 35);
    expect(meta.hasPrev).toBe(true);
  });

  it("sets hasPrev false on first page", () => {
    const meta = buildPaginationMeta(1, 10, 35);
    expect(meta.hasPrev).toBe(false);
  });

  it("returns totalPages of 1 when total is 0", () => {
    const meta = buildPaginationMeta(1, 10, 0);
    expect(meta.totalPages).toBe(1);
    expect(meta.hasNext).toBe(false);
  });

  it("returns correct meta for exact page boundary", () => {
    const meta = buildPaginationMeta(2, 10, 20);
    expect(meta.totalPages).toBe(2);
    expect(meta.hasNext).toBe(false);
    expect(meta.hasPrev).toBe(true);
  });
});

describe("getPageFromUrl", () => {
  it("returns the page from search params", () => {
    const url = new URL("http://localhost/tools?page=3");
    expect(getPageFromUrl(url)).toBe(3);
  });

  it("defaults to 1 when page param is absent", () => {
    const url = new URL("http://localhost/tools");
    expect(getPageFromUrl(url)).toBe(1);
  });

  it("defaults to 1 for non-numeric page param", () => {
    const url = new URL("http://localhost/tools?page=abc");
    expect(getPageFromUrl(url)).toBe(1);
  });

  it("defaults to 1 for empty page param", () => {
    const url = new URL("http://localhost/tools?page=");
    expect(getPageFromUrl(url)).toBe(1);
  });
});
