import React from 'react';

type PassType = 'AI' | 'USER' | null;

interface PassPopupProps {
  passType: PassType;
  onAcknowledge: () => void;
  gameMode?: 'ai' | 'human';
}

export const PassPopup: React.FC<PassPopupProps> = ({ passType, onAcknowledge, gameMode = 'ai' }) => {
  if (!passType) return null;

  let message = '';
  if (gameMode === 'human') {
    if (passType === 'USER') {
      message = "Black cannot move. Turn passes to White.";
    } else {
      message = "White cannot move. Turn passes to Black.";
    }
  } else {
    if (passType === 'AI') {
      message = "AI cannot move. Turn passes to you.";
    } else {
      message = "You cannot move. Turn passes to AI.";
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity"
      onClick={onAcknowledge}
    >
      <div
        className="p-8 rounded-2xl bg-neumorphism-base shadow-2xl transform scale-100 transition-transform"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-neumorphism-text mb-4 text-center">PASS</h2>
        <p className="text-lg text-neumorphism-text mb-6 text-center">
          {message}
        </p>
        <button
          onClick={onAcknowledge}
          className="w-full px-6 py-3 font-bold rounded-xl text-white bg-blue-500 shadow-lg hover:bg-blue-600 active:scale-95 transition-all"
        >
          OK
        </button>
      </div>
    </div>
  );
};
