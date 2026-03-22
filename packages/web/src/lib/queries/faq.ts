import { readItems } from "@directus/sdk";
import type { Faq } from "@aid/shared/types";
import { getDirectusClient } from "@/lib/directus";

export async function fetchFaqsByTool(toolId: string): Promise<Faq[]> {
  const client = getDirectusClient();

  const results = await client.request(
    readItems("faq", {
      filter: {
        tool_id: { _eq: toolId },
        status: { _eq: "answered" },
      },
      sort: ["created_at"],
      fields: ["id", "tool_id", "question", "answer", "status", "created_at"],
      limit: -1,
    })
  );

  return results as Faq[];
}

export async function fetchAllAnsweredFaqs(): Promise<Faq[]> {
  const client = getDirectusClient();

  const results = await client.request(
    readItems("faq", {
      filter: { status: { _eq: "answered" } },
      sort: ["tool_id", "created_at"],
      fields: ["id", "tool_id", "question", "answer", "status", "created_at"],
      limit: -1,
    })
  );

  return results as Faq[];
}
