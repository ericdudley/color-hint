import { COLUMNS, ROWS } from "@/constants";
import { GridColor } from "@/types";
import { calculateGridSize, generateColorGrid } from "@/utils";
import clsx from "clsx";
import { ReactElement, useEffect, useState } from "react";

export default function ColorGrid({
  parentRef,
  selectedColors = [],
  onClick,
}: {
  parentRef: React.RefObject<HTMLDivElement>;
  selectedColors?: GridColor[];
  onClick?: (color: GridColor) => void;
}): ReactElement {
  const parentRefSize = parentRef.current?.getBoundingClientRect();
  const [tileSize, setTileSize] = useState(0);
  useEffect(() => {
    if (parentRef.current === null) return;
    const parentRefLocal = parentRef.current;

    const handleResize = (entries: ResizeObserverEntry[]) => {
      for (let entry of entries) {
        console.log("entry", entry.contentRect);
        const newSize = calculateGridSize(ROWS, COLUMNS, entry.contentRect);
        console.log("newSize", newSize);
        setTileSize(newSize);
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);

    resizeObserver.observe(parentRefLocal);

    return () => resizeObserver.unobserve(parentRefLocal);
  }, [parentRef]);

  return generateColorGrid(ROWS, COLUMNS, 0).map((row, i) => (
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
            className={clsx(
              "w-full h-full transition-all hover:scale-[2.0] border hover:border-black rounded-md cursor-pointer",

              selectedColors.some(
                (selectedColor) =>
                  selectedColor.x === j && selectedColor.y === i,
              )
                ? "border-black border-4 scale-125"
                : "border-black",
            )}
            style={{ backgroundColor: color }}
            onClick={() => onClick?.({ x: j, y: i })}
          />
        </div>
      ))}
    </div>
  ));
}
