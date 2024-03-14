import {
  IconName,
  IconNames,
  playerSettings,
} from "@/utils/player-settings";
import { capitalCase } from "change-case";
import { observer } from "mobx-react-lite";
import { ReactElement } from "react";
import { MdPerson } from "react-icons/md";
import Input from "./input";
import PlayerCard from "./player-card";

export default observer(function PlayerSettingsForm(): ReactElement {
  return (
    <div className="collapse collapse-arrow">
      <input type="checkbox" name="player-settings" defaultChecked />
      <div className="collapse-title flex flex-row items-center gap-4">
        <MdPerson className="w-8 h-8" />
        <h2 className="text-2xl font-bold">Player Settings</h2>
      </div>
      <div className="flex flex-col gap-4 collapse-content">
        <PlayerCard player={playerSettings.player} />
        <Input
          type="text"
          placeholder="Name"
          value={playerSettings.name}
          onChange={(e) => playerSettings.setName(e.target.value)}
          label="Name"
          subtitle={playerSettings.name ? "" : "Name is required to play"}
        />
        <div className="form-control">
          <div className="label">
            <span className="label-text">Icon</span>
          </div>
          <select
            className="select"
            value={playerSettings.icon}
            onChange={(e) => playerSettings.setIcon(e.target.value as IconName)}
          >
            {IconNames.map((iconName) => (
              <option key={iconName} value={iconName}>
                {capitalCase(iconName)}
              </option>
            ))}
          </select>
        </div>
        <div className="form-control">
          <div className="label">
            <span className="label-text">Color</span>
          </div>
          <input
            type="color"
            value={playerSettings.color}
            onChange={(e) => playerSettings.setColor(e.target.value)}
            className="input w-full"
          />
        </div>
      </div>
    </div>
  );
});
