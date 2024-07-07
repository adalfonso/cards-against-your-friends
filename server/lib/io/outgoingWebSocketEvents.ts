import { WebSocket } from "ws";

import { WebSocketServerEvent } from "@common/types";
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

export const startGame = (ws: WebSocket) => {
  ws.send(
    JSON.stringify({
      event_type: WebSocketServerEvent.StartGame,
      data: {},
    })
  );
};

export const awardPrompt = (ws: WebSocket, data: { prompt: string }) => {
  ws.send(
    JSON.stringify({
      event_type: WebSocketServerEvent.AwardPrompt,
      data,
    })
  );
};

export const endGame = (ws: WebSocket) => {
  ws.send(
    JSON.stringify({
      event_type: WebSocketServerEvent.EndGame,
      data: {},
    })
  );
};

export const informReconnection = (
  ws: WebSocket,
  data: {
    is_prompter: boolean;
    prompt: string;
    hand: Array<string>;
    responses_for_prompter: Record<string, Array<string>>;
    awarded_prompts: Array<string>;
    game_over: boolean;
  }
) => {
  ws.send(
    JSON.stringify({
      event_type: WebSocketServerEvent.InformReconnection,
      data,
    })
  );
};
