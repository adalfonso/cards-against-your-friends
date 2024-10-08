// Number of cards a player can have in their hand at one time
export const CARD_HAND_SIZE = 7;

// Number of cards required to win
export const WINNING_COUNT = 7;

export const PlayerState = {
  WAITING_FOR_PROMPTEES: "WAITING_FOR_PROMPTEES",
  WAITING_FOR_PROMPTER: "WAITING_FOR_PROMPTER",
  DECIDING: "DECIDING",
} as const;

export type PlayerState = (typeof PlayerState)[keyof typeof PlayerState];
