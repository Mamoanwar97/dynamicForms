import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, publicProcedure, router } from "../trpc.ts";
import {
  publishedFormDataSchema,
  publishedFormIdSchema,
  publishedFormSlugSchema,
  publishedFormUpdateSchema,
} from "../schemas.ts";
import {
  generateSlug,
  parseUuid,
  toPublishedForm,
  type PublishedFormRow,
} from "./util.ts";

const PUBLISHED_SELECT = `
  SELECT f.id, f.title, f.public_slug, f.is_active, f.created_at, f.updated_at,
         v.schema::text AS schema
  FROM forms f
  LEFT JOIN form_versions v ON v.id = f.published_version_id
`;

export const publishedFormRouter = router({
  byId: publicProcedure
    .input(publishedFormSlugSchema)
    .query(async ({ ctx, input }) => {
      const row = await ctx.db.queryOne<PublishedFormRow>(
        `${PUBLISHED_SELECT} WHERE f.public_slug = $1 AND f.is_active = true`,
        [input.slug],
      );
      if (!row) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Published form not found",
        });
      }
      return toPublishedForm(row);
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db.query<PublishedFormRow>(
      `${PUBLISHED_SELECT} WHERE f.owner_id = $1 ORDER BY f.created_at DESC`,
      [ctx.user.id],
    );
    return rows.map(toPublishedForm);
  }),

  create: protectedProcedure
    .input(publishedFormDataSchema)
    .mutation(async ({ ctx, input }) => {
      const formId = parseUuid(input.formId);
      const now = new Date();

      const row = await ctx.db.withTransaction(async (tx) => {
        const form = await tx.queryOne<{
          id: string;
          owner_id: string;
          draft_version_id: string | null;
          published_version_id: string | null;
          public_slug: string | null;
        }>(
          `SELECT id, owner_id, draft_version_id, published_version_id, public_slug
           FROM forms WHERE id = $1`,
          [formId],
        );
        if (!form) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Form not found",
          });
        }
        if (form.owner_id !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only the owner of the form can publish it",
          });
        }

        let publishedVersionId: string;
        if (form.draft_version_id) {
          publishedVersionId = form.draft_version_id;
          await tx.query(
            `UPDATE form_versions SET status = 'published', published_at = $1
             WHERE id = $2`,
            [now, publishedVersionId],
          );
        } else if (form.published_version_id) {
          publishedVersionId = form.published_version_id;
          await tx.query(
            `UPDATE form_versions SET published_at = $1 WHERE id = $2`,
            [now, publishedVersionId],
          );
        } else {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Form has no draft version to publish",
          });
        }

        await tx.query(
          `UPDATE form_versions SET status = 'archived'
           WHERE form_id = $1 AND status = 'published' AND id <> $2`,
          [formId, publishedVersionId],
        );

        await tx.query(
          `UPDATE forms
           SET is_active = $1,
               public_slug = COALESCE(public_slug, $2),
               published_version_id = $3,
               draft_version_id = NULL,
               updated_at = $4
           WHERE id = $5`,
          [
            input.isActive ?? true,
            generateSlug(),
            publishedVersionId,
            now,
            formId,
          ],
        );

        return tx.queryOne<PublishedFormRow>(
          `${PUBLISHED_SELECT} WHERE f.id = $1`,
          [formId],
        );
      });

      if (!row) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Published form not found",
        });
      }
      return toPublishedForm(row);
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: publishedFormIdSchema.shape.id,
        data: publishedFormUpdateSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const id = parseUuid(input.id);
      const rows = await ctx.db.query<{ id: string }>(
        `UPDATE forms
         SET is_active = $1, updated_at = $2
         WHERE id = $3 AND owner_id = $4 AND published_version_id IS NOT NULL
         RETURNING id`,
        [input.data.isActive ?? true, new Date(), id, ctx.user.id],
      );
      if (!rows[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Published form not found",
        });
      }
      const row = await ctx.db.queryOne<PublishedFormRow>(
        `${PUBLISHED_SELECT} WHERE f.id = $1`,
        [id],
      );
      return toPublishedForm(row!);
    }),

  delete: protectedProcedure
    .input(publishedFormIdSchema)
    .mutation(async ({ ctx, input }) => {
      const id = parseUuid(input.id);
      await ctx.db.withTransaction(async (tx) => {
        const rows = await tx.query<{ id: string }>(
          `UPDATE forms
           SET is_active = false, public_slug = NULL, published_version_id = NULL,
               updated_at = now()
           WHERE id = $1 AND owner_id = $2 AND published_version_id IS NOT NULL
           RETURNING id`,
          [id, ctx.user.id],
        );
        if (!rows[0]) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Published form not found",
          });
        }
        await tx.query(
          `UPDATE form_versions SET status = 'archived'
           WHERE form_id = $1 AND status = 'published'`,
          [id],
        );
      });
      return { id: input.id };
    }),
});