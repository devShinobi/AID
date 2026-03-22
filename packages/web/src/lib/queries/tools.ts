import { readItems, readItem } from "@directus/sdk";
import type { Tool, PricingType } from "@aid/shared/types";
import { getDirectusClient } from "@/lib/directus";
import { buildPaginationParams } from "@/lib/utils/pagination";

export interface FetchToolsParams {
  page?: number;
  limit?: number;
  groupSlug?: string;
  pricingType?: PricingType;
  search?: string;
  featuredOnly?: boolean;
}

export interface FetchToolsResult {
  tools: Tool[];
  total: number;
}

export async function fetchTools(
  params: FetchToolsParams = {}
): Promise<FetchToolsResult> {
  const client = getDirectusClient();
  const { page = 1, limit, groupSlug, pricingType, search, featuredOnly } = params;
  const { limit: safeLimit, offset } = buildPaginationParams(page, limit);

  // Build filter
  const filter: Record<string, unknown> = { status: { _eq: "published" } };
  if (featuredOnly) filter["is_featured"] = { _eq: true };
  if (pricingType) filter["pricing_type"] = { _eq: pricingType };
  if (groupSlug) {
    filter["groups"] = { group_id: { slug: { _eq: groupSlug } } };
  }

  const [tools, countResult] = await Promise.all([
    client.request(
      readItems("tools", {
        filter,
        search: search || undefined,
        limit: safeLimit,
        offset,
        sort: ["-is_featured", "-created_at"],
        fields: [
          "id",
          "name",
          "slug",
          "overview",
          "pricing_type",
          "pricing_min",
          "pricing_max",
          "pricing_label",
          "is_featured",
          "status",
          "created_at",
          "groups.id",
          "groups.group_id.id",
          "groups.group_id.name",
          "groups.group_id.slug",
        ],
      })
    ),
    client.request(
      readItems("tools", {
        filter,
        search: search || undefined,
        aggregate: { count: ["id"] },
      })
    ),
  ]);

  const total = Number((countResult as Array<{ count: { id: number } }>)[0]?.count?.id ?? 0);

  return { tools: tools as Tool[], total };
}

export async function fetchFeaturedTools(limit = 6): Promise<Tool[]> {
  const { tools } = await fetchTools({ featuredOnly: true, limit });
  return tools;
}

export async function fetchToolBySlug(slug: string): Promise<Tool | null> {
  const client = getDirectusClient();

  const results = await client.request(
    readItems("tools", {
      filter: { slug: { _eq: slug }, status: { _eq: "published" } },
      limit: 1,
      fields: [
        "id",
        "name",
        "slug",
        "overview",
        "pricing_type",
        "pricing_min",
        "pricing_max",
        "pricing_label",
        "pros",
        "cons",
        "is_featured",
        "status",
        "created_at",
        "updated_at",
        "groups.id",
        "groups.group_id.id",
        "groups.group_id.name",
        "groups.group_id.slug",
        "reviews.id",
        "reviews.review_text",
        "reviews.type",
        "reviews.created_at",
        "alternatives.id",
        "alternatives.alt_name",
        "alternatives.alt_url",
        "alternatives.alt_tool_id",
        "awards.id",
        "awards.award_id.id",
        "awards.award_id.name",
        "awards.award_id.description",
        "awards.award_id.icon_url",
        "awards.awarded_at",
        "tutorials.id",
        "tutorials.title",
        "tutorials.url",
        "tutorials.type",
        "faq.id",
        "faq.question",
        "faq.answer",
        "faq.status",
        "news.id",
        "news.title",
        "news.source_url",
        "news.published_at",
      ],
    })
  );

  return (results[0] as Tool) ?? null;
}
