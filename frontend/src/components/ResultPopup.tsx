import React from 'react';

type Turn = 0 | 1;
type Winner = Turn | 'Draw' | null;

interface ResultPopupProps {
  winner: Winner;
  board: number[];
  onRestart: () => void;
  onClose: () => void;
  playerColor?: Turn;
  gameMode?: 'ai' | 'human';
}

export const ResultPopup: React.FC<ResultPopupProps> = ({ winner, board, onRestart, onClose, playerColor = 0, gameMode = 'ai' }) => {
  if (winner === null) return null;

  const rawBlackCount = board.filter((c) => c === 0).length;
  const rawWhiteCount = board.filter((c) => c === 1).length;
  const emptyCount = board.filter((c) => c === -1).length;

  let finalBlackCount = rawBlackCount;
  let finalWhiteCount = rawWhiteCount;
  let resultMessage = '';

  if (winner === 'Draw') {
    resultMessage = 'Draw!';
    // Split empty cells
    const split = Math.floor(emptyCount / 2); // Should be even if board is even, but safety floor
    finalBlackCount += split;
    finalWhiteCount += split;
  } else if (winner === 0) {
    // Black Wins
    resultMessage = gameMode === 'human' ? 'Black Wins!' : (playerColor === 0 ? 'You Win!' : 'AI Wins!');
    finalBlackCount += emptyCount;
  } else {
    // White Wins
    resultMessage = gameMode === 'human' ? 'White Wins!' : (playerColor === 1 ? 'You Win!' : 'AI Wins!');
    finalWhiteCount += emptyCount;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
    >
      <div
        className="p-12 rounded-3xl bg-neumorphism-base shadow-2xl flex flex-col items-center gap-8 transform scale-100 animate-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-5xl font-extrabold text-neumorphism-accent mb-2 tracking-wide">
          {resultMessage}
        </h2>

        <div className="flex items-center gap-8 text-neumorphism-text">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-gray-900 shadow-lg border-2 border-gray-700"></div>
            <span className="text-5xl font-bold">{finalBlackCount}</span>
          </div>

          <div className="text-5xl font-light text-gray-400 opacity-50 px-2">-</div>

          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-gray-100 shadow-lg border-2 border-white"></div>
            <span className="text-5xl font-bold">{finalWhiteCount}</span>
          </div>
        </div>

        <div className="flex flex-row gap-4 mt-4">
          <button
            onClick={onClose}
            className="px-8 py-3 text-lg font-bold rounded-2xl text-neumorphism-text bg-neumorphism-base shadow-neumorphism-flat hover:shadow-neumorphism-pressed active:scale-95 transition-all duration-200"
          >
            Close
          </button>

          <button
            onClick={onRestart}
            className="px-10 py-3 text-lg font-bold rounded-2xl text-white bg-blue-500 shadow-lg hover:bg-blue-600 hover:shadow-xl active:scale-95 transition-all duration-200"
          >
            New Game
          </button>
        </div>
      </div>
    </div>
  );
};
