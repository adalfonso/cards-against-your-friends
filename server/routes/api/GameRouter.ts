import { GameController } from "@controllers/GameController";
import { roomCodePayloadSchema } from "@server/schema/GameSchema";
import { publicProcedure, authenticatedProcedure, router } from "@server/trpc";

export const GameRouter = (routes: typeof router) =>
  routes({
    create: publicProcedure.mutation(GameController.create),
    join: publicProcedure
      .input(roomCodePayloadSchema)
      .mutation(GameController.join),

    start: authenticatedProcedure
      .input(roomCodePayloadSchema)
      .mutation(GameController.start),
  });
