import { ICON_NAME_TO_ICON, playerSettings } from "@/utils/player-settings";
import Link from "next/link";
import { ReactElement } from "react";
import { GiPaintBrush } from "react-icons/gi";
import { MdCopyAll, MdLink } from "react-icons/md";
import CenteredLayout from "./centered-layout";
import { useGameContext } from "./game-view";
import { useRouter } from "next/navigation";
import { observer } from "mobx-react-lite";

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
        className="btn btn-primary"
        onClick={() => navigator.clipboard.writeText(lobbyCode)}
      >
        Copy Lobby Code
        <MdCopyAll className="w-6 h-6" />
      </button>
      <button
        className="btn btn-secondary"
        onClick={() => navigator.clipboard.writeText(window.location.href)}
      >
        Copy Lobby Link
        <MdLink className="w-6 h-6" />
      </button>
    </div>
  );
});

export default observer(function GameLobby(): ReactElement {
  const { gameClient } = useGameContext();
  const { replace } = useRouter();
  return (
    <CenteredLayout>
      <button
        className="btn btn-secondary"
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

      <div className="flex items-center gap-4 justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          Players
          <span className="badge badge-primary">
            {gameClient.players.length}
          </span>
        </h2>
        {gameClient.players.length >= 1 && playerSettings.isHost && (
          <button className="btn btn-primary">Start Game</button>
        )}
      </div>
      <div className="flex items-center gap-4">
        <div className="loading" />
        <p>Waiting for players to join...</p>
      </div>
      {gameClient.players.map((player) => {
        const IconComponent = player.icon ? ICON_NAME_TO_ICON[player.icon] ?? GiPaintBrush : GiPaintBrush;
        return (
          <div
            key={player.id}
            className="flex items-center gap-4 bg-base-100 p-4 rounded-lg"
          >
            <div className="avatar bg-red-400 p-4 rounded-full">
              <IconComponent className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-bold text-2xl">{player.name}</h3>
              {player.isHost && (
                <span className="badge badge-primary">Host</span>
              )}
            </div>
          </div>
        );
      })}
    </CenteredLayout>
  );
});
