/**
 *
 * @param maxTiles
 * @param minSize
 * @returns n, m, tileSize to fit the screen
 */
export function calculateGridSize(maxTiles: number, minSize = 0) {
  const { innerWidth, innerHeight } =
    typeof window === "undefined"
      ? { innerWidth: 100, innerHeight: 100 }
      : window;
  const tileSize = Math.max(
    minSize,
    Math.min(innerWidth / maxTiles, innerHeight / maxTiles),
  );
  const n = Math.floor(innerHeight / tileSize);
  const m = Math.floor(innerWidth / tileSize);
  return { n, m, tileSize };
}

export function generateColorGrid(
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
      let lightness = 40;

      row.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    }
    grid.push(row);
  }
  return grid;
}
