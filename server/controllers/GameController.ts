import { TRPCError } from "@trpc/server";

import { Database } from "@server/lib/data/Database";
import { Request } from "@server/trpc";
import { clients, games, nicknames } from "@server/lib/io/WebSocketServer";
import { roomCodePayloadSchema } from "@server/schema/GameSchema";
import { Game } from "@server/lib/game/Game";
import { prompt_responses, prompts } from "@server/content";

export const GameController = {
  create: async ({ ctx: { user_id } }: Request) => {
    const ws = getWebSocketOrThrow(user_id);
    const room_code = makeCode(4);

    const game_document = await Database.instance().game.create({
      data: { room_code, created_by: user_id },
    });

    const game = Game.create(room_code, { prompts, prompt_responses });
    games.set(room_code, game);

    game.addPlayer(user_id, ws);

    return game_document;
  },

  join: async ({
    input,
    ctx: { user_id },
  }: Request<typeof roomCodePayloadSchema>) => {
    const ws = getWebSocketOrThrow(user_id);
    const room_code = input.room_code.toUpperCase();

    const game_document = await Database.instance().game.findFirstOrThrow({
      where: { room_code },
    });

    const game_instance = getGameInstanceOrThrow(room_code);

    game_instance.addPlayer(user_id, ws);

    return game_document;
  },

  start: async ({
    ctx: { user_id },
    input,
  }: Request<typeof roomCodePayloadSchema>) => {
    const { room_code } = input;

    const game_instance = getGameInstanceOrThrow(room_code);

    const game = await Database.instance().game.findUniqueOrThrow({
      where: { room_code },
    });

    if (game.created_by !== user_id) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Only the creator of the game can start it",
      });
    }

    const missing_nickname = game_instance.players.find(
      ({ user_id }) => !nicknames.has(user_id)
    );

    if (missing_nickname) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Not all players have chosen a nickname",
      });
    }

    game_instance.start();

    await Database.instance().game.update({
      where: { id: game.id },
      data: {
        players: game_instance.players.map(({ user_id }) => [
          user_id,
          nicknames.get(user_id) ?? "",
        ]),
        state: "ACTIVE",
      },
    });
  },
};

const getWebSocketOrThrow = (user_id: string) => {
  const ws = clients.get(user_id);

  if (!ws) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Cannot find websocket connection for player",
    });
  }

  return ws;
};

const getGameInstanceOrThrow = (room_code: string) => {
  const game = games.get(room_code);

  if (!game) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Cannot find game instance",
    });
  }

  return game;
};

const makeCode = (length: number, chars = "ABCDEFGHIJKLMNOPRSTUVWXYZ") =>
  [...Array(length)]
    .map(() => chars.charAt(Math.floor(Math.random() * chars.length)))
    .join("");
