import { useContext } from "preact/hooks";

import { AppContext } from "./AppState";
import "./PlayerTurn.scss";
import { useSignal } from "@preact/signals";
import { SelectedCards } from "./PlayerTurn/SelectedCards";
import { Socket } from "./lib/websocket/Socket";

export const PlayerTurn = () => {
  const selected_cards = useSignal<Array<string>>([]);
  const {
    is_prompter,
    prompt,
    responses_for_promptee,
    prompt_response_count,
    nickname,
    room_code,
  } = useContext(AppContext);

  const cards = is_prompter.value
    ? [prompt.value]
    : responses_for_promptee.value;

  const selectCard = (prompt_response: string) => {
    if (is_prompter.value) {
      return;
    }

    if (prompt_response_count.value === selected_cards.value.length) {
      return;
    }

    selected_cards.value = [...selected_cards.value, prompt_response];
  };

  const sendPromptResponses = () => {
    Socket.sendPromptResponses(room_code.value, selected_cards.value);
  };

  return (
    <div id="player-turn">
      <h2>{nickname.value}</h2>
      <div className="card-carousel">
        {cards.map((text) => {
          const cleaned_text = clean(text);

          const selected =
            !is_prompter.value && selected_cards.value.includes(text);
          return (
            <div
              className={
                is_prompter.value ? "playing-card prompt-card" : "playing-card"
              }
              onClick={() => {
                selectCard(text);
              }}
            >
              <div>{cleaned_text}</div>

              {selected && <div className="star">★</div>}
            </div>
          );
        })}
      </div>
      {selected_cards.value.length > 0 && (
        <div className="selected-cards">
          <div>
            <SelectedCards selected_cards={selected_cards} />
          </div>

          <div className="buttons">
            <button onClick={() => (selected_cards.value = [])}>Redo</button>
            <button
              disabled={
                selected_cards.value.length !== prompt_response_count.value
              }
              onClick={sendPromptResponses}
            >
              Send!
            </button>
          </div>
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
