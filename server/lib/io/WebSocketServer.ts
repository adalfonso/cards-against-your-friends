import { WebSocket, WebSocketServer } from "ws";
import { WebSocketClientEvent } from "@common/types";
import { identify, receivePromptResponses, setNickname } from "./incoming";
import { Game } from "../game/Game";

// In-memory stores; convert to cache
export const clients: Record<string, { ws: WebSocket }> = {};
export const nicknames: Record<string, string> = {};
export const games: Record<string, Game> = {};

export const createWebSocketServer = () => {
  const wss = new WebSocketServer({ port: 4202 });

  wss.on("connection", async (ws) => {
    ws.on("error", console.error);

    ws.on("message", (event) => {
      console.info("Inbound websocket message: %s", event);
      const payload = JSON.parse(event.toString()) ?? {};

      switch (payload.event_type) {
        case WebSocketClientEvent.Identify:
          return identify(ws, payload.data);

        case WebSocketClientEvent.SetNickname:
          return setNickname(ws, payload.data.nickname);

        case WebSocketClientEvent.SendPromptResponses:
          return receivePromptResponses(ws, payload.data);

        default:
          console.error(
            "Received unknown websocket event type:",
            payload.event_type
          );
      }
    });
  });
};
