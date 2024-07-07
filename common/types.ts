export type Maybe<T> = T | null;

export const WebSocketClientEvent = {
  AwardPrompt: "AWARD_PROMPT",
  Identify: "IDENTIFY",
  SendPromptResponses: "SEND_PROMPT_RESPONSES",
  SetNickname: "SET_NICKNAME",
} as const;

export const WebSocketServerEvent = {
  AwardPrompt: "AWARD_PROMPT",
  DeliverPromptResponses: "DELIVER_PROMPT_RESPONSES",
  EndGame: "END_GAME",
  InformIdentity: "INFORM_IDENTITY",
  ReconnectPlayer: "RECONNECT_PLAYER",
  InitPromptee: "INIT_PROMPTEE",
  InitPrompter: "INIT_PROMPTER",
  StateUpdate: "STATE_UPDATE",
  WaitForNextRound: "WAIT_FOR_NEXT_ROUND",
} as const;

export type WebSocketServerEvent =
  (typeof WebSocketServerEvent)[keyof typeof WebSocketServerEvent];
