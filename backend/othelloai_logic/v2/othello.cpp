#include "ai1.cpp"
#include "board.hpp"
#include "cell_evaluate.hpp"
#include <cctype>
#include <iostream>
#include <stdio.h>
#include <string>

int arr[64];
int t; // 手番

int main(int argc, char *argv[]) {
  // -----------------------------------------
  // APIモード
  // Usage: ./othello [board_string] [turn]
  // board_string: 64文字の '0'|'1'|'2'
  // turn: 0(black) or 1(white)
  // -----------------------------------------
  if (argc >= 3) {
    if (std::string(argv[1]).length() != hw2) {
      std::cerr << "Error: Invalid board length." << std::endl;
      return 1;
    }

    // 1. 初期化
    init_board();
    evaluate_init();
    board b;

    // 2. 引数から盤面を復元
    std::string s_board = argv[1];
    for (int i = 0; i < hw2; ++i) {
      // Input: '0'=Empty, '1'=Black, '2'=White
      // C++:    0=Empty,   1=Black,   2=White (Aligned)
      char c = s_board[i];
      if (c >= '0' && c <= '2') {
        arr[i] = c - '0';
      } else {
        arr[i] = vacant; // Default to Vacant (0)
      }
    }
    b.trans_idx(arr);

    // 3. 引数から手番を復元
    t = std::stoi(argv[2]); // 0 or 1
    // API(0=Black, 1=White) -> C++(1=Black, 2=White)
    b.player = t + 1;

    // 4. 探索 (9手読み, offset 3は調整パラメータ)
    int mv = search(b, 9, 3);

    // 5. 結果出力 (標準出力へ)
    std::cout << mv << std::endl;
    return 0;
  }

  // 引数が足りない場合
  std::cerr << "Usage: ./othello [board_string] [turn]" << std::endl;
  return 1;
}
