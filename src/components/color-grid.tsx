import { COLUMNS, ROWS } from "@/constants";
import { GridColor, GridSelection, Player } from "@/types";
import { calculateGridSize, generateColorGrid } from "@/utils";
import { ICON_NAME_TO_ICON } from "@/utils/player-settings";
import clsx from "clsx";
import React, { Fragment, ReactElement, useEffect, useState } from "react";

export default function ColorGrid({
  parentRef,
  selections = [],
  onClick,
}: {
  parentRef: React.RefObject<HTMLDivElement>;
  selections?: GridSelection[];
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

  return (
    <React.Fragment>
      {generateColorGrid(ROWS, COLUMNS, 0).map((row, i) => (
        <div className="flex flex-row" key={`${Math.random()}`}>
          {row.map((color, j) => {
            const tileSelections = selections.filter(
              (selection) =>
                selection.gridColor.x === j && selection.gridColor.y === i,
            );

            const isChosenColor = tileSelections.some(
              (selection) => selection.isChosenColor,
            );

            return (
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
                    "w-full h-full transition-all hover:scale-[2.0] border hover:border-black rounded-md cursor-pointer group",

                    tileSelections.length > 0
                      ? isChosenColor
                        ? "border-white border-4 scale-150 tooltip tooltip-open"
                        : "border-black border-2 scale-125"
                      : "border-black",
                  )}
                  data-tip={isChosenColor ? "Chosen Color" : ""}
                  style={{
                    backgroundColor: color,
                    ...getSquareGridStyles(tileSelections.length),
                  }}
                  onClick={() => onClick?.({ x: j, y: i })}
                >
                  {tileSelections.map((selection, i) => {
                    const Icon = selection.player?.icon
                      ? ICON_NAME_TO_ICON[selection.player?.icon]
                      : Fragment;
                    const color = selection.player?.color || "black";
                    return (
                      <Icon
                        key={i}
                        className="p-1 w-full opacity-25 h-full group-hover:opacity-0"
                        style={{ color: color }}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </React.Fragment>
  );
}

function getSquareGridStyles(items: number) {
  const sideLength = Math.ceil(Math.sqrt(items));

  return {
    display: "grid",
    gridTemplateColumns: `repeat(${sideLength}, 1fr)`,
    gridTemplateRows: `repeat(${sideLength}, 1fr)`,
  };
}
