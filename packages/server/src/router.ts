import { ObjectId, type Document, type WithId } from "mongodb";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { publicProcedure, router } from "./trpc.ts";
import {
  formDataSchema,
  formIdSchema,
  formSchema,
  publishedFormDataSchema,
  publishedFormIdSchema,
  publishedFormSchema,
  publishedFormUpdateSchema,
  type Form,
  type PublishedForm,
} from "./schemas.ts";

const COLLECTION = "forms";
const PUBLISHED_COLLECTION = "publishedForms";

function serialize(doc: WithId<Document>): Form {
  const { _id, ...rest } = doc;
  return {
    id: _id.toHexString(),
    title: rest.title,
    inputs: rest.inputs,
    publishedFormId: rest.publishedFormId,
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

function serializePublished(doc: WithId<Document>): PublishedForm {
  const { _id, ...rest } = doc;
  return {
    id: _id.toHexString(),
    data: rest.data,
    isActive: rest.isActive,
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

function parseId(id: string): ObjectId {
  if (!ObjectId.isValid(id)) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid id" });
  }
  return new ObjectId(id);
}

export const formRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    const docs = await ctx.db
      .collection(COLLECTION)
      .find()
      .sort({ createdAt: -1 })
      .toArray();
    return docs.map(serialize);
  }),

  byId: publicProcedure.input(formIdSchema).query(async ({ ctx, input }) => {
    const doc = await ctx.db
      .collection(COLLECTION)
      .findOne({ _id: parseId(input.id) });
    if (!doc) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
    }
    return serialize(doc);
  }),

  create: publicProcedure
    .input(formDataSchema)
    .mutation(async ({ ctx, input }) => {
      const now = new Date();
      const result = await ctx.db.collection(COLLECTION).insertOne({
        ...input,
        createdAt: now,
        updatedAt: now,
      });
      return serialize({
        _id: result.insertedId,
        ...input,
        createdAt: now,
        updatedAt: now,
      });
    }),

  update: publicProcedure
    .input(z.object({ id: formIdSchema.shape.id, data: formDataSchema }))
    .mutation(async ({ ctx, input }) => {
      const updatedAt = new Date();
      const result = await ctx.db
        .collection(COLLECTION)
        .findOneAndUpdate(
          { _id: parseId(input.id) },
          { $set: { ...input.data, updatedAt } },
          { returnDocument: "after" },
        );
      if (!result) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
      }
      return serialize(result);
    }),

  delete: publicProcedure
    .input(formIdSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db
        .collection(COLLECTION)
        .deleteOne({ _id: parseId(input.id) });
      if (result.deletedCount === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
      }
      return { id: input.id };
    }),
});

export const publishedFormRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    const docs = await ctx.db
      .collection(PUBLISHED_COLLECTION)
      .find()
      .sort({ createdAt: -1 })
      .toArray();
    return docs.map(serializePublished);
  }),

  byId: publicProcedure
    .input(publishedFormIdSchema)
    .query(async ({ ctx, input }) => {
      const doc = await ctx.db
        .collection(PUBLISHED_COLLECTION)
        .findOne({ _id: parseId(input.id) });
      if (!doc || doc.isActive === false) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Published form not found",
        });
      }
      return serializePublished(doc);
    }),

  create: publicProcedure
    .input(publishedFormDataSchema)
    .mutation(async ({ ctx, input }) => {
      const form = await ctx.db
        .collection(COLLECTION)
        .findOne({ _id: parseId(input.formId) });
      if (!form) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
      }
      const now = new Date();
      const doc = {
        data: input.data ?? {},
        isActive: input.isActive ?? false,
        createdAt: now,
        updatedAt: now,
      };
      const result = await ctx.db
        .collection(PUBLISHED_COLLECTION)
        .insertOne(doc);
      await ctx.db.collection(COLLECTION).updateOne(
        { _id: parseId(input.formId) },
        { $set: { publishedFormId: result.insertedId.toHexString(), updatedAt: now } },
      );
      return serializePublished({ _id: result.insertedId, ...doc });
    }),

  update: publicProcedure
    .input(
      z.object({
        id: publishedFormIdSchema.shape.id,
        data: publishedFormUpdateSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updatedAt = new Date();
      const result = await ctx.db
        .collection(PUBLISHED_COLLECTION)
        .findOneAndUpdate(
          { _id: parseId(input.id) },
          { $set: { ...input.data, updatedAt } },
          { returnDocument: "after" },
        );
      if (!result) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Published form not found",
        });
      }
      return serializePublished(result);
    }),

  delete: publicProcedure
    .input(publishedFormIdSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db
        .collection(PUBLISHED_COLLECTION)
        .deleteOne({ _id: parseId(input.id) });
      if (result.deletedCount === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Published form not found",
        });
      }
      await ctx.db
        .collection(COLLECTION)
        .updateMany({ publishedFormId: input.id }, { $unset: { publishedFormId: "" } });
      return { id: input.id };
    }),
});

export const appRouter = router({
  form: formRouter,
  publishedForm: publishedFormRouter,
});

export type AppRouter = typeof appRouter;

export { formSchema, publishedFormSchema };
