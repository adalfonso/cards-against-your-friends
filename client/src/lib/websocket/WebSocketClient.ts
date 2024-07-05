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

      case WebSocketServerEvent.AwardPrompt:
        return awardPrompt(payload.data);

      case WebSocketServerEvent.EndGame:
        return endGame(payload.data);

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
  user_id,
  nickname,
}: {
  user_id: string;
  nickname: string;
}) => {
  // Set cached nickname if there is one
  app_state.nickname.value = nickname;
  app_state.user_id.value = user_id;
};

const initPrompter = ({
  content,
}: {
  content: {
    prompt: string;
    prompt_responses: Array<string>;
  };
}) => {
  app_state.is_prompter.value = true;
  app_state.prompt.value = content.prompt;
  app_state.responses_for_promptee.value = [
    ...content.prompt_responses,
    ...app_state.responses_for_promptee.value,
  ];
  app_state.responses_for_prompter.value = {};
  app_state.player_state.value = "ACTIVE";
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
  app_state.responses_for_promptee.value = [
    ...content,
    ...app_state.responses_for_promptee.value,
  ];
  app_state.prompt_response_count.value = prompt_response_count;
  app_state.responses_for_prompter.value = {};
  app_state.player_state.value = "ACTIVE";
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
};

const awardPrompt = ({ prompt }: { prompt: string }) => {
  app_state.awarded_prompts.value = [
    ...app_state.awarded_prompts.value,
    prompt,
  ];
};

const endGame = ({ winner }: { winner: string }) => {
  app_state.winner.value = winner;
  app_state.player_state.value = "ENDED";
};
