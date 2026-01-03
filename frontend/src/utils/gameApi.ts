import { apiClient } from './apiClient';

export interface NextMoveResponse {
  next_move: number;
}

export const gameApi = {
  /**
   * Fetch the next move from the AI.
   * @param board 64-character string representing the board.
   * @param turn 0 for Black, 1 for White.
   */
  fetchNextMove: async (board: string, turn: number, aiLevel: string = 'v1'): Promise<number> => {
    const response = await apiClient.post<NextMoveResponse>('/games/next_move', {
      board,
      turn,
      aiLevel,
    });
    return response.next_move;
  },

  // Future endpoints can be added here, e.g.:
  // getGameHistory: (gameId: string) => apiClient.get<History>(`/games/${gameId}/history`),
  // saveGame: (data: GameData) => apiClient.post('/games', data),
};
