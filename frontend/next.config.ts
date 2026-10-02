import type { NextConfig } from "next";

// ブラウザは同じドメインの /api/v1/* を呼び、ここでバックエンド（Cloud Run）に中継する。
// ローカルでバックエンドも動かすときは BACKEND_URL=http://localhost:3001 のように上書きする
const BACKEND_URL =
  process.env.BACKEND_URL ?? "https://othello-backend-487824728329.asia-northeast1.run.app";

const nextConfig: NextConfig = {
  devIndicators: false,
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${BACKEND_URL}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
