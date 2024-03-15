"use client";

import { playerSettings } from "@/utils/player-settings";
import { useGameContext } from "./game-view";
import { useRouter } from "next/navigation";
import { observer } from "mobx-react-lite";

export default observer(function GameBoard() {
  const { replace } = useRouter();
  const { gameClient } = useGameContext();

  return (
    <div>
      <h1>GameBoard</h1>
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
  );
});
