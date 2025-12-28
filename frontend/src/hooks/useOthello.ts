import { useState, useCallback, useEffect } from 'react';
import { gameApi } from '../utils/gameApi';
import { getFlippedIndices, boardToString, hasValidMoves } from '../utils/othelloLogic';

type CellValue = -1 | 0 | 1;
// 0: Black (First), 1: White
type Turn = 0 | 1;

export const useOthello = () => {
  // Initial Board Setup: center 4 stones
  const initialBoard = Array(64).fill(-1);
  initialBoard[27] = 1;
  initialBoard[28] = 0;
  initialBoard[35] = 0;
  initialBoard[36] = 1;

  const [board, setBoard] = useState<CellValue[]>(initialBoard);
  const [turn, setTurn] = useState<Turn>(0); // Black starts
  const [isProcessing, setIsProcessing] = useState(false);
  const [winner, setWinner] = useState<Turn | 'Draw' | null>(null);

  // Pass Popup State: 'AI' means AI passed, 'USER' means User passed
  const [passPopup, setPassPopup] = useState<'AI' | 'USER' | null>(null);

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
    // Only allow move if it's Player's turn (0) and not processing
    if (turn !== 0 || isProcessing || winner !== null) return;

    const flippedIndices = getFlippedIndices(board, index, turn);
    if (flippedIndices.length === 0) return;

    // 2. Update Board (Player's Move)
    const newBoard = [...board];
    newBoard[index] = turn;
    flippedIndices.forEach(idx => {
      newBoard[idx] = turn;
    });
    setBoard(newBoard);

    const nextTurn = 1; // Always AI next after user move
    setTurn(nextTurn);

    // Check game end immediately after move
    checkGameEnd(newBoard);
  }, [board, turn, isProcessing, winner, checkGameEnd]);


  // AI Turn Logic
  const runAiTurn = useCallback(async () => {
    setIsProcessing(true);
    try {
      const boardString = boardToString(board);
      const aiMoveIndex = await gameApi.fetchNextMove(boardString, 1); // AI is White (1)

      if (aiMoveIndex === -1) {
        // AI Pass
        setPassPopup('AI');
        setTurn(0); // Return turn to player
      } else {
        // AI Move
        const aiFlipped = getFlippedIndices(board, aiMoveIndex, 1);
        if (aiFlipped.length > 0 || board[aiMoveIndex] === -1) {
          const newBoard = [...board];
          newBoard[aiMoveIndex] = 1;
          aiFlipped.forEach(idx => {
            newBoard[idx] = 1;
          });
          setBoard(newBoard);
          setTurn(0);
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
  }, [board, checkGameEnd]);

  // Check for pass conditions (User only, AI pass is handled in runAiTurn)
  const checkPassCondition = useCallback(() => {
    // User Turn (0)
    const userCanMove = hasValidMoves(board, 0);

    // If user has no moves, show pass popup
    if (!userCanMove) {
      // Double check game isn't over
      if (!checkGameEnd(board)) {
        setPassPopup('USER');
      }
    }
  }, [board, checkGameEnd]);

  // Effect to trigger AI Turn or Check User Pass
  useEffect(() => {
    if (winner !== null || passPopup) return;


    if (turn === 1) {
      // AI Turn
      const timer = setTimeout(() => {
        runAiTurn();
      }, 500);
      return () => clearTimeout(timer);
    } else {
      // User Turn (0)
      checkPassCondition();
    }
  }, [turn, winner, runAiTurn, checkPassCondition, passPopup]);


  // Function to acknowledge pass popup
  const acknowledgePass = useCallback(() => {
    if (passPopup === 'AI') {
      // AI passed, control returned to User (turn is already 0 set in runAiTurn)
      // Nothing to do but close popup
      setPassPopup(null);
    } else if (passPopup === 'USER') {
      // User passed. Control goes to AI.
      setPassPopup(null);
      setTurn(1);
    }
  }, [passPopup]);


  return {
    board,
    turn,
    isProcessing,
    winner,
    passPopup, // Export this
    acknowledgePass, // Export this
    executeMove,
    resetGame: () => {
      setBoard(initialBoard);
      setTurn(0);
      setWinner(null);
      setPassPopup(null);
    }
  };
};
