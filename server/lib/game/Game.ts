import { BasePlayer, Maybe } from "@common/types";
import * as outgoing from "../io/outgoingWebSocketEvents";
import { WebSocket } from "ws";
import { CARD_HAND_SIZE, WINNING_COUNT } from "@common/constants";
import { GameState } from "@prisma/client";

type ContentStore = {
  prompts: Array<string>;
  prompt_responses: Array<string>;
};

type Player = BasePlayer & {
  ws: WebSocket;
  awarded_prompts: Array<string>;
  prompt: string;
  hand: Array<string>;
};

export class Game {
  // All game players
  public _players = new Map<string, Player>();

  // Current player to prompt others
  private _current_prompter: Maybe<Player> = null;

  // Number of blanks in the current prompt
  private _current_response_count = 0;

  // Temp holding space for prompt responses submitted in a round
  private _received_prompt_responses: Record<string, Array<string>> = {};

  // State of the game
  private _game_state: GameState = GameState.INIT;

  constructor(
    private _room_code: string,
    private _owner_id: string,
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

  public static create(
    room_code: string,
    owner: string,
    content: ContentStore
  ) {
    return new Game(room_code, owner, content);
  }

  public addPlayer(user_id: string, nickname: string, ws: WebSocket) {
    const existing_player = this._players.get(user_id);

    if (existing_player) {
      return this._reconnectPlayer(existing_player, nickname, ws);
    }

    this._players.set(user_id, {
      user_id,
      ws,
      awarded_prompts: [],
      hand: [],
      prompt: "",
      nickname,
    });

    this._sendUpdatePlayers();
  }

  private _reconnectPlayer(player: Player, nickname: string, ws: WebSocket) {
    player.ws = ws;
    player.nickname = nickname ?? player.nickname;

    const is_prompter = player === this._current_prompter;

    outgoing.reconnectPlayer(player.ws, {
      is_prompter,
      hand: player.hand,
      awarded_prompts: player.awarded_prompts,
      prompt: player.prompt,
      responses_for_prompter: is_prompter
        ? this._received_prompt_responses
        : {},
      game_state: this._game_state,
      is_owner: this._owner_id === player.user_id,
      players: this.players.map(({ user_id, nickname }) => ({
        user_id,
        nickname,
      })),
    });

    this._sendUpdatePlayers();
  }

  public start() {
    if (this._players.size <= 1) {
      throw new Error("Cannot start game with a single player");
    }

    this._game_state = GameState.ACTIVE;

    this._players.forEach(({ ws }) =>
      outgoing.stateUpdate(ws, { game_state: this._game_state })
    );

    this.nextTurn();
  }

  public nextTurn() {
    if (this._game_state === GameState.ENDED) {
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

    if (player.awarded_prompts.length < WINNING_COUNT) {
      this._players.forEach(({ ws }) =>
        outgoing.awardPrompt(ws, {
          prompt,
          player: { user_id: player.user_id, nickname: player.nickname },
        })
      );
    } else {
      this._game_state = GameState.ENDED;

      this._players.forEach(({ ws }) =>
        outgoing.stateUpdate(ws, { game_state: this._game_state })
      );
    }
  }

  private _getPrompt() {
    return this._content.prompts.pop() ?? "RAN OUT OF PROMPTS";
  }

  private _getAddlHand(player: Player) {
    return new Array(CARD_HAND_SIZE - player.hand.length)
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

  private _sendUpdatePlayers() {
    this._players.forEach(({ ws }) =>
      outgoing.updatePlayers(ws, {
        players: this.players.map(({ user_id, nickname }) => ({
          user_id,
          nickname,
        })),
      })
    );
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
