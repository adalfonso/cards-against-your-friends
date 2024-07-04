import { Maybe, WebSocketClientEvent } from "../../../../common/types";
import { connectWebSocket } from "./WebSocketClient";

let _connection: Maybe<WebSocket> = null;
export class Socket {
  static init() {
    _connection = connectWebSocket();
  }

  static get connection() {
    if (!_connection) {
      throw new Error("WebSocket is not connected!");
    }

    return _connection as WebSocket;
  }

  static submitNickname(nickname: string) {
    Socket.connection.send(
      JSON.stringify({
        event_type: WebSocketClientEvent.SetNickname,
        data: nickname,
      })
    );
  }
}
