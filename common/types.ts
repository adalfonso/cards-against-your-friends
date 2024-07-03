export type Maybe<T> = T | null;

export const WebSocketClientEventType = {
  Identify: "IDENTIFY",
  SetNickname: "SET_NICKNAME",
} as const;

export const WebSocketServerEventType = {
  InformIdentity: "INFORM_IDENTITY",
} as const;
