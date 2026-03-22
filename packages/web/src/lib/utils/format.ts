import { PRICING_TYPE_LABELS } from "@aid/shared/constants";
import type { PricingType } from "@aid/shared/types";

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  return DATE_FORMATTER.format(date);
}

export function formatPricing(
  pricingType: PricingType,
  pricingMin: number | null,
  pricingMax: number | null,
  pricingLabel: string | null
): string {
  if (pricingLabel) return pricingLabel;
  const label = PRICING_TYPE_LABELS[pricingType];
  if (pricingType === "paid") {
    if (pricingMin !== null && pricingMax !== null) {
      return `$${pricingMin}–$${pricingMax}/mo`;
    }
    if (pricingMin !== null) {
      return `From $${pricingMin}/mo`;
    }
  }
  return label;
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}
