import _ from "lodash-es";

import "./app.scss";
import { WaitingRoom } from "./WaitingRoom";
import { app_state } from "./AppState";
import { GameState } from "@prisma/client";
// import { responses } from "./content/responses";

export function App() {
  //console.log(_.chunk(_.shuffle(responses), 7));
  // console.log(responses.length);

  return (
    <>
      {app_state.game_state.value === "" && <WaitingRoom />}
      {app_state.game_state.value === GameState.ACTIVE && <div>active</div>}
    </>
  );
}
