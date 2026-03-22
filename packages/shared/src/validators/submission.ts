import { z } from "zod";
import { PRICING_TYPES } from "../constants/pricing.js";

export const SubmissionSchema = z.object({
  name: z.string().min(1, "Tool name is required").max(100),
  tagline: z.string().min(1, "Tagline is required").max(200),
  description: z.string().min(1, "Description is required"),
  website_url: z.string().url("Must be a valid URL"),
  logo_url: z.string().url("Must be a valid URL").nullable().default(null),
  pricing_type: z.enum(PRICING_TYPES as [string, ...string[]]),
  pricing_detail: z.string().max(200).nullable().default(null),
  category_ids: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  submitter_name: z.string().min(1, "Your name is required").max(100),
  submitter_email: z
    .string()
    .email("Must be a valid email address"),
});

export type SubmissionInput = z.infer<typeof SubmissionSchema>;
