import { signal } from "@preact/signals";
import { createContext } from "preact";

type PlayerState =
  | "INIT"
  | "ACTIVE"
  | "ENDED"
  | "PROMPTER_DECIDING"
  | "PROMPTEE_WAITING";

const awarded_prompts = signal<Array<string>>([]);
const hand = signal<Array<string>>([]);
const is_owner = signal(false);
const is_prompter = signal(false);
const nickname = signal("");
const player_state = signal<PlayerState>("INIT");
const prompt = signal("");
const prompt_response_count = signal(1);
const responses_for_prompter = signal<Record<string, Array<string>>>({});
const room_code = signal("");

export const app_state = {
  awarded_prompts,
  hand,
  is_owner,
  is_prompter,
  nickname,
  player_state,
  prompt,
  prompt_response_count,
  responses_for_prompter,
  room_code,
};

export const AppContext = createContext(app_state);
