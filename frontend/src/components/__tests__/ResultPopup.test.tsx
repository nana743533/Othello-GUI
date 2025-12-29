import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResultPopup } from '../ResultPopup';

describe('ResultPopup Component', () => {
  // 64 cells total.
  // mockBoard: 3 Black, 1 White, 60 Empty (-1)
  const mockBoard = Array(64).fill(-1);
  mockBoard[0] = 0;
  mockBoard[1] = 0;
  mockBoard[2] = 0; // 3 Blacks
  mockBoard[3] = 1; // 1 White
  // Empty = 60

  it('renders nothing when winner is null', () => {
    const { container } = render(
      <ResultPopup winner={null} board={mockBoard} onRestart={() => { }} onClose={() => { }} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders "You Win!" and adds empty cells to Black score when Black wins', () => {
    // Winner 0 = Black (User)
    render(
      <ResultPopup winner={0} board={mockBoard} onRestart={() => { }} onClose={() => { }} />
    );

    // Message
    expect(screen.getByText('You Win!')).toBeInTheDocument();

    // Score Calculation
    // Black: 3 (raw) + 60 (empty) = 63
    // White: 1 (raw)
    expect(screen.getByText('63')).toBeInTheDocument(); // Black Score
    expect(screen.getByText('1')).toBeInTheDocument();  // White Score
  });

  it('renders "AI Wins!" and adds empty cells to White score when White wins', () => {
    // Winner 1 = White (AI)
    render(
      <ResultPopup winner={1} board={mockBoard} onRestart={() => { }} onClose={() => { }} />
    );

    // Message
    expect(screen.getByText('AI Wins!')).toBeInTheDocument();

    // Score Calculation
    // Black: 3 (raw)
    // White: 1 (raw) + 60 (empty) = 61
    expect(screen.getByText('3')).toBeInTheDocument();  // Black Score
    expect(screen.getByText('61')).toBeInTheDocument(); // White Score
  });

  it('renders "Draw!" and splits empty cells when Draw', () => {
    // Winner 'Draw'
    render(
      <ResultPopup winner="Draw" board={mockBoard} onRestart={() => { }} onClose={() => { }} />
    );

    // Message
    expect(screen.getByText('Draw!')).toBeInTheDocument();

    // Score Calculation
    // Empty = 60. Split = 30 each.
    // Black: 3 + 30 = 33
    // White: 1 + 30 = 31
    expect(screen.getByText('33')).toBeInTheDocument(); // Black Score
    expect(screen.getByText('31')).toBeInTheDocument(); // White Score
  });

  it('calls onRestart when New Game button is clicked', () => {
    const mockRestart = jest.fn();
    render(
      <ResultPopup winner={0} board={mockBoard} onRestart={mockRestart} onClose={() => { }} />
    );

    const button = screen.getByRole('button', { name: 'New Game' });
    fireEvent.click(button);

    expect(mockRestart).toHaveBeenCalledTimes(1);
  });
});
