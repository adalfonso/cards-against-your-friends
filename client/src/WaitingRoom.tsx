import { useSignal } from "@preact/signals";
import { useContext } from "preact/hooks";

import "./WaitingRoom.scss";
import { AppContext } from "./AppState";
import { api } from "./Api";

export const WaitingRoom = () => {
  const { room_code, owner } = useContext(AppContext);
  const busy = useSignal(false);
  const nickname = useSignal("");
  const nickname_last_submitted = useSignal("");

  // const [ws, setWs] = useState(
  //   (() => {
  //     const ws = new WebSocket("ws://localhost:4202");
  //     ws.onopen = (event) => {
  //       console.log("Connected to server", { event });
  //     };

  //     // Listen for messages
  //     ws.addEventListener("message", (event) => {
  //       console.log("Message from server ", event.data);
  //     });

  //     return ws;
  //   })()
  // );

  // const test = () => {
  //   ws.send("hello");
  // };

  const newGame = async () => {
    if (busy.value) {
      return;
    }

    busy.value = true;

    try {
      const game = await api.game.create.mutate();

      room_code.value = game.room_code;
      owner.value = true;
    } catch (e) {
      console.error("Failed to start game", e);
    } finally {
      busy.value = false;
    }
  };

  const submitNickname = async (value: string) => {
    if (busy.value) {
      return;
    }

    busy.value = true;

    try {
      await api.game.addOrUpdateUser.mutate({
        room_code: room_code.value,
        nickname: value,
      });

      nickname_last_submitted.value = value;
    } catch (e) {
      console.error("Failed to submit your nickname", e);
    } finally {
      busy.value = false;
    }
  };

  const startGame = () => {};

  return (
    <div id="waiting-room">
      {!room_code.value && (
        <>
          <input type="text" placeholder="Enter Code" />
          <button>JOIN</button>
          <p>OR</p>

          <button onClick={newGame}>NEW GAME</button>
        </>
      )}

      {room_code.value && (
        <>
          <p>Room Code: {room_code.value}</p>
          <input
            placeholder="Enter Name"
            value={nickname.value}
            onInput={(e) => (nickname.value = e.currentTarget.value)}
          />
          <button onClick={() => submitNickname(nickname.value)}>SUBMIT</button>

          {owner.value && (
            <button
              onClick={startGame}
              disabled={!nickname.value || !nickname_last_submitted.value}
            >
              START GAME
            </button>
          )}
        </>
      )}
    </div>
  );
};
