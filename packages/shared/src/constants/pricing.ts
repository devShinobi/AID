import type { PricingType } from "../types/index.js";

export const PRICING_TYPE_LABELS: Record<PricingType, string> = {
  free: "Free",
  freemium: "Freemium",
  paid: "Paid",
  open_source: "Open Source",
};

export const PRICING_TYPES: PricingType[] = [
  "free",
  "freemium",
  "paid",
  "open_source",
];
