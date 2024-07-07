import { Maybe } from "@common/types";
import * as outgoing from "../io/outgoingWebSocketEvents";
import { WebSocket } from "ws";
import { card_hand_size, winning_count } from "@common/constants";

type ContentStore = {
  prompts: Array<string>;
  prompt_responses: Array<string>;
};

type Player = {
  user_id: string;
  ws: WebSocket;
  awarded_prompts: Array<string>;
  prompt: string;
  hand: Array<string>;
};

export class Game {
  public _players = new Map<string, Player>();

  private _current_prompter: Maybe<Player> = null;

  private _current_response_count = 0;

  private _received_prompt_responses: Record<string, Array<string>> = {};

  private _game_over = false;

  constructor(
    private _room_code: string,
    private _content: ContentStore
  ) {
    shuffle(this._content.prompts);
    shuffle(this._content.prompt_responses);
  }

  get room_code() {
    return this._room_code;
  }

  get players() {
    return [...this._players.values()];
  }

  get prompter() {
    if (!this._current_prompter) {
      throw new Error(`Could not find prompter`);
    }

    return this._current_prompter;
  }

  get promptees() {
    return this.players.filter((player) => player !== this._current_prompter);
  }

  public static create(room_code: string, content: ContentStore) {
    return new Game(room_code, content);
  }

  public addPlayer(user_id: string, ws: WebSocket) {
    const existing_player = this._players.get(user_id);

    if (existing_player) {
      existing_player.ws = ws;

      const { awarded_prompts, hand, prompt } = existing_player;

      const is_prompter = existing_player === this._current_prompter;

      outgoing.informReconnection(ws, {
        is_prompter,
        hand,
        awarded_prompts,
        prompt,
        responses_for_prompter: is_prompter
          ? this._received_prompt_responses
          : {},
        game_over: this._game_over,
      });
    } else {
      this._players.set(user_id, {
        user_id,
        ws,
        awarded_prompts: [],
        hand: [],
        prompt: "",
      });
    }
  }

  public start() {
    if (this._players.size <= 1) {
      throw new Error("Cannot start game with a single player");
    }

    this._players.forEach(({ ws }) => outgoing.startGame(ws));

    this.nextTurn();
  }

  public nextTurn() {
    if (this._game_over) {
      return;
    }

    this._received_prompt_responses = {};

    this._rotatePrompter();
    this._nextTurnPrompter(this.prompter);
    this.promptees.forEach((promptee) => this._nextTurnPromptee(promptee));
  }

  public receivePromptResponses(
    prompt_responses: Array<string>,
    player_id: string
  ) {
    this._received_prompt_responses[player_id] = prompt_responses;

    const player = this._players.get(player_id);

    if (!player) {
      throw new Error("Could not find player when setting prompt responses");
    }

    player.hand = player.hand.filter(
      (card) => !prompt_responses.includes(card)
    );

    const received_all_prompt_responses =
      Object.keys(this._received_prompt_responses).length ===
      this._players.size - 1;

    if (received_all_prompt_responses) {
      outgoing.deliverPromptResponses(this.prompter.ws, {
        responses_for_prompter: this._received_prompt_responses,
      });

      this.promptees.forEach((promptee) => {
        outgoing.waitForNextRound(promptee.ws);
      });
    }
  }

  public awardPrompt(player_id: string, prompt: string) {
    const player = this._players.get(player_id);

    if (!player) {
      throw new Error("Could not find player to award prompt to");
    }

    player.awarded_prompts.push(prompt);

    outgoing.awardPrompt(player.ws, { prompt });

    if (player.awarded_prompts.length === winning_count) {
      this._players.forEach(({ ws }) => outgoing.endGame(ws));
      this._game_over = true;
    }
  }

  private _getPrompt() {
    return this._content.prompts.pop() ?? "RAN OUT OF PROMPTS";
  }

  private _getAddlHand(player: Player) {
    return new Array(card_hand_size - player.hand.length)
      .fill(0)
      .map(
        () => this._content.prompt_responses.pop() ?? "RAN OUT OF RESPONSES"
      );
  }

  private _nextTurnPrompter(player: Player) {
    const prompt = this._getPrompt();
    const addl_hand = this._getAddlHand(player);

    player.prompt = prompt;
    player.hand = [...addl_hand, ...player.hand];

    this._current_response_count = countPrompts(prompt);

    outgoing.initPrompter(player.ws, {
      prompt,
      hand: player.hand,
    });

    return prompt;
  }

  private _nextTurnPromptee(player: Player) {
    const addl_hand = this._getAddlHand(player);
    player.hand = [...addl_hand, ...player.hand];

    outgoing.initPromptee(player.ws, {
      hand: player.hand,
      prompt_response_count: this._current_response_count,
    });
  }

  // Set the next player to be the prompter
  private _rotatePrompter() {
    const sorted_players = [...this._players.keys()].sort();
    const [starting_player_id] = sorted_players;

    // Make first prompter random by sorting user_ids
    if (this._current_prompter === null) {
      this._current_prompter = this._players.get(starting_player_id) as Player;
    } else {
      const current_prompter_index = sorted_players.indexOf(
        this._current_prompter.user_id
      );

      if (current_prompter_index === sorted_players.length - 1) {
        this._current_prompter = this._players.get(
          starting_player_id
        ) as Player;
      } else {
        this._current_prompter = this._players.get(
          sorted_players[current_prompter_index + 1]
        ) as Player;
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
