#include "ai1.cpp"
#include "board.hpp"
#include "cell_evaluate.hpp"
#include <cctype>
#include <iostream>
#include <stdio.h>
#include <string>

int arr[64];  // 盤面変換用の一時配列
int t;        // 現在の手番（0=黒, 1=白）

int main(int argc, char *argv[]) {
  // -----------------------------------------
  // APIモード: コマンドラインから盤面と手番を受け取り、最善手を出力
  // Usage: ./othello [board_string] [turn]
  // board_string: 64文字の文字列 '0'|'1'|'2'
  //   '0'=空きマス, '1'=黒石, '2'=白石
  //   左上(A1)から右下(H8)への順序
  // turn: 手番 0(黒番) or 1(白番)
  // Output: 最善手のインデックス(0-63)を標準出力へ
  // -----------------------------------------
  if (argc >= 3) {
    if (std::string(argv[1]).length() != hw2) {
      std::cerr << "Error: Invalid board length." << std::endl;
      return 1;
    }

    // 1. 盤面と評価テーブルの初期化
    init_board();
    evaluate_init();
    board b;

    // 2. 引数から盤面状態を復元
    std::string s_board = argv[1];
    for (int i = 0; i < hw2; ++i) {
      char c = s_board[i];
      if (c >= '0' && c <= '2') {
        arr[i] = c - '0';
      } else {
        arr[i] = vacant;  // 不正な文字の場合は空きマスとして扱う
      }
    }
    b.trans_idx(arr);

    // 3. 引数から手番を復元
    t = std::stoi(argv[2]);
    b.player = t + 1;  // APIフォーマット(0=黒,1=白)を内部フォーマット(1=黒,2=白)に変換

    // 4. AI探索を実行（9手先読み、オフセット3で反復深化）
    int mv = search(b, 9, 3);

    // 5. 最善手を標準出力へ出力
    std::cout << mv << std::endl;
    return 0;
  }

  // 引数が不足している場合の使用方法を表示
  std::cerr << "Usage: ./othello [board_string] [turn]" << std::endl;
  return 1;
}
