import { signal } from "@preact/signals";
import { GameState } from "@prisma/client";
import { createContext } from "preact";

const game_state = signal<GameState | "">("");
const is_prompter = signal(false);
const nickname = signal("");
const owner = signal(false);
const prompt = signal("");
const prompt_responses = signal<Array<string>>([]);
const room_code = signal("");
const user_id = signal("");

export const app_state = {
  game_state,
  is_prompter,
  nickname,
  owner,
  prompt,
  prompt_responses,
  room_code,
  user_id,
};

export const AppContext = createContext(app_state);
