import { signal } from "@preact/signals";
import { GameState } from "@prisma/client";
import { createContext } from "preact";

type PlayerState = GameState | "PROMPTER_DECIDING" | "PROMPTEE_WAITING";

const awarded_prompts = signal<Array<string>>([]);
const is_prompter = signal(false);
const nickname = signal("");
const owner = signal(false);
const player_state = signal<PlayerState>("INIT");
const prompt = signal("");
const prompt_response_count = signal(1);
const responses_for_promptee = signal<Array<string>>([]);
const responses_for_prompter = signal<Record<string, Array<string>>>({});
const room_code = signal("");
const user_id = signal("");
const winner = signal("");

export const app_state = {
  awarded_prompts,
  is_prompter,
  nickname,
  owner,
  player_state,
  prompt,
  prompt_response_count,
  responses_for_promptee,
  responses_for_prompter,
  room_code,
  user_id,
  winner,
};

export const AppContext = createContext(app_state);
