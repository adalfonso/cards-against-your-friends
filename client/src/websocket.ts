import { WebsocketEventType } from "../../common/types";

export const connectWebsocket = () => {
  const user_id = document.cookie.replace(
    /(?:(?:^|.*;\s*)user_id\s*\=\s*([^;]*).*$)|^.*$/,
    "$1"
  );

  if (!user_id) {
    console.error(
      "Failed to establish websocket connection: user_id header unable to be sent"
    );

    return null;
  }

  const ws = new WebSocket("ws://localhost:4202");

  ws.onopen = (event) => {
    console.info("Connected to websocket", { event });

    ws.send(
      JSON.stringify({ event_type: WebsocketEventType.Identify, data: user_id })
    );
  };

  ws.addEventListener("message", (event) => {
    console.log("Message over websocker ", event.data);
  });

  return ws;
};
