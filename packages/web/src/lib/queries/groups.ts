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

export async function fetchGroupsWithCounts(): Promise<(Group & { toolCount: number })[]> {
  const client = getDirectusClient();

  const [groups, junctions] = await Promise.all([
    client.request(
      readItems("groups", {
        sort: ["name"],
        fields: ["id", "name", "slug", "function"],
        limit: -1,
      })
    ),
    client.request(
      readItems("tool_groups" as any, {
        fields: ["group_id"],
        limit: -1,
      })
    ),
  ]);

  const counts: Record<string, number> = {};
  for (const j of junctions as any[]) {
    const gid = typeof j.group_id === "string" ? j.group_id : j.group_id?.id;
    if (gid) counts[gid] = (counts[gid] ?? 0) + 1;
  }

  return (groups as Group[]).map((g) => ({ ...g, toolCount: counts[g.id] ?? 0 }));
}
