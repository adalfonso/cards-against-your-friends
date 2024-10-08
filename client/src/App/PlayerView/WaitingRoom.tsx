import { computed, useSignal } from "@preact/signals";
import { useContext, useEffect } from "preact/hooks";

import "./WaitingRoom.scss";
import { AppContext } from "../../AppState";
import { api, preConnect } from "../../lib/http/Api";
import { Socket } from "../../lib/websocket/Socket";

import { getBaseUrl } from "../../lib/utils";

import { Throbber } from "../Throbber";
import QRCode from "react-qr-code";
import { PlayerLobby } from "./PlayerTurn/WaitingRoom/PlayerLobby";

export const WaitingRoom = () => {
  const { room_code, is_owner, nickname, user_id, players } =
    useContext(AppContext);
  const busy = useSignal(false);
  const nickname_input = useSignal("");
  const room_code_input = useSignal("");

  const players_with_nicknames = computed(() =>
    players.value.filter((player) => player.nickname !== "")
  );

  useEffect(() => {
    const code = new URL(window.location.href).searchParams.get("code");

    if (!code) {
      return;
    }

    joinGame(code);
  }, []);

  const redirectToJoinGame = (code: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set("code", code.toUpperCase());

    window.location.href = url.toString();
  };

  const joinGame = async (code: string) => {
    try {
      await preConnect();
      const game = await api.game.join.mutate({ room_code: code });

      room_code.value = game.room_code;
      is_owner.value = user_id.value !== "" && user_id.value === game.owner_id;
    } catch (e) {
      alert("Failed to join game");

      window.location.href = getBaseUrl();
    }
  };

  const createGame = async () => {
    await preConnect();
    const game = await api.game.create.mutate();

    redirectToJoinGame(game.room_code);
  };

  const submitNickname = (_nickname: string) => {
    Socket.submitNickname(_nickname, room_code.value);

    nickname.value = _nickname;
  };

  const startGame = () => api.game.start.mutate({ room_code: room_code.value });

  return (
    <div id="waiting-room">
      <h1>Cards Against the Commune</h1>
      {busy.value && <Throbber />}
      {!room_code.value && (
        <>
          <input
            type="text"
            placeholder="Enter Room Code"
            value={room_code_input.value}
            onInput={(e) => (room_code_input.value = e.currentTarget.value)}
          />
          <button
            disabled={room_code_input.value.length !== 4}
            onClick={() => redirectToJoinGame(room_code_input.value)}
          >
            JOIN
          </button>
          <p className="or">OR</p>

          <button onClick={createGame}>CREATE GAME</button>
        </>
      )}

      {room_code.value && (
        <>
          <div className="room-code">{room_code.value}</div>

          <div className="qr">
            <QRCode value={window.location.href} size={112} />
          </div>

          {!nickname.value && (
            <>
              <input
                placeholder="Enter Nickname"
                maxLength={12}
                value={nickname_input.value}
                onInput={(e) =>
                  (nickname_input.value = e.currentTarget.value.toUpperCase())
                }
              />
              <button
                disabled={!nickname_input.value.length}
                onClick={() => submitNickname(nickname_input.value)}
              >
                SUBMIT
              </button>
            </>
          )}

          {is_owner.value && (
            <button
              className="start-game-button"
              onClick={() => startGame()}
              disabled={!nickname.value}
            >
              START GAME
            </button>
          )}
        </>
      )}

      {players_with_nicknames.value.length > 0 && (
        <PlayerLobby players={players_with_nicknames} />
      )}
    </div>
  );
};
