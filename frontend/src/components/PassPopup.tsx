import React from 'react';

type PassType = 'AI' | 'USER' | null;

interface PassPopupProps {
  passType: PassType;
  onAcknowledge: () => void;
}

export const PassPopup: React.FC<PassPopupProps> = ({ passType, onAcknowledge }) => {
  if (!passType) return null;

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
          {passType === 'AI'
            ? "AI cannot move. Turn passes to you."
            : "You cannot move. Turn passes to AI."}
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
