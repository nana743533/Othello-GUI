import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home from '../page';
import { useRouter, useSearchParams } from 'next/navigation';
import { useOthello } from '../../hooks/useOthello';

// Mock Dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock('../../hooks/useOthello', () => ({
  useOthello: jest.fn(),
}));

// Mock Components
jest.mock('../../components/Board', () => ({
  Board: () => <div data-testid="board">Mock Board</div>
}));

jest.mock('../../components/PassPopup', () => ({
  PassPopup: () => <div data-testid="pass-popup">Pass Popup</div>
}));

jest.mock('../../components/ResultPopup', () => ({
  ResultPopup: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="result-popup">
      Result Popup
      <button onClick={onClose}>Close</button>
    </div>
  )
}));

describe('Home Page', () => {
  const mockRouter = { push: jest.fn(), replace: jest.fn() };
  const mockSearchParams = { get: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
    mockSearchParams.get.mockImplementation((key: string) => {
      if (key === 'player') return 'black';
      if (key === 'mode') return 'ai';
      if (key === 'aiLevel') return 'v1';
      return null;
    });

    // Default useOthello mock
    (useOthello as jest.Mock).mockReturnValue({
      board: Array(64).fill(-1),
      turn: 0,
      isProcessing: false,
      winner: null,
      passPopup: null,
      acknowledgePass: jest.fn(),
      executeMove: jest.fn(),
      resetGame: jest.fn(),
      isStateLoaded: true, // IMPORTANT: Must be true to render content
    });
  });

  it('renders loading state when player param is missing', () => {
    mockSearchParams.get.mockReturnValue(null);
    render(<Home />);
    // Should render null by default or replace call
    expect(screen.queryByTestId('board')).not.toBeInTheDocument();
  });

  it('renders loading state when isStateLoaded is false', () => {
    // Uses default mock (player=black, mode=ai)
    (useOthello as jest.Mock).mockReturnValue({
      board: Array(64).fill(-1),
      turn: 0,
      isProcessing: false,
      winner: null,
      passPopup: null,
      isStateLoaded: false, // Loading
    });

    render(<Home />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders game content when loaded and param is valid', () => {
    // Uses default mock (player=black, mode=ai)

    render(<Home />);

    expect(screen.getByText('Your Turn')).toBeInTheDocument();
    expect(screen.getByTestId('board')).toBeInTheDocument();
  });

  it('redirects to /newgame if param is invalid', () => {
    mockSearchParams.get.mockReturnValue('invalid');
    render(<Home />);

    expect(mockRouter.replace).toHaveBeenCalledWith('/newgame');
  });

  it('calls resetGame when Reset button is clicked', () => {
    mockSearchParams.get.mockImplementation((key: string) => {
      if (key === 'player') return 'white';
      if (key === 'mode') return 'ai';
      if (key === 'aiLevel') return 'v1';
      return null;
    });
    const resetGameMock = jest.fn();
    (useOthello as jest.Mock).mockReturnValue({
      board: Array(64).fill(-1),
      turn: 1, // White turn
      isProcessing: false,
      winner: null,
      passPopup: null,
      resetGame: resetGameMock,
      isStateLoaded: true,
    });

    render(<Home />);

    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);

    expect(resetGameMock).toHaveBeenCalled();
  });

  it('shows result popup when winner is set', () => {
    // Uses default mock (player=black, mode=ai)
    (useOthello as jest.Mock).mockReturnValue({
      board: Array(64).fill(0),
      turn: 0,
      isProcessing: false,
      winner: 0, // Black wins
      passPopup: null,
      isStateLoaded: true,
    });

    render(<Home />);
    expect(screen.getByTestId('result-popup')).toBeInTheDocument();
  });

  it('closes result popup when close button is clicked', async () => {
    // Uses default mock (player=black, mode=ai)
    (useOthello as jest.Mock).mockReturnValue({
      board: Array(64).fill(0),
      turn: 0,
      isProcessing: false,
      winner: 0,
      passPopup: null,
      isStateLoaded: true,
    });

    render(<Home />);
    const closeBtn = await screen.findByText('Close');
    fireEvent.click(closeBtn);

    // Wait for state update (it's local state in page)
    await waitFor(() => {
      expect(screen.queryByTestId('result-popup')).not.toBeInTheDocument();
    });
  });
});
