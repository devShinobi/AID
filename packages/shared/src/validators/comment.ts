import { z } from "zod";

export const CommentSchema = z.object({
  tool_id: z.string().min(1, "Tool ID is required"),
  author_name: z.string().min(1, "Name is required").max(100),
  author_email: z
    .string()
    .email("Must be a valid email address")
    .nullable()
    .default(null),
  content: z
    .string()
    .min(10, "Comment must be at least 10 characters")
    .max(2000),
  parent_id: z.string().nullable().default(null),
});

export type CommentInput = z.infer<typeof CommentSchema>;
