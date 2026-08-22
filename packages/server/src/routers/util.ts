import { TRPCError } from "@trpc/server";
import type { Form, FormData, PublishedForm } from "../schemas.ts";

export type FormRow = {
  id: string;
  title: string;
  public_slug: string | null;
  created_at: Date;
  updated_at: Date;
  schema: string | null;
};

export type PublishedFormRow = FormRow & {
  is_active: boolean;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function parseUuid(id: string): string {
  if (!UUID_RE.test(id)) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid id" });
  }
  return id;
}

export function parseSchema(schema: string | null): FormData | undefined {
  if (!schema) return undefined;
  return JSON.parse(schema) as FormData;
}

export function toForm(row: FormRow): Form {
  const data = parseSchema(row.schema);
  return {
    id: row.id,
    title: row.title,
    inputs: data?.inputs ?? [],
    publishedSlug: row.public_slug ?? undefined,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export function toPublishedForm(row: PublishedFormRow): PublishedForm {
  return {
    id: row.id,
    slug: row.public_slug ?? "",
    data: parseSchema(row.schema),
    isActive: row.is_active,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function generateSlug(): string {
  const bytes = new Uint8Array(9);
  crypto.getRandomValues(bytes);
  return toBase64Url(bytes);
}