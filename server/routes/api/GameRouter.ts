import { GameController } from "@controllers/GameController";
import {
  addOrUpdateUserSchema,
  joinGameSchema,
} from "@server/schema/GameSchema";
import { publicProcedure, authenticatedProcedure, router } from "@server/trpc";

export const GameRouter = (routes: typeof router) =>
  routes({
    create: publicProcedure.mutation(GameController.create),
    join: publicProcedure.input(joinGameSchema).mutation(GameController.join),

    addOrUpdateUser: authenticatedProcedure
      .input(addOrUpdateUserSchema)
      .mutation(GameController.addOrUpdateUser),
  });
