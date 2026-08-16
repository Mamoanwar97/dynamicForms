import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@repo/server";

import { API_URL } from "@/api/constants";
import { authHeaders } from "@/lib/auth";

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${API_URL}/trpc`,
      headers: authHeaders,
    }),
  ],
});