import "./app.scss";
import { WaitingRoom } from "./WaitingRoom";
import { app_state, AppContext } from "./AppState";
import { PlayerTurn } from "./PlayerTurn";
import { PrompterDeciding } from "./PrompterDeciding";
import { Waiting } from "./Waiting";
import { useContext } from "preact/hooks";

export function App() {
  const { nickname } = useContext(AppContext);

  return (
    <>
      {app_state.player_state.value !== "INIT" && nickname.value && (
        <h2>{nickname.value}</h2>
      )}
      {app_state.player_state.value === "INIT" && <WaitingRoom />}
      {app_state.player_state.value === "ACTIVE" && <PlayerTurn />}
      {app_state.player_state.value === "PROMPTEE_WAITING" && <Waiting />}
      {app_state.player_state.value === "PROMPTER_DECIDING" && (
        <PrompterDeciding />
      )}
    </>
  );
}
