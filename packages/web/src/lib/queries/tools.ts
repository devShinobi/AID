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

/** Resolve a group slug → list of tool IDs via the junction table.
 *  This avoids the M2M relation filter which requires elevated Directus permissions. */
async function resolveToolIdsForGroup(
  client: ReturnType<typeof import("@directus/sdk").createDirectus>,
  groupSlug: string
): Promise<string[] | null> {
  const groups = await client.request(
    readItems("groups" as any, {
      filter: { slug: { _eq: groupSlug } },
      fields: ["id"],
      limit: 1,
    })
  );
  const groupId = (groups as any[])[0]?.id;
  if (!groupId) return null;

  const junctions = await client.request(
    readItems("tool_groups" as any, {
      filter: { group_id: { _eq: groupId } },
      fields: ["tool_id"],
      limit: -1,
    })
  );
  return (junctions as any[]).map((j) =>
    typeof j.tool_id === "string" ? j.tool_id : j.tool_id?.id
  ).filter(Boolean);
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
    const toolIds = await resolveToolIdsForGroup(client as any, groupSlug);
    if (toolIds === null || toolIds.length === 0) return { tools: [], total: 0 };
    filter["id"] = { _in: toolIds };
  }

  const [tools, countResult] = await Promise.all([
    client.request(
      readItems("tools", {
        filter,
        ...(search ? { search } : {}),
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
        ],
      })
    ),
    client.request(
      readItems("tools", {
        filter,
        ...(search ? { search } : {}),
        aggregate: { count: ["id"] },
      })
    ),
  ]);

  const total = Number((countResult as Array<{ count: { id: number } }>)[0]?.count?.id ?? 0);

  // Fetch groups for all returned tools via junction table
  const toolIds = (tools as any[]).map((t) => t.id);
  const allJunctions = toolIds.length > 0
    ? await client.request(readItems("tool_groups" as any, {
        filter: { tool_id: { _in: toolIds } },
        fields: ["tool_id", "group_id.id", "group_id.name", "group_id.slug"],
        limit: -1,
      }))
    : [];

  const junctionsByToolId: Record<string, any[]> = {};
  for (const j of allJunctions as any[]) {
    const tid = typeof j.tool_id === "string" ? j.tool_id : j.tool_id?.id;
    if (tid) (junctionsByToolId[tid] ??= []).push(j);
  }

  const toolsWithGroups = (tools as any[]).map((t) => ({
    ...t,
    groups: junctionsByToolId[t.id] ?? [],
  }));

  return { tools: toolsWithGroups as Tool[], total };
}

export async function fetchFeaturedTools(limit = 6): Promise<Tool[]> {
  const { tools } = await fetchTools({ featuredOnly: true, limit });
  return tools;
}

export async function fetchToolBySlug(slug: string): Promise<Tool | null> {
  const client = getDirectusClient();

  // Fetch base tool fields
  const results = await client.request(
    readItems("tools", {
      filter: { slug: { _eq: slug }, status: { _eq: "published" } },
      limit: 1,
      fields: [
        "id", "name", "slug", "overview",
        "pricing_type", "pricing_min", "pricing_max", "pricing_label",
        "pros", "cons", "is_featured", "status", "created_at", "updated_at",
      ],
    })
  );

  const tool = results[0] as any;
  if (!tool) return null;

  // Fetch all relations in parallel via their own collections
  // (Directus did not create O2M alias fields on tools, so nested fields don't work)
  const [junctions, reviews, alternatives, tutorials, faq, news, awards] = await Promise.all([
    client.request(readItems("tool_groups" as any, {
      filter: { tool_id: { _eq: tool.id } },
      fields: ["id", "group_id.id", "group_id.name", "group_id.slug"],
      limit: -1,
    })),
    client.request(readItems("reviews" as any, {
      filter: { tool_id: { _eq: tool.id } },
      fields: ["id", "review_text", "type", "created_at"],
      limit: -1,
    })),
    client.request(readItems("alternatives" as any, {
      filter: { tool_id: { _eq: tool.id } },
      fields: ["id", "alt_name", "alt_url", "alt_tool_id"],
      limit: -1,
    })),
    client.request(readItems("tutorials" as any, {
      filter: { tool_id: { _eq: tool.id } },
      fields: ["id", "title", "url", "type"],
      limit: -1,
    })),
    client.request(readItems("faq" as any, {
      filter: { tool_id: { _eq: tool.id } },
      fields: ["id", "question", "answer", "status"],
      limit: -1,
    })),
    client.request(readItems("news" as any, {
      filter: { tool_id: { _eq: tool.id } },
      fields: ["id", "title", "content", "source_url", "source_name", "published_at"],
      sort: ["-published_at"],
      limit: 4,
    })),
    client.request(readItems("tool_awards" as any, {
      filter: { tool_id: { _eq: tool.id } },
      fields: ["id", "award_id.id", "award_id.name", "award_id.description", "award_id.icon_url", "award_id.year", "awarded_at"],
      limit: -1,
    })),
  ]);

  tool.groups = junctions;
  tool.reviews = reviews;
  tool.alternatives = alternatives;
  tool.tutorials = tutorials;
  tool.faq = faq;
  tool.news = news;
  tool.awards = awards;

  return tool as Tool;
}
