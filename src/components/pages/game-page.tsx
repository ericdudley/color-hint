import { playerSettings } from "@/utils/player-settings";
import { observer } from "mobx-react-lite";
import GameView from "../game-view";
import PlayerSettingsForm from "../player-settings-form";
import Background from "../background";
import { useState } from "react";
import CenteredLayout from "../centered-layout";

export default observer(function GamePage({
  lobbyCode,
}: {
  lobbyCode: string;
}) {
  const [wasNotReady, setWasNotReady] = useState(false);

  if (!playerSettings.isReady || wasNotReady) {
    if (!wasNotReady) {
      setWasNotReady(true);
    }

    return (
      <CenteredLayout>
        <div className="flex items-center justify-between gap-2">
          <h1 className="font-bold text-xl">Joining Game</h1>
          <span className="badge badge-primary badge-lg">{lobbyCode}</span>
        </div>
        <p>Please enter your name to join the game.</p>
        <PlayerSettingsForm />
        <button
          className="btn btn-primary"
          onClick={() => setWasNotReady(false)}
          disabled={!playerSettings.isReady}
        >
          Join game
        </button>
      </CenteredLayout>
    );
  }

  return <GameView lobbyCode={lobbyCode} />;
});
