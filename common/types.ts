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
  InitPromptee: "INIT_PROMPTEE",
  InitPrompter: "INIT_PROMPTER",
  ReconnectPlayer: "RECONNECT_PLAYER",
  StateUpdate: "STATE_UPDATE",
  UpdatePlayers: "UPDATE_PLAYERS",
  WaitForNextRound: "WAIT_FOR_NEXT_ROUND",
} as const;

export type WebSocketServerEvent =
  (typeof WebSocketServerEvent)[keyof typeof WebSocketServerEvent];

export type BasePlayer = {
  user_id: string;
  nickname: string;
};
