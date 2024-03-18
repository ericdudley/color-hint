import { getAblyClient } from "./ably";
import { playerSettings } from "./player-settings";
import { generateLobbyCode } from "./uuid";
import * as Ably from "ably";
import { makeAutoObservable } from "mobx";
import debug from "debug";
import { GameRound, GameState, GridColor, Guess, Player } from "@/types";
import { MAX_PLAYERS } from "@/constants";
const d = debug("game-server");
d.enabled = true;

export class ChannelClient {
  channel: Ably.Types.RealtimeChannelCallbacks | null = null;

  constructor(public channelName: string) {
    makeAutoObservable(this);
    this.channel = getAblyClient().channels.get(channelName);
  }

  publish = <T extends MessageName>(name: T, data: MessageNameToPayload[T]) => {
    this.channel?.publish(name, {
      metadata: {
        playerId: playerSettings.id,
      },
      data: data,
    });
  };

  subscribe = (callback: (message: AnyMessage) => void) => {
    this.channel?.subscribe((message) => {
      console.log(message);
      callback({
        name: message.name as AnyMessage["name"],
        metadata: message.data.metadata,
        data: message.data.data,
      });
    });
  };

  close = () => {
    this.channel?.detach();
    this.channel = null;
  };

  onAttach = (callback: () => void) => {
    this.channel?.once("attached", callback);
  };
}

export default class GameServer {
  gameState: GameState = {
    players: [],
    settings: {
      rounds: 3,
      hintsPerPlayerRound: 2,
      guessesPerPlayerRound: 2,
    },
    scores: {},
    status: "lobby",
    currentRound: {
      round: 1,
      playerRounds: [],
    },
  };

  channelClient: ChannelClient;
  isAttached = false;

  constructor(public lobbyCode: string) {
    makeAutoObservable(this);
    this.channelClient = new ChannelClient(`game:${this.lobbyCode}`);
    this.channelClient.subscribe(this.handleMessage);
    this.channelClient.onAttach(() => {
      this.isAttached = true;
    });
  }

  close = () => {
    this.channelClient.close();
  };

  handleMessage = (message: AnyMessage) => {
    console.log("server", message);
    switch (message.name) {
      case "playerJoin":
        const existingPlayer = this.gameState.players.find(
          (p) => p.id === message.data.id,
        );
        // Don't allow players to join once the game has started
        if (
          (this.gameState.status === "playing" && !existingPlayer) ||
          this.gameState.players.length >= MAX_PLAYERS
        ) {
          return;
        }

        if (!existingPlayer) {
          this.gameState.players.push(message.data);
        }
        this.channelClient.publish("gameStateUpdate", this.gameState);
        break;
      case "playerUpdate":
        this.gameState.players = this.gameState.players.map((p) => {
          if (p.id === message.data.id) {
            return message.data;
          }
          return p;
        });
        this.channelClient.publish("gameStateUpdate", this.gameState);
        break;
      case "playerLeave":
        this.gameState.players = this.gameState.players.filter(
          (p) => p.id !== message.data.id,
        );
        this.channelClient.publish("gameStateUpdate", this.gameState);
        break;
      case "startGame":
        this.gameState.status = "playing";
        this.gameState.currentRound = {
          ...this.gameState.currentRound,
          playerRounds: [
            {
              hintingPlayerId: this.gameState.players[0].id,
              hintRounds: [],
            },
          ],
        };

        this.channelClient.publish("gameStateUpdate", this.gameState);
        break;
      case "endGame":
        this.gameState.status = "lobby";
        this.channelClient.publish("gameStateUpdate", this.gameState);
        break;
      case "colorChosen": {
        const currentColor = currentRoundColorSelector(this.gameState);
        if (currentColor) {
          return;
        }

        const currentRound = this.gameState.currentRound;
        currentRound.playerRounds[currentRound.playerRounds.length - 1].color =
          message.data;
        this.channelClient.publish("gameStateUpdate", this.gameState);
        break;
      }
      case "hintChosen":
        const currentHints = currentRoundHintsSelector(this.gameState);
        if (
          currentHints.length >= this.gameState.settings.hintsPerPlayerRound
        ) {
          return;
        }

        const currentRound = this.gameState.currentRound;
        currentRound.playerRounds[
          currentRound.playerRounds.length - 1
        ].hintRounds.push({
          hint: message.data,
          guesses: [],
        });
        this.channelClient.publish("gameStateUpdate", this.gameState);
        break;

      case "guessChosen": {
        const currentRound = this.gameState.currentRound;
        const currentPlayerRound =
          currentRound.playerRounds[currentRound.playerRounds.length - 1];
        const currentHintRound =
          currentPlayerRound.hintRounds[
            currentPlayerRound.hintRounds.length - 1
          ];

        const playersGuesses = currentHintRound.guesses
          .map((g) => g.playerId)
          .filter((id) => id === message.metadata.playerId);

        if (
          playersGuesses.length >= this.gameState.settings.guessesPerPlayerRound
        ) {
          return;
        }

        currentHintRound.guesses.push({
          playerId: message.metadata.playerId,
          guess: message.data,
        });

        // If all players have guessed, move to the next round
        if (
          currentHintRound.guesses.length ===
          this.gameState.players.length - 1
        ) {
          // Check if there are more hint rounds
          if (
            currentPlayerRound.hintRounds.length <
            this.gameState.settings.hintsPerPlayerRound
          ) {
            currentPlayerRound.hintRounds.push({
              hint: undefined,
              guesses: [],
            });
          }
          // If not, move to the next player
          else {
            // Find the next player who hasn't hinted
            const nextPlayer = this.gameState.players.find((p) =>
              currentRound.playerRounds.every(
                (pr) => pr.hintingPlayerId !== p.id,
              ),
            );

            // If there are no more players to hint, move to the next round
            if (!nextPlayer) {
              this.gameState.currentRound = {
                round: currentRound.round + 1,
                playerRounds: [
                  {
                    hintingPlayerId: "",
                    hintRounds: [],
                  },
                ],
              };
            } else {
              currentRound.playerRounds.push({
                hintingPlayerId: nextPlayer.id,
                hintRounds: [],
              });
            }
          }

          this.channelClient.publish("gameStateUpdate", this.gameState);
          break;
        }
      }
    }
  };
}

export function createGameServer(lobbyCode: string): GameServer {
  d(`Creating game server for lobby ${lobbyCode}`);
  const game = new GameServer(lobbyCode);
  return game;
}

export class GameClient {
  gameState: GameState = {
    players: [],
    settings: {
      rounds: 3,
      hintsPerPlayerRound: 2,
      guessesPerPlayerRound: 2,
    },
    scores: {},
    status: "lobby",
    currentRound: {
      round: 1,
      playerRounds: [
        {
          hintingPlayerId: "",
          hintRounds: [],
        },
      ],
    },
  };

  channelClient: ChannelClient;

  constructor(public lobbyCode: string) {
    makeAutoObservable(this);
    this.channelClient = new ChannelClient(`game:${this.lobbyCode}`);
    this.channelClient.subscribe(this.handleMessage);
  }

  handleMessage = (message: AnyMessage) => {
    console.log("client", message);
    switch (message.name) {
      case "gameStateUpdate":
        this.gameState = message.data; // Assuming the client has a gameState object
        // Update local player state based on gameState, if necessary
        break;
    }
  };

  joinGame = () => {
    this.channelClient.publish("playerJoin", playerSettings.player);
  };

  updatePlayer = () => {
    this.channelClient.publish("playerUpdate", playerSettings.player);
  };

  startGame = () => {
    this.channelClient.publish("startGame", undefined);
  };

  endGame = () => {
    this.channelClient.publish("endGame", undefined);
  };

  chooseColor = (color: GridColor) => {
    this.channelClient.publish("colorChosen", color);
  };

  chooseHint = (hint: string) => {
    this.channelClient.publish("hintChosen", hint);
  };

  chooseGuess = (color: GridColor) => {
    this.channelClient.publish("guessChosen", color);
  };

  leaveGame = () => {
    this.channelClient.publish("playerLeave", playerSettings.player);
    this.channelClient.close();
  };
}

export function createGameClient(lobbyCode: string): GameClient {
  d(`Creating game client for lobby ${lobbyCode}`);
  const game = new GameClient(lobbyCode);

  game.channelClient.onAttach(() => {
    game.joinGame();
  });

  return game;
}

type MessageName =
  | "playerJoin"
  | "playerLeave"
  | "gameStateUpdate"
  | "playerUpdate"
  | "colorChosen"
  | "hintChosen"
  | "guessChosen"
  | "startGame"
  | "endGame";
type MessageNameToPayload = {
  playerJoin: Player;
  playerLeave: Player;
  playerUpdate: Player;
  colorChosen: GridColor;
  guessChosen: GridColor;
  hintChosen: string;
  gameStateUpdate: GameState;
  startGame: undefined;
  endGame: undefined;
};

type Message<T extends MessageName> = {
  name: T;
  metadata: {
    playerId: string;
  };
  data: MessageNameToPayload[T];
};

type AnyMessage = {
  [K in MessageName]: Message<K>;
}[MessageName];

type GameStateSelector<T = any> = (gameState: GameState) => T;

export const currentRoundSelector: GameStateSelector<number> = (gameState) => {
  return gameState.currentRound.round;
};

export const currentHinterSelector: GameStateSelector<Player | undefined> = (
  gameState,
) => {
  const currentRound = gameState.currentRound;
  return gameState.players.find((p) =>
    currentRound.playerRounds.every((pr) => pr.hintingPlayerId !== p.id),
  );
};

export const currentRoundColorSelector: GameStateSelector<
  GridColor | undefined
> = (gameState) => {
  const currentRound = gameState.currentRound;
  return currentRound.playerRounds[currentRound.playerRounds.length - 1].color;
};

export const currentRoundHintsSelector: GameStateSelector<string[]> = (
  gameState,
) => {
  const currentRound = gameState.currentRound;
  return currentRound.playerRounds[
    currentRound.playerRounds.length - 1
  ].hintRounds.map((hintRound) => hintRound.hint);
};

export const currentRoundHintSelector: GameStateSelector<string | undefined> = (
  gameState,
) => {
  const currentHints = currentRoundHintsSelector(gameState);
  return currentHints[currentHints.length - 1];
};

export const currentGuessesSelector: GameStateSelector<Guess[]> = (
  gameState,
) => {
  const currentRound = gameState.currentRound;
  const currentPlayerRound =
    currentRound.playerRounds[currentRound.playerRounds.length - 1];
  const currentHintRound =
    currentPlayerRound.hintRounds[currentPlayerRound.hintRounds.length - 1];
  return currentHintRound?.guesses ?? [];
};
