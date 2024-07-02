import { games } from "@server/WebSocketSever";
import { Database } from "@server/lib/data/Database";
import {
  addOrUpdateUserSchema,
  joinGameSchema,
} from "@server/schema/GameSchema";
import { Request } from "@server/trpc";
import { TRPCError } from "@trpc/server";
import { randomUUID } from "crypto";
import { Response } from "express";

export const GameController = {
  create: async ({ ctx: { res } }: Request) => {
    try {
      const room_code = makeCode(4);

      const game = await Database.instance().game.create({
        data: { room_code: room_code },
      });

      initUserId(room_code, res);

      return game;
    } catch (e) {
      console.error(e);

      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  },

  join: async ({ input, ctx: { res } }: Request<typeof joinGameSchema>) => {
    try {
      const room_code = input.room_code.toUpperCase();

      const game = await Database.instance().game.findFirstOrThrow({
        where: { room_code },
      });

      initUserId(room_code, res);

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

const initUserId = (room_code: string, res: Response) => {
  const user_id = randomUUID();

  res.cookie("user_id", randomUUID(), { maxAge: 900000 });

  if (!games[room_code]) {
    games[room_code] = { players: [] };
  }

  games[room_code].players.push(user_id);

  return user_id;
};
