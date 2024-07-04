import { signal } from "@preact/signals";
import { GameState } from "@prisma/client";
import { createContext } from "preact";

const game_state = signal<GameState | "">("");
const nickname = signal("");
const owner = signal(false);
const room_code = signal("");
const user_id = signal("");

export const app_state = {
  game_state,
  nickname,
  owner,
  room_code,
  user_id,
};

export const AppContext = createContext(app_state);
