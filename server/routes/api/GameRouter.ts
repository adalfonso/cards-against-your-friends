import { GameController } from "@controllers/GameController";
import { roomCodePayloadSchema } from "@server/schema/GameSchema";
import { publicProcedure, authenticatedProcedure, router } from "@server/trpc";
import { randomUUID } from "crypto";

export const GameRouter = (routes: typeof router) =>
  routes({
    startSession: publicProcedure.mutation(({ ctx: { req } }) => {
      req.session.user_id = req.session.user_id ?? randomUUID();
    }),

    create: authenticatedProcedure.mutation(GameController.create),
    join: authenticatedProcedure
      .input(roomCodePayloadSchema)
      .mutation(GameController.join),

    start: authenticatedProcedure
      .input(roomCodePayloadSchema)
      .mutation(GameController.start),
  });
