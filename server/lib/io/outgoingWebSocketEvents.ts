import { GameState } from "@prisma/client";
import { WebSocket } from "ws";

import { BasePlayer, WebSocketServerEvent } from "@common/types";
import { nicknames } from "./WebSocketServer";

export const initPrompter = (
  ws: WebSocket,
  data: { prompt: string; hand: Array<string> }
) => {
  ws.send(
    JSON.stringify({
      event_type: WebSocketServerEvent.InitPrompter,
      data,
    })
  );
};

export const informIdentity = (ws: WebSocket, user_id: string) => {
  ws.send(
    JSON.stringify({
      event_type: WebSocketServerEvent.InformIdentity,
      data: {
        user_id,
        nickname: nicknames.get(user_id) ?? "",
      },
    })
  );
};

export const initPromptee = (
  ws: WebSocket,
  data: {
    hand: string[];
    prompt_response_count: number;
  }
) => {
  ws.send(
    JSON.stringify({
      event_type: WebSocketServerEvent.InitPromptee,
      data,
    })
  );
};

export const deliverPromptResponses = (
  ws: WebSocket,
  data: { responses_for_prompter: Record<string, string[]> }
) => {
  ws.send(
    JSON.stringify({
      event_type: WebSocketServerEvent.DeliverPromptResponses,
      data,
    })
  );
};

export const waitForNextRound = (ws: WebSocket) => {
  ws.send(
    JSON.stringify({
      event_type: WebSocketServerEvent.WaitForNextRound,
      data: {},
    })
  );
};

export const stateUpdate = (
  ws: WebSocket,
  data: { game_state: GameState; players: Array<BasePlayer> }
) => {
  ws.send(
    JSON.stringify({
      event_type: WebSocketServerEvent.StateUpdate,
      data,
    })
  );
};

export const awardPrompt = (
  ws: WebSocket,
  data: { prompt: string; player: BasePlayer }
) => {
  ws.send(
    JSON.stringify({
      event_type: WebSocketServerEvent.AwardPrompt,
      data,
    })
  );
};

export const reconnectPlayer = (
  ws: WebSocket,
  data: {
    is_prompter: boolean;
    prompt: string;
    hand: Array<string>;
    responses_for_prompter: Record<string, Array<string>>;
    awarded_prompts: Array<string>;
    game_state: GameState;
    is_owner: boolean;
    players: Array<BasePlayer>;
  }
) => {
  ws.send(
    JSON.stringify({
      event_type: WebSocketServerEvent.ReconnectPlayer,
      data,
    })
  );
};
