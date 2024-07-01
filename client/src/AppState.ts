import { signal } from "@preact/signals";
import { createContext } from "preact";

export type AppState = {
  room_code: string;
  owner: boolean;
};

export const createAppState = () => {
  const owner = signal(false);
  const room_code = signal("");
  const user_id = signal("");

  return { room_code, owner, user_id };
};

export const AppContext = createContext(createAppState());
