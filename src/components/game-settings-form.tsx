import { useState } from "react";
import { GameSettings } from "@/types";
import { ReactElement } from "react";
import { MdSettings } from "react-icons/md";
import { observer } from "mobx-react-lite";

export default observer(function GameSettingsForm({
  onChange,
  gameSettings,
}: {
  gameSettings: GameSettings;
  onChange: (gameSettings: GameSettings) => void;
}): ReactElement {
  const [settings, setSettings] = useState(gameSettings);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setSettings({
      ...settings,
      [name]: value,
    });
    onChange(settings);
  };

  return (
    <div className="collapse collapse-arrow">
      <input type="checkbox" name="game-settings" />
      <div className="collapse-title flex flex-row items-center gap-4">
        <MdSettings className="w-8 h-8" />
        <h2 className="text-2xl font-bold">New Game Settings</h2>
      </div>
      <div className="flex flex-col gap-4 collapse-content">
        <div className="form-control">
          <div className="label">
            <span className="label-text">Rounds</span>
          </div>
          <input
            type="number"
            name="rounds"
            placeholder="Rounds"
            min="1"
            max="10"
            className="input"
            value={settings.rounds}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-control">
          <div className="label">
            <span className="label-text">Hints per Round</span>
          </div>
          <input
            type="number"
            name="hintsPerPlayerRound"
            placeholder="Hints per Round"
            min="1"
            max="10"
            className="input"
            value={settings.hintsPerPlayerRound}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-control">
          <div className="label">
            <span className="label-text">Guesses per Round</span>
          </div>
          <input
            type="number"
            name="guessesPerPlayerRound"
            placeholder="Guesses per Round"
            min="1"
            max="10"
            className="input"
            value={settings.guessesPerPlayerRound}
            onChange={handleInputChange}
          />
        </div>
      </div>
    </div>
  );
});
