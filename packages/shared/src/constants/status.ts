import type {
  SubmissionStatus,
  CommentStatus,
  FaqStatus,
  ReviewType,
  NewsSourceType,
  TutorialType,
} from "../types/index.js";

export const SUBMISSION_STATUSES: SubmissionStatus[] = [
  "pending",
  "approved",
  "rejected",
];

export const COMMENT_STATUSES: CommentStatus[] = ["pending", "approved"];

export const FAQ_STATUSES: FaqStatus[] = ["pending", "answered"];

export const REVIEW_TYPES: ReviewType[] = ["normal", "expert"];

export const NEWS_SOURCE_TYPES: NewsSourceType[] = ["manual", "rss", "api"];

export const TUTORIAL_TYPES: TutorialType[] = ["link", "video_embed"];
