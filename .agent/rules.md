# AI Agent Rules for Othello GUI

このプロジェクトで作業するすべてのAIエージェントは、以下のルールに従ってください。

## 1. Project Context
- **Goal**: C++で実装された強力なオセロAI (`othelloai_logic`) と対戦できる、モダンなGUIアプリケーションを構築する。
- **Core Stack**: 
    - Frontend: **Next.js** (App Router推奨)
    - Containerization: **Docker** (Dev server runs in Docker)
    - Logic: Python/C++ (Integration needed)

## 2. Design System: Neumorphism (Soft UI)
デザインは一貫して**Neumorphism**を採用してください。フラットデザインではありません。

### Color Palette
- **Background (Base)**: `#E0E5EC` (明るいグレー)
- **Text**: `#4A5568` (ダークグレー)
- **Accent**: `#4FD1C5` (Teal), `#F6AD55` (Orange) - 控えめに使用

### Shapes & Shadows
物理的な凹凸を表現するために、2色のシャドウ（光と影）を使用します。

**Light Source**: Top-Left (左上)

- **Flat Element (Normal UI)**:
  ```css
  background: #E0E5EC;
  box-shadow: 9px 9px 16px rgb(163,177,198,0.6), 
              -9px -9px 16px rgba(255,255,255, 0.5);
  border-radius: 20px; /* Soft roundness */
  ```

- **Pressed Element (Active state / Board Cells)**:
  ```css
  background: #E0E5EC;
  box-shadow: inset 6px 6px 10px 0 rgba(163,177,198, 0.7), 
              inset -6px -6px 10px 0 rgba(255,255,255, 0.8);
  ```

### Othello Board Specifics
- **Board Surface**: Deep Green (`#2F5D40`など) もしくは上記Baseカラー。
  - ユーザー要望により **Deep Green** を優先する場合あり。その場合もNeumorphismの凹凸（Inset Shadow）を適用すること。
- **Discs**: 3D感のある光沢を持たせる（Linear Gradientなどを使用）。

## 3. Communication
- **Language**: すべての会話、計画、コミットメッセージ等は **日本語** で行ってください。
- **Style**: 親切で、技術的な根拠に基づいた提案を行うこと。
- **Explanation**: 実装後は毎回、以下の3点を含めて日本語で説明してください。
    - **What**: どのような実装をしたのか
    - **How**: どのように実装したのか
    - **Why**: なぜそれをしようと思ったのか

## 4. Development Workflow
- **Granular Commits**: 実装を行い、動作確認ができたら**然るべきタイミングできちんとコミット**してください。一気に作りすぎてはいけません。
- **Incremental Changes**: ファイル作成や修正は一気に行わず、ステップごとに確認を挟んでください。
- **Documentation**: 
    - `task.md` と `implementation_plan.md` は常に最新かつ詳細（日本語）に保つこと。
    - 作業前に計画をアップデートし、作業後にチェックを入れること。
- **Q&A Priority**: ユーザーからの質問や懸念点（気になったところ）には必ず回答し、解決してから元のタスクに戻ってください。

## 5. File Structure
- 新しいコンポーネントを作成する際は、必ず `src/components` 配下に配置する（Next.js構築後）。
- 破壊的な変更を行う前には必ず `implementation_plan.md` を作成し、ユーザーの承認を得る。
