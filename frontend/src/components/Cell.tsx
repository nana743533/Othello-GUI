import React from 'react';

type CellValue = -1 | 0 | 1; // -1: Empty, 0: Black, 1: White

interface CellProps {
  value: CellValue;
  onClick?: () => void;
  disabled?: boolean;
}

export const Cell: React.FC<CellProps> = ({ value, onClick, disabled }) => {
  return (
    <div
      onClick={!disabled ? onClick : undefined}
      className={`
        w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20
        rounded-lg
        flex items-center justify-center
        transition-all duration-200 ease-in-out
        cursor-pointer
        ${value === -1
          ? 'bg-neumorphism-base shadow-neumorphism-flat hover:shadow-neumorphism-pressed active:shadow-neumorphism-pressed'
          : 'bg-neumorphism-base shadow-neumorphism-pressed'
        }
      `}
    >
      {/* Stone */}
      {value !== -1 && (
        <div
          className={`
            w-[70%] h-[70%] rounded-full shadow-md transition-all duration-300
            ${value === 0
              ? 'bg-gray-800 border-2 border-gray-700'
              : 'bg-gray-100 border-2 border-white'
            }
          `}
        />
      )}
    </div>
  );
};
