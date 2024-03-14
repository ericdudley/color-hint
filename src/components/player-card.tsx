import { ICON_NAME_TO_ICON, type Player } from "@/utils/player-settings";
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
      <div
        className="avatar bg-black p-4 rounded-full"
        style={{ backgroundColor: player.color }}
      >
        <IconComponent className="w-8 h-8" />
      </div>
      <div>
        <h3 className="font-bold text-2xl">{player.name}</h3>
        {player.isHost && <span className="badge badge-primary">Host</span>}
      </div>
    </div>
  );
});
