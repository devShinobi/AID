/**
 * patch-m2o-fields.ts
 *
 * One-time script to upgrade all FK UUID fields to M2O relation pickers
 * in the Directus admin UI. Run this if setup-directus was run before
 * this fix was applied.
 *
 * Usage:
 *   pnpm --filter @aid/scripts patch-m2o
 */

import { createDirectus, rest, authentication } from "@directus/sdk";

const DIRECTUS_URL = process.env.DIRECTUS_URL ?? "http://localhost:8055";
const ADMIN_EMAIL = process.env.DIRECTUS_ADMIN_EMAIL ?? "admin@example.com";
const ADMIN_PASSWORD = process.env.DIRECTUS_ADMIN_PASSWORD ?? "admin123";

/** All FK fields that should be M2O relation pickers */
const M2O_FIELDS: Array<{
  collection: string;
  field: string;
  related: string;
  template: string;
}> = [
  { collection: "reviews",     field: "tool_id",    related: "tools",   template: "{{name}}" },
  { collection: "alternatives",field: "tool_id",    related: "tools",   template: "{{name}}" },
  { collection: "alternatives",field: "alt_tool_id",related: "tools",   template: "{{name}}" },
  { collection: "tutorials",   field: "tool_id",    related: "tools",   template: "{{name}}" },
  { collection: "news",        field: "tool_id",    related: "tools",   template: "{{name}}" },
  { collection: "faq",         field: "tool_id",    related: "tools",   template: "{{name}}" },
  { collection: "comments",    field: "tool_id",    related: "tools",   template: "{{name}}" },
  { collection: "tool_groups", field: "tool_id",    related: "tools",   template: "{{name}}" },
  { collection: "tool_groups", field: "group_id",   related: "groups",  template: "{{name}}" },
  { collection: "tool_awards", field: "tool_id",    related: "tools",   template: "{{name}}" },
  { collection: "tool_awards", field: "award_id",   related: "awards",  template: "{{name}}" },
];

async function main() {
  console.log(`\n🔧 Patching M2O field interfaces at ${DIRECTUS_URL}…\n`);

  const client = createDirectus(DIRECTUS_URL)
    .with(authentication("json"))
    .with(rest());

  await client.login(ADMIN_EMAIL, ADMIN_PASSWORD);
  const token = await client.getToken();
  console.log("✅ Authenticated\n");

  for (const { collection, field, related, template } of M2O_FIELDS) {
    try {
      const res = await fetch(
        `${DIRECTUS_URL}/fields/${collection}/${field}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            meta: {
              interface: "select-dropdown-m2o",
              display: "related-values",
              display_options: { template },
              special: ["m2o"],
              note: `Related ${related} record`,
            },
          }),
        }
      );

      if (res.ok) {
        console.log(`✅ ${collection}.${field} → ${related} picker`);
      } else {
        const body = await res.json().catch(() => ({}));
        console.error(`❌ ${collection}.${field}: ${JSON.stringify(body)}`);
      }
    } catch (err: any) {
      console.error(`❌ ${collection}.${field}: ${err.message}`);
    }
  }

  console.log("\n🎉 Done! Refresh the Directus admin UI to see the changes.\n");
}

main().catch((err) => {
  console.error("\n💥 Patch failed:", err);
  process.exit(1);
});
