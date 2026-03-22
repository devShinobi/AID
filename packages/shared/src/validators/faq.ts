import { z } from "zod";

export const FaqQuestionSchema = z.object({
  tool_id: z.string().min(1, "Tool ID is required"),
  question: z
    .string()
    .min(10, "Question must be at least 10 characters")
    .max(500),
  asked_by_email: z
    .string()
    .email("Must be a valid email address")
    .nullable()
    .default(null),
});

export type FaqQuestionInput = z.infer<typeof FaqQuestionSchema>;
