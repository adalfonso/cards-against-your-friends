import { TRPCError } from "@trpc/server";
import { randomUUID } from "crypto";
import { Request as ExpressReq, Response as ExpressRes } from "express";

import { games } from "@server/WebSocketSever";
import { Database } from "@server/lib/data/Database";
import { joinGameSchema } from "@server/schema/GameSchema";
import { Request } from "@server/trpc";

export const GameController = {
  create: async ({ ctx: { req, res } }: Request) => {
    try {
      const room_code = makeCode(4);

      const game = await Database.instance().game.create({
        data: { room_code: room_code },
      });

      initUserId(room_code, req, res);

      return game;
    } catch (e) {
      console.error(e);

      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  },

  join: async ({
    input,
    ctx: { req, res },
  }: Request<typeof joinGameSchema>) => {
    try {
      const room_code = input.room_code.toUpperCase();

      const game = await Database.instance().game.findFirstOrThrow({
        where: { room_code },
      });

      initUserId(room_code, req, res);

      return game;
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

const initUserId = (room_code: string, req: ExpressReq, res: ExpressRes) => {
  const user_id = req.cookies.user_id ?? randomUUID();

  if (!req.cookies.user_id) {
    res.cookie("user_id", user_id, { maxAge: 900000, sameSite: "strict" });
  }

  if (!games[room_code]) {
    games[room_code] = { players: [] };
  }

  games[room_code].players.push(user_id);

  return user_id;
};
