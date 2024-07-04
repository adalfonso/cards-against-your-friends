import _ from "lodash-es";

import "./app.scss";
import { WaitingRoom } from "./WaitingRoom";
import { app_state } from "./AppState";
import { GameState } from "@prisma/client";
import { PlayerTurn } from "./PlayerTurn";

export function App() {
  return (
    <>
      {app_state.game_state.value === "" && <WaitingRoom />}
      {app_state.game_state.value === GameState.ACTIVE && <PlayerTurn />}
    </>
  );
}
