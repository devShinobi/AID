import { readItems, readItem } from "@directus/sdk";
import type { News } from "@aid/shared/types";
import { getDirectusClient } from "@/lib/directus";
import { buildPaginationParams } from "@/lib/utils/pagination";

const NEWS_FIELDS = [
  "id",
  "tool_id",
  "title",
  "content",
  "source_url",
  "source_name",
  "source_type",
  "published_at",
  "created_at",
] as const;

export interface FetchNewsParams {
  page?: number;
  limit?: number;
  toolId?: string;
}

export interface FetchNewsResult {
  news: News[];
  total: number;
}

export async function fetchNews(
  params: FetchNewsParams = {}
): Promise<FetchNewsResult> {
  const client = getDirectusClient();
  const { page = 1, limit, toolId } = params;
  const { limit: safeLimit, offset } = buildPaginationParams(page, limit);

  const filter: Record<string, unknown> = {};
  if (toolId) filter["tool_id"] = { _eq: toolId };

  const [news, countResult] = await Promise.all([
    client.request(
      readItems("news", {
        filter,
        limit: safeLimit,
        offset,
        sort: ["-published_at", "-created_at"],
        fields: [...NEWS_FIELDS],
      })
    ),
    client.request(
      readItems("news", {
        filter,
        aggregate: { count: ["id"] },
      })
    ),
  ]);

  const total = Number((countResult as Array<{ count: { id: number } }>)[0]?.count?.id ?? 0);

  return { news: news as News[], total };
}

export async function fetchLatestNews(limit = 3): Promise<News[]> {
  const { news } = await fetchNews({ limit });
  return news;
}

export async function fetchNewsById(id: string): Promise<News | null> {
  const client = getDirectusClient();
  try {
    const result = await client.request(
      readItem("news", id, { fields: [...NEWS_FIELDS] })
    );
    return result as News;
  } catch {
    return null;
  }
}
