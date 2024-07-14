import { useContext } from "preact/hooks";

import "./GameHeader.scss";
import { AppContext } from "../../AppState";

export const GameHeader = () => {
  const { nickname, awarded_prompts } = useContext(AppContext);

  return (
    <div id="game-header">
      <h3>{nickname.value}</h3>
      <h3>{awarded_prompts.value.length} pts</h3>
    </div>
  );
};
