export type Maybe<T> = T | null;

export const WebSocketClientEvent = {
  Identify: "IDENTIFY",
  SetNickname: "SET_NICKNAME",
  SendPromptResponses: "SEND_PROMPT_RESPONSES",
  AwardPrompt: "AWARD_PROMPT",
} as const;

export const WebSocketServerEvent = {
  InformIdentity: "INFORM_IDENTITY",
  StartGame: "START_GAME",
  InitPrompter: "INIT_PROMPTER",
  InitPromptee: "INIT_PROMPTEE",
  DeliverPromptResponses: "DELIVER_PROMPT_RESPONSES",
  WaitForNextRound: "WAIT_FOR_NEXT_ROUND",
  AwardPrompt: "AWARD_PROMPT",
} as const;

export type WebSocketServerEvent =
  (typeof WebSocketServerEvent)[keyof typeof WebSocketServerEvent];
