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

export default observer(function GameView({
  lobbyCode,
}: {
  lobbyCode: string;
}) {
  const {} = useRouter();
  const gameServerRef = useRef<GameServer | null>(null);
  const gameClientRef = useRef<GameClient | null>(null);

  useEffect(() => {
    if (playerSettings.isHost && !gameServerRef.current) {
      gameServerRef.current = createGameServer(lobbyCode);
    }

    if (!gameClientRef.current) {
      gameClientRef.current = createGameClient(lobbyCode);

      setTimeout(() => {
        gameClientRef.current?.joinGame();
      }, 1000);
    }
  }, []);

  if (!gameClientRef.current) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <GameContext.Provider
        value={{
          gameServer: gameServerRef.current,
          gameClient: gameClientRef.current,
          lobbyCode: lobbyCode,
        }}
      >
        <GameLobby />
      </GameContext.Provider>
    </div>
  );
});

const GameContext = createContext({
  gameServer: null as unknown as GameServer | null,
  gameClient: null as unknown as GameClient,
  lobbyCode: null as unknown as string,
});

export const useGameContext = () => useContext(GameContext);
