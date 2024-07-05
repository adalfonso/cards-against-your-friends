import { WebSocket } from "ws";

import { WebSocketServerEvent } from "@common/types";

export const initPrompter = (
  ws: WebSocket,
  content: { prompt: string; prompt_responses: Array<string> }
) => {
  ws.send(
    JSON.stringify({
      event_type: WebSocketServerEvent.InitPrompter,
      data: { content },
    })
  );
};

export const initPromptee = (
  ws: WebSocket,
  content: string[],
  prompt_response_count: number
) => {
  ws.send(
    JSON.stringify({
      event_type: WebSocketServerEvent.InitPromptee,
      data: { content, prompt_response_count },
    })
  );
};

export const deliverPromptResponses = (
  ws: WebSocket,
  content: Record<string, string[]>
) => {
  ws.send(
    JSON.stringify({
      event_type: WebSocketServerEvent.DeliverPromptResponses,
      data: { content },
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

export const awardPrompt = (ws: WebSocket, prompt: string) => {
  ws.send(
    JSON.stringify({
      event_type: WebSocketServerEvent.AwardPrompt,
      data: { prompt },
    })
  );
};

export const endGame = (ws: WebSocket, winner: string) => {
  ws.send(
    JSON.stringify({
      event_type: WebSocketServerEvent.EndGame,
      data: { winner },
    })
  );
};
