import { useSignal } from "@preact/signals";
import { useContext } from "preact/hooks";

import "./WaitingRoom.scss";
import { AppContext } from "./AppState";
import { api } from "./Api";
import { connectWebSocket } from "./WebSocketClient";
import { WebSocketClientEventType } from "../../common/types";
export const WaitingRoom = () => {
  const { connection, room_code, owner, nickname } = useContext(AppContext);
  const busy = useSignal(false);
  const nickname_input = useSignal("");
  const room_code_input = useSignal("");

  const createGame = async () => {
    if (busy.value) {
      return;
    }

    busy.value = true;

    try {
      const game = await api.game.create.mutate();

      room_code.value = game.room_code;
      owner.value = true;
      connection.value = connectWebSocket();
    } catch (e) {
      const message = "Failed to create game";
      console.error(message, e);
      alert(message);
    } finally {
      busy.value = false;
    }
  };

  const joinGame = async (value: string) => {
    if (busy.value) {
      return;
    }

    busy.value = true;

    try {
      const game = await api.game.join.mutate({ room_code: value });

      room_code.value = game.room_code;
      connection.value = connectWebSocket();
    } catch (e) {
      const message = "Failed to join game";
      console.error(message, e);
      alert(message);
    } finally {
      busy.value = false;
    }
  };

  const submitNickname = async (value: string) => {
    if (busy.value || !connection.value) {
      return;
    }

    busy.value = true;

    try {
      connection.value.send(
        JSON.stringify({
          event_type: WebSocketClientEventType.SetNickname,
          data: value,
        })
      );

      nickname.value = value;
    } catch (e) {
      // TODO: I don't think this error handling actually works for the websocket
      const message = "Failed to submit your nickname";
      console.error(message, e);
      alert(message);
    } finally {
      busy.value = false;
    }
  };

  const startGame = async () => {
    if (busy.value || !connection.value) {
      return;
    }

    busy.value = true;

    try {
      await api.game.start.mutate({ room_code: room_code.value });
    } catch (e) {
      const message = `Failed to start game: ${e.message}`;
      console.error(message, e);
      alert(message);
    } finally {
      busy.value = false;
    }
  };

  return (
    <div id="waiting-room">
      <h2>Cards Against Your Friends</h2>
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
            onClick={() => joinGame(room_code_input.value)}
          >
            JOIN
          </button>
          <p className="or">OR</p>

          <button onClick={createGame}>CREATE GAME</button>
        </>
      )}

      {room_code.value && (
        <>
          <p>Room Code: {room_code.value}</p>
          {nickname.value && <p>Nickname: {nickname.value}</p>}
          <input
            placeholder="Enter Nickname"
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

          {owner.value && (
            <button onClick={startGame} disabled={!nickname.value}>
              START GAME
            </button>
          )}
        </>
      )}
    </div>
  );
};
