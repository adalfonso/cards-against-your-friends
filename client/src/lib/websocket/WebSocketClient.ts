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
        return (app_state.player_state.value = GameState.ACTIVE);

      case WebSocketServerEvent.InitPrompter:
        return initPrompter(payload.data);

      case WebSocketServerEvent.InitPromptee:
        return initPromptee(payload.data);

      case WebSocketServerEvent.DeliverPromptResponses:
        return deliverPromptResponses(payload.data);

      case WebSocketServerEvent.WaitForNextRound:
        return waitForNextRound();
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

const initPrompter = ({ content }: { content: string }) => {
  app_state.is_prompter.value = true;
  app_state.prompt.value = content;
};

const initPromptee = ({
  content,
  prompt_response_count,
}: {
  content: string[];
  prompt_response_count: number;
}) => {
  app_state.is_prompter.value = false;
  app_state.prompt.value = "";
  app_state.responses_for_promptee.value = content;
  app_state.prompt_response_count.value = prompt_response_count;
};

const deliverPromptResponses = ({
  content,
}: {
  content: Record<string, Array<string>>;
}) => {
  app_state.responses_for_prompter.value = content;
  app_state.player_state.value = "PROMPTER_DECIDING";
};

const waitForNextRound = () => {
  app_state.player_state.value = "PROMPTEE_WAITING";
  app_state.responses_for_promptee.value = [];
};
