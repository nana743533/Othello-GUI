import { renderHook, act, waitFor } from '@testing-library/react';
import { useOthello } from '../useOthello';
import { gameApi } from '../../utils/gameApi';
import * as othelloLogic from '../../utils/othelloLogic';

// Mock proxies
jest.mock('../../utils/gameApi', () => ({
  gameApi: {
    fetchNextMove: jest.fn(),
  },
}));

jest.mock('../../utils/othelloLogic', () => ({
  getFlippedIndices: jest.fn(),
  boardToString: jest.fn(),
  hasValidMoves: jest.fn(),
}));

describe('useOthello Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock implementations
    (othelloLogic.hasValidMoves as jest.Mock).mockReturnValue(true);
    (othelloLogic.getFlippedIndices as jest.Mock).mockReturnValue([]);
    (othelloLogic.boardToString as jest.Mock).mockReturnValue("mockBoardString");
    (gameApi.fetchNextMove as jest.Mock).mockResolvedValue(10); // Default AI move
  });

  // Mock LocalStorage
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: jest.fn((key: string) => store[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        store[key] = value.toString();
      }),
      removeItem: jest.fn((key: string) => {
        delete store[key];
      }),
      clear: jest.fn(() => {
        store = {};
      }),
    };
  })();

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
  });

  it('initializes with correct default state and loads loaded flag', () => {
    const { result } = renderHook(() => useOthello());

    expect(result.current.turn).toBe(0);
    expect(result.current.winner).toBeNull();
    expect(result.current.passPopup).toBeNull();
    expect(result.current.isStateLoaded).toBe(true);
  });

  it('restores state from localStorage', () => {
    const savedState = {
      board: Array(64).fill(0), // All black for simplicity
      turn: 1,
      winner: null
    };
    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedState));

    const { result } = renderHook(() => useOthello());

    expect(result.current.board).toEqual(savedState.board);
    expect(result.current.turn).toBe(1);
    expect(result.current.isStateLoaded).toBe(true);
  });

  it('executes user move and triggers AI turn', async () => {
    (othelloLogic.getFlippedIndices as jest.Mock).mockReturnValue([20]); // Mock flipped stones

    const { result } = renderHook(() => useOthello());

    // Execute User Move
    await act(async () => {
      result.current.executeMove(19);
    });

    // Verify Board Update
    expect(result.current.board[19]).toBe(0); // User placed
    expect(result.current.board[20]).toBe(0); // Flipped

    // Verify turn switched to AI
    expect(result.current.turn).toBe(1);

    // Verify AI API call triggered
    await waitFor(() => {
      expect(gameApi.fetchNextMove).toHaveBeenCalled();
    });
  });

  it('handles AI pass correctly (-1 from API)', async () => {
    // Setup AI turn
    // We can simulate this by running a user move first
    (othelloLogic.getFlippedIndices as jest.Mock).mockReturnValue([20]);
    (gameApi.fetchNextMove as jest.Mock).mockResolvedValue(-1); // AI Pass

    const { result } = renderHook(() => useOthello());

    await act(async () => {
      result.current.executeMove(19);
    });

    // Wait for AI response processing
    await waitFor(() => {
      expect(result.current.passPopup).toBe('AI');
    });

    // Turn should be back to User (0) but popup is showing
    expect(result.current.turn).toBe(0);

    // Acknowledge Pass
    act(() => {
      result.current.acknowledgePass();
    });

    expect(result.current.passPopup).toBeNull();
    expect(result.current.turn).toBe(0);
  });

  it('handles User pass correctly (no valid moves)', async () => {
    // user turn, valid moves = false
    (othelloLogic.hasValidMoves as jest.Mock).mockImplementation((board, turn) => {
      if (turn === 0) return false; // User cannot move
      return true; // AI can move (so game not over)
    });

    const { result } = renderHook(() => useOthello());

    // Initial render should trigger checkPassCondition in useEffect
    await waitFor(() => {
      expect(result.current.passPopup).toBe('USER');
    });

    // Acknowledge Pass
    act(() => {
      result.current.acknowledgePass();
    });

    // Should switch to AI turn
    expect(result.current.passPopup).toBeNull();
    expect(result.current.turn).toBe(1);

    // AI should start thinking
    await waitFor(() => {
      expect(gameApi.fetchNextMove).toHaveBeenCalled();
    });
  });

  it('resets game and clears storage', () => {
    const { result } = renderHook(() => useOthello());

    act(() => {
      result.current.resetGame();
    });

    expect(localStorageMock.removeItem).toHaveBeenCalledWith('othello_game_state');
  });
});
