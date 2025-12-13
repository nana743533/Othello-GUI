#include "board.hpp"
#include <iostream>
#pragma once
#define sc_w 64

int cell_weight[hw2] = {
    2714, 147,  69,   -18,  -18,  69,   147,  2714, 147,  -577, -186,
    -153, -153, -186, -577, 147,  69,   -186, -379, -122, -122, -379,
    -186, 69,   -18,  -153, -122, -169, -169, -122, -153, -18,  -18,
    -153, -122, -169, -169, -122, -153, -18,  69,   -186, -379, -122,
    -122, -379, -186, 69,   147,  -577, -186, -153, -153, -186, -577,
    147,  2714, 147,  69,   -18,  -18,  69,   147,  2714

};

int line_score[n_line][hw];

// cell_score[n_line][hw]を埋める処理
static int b, w, n, value, bs, wscore;
void evaluate_init() {
  for (int line = 0; line < n_line; line++) {

    b = create_one_color(line, black);
    w = create_one_color(line, white);
    for (int linen = 0; linen < hw; linen++) {
      for (int i = 0; i < 8; i++) {
        if ((b << 8 - 1 - i) == 1) {
          n = linen * 8 + i;
          bs += cell_weight[n];
        }
        if ((w << 8 - 1 - i) == 1) {
          n = linen * 8 + i;
          wscore += cell_weight[n];
        }
      }
      value = bs - wscore;
      line_score[line][linen] = value;
    }
  }
}

// 評価関数(xの値は黒が＋と考える)
int evaluate(board b) {
  int line, value;
  int x = 0;

  for (int i = 0; i < 4; ++i) {
    line = b.board_idx[i];
    x += line_score[line][i];
  }
  for (int i = 0; i < 4; ++i) {
    line = b.board_idx[4 + i];
    x += line_score[line][3 - i];
  }

  if (b.player == white)
    x = -x;

  if (x >= 0) {
    if (x % 256 >= 128)
      x += 128;
  } else {
    if (x % 256 <= -128)
      x -= 128;
  }

  value = x / 256;

  if (value > sc_w) // 評価値を[-64, 64] に収める
    value = sc_w;
  else if (value < -sc_w)
    value = -sc_w;

  return value;
};
