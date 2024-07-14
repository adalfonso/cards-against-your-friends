import { Signal } from "@preact/signals";
import { useContext } from "preact/hooks";

import "./PlayerLobby.scss";
import { BasePlayer } from "@common/types";
import { AppContext } from "@client/src/AppState";

export const PlayerLobby = ({
  players,
}: {
  players: Signal<Array<BasePlayer>>;
}) => {
  const { user_id } = useContext(AppContext);
  return (
    <div id="player-lobby">
      <h2>Lobby</h2>

      {players.value.map((player) => {
        return (
          <div
            className={
              player.user_id === user_id.value
                ? "player-item self"
                : "player-item"
            }
          >
            {player.nickname}
          </div>
        );
      })}
    </div>
  );
};
