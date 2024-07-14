import { useContext } from "preact/hooks";

import "./Waiting.scss";
import { AppContext } from "../../AppState";
import { Throbber } from "../Throbber";
import { PlayerState } from "@common/constants";
import { computed } from "@preact/signals";

export const Waiting = () => {
  const { player_state } = useContext(AppContext);

  const message = computed(() =>
    player_state.value == PlayerState.WAITING_FOR_PROMPTEES
      ? "Waiting for other players to submit their responses"
      : "Waiting for the prompter to choose a card"
  );

  return (
    <div id="waiting">
      <p>{message}</p>

      <Throbber />
    </div>
  );
};
