# Cloud Run へのバックエンドデプロイ手順

Railway から Google Cloud Run へバックエンド API を移行するための手順です。

## 前提

- Google Cloud プロジェクトが作成済みであること
- 課金（Billing）が有効であること
- フロントエンド（例: Vercel）側で `NEXT_PUBLIC_API_URL` を Cloud Run の URL に更新できること

## 1. GCP の初期設定

### API の有効化

```bash
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  cloudbuild.googleapis.com
```

### Artifact Registry リポジトリの作成

```bash
export PROJECT_ID="your-gcp-project-id"
export REGION="asia-northeast1"

gcloud artifacts repositories create othello \
  --repository-format=docker \
  --location="${REGION}" \
  --description="Othello backend images"
```

### RAILS_MASTER_KEY を Secret Manager に登録

```bash
# backend/config/master.key の内容を Secret に保存
gcloud secrets create RAILS_MASTER_KEY \
  --replication-policy="automatic"

gcloud secrets versions add RAILS_MASTER_KEY \
  --data-file=backend/config/master.key
```

## 2. 手動デプロイ（初回確認用）

```bash
export PROJECT_ID="your-gcp-project-id"
export REGION="asia-northeast1"
export SERVICE="othello-backend"
export IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/othello/${SERVICE}:latest"

# ビルド & プッシュ
gcloud auth configure-docker ${REGION}-docker.pkg.dev
docker build -t "${IMAGE}" ./backend
docker push "${IMAGE}"

# Cloud Run にデプロイ
gcloud run deploy "${SERVICE}" \
  --image="${IMAGE}" \
  --region="${REGION}" \
  --platform=managed \
  --allow-unauthenticated \
  --port=8080 \
  --memory=512Mi \
  --set-env-vars="RAILS_ENV=production,RAILS_LOG_LEVEL=info" \
  --set-secrets="RAILS_MASTER_KEY=RAILS_MASTER_KEY:latest"
```

デプロイ後、表示される URL（例: `https://othello-backend-xxxxx-an.a.run.app`）を控えてください。

### 動作確認

```bash
export BACKEND_URL="https://othello-backend-xxxxx-an.a.run.app"

# ヘルスチェック
curl "${BACKEND_URL}/up"

# AI API の確認
curl -X POST "${BACKEND_URL}/api/v1/games/next_move" \
  -H "Content-Type: application/json" \
  -d '{"board":"0000000000000000000000000001200000021000000000000000000000000000","turn":0,"aiLevel":"v1"}'
```

## 3. GitHub Actions による自動デプロイ

`.github/workflows/deploy-backend-cloudrun.yml` が `main` ブランチへの `backend/**` 変更時にデプロイします。

### 必要な GitHub Secrets

| Secret | 説明 |
|--------|------|
| `GCP_PROJECT_ID` | GCP プロジェクト ID |
| `GCP_SA_KEY` | デプロイ用サービスアカウントの JSON キー |

### サービスアカウントの作成例

```bash
export PROJECT_ID="your-gcp-project-id"
export SA_NAME="github-cloudrun-deploy"

gcloud iam service-accounts create "${SA_NAME}" \
  --display-name="GitHub Actions Cloud Run Deploy"

export SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

for ROLE in \
  roles/run.admin \
  roles/artifactregistry.writer \
  roles/iam.serviceAccountUser \
  roles/secretmanager.secretAccessor; do
  gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="${ROLE}"
done

gcloud iam service-accounts keys create sa-key.json \
  --iam-account="${SA_EMAIL}"
```

`sa-key.json` の内容を GitHub Secret `GCP_SA_KEY` に登録してください。

## 4. フロントエンドの更新

Cloud Run の URL が確定したら、フロントエンドの環境変数を更新します。

```
NEXT_PUBLIC_API_URL=https://othello-backend-xxxxx-an.a.run.app/api/v1
```

Vercel などホスティング側で設定後、フロントエンドを再デプロイしてください。

## 補足

- Cloud Run は `PORT` 環境変数（デフォルト 8080）で待ち受けます。Puma は `config/puma.rb` でこれを参照します。
- C++ AI バイナリは Docker ビルド時にコンパイル済みです。本番起動時の再コンパイルは行いません。
- SQLite はコンテナ内の ephemeral storage に保存されます。本 API は DB を使わないため、再起動後も API 自体は動作します。
- `/up` エンドポイントが Cloud Run のヘルスチェックに使われます。
