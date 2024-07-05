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
        data: { nickname },
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
