import { Player } from "@/types";
import { ICON_NAME_TO_ICON, playerSettings } from "@/utils/player-settings";
import { observer } from "mobx-react-lite";
import { ReactElement } from "react";
import { GiPaintBrush } from "react-icons/gi";

export default observer(function PlayerCard({
  player,
}: {
  player: Player;
}): ReactElement {
  const IconComponent = player.icon
    ? ICON_NAME_TO_ICON[player.icon] ?? GiPaintBrush
    : GiPaintBrush;

  return (
    <div
      key={player.id}
      className="flex items-center gap-4 bg-base-100 p-4 rounded-lg"
    >
      <div className="avatar bg-black p-4 rounded-full">
        <IconComponent className="w-8 h-8" style={{ color: player.color }} />
      </div>
      <div>
        <h3 className="font-bold text-2xl">{player.name}</h3>
        <div className="flex items-center gap-2">
          {player.isHost && <span className="badge badge-primary">Host</span>}
          {player.id === playerSettings.id && (
            <span className="badge badge-secondary">You</span>
          )}
        </div>
      </div>
    </div>
  );
});
