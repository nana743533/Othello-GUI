#include "ai1.cpp"
#include "board.hpp"
#include "cell_evaluate.hpp"
#include <cctype>
#include <iostream>
#include <stdio.h>
#include <string>

int arr[64];
int p_turn, t; // playerの手番、現在のターン
int end_game = 0;

// 入力を座標に変換
int get_to_arr(const std::string &s) {
  if (s.size() < 2)
    return -1;

  char file = std::tolower(s[0]);
  char rank = s[1];

  if (file < 'a' || file > 'h')
    return -1;
  int col = file - 'a';

  if (rank < '1' || rank > '8')
    return -1;
  int row = (rank - '1');

  int res = row * 8 + col;

  return res;
}

// 盤面をプリント
void print() {
  for (int i = 0; i < hw; i++) {
    switch (i) {
    case 0:
      printf(" A");
      break;
    case 1:
      printf(" b");
      break;
    case 2:
      printf(" c");
      break;
    case 3:
      printf(" d");
      break;
    case 4:
      printf(" e");
      break;
    case 5:
      printf(" f");
      break;
    case 6:
      printf(" g");
      break;
    case 7:
      printf(" h");
      break;
    }
  }
  printf("\n");

  for (int i = 0; i < hw; i++) {
    printf("%d", i + 1);
    for (int j = 0; j < hw; j++) {
      if (arr[8 * i + j] == black)
        printf("* ");
      else if (arr[8 * i + j] == white)
        printf("O ");
      else
        printf("- ");
    }

    printf("\n");
  }

  printf("\n");
  return;
}

// 盤面の初期化～手番選択まで

void init_game(board &b) {

  // 盤面初期化
  for (int i = 0; i < hw2; i++) {
    arr[i] = vacant;
  }
  arr[27] = white;
  arr[28] = black;
  arr[35] = black;
  arr[36] = white;

  // 黒番スタート
  t = black;
  b.player = t;
  b.trans_idx(arr);

  // 手番選択
  do {
    printf("あなたの手番を選択して！（黒：0、白：1）");
    std::cin >> p_turn;
  } while (p_turn != black && p_turn != white);

  print();
};

// arr を更新する（合法手でなければ何もしない）

const int dx[8] = {1, 1, 0, -1, -1, -1, 0, 1};
const int dy[8] = {0, 1, 1, 1, 0, -1, -1, -1};
inline int R(int p) { return p / 8; };
inline int C(int p) { return p % 8; };

void update_arr(int t, int p) {
  int opponent = 1 - t;

  int r0 = R(p);
  int c0 = C(p);

  if (arr[p] != vacant)
    return;

  bool flipped_any = false;

  for (int dir = 0; dir < 8; dir++) {
    int r = r0 + dy[dir];
    int c = c0 + dx[dir];

    if (r < 0 || r >= 8 || c < 0 || c >= 8)
      continue;
    if (arr[r * 8 + c] != opponent)
      continue;

    int r2 = r, c2 = c;
    while (1) {
      r2 += dy[dir];
      c2 += dx[dir];

      if (r2 < 0 || r2 >= 8 || c2 < 0 || c2 >= 8)
        break;

      int pos = r2 * 8 + c2;

      if (arr[pos] == vacant)
        break;

      if (arr[pos] == t) {

        int rr = r, cc = c;
        while (!(rr == r2 && cc == c2)) {
          arr[rr * 8 + cc] = t;
          rr += dy[dir];
          cc += dx[dir];
        }
        flipped_any = true;
        break;
      }
    }
  }

  if (flipped_any) {
    arr[p] = t;
  }
};

int main() {
  std::cin;
  board b;

  // 初期化
  init_board();
  evaluate_init();
  init_game(b);
  print();

  while (1) {

    // 人間側の手番
    if (t == p_turn) {

      // 合法手があるかチェック
      bool has_move = false;
      for (int i = 0; i < hw2; i++) {
        if (b.legal_place(i)) {
          has_move = true;
          break;
        }
      }

      if (!has_move) {
        printf("あなたはパスです。\n");
        end_game++;
      } else {
        // 合法手があるので入力受付
        int frag = 0;
        int p = 0;

        do {
          printf("座標を入力して！（左からabc...,上から123...）");
          std::string input;
          std::cin >> input;
          p = get_to_arr(input);
          if (b.legal_place(p) == false)
            printf("おけません");
          else
            frag = 1;
        } while (frag == 0);

        if (p == -1) {
          std::cout << "座標の形式が不正です\n";
        } else {
          // 人間の着手として使う
          update_arr(t, p);
          b.trans_idx(arr);
          print();
        }
      }
    }

    // AIの手番
    else {
      // 合法手があるかチェック
      bool has_move = false;
      for (int i = 0; i < hw2; i++) {
        if (b.legal_place(i)) {
          has_move = true;
          break;
        }
      }

      if (!has_move) {
        printf("AIはパスです。\n");
        end_game++;
      } else {
        int mv = search(b, 10);

        if (mv >= 0 && mv < hw2) {
          update_arr(t, mv);
          b.trans_idx(arr);
          end_game = 0;
          print();

        } else {

          printf("AIの着手が異常です。\n");
          end_game++;
        }
      }
    }

    if (end_game >= 2) {
      printf("ゲーム終了（両者パス）\n");
      break;
    }

    // ターン変更
    t = (t == black) ? white : black;
    b.player = (b.player == black) ? white : black;
  }

  return 0;
}
