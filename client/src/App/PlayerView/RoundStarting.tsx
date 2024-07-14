import { computed } from "@preact/signals";
import { useContext, useEffect, useState } from "preact/hooks";

import "./RoundStarting.scss";
import { AppContext } from "@client/src/AppState";
import { Throbber } from "../Throbber";

export const RoundStarting = () => {
  const { last_prompt_winner, user_id } = useContext(AppContext);
  const is_round_winner = computed(
    () => last_prompt_winner.value?.user_id === user_id.value
  );

  const timeout_s = 10;

  const [count, setCount] = useState(timeout_s);

  useEffect(() => {
    const countdown = setTimeout(() => {
      if (count > 1) {
        setCount(count - 1);
      } else {
        last_prompt_winner.value = null;
      }
    }, 1000);

    // Clear timeout if the component is unmounted or count reaches 0
    return () => clearTimeout(countdown);
  }, [count]);
  return (
    <div id="round-starting">
      <h1>
        {is_round_winner.value
          ? "You won that round!"
          : `${last_prompt_winner.value?.nickname} won that round`}
      </h1>

      <p>Next round starting in {count}...</p>
      <Throbber />
    </div>
  );
};
