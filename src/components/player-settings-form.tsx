import { useState } from "react";
import { ReactElement } from "react";
import { MdPerson, MdSettings } from "react-icons/md";
import PlayerSettings, { playerSettings } from "@/utils/player-settings";
import Input from "./input";
import { observer } from "mobx-react-lite";

export default observer(function PlayerSettingsForm(): ReactElement {
  return (
    <div className="collapse collapse-arrow">
      <input type="checkbox" name="player-settings" defaultChecked />
      <div className="collapse-title flex flex-row items-center gap-4">
        <MdPerson className="w-8 h-8" />
        <h2 className="text-2xl font-bold">Player Settings</h2>
      </div>
      <div className="flex flex-col gap-4 collapse-content">
        <Input
          type="text"
          placeholder="Name"
          value={playerSettings.name}
          onChange={(e) => playerSettings.setName(e.target.value)}
          label="Name"
          subtitle={playerSettings.name ? "" : "Name is required to play"}
        />
      </div>
    </div>
  );
});
