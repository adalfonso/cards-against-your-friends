import { computed, useSignal } from "@preact/signals";
import { useContext } from "preact/hooks";

import "./PlayerTurn.scss";
import { AppContext } from "../../AppState";
import { SelectedCards } from "./PlayerTurn/SelectedCards";
import { Socket } from "../../lib/websocket/Socket";

export const PrompterDeciding = () => {
  const { prompt, responses_for_prompter, room_code } = useContext(AppContext);
  const award_sent = useSignal(false);
  const selected_card_id = useSignal("");
  const selected_cards = computed(
    () => responses_for_prompter.value[selected_card_id.value]
  );

  const awardPrompt = (player: string) => () => {
    Socket.sendAwardPrompt(room_code.value, player, prompt.value);
    award_sent.value = true;
  };

  return (
    <div id="prompter-deciding" className="card-view">
      <div className="card-carousel">
        {Object.entries(responses_for_prompter.value).map(
          ([promptee, responses]) => {
            const selected = selected_card_id.value === promptee;
            return (
              <div
                className="playing-card prompt-card"
                onClick={() => (selected_card_id.value = promptee)}
              >
                <div className="card-text">
                  {mergeResponsesIntoPrompt(prompt.value, responses)}
                </div>
                {selected && <div className="star">★</div>}
                <div className="card-logo"></div>
              </div>
            );
          }
        )}
      </div>

      {selected_cards.value && (
        <div className="selected-cards">
          <div>
            <SelectedCards selected_cards={selected_cards.value} />
          </div>

          <div className="buttons">
            <button onClick={() => (selected_card_id.value = "")}>Redo</button>
            <button
              disabled={award_sent || !selected_card_id}
              onClick={awardPrompt(selected_card_id.value)}
            >
              Send!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const mergeResponsesIntoPrompt = (
  prompt: string,
  prompt_responses: Array<string>
) => {
  const split_prompt = prompt.split(/_+/);

  // starts with blank space
  if (/^_+/.test(prompt)) {
    split_prompt.unshift("");
  }

  const f = split_prompt.map((prompt_part, i) => {
    if (prompt_responses[i] !== undefined) {
      return (
        <>
          {prompt_part}{" "}
          <span className="prompt-fill">{prompt_responses[i]}</span>
        </>
      );
    }

    return <>{prompt_part}</>;
  });

  return f;
};
