import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@repo/server";

import { API_URL } from "@/api/constants";

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${API_URL}/trpc`,
    }),
  ],
});
