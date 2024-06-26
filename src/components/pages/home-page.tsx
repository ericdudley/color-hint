"use client";

import Background from "@/components/background";
import GameSettingsForm from "@/components/game-settings-form";
import Input from "@/components/input";
import PlayerSettingsForm from "@/components/player-settings-form";
import { GameSettings } from "@/types";
import { playerSettings } from "@/utils/player-settings";
import { generateLobbyCode } from "@/utils/uuid";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MdAddCircle, MdArrowRight } from "react-icons/md";
import CenteredLayout from "../centered-layout";
import { DEFAULT_GAMES_SETTINGS } from "@/constants";

export default observer(function HomePage() {
  const router = useRouter();
  const [gameSettings, setGameSettings] = useState<GameSettings>(DEFAULT_GAMES_SETTINGS);

  const [joinLobbyCode, setJoinLobbyCode] = useState<string>("");

  const createGame = () => {
    playerSettings.setIsHost(true);
    router.push(`/game/${generateLobbyCode()}`);
  };

  const joinGame = () => {
    playerSettings.setIsHost(false);
    router.push(`/game/${joinLobbyCode}`);
  };

  return (
    <CenteredLayout>
      <div className="flex flex-col gap-4">
        <h1 className="text-8xl font-bold text-center">Color Hint</h1>
        <p>
          A color guessing game where everyone gets a turn to give hints while
          the others guess the color they&apos;re describing.
        </p>
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="flex-1">
          <PlayerSettingsForm />
        </div>
        <div className="flex-1 flex flex-col gap-8">
          <div className="flex gap-4 items-end">
            <Input
              className="flex-1"
              label="Lobby Code"
              type="text"
              placeholder="Lobby Code"
              value={joinLobbyCode}
              onChange={(e) => setJoinLobbyCode(e.target.value)}
            />
            <button
              className="btn btn-primary"
              onClick={joinGame}
              disabled={!playerSettings.isReady}
            >
              <span>Join Existing Game</span>
              <MdArrowRight className="w-8 h-8" />
            </button>
          </div>

          <button
            className="btn btn-primary mt-4"
            onClick={createGame}
            disabled={!playerSettings.isReady}
          >
            <span>Create New Game</span>
            <MdAddCircle className="w-8 h-8" />
          </button>
          <GameSettingsForm
            gameSettings={gameSettings}
            onChange={(gameSettings) => setGameSettings(gameSettings)}
          />
        </div>
      </div>
    </CenteredLayout>
  );
});
