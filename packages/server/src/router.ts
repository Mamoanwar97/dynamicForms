import { ObjectId, type Document, type WithId } from "mongodb";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { publicProcedure, router } from "./trpc.ts";
import { formDataSchema, formIdSchema, formSchema, type Form } from "./schemas.ts";

const COLLECTION = "forms";

function serialize(doc: WithId<Document>): Form {
  const { _id, ...rest } = doc;
  return {
    id: _id.toHexString(),
    title: rest.title,
    inputs: rest.inputs,
    createdAt: rest.createdAt instanceof Date ? rest.createdAt.toISOString() : String(rest.createdAt),
    updatedAt: rest.updatedAt instanceof Date ? rest.updatedAt.toISOString() : String(rest.updatedAt),
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
    const doc = await ctx.db.collection(COLLECTION).findOne({ _id: parseId(input.id) });
    if (!doc) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
    }
    return serialize(doc);
  }),

  create: publicProcedure.input(formDataSchema).mutation(async ({ ctx, input }) => {
    const now = new Date();
    const result = await ctx.db.collection(COLLECTION).insertOne({
      ...input,
      createdAt: now,
      updatedAt: now,
    });
    return serialize({ _id: result.insertedId, ...input, createdAt: now, updatedAt: now });
  }),

  update: publicProcedure
    .input(z.object({ id: formIdSchema.shape.id, data: formDataSchema }))
    .mutation(async ({ ctx, input }) => {
      const updatedAt = new Date();
      const result = await ctx.db.collection(COLLECTION).findOneAndUpdate(
        { _id: parseId(input.id) },
        { $set: { ...input.data, updatedAt } },
        { returnDocument: "after" },
      );
      if (!result) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
      }
      return serialize(result);
    }),

  delete: publicProcedure.input(formIdSchema).mutation(async ({ ctx, input }) => {
    const result = await ctx.db.collection(COLLECTION).deleteOne({ _id: parseId(input.id) });
    if (result.deletedCount === 0) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
    }
    return { id: input.id };
  }),
});

export const appRouter = router({
  form: formRouter,
});

export type AppRouter = typeof appRouter;

export { formSchema };
