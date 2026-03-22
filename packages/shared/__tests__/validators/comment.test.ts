import { describe, it, expect } from "vitest";
import { CommentSchema } from "../../src/validators/comment.js";

describe("CommentSchema", () => {
  const valid = {
    tool_id: "tool-uuid-123",
    author_name: "John Smith",
    content: "This tool is amazing, really helped my workflow!",
  };

  it("accepts valid minimal comment", () => {
    expect(() => CommentSchema.parse(valid)).not.toThrow();
  });

  it("defaults author_email to null", () => {
    const result = CommentSchema.parse(valid);
    expect(result.author_email).toBeNull();
  });

  it("defaults parent_id to null", () => {
    const result = CommentSchema.parse(valid);
    expect(result.parent_id).toBeNull();
  });

  it("accepts valid author_email", () => {
    const result = CommentSchema.parse({
      ...valid,
      author_email: "john@example.com",
    });
    expect(result.author_email).toBe("john@example.com");
  });

  it("rejects invalid author_email format", () => {
    expect(() =>
      CommentSchema.parse({ ...valid, author_email: "bad-email" })
    ).toThrow();
  });

  it("rejects missing tool_id", () => {
    const { tool_id: _id, ...rest } = valid;
    expect(() => CommentSchema.parse(rest)).toThrow();
  });

  it("rejects empty author_name", () => {
    expect(() =>
      CommentSchema.parse({ ...valid, author_name: "" })
    ).toThrow();
  });

  it("rejects empty content", () => {
    expect(() => CommentSchema.parse({ ...valid, content: "" })).toThrow();
  });

  it("rejects content that is too short", () => {
    expect(() =>
      CommentSchema.parse({ ...valid, content: "Hi" })
    ).toThrow();
  });

  it("accepts parent_id for threaded replies", () => {
    const result = CommentSchema.parse({
      ...valid,
      parent_id: "parent-comment-uuid",
    });
    expect(result.parent_id).toBe("parent-comment-uuid");
  });
});
