// Unit tests for othello_ai logic
// This file tests the core functionality of the Othello AI implementation

#include "board.hpp"
#include "cell_evaluate.hpp"
// Note: Including ai1.cpp directly is necessary because it's not designed as a library.
// In production, this should be refactored into proper header/implementation separation.
#include "ai1.cpp"
#include <iostream>
#include <cassert>
#include <cstring>

// Simple test framework
int test_count = 0;
int passed_count = 0;

// Simple test registration without compiler-specific attributes
#define TEST(name) void name()

#define ASSERT_TRUE(condition) \
    do { \
        test_count++; \
        if (condition) { \
            passed_count++; \
            std::cout << "  ✓ PASS: " << #condition << std::endl; \
        } else { \
            std::cout << "  ✗ FAIL: " << #condition << std::endl; \
        } \
    } while (0)

#define ASSERT_FALSE(condition) ASSERT_TRUE(!(condition))

#define ASSERT_EQ(expected, actual) \
    do { \
        test_count++; \
        if ((expected) == (actual)) { \
            passed_count++; \
            std::cout << "  ✓ PASS: " << #actual << " == " << #expected << std::endl; \
        } else { \
            std::cout << "  ✗ FAIL: " << #actual << " (got " << (actual) << ") != " << #expected << " (expected " << (expected) << ")" << std::endl; \
        } \
    } while (0)

#define ASSERT_NE(not_expected, actual) \
    do { \
        test_count++; \
        if ((not_expected) != (actual)) { \
            passed_count++; \
            std::cout << "  ✓ PASS: " << #actual << " != " << #not_expected << std::endl; \
        } else { \
            std::cout << "  ✗ FAIL: " << #actual << " (got " << (actual) << ") == " << #not_expected << " (not expected)" << std::endl; \
        } \
    } while (0)

// Helper function to create a board from a string
board create_board_from_string(const std::string& board_string, int player) {
    int arr[64];
    for (int i = 0; i < hw2; ++i) {
        char c = board_string[i];
        if (c >= '0' && c <= '2') {
            arr[i] = c - '0';
        } else {
            arr[i] = vacant;
        }
    }
    board b;
    b.trans_idx(arr);
    b.player = player;
    return b;
}

// Helper function to count pieces on a board
void count_pieces(const board& b, int& black_count, int& white_count, int& empty_count) {
    int arr[64];
    b.trans_arr(arr);
    black_count = 0;
    white_count = 0;
    empty_count = 0;
    for (int i = 0; i < hw2; ++i) {
        if (arr[i] == black) black_count++;
        else if (arr[i] == white) white_count++;
        else empty_count++;
    }
}

// Test 1: Board initialization
TEST(test_board_initialization) {
    std::cout << "\n=== Test: Board Initialization ===" << std::endl;
    
    init_board();
    evaluate_init();
    
    // Check that initialization completes without error
    ASSERT_TRUE(true);
    
    // Test that pow3 array is correctly initialized
    ASSERT_EQ(1, pow3[0]);
    ASSERT_EQ(3, pow3[1]);
    ASSERT_EQ(9, pow3[2]);
    ASSERT_EQ(27, pow3[3]);
}

// Test 2: Board conversion
TEST(test_board_conversion) {
    std::cout << "\n=== Test: Board Conversion ===" << std::endl;
    
    init_board();
    
    // Create a simple board pattern
    int arr[64];
    for (int i = 0; i < hw2; ++i) arr[i] = vacant;
    arr[0] = black;
    arr[63] = white;
    
    board b;
    b.trans_idx(arr);
    
    // Convert back and verify
    int arr_back[64];
    b.trans_arr(arr_back);
    
    ASSERT_EQ(black, arr_back[0]);
    ASSERT_EQ(white, arr_back[63]);
    ASSERT_EQ(vacant, arr_back[32]);
}

// Test 3: Initial position legal moves
TEST(test_initial_position_legal_moves) {
    std::cout << "\n=== Test: Initial Position Legal Moves ===" << std::endl;
    
    init_board();
    
    // Standard Othello starting position
    // Position 27=white, 28=black, 35=black, 36=white
    std::string initial = "0000000000000000000000000002100000012000000000000000000000000000";
    board b = create_board_from_string(initial, black);
    
    // Black should have exactly 4 legal moves in the initial position
    int legal_count = 0;
    for (int i = 0; i < hw2; ++i) {
        if (b.legal_place(i)) {
            legal_count++;
        }
    }
    
    ASSERT_EQ(4, legal_count);
    
    // Specific legal moves for black in initial position
    ASSERT_TRUE(b.legal_place(19));  // D3
    ASSERT_TRUE(b.legal_place(26));  // C4
    ASSERT_TRUE(b.legal_place(37));  // F5
    ASSERT_TRUE(b.legal_place(44));  // E6
}

// Test 4: Move execution
TEST(test_move_execution) {
    std::cout << "\n=== Test: Move Execution ===" << std::endl;
    
    init_board();
    
    std::string initial = "0000000000000000000000000002100000012000000000000000000000000000";
    board b = create_board_from_string(initial, black);
    
    // Execute move at position 19 (D3)
    ASSERT_TRUE(b.legal_place(19));
    board b_after = b.move(19);
    
    // After the move, player should switch
    ASSERT_EQ(white, b_after.player);
    
    // Verify that the board state changed
    ASSERT_FALSE(b == b_after);
}

// Test 5: Pass move handling (no legal moves)
TEST(test_pass_move_scenario) {
    std::cout << "\n=== Test: Pass Move Scenario ===" << std::endl;
    
    init_board();
    
    // Create a position where one player has no legal moves
    // This is a contrived example - white pieces surrounded with no legal moves
    std::string no_moves = "1111111111111111111111111111111111111121111111111111111111111111";
    board b = create_board_from_string(no_moves, white);
    
    // White should have no legal moves
    bool has_legal_move = false;
    for (int i = 0; i < hw2; ++i) {
        if (b.legal_place(i)) {
            has_legal_move = true;
            break;
        }
    }
    
    ASSERT_FALSE(has_legal_move);
}

// Test 6: Corner positions
TEST(test_corner_positions) {
    std::cout << "\n=== Test: Corner Positions ===" << std::endl;
    
    init_board();
    
    std::string initial = "0000000000000000000000000002100000012000000000000000000000000000";
    board b = create_board_from_string(initial, black);
    
    // Corners should not be legal in initial position
    ASSERT_FALSE(b.legal_place(0));   // A1
    ASSERT_FALSE(b.legal_place(7));   // H1
    ASSERT_FALSE(b.legal_place(56));  // A8
    ASSERT_FALSE(b.legal_place(63));  // H8
}

// Test 7: Evaluate function
TEST(test_evaluate_function) {
    std::cout << "\n=== Test: Evaluate Function ===" << std::endl;
    
    init_board();
    evaluate_init();
    
    std::string initial = "0000000000000000000000000002100000012000000000000000000000000000";
    board b = create_board_from_string(initial, black);
    
    // Evaluation should return a value
    int eval = evaluate(b);
    
    // In initial position, evaluation should be relatively small (balanced)
    ASSERT_TRUE(eval >= -100 && eval <= 100);
}

// Test 8: AI search returns valid move
TEST(test_ai_search_returns_valid_move) {
    std::cout << "\n=== Test: AI Search Returns Valid Move ===" << std::endl;
    
    init_board();
    evaluate_init();
    
    std::string initial = "0000000000000000000000000002100000012000000000000000000000000000";
    board b = create_board_from_string(initial, black);
    
    // Search should return a valid move (not -1)
    int move = search(b, 3, 1);  // Shallow search for speed
    
    ASSERT_TRUE(move >= 0 && move < hw2);
    ASSERT_TRUE(b.legal_place(move));
}

// Test 9: Board equality operator
TEST(test_board_equality) {
    std::cout << "\n=== Test: Board Equality ===" << std::endl;
    
    init_board();
    
    std::string board_str = "0000000000000000000000000002100000012000000000000000000000000000";
    board b1 = create_board_from_string(board_str, black);
    board b2 = create_board_from_string(board_str, black);
    
    ASSERT_TRUE(b1 == b2);
    
    // Different player should not be equal
    board b3 = create_board_from_string(board_str, white);
    ASSERT_FALSE(b1 == b3);
}

// Test 10: Multiple moves sequence
TEST(test_move_sequence) {
    std::cout << "\n=== Test: Move Sequence ===" << std::endl;
    
    init_board();
    
    std::string initial = "0000000000000000000000000002100000012000000000000000000000000000";
    board b = create_board_from_string(initial, black);
    
    // Make a sequence of moves
    ASSERT_TRUE(b.legal_place(19));
    board b1 = b.move(19);
    ASSERT_EQ(white, b1.player);
    
    // Find a legal move for white
    bool found_legal = false;
    int white_move = -1;
    for (int i = 0; i < hw2; ++i) {
        if (b1.legal_place(i)) {
            white_move = i;
            found_legal = true;
            break;
        }
    }
    ASSERT_TRUE(found_legal);
    ASSERT_NE(-1, white_move);
    
    board b2 = b1.move(white_move);
    ASSERT_EQ(black, b2.player);
}

int main() {
    std::cout << "========================================" << std::endl;
    std::cout << "  Othello AI Unit Tests" << std::endl;
    std::cout << "========================================" << std::endl;
    
    // Run all tests (manually registered for portability)
    test_board_initialization();
    test_board_conversion();
    test_initial_position_legal_moves();
    test_move_execution();
    test_pass_move_scenario();
    test_corner_positions();
    test_evaluate_function();
    test_ai_search_returns_valid_move();
    test_board_equality();
    test_move_sequence();
    
    // Print summary
    std::cout << "\n========================================" << std::endl;
    std::cout << "  Test Results" << std::endl;
    std::cout << "========================================" << std::endl;
    std::cout << "Total tests: " << test_count << std::endl;
    std::cout << "Passed: " << passed_count << std::endl;
    std::cout << "Failed: " << (test_count - passed_count) << std::endl;
    
    if (test_count == passed_count) {
        std::cout << "\n✓ All tests passed!" << std::endl;
        return 0;
    } else {
        std::cout << "\n✗ Some tests failed!" << std::endl;
        return 1;
    }
}
