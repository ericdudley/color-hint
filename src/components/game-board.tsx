"use client";

import { playerSettings } from "@/utils/player-settings";
import { useGameContext } from "./game-view";
import { useRouter } from "next/navigation";
import { observer } from "mobx-react-lite";
import ColorGrid from "./color-grid";
import { ReactElement, useEffect, useRef, useState } from "react";
import PlayerCard from "./player-card";
import { MdLink } from "react-icons/md";
import {
  currentGuessesSelector,
  currentHinterSelector,
  currentPlayerRoundGuessesSelector,
  currentRoundColorSelector,
  currentRoundHintSelector,
  currentRoundHintsSelector,
  hintRoundVisibleSelectionsSelector,
  roundIsReadyToEndSelector,
} from "@/utils/game-server";
import { generateColorGrid } from "@/utils";
import { COLOR_OPTIONS_COUNT, COLUMNS, ROWS } from "@/constants";
import { GridColor } from "@/types";
import Input from "./input";

export default observer(function GameBoard() {
  const { replace } = useRouter();
  const { gameClient } = useGameContext();
  const gridWrapperRef = useRef<HTMLDivElement>(null);

  const isHinter =
    currentHinterSelector(gameClient.gameState)?.id === playerSettings.id;
  const currentColor = currentRoundColorSelector(gameClient.gameState);

  const onGridClick = (color: GridColor) => {
    if (!isHinter) {
      gameClient.chooseGuess(color);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-4">
          <h1 className="text-4xl font-bold">Color Hint</h1>
          <p className="text-xl">Playing as {playerSettings.name}</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            className="btn btn-ghost"
            onClick={() => navigator.clipboard.writeText(window.location.href)}
          >
            Copy Lobby Link
            <MdLink className="w-6 h-6" />
          </button>
          {playerSettings.isHost ? (
            <button
              className="btn btn-primary"
              onClick={() => {
                gameClient.endGame();
              }}
            >
              End Game
            </button>
          ) : (
            <button
              className="btn btn-neutral"
              onClick={() => {
                gameClient.leaveGame();
                replace("/");
              }}
            >
              Leave Game
            </button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 flex-1">
        <div className="flex flex-col gap-8 p-8 bg-base-200">
          <GameStatusView />
          <PlayerList />
        </div>
        <div className="col-span-2 p-8" ref={gridWrapperRef}>
          <pre>{JSON.stringify(gameClient.gameState, null, 2)}</pre>
          <ColorGrid
            parentRef={gridWrapperRef}
            selections={
              hintRoundVisibleSelectionsSelector(
              gameClient.gameState,
            )}
            onClick={onGridClick}
          />
        </div>
      </div>
    </div>
  );
});

function GameStatusView(): ReactElement {
  const { gameClient } = useGameContext();
  const isHinter =
    currentHinterSelector(gameClient.gameState)?.id === playerSettings.id;

  return (
    <div className="flex flex-col gap-8">
      {isHinter ? <HinterView /> : <GuesserView />}
      <HintsList />
    </div>
  );
}

function HinterView(): ReactElement {
  const { gameClient } = useGameContext();
  const currentColor = currentRoundColorSelector(gameClient.gameState);
  const currentHint = currentRoundHintSelector(gameClient.gameState);
  const canEndRound = roundIsReadyToEndSelector(gameClient.gameState);

  const colorGrid = generateColorGrid(ROWS, COLUMNS, 0);

  const [colorOptions, setColorOptions] = useState<GridColor[]>([]);
  const [hint, setHint] = useState("");

  useEffect(() => {
    if (colorOptions.length > 0) {
      return;
    }
    for (let i = 0; i < COLOR_OPTIONS_COUNT; i++) {
      colorOptions[i] = {
        x: Math.floor(Math.random() * COLUMNS),
        y: Math.floor(Math.random() * ROWS),
      };
      setColorOptions([...colorOptions]);
    }
  }, [gameClient.gameState.currentRound, colorOptions]);

  return (
    <div>
      <h2 className="text-2xl font-bold">Your are the hinter</h2>
      {canEndRound && (
        <button
          className="btn btn-primary"
          onClick={() => {
            gameClient.endHintRound();
          }}
        >
          End Round
        </button>
      )}
      {currentColor ? (
        currentHint ? (
          <WaitingView text="Waiting for players to guess" />
        ) : (
          <div className="flex flex-col gap-2">
            <Input
              label="Enter a hint"
              value={hint}
              onChange={(e) => setHint(e.target.value)}
              onSubmit={() => {
                gameClient.chooseHint(hint);
              }}
            />
            <button
              className="btn btn-primary"
              onClick={() => {
                gameClient.chooseHint(hint);
              }}
            >
              Submit Hint
            </button>
          </div>
        )
      ) : (
        <div className="flex flex-col gap-2">
          <p>Choose a color for the other players to guess</p>
          <div className="flex items-center gap-2">
            {colorOptions.map((color, i) => (
              <div
                key={i}
                className="w-16 h-16 transition-all hover:scale-[1.5] cursor-pointer border-black hover:border-2 hover:border-black"
                style={{ backgroundColor: colorGrid[color.y][color.x] }}
                onClick={() => {
                  gameClient.chooseColor(color);
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function GuesserView(): ReactElement {
  const { gameClient } = useGameContext();
  const currentColor = currentRoundColorSelector(gameClient.gameState);
  const currentHint = currentRoundHintSelector(gameClient.gameState);
  const currentGuesses = currentGuessesSelector(gameClient.gameState);

  if (!currentColor) {
    return <WaitingView text="Waiting for the hinter to choose a color" />;
  }

  if (!currentHint) {
    return <WaitingView text="Waiting for the hinter to give a hint" />;
  }

  if (
    currentGuesses.length >= gameClient.gameState.settings.guessesPerHintRound
  ) {
    return <WaitingView text="Waiting for other players to guess" />;
  }

  return (
    <div>
      <p>
        Select the color you think the hinter is hinting at by clicking on the
        color grid
      </p>
    </div>
  );
}

function PlayerList(): ReactElement {
  const { gameClient } = useGameContext();

  return (
    <div>
      <h2 className="text-2xl font-bold flex items-center gap-2">Players</h2>
      {gameClient.gameState.players.map((player) => (
        <PlayerCard key={player.id} player={player} />
      ))}
    </div>
  );
}

function WaitingView({ text }: { text: string }): ReactElement {
  return (
    <div className="flex flex-col items-center gap-2">
      <h1 className="text-2xl">{text}</h1>
      <div className="loading loading-dots loading-lg" />
    </div>
  );
}

function HintsList(): ReactElement {
  const { gameClient } = useGameContext();
  const currentHints = currentRoundHintsSelector(gameClient.gameState);
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-2xl font-bold">
        Hints ({currentHints.filter(Boolean).length}/
        {gameClient.gameState.settings.hintsPerPlayerRound})
      </h2>
      <div className="flex items-center gap-2">
        {currentHints.length === 0 && (
          <p>No hints have been given yet this round</p>
        )}
        {currentHints.filter(Boolean).map((hint, i) => (
          <p
            key={i}
            className="text-lg bg-primary text-primary-content p-2 rounded-lg"
          >
            {hint}
          </p>
        ))}
      </div>
    </div>
  );
}
