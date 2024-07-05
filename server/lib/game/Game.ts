import { Maybe } from "@common/types";
import { clients } from "../io/WebSocketServer";
import * as outgoing from "../io/outgoingWebSocketEvents";

// import { prompts, prompt_responses } from "@server/content";

const prompts: Array<string> = [];
const prompt_responses: Array<string> = [];

type ContentStore = {
  prompts: Array<string>;
  prompt_responses: Array<string>;
};

// Number of cards a player can have in their hand at one time
const card_hand_size = 7;

// Number of cards required to win
const winning_count = 7;

export class Game {
  public _players: Set<string> = new Set();

  private _previous_prompter: Maybe<string> = null;
  private _current_prompter: Maybe<string> = null;

  private _previous_response_count = 0;
  private _current_response_count = 0;

  private _recycling_bin: ContentStore = {
    prompts: [],
    prompt_responses: [],
  };

  private _received_prompt_responses: Record<string, Array<string>> = {};

  private _awarded_prompts: Record<string, Array<string>> = {};

  private _game_over = false;

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

  get prompter() {
    const prompter = this.players.find(
      (user_id) => user_id === this._current_prompter
    );

    if (!prompter) {
      throw new Error(`Could not find prompter`);
    }

    return prompter;
  }

  get promptees() {
    return this.players.filter((player) => player !== this.prompter);
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

    players.forEach((player) => outgoing.startGame(clients[player].ws));

    this.nextTurn();
  }

  public nextTurn() {
    if (this._game_over) {
      return;
    }

    this._received_prompt_responses = {};
    this._rotatePrompter();

    this._nextTurnPrompter(this.prompter);

    this.promptees.forEach((player) => {
      this._nextTurnPromptee(player);
    });
  }

  public receivePromptResponses(
    prompt_responses: Array<string>,
    player: string
  ) {
    this._received_prompt_responses[player] = prompt_responses;

    const received_all_prompt_responses =
      Object.keys(this._received_prompt_responses).length ===
      this._players.size - 1;

    if (received_all_prompt_responses) {
      outgoing.deliverPromptResponses(
        clients[this.prompter].ws,
        this._received_prompt_responses
      );

      this.promptees.forEach((player) => {
        outgoing.waitForNextRound(clients[player].ws);
      });
    }
  }

  public awardPrompt(player: string, prompt: string) {
    if (!this._awarded_prompts[player]) {
      this._awarded_prompts[player] = [];
    }

    this._awarded_prompts[player].push(prompt);
    const connection = clients[player];

    outgoing.awardPrompt(connection.ws, prompt);

    const winner = Object.entries(this._awarded_prompts).find(
      ([_player, prompts]) => prompts.length === winning_count
    );

    if (winner) {
      const [winning_player] = winner;
      this._players.forEach((player) => {
        const connection = clients[player];

        outgoing.endGame(connection.ws, winning_player);
      });

      this._game_over = true;
    }
  }

  private _getPrompt() {
    return this._content.prompts.pop() ?? "RAN OUT OF PROMPTS";
  }

  private _getPromptResponse() {
    return this._content.prompt_responses.pop() ?? "RAN OUT OF RESPONSES";
  }

  private _getPromptResponseCount(player: string) {
    if (this._previous_response_count === 0) {
      return card_hand_size;
    }

    if (player === this._previous_prompter) {
      return 0;
    }

    this._previous_response_count;
  }

  private _nextTurnPrompter(player: string) {
    const connection = clients[player];
    const prompt = this._getPrompt();

    this._previous_response_count = this._current_response_count;
    this._current_response_count = countPrompts(prompt);

    const prompt_responses = new Array(this._getPromptResponseCount(player))
      .fill(0)
      .map(this._getPromptResponse.bind(this));

    this._recycling_bin.prompts.push(prompt);
    this._recycling_bin.prompt_responses.push(...prompt_responses);

    outgoing.initPrompter(connection.ws, { prompt, prompt_responses });

    return prompt;
  }

  private _nextTurnPromptee(player: string) {
    const connection = clients[player];
    const prompt_responses = new Array(this._getPromptResponseCount(player))
      .fill(0)
      .map(this._getPromptResponse.bind(this));

    this._recycling_bin.prompt_responses.push(...prompt_responses);

    outgoing.initPromptee(
      connection.ws,
      prompt_responses,
      this._current_response_count
    );
  }

  // Set the next player to be the prompter
  private _rotatePrompter() {
    this._previous_prompter = this._current_prompter;

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
