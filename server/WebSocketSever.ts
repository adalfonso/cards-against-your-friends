import { WebSocket, WebSocketServer } from "ws";
import { WebSocketEventType } from "@common/types";

// In-memory stores; convert to cache
const clients: Record<string, { ws: WebSocket }> = {};
const nicknames: Record<string, string> = {};
export const games: Record<string, { players: Array<string> }> = {};

export const createWebSocketServer = () => {
  const wss = new WebSocketServer({ port: 4202 });

  wss.on("connection", async (ws) => {
    ws.on("error", console.error);

    ws.on("message", (payload) => {
      console.info("Inbound websocket message: %s", payload);
      const data = JSON.parse(payload.toString()) ?? {};

      switch (data.event_type) {
        case WebSocketEventType.Identify:
          return identify(ws, data.data);

        case WebSocketEventType.SetNickname:
          return setNickname(ws, data.data);
      }
    });
  });
};

const identify = (ws: WebSocket, user_id: unknown) => {
  if (!user_id || typeof user_id !== "string") {
    return console.error("Failed to identify websocket client");
  }

  clients[user_id] = { ws };
};

const setNickname = (ws: WebSocket, nickname: unknown) => {
  if (!nickname || typeof nickname !== "string") {
    return console.error("Failed to detect nickname during set");
  }

  const user_id = getUserIdFromWebsocket(ws);

  if (!user_id) {
    return console.error("Could not find user_id to set nickname");
  }

  console.log({ games });

  nicknames[user_id] = nickname;
};

const getUserIdFromWebsocket = (ws: WebSocket) => {
  const client_entry = Object.entries(clients).find(
    ([, connection]) => connection.ws === ws
  );

  const [user_id] = client_entry ?? [];

  return user_id ?? null;
};
