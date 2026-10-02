import React from "react";
import type { Board, Cell } from "./logic";

export const OTHELLO_COLORS = {
  felt: "#1E6B45",
  frame: "#0B2A1C",
  line: "rgba(0,0,0,0.4)",
  star: "rgba(0,0,0,0.55)",
  black: "radial-gradient(circle at 35% 30%, #4a4a4a, #0b0b0b 70%)",
  white: "radial-gradient(circle at 35% 30%, #ffffff, #d8d8d8 70%)",
  highlight: "#F5B544",
};

export type DiscProps = {
  color: Cell;
  /** 全体の大きさ（置いたときの弾み） */
  scale?: number;
  /** 横幅（裏返るときに 1→0→1） */
  scaleX?: number;
  cellSize?: number;
};

export const Disc: React.FC<DiscProps> = ({
  color,
  scale = 1,
  scaleX = 1,
  cellSize = 76,
}) =>
  color === 0 ? null : (
    <div
      style={{
        position: "absolute",
        inset: cellSize * 0.105,
        borderRadius: "50%",
        background: color === 1 ? OTHELLO_COLORS.black : OTHELLO_COLORS.white,
        boxShadow: `0 ${cellSize * 0.053}px ${cellSize * 0.105}px rgba(0,0,0,0.45)`,
        transform: `scale(${scale}) scaleX(${scaleX})`,
      }}
    />
  );

export type OthelloBoardProps = {
  board: Board;
  /** 1マスの大きさ(px)。盤全体は約 cellSize × 8.3 */
  cellSize?: number;
  /** 光る輪で示すマス（次の一手など）。opacity で点滅させられる */
  highlight?: { x: number; y: number; opacity?: number } | null;
  /** マスごとに石の見た目を上書きする（アニメーション用。moveAnimation の戻り値をそのまま渡せる） */
  discProps?: (x: number, y: number) => Partial<DiscProps> | undefined;
  onCellClick?: (x: number, y: number) => void;
  style?: React.CSSProperties;
};

const STARS = [
  [2, 2],
  [6, 2],
  [2, 6],
  [6, 6],
];

export const OthelloBoard: React.FC<OthelloBoardProps> = ({
  board,
  cellSize = 76,
  highlight,
  discProps,
  onCellClick,
  style,
}) => {
  const pad = Math.round(cellSize * 0.158);
  const star = cellSize * 0.158;
  return (
    <div
      style={{
        width: cellSize * 8 + pad * 2,
        height: cellSize * 8 + pad * 2,
        padding: pad,
        boxSizing: "border-box",
        borderRadius: cellSize * 0.184,
        background: OTHELLO_COLORS.frame,
        boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
        ...style,
      }}
    >
      <div
        style={{
          position: "relative",
          width: cellSize * 8,
          height: cellSize * 8,
          background: OTHELLO_COLORS.felt,
        }}
      >
        {board.map((row, y) =>
          row.map((cell, x) => {
            const isHighlight = highlight && highlight.x === x && highlight.y === y;
            return (
              <div
                key={`${x}-${y}`}
                onClick={onCellClick ? () => onCellClick(x, y) : undefined}
                onKeyDown={
                  onCellClick
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onCellClick(x, y);
                        }
                      }
                    : undefined
                }
                role={onCellClick ? "button" : undefined}
                tabIndex={onCellClick ? 0 : undefined}
                aria-label={onCellClick ? `${"abcdefgh"[x]}${y + 1}` : undefined}
                style={{
                  position: "absolute",
                  left: x * cellSize,
                  top: y * cellSize,
                  width: cellSize,
                  height: cellSize,
                  boxSizing: "border-box",
                  border: `1px solid ${OTHELLO_COLORS.line}`,
                  cursor: onCellClick ? "pointer" : undefined,
                }}
              >
                {isHighlight && (
                  <div
                    style={{
                      position: "absolute",
                      inset: cellSize * 0.13,
                      borderRadius: "50%",
                      border: `${cellSize * 0.053}px solid ${OTHELLO_COLORS.highlight}`,
                      opacity: highlight.opacity ?? 1,
                    }}
                  />
                )}
                <Disc color={cell} cellSize={cellSize} {...discProps?.(x, y)} />
              </div>
            );
          }),
        )}
        {STARS.map(([sx, sy]) => (
          <div
            key={`${sx}-${sy}`}
            style={{
              position: "absolute",
              left: sx * cellSize - star / 2,
              top: sy * cellSize - star / 2,
              width: star,
              height: star,
              borderRadius: "50%",
              background: OTHELLO_COLORS.star,
              pointerEvents: "none",
            }}
          />
        ))}
      </div>
    </div>
  );
};
