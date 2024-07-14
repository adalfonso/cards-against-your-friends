import { WebSocket, WebSocketServer } from "ws";
import { Request } from "express";

import { WebSocketClientEvent } from "@common/types";
import * as incoming from "./incomingWebSocketEvents";
import { Game } from "../game/Game";

// In-memory stores; convert to cache maybe
export const clients = new Map<string, WebSocket>();
export const nicknames = new Map<string, string>();
export const games = new Map<string, Game>();

export const createWebSocketServer = () => {
  const wss = new WebSocketServer({ noServer: true, path: "/ws" });

  wss.on("connection", (ws, request: Request) => {
    const user_id = request.session.user_id;

    const existing_connection = clients.get(user_id);

    if (existing_connection) {
      existing_connection.terminate();
    }

    clients.set(user_id, ws);

    ws.on("error", console.error);

    ws.on("message", (event) => {
      console.info("Inbound websocket message: %s", event);
      const payload = JSON.parse(event.toString()) ?? {};

      switch (payload.event_type) {
        case WebSocketClientEvent.Identify:
          return incoming.identify(ws, { user_id });

        case WebSocketClientEvent.ConnectAsHost:
          return incoming.connectAsHost(ws, { user_id, ...payload.data });

        case WebSocketClientEvent.SetNickname:
          return incoming.setNickname(ws, { user_id, ...payload.data });

        case WebSocketClientEvent.SendPromptResponses:
          return incoming.receivePromptResponses(user_id, payload.data);

        case WebSocketClientEvent.AwardPrompt:
          return incoming.awardPrompt(payload.data);

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
