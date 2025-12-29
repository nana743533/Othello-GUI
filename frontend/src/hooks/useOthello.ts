import { useState, useCallback, useEffect } from 'react';
import { gameApi } from '../utils/gameApi';
import { getFlippedIndices, boardToString, hasValidMoves } from '../utils/othelloLogic';

type CellValue = -1 | 0 | 1;
// 0: Black (First), 1: White
type Turn = 0 | 1;
export type GameMode = 'ai' | 'human';

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
  const [gameMode, setGameMode] = useState<GameMode>('ai');

  // Pass Popup State: 'PLAYER0' means Black passed, 'PLAYER1' means White passed
  const [passPopup, setPassPopup] = useState<'PLAYER0' | 'PLAYER1' | null>(null);

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
    // Don't allow move if processing or game is over
    if (isProcessing || winner !== null) return;

    // In AI mode, only allow player 0 (human) to move via UI
    if (gameMode === 'ai' && turn !== 0) return;

    const flippedIndices = getFlippedIndices(board, index, turn);
    if (flippedIndices.length === 0) return;

    // 2. Update Board (Player's Move)
    const newBoard = [...board];
    newBoard[index] = turn;
    flippedIndices.forEach(idx => {
      newBoard[idx] = turn;
    });
    setBoard(newBoard);

    // 3. Switch turn: In human mode, switch between 0 and 1; In AI mode, always go to AI (1)
    const nextTurn: Turn = gameMode === 'human' ? (1 - turn) : 1;
    setTurn(nextTurn);

    // Check game end immediately after move
    checkGameEnd(newBoard);
  }, [board, turn, isProcessing, winner, checkGameEnd, gameMode]);


  // AI Turn Logic
  const runAiTurn = useCallback(async () => {
    setIsProcessing(true);
    try {
      const boardString = boardToString(board);
      const aiMoveIndex = await gameApi.fetchNextMove(boardString, 1); // AI is White (1)

      if (aiMoveIndex === -1) {
        // AI Pass
        setPassPopup('PLAYER1');
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

  // Check for pass conditions
  const checkPassCondition = useCallback(() => {
    const currentPlayerCanMove = hasValidMoves(board, turn);

    // If current player has no moves, show pass popup
    if (!currentPlayerCanMove) {
      // Double check game isn't over
      if (!checkGameEnd(board)) {
        setPassPopup(turn === 0 ? 'PLAYER0' : 'PLAYER1');
      }
    }
  }, [board, turn, checkGameEnd]);

  // Effect to trigger AI Turn or Check Pass
  useEffect(() => {
    if (winner !== null || passPopup) return;

    if (gameMode === 'ai' && turn === 1) {
      // AI Turn in AI mode
      const timer = setTimeout(() => {
        runAiTurn();
      }, 500);
      return () => clearTimeout(timer);
    } else {
      // Human turn (or both in human mode)
      checkPassCondition();
    }
  }, [turn, winner, runAiTurn, checkPassCondition, passPopup, gameMode]);


  // Function to acknowledge pass popup
  const acknowledgePass = useCallback(() => {
    if (passPopup === 'PLAYER1') {
      // White/AI passed, control returned to Black
      setPassPopup(null);
      setTurn(0);
    } else if (passPopup === 'PLAYER0') {
      // Black passed, control goes to White
      setPassPopup(null);
      setTurn(1);
    }
  }, [passPopup]);


  return {
    board,
    turn,
    isProcessing,
    winner,
    passPopup,
    gameMode,
    acknowledgePass,
    executeMove,
    setGameMode,
    resetGame: () => {
      setBoard(initialBoard);
      setTurn(0);
      setWinner(null);
      setPassPopup(null);
    }
  };
};
