/**
 * setup-directus.ts
 *
 * Creates all AID collections, fields, and relations in Directus.
 * Safe to run multiple times — skips anything that already exists.
 *
 * Usage:
 *   pnpm --filter @aid/scripts setup
 *   # or from scripts/ directory:
 *   pnpm setup
 */

import {
  createDirectus,
  rest,
  authentication,
  createCollection,
  createField,
  createRelation,
  createPermission,
  readCollections,
  readPolicies,
} from "@directus/sdk";

// ─── Config ──────────────────────────────────────────────────────────────────

const DIRECTUS_URL = process.env.DIRECTUS_URL ?? "http://localhost:8055";
const ADMIN_EMAIL = process.env.DIRECTUS_ADMIN_EMAIL ?? "admin@aid.local";
const ADMIN_PASSWORD = process.env.DIRECTUS_ADMIN_PASSWORD ?? "admin123";

// ─── Schema definition ────────────────────────────────────────────────────────

/**
 * Each entry defines a collection and all its custom fields.
 * Primary key (id), date_created, date_updated are handled automatically by Directus.
 */
const COLLECTIONS: CollectionDef[] = [
  // ── groups ──────────────────────────────────────────────────────────────────
  {
    name: "groups",
    fields: [
      string("name", { required: true }),
      string("slug", { required: true }),
      text("function"),
    ],
  },

  // ── tools ───────────────────────────────────────────────────────────────────
  {
    name: "tools",
    fields: [
      string("name", { required: true }),
      string("slug", { required: true }),
      text("overview", { required: true }),
      integer("pricing_min"),
      integer("pricing_max"),
      string("pricing_label"),
      string("pricing_type", {
        required: true,
        defaultValue: "free",
        options: { choices: pricingChoices() },
      }),
      json("pros"),
      json("cons"),
      boolean("is_featured", { defaultValue: false }),
      string("status", {
        required: true,
        defaultValue: "draft",
        options: { choices: [{ text: "Published", value: "published" }, { text: "Draft", value: "draft" }] },
      }),
    ],
  },

  // ── tool_groups (M2M junction) ───────────────────────────────────────────
  {
    name: "tool_groups",
    fields: [
      uuid("tool_id", { required: true }),
      uuid("group_id", { required: true }),
    ],
  },

  // ── reviews ─────────────────────────────────────────────────────────────────
  {
    name: "reviews",
    fields: [
      uuid("tool_id", { required: true }),
      text("review_text", { required: true }),
      string("user_id"),
      string("type", {
        defaultValue: "normal",
        options: { choices: [{ text: "Normal", value: "normal" }, { text: "Expert", value: "expert" }] },
      }),
    ],
  },

  // ── alternatives ────────────────────────────────────────────────────────────
  {
    name: "alternatives",
    fields: [
      uuid("tool_id", { required: true }),
      uuid("alt_tool_id"),
      string("alt_name", { required: true }),
      string("alt_url", { required: true }),
    ],
  },

  // ── awards ──────────────────────────────────────────────────────────────────
  {
    name: "awards",
    fields: [
      string("name", { required: true }),
      text("description"),
      string("icon_url"),
      integer("year"),
    ],
  },

  // ── tool_awards (M2M junction) ──────────────────────────────────────────────
  {
    name: "tool_awards",
    fields: [
      uuid("tool_id", { required: true }),
      uuid("award_id", { required: true }),
      timestamp("awarded_at"),
    ],
  },

  // ── tutorials ───────────────────────────────────────────────────────────────
  {
    name: "tutorials",
    fields: [
      uuid("tool_id", { required: true }),
      string("title", { required: true }),
      string("url", { required: true }),
      string("type", {
        defaultValue: "link",
        options: { choices: [{ text: "Link", value: "link" }, { text: "Video Embed", value: "video_embed" }] },
      }),
    ],
  },

  // ── news ────────────────────────────────────────────────────────────────────
  {
    name: "news",
    fields: [
      uuid("tool_id", { required: true }),
      string("title"),
      text("content", { required: true }),
      string("source_url"),
      string("source_name"),
      string("source_type", {
        defaultValue: "manual",
        options: { choices: [{ text: "Manual", value: "manual" }, { text: "RSS", value: "rss" }, { text: "API", value: "api" }] },
      }),
      timestamp("published_at"),
    ],
  },

  // ── faq ─────────────────────────────────────────────────────────────────────
  {
    name: "faq",
    fields: [
      uuid("tool_id", { required: true }),
      text("question", { required: true }),
      text("answer"),
      string("status", {
        defaultValue: "pending",
        options: { choices: [{ text: "Pending", value: "pending" }, { text: "Answered", value: "answered" }] },
      }),
      string("asked_by_email"),
    ],
  },

  // ── submissions ──────────────────────────────────────────────────────────────
  {
    name: "submissions",
    fields: [
      string("name", { required: true }),
      string("tagline", { required: true }),
      text("description", { required: true }),
      string("website_url", { required: true }),
      string("logo_url"),
      string("pricing_type", { required: true, options: { choices: pricingChoices() } }),
      string("pricing_detail"),
      json("category_ids"),
      json("tags"),
      string("submitter_name", { required: true }),
      string("submitter_email", { required: true }),
      string("status", {
        defaultValue: "pending",
        options: {
          choices: [
            { text: "Pending", value: "pending" },
            { text: "Approved", value: "approved" },
            { text: "Rejected", value: "rejected" },
          ],
        },
      }),
      text("rejection_reason"),
      timestamp("reviewed_at"),
    ],
  },

  // ── comments ────────────────────────────────────────────────────────────────
  {
    name: "comments",
    fields: [
      uuid("tool_id", { required: true }),
      string("author_name", { required: true }),
      string("author_email"),
      text("content", { required: true }),
      uuid("parent_id"),
      string("status", {
        defaultValue: "pending",
        options: { choices: [{ text: "Pending", value: "pending" }, { text: "Approved", value: "approved" }] },
      }),
    ],
  },
];

/**
 * Foreign key relations (M2O) — one entry per FK field.
 */
const RELATIONS: RelationDef[] = [
  // tool_groups junction
  rel("tool_groups", "tool_id", "tools", "id"),
  rel("tool_groups", "group_id", "groups", "id"),
  // reviews
  rel("reviews", "tool_id", "tools", "id"),
  // alternatives
  rel("alternatives", "tool_id", "tools", "id"),
  rel("alternatives", "alt_tool_id", "tools", "id"),
  // tool_awards
  rel("tool_awards", "tool_id", "tools", "id"),
  rel("tool_awards", "award_id", "awards", "id"),
  // tutorials
  rel("tutorials", "tool_id", "tools", "id"),
  // news
  rel("news", "tool_id", "tools", "id"),
  // faq
  rel("faq", "tool_id", "tools", "id"),
  // comments (self-referential parent)
  rel("comments", "tool_id", "tools", "id"),
  rel("comments", "parent_id", "comments", "id"),
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🔌 Connecting to Directus at ${DIRECTUS_URL}…`);

  const client = createDirectus(DIRECTUS_URL)
    .with(authentication("json"))
    .with(rest());

  await client.login(ADMIN_EMAIL, ADMIN_PASSWORD);
  console.log("✅ Authenticated\n");

  // Get existing collection names to skip already-created ones
  const existing = await client.request(readCollections());
  const existingNames = new Set(existing.map((c: any) => c.collection));

  // Create collections + fields
  for (const def of COLLECTIONS) {
    if (existingNames.has(def.name)) {
      console.log(`⏭️  Collection '${def.name}' already exists — skipping`);
      continue;
    }

    try {
      await client.request(
        createCollection({
          collection: def.name,
          meta: { icon: "box" },
          schema: {},
          fields: [
            {
              field: "id",
              type: "uuid",
              meta: { hidden: true, readonly: true, special: ["uuid"] },
              schema: { is_primary_key: true, has_auto_increment: false },
            },
            {
              field: "created_at",
              type: "timestamp",
              meta: { special: ["date-created"], hidden: true, readonly: true },
              schema: {},
            },
            {
              field: "updated_at",
              type: "timestamp",
              meta: { special: ["date-updated"], hidden: true, readonly: true },
              schema: {},
            },
            ...def.fields,
          ],
        })
      );
      console.log(`✅ Created collection '${def.name}'`);
    } catch (err: any) {
      console.error(`❌ Failed to create '${def.name}': ${err.message ?? err}`);
    }
  }

  console.log("\n📐 Creating relations…");

  for (const r of RELATIONS) {
    try {
      await client.request(createRelation(r));
      console.log(`✅ Relation ${r.collection}.${r.field} → ${r.related_collection}`);
    } catch (err: any) {
      // "already exists" is fine
      if (isAlreadyExists(err)) {
        console.log(`⏭️  Relation ${r.collection}.${r.field} already exists`);
      } else {
        console.error(`❌ Relation ${r.collection}.${r.field}: ${err.message ?? err}`);
      }
    }
  }

  // ── Public read permissions ──────────────────────────────────────────────────
  console.log("\n🔓 Setting up public read permissions…");

  const policies: any[] = await client.request(readPolicies({ fields: ["id", "name"] }));
  const publicPolicy = policies.find(
    (p: any) => p.name === "$t:public_label" || p.name?.toLowerCase().includes("public")
  );

  if (!publicPolicy) {
    console.warn("⚠️  Could not find public policy — skipping permissions setup");
  } else {
    const publicCollections = [
      "tools", "groups", "tool_groups", "reviews",
      "alternatives", "awards", "tool_awards",
      "tutorials", "news", "faq", "comments",
    ];

    for (const collection of publicCollections) {
      try {
        await client.request(
          createPermission({
            policy: publicPolicy.id,
            collection,
            action: "read",
            fields: ["*"],
          })
        );
        console.log(`✅ Public read: ${collection}`);
      } catch (err: any) {
        if (isAlreadyExists(err)) {
          console.log(`⏭️  Public read already set: ${collection}`);
        } else {
          console.error(`❌ Permission ${collection}: ${err.message ?? err}`);
        }
      }
    }
  }

  console.log("\n🎉 Setup complete!\n");
  console.log("Next step: run `pnpm seed` to add sample data.");
}

main().catch((err) => {
  console.error("\n💥 Setup failed:", err);
  process.exit(1);
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

interface FieldOptions {
  required?: boolean;
  defaultValue?: unknown;
  options?: Record<string, unknown>;
}

interface CollectionDef {
  name: string;
  fields: Record<string, unknown>[];
}

interface RelationDef {
  collection: string;
  field: string;
  related_collection: string;
}

function string(field: string, opts: FieldOptions = {}): Record<string, unknown> {
  return fieldDef(field, "string", "character varying", opts);
}

function text(field: string, opts: FieldOptions = {}): Record<string, unknown> {
  return fieldDef(field, "text", "text", opts);
}

function integer(field: string, opts: FieldOptions = {}): Record<string, unknown> {
  return fieldDef(field, "integer", "integer", opts);
}

function boolean(field: string, opts: FieldOptions = {}): Record<string, unknown> {
  return fieldDef(field, "boolean", "boolean", opts);
}

function uuid(field: string, opts: FieldOptions = {}): Record<string, unknown> {
  return fieldDef(field, "uuid", "uuid", opts);
}

function json(field: string, opts: FieldOptions = {}): Record<string, unknown> {
  return fieldDef(field, "json", "json", { ...opts, special: ["cast-json"] });
}

function timestamp(field: string, opts: FieldOptions = {}): Record<string, unknown> {
  return fieldDef(field, "timestamp", "timestamp with time zone", opts);
}

function fieldDef(
  field: string,
  type: string,
  dbType: string,
  opts: FieldOptions & { special?: string[] } = {}
): Record<string, unknown> {
  return {
    field,
    type,
    schema: {
      data_type: dbType,
      is_nullable: !opts.required,
      default_value: opts.defaultValue ?? null,
    },
    meta: {
      required: opts.required ?? false,
      options: opts.options ?? null,
      special: opts.special ?? null,
    },
  };
}

function rel(
  collection: string,
  field: string,
  related_collection: string,
  _relatedField: string
): RelationDef {
  return { collection, field, related_collection };
}

function pricingChoices() {
  return [
    { text: "Free", value: "free" },
    { text: "Freemium", value: "freemium" },
    { text: "Paid", value: "paid" },
    { text: "Open Source", value: "open_source" },
  ];
}

function isAlreadyExists(err: any): boolean {
  const msg: string = err?.message ?? err?.errors?.[0]?.message ?? "";
  return msg.includes("already exists") || msg.includes("RECORD_NOT_UNIQUE") || err?.status === 400;
}
