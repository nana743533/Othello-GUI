import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResultPopup } from '../ResultPopup';

describe('ResultPopup Component', () => {
  // Mock board with 4 stones (2 black, 2 white for simplicity)
  // Indices 27, 36 are white (1), 28, 35 are black (0) usually.
  // We can just make a mock array.
  const mockBoard = Array(64).fill(-1);
  mockBoard[0] = 0;
  mockBoard[1] = 0;
  mockBoard[2] = 0; // 3 Blacks
  mockBoard[3] = 1; // 1 White

  it('renders nothing when winner is null', () => {
    const { container } = render(
      <ResultPopup winner={null} board={mockBoard} onRestart={() => { }} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders "Black Wins!" when winner is 0', () => {
    render(
      <ResultPopup winner={0} board={mockBoard} onRestart={() => { }} />
    );
    expect(screen.getByText('Game Over')).toBeInTheDocument();
    expect(screen.getByText('Black Wins!')).toBeInTheDocument();
  });

  it('renders "White Wins!" when winner is 1', () => {
    render(
      <ResultPopup winner={1} board={mockBoard} onRestart={() => { }} />
    );
    expect(screen.getByText('White Wins!')).toBeInTheDocument();
  });

  it('renders "Draw!" when winner is "Draw"', () => {
    render(
      <ResultPopup winner="Draw" board={mockBoard} onRestart={() => { }} />
    );
    expect(screen.getByText('Draw!')).toBeInTheDocument();
  });

  it('displays correct stone counts', () => {
    // mockBoard has 3 Blacks (0) and 1 White (1)
    render(
      <ResultPopup winner={0} board={mockBoard} onRestart={() => { }} />
    );

    // We expect to find '3' and '1' in the document.
    // Since they are just numbers, we can look for them.
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('calls onRestart when New Game button is clicked', () => {
    const mockRestart = jest.fn();
    render(
      <ResultPopup winner={0} board={mockBoard} onRestart={mockRestart} />
    );

    const button = screen.getByRole('button', { name: 'New Game' });
    fireEvent.click(button);

    expect(mockRestart).toHaveBeenCalledTimes(1);
  });
});
