# othello（盤の見た目とアニメーション）

自己紹介動画（2026-10-02）で作ったオセロ盤を、そのままコピーしたもの。
移植元は `261002-self-intro-video` リポジトリの `src/othello/`（コミット `bc63667`。GitHub には無くローカルのみ）。

**このフォルダの中身は移植元と同じに保つ**（直すときは移植元と揃える）。
Othello_GUI の盤の形式（長さ64の配列・-1/0/1）との変換は `../Board.tsx` で行う。

| ファイル | 中身 |
|---|---|
| `OthelloBoard.tsx` | 見た目（盤・石・光る輪）。依存は React だけ・inline style。色は `OTHELLO_COLORS` |
| `logic.ts` | 盤の型（`board[y][x]`、0=空・1=黒・2=白）とルール。Othello_GUI では型だけ使う |
| `animation.ts` | 置く・裏返す演出を progress（0→1）から計算する `moveAnimation` |
| `useMoveAnimation.ts` | 経過時間で progress を進める hook |
