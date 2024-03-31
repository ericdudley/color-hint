import { GameSettings } from "./types";

export const MAX_PLAYERS = 8;

export const ROWS = 15;
export const COLUMNS = 25;

export const COLOR_OPTIONS_COUNT = 3;

export const DEFAULT_GAMES_SETTINGS: GameSettings = {
  guessesPerHintRound: 1,
  hintsPerPlayerRound: 3,
  rounds: 3,
};
