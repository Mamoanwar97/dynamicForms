import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../trpc.ts";
import { formDataSchema, formIdSchema } from "../schemas.ts";
import { parseUuid, toForm, type FormRow } from "./util.ts";

const FORM_SELECT = `
  SELECT f.id, f.title, f.public_slug, f.created_at, f.updated_at,
         COALESCE(dv.schema, pv.schema)::text AS schema
  FROM forms f
  LEFT JOIN form_versions dv ON dv.id = f.draft_version_id
  LEFT JOIN form_versions pv ON pv.id = f.published_version_id
`;

export const formRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db.query<FormRow>(
      `${FORM_SELECT} WHERE f.owner_id = $1 ORDER BY f.created_at DESC`,
      [ctx.user.id],
    );
    return rows.map(toForm);
  }),

  byId: protectedProcedure.input(formIdSchema).query(async ({ ctx, input }) => {
    const id = parseUuid(input.id);
    const row = await ctx.db.queryOne<FormRow>(
      `${FORM_SELECT} WHERE f.id = $1 AND f.owner_id = $2`,
      [id, ctx.user.id],
    );
    if (!row) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
    }
    return toForm(row);
  }),

  create: protectedProcedure
    .input(formDataSchema)
    .mutation(async ({ ctx, input }) => {
      const now = new Date();
      const id = await ctx.db.withTransaction(async (tx) => {
        const form = await tx.queryOne<{ id: string }>(
          `INSERT INTO forms (owner_id, title, created_at, updated_at)
           VALUES ($1, $2, $3, $3)
           RETURNING id`,
          [ctx.user.id, input.title, now],
        );
        const version = await tx.queryOne<{ id: string }>(
          `INSERT INTO form_versions (form_id, version_number, status, schema, created_at)
           VALUES ($1, 1, 'draft', $2::jsonb, $3)
           RETURNING id`,
          [form!.id, JSON.stringify(input), now],
        );
        await tx.query(
          `UPDATE forms SET draft_version_id = $1 WHERE id = $2`,
          [version!.id, form!.id],
        );
        return form!.id;
      });
      return {
        id,
        title: input.title,
        inputs: input.inputs,
        publishedSlug: undefined,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };
    }),

  update: protectedProcedure
    .input(z.object({ id: formIdSchema.shape.id, data: formDataSchema }))
    .mutation(async ({ ctx, input }) => {
      const id = parseUuid(input.id);
      const now = new Date();
      await ctx.db.withTransaction(async (tx) => {
        const form = await tx.queryOne<{
          id: string;
          draft_version_id: string | null;
        }>(
          `SELECT id, draft_version_id FROM forms WHERE id = $1 AND owner_id = $2`,
          [id, ctx.user.id],
        );
        if (!form) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Form not found",
          });
        }

        if (form.draft_version_id) {
          await tx.query(
            `UPDATE form_versions SET schema = $1::jsonb WHERE id = $2`,
            [JSON.stringify(input.data), form.draft_version_id],
          );
        } else {
          const version = await tx.queryOne<{ id: string }>(
            `INSERT INTO form_versions (form_id, version_number, status, schema, created_at)
             SELECT $1, COALESCE(MAX(version_number), 0) + 1, 'draft', $2::jsonb, $3
             FROM form_versions
             WHERE form_id = $1
             RETURNING id`,
            [id, JSON.stringify(input.data), now],
          );
          await tx.query(
            `UPDATE forms SET draft_version_id = $1 WHERE id = $2`,
            [version!.id, id],
          );
        }

        await tx.query(
          `UPDATE forms SET title = $1, updated_at = $2 WHERE id = $3`,
          [input.data.title, now, id],
        );
      });

      const row = await ctx.db.queryOne<FormRow>(
        `${FORM_SELECT} WHERE f.id = $1 AND f.owner_id = $2`,
        [id, ctx.user.id],
      );
      if (!row) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
      }
      return toForm(row);
    }),

  delete: protectedProcedure
    .input(formIdSchema)
    .mutation(async ({ ctx, input }) => {
      const id = parseUuid(input.id);
      const rows = await ctx.db.query<{ id: string }>(
        `DELETE FROM forms WHERE id = $1 AND owner_id = $2 RETURNING id`,
        [id, ctx.user.id],
      );
      if (!rows[0]) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
      }
      return { id: input.id };
    }),
});