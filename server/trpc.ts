import * as trpcExpress from "@trpc/server/adapters/express";
import { inferAsyncReturnType, initTRPC, TRPCError } from "@trpc/server";
import { z, ZodType } from "zod";
import { GameRouter } from "./routes/api/GameRouter";
import { isValidUUIDv4 } from "./lib/data/UserId";

export const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => ({ req, res });

type Context = inferAsyncReturnType<typeof createContext> & {
  user_id?: string;
};

const t = initTRPC.context<Context>().create();

export const { router, middleware, procedure: publicProcedure } = t;

export const authenticatedProcedure = publicProcedure.use(async (opts) => {
  const {
    ctx: { req },
  } = opts;
  if (!isValidUUIDv4(req.cookies.user_id)) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return opts.next({
    ctx: {
      user_id: req.cookies.user_id,
    },
  });
});

// Initialize the tRPC router
export const api_router = t.router({
  game: GameRouter(router),
});

export type ApiRouter = typeof api_router;

const empty = z.undefined();

export type Request<T extends ZodType = typeof empty> = {
  input: z.infer<T>;
  ctx: Context;
};
