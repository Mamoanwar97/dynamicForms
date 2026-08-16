import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, publicProcedure, router } from "../trpc.ts";
import {
  publishedFormDataSchema,
  publishedFormIdSchema,
  publishedFormUpdateSchema,
} from "../schemas.ts";
import {
  COLLECTION,
  PUBLISHED_COLLECTION,
  parseId,
  serializePublished,
} from "./util.ts";

export const publishedFormRouter = router({
  byId: publicProcedure
    .input(publishedFormIdSchema)
    .query(async ({ ctx, input }) => {
      const doc = await ctx.db
        .collection(PUBLISHED_COLLECTION)
        .findOne({ _id: parseId(input.id), isActive: true });
      if (!doc) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Published form not found",
        });
      }
      return serializePublished(doc);
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    const docs = await ctx.db
      .collection(PUBLISHED_COLLECTION)
      .find({ createdBy: ctx.user.id })
      .sort({ createdAt: -1 })
      .toArray();
    return docs.map(serializePublished);
  }),

  create: protectedProcedure
    .input(publishedFormDataSchema)
    .mutation(async ({ ctx, input }) => {
      const form = await ctx.db
        .collection(COLLECTION)
        .findOne({ _id: parseId(input.formId) });
      if (!form) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
      }
      if (form.createdBy !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the owner of the form can publish it",
        });
      }
      const now = new Date();
      const doc = {
        data: input.data ?? {},
        isActive: input.isActive ?? false,
        createdBy: ctx.user.id,
        createdAt: now,
        updatedAt: now,
      };
      const result = await ctx.db
        .collection(PUBLISHED_COLLECTION)
        .insertOne(doc);
      await ctx.db.collection(COLLECTION).updateOne(
        { _id: parseId(input.formId) },
        {
          $set: {
            publishedFormId: result.insertedId.toHexString(),
            updatedAt: now,
          },
        },
      );
      return serializePublished({ _id: result.insertedId, ...doc });
    }),

  update: protectedProcedure
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
          { _id: parseId(input.id), createdBy: ctx.user.id },
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

  delete: protectedProcedure
    .input(publishedFormIdSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db
        .collection(PUBLISHED_COLLECTION)
        .deleteOne({ _id: parseId(input.id), createdBy: ctx.user.id });
      if (result.deletedCount === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Published form not found",
        });
      }
      await ctx.db
        .collection(COLLECTION)
        .updateMany(
          { publishedFormId: input.id },
          { $unset: { publishedFormId: "" } },
        );
      return { id: input.id };
    }),
});