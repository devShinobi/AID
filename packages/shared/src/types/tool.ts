export type PricingType = "free" | "freemium" | "paid" | "open_source";

export interface Tool {
  id: string;
  name: string;
  slug: string;
  overview: string;
  pricing_min: number | null;
  pricing_max: number | null;
  pricing_label: string | null;
  pricing_type: PricingType;
  pros: string[];
  cons: string[];
  is_featured: boolean;
  status: "published" | "draft";
  created_at: string;
  updated_at: string;
  // Relations (populated when fetched with deep fields)
  groups?: ToolGroup[];
  reviews?: Review[];
  alternatives?: Alternative[];
  awards?: ToolAward[];
  tutorials?: Tutorial[];
  news?: News[];
  faq?: Faq[];
  comments?: Comment[];
}

export interface Group {
  id: string;
  name: string;
  slug: string;
  function: string;
  tools?: Tool[];
}

export interface ToolGroup {
  id: string;
  tool_id: string;
  group_id: string | Group;
}

export type ReviewType = "normal" | "expert";

export interface Review {
  id: string;
  tool_id: string;
  review_text: string;
  user_id: string | null;
  type: ReviewType;
  created_at: string;
}

export interface Alternative {
  id: string;
  tool_id: string;
  alt_tool_id: string | null;
  alt_name: string;
  alt_url: string;
}

export interface Award {
  id: string;
  name: string;
  description: string | null;
  icon_url: string | null;
  year: number | null;
}

export interface ToolAward {
  id: string;
  tool_id: string;
  award_id: string | Award;
  awarded_at: string | null;
}

export type TutorialType = "link" | "video_embed";

export interface Tutorial {
  id: string;
  tool_id: string;
  title: string;
  url: string;
  type: TutorialType;
  created_at: string;
}

export type NewsSourceType = "manual" | "rss" | "api";

export interface News {
  id: string;
  tool_id: string;
  title: string | null;
  content: string;
  source_url: string | null;
  source_name: string | null;
  source_type: NewsSourceType;
  published_at: string | null;
  created_at: string;
}

export type FaqStatus = "pending" | "answered";

export interface Faq {
  id: string;
  tool_id: string;
  question: string;
  answer: string | null;
  status: FaqStatus;
  asked_by_email: string | null;
  created_at: string;
}

export type CommentStatus = "pending" | "approved";

export interface Comment {
  id: string;
  tool_id: string;
  author_name: string;
  author_email: string | null;
  content: string;
  parent_id: string | null;
  status: CommentStatus;
  created_at: string;
  replies?: Comment[];
}

export type SubmissionStatus = "pending" | "approved" | "rejected";

export interface Submission {
  id: string;
  name: string;
  tagline: string;
  description: string;
  website_url: string;
  logo_url: string | null;
  pricing_type: PricingType;
  pricing_detail: string | null;
  category_ids: string[];
  tags: string[];
  submitter_name: string;
  submitter_email: string;
  status: SubmissionStatus;
  rejection_reason: string | null;
  reviewed_at: string | null;
  created_at: string;
}
