// All types for the Color Hint game

export type Color = {
  name: string;
  hex: string;
};

export type Player = {
  id: string;
  name: string;
};

export type GameSettings = {
  rounds: number;
  hintsPerPlayerRound: number;
  guessesPerPlayerRound: number;
};

export type Guess = {
  playerId: string;
  guess: string;
};

export type GameStatus = "lobby" | "playing";
export type GameRound = {
  round: number;
  playerRounds: PlayerRound[];
};

export type PlayerRound = {
  hintingPlayerId: string;
  color: string;
  hints: string[];
  guesses: Guess[];
};

export type Game = {
  lobbyCode: string;
  players: Player[];
  settings: GameSettings;
  status: GameStatus;
  rounds: GameRound[];
};
