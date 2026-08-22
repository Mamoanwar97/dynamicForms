import { TRPCError } from "@trpc/server";
import { hashPassword, signToken, verifyPassword } from "../auth.ts";
import { protectedProcedure, publicProcedure, router } from "../trpc.ts";
import {
  authResultSchema,
  loginSchema,
  registerSchema,
  userSchema,
  type User,
} from "../schemas.ts";

const UNIQUE_VIOLATION = "23505";

function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    (err as { code?: string }).code === UNIQUE_VIOLATION
  );
}

export const authRouter = router({
  register: publicProcedure
    .input(registerSchema)
    .output(authResultSchema)
    .mutation(async ({ ctx, input }) => {
      const passwordHash = await hashPassword(input.password);
      let id: string;
      try {
        const row = await ctx.db.queryOne<{ id: string }>(
          `INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id`,
          [input.username, passwordHash],
        );
        id = row!.id;
      } catch (err) {
        if (isUniqueViolation(err)) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Username is already taken",
          });
        }
        throw err;
      }
      const user: User = { id, username: input.username };
      return { user, token: await signToken(user, ctx.jwtSecret) };
    }),

  login: publicProcedure
    .input(loginSchema)
    .output(authResultSchema)
    .mutation(async ({ ctx, input }) => {
      const row = await ctx.db.queryOne<{
        id: string;
        username: string;
        password: string;
      }>(
        `SELECT id, username, password FROM users WHERE username = $1`,
        [input.username],
      );
      if (
        !row ||
        !(await verifyPassword(input.password, row.password))
      ) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid credentials",
        });
      }
      const user: User = { id: row.id, username: row.username };
      return { user, token: await signToken(user, ctx.jwtSecret) };
    }),

  me: protectedProcedure.output(userSchema).query(({ ctx }) => ctx.user),
});