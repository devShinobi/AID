import { readItems } from "@directus/sdk";
import type { Group } from "@aid/shared/types";
import { getDirectusClient } from "@/lib/directus";

export async function fetchGroups(): Promise<Group[]> {
  const client = getDirectusClient();

  const results = await client.request(
    readItems("groups", {
      sort: ["name"],
      fields: ["id", "name", "slug", "function"],
      limit: -1,
    })
  );

  return results as Group[];
}
