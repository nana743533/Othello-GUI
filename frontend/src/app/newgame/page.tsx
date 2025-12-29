'use client';

import { useRouter } from 'next/navigation';

export default function NewGamePage() {
  const router = useRouter();

  const handleSelectColor = (color: 'black' | 'white') => {
    // Clear any existing game state to start fresh
    localStorage.removeItem('othello_game_state');
    router.push(`/?player=${color}`);
  };

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
    </div>
  );
}
