import { WebSocket } from "ws";

import { WebSocketServerEvent } from "@common/types";

export const initPrompter = (ws: WebSocket, content: string) => {
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

export const startGame = (ws: WebSocket) => {
  ws.send(
    JSON.stringify({
      event_type: WebSocketServerEvent.StartGame,
      data: {},
    })
  );
};
