import { computed, useSignal } from "@preact/signals";
import { useContext, useEffect } from "preact/hooks";

import "./WaitingRoom.scss";
import { AppContext } from "./AppState";
import { api } from "./Api";
import { Socket } from "./lib/websocket/Socket";
import { useBusy } from "./hooks/useBusy";
import { getBaseUrl } from "./lib/utils";
import { PlayerLobby } from "./WaitingRoom/PlayerLobby";

export const WaitingRoom = () => {
  const { room_code, is_owner, nickname, user_id, players } =
    useContext(AppContext);
  const busy = useSignal(false);
  const nickname_input = useSignal("");
  const room_code_input = useSignal("");
  const busyHandler = useBusy(busy);

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

  const preConnect = async () => {
    await api.game.startSession.mutate();
    await Socket.init();
  };

  const joinGame = async (code: string) => {
    try {
      await preConnect();
      const game = await api.game.join.mutate({ room_code: code });

      room_code.value = game.room_code;
      is_owner.value =
        user_id.value !== "" && user_id.value === game.created_by;
    } catch (e) {
      alert("Failed to join game");

      window.location.href = getBaseUrl();
    }
  };

  const createGame = () =>
    busyHandler(async () => {
      await preConnect();
      const game = await api.game.create.mutate();

      redirectToJoinGame(game.room_code);
    }, "Failed to create or join game");

  const submitNickname = (_nickname: string) =>
    busyHandler(() => {
      Socket.submitNickname(_nickname, room_code.value);

      nickname.value = _nickname;
    }, "Failed to submit your nickname");

  const startGame = () =>
    busyHandler(
      () => api.game.start.mutate({ room_code: room_code.value }),
      (e) => `Failed to start game: ${e.message}`
    );

  return (
    <div id="waiting-room">
      <h2>Cards Against the Commune</h2>
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

          {!is_owner.value && nickname.value.length > 0 && (
            <p>Waiting for game owner to start...</p>
          )}
        </>
      )}

      {players_with_nicknames.value.length > 0 && (
        <PlayerLobby players={players_with_nicknames} />
      )}
    </div>
  );
};
