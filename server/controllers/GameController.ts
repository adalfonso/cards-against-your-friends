import { TRPCError } from "@trpc/server";
import { randomUUID } from "crypto";
import { Request as ExpressReq, Response as ExpressRes } from "express";

import { Database } from "@server/lib/data/Database";
import { Request } from "@server/trpc";
import { clients, games, nicknames } from "@server/lib/io/WebSocketServer";
import { roomCodePayloadSchema } from "@server/schema/GameSchema";
import { Game } from "@server/lib/game/Game";

export const GameController = {
  create: async ({ ctx: { req, res } }: Request) => {
    const room_code = makeCode(4);
    const user_id = initUserId(room_code, req, res);

    const game = await Database.instance().game.create({
      data: { room_code, created_by: user_id },
    });

    return game;
  },

  join: async ({
    input,
    ctx: { req, res },
  }: Request<typeof roomCodePayloadSchema>) => {
    const room_code = input.room_code.toUpperCase();

    const game = await Database.instance().game.findFirstOrThrow({
      where: { room_code },
    });

    initUserId(room_code, req, res);

    return game;
  },

  start: async ({
    ctx: { user_id },
    input,
  }: Request<typeof roomCodePayloadSchema>) => {
    const { room_code } = input;

    const game_instance = games[room_code];
    const { players } = game_instance;

    if (players.length <= 1) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Cannot start game with a single player",
      });
    }

    for (const player_id of players) {
      if (!nicknames[player_id]) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Not all players have chosen a nickname yet",
        });
      }

      if (!clients[player_id]) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Some players joined but are no longer connected. Please restart game",
        });
      }
    }

    const game = await Database.instance().game.findUniqueOrThrow({
      where: { room_code },
    });

    if (game.created_by !== user_id) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Only the creator of the game can start it",
      });
    }

    await Database.instance().game.update({
      where: { id: game.id },
      data: {
        players: Object.fromEntries(
          [...players].map((user_id) => [user_id, nicknames[user_id]])
        ),
        state: "ACTIVE",
      },
    });

    game_instance.start();
  },
};

const makeCode = (length: number, chars = "ABCDEFGHIJKLMNOPRSTUVWXYZ") =>
  [...Array(length)]
    .map(() => chars.charAt(Math.floor(Math.random() * chars.length)))
    .join("");

const initUserId = (
  room_code: string,
  req: ExpressReq,
  res: ExpressRes
): string => {
  const user_id = req.cookies.user_id ?? randomUUID();

  if (!req.cookies.user_id) {
    res.cookie("user_id", user_id, { maxAge: 900000, sameSite: "strict" });
  }

  if (!games[room_code]) {
    games[room_code] = Game.create(room_code);
  }

  games[room_code].addPlayer(user_id);

  return user_id;
};
