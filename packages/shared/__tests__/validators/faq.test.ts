import { describe, it, expect } from "vitest";
import { FaqQuestionSchema } from "../../src/validators/faq.js";

describe("FaqQuestionSchema", () => {
  const valid = {
    tool_id: "tool-uuid-123",
    question: "Does this tool support multiple languages?",
    asked_by_email: "user@example.com",
  };

  it("accepts valid question with email", () => {
    expect(() => FaqQuestionSchema.parse(valid)).not.toThrow();
  });

  it("accepts question without email", () => {
    const { asked_by_email: _email, ...rest } = valid;
    expect(() => FaqQuestionSchema.parse(rest)).not.toThrow();
  });

  it("defaults asked_by_email to null", () => {
    const { asked_by_email: _email, ...rest } = valid;
    const result = FaqQuestionSchema.parse(rest);
    expect(result.asked_by_email).toBeNull();
  });

  it("rejects missing tool_id", () => {
    const { tool_id: _id, ...rest } = valid;
    expect(() => FaqQuestionSchema.parse(rest)).toThrow();
  });

  it("rejects empty question", () => {
    expect(() =>
      FaqQuestionSchema.parse({ ...valid, question: "" })
    ).toThrow();
  });

  it("rejects question that is too short", () => {
    expect(() =>
      FaqQuestionSchema.parse({ ...valid, question: "Why?" })
    ).toThrow();
  });

  it("rejects invalid email format", () => {
    expect(() =>
      FaqQuestionSchema.parse({ ...valid, asked_by_email: "bad" })
    ).toThrow();
  });
});
