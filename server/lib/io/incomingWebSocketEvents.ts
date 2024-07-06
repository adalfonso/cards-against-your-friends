import { WebSocket } from "ws";

import { clients, games, nicknames } from "./WebSocketServer";
import * as outgoing from "./outgoingWebSocketEvents";

// Associates user_id with client's websocket
export const identify = (ws: WebSocket, user_id: string) => {
  clients.set(user_id, ws);

  outgoing.informIdentity(ws, user_id);
};

// Updates nickname for a client
export const setNickname = (user_id: string, nickname: string) => {
  if (!nickname || typeof nickname !== "string") {
    return console.error("Failed to detect nickname during set");
  }

  nicknames.set(user_id, nickname);
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
