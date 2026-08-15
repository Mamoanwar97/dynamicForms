import Fastify from "fastify";
import cors from "@fastify/cors";
import {
  fastifyTRPCPlugin,
  type FastifyTRPCPluginOptions,
} from "@trpc/server/adapters/fastify";
import { appRouter, type AppRouter } from "@repo/server";
import { closeDb, connectDb } from "./db.js";
import { createContext } from "./context.js";

const app = Fastify({
  logger: true,
  routerOptions: {
    maxParamLength: 5000,
  },
});

await app.register(cors, {
  origin: process.env.CORS_ORIGIN?.split(",").map((o) => o.trim()) ?? true,
});

app.get("/", async () => {
  return { hello: "world" };
});

app.get("/health", async () => {
  return { ok: true };
});

await app.register(fastifyTRPCPlugin, {
  prefix: "/trpc",
  trpcOptions: {
    router: appRouter,
    createContext,
    onError({ path, error }) {
      app.log.error({ path, error }, "tRPC error");
    },
  } satisfies FastifyTRPCPluginOptions<AppRouter>["trpcOptions"],
});

const start = async () => {
  try {
    await connectDb();
    app.log.info("Connected to MongoDB");

    const port = Number(process.env.PORT) || 3000;
    await app.listen({ port, host: "0.0.0.0" });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

const shutdown = async () => {
  await app.close();
  await closeDb();
  process.exit(0);
};

process.on("SIGINT", () => {
  void shutdown();
});
process.on("SIGTERM", () => {
  void shutdown();
});

start();
