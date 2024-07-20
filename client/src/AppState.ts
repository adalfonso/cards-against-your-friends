import { signal } from "@preact/signals";
import { createContext } from "preact";

import { PlayerState } from "@common/constants";
import { BasePlayer, GameState, Maybe } from "@common/types";

const awarded_prompts = signal<Array<string>>([]);
const game_state = signal<GameState>(GameState.INIT);
const hand = signal<Array<string>>([]);
const is_host = signal<Maybe<boolean>>(null);
const is_owner = signal(false);
const is_prompter = signal(false);
const last_prompt_winner = signal<Maybe<BasePlayer>>(null);
const nickname = signal("");
const player_state = signal<PlayerState>(PlayerState.WAITING_FOR_PROMPTEES);
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
  is_host,
  is_owner,
  is_prompter,
  last_prompt_winner,
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
