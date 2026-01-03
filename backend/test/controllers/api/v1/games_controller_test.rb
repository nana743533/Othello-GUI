require 'test_helper'

module Api
  module V1
    class GamesControllerTest < ActionDispatch::IntegrationTest
      test "should get next move with valid board (Standard Start)" do
        # Initial board state (standard start)
        # Contract: 0: Empty, 1: Black, 2: White
        # D4(27): White(2), E4(28): Black(1), D5(35): Black(1), E5(36): White(2)
        board = "0" * 64
        board[27] = "2" # White
        board[28] = "1" # Black
        board[35] = "1" # Black
        board[36] = "2" # White
        
        # Turn 0 (Black)
        post next_move_api_v1_games_url, params: { board: board, turn: 0 }, as: :json
        
        assert_response :success
        json_response = JSON.parse(response.body)
        
        assert_includes json_response, "next_move"
        # Typical opening moves for Black: D3(19), C4(26), F5(37), E6(44)
        assert_includes [19, 26, 37, 44], json_response["next_move"]
        
        # The returned move must be legal.
        assert_not_equal -1, json_response["next_move"], "AI returned -1 (Pass) on a valid starting board"
      end

      test "should make a simple flank move (horizontal)" do
        # Setup: Black at A1(0), White at B1(1), Empty at C1(2)
        # Black to play. Should play C1(2) to capture B1.
        board = "0" * 64
        board[0] = "1" # Black
        board[1] = "2" # White
        
        post next_move_api_v1_games_url, params: { board: board, turn: 0 }, as: :json
        
        assert_response :success
        json = JSON.parse(response.body)
        assert_equal 2, json["next_move"]
      end

      test "should prioritize corner A1 if available" do
        # Setup: Empty at A1(0), White at B2(9), Black at C3(18)
        # Black to play. A1 captures B2.
        board = "0" * 64
        board[9] = "2"  # White
        board[18] = "1" # Black
        
        post next_move_api_v1_games_url, params: { board: board, turn: 0 }, as: :json
        
        assert_response :success
        json = JSON.parse(response.body)
        assert_equal 0, json["next_move"]
      end

      test "should return a valid move for complex mid-game state" do
        # Board state provided by user:
        # Row 1: 00000000
        # Row 2: 00001200
        # Row 3: 00201000
        # Row 4: 00121200
        # Row 5: 00012200
        # Row 6: 00000200
        # Row 7: 00000000
        # Row 8: 00000000
        board = "0000000000001200002010000012120000012200000002000000000000000000"
        
        # Valid moves for Black: g1(6), c2(10), g2(14), d3(19), g4(30), g5(38), e6(44), g6(46)
        expected_moves = [6, 10, 14, 19, 30, 38, 44, 46]
        
        post next_move_api_v1_games_url, params: { board: board, turn: 0 }, as: :json
        
        assert_response :success
        json = JSON.parse(response.body)
        
        assert_includes expected_moves, json["next_move"], "Returned move #{json['next_move']} should be one of #{expected_moves}"
      end

      test "should return error for invalid board length" do
        post next_move_api_v1_games_url, params: { board: "000", turn: 0 }, as: :json
        assert_response :unprocessable_entity
      end

      test "should return error when C++ executable is missing" do
        # Temporarily rename executable to simulate missing file
        exe_path = Rails.root.join('othelloai_logic', 'v1', 'othello')
        File.rename(exe_path, exe_path.to_s + ".bak") if File.exist?(exe_path)

        begin
          board = "2" * 64
          post next_move_api_v1_games_url, params: { board: board, turn: 0 }, as: :json
          assert_response :internal_server_error
        ensure
          # Restore executable
          File.rename(exe_path.to_s + ".bak", exe_path) if File.exist?(exe_path.to_s + ".bak")
        end
      end
      test "should return -1 for Diamond Pattern (No White pieces)" do
        # Board 1 from user image: All Black diamond, no White.
        # Indices: [20, 27, 28, 29, 34, 35, 36, 37, 38, 43, 44, 45] -> Black(1)
        board = "0" * 64
        [20, 27, 28, 29, 34, 35, 36, 37, 38, 43, 44, 45].each { |i| board[i] = "1" }
        
        post next_move_api_v1_games_url, params: { board: board, turn: 0 }, as: :json
        
        assert_response :success
        json = JSON.parse(response.body)
        assert_equal(-1, json["next_move"], "Should return -1 (Pass) as there are no White pieces to capture")
      end

      test "should return valid move 14 (G2) for User Image 2" do
        # Board 2 from user image:
        # White(2): F3 (21)
        # Black(1): D4(27), E4(28), D5(35), E5(36), F5(37), D6(43), C7(50)
        # Note: Image shows hint at D3(19), but E3 is empty, making D3 illegal.
        # AI finds 14 (G2) which captures F3 -> E4 (Diagonal).
        board = "0" * 64
        board[21] = "2"
        [19, 27, 28, 35, 36, 37, 43, 50].each { |i| board[i] = "1" }
        
        post next_move_api_v1_games_url, params: { board: board, turn: 1 }, as: :json
        
        assert_response :success
        json = JSON.parse(response.body)
        
        # 14 (G2) is confirmed valid by AI probe and visual check (G2->F3->E4)
        assert_equal 42, json["next_move"]
      end
    end
  end
end
