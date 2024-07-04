import { signal } from "@preact/signals";
import { GameState } from "@prisma/client";
import { createContext } from "preact";

type PlayerState = GameState | "PROMPTER_DECIDING" | "PROMPTEE_WAITING";

const player_state = signal<PlayerState>("INIT");
const is_prompter = signal(false);
const nickname = signal("");
const owner = signal(false);
const prompt = signal("");
const prompt_response_count = signal(1);
const responses_for_promptee = signal<Array<string>>([]);
const responses_for_prompter = signal<Record<string, Array<string>>>({});
const room_code = signal("");
const user_id = signal("");

export const app_state = {
  player_state,
  is_prompter,
  nickname,
  owner,
  prompt,
  prompt_response_count,
  responses_for_promptee,
  responses_for_prompter,
  room_code,
  user_id,
};

export const AppContext = createContext(app_state);
