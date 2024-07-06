import { WebSocket, WebSocketServer } from "ws";
import { WebSocketClientEvent } from "@common/types";
import * as incoming from "./incomingWebSocketEvents";
import { Game } from "../game/Game";

// In-memory stores; convert to cache
export const clients: Record<string, { ws: WebSocket }> = {};
export const nicknames: Record<string, string> = {};
export const games: Record<string, Game> = {};

export const createWebSocketServer = () => {
  const wss = new WebSocketServer({ noServer: true });

  wss.on("connection", (ws) => {
    ws.on("error", console.error);

    ws.on("message", (event) => {
      console.info("Inbound websocket message: %s", event);
      const payload = JSON.parse(event.toString()) ?? {};

      switch (payload.event_type) {
        case WebSocketClientEvent.Identify:
          return incoming.identify(ws, payload.data);

        case WebSocketClientEvent.SetNickname:
          return incoming.setNickname(ws, payload.data.nickname);

        case WebSocketClientEvent.SendPromptResponses:
          return incoming.receivePromptResponses(ws, payload.data);

        case WebSocketClientEvent.AwardPrompt:
          return incoming.awardPrompt(ws, payload.data);

        default:
          console.error(
            "Received unknown websocket event type:",
            payload.event_type
          );
      }
    });
  });

  return wss;
};
