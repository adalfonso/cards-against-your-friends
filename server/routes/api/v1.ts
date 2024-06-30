import * as trpcExpress from "@trpc/server/adapters/express";
import express from "express";
import { createContext, api_router } from "@server/trpc";

const router = express.Router();

router.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: api_router,
    createContext,
  })
);

export default router;
