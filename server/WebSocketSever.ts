import { WebSocket, WebSocketServer } from "ws";
import {
  WebSocketClientEventType,
  WebSocketServerEventType,
} from "@common/types";

// In-memory stores; convert to cache
const clients: Record<string, { ws: WebSocket }> = {};
export const nicknames: Record<string, string> = {};
export const games: Record<string, { players: Set<string> }> = {};

export const createWebSocketServer = () => {
  const wss = new WebSocketServer({ port: 4202 });

  wss.on("connection", async (ws) => {
    ws.on("error", console.error);

    ws.on("message", (payload) => {
      console.info("Inbound websocket message: %s", payload);
      const data = JSON.parse(payload.toString()) ?? {};

      switch (data.event_type) {
        case WebSocketClientEventType.Identify:
          return identify(ws, data.data);

        case WebSocketClientEventType.SetNickname:
          return setNickname(ws, data.data);

        default:
          console.error(
            "Received unknown websocket event type:",
            data.event_type
          );
      }
    });
  });
};

const identify = (ws: WebSocket, user_id: unknown) => {
  if (!user_id || typeof user_id !== "string") {
    return console.error("Failed to identify websocket client");
  }

  clients[user_id] = { ws };

  ws.send(
    JSON.stringify({
      event_type: WebSocketServerEventType.InformIdentity,
      data: {
        user_id,
        nickname: nicknames[user_id] ?? "",
      },
    })
  );
};

const setNickname = (ws: WebSocket, nickname: unknown) => {
  if (!nickname || typeof nickname !== "string") {
    return console.error("Failed to detect nickname during set");
  }

  const user_id = getUserIdFromWebsocket(ws);

  if (!user_id) {
    return console.error("Could not find user_id to set nickname");
  }

  nicknames[user_id] = nickname;
};

const getUserIdFromWebsocket = (ws: WebSocket) => {
  const client_entry = Object.entries(clients).find(
    ([, connection]) => connection.ws === ws
  );

  const [user_id] = client_entry ?? [];

  return user_id ?? null;
};
