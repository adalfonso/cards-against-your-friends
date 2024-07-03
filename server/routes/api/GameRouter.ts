import { GameController } from "@controllers/GameController";
import { joinGameSchema } from "@server/schema/GameSchema";
import { publicProcedure, router } from "@server/trpc";

export const GameRouter = (routes: typeof router) =>
  routes({
    create: publicProcedure.mutation(GameController.create),
    join: publicProcedure.input(joinGameSchema).mutation(GameController.join),
  });
