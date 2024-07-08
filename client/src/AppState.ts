import { signal } from "@preact/signals";
import { createContext } from "preact";

import { PlayerState } from "@common/constants";
import { BasePlayer } from "@common/types";

// TODO: keep up to date with prisma
export type GameState = "INIT" | "ACTIVE" | "ENDED";

const awarded_prompts = signal<Array<string>>([]);
const game_state = signal<GameState>("INIT");
const hand = signal<Array<string>>([]);
const is_owner = signal(false);
const is_prompter = signal(false);
const nickname = signal("");
const player_state = signal<PlayerState>(PlayerState.WAITING);
const players = signal<Array<BasePlayer>>([]);
const prompt = signal("");
const prompt_response_count = signal(1);
const responses_for_prompter = signal<Record<string, Array<string>>>({});
const room_code = signal("");
const user_id = signal("");

export const app_state = {
  awarded_prompts,
  game_state,
  hand,
  is_owner,
  is_prompter,
  nickname,
  player_state,
  players,
  prompt,
  prompt_response_count,
  responses_for_prompter,
  room_code,
  user_id,
};

export const AppContext = createContext(app_state);
