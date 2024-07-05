import "./GameOver.scss";
import { AppContext } from "./AppState";
import { useContext } from "preact/hooks";

export const GameOver = () => {
  const { winner, user_id } = useContext(AppContext);
  return (
    <div id="game-over">
      <h1>{user_id.value === winner.value ? "You Won!" : "You Lost!"}</h1>
    </div>
  );
};
