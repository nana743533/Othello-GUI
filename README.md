# Othello GUI

**Modern, Simple, and Neumorphism.**

`othelloai_logic` に実装された強力なオセロAIと対戦するための、洗練されたGUIアプリケーションです。
Next.jsを用いたモダンなWebアプリケーションとして構築され、Dockerによる手軽なローカル開発環境を提供します。

<p align="center">
  <!-- 将来的にスクリーンショットをここに配置 -->
  <img src="https://via.placeholder.com/800x400.png?text=Neumorphism+UI+Coming+Soon" alt="UI Preview" width="100%">
</p>

## ✨ Features

- **Neumorphism Design**: 物理的な凹凸を感じさせる、柔らかく近未来的なニューモーフィズムデザインを採用。シンプルかつ没入感のあるプレイ体験を提供します。
- **Modern Tech Stack**: フロントエンドには **Next.js** を採用し、高速でインタラクティブなUIを実現。
- **Connects to AI**: `othelloai_logic` 配下のAIロジックと連携し、高度な対戦が可能（予定）。
- **Dockerized**: 開発環境はDockerで完結。コマンド一つで環境構築が可能です。

## 🛠 Tech Stack

- **Frontend**: Next.js (React)
- **Styling**: CSS (Neumorphism Design System)
- **Infrastructure**: Docker (Local Development)
- **AI Logic**: `othelloai_logic` (Python/C++ etc. - Depend on implementation)

## 🚀 Getting Started

このプロジェクトはローカル開発環境の起動にDockerを使用します。

### Prerequisites

- Docker Desktop
- Node.js (Optional: for local modification without Docker)

### Installation & Run

```bash
# クローン
git clone https://github.com/nana743533/Othello_GUI.git
cd Othello_GUI

# Docker環境の立ち上げ（予定）
docker compose up
```

Webブラウザで `http://localhost:3000` にアクセスしてください。

## 📂 Project Structure

```
Othello_GUI/
├── othelloai_logic/  # オセロAIのコアロジック
├── src/              # Next.js アプリケーション (To be created)
├── public/           # 静的ファイル
└── ...
```

## 📅 Roadmap

- [ ] Next.js プロジェクトの初期化
- [ ] ニューモーフィズムUIコンポーネントの実装
- [ ] `othelloai_logic` との連携APIの実装
- [ ] Docker環境の整備
- [ ] デプロイ

## 🤝 Contributing

Collaborators are welcome!
Please check the repository settings for contribution guidelines.

---
Created by [nana743533](https://github.com/nana743533)
