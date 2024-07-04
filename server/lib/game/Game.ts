import { Maybe } from "@common/types";
import { clients } from "../io/WebSocketSever";
import { initPromptee, initPrompter, startGame } from "../io/outgoing";

import { prompts, responses } from "@server/content";

type ContentStore = {
  prompts: Array<string>;
  responses: Array<string>;
};

const card_hand_size = 7;

export class Game {
  public _players: Set<string> = new Set();

  private _current_prompter: Maybe<string> = null;

  private _recycling_bin: ContentStore = {
    prompts: [],
    responses: [],
  };

  constructor(
    private _room_code: string,
    private _content: ContentStore
  ) {
    shuffle(this._content.prompts);
    shuffle(this._content.responses);
  }

  get players() {
    return [...this._players];
  }

  public static create(room_code: string) {
    return new Game(room_code, { prompts, responses });
  }

  public addPlayer(user_id: string) {
    this._players.add(user_id);
  }

  public start() {
    const players = this.players;
    const connections = players
      .map((user_id) => clients[user_id]?.ws)
      .filter(Boolean);

    if (players.length !== connections.length) {
      console.error("Player count and websocket count mismatch");
    }

    players.forEach((player) => startGame(clients[player].ws));

    this.nextTurn();
  }

  public nextTurn() {
    this._rotatePrompter();

    this._players.forEach((player) => {
      const is_prompter = player === this._current_prompter;

      if (is_prompter) {
        this._nextTurnPrompter(player);
      } else {
        this._nextTurnPromptee(player);
      }
    });
  }

  private _nextTurnPrompter(player: string) {
    const connection = clients[player];

    const content = this._content.prompts.pop() ?? "RAN OUT OF PROMPTS";

    this._recycling_bin.prompts.push(content);

    initPrompter(connection.ws, content);
  }

  private _nextTurnPromptee(player: string) {
    const connection = clients[player];

    const content = new Array(card_hand_size)
      .fill(0)
      .map(() => this._content.responses.pop() ?? "RAN OUT OF RESPONSES");

    this._recycling_bin.responses.push(...content);

    initPromptee(connection.ws, content);
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

const shuffle = (array: string[]) => {
  let currentIndex = array.length;

  while (currentIndex != 0) {
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
};
