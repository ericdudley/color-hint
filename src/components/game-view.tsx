"use client";

import GameServer, {
  GameClient,
  createGameClient,
  createGameServer,
} from "@/utils/game-server";
import { playerSettings } from "@/utils/player-settings";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useRef } from "react";
import GameLobby from "./game-lobby";
import CenteredLayout from "./centered-layout";
import GameBoard from "./game-board";

const useGameServer = (lobbyCode: string) => {
  const gameServerRef = useRef<GameServer | null>(null);

  if (!gameServerRef.current) {
    gameServerRef.current = playerSettings.isHost
      ? createGameServer(lobbyCode)
      : null;
  }

  return gameServerRef.current;
};

const useGameClient = (lobbyCode: string, isGameServerReady: boolean) => {
  const gameClientRef = useRef<GameClient>();

  if (!gameClientRef.current && isGameServerReady) {
    gameClientRef.current = createGameClient(lobbyCode);
  }

  return gameClientRef.current;
};

export default observer(function GameView({
  lobbyCode,
}: {
  lobbyCode: string;
}) {
  const gameServer = useGameServer(lobbyCode);
  const gameClient = useGameClient(
    lobbyCode,
    gameServer?.isAttached || !playerSettings.isHost,
  );

  if ((!gameServer && playerSettings.isHost) || !gameClient) {
    return (
      <CenteredLayout>
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-2xl">
            {playerSettings.isHost ? "Creating game" : "Joining game"}
          </h1>
          <div className="loading loading-dots loading-lg" />
        </div>
      </CenteredLayout>
    );
  }

  return (
    <GameContext.Provider
      value={{
        gameServer,
        gameClient,
        lobbyCode: lobbyCode,
      }}
    >
      {gameClient.gameState.status === "lobby" ? <GameLobby /> : <GameBoard />}
    </GameContext.Provider>
  );
});

const GameContext = createContext({
  gameServer: null as unknown as GameServer | null,
  gameClient: null as unknown as GameClient,
  lobbyCode: null as unknown as string,
});

export const useGameContext = () => useContext(GameContext);
