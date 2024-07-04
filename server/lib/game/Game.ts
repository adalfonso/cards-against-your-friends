import { Maybe } from "@common/types";
import { clients } from "../io/WebSocketSever";
import { initPromptee, initPrompter, startGame } from "../io/outgoing";

import { prompts, prompt_responses } from "@server/content";

type ContentStore = {
  prompts: Array<string>;
  prompt_responses: Array<string>;
};

const card_hand_size = 7;

export class Game {
  public _players: Set<string> = new Set();

  private _current_prompter: Maybe<string> = null;

  private _recycling_bin: ContentStore = {
    prompts: [],
    prompt_responses: [],
  };

  constructor(
    private _room_code: string,
    private _content: ContentStore
  ) {
    shuffle(this._content.prompts);
    shuffle(this._content.prompt_responses);
  }

  get players() {
    return [...this._players];
  }

  public static create(room_code: string) {
    return new Game(room_code, { prompts, prompt_responses: prompt_responses });
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

    const players = this.players;

    const prompter = players.find(
      (user_id) => user_id === this._current_prompter
    );

    const prompt = this._nextTurnPrompter(prompter as string);
    const prompt_response_count = countPrompts(prompt);

    players.forEach((player) => {
      if (player === this._current_prompter) {
        return;
      }

      this._nextTurnPromptee(player, prompt_response_count);
    });
  }

  private _nextTurnPrompter(player: string) {
    const connection = clients[player];

    const prompt = this._content.prompts.pop() ?? "RAN OUT OF PROMPTS";

    this._recycling_bin.prompts.push(prompt);

    initPrompter(connection.ws, prompt);

    return prompt;
  }

  private _nextTurnPromptee(player: string, prompt_response_count: number) {
    const connection = clients[player];

    const prompt_responses = new Array(card_hand_size)
      .fill(0)
      .map(
        () => this._content.prompt_responses.pop() ?? "RAN OUT OF RESPONSES"
      );

    this._recycling_bin.prompt_responses.push(...prompt_responses);

    initPromptee(connection.ws, prompt_responses, prompt_response_count);
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

const countPrompts = (prompt: string) => {
  const regex = /_+/g;

  const matches = prompt.match(regex);

  return matches ? matches.length : 1;
};
