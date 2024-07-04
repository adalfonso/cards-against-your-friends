import { useContext } from "preact/hooks";
import { AppContext } from "./AppState";

export const PlayerTurn = () => {
  const { is_prompter } = useContext(AppContext);

  return (
    <div id="player-turn">
      <h2>{is_prompter.value ? "Prompter" : "Promptee"}</h2>
    </div>
  );
};
