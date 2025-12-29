'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, Suspense, useState } from 'react';

import { Board } from '@/components/Board';
import { PassPopup } from '@/components/PassPopup';
import { ResultPopup } from '@/components/ResultPopup';
import { useOthello } from '@/hooks/useOthello';

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neumorphism-base flex items-center justify-center text-neumorphism-text">Loading...</div>}>
      <GameContent />
    </Suspense>
  );
}

function GameContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const playerParam = searchParams.get('player');

  // Validate player param and redirect if invalid
  useEffect(() => {
    if (playerParam !== 'black' && playerParam !== 'white') {
      router.replace('/newgame');
    }
  }, [playerParam, router]);

  // Determine player color (0: Black, 1: White)
  // If param is invalid/loading, default to 0 to prevent crashes, but effect will redirect.
  const playerColor = playerParam === 'white' ? 1 : 0;

  const [showResult, setShowResult] = useState(false);

  const {
    board,
    turn,
    isProcessing,
    winner,
    passPopup,
    acknowledgePass,
    executeMove,
    resetGame,
    isStateLoaded
  } = useOthello(playerColor); // Pass player color

  const blackCount = board.filter((c) => c === 0).length;
  const whiteCount = board.filter((c) => c === 1).length;

  // Handles "New Game" -> go back to selection
  const handleNewGame = () => {
    router.push('/newgame');
  };

  // Show result popup when winner is decided
  useEffect(() => {
    if (winner !== null) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setShowResult(true);
    }
  }, [winner]);

  // Determine status text & style
  let statusDisplay = '';
  let statusColor = 'text-neumorphism-text';

  if (winner !== null) {
    if (winner === 'Draw') statusDisplay = 'Draw';
    else if (winner === playerColor) statusDisplay = 'You Win!';
    else statusDisplay = 'AI Wins!';
  } else {
    // If not game over
    if (turn === playerColor) {
      statusDisplay = 'Your Turn';
    } else {
      // AI Turn
      statusDisplay = 'AI Thinking...';
      statusColor = 'text-neumorphism-accent';
    }
  }

  // Dynamic Labels
  const blackLabel = playerColor === 0 ? 'You' : 'AI';
  const whiteLabel = playerColor === 1 ? 'You' : 'AI';

  // Avoid rendering game while checking param or loading state to prevent flash
  if (playerParam !== 'black' && playerParam !== 'white') {
    return null;
  }

  if (!isStateLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neumorphism-base text-neumorphism-text font-bold animate-pulse">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center min-h-screen gap-8 lg:gap-16 p-4 bg-neumorphism-base">

      {/* Sidebar Controls (Left Side) - Slightly wider */}
      <div className="flex flex-col gap-6 w-full max-w-[240px]">

        {/* Score Panel */}
        <div className="flex flex-row items-center justify-center gap-8 p-5 rounded-2xl bg-neumorphism-base shadow-neumorphism-flat">
          {/* Black Score */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-800 border-2 border-gray-700 shadow-md"></div>
            <span className="text-3xl font-bold text-neumorphism-text">{blackCount}</span>
            <span className="text-lg font-bold text-neumorphism-text mt-1">{blackLabel}</span>
          </div>

          <div className="text-2xl font-bold text-gray-400 opacity-50 pb-8">-</div>

          {/* White Score */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 border-2 border-white shadow-md"></div>
            <span className="text-3xl font-bold text-neumorphism-text">{whiteCount}</span>
            <span className="text-lg font-bold text-neumorphism-text mt-1">{whiteLabel}</span>
          </div>
        </div>

        {/* Unified Control Panel */}
        <div className="flex flex-col items-center justify-center p-5 gap-4 rounded-2xl bg-neumorphism-base shadow-neumorphism-flat">

          {/* Status Section */}
          <div className={`text-xl font-bold text-center break-words w-full min-h-[1.75rem] ${statusColor}`}>
            {statusDisplay}
          </div>

          {/* Reset Button */}
          <button
            onClick={resetGame}
            className="w-full py-2 font-bold text-lg rounded-xl text-neumorphism-text bg-neumorphism-base shadow-neumorphism-flat hover:shadow-neumorphism-pressed active:translate-y-0.5 transition-all duration-200"
          >
            Reset
          </button>

          {/* New Game Button */}
          <button
            onClick={handleNewGame}
            className="w-full py-2 font-bold text-lg rounded-xl text-neumorphism-text bg-neumorphism-base shadow-neumorphism-flat hover:shadow-neumorphism-pressed active:translate-y-0.5 transition-all duration-200"
          >
            New Game
          </button>
        </div>
      </div>

      {/* Game Board - Increased width */}
      <div className="w-full max-w-[700px] shrink-0">
        <Board
          board={board}
          onCellClick={executeMove}
          disabled={isProcessing || winner !== null}
        />
      </div>

      {/* Pass Check Popup */}
      {passPopup && (
        <PassPopup passType={passPopup} onAcknowledge={acknowledgePass} />
      )}

      {/* Result Popup */}
      {showResult && (
        <ResultPopup
          winner={winner}
          board={board}
          onRestart={handleNewGame}
          onClose={() => setShowResult(false)}
          playerColor={playerColor}
        />
      )}
    </div>
  );
}
