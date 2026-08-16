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
import { USERS_COLLECTION } from "./util.ts";

export const authRouter = router({
  register: publicProcedure
    .input(registerSchema)
    .output(authResultSchema)
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db
        .collection(USERS_COLLECTION)
        .findOne({ username: input.username });
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Username is already taken",
        });
      }
      const passwordHash = await hashPassword(input.password);
      const result = await ctx.db.collection(USERS_COLLECTION).insertOne({
        username: input.username,
        passwordHash,
        createdAt: new Date(),
      });
      const user: User = {
        id: result.insertedId.toHexString(),
        username: input.username,
      };
      return { user, token: await signToken(user, ctx.jwtSecret) };
    }),

  login: publicProcedure
    .input(loginSchema)
    .output(authResultSchema)
    .mutation(async ({ ctx, input }) => {
      const doc = await ctx.db
        .collection(USERS_COLLECTION)
        .findOne({ username: input.username });
      if (
        !doc ||
        typeof doc.passwordHash !== "string" ||
        !(await verifyPassword(input.password, doc.passwordHash))
      ) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid credentials",
        });
      }
      const user: User = {
        id: doc._id.toHexString(),
        username: doc.username,
      };
      return { user, token: await signToken(user, ctx.jwtSecret) };
    }),

  me: protectedProcedure.output(userSchema).query(({ ctx }) => ctx.user),
});