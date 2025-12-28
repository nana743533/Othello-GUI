'use client';

import { Board } from '@/components/Board';
import { PassPopup } from '@/components/PassPopup';
import { useOthello } from '@/hooks/useOthello';

export default function Home() {
  const {
    board,
    turn,
    isProcessing,
    winner,
    passPopup,
    acknowledgePass,
    executeMove,
    resetGame
  } = useOthello();

  const statusText = winner === null
    ? `Turn: ${turn === 0 ? 'Black' : 'White'}`
    : `Winner: ${winner === 'Draw' ? 'Draw' : winner === 0 ? 'Black' : 'White'}`;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-4 bg-neumorphism-base">
      <h1 className="text-4xl font-bold text-neumorphism-text">Othello GUI</h1>

      <div className="flex flex-col items-center gap-6">
        {/* Status Indicator */}
        <div className="flex items-center justify-between w-full px-6 py-3 rounded-xl shadow-neumorphism-flat">
          <div className="text-xl font-bold text-neumorphism-text">
            {statusText}
          </div>
          {isProcessing && (
            <div className="text-sm text-neumorphism-accent animate-pulse">
              AI Thinking...
            </div>
          )}
        </div>

        {/* Game Board */}
        <Board
          board={board}
          onCellClick={executeMove}
          disabled={isProcessing || winner !== null}
        />

        {/* Controls */}
        <button
          onClick={resetGame}
          className="px-6 py-2 font-bold transition-all duration-200 rounded-full text-neumorphism-text bg-neumorphism-base shadow-neumorphism-flat hover:shadow-neumorphism-pressed active:translate-y-0.5"
        >
          New Game
        </button>
      </div>

      {/* Pass Check Popup */}
      {passPopup && (
        <PassPopup passType={passPopup} onAcknowledge={acknowledgePass} />
      )}
    </div>
  );
}
