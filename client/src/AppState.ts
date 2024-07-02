import { Maybe } from "@common/types";
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
  const nickname = signal("");
  const connection = signal<Maybe<WebSocket>>(null);

  return { connection, room_code, owner, nickname, user_id };
};

export const AppContext = createContext(createAppState());
