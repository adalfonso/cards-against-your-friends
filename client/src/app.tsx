import "./app.scss";
import { WaitingRoom } from "./WaitingRoom";
import { app_state } from "./AppState";
import { PlayerTurn } from "./PlayerTurn";
import { PrompterDeciding } from "./PrompterDeciding";
import { Waiting } from "./Waiting";

export function App() {
  return (
    <>
      {app_state.player_state.value === "INIT" && <WaitingRoom />}
      {app_state.player_state.value === "ACTIVE" && <PlayerTurn />}
      {app_state.player_state.value === "PROMPTEE_WAITING" && <Waiting />}
      {app_state.player_state.value === "PROMPTER_DECIDING" && (
        <PrompterDeciding />
      )}
    </>
  );
}
