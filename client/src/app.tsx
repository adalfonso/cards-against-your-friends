import "./app.scss";
import { GameOver } from "./GameOver";
import { PlayerTurn } from "./PlayerTurn";
import { PrompterDeciding } from "./PrompterDeciding";
import { Waiting } from "./Waiting";
import { WaitingRoom } from "./WaitingRoom";
import { app_state, AppContext } from "./AppState";
import { useContext } from "preact/hooks";
import { GameHeader } from "./GameHeader";

export function App() {
  const { nickname } = useContext(AppContext);

  return (
    <>
      {app_state.player_state.value !== "INIT" && nickname.value && (
        <GameHeader />
      )}
      {app_state.player_state.value === "INIT" && <WaitingRoom />}
      {app_state.player_state.value === "ACTIVE" && <PlayerTurn />}
      {app_state.player_state.value === "PROMPTEE_WAITING" && <Waiting />}
      {app_state.player_state.value === "PROMPTER_DECIDING" && (
        <PrompterDeciding />
      )}

      {app_state.player_state.value === "ENDED" && <GameOver />}
    </>
  );
}
