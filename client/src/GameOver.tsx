import "./GameOver.scss";
import { AppContext } from "./AppState";
import { useContext } from "preact/hooks";
import { WINNING_COUNT } from "@common/constants";
import { getBaseUrl } from "./lib/utils";

export const GameOver = () => {
  const { awarded_prompts } = useContext(AppContext);
  return (
    <div id="game-over">
      <h1>
        {awarded_prompts.value.length === WINNING_COUNT
          ? "You Won!"
          : "You Lost!"}
      </h1>

      <h6>
        <a href={getBaseUrl()}>New Game</a>
      </h6>
    </div>
  );
};
