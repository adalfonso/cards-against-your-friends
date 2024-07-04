import { useContext } from "preact/hooks";

import { AppContext } from "./AppState";
import "./PlayerTurn.scss";
import { useSignal } from "@preact/signals";
import { SelectedCards } from "./PlayerTurn/SelectedCards";

export const PlayerTurn = () => {
  const selected_cards = useSignal<Array<string>>([]);
  const {
    is_prompter,
    prompt,
    prompt_responses,
    prompt_response_count,
    nickname,
  } = useContext(AppContext);

  const cards = is_prompter.value ? [prompt.value] : prompt_responses.value;

  const selectCard = (prompt_response: string) => {
    if (is_prompter.value) {
      return;
    }

    if (prompt_response_count.value === selected_cards.value.length) {
      return;
    }

    selected_cards.value = [...selected_cards.value, prompt_response];
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
      {selected_cards.value.length > 0 && (
        <div className="selected-cards">
          <div>
            <SelectedCards selected_cards={selected_cards} />
          </div>

          <button onClick={() => (selected_cards.value = [])}>Redo</button>
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
