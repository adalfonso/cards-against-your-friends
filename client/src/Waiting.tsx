import "./Waiting.scss";
import { Throbber } from "./Throbber";

export const Waiting = () => {
  return (
    <div id="waiting">
      <p>Waiting for the prompter to choose a card...</p>
      <p>(way good)</p>
      <Throbber />
    </div>
  );
};
