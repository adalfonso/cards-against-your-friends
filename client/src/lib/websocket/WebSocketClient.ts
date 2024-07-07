import {
  WebSocketClientEvent,
  WebSocketServerEvent,
} from "../../../../common/types";
import { app_state } from "../../AppState";

export const connectWebSocket = (onSuccess: (ws: WebSocket) => void) => {
  const host = window.location.host;
  const protocol = /^localhost:/.test(host) ? "ws" : "wss";

  const ws = new WebSocket(`${protocol}://${host}/ws`);

  ws.onopen = (event) => {
    console.info("Connected to websocket", { event });
    onSuccess(ws);

    ws.send(
      JSON.stringify({
        event_type: WebSocketClientEvent.Identify,
        data: {},
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
        return (app_state.player_state.value = "ACTIVE");

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

      case WebSocketServerEvent.InformReconnection:
        return informReconnection(payload.data);

      default:
        console.error(
          "Received unknown websocket event type:",
          payload.event_type
        );
    }
  });

  return ws;
};

const informIdentity = (data: { nickname: string }) => {
  // Set cached nickname if there is one
  app_state.nickname.value = data.nickname;
};

const initPrompter = (data: { prompt: string; hand: Array<string> }) => {
  app_state.is_prompter.value = true;
  app_state.prompt.value = data.prompt;
  app_state.hand.value = data.hand;
  app_state.responses_for_prompter.value = {};
  app_state.player_state.value = "ACTIVE";
};

const initPromptee = (data: {
  hand: string[];
  prompt_response_count: number;
}) => {
  app_state.is_prompter.value = false;
  app_state.prompt.value = "";
  app_state.hand.value = data.hand;
  app_state.prompt_response_count.value = data.prompt_response_count;
  app_state.responses_for_prompter.value = {};
  app_state.player_state.value = "ACTIVE";
};

const deliverPromptResponses = (data: {
  responses_for_prompter: Record<string, Array<string>>;
}) => {
  app_state.responses_for_prompter.value = data.responses_for_prompter;
  app_state.player_state.value = "PROMPTER_DECIDING";
};

const waitForNextRound = () => {
  app_state.player_state.value = "PROMPTEE_WAITING";
};

const awardPrompt = (data: { prompt: string }) => {
  app_state.awarded_prompts.value = [
    ...app_state.awarded_prompts.value,
    data.prompt,
  ];
};

const endGame = () => {
  app_state.player_state.value = "ENDED";
};

const informReconnection = (data: {
  is_prompter: boolean;
  prompt: string;
  hand: Array<string>;
  responses_for_prompter: Record<string, Array<string>>;
  awarded_prompts: Array<string>;
  game_over: boolean;
}) => {
  app_state.is_prompter.value = data.is_prompter;
  app_state.hand.value = data.hand;
  app_state.prompt.value = data.prompt;
  app_state.responses_for_prompter.value = data.responses_for_prompter;
  app_state.awarded_prompts.value = data.awarded_prompts;

  if (data.game_over) {
    app_state.player_state.value = "ENDED";
  } else if (Object.values(data.responses_for_prompter).length) {
    app_state.player_state.value = "PROMPTER_DECIDING";
  } else if (data.hand.length < 7) {
    app_state.player_state.value = "PROMPTEE_WAITING";
  } else {
    app_state.player_state.value = "ACTIVE";
  }
};
