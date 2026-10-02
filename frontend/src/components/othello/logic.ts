/** 0=空, 1=黒, 2=白 */
export type Cell = 0 | 1 | 2;
/** 盤は board[y][x]（x: a〜h = 0〜7, y: 1〜8 = 0〜7） */
export type Board = Cell[][];
export type Move = { x: number; y: number; color: 1 | 2 };

const DIRS = [
  [-1, -1], [0, -1], [1, -1],
  [-1, 0], [1, 0],
  [-1, 1], [0, 1], [1, 1],
];

const inside = (x: number, y: number) => x >= 0 && x < 8 && y >= 0 && y < 8;

export const emptyBoard = (): Board =>
  Array.from({ length: 8 }, () => Array<Cell>(8).fill(0));

/** 初期配置（d4・e5 が白、d5・e4 が黒） */
export const initialBoard = (): Board => {
  const b = emptyBoard();
  b[3][3] = 2;
  b[4][4] = 2;
  b[4][3] = 1;
  b[3][4] = 1;
  return b;
};

/** "x"=黒, "o"=白, それ以外=空 の8行から盤を作る */
export const parseBoard = (rows: string[]): Board => {
  if (rows.length !== 8 || rows.some((row) => row.length !== 8)) {
    throw new Error(
      `parseBoard: 8行×8文字で渡してください（受け取った行の長さ: ${rows.map((r) => r.length).join(", ")}）`,
    );
  }
  return rows.map((row) =>
    row.split("").map((ch) => (ch === "x" ? 1 : ch === "o" ? 2 : 0)),
  ) as Board;
};

/** 打った位置ではさんで返る石の座標 */
export const flipsFor = (board: Board, move: Move): [number, number][] => {
  const opp = move.color === 1 ? 2 : 1;
  const flips: [number, number][] = [];
  for (const [dx, dy] of DIRS) {
    const line: [number, number][] = [];
    let cx = move.x + dx;
    let cy = move.y + dy;
    while (inside(cx, cy) && board[cy][cx] === opp) {
      line.push([cx, cy]);
      cx += dx;
      cy += dy;
    }
    if (line.length && inside(cx, cy) && board[cy][cx] === move.color) {
      flips.push(...line);
    }
  }
  return flips;
};

export const isLegal = (board: Board, move: Move) =>
  board[move.y][move.x] === 0 && flipsFor(board, move).length > 0;

/** ルールどおりに打った後の盤（元の盤は変更しない） */
export const play = (board: Board, move: Move): Board => {
  const next = board.map((row) => [...row]) as Board;
  next[move.y][move.x] = move.color;
  for (const [x, y] of flipsFor(board, move)) next[y][x] = move.color;
  return next;
};
