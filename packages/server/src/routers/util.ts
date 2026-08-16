import { ObjectId, type Document, type WithId } from "mongodb";
import { TRPCError } from "@trpc/server";
import type { Form, PublishedForm } from "../schemas.ts";

export const COLLECTION = "forms";
export const PUBLISHED_COLLECTION = "publishedForms";
export const USERS_COLLECTION = "users";

export function serialize(doc: WithId<Document>): Form {
  const { _id, ...rest } = doc;
  return {
    id: _id.toHexString(),
    title: rest.title,
    inputs: rest.inputs,
    publishedFormId: rest.publishedFormId,
    createdBy: rest.createdBy,
    createdAt:
      rest.createdAt instanceof Date
        ? rest.createdAt.toISOString()
        : String(rest.createdAt),
    updatedAt:
      rest.updatedAt instanceof Date
        ? rest.updatedAt.toISOString()
        : String(rest.updatedAt),
  };
}

export function serializePublished(doc: WithId<Document>): PublishedForm {
  const { _id, ...rest } = doc;
  return {
    id: _id.toHexString(),
    data: rest.data,
    isActive: rest.isActive,
    createdBy: rest.createdBy,
    createdAt:
      rest.createdAt instanceof Date
        ? rest.createdAt.toISOString()
        : String(rest.createdAt),
    updatedAt:
      rest.updatedAt instanceof Date
        ? rest.updatedAt.toISOString()
        : String(rest.updatedAt),
  };
}

export function parseId(id: string): ObjectId {
  if (!ObjectId.isValid(id)) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid id" });
  }
  return new ObjectId(id);
}