import type { APIRoute } from "astro";
import { createItem } from "@directus/sdk";
import { SubmissionSchema } from "@aid/shared/validators";
import { getDirectusClient } from "@/lib/directus";

export const POST: APIRoute = async ({ request }) => {
  // Parse body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  // Validate with Zod
  const result = SubmissionSchema.safeParse(body);
  if (!result.success) {
    const errors = result.error.issues.map((i) => ({
      field: i.path.join("."),
      message: i.message,
    }));
    return json({ error: "Validation failed", errors }, 422);
  }

  // Forward to Directus
  try {
    const client = getDirectusClient();
    await client.request(
      createItem("submissions", {
        ...result.data,
        status: "pending",
      })
    );
    return json({ success: true }, 201);
  } catch (err) {
    console.error("[api/submissions] Directus error:", err);
    return json({ error: "Failed to save submission. Please try again." }, 502);
  }
};

// Block all other methods
export const GET: APIRoute = () => json({ error: "Method not allowed" }, 405);

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
