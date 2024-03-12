"use client";

import { useEffect, useState } from "react";
import { MdSettings } from "react-icons/md";

/**
 *
 * @param maxTiles
 * @param minSize
 * @returns n, m, tileSize to fit the screen
 */
function calculateGridSize(maxTiles: number, minSize: number) {
  const { innerWidth, innerHeight } = window;
  const tileSize = Math.max(
    minSize,
    Math.min(innerWidth / maxTiles, innerHeight / maxTiles),
  );
  const n = Math.floor(innerHeight / tileSize);
  const m = Math.floor(innerWidth / tileSize);
  return { n, m, tileSize };
}


function generateColorGrid(
  n: number,
  m: number,
  angleoff: number,
): string[][] {
  const grid: string[][] = [];
  const centerX = (n - 1) / 2;
  const centerY = (m - 1) / 2;
  // const maxRadius = Math.sqrt(centerX ** 2 + centerY ** 2);

  for (let i = 0; i < n; i++) {
    const row: string[] = [];
    for (let j = 0; j < m; j++) {
      // Calculate radial coordinates
      const dx = i - centerX;
      const dy = j - centerY;
      const angle = Math.atan2(dy, dx) * (180 / Math.PI) + angleoff; // Normalize to [0, 360]
      // const distance = Math.sqrt(dx ** 2 + dy ** 2);
      const hue = Math.floor(angle % 360);

      // USE THIS FOR THE GAME
      // let saturation = 80; 
      // let lightness = 60;
      let saturation = 20;
      let lightness = 10;

      row.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    }
    grid.push(row);
  }
  return grid;
}
function ColorGrid() {
  const { n, m, tileSize } = calculateGridSize(24, 45);
  const [hue, setHue] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setHue((hue) => (hue + 5) % 360);
    }, 64);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-base-100">
      {generateColorGrid(n, m, hue).map((row, i) => (
        <div className="flex flex-row">
          {row.map((color, j) => (
            <div
              key={j}
              style={{
                aspectRatio: "1/1",
                width: `${tileSize}px`,
                height: `${tileSize}px`,
              }}
            >
              <div
                className="w-full h-full transition-all hover:scale-[2.0] hover:border-2 hover:border-black"
                style={{ backgroundColor: color }}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-between p-8"
      data-theme="dark"
    >
      <ColorGrid />

      <div className="z-10 max-w-xl flex flex-col gap-8">
        <h1 className="text-8xl font-bold text-center">Color Hint</h1>
        <p>
          A color guessing game where everyone gets a turn to give hints while
          the others guess the color they're describing.
        </p>
        <div>
          <div className="flex flex-row items-center gap-4">
            <MdSettings className="w-8 h-8" />
            <h2 className="text-4xl font-bold">Settings</h2>
          </div>
          <div className="flex flex-col gap-4">
            <div className="form-control">
              <div className="label">
                <span className="label-text">Rounds</span>
              </div>
              <input
                type="number"
                placeholder="Rounds"
                min="1"
                max="10"
                className="input"
              />
            </div>
            <div className="form-control">
              <div className="label">
                <span className="label-text">Hints per Round</span>
              </div>
              <input
                type="number"
                placeholder="Hints per Round"
                min="1"
                max="10"
                className="input"
              />
            </div>
            <div className="form-control">
              <div className="label">
                <span className="label-text">Guesses per Round</span>
              </div>
              <input
                type="number"
                placeholder="Guesses per Round"
                min="1"
                max="10"
                className="input"
              />
            </div>
            <button className="btn btn-lg mt-4">
              Create Lobby
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
