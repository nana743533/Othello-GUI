#pragma once  // FIX: ヘッダ先頭へ移動（#pragma once は先頭が基本）

#include "board.hpp"
#include <cstdint>      // FIX: uint8_t などを使う
#include <algorithm>    // FIX: std::max/min を使うなら

#define sc_w 64

// FIX: ヘッダに「実体」を置くなら inline 変数にする（多重定義回避, C++17以降）
inline int cell_weight[hw2] = {
     2714,  147,   69,  -18,  -18,   69,  147, 2714,
      147, -577, -186, -153, -153, -186, -577,  147,
       69, -186, -379, -122, -122, -379, -186,   69,
      -18, -153, -122, -169, -169, -122, -153,  -18,
      -18, -153, -122, -169, -169, -122, -153,  -18,
       69, -186, -379, -122, -122, -379, -186,   69,
      147, -577, -186, -153, -153, -186, -577,  147,
     2714,  147,   69,  -18,  -18,   69,  147, 2714
};

// FIX: 同様に inline。未初期化だと不安なら {} でゼロ初期化
inline int line_score[n_line][hw] = {};  // FIX: ゼロ初期化

// ------------------------------------------------------------
// 前計算：line_score[line_state][line_index] を埋める
// create_one_color(line_state, color) は
//   「その色の石がある位置 i に 1 を立てた 8bit マスク」を返す前提。
// ------------------------------------------------------------
inline void evaluate_init() {
    // FIX: static グローバルを廃止してローカル変数へ（累積バグ/初期化漏れ防止）
    for (int line = 0; line < n_line; ++line) {

        // FIX: 8bit マスクとして扱う（create_one_color が int を返す場合も下位8bitを使う）
        uint8_t bmask = static_cast<uint8_t>(create_one_color(line, black));
        uint8_t wmask = static_cast<uint8_t>(create_one_color(line, white));

        // linen は「この 8マスパターンをどの“ライン番号”に当てはめるか」
        // cell_weight は盤面上の位置で重みが変わるので、line_index ごとに前計算する
        for (int linen = 0; linen < hw; ++linen) {

            int bs = 0;      // FIX: linen ごとに必ず 0 に戻す（累積バグ防止）
            int ws = 0;      // FIX: linen ごとに必ず 0 に戻す

            for (int i = 0; i < 8; ++i) {
                // FIX: ビット判定はシフトして &1 が基本（(b<<...)==1 はほぼ成立しない）
                // i=0 を左端（MSB）として見るなら (7-i) を使う
                if ((bmask >> (7 - i)) & 1u) {
                    int n = linen * 8 + i;
                    bs += cell_weight[n];
                }
                if ((wmask >> (7 - i)) & 1u) {
                    int n = linen * 8 + i;
                    ws += cell_weight[n];
                }
            }

            line_score[line][linen] = bs - ws; // FIX: その linen の結果を格納
        }
    }
}

// ------------------------------------------------------------
// 評価関数（黒 + とみなす）
// ------------------------------------------------------------
inline int evaluate(const board& b) {  // FIX: コピーを避け const参照
    int x = 0;

    // ここはあなたの board_idx の仕様に依存
    // board_idx[0..3] と board_idx[4..7] を line_score に当てる作りは維持
    for (int i = 0; i < 4; ++i) {
        int line = b.board_idx[i];
        x += line_score[line][i];
    }
    for (int i = 0; i < 4; ++i) {
        int line = b.board_idx[4 + i];
        x += line_score[line][3 - i];
    }

    // 手番が白なら符号反転（negamax整合）
    if (b.player == white) x = -x;

    // FIX: 四捨五入を安全な式に（負数の % は直感とズレるので避ける）
    int value = (x >= 0) ? (x + 128) / 256 : (x - 128) / 256;

    // 評価値を[-64, 64] に収める
    if (value > sc_w) value = sc_w;
    else if (value < -sc_w) value = -sc_w;

    return value;
}

