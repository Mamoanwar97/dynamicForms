import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../trpc.ts";
import { formDataSchema, formIdSchema } from "../schemas.ts";
import { COLLECTION, parseId, serialize } from "./util.ts";

export const formRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const docs = await ctx.db
      .collection(COLLECTION)
      .find({ createdBy: ctx.user.id })
      .sort({ createdAt: -1 })
      .toArray();
    return docs.map(serialize);
  }),

  byId: protectedProcedure.input(formIdSchema).query(async ({ ctx, input }) => {
    const doc = await ctx.db
      .collection(COLLECTION)
      .findOne({ _id: parseId(input.id), createdBy: ctx.user.id });
    if (!doc) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
    }
    return serialize(doc);
  }),

  create: protectedProcedure
    .input(formDataSchema)
    .mutation(async ({ ctx, input }) => {
      const now = new Date();
      const result = await ctx.db.collection(COLLECTION).insertOne({
        ...input,
        createdBy: ctx.user.id,
        createdAt: now,
        updatedAt: now,
      });
      return serialize({
        _id: result.insertedId,
        ...input,
        createdBy: ctx.user.id,
        createdAt: now,
        updatedAt: now,
      });
    }),

  update: protectedProcedure
    .input(z.object({ id: formIdSchema.shape.id, data: formDataSchema }))
    .mutation(async ({ ctx, input }) => {
      const updatedAt = new Date();
      const result = await ctx.db
        .collection(COLLECTION)
        .findOneAndUpdate(
          { _id: parseId(input.id), createdBy: ctx.user.id },
          { $set: { ...input.data, updatedAt } },
          { returnDocument: "after" },
        );
      if (!result) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
      }
      return serialize(result);
    }),

  delete: protectedProcedure
    .input(formIdSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db
        .collection(COLLECTION)
        .deleteOne({ _id: parseId(input.id), createdBy: ctx.user.id });
      if (result.deletedCount === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
      }
      return { id: input.id };
    }),
});