import "./GameOver.scss";
import { AppContext } from "./AppState";
import { useContext } from "preact/hooks";
import { winning_count } from "../../common/constants";

export const GameOver = () => {
  const { awarded_prompts } = useContext(AppContext);
  return (
    <div id="game-over">
      <h1>
        {awarded_prompts.value.length === winning_count
          ? "You Won!"
          : "You Lost!"}
      </h1>
    </div>
  );
};
