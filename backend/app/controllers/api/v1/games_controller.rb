require 'open3'

module Api
  module V1
    class GamesController < ApplicationController
      # POST /api/v1/games/next_move
      def next_move
        board_str = params[:board]
        turn = params[:turn]

        # Validation
        if board_str.nil? || board_str.length != 64 || turn.nil?
          render json: { error: 'Invalid parameters' }, status: :unprocessable_entity
          return
        end

        # Path to C++ executable
        # Assuming directory structure: backend/othelloai_logic/othello
        exe_path = Rails.root.join('othelloai_logic', 'othello').to_s

        unless File.exist?(exe_path)
          render json: { error: 'AI executable not found' }, status: :internal_server_error
          return
        end

        # Execute C++ logic
        # usage: ./othello <board_str> <turn>
        stdout, stderr, status = Open3.capture3(exe_path, board_str, turn.to_s)

        if status.success?
          move = stdout.strip.to_i
          render json: { next_move: move }
        else
          render json: { error: "AI execution failed: #{stderr}" }, status: :internal_server_error
        end
      end
    end
  end
end
