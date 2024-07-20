import { TRPCError } from "@trpc/server";

import { Request } from "@server/trpc";
import { clients, games, nicknames } from "@server/lib/io/WebSocketServer";
import { roomCodePayloadSchema } from "@server/schema/GameSchema";
import { Game } from "@server/lib/game/Game";
import content from "@server/content/content.json";

const { prompts, prompt_responses } = content;

export const GameController = {
  create: async ({ ctx: { user_id } }: Request) => {
    const ws = getWebSocketOrThrow(user_id);
    const room_code = makeCode(4);
    const game = Game.create(room_code, user_id, { prompts, prompt_responses });

    games.set(room_code, game);
    game.addPlayer(user_id, nicknames.get(user_id) ?? "", ws);

    return game.data;
  },

  join: async ({
    input,
    ctx: { user_id },
  }: Request<typeof roomCodePayloadSchema>) => {
    const ws = getWebSocketOrThrow(user_id);
    const room_code = input.room_code.toUpperCase();
    const game = getGameInstanceOrThrow(room_code);

    game.addPlayer(user_id, nicknames.get(user_id) ?? "", ws);

    return game.data;
  },

  start: async ({
    ctx: { user_id },
    input,
  }: Request<typeof roomCodePayloadSchema>) => {
    const { room_code } = input;

    const game = getGameInstanceOrThrow(room_code);

    if (game.data.owner_id !== user_id) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Only the creator of the game can start it",
      });
    }

    const missing_nickname = game.players.find(
      ({ user_id }) => !nicknames.has(user_id)
    );

    if (missing_nickname) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Not all players have chosen a nickname",
      });
    }

    game.start();
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
