import { Maybe, WebSocketServerEvent } from "@common/types";
import { clients } from "../io/WebSocketSever";
import { event_handlers } from "../io/outgoing";

export class Game {
  public _players: Set<string> = new Set();

  private _current_prompter: Maybe<string> = null;

  constructor(private _room_code: string) {}

  get players() {
    return [...this._players];
  }

  public addPlayer(user_id: string) {
    this._players.add(user_id);
  }

  public nextTurn() {
    this._rotatePrompter();

    this._players.forEach((player) => {
      const connection = clients[player];

      const event =
        player === this._current_prompter
          ? WebSocketServerEvent.InitPrompter
          : WebSocketServerEvent.InitPromptee;

      event_handlers[event](connection.ws);
    });
  }

  // Set the next player to be the prompter
  private _rotatePrompter() {
    const players = this.players.sort();
    // Make first prompter random by sorting user_ids
    if (this._current_prompter === null) {
      this._current_prompter = players[0];
    } else {
      const current_prompter_index = players.indexOf(this._current_prompter);

      if (current_prompter_index === players.length - 1) {
        this._current_prompter = players[0];
      } else {
        this._current_prompter = players[current_prompter_index + 1];
      }
    }
  }
}
