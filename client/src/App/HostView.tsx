import { computed } from "@preact/signals";
import { useContext, useEffect } from "preact/hooks";

import "./HostView.scss";
import { AppContext } from "../AppState";
import { clean } from "../lib/utils";
import { preConnect } from "../lib/http/Api";
import { Socket } from "../lib/websocket/Socket";
import { RoundStarting } from "./PlayerView/RoundStarting";
import { WINNING_COUNT } from "@common/constants";

export const HostView = () => {
  const { game_state, players, prompt, room_code, last_prompt_winner } =
    useContext(AppContext);

  const round_starting = computed(() => !!last_prompt_winner.value);

  useEffect(() => {
    const code = new URL(window.location.href).searchParams.get("code");

    if (!code) {
      return alert("Missing CODE");
    }

    room_code.value = code;

    connectToGame(room_code.value);
  }, []);

  const connectToGame = async (room_code: string) => {
    await preConnect();

    Socket.connectAsHost(room_code);
  };

  if (game_state.value === "ENDED") {
    const winner = players.value.find(
      (player) => player.awarded_prompts.length === WINNING_COUNT
    );
    return <h1>{winner?.nickname} won!</h1>;
  } else if (round_starting.value) {
    return <RoundStarting />;
  }

  return (
    <div id="host-dashboard">
      <div className="players">
        {players.value.map((player) => {
          return (
            <div className="player-tile">
              <h2>{player.nickname || "???"}</h2>
              <h3>Points: {player.awarded_prompts.length}</h3>
            </div>
          );
        })}

        {prompt.value && (
          <div className="prompt">
            <div className="playing-card prompt-card">
              <div className="card-text">{clean(prompt.value)}</div>
              <div className="card-logo"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
