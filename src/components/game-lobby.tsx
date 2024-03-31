import { ICON_NAME_TO_ICON, playerSettings } from "@/utils/player-settings";
import Link from "next/link";
import { ReactElement } from "react";
import { GiPaintBrush } from "react-icons/gi";
import { MdCopyAll, MdLink } from "react-icons/md";
import CenteredLayout from "./centered-layout";
import { useGameContext } from "./game-view";
import { useRouter } from "next/navigation";
import { observer } from "mobx-react-lite";
import PlayerCard from "./player-card";
import PlayerSettingsForm from "./player-settings-form";
import { MAX_PLAYERS } from "@/constants";

const LobbyCodeCopyButton = observer(function LobbyCodeCopyButton() {
  const { lobbyCode } = useGameContext();

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        className="input"
        value={lobbyCode}
        onFocus={(e) => e.target.select()}
        readOnly
      />
      <button
        className="btn btn-ghost"
        onClick={() => navigator.clipboard.writeText(lobbyCode)}
      >
        Copy Lobby Code
        <MdCopyAll className="w-6 h-6" />
      </button>
      <button
        className="btn btn-ghost"
        onClick={() => navigator.clipboard.writeText(window.location.href)}
      >
        Copy Lobby Link
        <MdLink className="w-6 h-6" />
      </button>
    </div>
  );
});

export default observer(function GameLobby(): ReactElement {
  const { gameClient, gameServer } = useGameContext();
  const { replace } = useRouter();
  return (
    <CenteredLayout>
      <button
        className="btn btn-neutral"
        onClick={() => {
          gameClient.leaveGame();
          replace("/");
        }}
      >
        Leave Game
      </button>
      <div className="flex gap-2 justify-between items-center">
        <h1 className="text-4xl font-bold">Game Lobby</h1>
      </div>

      <LobbyCodeCopyButton />

      <PlayerSettingsForm
        onSave={() => {
          gameClient.updatePlayer();
        }}
      />

      <div className="flex items-center gap-4 justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          Players
          <span className="badge badge-primary">
            {gameClient.gameState.players.length} / {MAX_PLAYERS}
          </span>
        </h2>
        {gameClient.gameState.players.length >= 1 && playerSettings.isHost && (
          <button
            className="btn btn-primary"
            onClick={() => gameClient.startGame()}
          >
            Start Game
          </button>
        )}
      </div>
      <div className="flex items-end">
        <p>{
            playerSettings.isHost ? "Waiting for other players to join" : "Waiting for host to start the game"
          }</p>
        <div className="loading loading-dots loading-xs" />
      </div>
      {gameClient.gameState.players.map((player) => (
        <PlayerCard key={player.id} player={player} />
      ))}
    </CenteredLayout>
  );
});
