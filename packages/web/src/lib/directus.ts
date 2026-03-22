import { createDirectus, rest } from "@directus/sdk";

function getDirectusUrl(): string {
  const url = import.meta.env.PUBLIC_DIRECTUS_URL;
  if (!url) {
    throw new Error("PUBLIC_DIRECTUS_URL environment variable is not set");
  }
  return url;
}

export function getDirectusClient() {
  return createDirectus(getDirectusUrl()).with(rest());
}
