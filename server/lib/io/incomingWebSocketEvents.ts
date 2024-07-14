import { WebSocket } from "ws";

import { clients, games, nicknames } from "./WebSocketServer";
import * as outgoing from "./outgoingWebSocketEvents";

// Associates user_id with client's websocket
export const identify = (ws: WebSocket, data: { user_id: string }) => {
  clients.set(data.user_id, ws);

  outgoing.informIdentity(ws, data.user_id);
};

export const connectAsHost = (
  ws: WebSocket,
  data: { user_id: string; room_code: string }
) => {
  const game = games.get(data.room_code);

  if (!game) {
    return console.error("Could not find game when connecting host");
  }

  game.addHost(data.user_id, ws);
};

// Updates nickname for a client
export const setNickname = (
  ws: WebSocket,
  data: { user_id: string; nickname: string; room_code: string }
) => {
  if (!data.nickname || typeof data.nickname !== "string") {
    return console.error("Failed to detect nickname during set");
  }

  nicknames.set(data.user_id, data.nickname);

  const game = games.get(data.room_code);

  if (!game) {
    throw new Error("Could not find game when updating player's nickname");
  }

  game.addPlayer(data.user_id, nicknames.get(data.user_id) ?? "", ws);
};

// Updates the responses for a promptee
export const receivePromptResponses = (
  user_id: string,
  {
    room_code,
    prompt_responses,
  }: { room_code: string; prompt_responses: Array<string> }
) => {
  if (!Array.isArray(prompt_responses)) {
    return console.error("Failed to prompt responses from user");
  }

  const game = games.get(room_code);

  if (!game) {
    return console.error("Could not find game for: " + room_code);
  }

  game.receivePromptResponses(prompt_responses, user_id);
};

// Award a prompt card to a player
export const awardPrompt = ({
  room_code,
  player,
  prompt,
}: {
  room_code: string;
  player: string;
  prompt: string;
}) => {
  const game = games.get(room_code);

  if (!game) {
    return console.error("Could not find game for: " + room_code);
  }

  game.awardPrompt(player, prompt);
  game.nextTurn();
};
