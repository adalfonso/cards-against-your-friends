import { TRPCError } from "@trpc/server";
import { randomUUID } from "crypto";
import { Request as ExpressReq, Response as ExpressRes } from "express";
import { GameState } from "@prisma/client";

import { games, nicknames } from "@server/WebSocketSever";
import { Database } from "@server/lib/data/Database";
import { roomCodePayloadSchema } from "@server/schema/GameSchema";
import { Request } from "@server/trpc";

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
    const players = games[room_code]?.players;

    if (players.size <= 1) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Cannot start game with a single player",
      });
    }

    for (const player_id of players.values()) {
      if (!nicknames[player_id]) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Not all players have chosen a nickname yet",
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
        state: GameState.ACTIVE,
      },
    });
  },
};

const makeCode = (length: number, chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ") =>
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
    games[room_code] = { players: new Set() };
  }

  games[room_code].players.add(user_id);

  return user_id;
};
