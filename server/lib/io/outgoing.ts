import { WebSocket } from "ws";

import { WebSocketServerEvent } from "@common/types";
import { clients, games } from "./WebSocketSever";

export const sendGameUpdate = (
  event_type: WebSocketServerEvent,
  room_code: string
) => {
  const players = games[room_code]?.players;
  const connections = [...players]
    .map((user_id) => clients[user_id]?.ws)
    .filter(Boolean);

  if (players.length !== connections.length) {
    console.error("Player count and websocket count mismatch");
  }

  connections.forEach((ws) => event_handlers[event_type](ws));
};

export const event_handlers: Record<
  WebSocketServerEvent,
  (ws: WebSocket) => void
> = {
  [WebSocketServerEvent.InformIdentity]: () => {},

  [WebSocketServerEvent.InitPrompter]: (ws: WebSocket) => {
    ws.send(
      JSON.stringify({
        event_type: WebSocketServerEvent.InitPrompter,
        data: {},
      })
    );
  },

  [WebSocketServerEvent.InitPromptee]: (ws: WebSocket) => {
    ws.send(
      JSON.stringify({
        event_type: WebSocketServerEvent.InitPromptee,
        data: {},
      })
    );
  },

  [WebSocketServerEvent.StartGame]: (ws: WebSocket) => {
    ws.send(
      JSON.stringify({
        event_type: WebSocketServerEvent.StartGame,
        data: {},
      })
    );
  },
};
