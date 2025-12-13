#include <iostream>
#pragma once

using namespace std;
#define hw  8
#define hw2  64
#define n_board_idx 38
#define n_line  6561
#define black 0
#define white 1
#define vacant 2


const int global_place[n_board_idx][hw]
{
    {0, 1, 2, 3, 4, 5, 6, 7},{8, 9, 10, 11, 12, 13, 14, 15},{16, 17, 18, 19, 20, 21, 22, 23},{24, 25, 26, 27, 28, 29, 30, 31},{32, 33, 34, 35, 36, 37, 38, 39},{40, 41, 42, 43, 44, 45, 46, 47},{48, 49, 50, 51, 52, 53, 54, 55},{56, 57, 58, 59, 60, 61, 62, 63},
    {0, 8, 16, 24, 32, 40, 48, 56},{1, 9, 17, 25, 33, 41, 49, 57},{2, 10, 18, 26, 34, 42, 50, 58},{3, 11, 19, 27, 35, 43, 51, 59},{4, 12, 20, 28, 36, 44, 52, 60},{5, 13, 21, 29, 37, 45, 53, 61},{6, 14, 22, 30, 38, 46, 54, 62},{7, 15, 23, 31, 39, 47, 55, 63},
    {5, 14, 23, -1, -1, -1, -1, -1},{4, 13, 22, 31, -1, -1, -1, -1},{3, 12, 21, 30, 39, -1, -1, -1},{2, 11, 20, 29, 38, 47, -1, -1},{1, 10, 19, 28, 37, 46, 55, -1},{0, 9, 18, 27, 36, 45, 54, 63},{8, 17, 26, 35, 44, 53, 62, -1},{16, 25, 34, 43, 52, 61, -1, -1},{24, 33, 42, 51, 60, -1, -1, -1},{32, 41, 50, 59, -1, -1, -1, -1},{40, 49, 58, -1, -1, -1, -1, -1},
    {2, 9, 16, -1, -1, -1, -1, -1},{3, 10, 17, 24, -1, -1, -1, -1},{4, 11, 18, 25, 32, -1, -1, -1},{5, 12, 19, 26, 33, 40, -1, -1},{6, 13, 20, 27, 34, 41, 48, -1},{7, 14, 21, 28, 35, 42, 49, 56},{15, 22, 29, 36, 43, 50, 57, -1},{23, 30, 37, 44, 51, 58, -1, -1},{31, 38, 45, 52, 59, -1, -1, -1},{39, 46, 53, 60, -1, -1, -1, -1},{47, 54, 61, -1, -1, -1, -1, -1}
};

const int global_move[n_board_idx]
{
    1,1,1,1,1,1,1,1,//横
    1,1,1,1,1,1,1,1,//縦
    9,9,9,9,9,9,9,9,9,9,9,//右下がりの斜め
    7,7,7,7,7,7,7,7,7,7,7//左下がりの斜め
};





int move_arr[2][n_line][hw][2];
int legal_arr[2][n_line][hw];
int place_included[hw2][4];
int local_place[hw2][4];
int flip_arr[2][n_line][hw];
int put_arr[2][n_line][hw];
int pop_digit[n_line][hw];
 int pow3[hw];





//あるインデックスをそれぞれの色についてビットボード化する
inline int create_one_color(int idx,const int color)
{
   
    int res = 0;
    for (int i = 0; i < hw; ++i) {
        if (idx % 3 == color) {
            res |= 1 << i;
        }
        idx=idx/3;
    }
    return res;
}

inline int trans(const int pt, const int k) {
    if (k == 0)
        return pt << 1;
    else
        return pt >> 1;
}


// あるビットボードにおいて着手したとき返す石の数をカウント（左右）それぞれにおいて
inline int move_line_half(const int p, const int o, const int place, const int k) {
    int mask;
    int res = 0;
    int pt = 1 << (hw - 1 - place);
    if (pt & p || pt & o)
        return res;
    mask = trans(pt, k);
    while (mask && (mask & o)) {
        ++res;
        mask = trans(mask, k);
        if (mask & p)
            return res;
    }
    return 0;
}



void init_board()
{

     //k^iを出力するための処理
       pow3[0]=1;
    for(int j=1;j<hw;j++)
    {
       pow3[j]=pow3[j-1]*3;
    }
    


    //pop_digit[n_line][hw]を埋める
    for(int i=0;i<n_line;i++)
    {
        for(int j=0;j<hw;j++){
            pop_digit[i][j]=i%pow3[j];
        }
    }
   
    //place_included[hw2][4]を埋める処理
    //local_place[hw2][4]を埋める処理

    for(int g_place=0;g_place<hw2;++g_place)
    {
        for(int i=0;i<4;++i){
             place_included[g_place][i]=-1;
            local_place[g_place][i]=-1;
        }
    }

    for(int g_place=0;g_place<hw2;++g_place){
    int c=0;
    int sam;
    for(int idx=0;idx<n_board_idx;++idx){
        for(int place=0;place<hw;++place)
        {
            sam=global_place[idx][place];

            if(sam==g_place)
            {
            place_included[g_place][c]=idx;
            local_place[g_place][c]=place;
            c=c+1;
            break;
            }
            
        }
    }
    }
   



    //legal_arrを埋める処理
    for(int idx=0;idx<n_line;++idx)
    {
        int b = create_one_color(idx,0);
        int w = create_one_color(idx,1);

        for(int place=0;place<hw;++place)
        {
            //黒番でおける枚数を格納（左右）
             move_arr[black][idx][place][0]= move_line_half(b,w,place,0);//左
             move_arr[black][idx][place][1]= move_line_half(b,w,place,1);//右

            if( move_arr[black][idx][place][0]==0 && move_arr[black][idx][place][1]==0)
            legal_arr[black][idx][place]=false;
             else
             legal_arr[black][idx][place]=true;

            //白番でおける枚数を格納（左右）
             move_arr[white][idx][place][0]= move_line_half(w,b,place,0);//左
            move_arr[white][idx][place][1]= move_line_half(w,b,place,1);//右

            if( move_arr[white][idx][place][0]==0 && move_arr[white][idx][place][1]==0)
            legal_arr[white][idx][place]=false;
             else
             legal_arr[white][idx][place]=true;
        }

       

    }

    //flip_arr[2][n_line][hw],put_arr[2][n_line][hw]を埋める処理

    for(int line=0;line<n_line;line++ )
    {
     int b,w,add,bp,wp,bw;

        b=create_one_color(line,black);
        w=create_one_color(line,white);

        for(int p=0;p<hw;p++)
        {
            add = pow3[8-1-p];
            bp = (b >> (8-1-p)) & 1;
            wp = (w >> (8-1-p)) & 1;

             put_arr[black][line][p] = line;
             put_arr[white][line][p] = line;
             flip_arr[white][line][p] = line;
             flip_arr[black][line][p] = line;

            if(bp==0&&wp==0)
            {
                put_arr[black][line][p]=line-2*add; 
                put_arr[white][line][p]=line-1*add; 
            }
            else if(bp==1&&wp==0)
            {
                flip_arr[white][line][p]=line+1*add; 
            }
            else if(bp==0&&wp==1)
            {
                flip_arr[black][line][p]=line-1*add;
            }
        }
    }
    


}



class board{

    public:
    int board_idx[n_board_idx];
    int player;
    int value;

    public:
    //operaterの定義（”＝＝”、”＜”、”！＝”）

    bool operator==(const board& another) const {
        if(this->player!=another.player)
        return false;
        if(this->board_idx!=another.board_idx)
        return false;

    return true;
}

bool operator!=(const board& another) const {
    return !this<=(operator==(another));
}


    bool operator<(const board& another) const {
    return this->value > another.value;
}

//ハッシュ関数
   struct hash {
            typedef size_t result_type;

            // ハッシュテーブルで使うためのハッシュ関数
            // hash = sum(i=0からi=7)(インデックス[i] * 17^i)
            // 17を使うとやたら性能が良い。
            size_t operator()(const board& b) const {
                return
                    b.board_idx[0] + 
                    b.board_idx[1] * 17 + 
                    b.board_idx[2] * 289 + 
                    b.board_idx[3] * 4913 + 
                    b.board_idx[4] * 83521 + 
                    b.board_idx[5] * 1419857 + 
                    b.board_idx[6] * 24137549 + 
                    b.board_idx[7] * 410338673;
            }
        };


    //合法判定を行う関数
    inline bool legal_place(int g_place)
    {

        int line,p;
        for(int i=0;i<4;i++){
        line= place_included[g_place][i];
        if (line == -1) break;
        p=local_place[g_place][i];
            if(legal_arr[player][board_idx[line]][p]==true)
           return true;
        }
        return false;
    };





    //idx→[]
inline void trans_arr(int arr[]){
    // まずすべて空きで初期化
    for (int g = 0; g < hw2; ++g) {
        arr[g] = vacant;
    }

    // 0〜7番目の board_idx は横一列（行）だと仮定
    for (int row = 0; row < hw; ++row) {
        int line = board_idx[row];  // 行の 3進数表現
        for (int col = 0; col < hw; ++col) {
            int trit = (line / pow3[hw - 1 - col]) % 3;  // その行の col 列目の値 (0,1,2)
            arr[row * 8 + col] = trit;
        }
    }
}



    //[]→idx
    inline void trans_idx(const int arr[]){
        int arr_n = 0;
        for(int i=0;i<n_board_idx;i++){
            int sum=0;
            for(int j=0;j<hw;j++){
                if(global_place[i][j]==-1)
                arr_n = 2;
                else
                arr_n = arr[global_place[i][j]];
               sum += pow3[hw-1-j]*arr_n;
            }
            board_idx[i] = sum;

        }
    };




    // 着手
        inline board move(const int g_place) {
            board res;
            for (int i = 0; i < n_board_idx; ++i)
                res.board_idx[i] = this->board_idx[i];
            move_p(&res, g_place, 0);
            move_p(&res, g_place, 1);
            move_p(&res, g_place, 2);
            if (place_included[g_place][3] != -1)
                move_p(&res, g_place, 3);
            for (int i = 0; i < 3; i++)
                res.board_idx[place_included[g_place][i]] = put_arr[this->player][res.board_idx[place_included[g_place][i]]][local_place[g_place][i]];
            if (place_included[g_place][3] != -1)
                res.board_idx[place_included[g_place][3]] = put_arr[this->player][res.board_idx[place_included[g_place][3]]][local_place[g_place][3]];
            res.player = 1 - this->player;
            return res;
        }

    

private:
        // 石をひっくり返す
        inline void flip(board *res, int g_place) {
            for (int i = 0; i < 3; ++i)
                res->board_idx[place_included[g_place][i]] = flip_arr[this->player][res->board_idx[place_included[g_place][i]]][local_place[g_place][i]];
            if (place_included[g_place][3] != -1)
                res->board_idx[place_included[g_place][3]] = flip_arr[this->player][res->board_idx[place_included[g_place][3]]][local_place[g_place][3]];
        }

        // 石をひっくり返す
        inline void move_p(board *res, int g_place, int i) {
            int j, place;
            place = local_place[g_place][i];
            for (j = 1; j <= move_arr[this->player][this->board_idx[place_included[g_place][i]]][place][0]; ++j)
                flip(res, g_place - global_move[place_included[g_place][i]] * j);
            for (j = 1; j <= move_arr[this->player][this->board_idx[place_included[g_place][i]]][place][1]; ++j)
                flip(res, g_place + global_move[place_included[g_place][i]] * j);
        }

};
    


    










//     //着手を行う関数
//     inline void put(int g_place){
//     int line, p, rl, rr, pos;

//     for (int i = 0; i < 4; i++) {
//         line = place_included[g_place][i];  // このマスを含むライン番号
//         if (line == -1)
//             break;

//         p = local_place[g_place][i];        // そのライン内での位置 (

//         rl = move_arr[this->player][board_idx[line]][p][0];  // 左側にひっくり返す個数
//         rr = move_arr[this->player][board_idx[line]][p][1];  // 右側にひっくり返す個数

//         // 左方向
//         pos = p - 1;
//         for (int l = 0; l < rl; l++) {
//             board_idx[line] = flip_arr[this->player][board_idx[line]][pos];
//             pos -= 1;
//         }

//         // 右方向
//         pos = p + 1;
//         for (int r = 0; r < rr; r++) {
//             board_idx[line] = flip_arr[this->player][board_idx[line]][pos];
//             pos += 1;
//         }

//         board_idx[line] = put_arr[this->player][board_idx[line]][p];
//         //test
//         printf("%i番目のラインにおいて　rl:%d , rr:%d , g_place:%d , p:%d \n",i,rl,rr,g_place,p);
//     }
// }

    
    

    



//     盤面を動かす関数
//     inline board move_b(int g_place){
//     board res = *this;  
//     res.put(g_place);   
//     return res;
// };