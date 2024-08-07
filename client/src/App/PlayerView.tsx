import { useContext } from "preact/hooks";

// import "./app.scss";
import { AppContext } from "../AppState";
import { GameHeader } from "./PlayerView/GameHeader";
import { GameOver } from "./PlayerView/GameOver";
import { PlayerState } from "@common/constants";
import { PlayerTurn } from "./PlayerView/PlayerTurn";
import { PrompterDeciding } from "./PlayerView/PrompterDeciding";
import { RoundStarting } from "./PlayerView/RoundStarting";
import { Waiting } from "./PlayerView/Waiting";
import { WaitingRoom } from "./PlayerView/WaitingRoom";

export function PlayerView() {
  const { game_state, player_state, is_prompter, last_prompt_winner } =
    useContext(AppContext);

  const round_starting = !!last_prompt_winner.value;

  const is_turn =
    game_state.value === "ACTIVE" &&
    !round_starting &&
    ((player_state.value === PlayerState.DECIDING && !is_prompter.value) ||
      (player_state.value === PlayerState.WAITING_FOR_PROMPTEES &&
        is_prompter.value));

  const promptee_waiting =
    game_state.value === "ACTIVE" &&
    !round_starting &&
    /WAITING/.test(player_state.value) &&
    !is_prompter.value;

  const prompter_deciding =
    game_state.value === "ACTIVE" &&
    !round_starting &&
    player_state.value === PlayerState.DECIDING &&
    is_prompter.value;

  return (
    <>
      {game_state.value === "ACTIVE" && <GameHeader />}

      {game_state.value === "INIT" && <WaitingRoom />}

      {is_turn && <PlayerTurn />}
      {promptee_waiting && <Waiting />}
      {prompter_deciding && <PrompterDeciding />}
      {round_starting && <RoundStarting />}

      {game_state.value === "ENDED" && <GameOver />}
    </>
  );
}
