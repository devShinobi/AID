import { describe, it, expect } from "vitest";
import { SubmissionSchema } from "../../src/validators/submission.js";

describe("SubmissionSchema", () => {
  const valid = {
    name: "ChatGPT",
    tagline: "AI-powered chatbot by OpenAI",
    description: "ChatGPT is a large language model chatbot.",
    website_url: "https://chat.openai.com",
    pricing_type: "freemium",
    submitter_name: "Jane Doe",
    submitter_email: "jane@example.com",
  };

  it("accepts valid minimal submission", () => {
    expect(() => SubmissionSchema.parse(valid)).not.toThrow();
  });

  it("accepts optional fields as undefined", () => {
    const result = SubmissionSchema.parse(valid);
    expect(result.logo_url).toBeNull();
    expect(result.pricing_detail).toBeNull();
    expect(result.category_ids).toEqual([]);
    expect(result.tags).toEqual([]);
  });

  it("rejects missing name", () => {
    const { name: _name, ...rest } = valid;
    expect(() => SubmissionSchema.parse(rest)).toThrow();
  });

  it("rejects missing submitter_email", () => {
    const { submitter_email: _email, ...rest } = valid;
    expect(() => SubmissionSchema.parse(rest)).toThrow();
  });

  it("rejects invalid email format", () => {
    expect(() =>
      SubmissionSchema.parse({ ...valid, submitter_email: "not-an-email" })
    ).toThrow();
  });

  it("rejects invalid website_url", () => {
    expect(() =>
      SubmissionSchema.parse({ ...valid, website_url: "not-a-url" })
    ).toThrow();
  });

  it("rejects invalid pricing_type", () => {
    expect(() =>
      SubmissionSchema.parse({ ...valid, pricing_type: "enterprise" })
    ).toThrow();
  });

  it("rejects empty name", () => {
    expect(() => SubmissionSchema.parse({ ...valid, name: "" })).toThrow();
  });

  it("rejects empty tagline", () => {
    expect(() => SubmissionSchema.parse({ ...valid, tagline: "" })).toThrow();
  });

  it("accepts valid logo_url when provided", () => {
    const result = SubmissionSchema.parse({
      ...valid,
      logo_url: "https://example.com/logo.png",
    });
    expect(result.logo_url).toBe("https://example.com/logo.png");
  });

  it("accepts category_ids as array of strings", () => {
    const result = SubmissionSchema.parse({
      ...valid,
      category_ids: ["uuid-1", "uuid-2"],
    });
    expect(result.category_ids).toEqual(["uuid-1", "uuid-2"]);
  });
});
