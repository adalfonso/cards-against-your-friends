import { Database } from "@server/lib/data/Database";
import { addOrUpdateUserSchema } from "@server/schema/GameSchema";
import { Request } from "@server/trpc";
import { TRPCError } from "@trpc/server";
import { randomUUID } from "crypto";

export const GameController = {
  create: async ({ ctx: { res } }: Request) => {
    try {
      const game = await Database.instance().game.create({
        data: { room_code: makeCode(4) },
      });

      res.cookie("user_id", randomUUID(), { maxAge: 900000, httpOnly: true });

      return game;
    } catch (e) {
      console.error(e);

      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  },

  addOrUpdateUser: async ({
    ctx: { user_id },
    input,
  }: Request<typeof addOrUpdateUserSchema>) => {
    const { nickname, room_code } = input;

    const game = await Database.instance().game.findUniqueOrThrow({
      where: { room_code },
    });

    await Database.instance().game.update({
      where: { id: game.id },
      data: {
        players: {
          ...((typeof game.players === "object" && game.players) ?? {}),
          [user_id ?? ""]: nickname,
        },
      },
    });

    try {
    } catch (e) {
      console.error(e);

      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  },
};

const makeCode = (length: number, chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ") =>
  [...Array(length)]
    .map(() => chars.charAt(Math.floor(Math.random() * chars.length)))
    .join("");
