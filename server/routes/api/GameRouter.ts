import { GameController } from "@controllers/GameController";
import { addOrUpdateUserSchema } from "@server/schema/GameSchema";
import { publicProcedure, authenticatedProcedure, router } from "@server/trpc";

export const GameRouter = (routes: typeof router) =>
  routes({
    create: publicProcedure.mutation(GameController.create),

    addOrUpdateUser: authenticatedProcedure
      .input(addOrUpdateUserSchema)
      .mutation(GameController.addOrUpdateUser),
  });
