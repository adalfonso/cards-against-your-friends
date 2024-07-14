import { useContext } from "preact/hooks";
import { useSignal } from "@preact/signals";

import "./PlayerTurn.scss";
import { AppContext } from "../../AppState";
import { SelectedCards } from "./PlayerTurn/SelectedCards";
import { Socket } from "../../lib/websocket/Socket";
import { PlayerState } from "@common/constants";
import { clean } from "@client/src/lib/utils";

export const PlayerTurn = () => {
  const selected_cards = useSignal<Array<string>>([]);
  const {
    is_prompter,
    prompt,
    hand,
    prompt_response_count,
    room_code,
    player_state,
  } = useContext(AppContext);

  const cards = is_prompter.value ? [prompt.value] : hand.value;

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
    hand.value = hand.value.filter(
      (response) => !selected_cards.value.includes(response)
    );
    player_state.value = PlayerState.WAITING_FOR_PROMPTEES;
  };

  return (
    <div id="player-turn" className="card-view">
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
              <div className="card-text">{cleaned_text}</div>
              <div className="card-logo"></div>

              {selected && <div className="star">★</div>}
            </div>
          );
        })}
      </div>
      {selected_cards.value.length > 0 && (
        <div className="selected-cards">
          <SelectedCards selected_cards={selected_cards.value} />

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
