import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { OthelloBoard } from './othello/OthelloBoard';
import { useMoveAnimation } from './othello/useMoveAnimation';
import type { Board as Grid, Cell as GridCell, Move } from './othello/logic';

type CellValue = -1 | 0 | 1; // -1: Empty, 0: Black, 1: White

interface BoardProps {
  board: CellValue[];
  onCellClick: (index: number) => void;
  disabled?: boolean;
}

/** 長さ64の配列（-1=空, 0=黒, 1=白）を盤の部品の形式 board[y][x]（0=空, 1=黒, 2=白）にする */
export const toGrid = (cells: CellValue[]): Grid =>
  Array.from({ length: 8 }, (_, y) =>
    cells.slice(y * 8, y * 8 + 8).map((c) => (c + 1) as GridCell),
  );

/**
 * 前の盤と今の盤を比べて、直前に打たれた手を推定する。
 * 「空→石」になったマスがちょうど1つのときだけ手とみなす
 * （0個は盤が変わっていない、2個以上は保存した盤の復元など）。
 */
export const detectMove = (prev: CellValue[], next: CellValue[]): Move | null => {
  let placed = -1;
  for (let i = 0; i < next.length; i++) {
    if (prev[i] === -1 && next[i] !== -1) {
      if (placed !== -1) return null;
      placed = i;
    }
  }
  if (placed === -1) return null;
  return { x: placed % 8, y: Math.floor(placed / 8), color: next[placed] === 0 ? 1 : 2 };
};

// 盤全体の幅は cellSize×8 + ふち（cellSize×0.158 を四捨五入）×2。四捨五入で最大1px増える分を引いておく
const cellSizeFor = (width: number) => Math.floor((width - 1) / 8.316);

// 明るい背景（--shadow-neumorphism-flat と同じ光の向き）に合わせた外枠の影
const BOARD_SHADOW = '12px 12px 24px rgb(163 177 198 / 0.7), -12px -12px 24px rgb(255 255 255 / 0.6)';

export const Board: React.FC<BoardProps> = ({ board, onCellClick, disabled }) => {
  // 盤の部品は1マスの大きさを px で受け取るので、親の幅から決める
  const containerRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const width = el.clientWidth;
      setCellSize(width > 0 ? cellSizeFor(width) : null);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // 盤が変わったときだけ「直前の手」を作り直す（毎回作るとアニメーションが最初からやり直しになる）
  const [last, setLast] = useState<{ cells: CellValue[]; prev: Grid | null; move: Move | null }>({
    cells: board,
    prev: null,
    move: null,
  });
  if (last.cells !== board) {
    const move = detectMove(last.cells, board);
    setLast({ cells: board, prev: move ? toGrid(last.cells) : null, move });
  }

  const grid = useMemo(() => toGrid(board), [board]);
  const discProps = useMoveAnimation(last.prev, grid, last.move);

  return (
    <div ref={containerRef} className="w-full">
      {cellSize ? (
        <OthelloBoard
          board={grid}
          cellSize={cellSize}
          discProps={discProps}
          onCellClick={disabled ? undefined : (x, y) => onCellClick(y * 8 + x)}
          style={{ margin: '0 auto', boxShadow: BOARD_SHADOW }}
        />
      ) : (
        <div className="aspect-square" />
      )}
    </div>
  );
};
