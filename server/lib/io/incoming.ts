import { WebSocket } from "ws";

import { WebSocketServerEvent } from "@common/types";
import { clients, nicknames } from "./WebSocketSever";

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
