import { useContext } from "preact/hooks";

import "./app.scss";
import { AppContext } from "./AppState";
import { GameHeader } from "./GameHeader";
import { GameOver } from "./GameOver";
import { PlayerState } from "@common/constants";
import { PlayerTurn } from "./PlayerTurn";
import { PrompterDeciding } from "./PrompterDeciding";
import { RoundStarting } from "./RoundStarting";
import { Waiting } from "./Waiting";
import { WaitingRoom } from "./WaitingRoom";

export function App() {
  const { game_state, player_state, is_prompter, last_prompt_winner } =
    useContext(AppContext);

  const round_starting = !!last_prompt_winner.value;

  const is_turn =
    game_state.value === "ACTIVE" &&
    !round_starting &&
    ((player_state.value === PlayerState.DECIDING && !is_prompter.value) ||
      (player_state.value === PlayerState.WAITING && is_prompter.value));

  const waiting_for_prompter =
    game_state.value === "ACTIVE" &&
    !round_starting &&
    player_state.value === PlayerState.WAITING &&
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
      {waiting_for_prompter && <Waiting />}
      {prompter_deciding && <PrompterDeciding />}
      {round_starting && <RoundStarting />}

      {game_state.value === "ENDED" && <GameOver />}
    </>
  );
}
