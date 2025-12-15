require 'swagger_helper'

RSpec.describe 'api/v1/games', type: :request do
  path '/api/v1/games/next_move' do
    post 'Calculates the next move for the AI' do
      tags 'Games'
      consumes 'application/json'
      produces 'application/json'
      parameter name: :game_state, in: :body, schema: {
        type: :object,
        properties: {
          board: { type: :string, example: '0000000000000000000000000001200000021000000000000000000000000000', description: '64-character string representing the board (0: empty, 1: black, 2: white)' },
          turn: { type: :integer, example: 1, description: 'Current turn (0: black, 1: white)' }
        },
        required: [ 'board', 'turn' ]
      }

      response '200', 'Success' do
        schema type: :object,
               properties: {
                 next_move: { type: :integer, example: 19, description: 'The index of the cell where AI places its stone' }
               },
               required: [ 'next_move' ]

        let(:game_state) { { board: '0000000000000000000000000001200000021000000000000000000000000000', turn: 1 } }
        run_test!
      end

      response '422', 'Invalid input' do
        let(:game_state) { { board: 'invalid', turn: 1 } }
        run_test!
      end
    end
  end
end
