import { useEffect, useState } from "react";
import { moveAnimation } from "./animation";
import type { Board, Move } from "./logic";

/**
 * Web アプリ用: 打つたびに progress を経過時間で 0→1 に進め、
 * <OthelloBoard discProps={...}> にそのまま渡せる関数を返す。
 * （Remotion では使わない。動画はフレームから progress を計算する）
 */
export const useMoveAnimation = (
  prev: Board | null,
  next: Board,
  move: Move | null,
  durationMs = 450,
) => {
  // progress がどの手のものかも持つ。手が変わった直後の描画で
  // 前の手の progress（=1 で完成形）を使ってしまうと、一瞬だけ完成形が映る
  const [anim, setAnim] = useState<{ move: Move | null; progress: number }>({
    move: null,
    progress: 1,
  });

  useEffect(() => {
    if (!move) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / durationMs);
      setAnim({ move, progress: p });
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [move, durationMs]);

  if (!prev || !move) return undefined;
  const progress = anim.move === move ? anim.progress : 0;
  return moveAnimation(prev, next, move, progress);
};
