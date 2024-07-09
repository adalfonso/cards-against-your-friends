import {
  BasePlayer,
  WebSocketClientEvent,
  WebSocketServerEvent,
} from "@common/types";
import { app_state, GameState } from "../../AppState";
import { CARD_HAND_SIZE, PlayerState } from "@common/constants";

export const connectWebSocket = (onSuccess: (ws: WebSocket) => void) => {
  const host = window.location.host;
  const protocol = window.location.protocol === "http:" ? "ws" : "wss";

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

      case WebSocketServerEvent.StateUpdate:
        return stateUpdate(payload.data);

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

      case WebSocketServerEvent.UpdatePlayers:
        return updatePlayers(payload.data);

      case WebSocketServerEvent.ReconnectPlayer:
        return reconnectPlayer(payload.data);

      default:
        console.error(
          "Received unknown websocket event type:",
          payload.event_type
        );
    }
  });

  return ws;
};

const stateUpdate = (data: { game_state: GameState }) => {
  app_state.game_state.value = data.game_state;
};

const informIdentity = (data: { user_id: string; nickname: string }) => {
  app_state.user_id.value = data.user_id;
  app_state.nickname.value = data.nickname;
};

const initPrompter = (data: { prompt: string; hand: Array<string> }) => {
  app_state.is_prompter.value = true;
  app_state.prompt.value = data.prompt;
  app_state.hand.value = data.hand;
  app_state.responses_for_prompter.value = {};
  app_state.player_state.value = PlayerState.WAITING;
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
  app_state.player_state.value = PlayerState.DECIDING;
};

const deliverPromptResponses = (data: {
  responses_for_prompter: Record<string, Array<string>>;
}) => {
  app_state.responses_for_prompter.value = data.responses_for_prompter;
  app_state.player_state.value = PlayerState.DECIDING;
};

const waitForNextRound = () => {
  app_state.player_state.value = PlayerState.WAITING;
};

const awardPrompt = (data: { prompt: string; player: BasePlayer }) => {
  app_state.last_prompt_winner.value = data.player;

  if (data.player.user_id === app_state.user_id.value) {
    app_state.awarded_prompts.value = [
      ...app_state.awarded_prompts.value,
      data.prompt,
    ];
  }
};

const updatePlayers = (data: { players: Array<BasePlayer> }) => {
  app_state.players.value = data.players;
};

const reconnectPlayer = (data: {
  is_prompter: boolean;
  prompt: string;
  hand: Array<string>;
  responses_for_prompter: Record<string, Array<string>>;
  awarded_prompts: Array<string>;
  game_state: GameState;
  is_owner: boolean;
  players: Array<BasePlayer>;
}) => {
  app_state.is_prompter.value = data.is_prompter;
  app_state.hand.value = data.hand;
  app_state.prompt.value = data.prompt;
  app_state.responses_for_prompter.value = data.responses_for_prompter;
  app_state.awarded_prompts.value = data.awarded_prompts;
  app_state.game_state.value = data.game_state;
  app_state.is_owner.value === data.is_owner;
  app_state.players.value = data.players;

  // Implies prompter has to pick a resposne
  if (Object.values(data.responses_for_prompter).length) {
    app_state.player_state.value = PlayerState.DECIDING;
  }

  // If a player has all their cards and is not the prompter they have to pick still
  if (!data.is_prompter && data.hand.length === CARD_HAND_SIZE) {
    app_state.player_state.value = PlayerState.DECIDING;
  }
};
