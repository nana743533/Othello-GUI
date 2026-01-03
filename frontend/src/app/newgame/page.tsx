'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NewGamePage() {
  const router = useRouter();
  const [gameMode, setGameMode] = useState<'ai' | 'human' | null>(null);

  const handleSelectColor = (color: 'black' | 'white') => {
    // Clear any existing game state to start fresh
    localStorage.removeItem('othello_game_state');
    router.push(`/?player=${color}&mode=${gameMode}`);
  };

  // First screen: Select game mode
  if (gameMode === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neumorphism-base p-4 gap-12">
        <h1 className="text-3xl md:text-4xl font-bold text-neumorphism-text">
          Select Game Mode
        </h1>

        <div className="flex flex-col gap-6 md:gap-8">
          {/* VS AI Button */}
          <button
            onClick={() => setGameMode('ai')}
            className="group flex flex-col items-center gap-4 p-8 rounded-3xl bg-neumorphism-base shadow-neumorphism-flat hover:shadow-neumorphism-pressed active:translate-y-1 transition-all duration-300 min-w-[300px]"
          >
            <span className="text-2xl md:text-3xl font-bold text-neumorphism-text">VS AI</span>
            <span className="text-sm text-gray-500">Play against computer</span>
          </button>

          {/* VS Human Button */}
          <button
            onClick={() => setGameMode('human')}
            className="group flex flex-col items-center gap-4 p-8 rounded-3xl bg-neumorphism-base shadow-neumorphism-flat hover:shadow-neumorphism-pressed active:translate-y-1 transition-all duration-300 min-w-[300px]"
          >
            <span className="text-2xl md:text-3xl font-bold text-neumorphism-text">VS Human</span>
            <span className="text-sm text-gray-500">Play with another player</span>
          </button>
        </div>
      </div>
    );
  }

  // Second screen: Select color (for AI mode) or start game (for human mode)
  if (gameMode === 'ai') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neumorphism-base p-4 gap-12">
        <h1 className="text-3xl md:text-4xl font-bold text-neumorphism-text">
          Select Your Color
        </h1>

        <div className="flex flex-row gap-8 md:gap-16">
          {/* Black Button */}
          <button
            onClick={() => handleSelectColor('black')}
            className="group flex flex-col items-center gap-6 p-8 rounded-3xl bg-neumorphism-base shadow-neumorphism-flat hover:shadow-neumorphism-pressed active:translate-y-1 transition-all duration-300"
          >
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gray-800 border-4 border-gray-700 shadow-lg group-hover:scale-105 transition-transform duration-300"></div>
            <span className="text-xl md:text-2xl font-bold text-neumorphism-text">Black</span>
            <span className="text-sm text-gray-500">First Move</span>
          </button>

          {/* White Button */}
          <button
            onClick={() => handleSelectColor('white')}
            className="group flex flex-col items-center gap-6 p-8 rounded-3xl bg-neumorphism-base shadow-neumorphism-flat hover:shadow-neumorphism-pressed active:translate-y-1 transition-all duration-300"
          >
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gray-100 border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-300"></div>
            <span className="text-xl md:text-2xl font-bold text-neumorphism-text">White</span>
            <span className="text-sm text-gray-500">Second Move</span>
          </button>
        </div>

        <button
          onClick={() => setGameMode(null)}
          className="mt-4 px-6 py-2 font-bold text-lg rounded-xl text-neumorphism-text bg-neumorphism-base shadow-neumorphism-flat hover:shadow-neumorphism-pressed active:translate-y-0.5 transition-all duration-200"
        >
          Back
        </button>
      </div>
    );
  }

  // For human mode, just start with black (doesn't matter)
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neumorphism-base p-4 gap-12">
      <h1 className="text-3xl md:text-4xl font-bold text-neumorphism-text">
        Human vs Human
      </h1>

      <button
        onClick={() => handleSelectColor('black')}
        className="group flex flex-col items-center gap-4 p-8 rounded-3xl bg-neumorphism-base shadow-neumorphism-flat hover:shadow-neumorphism-pressed active:translate-y-1 transition-all duration-300 min-w-[300px]"
      >
        <span className="text-2xl md:text-3xl font-bold text-neumorphism-text">Start Game</span>
        <span className="text-sm text-gray-500">Black plays first</span>
      </button>

      <button
        onClick={() => setGameMode(null)}
        className="mt-4 px-6 py-2 font-bold text-lg rounded-xl text-neumorphism-text bg-neumorphism-base shadow-neumorphism-flat hover:shadow-neumorphism-pressed active:translate-y-0.5 transition-all duration-200"
      >
        Back
      </button>
    </div>
  );
}
