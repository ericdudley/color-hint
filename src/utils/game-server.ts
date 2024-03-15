import { getAblyClient } from "./ably";
import { playerSettings } from "./player-settings";
import { generateLobbyCode } from "./uuid";
import * as Ably from "ably";
import { makeAutoObservable } from "mobx";
import debug from "debug";
import { GameState, Player } from "@/types";
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
        // Don't allow players to join once the game has started
        if (this.gameState.status === "playing"|| this.gameState.players.length >= MAX_PLAYERS) {
          return;
        }

        if (!this.gameState.players.find((p) => p.id === message.data.id)) {
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
        this.channelClient.publish("gameStateUpdate", this.gameState);
        break;
      case "endGame":
        this.gameState.status = "lobby";
        this.channelClient.publish("gameStateUpdate", this.gameState);
        break;
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
      playerRounds: [],
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
  | "startGame"
  | "endGame";
type MessageNameToPayload = {
  playerJoin: Player;
  playerLeave: Player;
  playerUpdate: Player;
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
