// othello_ai ユニットテスト
// Othello AIの主要機能をテストします

#include "board.hpp"
#include "cell_evaluate.hpp"
// 注: ai1.cppを直接インクルードしています。本来はヘッダとして分離すべきですが、
// 現在の設計ではこの方法が必要です。
#include "ai1.cpp"
#include <iostream>
#include <cassert>
#include <cstring>

// シンプルなテストフレームワーク
int test_count = 0;
int passed_count = 0;

// テスト登録（コンパイラ依存の属性を使わない移植可能な実装）
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

// ヘルパー関数: 文字列から盤面を生成
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

// ヘルパー関数: 盤面の石の数を数える
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

// テスト1: 盤面の初期化
TEST(test_board_initialization) {
    std::cout << "\n=== テスト: 盤面の初期化 ===" << std::endl;
    
    init_board();
    evaluate_init();
    
    // 初期化がエラーなく完了することを確認
    ASSERT_TRUE(true);
    
    // pow3配列が正しく初期化されていることを確認
    ASSERT_EQ(1, pow3[0]);
    ASSERT_EQ(3, pow3[1]);
    ASSERT_EQ(9, pow3[2]);
    ASSERT_EQ(27, pow3[3]);
}

// テスト2: 盤面変換
TEST(test_board_conversion) {
    std::cout << "\n=== テスト: 盤面変換 ===" << std::endl;
    
    init_board();
    
    // シンプルな盤面パターンを作成
    int arr[64];
    for (int i = 0; i < hw2; ++i) arr[i] = vacant;
    arr[0] = black;
    arr[63] = white;
    
    board b;
    b.trans_idx(arr);
    
    // 逆変換して検証
    int arr_back[64];
    b.trans_arr(arr_back);
    
    ASSERT_EQ(black, arr_back[0]);
    ASSERT_EQ(white, arr_back[63]);
    ASSERT_EQ(vacant, arr_back[32]);
}

// テスト3: 初期局面の合法手
TEST(test_initial_position_legal_moves) {
    std::cout << "\n=== テスト: 初期局面の合法手 ===" << std::endl;
    
    init_board();
    
    // オセロの標準的な開始局面
    // 位置 27=白, 28=黒, 35=黒, 36=白
    std::string initial = "0000000000000000000000000002100000012000000000000000000000000000";
    board b = create_board_from_string(initial, black);
    
    // 初期局面では黒は正確に4つの合法手を持つ
    int legal_count = 0;
    for (int i = 0; i < hw2; ++i) {
        if (b.legal_place(i)) {
            legal_count++;
        }
    }
    
    ASSERT_EQ(4, legal_count);
    
    // 初期局面での黒の具体的な合法手
    ASSERT_TRUE(b.legal_place(19));  // D3
    ASSERT_TRUE(b.legal_place(26));  // C4
    ASSERT_TRUE(b.legal_place(37));  // F5
    ASSERT_TRUE(b.legal_place(44));  // E6
}

// テスト4: 着手の実行
TEST(test_move_execution) {
    std::cout << "\n=== テスト: 着手の実行 ===" << std::endl;
    
    init_board();
    
    std::string initial = "0000000000000000000000000002100000012000000000000000000000000000";
    board b = create_board_from_string(initial, black);
    
    // 位置19(D3)に着手
    ASSERT_TRUE(b.legal_place(19));
    board b_after = b.move(19);
    
    // 着手後、手番が交代する
    ASSERT_EQ(white, b_after.player);
    
    // 盤面状態が変化したことを確認
    ASSERT_FALSE(b == b_after);
}

// テスト5: パス局面の処理（合法手なし）
TEST(test_pass_move_scenario) {
    std::cout << "\n=== テスト: パス局面 ===" << std::endl;
    
    init_board();
    
    // プレイヤーが合法手を持たない局面を作成
    // これは人工的な例 - 白石が包囲されて合法手がない
    std::string no_moves = "1111111111111111111111111111111111111121111111111111111111111111";
    board b = create_board_from_string(no_moves, white);
    
    // 白は合法手を持たないはず
    bool has_legal_move = false;
    for (int i = 0; i < hw2; ++i) {
        if (b.legal_place(i)) {
            has_legal_move = true;
            break;
        }
    }
    
    ASSERT_FALSE(has_legal_move);
}

// テスト6: 角の位置
TEST(test_corner_positions) {
    std::cout << "\n=== テスト: 角の位置 ===" << std::endl;
    
    init_board();
    
    std::string initial = "0000000000000000000000000002100000012000000000000000000000000000";
    board b = create_board_from_string(initial, black);
    
    // 初期局面では角は合法手ではない
    ASSERT_FALSE(b.legal_place(0));   // A1
    ASSERT_FALSE(b.legal_place(7));   // H1
    ASSERT_FALSE(b.legal_place(56));  // A8
    ASSERT_FALSE(b.legal_place(63));  // H8
}

// テスト7: 評価関数
TEST(test_evaluate_function) {
    std::cout << "\n=== テスト: 評価関数 ===" << std::endl;
    
    init_board();
    evaluate_init();
    
    std::string initial = "0000000000000000000000000002100000012000000000000000000000000000";
    board b = create_board_from_string(initial, black);
    
    // 評価値を計算
    int eval = evaluate(b);
    
    // 初期局面では評価値は比較的小さい（バランスが取れている）
    ASSERT_TRUE(eval >= -100 && eval <= 100);
}

// テスト8: AI探索が有効な手を返す
TEST(test_ai_search_returns_valid_move) {
    std::cout << "\n=== テスト: AI探索 ===" << std::endl;
    
    init_board();
    evaluate_init();
    
    std::string initial = "0000000000000000000000000002100000012000000000000000000000000000";
    board b = create_board_from_string(initial, black);
    
    // 探索は有効な手を返すはず（-1ではない）
    int move = search(b, 3, 1);  // 速度のため浅い探索
    
    ASSERT_TRUE(move >= 0 && move < hw2);
    ASSERT_TRUE(b.legal_place(move));
}

// テスト9: 盤面の等価性演算子
TEST(test_board_equality) {
    std::cout << "\n=== テスト: 盤面の等価性 ===" << std::endl;
    
    init_board();
    
    std::string board_str = "0000000000000000000000000002100000012000000000000000000000000000";
    board b1 = create_board_from_string(board_str, black);
    board b2 = create_board_from_string(board_str, black);
    
    ASSERT_TRUE(b1 == b2);
    
    // 手番が異なる場合は等しくない
    board b3 = create_board_from_string(board_str, white);
    ASSERT_FALSE(b1 == b3);
}

// テスト10: 連続着手のシーケンス
TEST(test_move_sequence) {
    std::cout << "\n=== テスト: 連続着手 ===" << std::endl;
    
    init_board();
    
    std::string initial = "0000000000000000000000000002100000012000000000000000000000000000";
    board b = create_board_from_string(initial, black);
    
    // 連続して着手
    ASSERT_TRUE(b.legal_place(19));
    board b1 = b.move(19);
    ASSERT_EQ(white, b1.player);
    
    // 白の合法手を探す
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
    std::cout << "  Othello AI ユニットテスト" << std::endl;
    std::cout << "========================================" << std::endl;
    
    // 全テストを実行（移植性のため手動登録）
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
    
    // サマリー出力
    std::cout << "\n========================================" << std::endl;
    std::cout << "  テスト結果" << std::endl;
    std::cout << "========================================" << std::endl;
    std::cout << "合計: " << test_count << std::endl;
    std::cout << "成功: " << passed_count << std::endl;
    std::cout << "失敗: " << (test_count - passed_count) << std::endl;
    
    if (test_count == passed_count) {
        std::cout << "\n✓ 全てのテストが成功しました！" << std::endl;
        return 0;
    } else {
        std::cout << "\n✗ 失敗したテストがあります！" << std::endl;
        return 1;
    }
}
