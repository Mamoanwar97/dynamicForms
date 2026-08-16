import { router } from "./trpc.ts";
import { authRouter } from "./routers/auth.router.ts";
import { formRouter } from "./routers/form.router.ts";
import { publishedFormRouter } from "./routers/published-form.router.ts";

export const appRouter = router({
  auth: authRouter,
  form: formRouter,
  publishedForm: publishedFormRouter,
});

export type AppRouter = typeof appRouter;