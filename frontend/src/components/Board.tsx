import React from 'react';
import { Cell } from './Cell';

type CellValue = -1 | 0 | 1;

interface BoardProps {
  board: CellValue[];
  onCellClick: (index: number) => void;
  disabled?: boolean;
}

export const Board: React.FC<BoardProps> = ({ board, onCellClick, disabled }) => {
  return (
    <div className="p-4 sm:p-6 rounded-2xl bg-neumorphism-base shadow-neumorphism-flat">
      <div className="grid grid-cols-8 gap-2 or sm:gap-3 md:gap-4">
        {board.map((cellValue, index) => (
          <Cell
            key={index}
            value={cellValue}
            onClick={() => onCellClick(index)}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
};
