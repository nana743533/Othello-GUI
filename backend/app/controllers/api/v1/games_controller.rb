require 'open3'

module Api
  module V1
    class GamesController < ApplicationController
      # POST /api/v1/games/next_move
      def next_move
        board_str = params[:board]
        turn = params[:turn]
        ai_level = params[:aiLevel] || 'v1' # Default to v1

        # Validation
        if board_str.nil? || board_str.length != 64 || turn.nil?
          render json: { error: 'Invalid parameters' }, status: :unprocessable_entity
          return
        end

        # Path to C++ executable
        # Directory structure: backend/othelloai_logic/<version>/othello
        # Sanitize ai_level to prevent directory traversal
        unless ai_level.match?(/^[a-zA-Z0-9_]+$/)
           render json: { error: 'Invalid AI level format' }, status: :unprocessable_entity
           return
        end

        exe_path = Rails.root.join('othelloai_logic', ai_level, 'othello').to_s

        unless File.exist?(exe_path)
          render json: { error: "AI executable not found for level: #{ai_level}" }, status: :internal_server_error
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
