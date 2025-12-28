import React from 'react';

type Turn = 0 | 1;
type Winner = Turn | 'Draw' | null;

interface ResultPopupProps {
  winner: Winner;
  board: number[];
  onRestart: () => void;
}

export const ResultPopup: React.FC<ResultPopupProps> = ({ winner, board, onRestart }) => {
  if (winner === null) return null;

  const blackCount = board.filter((c) => c === 0).length;
  const whiteCount = board.filter((c) => c === 1).length;

  let resultMessage = '';
  if (winner === 'Draw') {
    resultMessage = 'Draw!';
  } else if (winner === 0) {
    resultMessage = 'Black Wins!';
  } else {
    resultMessage = 'White Wins!';
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
    >
      <div
        className="p-10 rounded-3xl bg-neumorphism-base shadow-2xl flex flex-col items-center gap-6 transform scale-100 animate-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-4xl font-bold text-neumorphism-text mb-2">Game Over</h2>

        <div className="text-3xl font-extrabold text-neumorphism-accent">
          {resultMessage}
        </div>

        <div className="flex gap-12 text-xl font-bold text-neumorphism-text my-4">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-gray-800 shadow-md border-2 border-gray-700"></div>
            <span>{blackCount}</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-gray-100 shadow-md border-2 border-white"></div>
            <span>{whiteCount}</span>
          </div>
        </div>

        <button
          onClick={onRestart}
          className="px-8 py-4 text-lg font-bold rounded-xl text-white bg-blue-500 shadow-lg hover:bg-blue-600 hover:shadow-xl active:scale-95 transition-all duration-200"
        >
          New Game
        </button>
      </div>
    </div>
  );
};
