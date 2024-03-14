"use client";

import { calculateGridSize } from "@/utils";
import { useState } from "react";

export default function Background() {
  const { n, m, tileSize } = calculateGridSize(24);
  const [hue, _setHue] = useState(0);
  // useEffect(() => {
  //   let start: number;
  //   let animationFrameHandle: number;

  //   const step = (timestamp: number) => {
  //     if (start === undefined) {
  //       start = timestamp;
  //     }
  //     const elapsed = timestamp - start;

  //     if (elapsed > 64) {
  //       // 64ms have passed
  //       start = timestamp;
  //       setHue((hue) => (hue + 5) % 360);
  //     }

  //     animationFrameHandle = requestAnimationFrame(step);
  //   };

  //   animationFrameHandle = requestAnimationFrame(step);

  //   return () => cancelAnimationFrame(animationFrameHandle);
  // }, []);

  return (
    <div className="fixed inset-[-100%] flex flex-col items-center justify-center bg-gradient-conic animated-color-wheel" />
    // TODO Use this for the actual game
    /** {generateColorGrid(n, m, hue).map((row, i) => (
        <div className="flex flex-row" key={`${Math.random()}`}>
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
      ))} */
  );
}
