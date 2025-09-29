import type { RouterClient } from "@orpc/server";

import { todoRouter } from "@/routers/todo";
import { protectedProcedure, publicProcedure } from "@/lib/orpc";

export const appRouter = {
  healthCheck: publicProcedure.handler(() => {
    return "OK";
  }),
  privateData: protectedProcedure.handler(({ context }) => {
    return {
      message: "This is private",
      user: context.session?.user,
    };
  }),
  todo: todoRouter,
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
