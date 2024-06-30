import * as trpcExpress from "@trpc/server/adapters/express";
import { inferAsyncReturnType, initTRPC, TRPCError } from "@trpc/server";
import { z, ZodType } from "zod";

export const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => ({ req, res });

type Context = inferAsyncReturnType<typeof createContext>;

const t = initTRPC.context<Context>().create();

export const { router, middleware, procedure } = t;

// Initialize the tRPC router
export const api_router = t.router({
  // admin: admin(router),
});

export type ApiRouter = typeof api_router;

const empty = z.undefined();

export type Request<T extends ZodType = typeof empty> = {
  input: z.infer<T>;
  ctx: Context;
};
