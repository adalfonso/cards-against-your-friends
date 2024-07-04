export type Maybe<T> = T | null;

export const WebSocketClientEvent = {
  Identify: "IDENTIFY",
  SetNickname: "SET_NICKNAME",
} as const;

export const WebSocketServerEvent = {
  InformIdentity: "INFORM_IDENTITY",
  StartGame: "START_GAME",
  InitPrompter: "INIT_PROMPTER",
  InitPromptee: "INIT_PROMPTEE",
} as const;

export type WebSocketServerEvent =
  (typeof WebSocketServerEvent)[keyof typeof WebSocketServerEvent];
