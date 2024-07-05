import { WebSocket } from "ws";

import { WebSocketServerEvent } from "@common/types";
import { clients, games, nicknames } from "./WebSocketServer";

// Associates user_id with client's websocket
export const identify = (ws: WebSocket, user_id: unknown) => {
  if (!user_id || typeof user_id !== "string") {
    return console.error("Failed to identify websocket client");
  }

  clients[user_id] = { ws };

  ws.send(
    JSON.stringify({
      event_type: WebSocketServerEvent.InformIdentity,
      data: {
        user_id,
        nickname: nicknames[user_id] ?? "",
      },
    })
  );
};

// Updates nickname for a client
export const setNickname = (ws: WebSocket, nickname: unknown) => {
  if (!nickname || typeof nickname !== "string") {
    return console.error("Failed to detect nickname during set");
  }

  const user_id = getUserIdFromWebsocket(ws);

  if (!user_id) {
    return console.error("Could not find user_id to set nickname");
  }

  nicknames[user_id] = nickname;
};

// TODO: better performance than this?
export const getUserIdFromWebsocket = (ws: WebSocket) => {
  const client_entry = Object.entries(clients).find(
    ([, connection]) => connection.ws === ws
  );

  const [user_id] = client_entry ?? [];

  return user_id ?? null;
};

// Updates the responses for a promptee
export const receivePromptResponses = (
  ws: WebSocket,
  {
    room_code,
    prompt_responses,
  }: { room_code: string; prompt_responses: Array<string> }
) => {
  if (!Array.isArray(prompt_responses)) {
    return console.error("Failed to prompt responses from user");
  }

  const user_id = getUserIdFromWebsocket(ws);

  if (!user_id) {
    return console.error("Could not find user_id to set nickname");
  }

  const game = games[room_code];

  if (!game) {
    return console.error("Could not find game for: " + room_code);
  }

  game.receivePromptResponses(prompt_responses, user_id);
};

// Award a prompt card to a player
export const awardPrompt = (
  ws: WebSocket,
  {
    room_code,
    player,
    prompt,
  }: { room_code: string; player: string; prompt: string }
) => {
  const user_id = getUserIdFromWebsocket(ws);

  if (!user_id) {
    return console.error("Could not find user_id to set nickname");
  }

  const game = games[room_code];

  if (!game) {
    return console.error("Could not find game for: " + room_code);
  }

  game.awardPrompt(player, prompt);
  game.nextTurn();
};
