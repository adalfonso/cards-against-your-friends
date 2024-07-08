import { Maybe, WebSocketClientEvent } from "@common/types";
import { connectWebSocket } from "./WebSocketClient";

let _connection: Maybe<WebSocket> = null;
export class Socket {
  static async init() {
    if (_connection?.readyState === 1) {
      return _connection;
    }

    return new Promise((resolve, reject) => {
      _connection = connectWebSocket(resolve);

      setTimeout(reject, 5000);
    });
  }

  static get connection() {
    if (!_connection) {
      throw new Error("WebSocket is not connected!");
    }

    return _connection as WebSocket;
  }

  static submitNickname(nickname: string, room_code: string) {
    Socket.connection.send(
      JSON.stringify({
        event_type: WebSocketClientEvent.SetNickname,
        data: { nickname, room_code },
      })
    );
  }

  static sendPromptResponses(
    room_code: string,
    prompt_responses: Array<string>
  ) {
    Socket.connection.send(
      JSON.stringify({
        event_type: WebSocketClientEvent.SendPromptResponses,
        data: { room_code, prompt_responses },
      })
    );
  }

  static sendAwardPrompt(room_code: string, player: string, prompt: string) {
    Socket.connection.send(
      JSON.stringify({
        event_type: WebSocketClientEvent.AwardPrompt,
        data: { room_code, player, prompt },
      })
    );
  }
}
