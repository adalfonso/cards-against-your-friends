import { WebSocket, WebSocketServer } from "ws";
import { WebSocketClientEvent } from "@common/types";
import { identify, setNickname } from "./incoming";

// In-memory stores; convert to cache
export const clients: Record<string, { ws: WebSocket }> = {};
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
        case WebSocketClientEvent.Identify:
          return identify(ws, data.data);

        case WebSocketClientEvent.SetNickname:
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
