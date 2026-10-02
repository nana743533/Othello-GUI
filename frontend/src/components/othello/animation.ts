import type { DiscProps } from "./OthelloBoard";
import type { Board, Move } from "./logic";

const easeOutBack = (p: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2);
};

/**
 * 直前の1手の演出（置いた石が弾んで出る・はさまれた石が裏返る）。
 * progress は 0（打った瞬間）→ 1（演出終わり）。
 * 何で progress を進めるかは呼ぶ側の自由（Remotion ならフレーム、Web なら経過時間）。
 */
export const moveAnimation =
  (prev: Board, next: Board, move: Move, progress: number) =>
  (x: number, y: number): Partial<DiscProps> | undefined => {
    if (progress >= 1) return undefined;
    const p = Math.max(0, progress);
    if (x === move.x && y === move.y) return { scale: easeOutBack(p) };
    const before = prev[y][x];
    if (before !== 0 && before !== next[y][x]) {
      // 厚みが0になる瞬間に色を入れ替える
      return p < 0.5
        ? { color: before, scaleX: 1 - 2 * p }
        : { scaleX: 2 * p - 1 };
    }
    return undefined;
  };
