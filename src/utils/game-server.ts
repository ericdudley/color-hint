import { getAblyClient } from "./ably";
import { Player, playerSettings } from "./player-settings";
import { generateLobbyCode } from "./uuid";
import * as Ably from "ably";
import { makeAutoObservable } from "mobx";
import debug from "debug";
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
  players: Player[] = [];
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
        if (!this.players.find((p) => p.id === message.data.id)) {
          this.players.push(message.data);
          this.channelClient.publish("updatedPlayers", this.players);
        }
        break;
      case "playerLeave":
        this.players = this.players.filter((p) => p.id !== message.data.id);
        this.channelClient.publish("updatedPlayers", this.players);
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
  players: Player[] = [];

  channelClient: ChannelClient;

  constructor(public lobbyCode: string) {
    makeAutoObservable(this);
    this.channelClient = new ChannelClient(`game:${this.lobbyCode}`);
    this.channelClient.subscribe(this.handleMessage);
  }

  handleMessage = (message: AnyMessage) => {
    console.log("client", message);
    switch (message.name) {
      case "updatedPlayers":
        this.players = message.data;
        break;
    }
  };

  joinGame = () => {
    this.channelClient.publish("playerJoin", playerSettings.player);
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

type MessageName = "playerJoin" | "playerLeave" | "updatedPlayers";
type MessageNameToPayload = {
  playerJoin: Player;
  playerLeave: Player;
  updatedPlayers: Player[];
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
