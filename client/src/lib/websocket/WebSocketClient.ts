import { GameState } from "@prisma/client";
import {
  WebSocketClientEvent,
  WebSocketServerEvent,
} from "../../../../common/types";
import { app_state } from "../../AppState";

export const connectWebSocket = () => {
  const user_id = document.cookie.replace(
    /(?:(?:^|.*;\s*)user_id\s*\=\s*([^;]*).*$)|^.*$/,
    "$1"
  );

  if (!user_id) {
    console.error(
      "Failed to establish websocket connection: user_id header unable to be sent"
    );

    return null;
  }

  const ws = new WebSocket("ws://localhost:4202");

  ws.onopen = (event) => {
    console.info("Connected to websocket", { event });

    ws.send(
      JSON.stringify({
        event_type: WebSocketClientEvent.Identify,
        data: user_id,
      })
    );
  };

  ws.addEventListener("message", (event) => {
    console.info("Message received over websocket", event.data);

    const payload = JSON.parse(event.data) ?? {};

    switch (payload.event_type) {
      case WebSocketServerEvent.InformIdentity:
        return informIdentity(payload.data);
      case WebSocketServerEvent.StartGame:
        return (app_state.game_state.value = GameState.ACTIVE);
      default:
        console.error(
          "Received unknown websocket event type:",
          payload.event_type
        );
    }
  });

  return ws;
};

const informIdentity = ({
  nickname,
}: {
  user_id: string;
  nickname: string;
}) => {
  // Set cached nickname if there is one
  app_state.nickname.value = nickname;
};
