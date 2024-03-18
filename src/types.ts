// All types for the Color Hint game

import { IconName } from "./utils/player-settings";

export type Color = {
  name: string;
  hex: string;
};

export type Player = {
  id: string;
  name: string;
  icon?: IconName;
  color: string;
  isHost: boolean;
};

export type GameSettings = {
  rounds: number;
  hintsPerPlayerRound: number;
  guessesPerPlayerRound: number;
};

export type Guess = {
  playerId: string;
  guess: GridColor;
};

export type GameStatus = "lobby" | "playing";

export type GameRound = {
  round: number;
  playerRounds: PlayerRound[];
};

export type GridColor = {
  x: number;
  y: number;
};

export type PlayerRound = {
  hintingPlayerId: string;
  color?: GridColor;
  hintRounds: HintRound[];
};

export type HintRound = {
  hint?: string;
  guesses: Guess[];
};

export type GameState = {
  players: Player[];
  settings: GameSettings;
  scores: Record<string, number>;
  status: GameStatus;
  currentRound: GameRound;
};
