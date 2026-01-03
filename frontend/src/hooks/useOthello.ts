import { useState, useCallback, useEffect } from 'react';
import { gameApi } from '../utils/gameApi';
import { getFlippedIndices, boardToString, hasValidMoves } from '../utils/othelloLogic';

type CellValue = -1 | 0 | 1;
// 0: Black (First), 1: White
type Turn = 0 | 1;
type GameMode = 'ai' | 'human';

// Storage Key
const STORAGE_KEY = 'othello_game_state';

export const useOthello = (playerColor: Turn = 0, gameMode: GameMode = 'ai') => {
  const aiColor = (playerColor === 0 ? 1 : 0) as Turn;

  // Initial Board Setup: center 4 stones
  const initialBoard = Array(64).fill(-1);
  initialBoard[27] = 1;
  initialBoard[28] = 0;
  initialBoard[35] = 0;
  initialBoard[36] = 1;

  // Initialize state functions
  const [board, setBoard] = useState<CellValue[]>(initialBoard);
  const [turn, setTurn] = useState<Turn>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [winner, setWinner] = useState<Turn | 'Draw' | null>(null);
  const [passPopup, setPassPopup] = useState<'AI' | 'USER' | null>(null);
  const [isStateLoaded, setIsStateLoaded] = useState(false);

  // Load state from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.board && typeof parsed.turn === 'number') {
          setBoard(parsed.board);
          setTurn(parsed.turn as Turn);
          setWinner(parsed.winner);
          setIsProcessing(false); // Always reset processing on reload to prevent stuck state
        }
      } catch (e) {
        console.error("Failed to load game state", e);
      }
    }
    setIsStateLoaded(true);
  }, []);

  // Save state to local storage whenever critical state changes
  useEffect(() => {
    const stateToSave = {
      board,
      turn,
      winner
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  }, [board, turn, winner]);

  const checkGameEnd = useCallback((currentBoard: CellValue[]) => {
    const blackCanMove = hasValidMoves(currentBoard, 0);
    const whiteCanMove = hasValidMoves(currentBoard, 1);

    if (!blackCanMove && !whiteCanMove) {
      const blackCount = currentBoard.filter(c => c === 0).length;
      const whiteCount = currentBoard.filter(c => c === 1).length;
      if (blackCount > whiteCount) setWinner(0);
      else if (whiteCount > blackCount) setWinner(1);
      else setWinner('Draw');
      return true;
    }
    return false;
  }, []);

  const executeMove = useCallback((index: number) => {
    // 1. Validation & Flipping (Client Side)
    // In human mode, allow both players to move; in AI mode, only allow player's turn
    if (gameMode === 'ai' && turn !== playerColor) return;
    if (isProcessing || winner !== null) return;

    const flippedIndices = getFlippedIndices(board, index, turn);
    if (flippedIndices.length === 0) return;

    // 2. Update Board (Player's Move)
    const newBoard = [...board];
    newBoard[index] = turn;
    flippedIndices.forEach(idx => {
      newBoard[idx] = turn;
    });
    setBoard(newBoard);

    // In human mode, switch between players; in AI mode, switch to AI
    const nextTurn = (turn === 0 ? 1 : 0) as Turn;
    setTurn(nextTurn);

    // Check game end immediately after move
    checkGameEnd(newBoard);
  }, [board, turn, isProcessing, winner, checkGameEnd, playerColor, gameMode]);


  // AI Turn Logic
  const runAiTurn = useCallback(async () => {
    setIsProcessing(true);
    try {
      const boardString = boardToString(board);
      const aiMoveIndex = await gameApi.fetchNextMove(boardString, aiColor); // Dynamic AI color

      if (aiMoveIndex === -1) {
        // AI Pass
        setPassPopup('AI');
        setTurn(playerColor); // Return turn to player
      } else {
        // AI Move
        const aiFlipped = getFlippedIndices(board, aiMoveIndex, aiColor);
        if (aiFlipped.length > 0 || board[aiMoveIndex] === -1) {
          const newBoard = [...board];
          newBoard[aiMoveIndex] = aiColor;
          aiFlipped.forEach(idx => {
            newBoard[idx] = aiColor;
          });
          setBoard(newBoard);
          setTurn(playerColor);
          checkGameEnd(newBoard);
        } else {
          console.error("AI attempted invalid move:", aiMoveIndex);
          // Fallback: treat as pass or error? For now, prevent hang
          setIsProcessing(false);
          return;
        }
      }
    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [board, checkGameEnd, aiColor, playerColor]);

  // Check for pass conditions (User only in AI mode, both players in human mode)
  const checkPassCondition = useCallback(() => {
    if (gameMode === 'ai') {
      // In AI mode, only check user turn
      if (turn !== playerColor) return;
      
      const userCanMove = hasValidMoves(board, playerColor);
      if (!userCanMove) {
        if (!checkGameEnd(board)) {
          setPassPopup('USER');
        }
      }
    } else {
      // In human mode, check current player
      const currentPlayerCanMove = hasValidMoves(board, turn);
      if (!currentPlayerCanMove) {
        if (!checkGameEnd(board)) {
          setPassPopup(turn === 0 ? 'USER' : 'AI'); // Reuse 'USER' for player 1, 'AI' for player 2
        }
      }
    }
  }, [board, checkGameEnd, playerColor, turn, gameMode]);

  // Effect to trigger AI Turn or Check User Pass
  useEffect(() => {
    if (winner !== null || passPopup) return;

    if (gameMode === 'ai' && turn === aiColor) {
      // AI Turn
      const timer = setTimeout(() => {
        runAiTurn();
      }, 500);
      return () => clearTimeout(timer);
    } else {
      // User Turn (or human mode)
      checkPassCondition();
    }
  }, [turn, winner, runAiTurn, checkPassCondition, passPopup, aiColor, gameMode]);


  // Function to acknowledge pass popup
  const acknowledgePass = useCallback(() => {
    if (passPopup === 'AI') {
      // AI passed (or Player 2 in human mode), control returned to User/Player 1
      setPassPopup(null);
      if (gameMode === 'human') {
        setTurn(0);
      }
    } else if (passPopup === 'USER') {
      // User passed (or Player 1 in human mode). Control goes to AI/Player 2.
      setPassPopup(null);
      if (gameMode === 'human') {
        setTurn(1);
      } else {
        setTurn(aiColor);
      }
    }
  }, [passPopup, aiColor, gameMode]);


  return {
    board,
    turn,
    isProcessing,
    winner,
    passPopup,
    acknowledgePass,
    executeMove,
    isStateLoaded, // Export this
    resetGame: () => {
      setBoard(initialBoard);
      setTurn(0);
      setWinner(null);
      setPassPopup(null);
      localStorage.removeItem(STORAGE_KEY); // Clear storage on reset
    }
  };
};
