import { useContext } from "preact/hooks";

import { AppContext } from "./AppState";
import "./PlayerTurn.scss";
import { useSignal } from "@preact/signals";

export const PlayerTurn = () => {
  const selected_card = useSignal("");
  const { is_prompter, prompt, prompt_responses, nickname } =
    useContext(AppContext);

  const cards = is_prompter.value ? [prompt.value] : prompt_responses.value;

  const selectCard = (prompt_response: string) => {
    if (is_prompter.value) {
      return;
    }

    selected_card.value = prompt_response;
  };

  return (
    <div id="player-turn" className={is_prompter.value ? "prompter" : ""}>
      <h2>{nickname.value}</h2>
      <div className="card-carousel">
        {cards.map((text) => {
          return (
            <div
              className="playing-card"
              onClick={() => {
                selectCard(clean(text));
              }}
            >
              <div>{clean(text)}</div>
            </div>
          );
        })}
      </div>
      {selected_card.value && (
        <div className="prompt-response-to-send">
          <div>
            Choose "<em>{selected_card.value}</em>"?
          </div>

          <button>Send!</button>
        </div>
      )}
    </div>
  );
};

const clean = (str: string) => {
  const punctuationRegex = /[.,;:?!]$/;

  str = str.replace(/_+/, "______");

  return punctuationRegex.test(str) ? str : str + ".";
};
